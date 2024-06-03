import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

type ResponseData =
  | {
      message: string;
    }
  | {
      txResponse: ethers.providers.TransactionResponse;
      txReceipt: ethers.providers.TransactionReceipt;
    };

type BodyData = {
  rpcURL: string;
  transactionData: string;
  to: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
  }

  const { rpcURL, transactionData, to } = req.body as BodyData;
  const provider = new ethers.providers.JsonRpcProvider(rpcURL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY as string, provider);
  const tx = await wallet.sendTransaction({
    to,
    data: transactionData,
  });
  const txReceipt = await tx.wait();
  res.status(200).json({ txResponse: tx, txReceipt });
}
