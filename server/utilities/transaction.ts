import { TransactionResponse } from "@ethersproject/abstract-provider";
import { getDefaultGasOverrides } from "@thirdweb-dev/sdk";
import { BigNumber } from "ethers";
import { StatusCodes } from "http-status-codes";
import { createCancelledTxData } from "../../src/db/cancelledTransactions/createCancelledTxData";
import { getTxById } from "../../src/db/transactions/getTxById";
import { updateTx } from "../../src/db/transactions/updateTx";
import { createCustomError } from "../middleware/error";
import { TransactionStatusEnum } from "../schemas/transaction";
import { getSdk } from "../utils/cache/getSdk";

interface CancelTransactionAndUpdateParams {
  queueId: string;
  walletAddress: string;
  accountAddress: string;
}

export const cancelTransactionAndUpdate = async ({
  queueId,
  walletAddress,
  accountAddress,
}: CancelTransactionAndUpdateParams) => {
  const txData = await getTxById({ queueId });

  let error = null;
  let transferTransactionResult: TransactionResponse | null = null;

  let message = "";

  switch (txData.status) {
    case TransactionStatusEnum.Errored:
      error = createCustomError(
        `Cannot cancel errored transaction with queueId ${queueId}. Error: ${txData.errorMessage}`,
        StatusCodes.BAD_REQUEST,
        "TransactionErrored",
      );
      break;
    case TransactionStatusEnum.Cancelled:
      error = createCustomError(
        `Transaction already cancelled with queueId ${queueId}`,
        StatusCodes.BAD_REQUEST,
        "TransactionAlreadyCancelled",
      );
      break;
    case TransactionStatusEnum.Queued:
    case TransactionStatusEnum.Processed:
      await createCancelledTxData({
        queueId,
      });

      await updateTx({
        queueId,
        status: TransactionStatusEnum.Cancelled,
        txData: {
          cancelledAt: new Date(),
        },
      });
      message = "Transaction cancelled on-database successfully.";
      break;
    case TransactionStatusEnum.Mined:
      error = createCustomError(
        `Transaction already mined with queueId ${queueId}`,
        StatusCodes.BAD_REQUEST,
        "TransactionAlreadyMined",
      );
      break;
    case TransactionStatusEnum.Submitted: {
      const sdk = await getSdk({
        chainId: txData.chainId!,
        walletAddress: txData.fromAddress!,
        accountAddress,
      });

      const txReceipt = await sdk
        .getProvider()
        .getTransactionReceipt(txData.transactionHash!);

      if (txReceipt) {
        message =
          "Transaction already mined. Cannot cancel transaction on-chain.";
        break;
      }
      const gasOverrides = await getDefaultGasOverrides(sdk.getProvider());
      transferTransactionResult = await sdk.wallet.sendRawTransaction({
        to: txData.fromAddress!,
        from: txData.fromAddress!,
        data: "0x",
        value: "0x00",
        nonce: txData.nonce!,
        maxFeePerGas: BigNumber.from(gasOverrides.maxFeePerGas).mul(2),
        maxPriorityFeePerGas: BigNumber.from(
          gasOverrides.maxPriorityFeePerGas,
        ).mul(2),
      });

      const cancelledAt = new Date();
      message = "Cancellation Transaction sent on chain successfully.";

      await updateTx({
        queueId,
        status: TransactionStatusEnum.Cancelled,
        res: transferTransactionResult,
        txData: {
          cancelledAt,
          toAddress: walletAddress,
          functionName: null,
          functionArgs: null,
          data: "0x",
          value: "0x00",
        },
      });
      break;
    }

    default:
      break;
  }

  if (error) {
    throw error;
  }

  return {
    message,
    transactionHash: transferTransactionResult?.hash,
  };
};
