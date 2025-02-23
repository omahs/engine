import { AsyncStorage } from "@thirdweb-dev/wallets";
import fs from "fs";
import { prisma } from "../../../src/db/client";
import { WalletType } from "../../../src/schema/wallet";
import { logger } from "../../../src/utils/logger";

export class LocalFileStorage implements AsyncStorage {
  constructor(private readonly walletAddress: string) {
    this.walletAddress = walletAddress.toLowerCase();
  }

  async getItem(_: string): Promise<string | null> {
    const walletDetails = await prisma.walletDetails.findUnique({
      where: {
        address: this.walletAddress,
      },
    });

    if (walletDetails?.encryptedJson) {
      return walletDetails.encryptedJson;
    }

    // For backwards compatibility, support old local file storage format
    const dir = `${process.env.HOME}/.thirdweb`;
    const path = `${dir}/localWallet-${this.walletAddress}`;
    if (!fs.existsSync(dir) || !fs.existsSync(path)) {
      logger.worker.error(`No local wallet found!`);
      return null;
    }

    // Save the encrypted json in the database for future access
    const encryptedJson = fs.readFileSync(path, "utf8");
    await this.setItem("", encryptedJson);

    return encryptedJson;
  }

  async setItem(_: string, value: string): Promise<void> {
    await prisma.walletDetails.upsert({
      where: {
        address: this.walletAddress,
        type: WalletType.local,
      },
      create: {
        address: this.walletAddress,
        type: WalletType.local,
        encryptedJson: value,
      },
      update: {
        encryptedJson: value,
      },
    });
  }

  async removeItem(_: string): Promise<void> {
    await prisma.walletDetails.delete({
      where: {
        address: this.walletAddress,
        type: WalletType.local,
      },
    });
  }
}
