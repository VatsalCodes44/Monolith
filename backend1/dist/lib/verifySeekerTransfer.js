import { clusterApiUrl, Connection, Keypair, PublicKey, } from "@solana/web3.js";
import bs58 from "bs58";
/**
 * CONFIG
 */
const SEEKER_MINT = new PublicKey("SKRbvo6Gf7GondiT3BbTfuRDPqLWei4j2Qy2NPGZhW3");
const BACKEND_WALLET = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY)).publicKey.toBase58();
export async function verifySeekerTransfer(signature, from) {
    const connection = new Connection(process.env.MAINNET_RPC_URL || clusterApiUrl("mainnet-beta"), "finalized");
    let tx = await connection.getParsedTransaction(signature, {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
    });
    if (!tx) {
        await new Promise(r => setTimeout(r, 2000));
        tx = await connection.getParsedTransaction(signature, {
            commitment: "finalized",
            maxSupportedTransactionVersion: 0,
        });
    }
    if (!tx)
        throw new Error("Transaction not found");
    if (!tx.meta)
        throw new Error("Transaction metadata missing");
    if (tx.meta.err)
        throw new Error("Transaction failed");
    let receivedAmount = 0n;
    let foundTransfer = false;
    for (const instruction of tx.transaction.message.instructions) {
        if (!("parsed" in instruction))
            continue;
        const parsed = instruction;
        if (parsed.program !== "spl-token")
            continue;
        if (parsed.parsed.type !== "transfer" &&
            parsed.parsed.type !== "transferChecked") {
            continue;
        }
        const info = parsed.parsed.info;
        const sourceTokenAccount = new PublicKey(info.source);
        const destinationTokenAccount = new PublicKey(info.destination);
        // FIX: Handle both transfer types safely
        let amount;
        if (parsed.parsed.type === "transfer") {
            if (!info.amount)
                throw new Error("Transfer amount missing");
            amount = BigInt(info.amount);
        }
        else {
            if (!info.tokenAmount?.amount)
                throw new Error("TransferChecked amount missing");
            amount = BigInt(info.tokenAmount.amount);
        }
        // Validate destination account
        const destinationInfo = await connection.getParsedAccountInfo(destinationTokenAccount);
        if (!destinationInfo.value)
            throw new Error("Destination account not found");
        if (!("parsed" in destinationInfo.value.data))
            throw new Error("Invalid destination account data");
        const destinationData = destinationInfo.value.data.parsed.info;
        if (destinationData.mint !== SEEKER_MINT.toBase58())
            continue;
        if (destinationData.owner !== BACKEND_WALLET)
            continue;
        // Validate source owner
        const sourceInfo = await connection.getParsedAccountInfo(sourceTokenAccount);
        if (!sourceInfo.value)
            throw new Error("Source account not found");
        if (!("parsed" in sourceInfo.value.data))
            throw new Error("Invalid source account data");
        const sourceOwner = sourceInfo.value.data.parsed.info.owner;
        if (sourceOwner !== from)
            throw new Error("Sender mismatch");
        receivedAmount += amount;
        foundTransfer = true;
    }
    if (!foundTransfer)
        throw new Error("No valid token transfer found");
    if (receivedAmount <= 0n)
        throw new Error("Invalid transfer amount");
    return {
        success: true,
        amount: receivedAmount,
        to: BACKEND_WALLET,
        from: from,
    };
}
