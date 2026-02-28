import axios from "axios";
import { GET_BALANCE_TYPE_TS } from "../config/serverInputs";
import { REST_URL } from "../config/config";
import { gameBalance } from "@/src/stores/gameBalance";
import { useCallback } from "react";

export function useFetchBalance(
    publicKey: string | null,
    jwt: string | null,
    isDevnet: boolean
) {
    const setLamports = gameBalance(s => s.setLamports)
    const setSkr = gameBalance(s => s.setSkr)
    return useCallback(async () => {
        console.log("🔥 fetchBalance called");
        console.log(publicKey, "2222222222222222", jwt)
        if (!publicKey || !jwt) return;
        try {
            const payload: GET_BALANCE_TYPE_TS = {
                network: isDevnet ? "DEVNET" : "MAINNET",
            };
            const res = await axios.post(`${REST_URL}/getBalance`, payload, {
                headers: { Authorization: `Bearer ${jwt}` },
            });
            const data = res.data;
            console.log("RAW DATA:", data.lamports, "-----------", data.skr);
            setLamports(Number(data.lamports));
            setSkr(Number(data.skr));
            console.log("STORE STATE:", gameBalance.getState().lamports);
        } catch (e) {
            console.log(e);
        }
    }, [publicKey, jwt, isDevnet, setLamports, setSkr])
}