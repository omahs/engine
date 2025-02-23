import { Static, Type } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import { StatusCodes } from "http-status-codes";
import {
  contractParamSchema,
  standardResponseSchema,
} from "../../../../../helpers";
import { getChainIdFromChain } from "../../../../../utilities/chain";
import { getContract } from "../../../../../utils/cache/getContract";

const ReplySchema = Type.Object({
  result: Type.Array(Type.String(), {
    description: "The account addresses of all the accounts in this factory",
  }),
});

export const getAllAccounts = async (fastify: FastifyInstance) => {
  fastify.route<{
    Params: Static<typeof contractParamSchema>;
    Reply: Static<typeof ReplySchema>;
  }>({
    method: "GET",
    url: "/contract/:chain/:contract_address/account-factory/get-all-accounts",
    schema: {
      summary: "Get all smart accounts",
      description: "Get all the smart accounts for this account factory.",
      tags: ["Account Factory"],
      operationId: "account-factory:get-all-accounts",
      params: contractParamSchema,
      response: {
        ...standardResponseSchema,
        [StatusCodes.OK]: ReplySchema,
      },
    },
    handler: async (req, rep) => {
      const { chain, contract_address } = req.params;
      const chainId = getChainIdFromChain(chain);

      const contract = await getContract({
        chainId,
        contractAddress: contract_address,
      });
      const accountAddresses = await contract.accountFactory.getAllAccounts();

      rep.status(StatusCodes.OK).send({
        result: accountAddresses,
      });
    },
  });
};
