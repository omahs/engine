import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";

import { getSDK } from '../../../../../helpers/index';
import { partialRouteSchema } from '../../../../../helpers/sharedApiSchemas';
import { transferRequestBodySchema, transferRouteSchema } from '../../../../../schemas/erc20/standard/transfer';

export async function erc20Transfer(fastify: FastifyInstance) {
  fastify.route<transferRouteSchema>({
    method: "POST",
    url: "/contract/:chain_name_or_id/:contract_address/erc20/transfer",
    schema: {
      description:
        "Transfer tokens from the connected (Admin) wallet to another wallet.",
      tags: ["ERC20"],
      operationId: "transfer",
      ...partialRouteSchema,
      body: transferRequestBodySchema,
    },
    handler: async (request, reply) => {
      const { chain_name_or_id, contract_address } = request.params;
      const { to_address, amount } = request.body;
      request.log.info("Inside ERC20 - Transfer Function");
      request.log.debug(`Chain : ${chain_name_or_id}`);
      request.log.debug(`Contract Address : ${contract_address}`);

      request.log.debug(`To Address : ${to_address}`);
      request.log.debug(`Amount : ${amount}`);

      const sdk = await getSDK(chain_name_or_id);
      const contract = await sdk.getContract(contract_address);

      const returnData: any = await contract.erc20.transfer(to_address, amount);

      reply.status(StatusCodes.OK).send({
        result: {
          transaction: returnData?.receipt,
        },
      });
    },
  });
}