import { useState, useCallback } from "react";
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
import { publicKeyStore, useRpc } from "../stores/wallet-store";
import { Account } from "@solana-mobile/mobile-wallet-adapter-protocol";

const APP_IDENTITY = {
  name: "chess-native",
  uri: "https://solscan.io",
  icon: "favicon.ico",
};

export function useWallet() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [connecting, setConnecting] = useState(false);
  const [sending, setSending] = useState(false);
  const [signing, setSigning] = useState(false);
  const isDevnet = useRpc((s) => s.isDevnet);
  const {publicKey, setPublicKey} = publicKeyStore(s=>s);

  const cluster = isDevnet ? "devnet" : "mainnet-beta";
  const connection = new Connection(clusterApiUrl(cluster), "confirmed");

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
      setPublicKey(pubkey);
      setAccounts(authResult.accounts);
      return pubkey;
    } catch (error: any) {
      console.error("Connect failed:", error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [cluster]);

  // ============================================
  // DISCONNECT
  // ============================================
  const disconnect = useCallback(() => {
    setPublicKey(null);
    setAccounts([]);
  }, []);

  // ============================================
  // GET BALANCE
  // ============================================
  const getBalance = useCallback(async () => {
    if (!publicKey) return 0;
    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, [publicKey, connection]);

  // ============================================
  // SEND SOL — Build, sign, and send a transaction
  // ============================================
  const sendSOL = useCallback(
    async (toAddress: string, amountSOL: number) => {
      if (!publicKey) throw new Error("Wallet not connected");

      setSending(true);
      try {
        // Step 1: Build the transaction
        const toPublicKey = new PublicKey(toAddress);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPublicKey,
            lamports: Math.round(amountSOL * LAMPORTS_PER_SOL),
          })
        );

        // Step 2: Get recent blockhash (needed for transaction)
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

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
  const signMessage = useCallback(
    async (message: string) => {
      if (!publicKey) throw new Error("Wallet not connected");

      setSigning(true);
      try {

        const signature = await transact(
          async (wallet: Web3MobileWallet) => {
            await wallet.authorize({
              chain: `solana:${cluster}`,
              identity: APP_IDENTITY,
            });

            const signatures = await wallet.signMessages({
              addresses: [publicKey.toString()],
              payloads: [new TextEncoder().encode(message)]
            });

            return signatures[0];
          }
        );

        return signature;
      } finally {
        setSigning(false);
      }
    },
    [publicKey]
  );

  return {
    publicKey,
    connected: !!publicKey,
    connecting,
    sending,
    connect,
    disconnect,
    getBalance,
    sendSOL,
    connection,
    signMessage
  };
}