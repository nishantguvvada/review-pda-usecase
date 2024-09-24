import { AnchorProvider, Program, setProvider } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import IDL from "./review";

export const getProgram = (connection, wallet) => {

    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    setProvider(provider);

    const programId = new PublicKey("BgRCJ981aP54TCLu7TgZzZN2y6yAH3wrUvXwezMLNVEC");

    const program = new Program(IDL, programId, provider);
    
    return program;
}