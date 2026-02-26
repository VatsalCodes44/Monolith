import {
    Connection,
    SystemProgram,
    Keypair,
    clusterApiUrl,
} from "@solana/web3.js";
import bs58 from "bs58";

const BACKEND_WALLET = Keypair.fromSecretKey(bs58.decode(process.env.PRIVATE_KEY!)).publicKey.toBase58();

export async function verifySolTransfer(network: "MAINNET" | "DEVNET", signature: string, from: string) {
    const connection = new Connection(
        network === "MAINNET" ? (process.env.MAINNET_RPC_URL || clusterApiUrl("mainnet-beta")) : (process.env.DEVNET_RPC_URL || clusterApiUrl("devnet")),
        "confirmed"
    );

    let tx = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
        await new Promise(r => setTimeout(r, 2000))
        tx = await connection.getTransaction(signature, {
            commitment: "confirmed",
            maxSupportedTransactionVersion: 0,
        })
    }

    if (!tx) {
        throw new Error("Transaction not found");
    }

    if (!tx.meta || tx.meta.err !== null) {
        throw new Error("Transaction failed");
    }

    // Get account keys safely (works for versioned tx)
    const accountKeys = tx.transaction.message.getAccountKeys();
    const staticKeys = accountKeys.staticAccountKeys;

    const accounts = staticKeys.map((key) => key.toBase58());

    const programId = SystemProgram.programId.toBase58();

    const programIdIdx = accounts.indexOf(programId);
    const fromIdx = accounts.indexOf(from);
    const toIdx = accounts.indexOf(BACKEND_WALLET);

    if (
        programIdIdx === -1 ||
        fromIdx === -1 ||
        toIdx === -1
    ) {
        throw new Error("Required account not found in transaction");
    }

    const instructions = tx.transaction.message.compiledInstructions;

    // ExpectedSender actually signed
    const signerCount = tx.transaction.message.header.numRequiredSignatures;
    const signers = staticKeys
        .slice(0, signerCount)
        .map((k) => k.toBase58());

    if (!signers.includes(from)) {
        throw new Error("Sender did not sign transaction");
    }

    let verified = false;

    for (const instruction of instructions) {
        if (instruction.programIdIndex !== programIdIdx) continue;

        // Ensure correct account order (sender → receiver)
        if (
            instruction.accountKeyIndexes[0] === fromIdx &&
            instruction.accountKeyIndexes[1] === toIdx
        ) {
            const data = instruction.data;

            const view = new DataView(
                data.buffer,
                data.byteOffset,
                data.byteLength
            );

            const instructionType = view.getUint32(0, true);
            const lamports = view.getBigUint64(4, true);

            // Balance delta check (source of truth)
            if (tx.meta.preBalances[toIdx] == undefined || tx.meta.postBalances[toIdx] == undefined) throw new Error("error in parsing transaction");
            const receiverPre = BigInt(tx.meta.preBalances[toIdx]);
            const receiverPost = BigInt(tx.meta.postBalances[toIdx]);

            const delta = receiverPost - receiverPre;

            if (instructionType === 2 && delta === lamports) {
                return {
                    lamports,
                    success: true,
                    to: BACKEND_WALLET,
                    from: from,
                }
            }
        }
    }
    throw "error"
}

