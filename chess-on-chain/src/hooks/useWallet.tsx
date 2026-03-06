import { useState, useCallback, useMemo } from "react";
import {
  transact,
  Web3MobileWallet,
} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { useWalletStore } from "@/src/stores/wallet-store";
import { Account } from "@solana-mobile/mobile-wallet-adapter-protocol";
import { PUBLIC_KEY, SEEKER_MINT } from "@/src/config/config";

const APP_IDENTITY = {
  name: "Chess On Chain",
  uri: "https://api.playchessonchain.fun",
  icon: "favicon.ico",
};

export interface Wallet {
  isDevnet: boolean;
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  sending: boolean;
  connect: () => Promise<string>;
  disconnect: () => void;
  getBalance: () => Promise<number>;
  sendSOL: (amountSOL: number) => Promise<string>;
  sendSKR: (amountSKR: number) => Promise<string>;
  connection: Connection;
  signMessage: (message: string, pubKey: string) => Promise<string>;
}

const reciever = PUBLIC_KEY;
const seekerMint = SEEKER_MINT;

export function useWallet(): Wallet {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const isDevnet = useWalletStore(s => s.isDevnet);
  const publicKey = useWalletStore(s => s.publicKey);
  const setPublicKey = useWalletStore(s => s.setPublicKey)
  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const connection = useMemo(() => {
    return new Connection(clusterApiUrl(cluster), "confirmed");
  }, [cluster]);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const authResult = await transact(
        async (wallet: Web3MobileWallet) => {
          // This opens Phantom, shows an "Authorize" dialog
          // User taps "Approve" → we get their public key
          const result = await wallet.authorize({
            chain: `solana:${cluster}`,
            identity: APP_IDENTITY,
          });
          return result;
        }
      );

      // authResult.accounts[0].address is a base64 public key
      const pubkey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, "base64")
      );
      setPublicKey(pubkey.toBase58());
      setAccounts(authResult.accounts);
      return pubkey.toBase58();
    } catch (error: any) {
      console.error("Connect failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);


  const disconnect = useCallback(() => {
    setPublicKey(null);
    setAccounts([]);
  }, []);


  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;
    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);


  const sendSOL = useCallback(
    async (amountSOL: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      setSending(true);
      try {
        // Step 1: Build the transaction
        const toPublicKey = new PublicKey(reciever);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(publicKey),
            toPubkey: toPublicKey,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
          })
        );

        // Step 2: Get recent blockhash (needed for transaction)
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(publicKey);

        // Step 3: Send to Phantom for signing + submission
        const txSignature = await transact(
          async (wallet: Web3MobileWallet) => {
            // Re-authorize (Phantom needs this each session)
            await wallet.authorize({
              chain: `solana:${cluster}`,
              identity: APP_IDENTITY,
            });

            // Sign and send — Phantom shows the transaction details
            // User approves → Phantom signs → sends to network
            const signatures = await wallet.signAndSendTransactions({
              transactions: [transaction],
            });

            return signatures[0];
          }
        );

        return txSignature;
      } finally {
        setSending(false);
      }
    },
    [publicKey, connection, cluster]
  );


  const sendSKR = useCallback(
    async (amountSKR: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      setSending(true);
      try {
        // Step 1: Build the transaction
        const toPublicKey = new PublicKey(reciever);
        const feePayer = new PublicKey(publicKey);

        const feePayerATA = getAssociatedTokenAddressSync(
          new PublicKey(seekerMint),
          feePayer,
          false, // allowOwnerOffCurve
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const recipientATA = getAssociatedTokenAddressSync(
          new PublicKey(seekerMint),
          toPublicKey,
          false, // allowOwnerOffCurve
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const recipientAccount = await connection.getAccountInfo(recipientATA);

        const instructions = [];

        if (!recipientAccount) {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              feePayer,
              recipientATA,
              toPublicKey,
              new PublicKey(seekerMint),
              TOKEN_PROGRAM_ID,
              ASSOCIATED_TOKEN_PROGRAM_ID
            )
          );
        }

        instructions.push(
          createTransferInstruction(
            feePayerATA,
            recipientATA,
            new PublicKey(publicKey),
            BigInt(Math.round(amountSKR * 1_000_000)),
            [],
            TOKEN_PROGRAM_ID
          )
        );

        const transferBlockhash = await connection.getLatestBlockhash();

        let transferTransaction = new Transaction({
          feePayer: feePayer,
          blockhash: transferBlockhash.blockhash,
          lastValidBlockHeight: transferBlockhash.lastValidBlockHeight
        }).add(...instructions);

        // Step 3: Send to Phantom for signing + submission
        const txSignature = await transact(
          async (wallet: Web3MobileWallet) => {
            // Re-authorize (Phantom needs this each session)
            await wallet.authorize({
              chain: `solana:${cluster}`,
              identity: APP_IDENTITY,
            });

            // Sign and send — Phantom shows the transaction details
            // User approves → Phantom signs → sends to network
            const signatures = await wallet.signAndSendTransactions({
              transactions: [transferTransaction],
            });

            return signatures[0];
          }
        );

        return txSignature;
      } finally {
        setSending(false);
      }
    },
    [publicKey, connection, cluster]
  );


  const signMessage = useCallback(
    async (message: string, pubKey: string) => {
      try {
        const signature = await transact(
          async (wallet: Web3MobileWallet) => {
            await wallet.authorize({
              chain: `solana:${cluster}`,
              identity: APP_IDENTITY,
            });

            const signatures = await wallet.signMessages({
              addresses: [pubKey],
              payloads: [new TextEncoder().encode(message)]
            });

            return Buffer.from(signatures[0]).toString("base64");
          }
        );

        return signature;
      } finally {
      }
    },
    [publicKey, cluster]
  );

  return {
    isDevnet,
    publicKey,
    connected: !!publicKey,
    connecting,
    sending,
    connect,
    disconnect,
    getBalance,
    sendSOL,
    connection,
    signMessage,
    sendSKR
  };
}