import { FastifyInstance } from "fastify";
import { getContractExtensions } from "./contract/metadata/extensions";
import { readContract } from "./contract/read/read";
import { writeToContract } from "./contract/write/write";

// Transactions
import { getAllTx } from "./transaction/getAll";
import { getAllDeployedContracts } from "./transaction/getAllDeployedContracts";
import { retryTransaction } from "./transaction/retry";
import { checkTxStatus } from "./transaction/status";

// Extensions
import { erc1155Routes } from "./contract/extensions/erc1155";
import { erc20Routes } from "./contract/extensions/erc20/index";
import { erc721Routes } from "./contract/extensions/erc721";
import { marketplaceV3Routes } from "./contract/extensions/marketplaceV3/index";
import { prebuiltsRoutes } from "./deployer";

// Chain
import { getChainData } from "./network/get";
import { getAllChainData } from "./network/getAll";

// Contract Events
import { getAllEvents } from "./contract/events/getAllEvents";
import { getEvents } from "./contract/events/getEvents";

// Contract Roles
import { getRoles } from "./contract/roles/read/get";
import { getAllRoles } from "./contract/roles/read/getAll";
import { grantRole } from "./contract/roles/write/grant";
import { revokeRole } from "./contract/roles/write/revoke";

// Contract Metadata
import { getABI } from "./contract/metadata/abi";
import { extractEvents } from "./contract/metadata/events";
import { extractFunctions } from "./contract/metadata/functions";

// Wallet
import { createWallet } from "./wallet/create";
import { getAll } from "./wallet/getAll";
import { getBalance } from "./wallet/getBalance";
import { importWallet } from "./wallet/import";

// Config
import { createConfig } from "./config/create";
import { deleteConfig } from "./config/delete";
import { getAllConfig } from "./config/getAll";
import { updateConfig } from "./config/update";

export const apiRoutes = async (fastify: FastifyInstance) => {
  await fastify.register(createConfig);
  await fastify.register(deleteConfig);
  await fastify.register(updateConfig);
  await fastify.register(getAllConfig);

  // Wallet
  await fastify.register(createWallet);
  await fastify.register(importWallet);
  await fastify.register(getBalance);
  await fastify.register(getAll);

  // Chains
  await fastify.register(getChainData);
  await fastify.register(getAllChainData);

  // generic
  await fastify.register(readContract);
  await fastify.register(writeToContract);

  // Contract Events
  await fastify.register(getAllEvents);
  await fastify.register(getEvents);

  // Contract Metadata
  await fastify.register(getABI);
  await fastify.register(extractEvents);
  await fastify.register(getContractExtensions);
  await fastify.register(extractFunctions);

  // Contract Roles
  await fastify.register(getRoles);
  await fastify.register(getAllRoles);
  await fastify.register(grantRole);
  await fastify.register(revokeRole);

  // deployer
  await fastify.register(prebuiltsRoutes);

  // transaction status
  await fastify.register(checkTxStatus);
  await fastify.register(getAllTx);
  await fastify.register(getAllDeployedContracts);
  await fastify.register(retryTransaction);

  // Extensions
  await fastify.register(erc20Routes);
  await fastify.register(erc721Routes);
  await fastify.register(erc1155Routes);
  await fastify.register(marketplaceV3Routes);
};
