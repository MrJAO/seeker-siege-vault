const anchor = require("@coral-xyz/anchor");
const { Connection, Keypair, PublicKey, SystemProgram } = require("@solana/web3.js");
const { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const fs = require("fs");
const os = require("os");

const IDL = JSON.parse(fs.readFileSync("./target/idl/seeker_siege_vault.json", "utf8"));
const PROGRAM_ID = new PublicKey("FYxctvnr7DJP6qWynyatkacRTyZFeqSf8F9a5qfocHoK");
const MINT = new PublicKey("H1VEUXRXfTki1EU8ZVDgmHVS9WKj6nMbBPJVcSrzU9bU");

const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(os.homedir() + "/.config/solana/treasury-devnet.json", "utf8")));
const treasuryKeypair = Keypair.fromSecretKey(secretKey);

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const wallet = new anchor.Wallet(treasuryKeypair);
const provider = new anchor.AnchorProvider(connection, wallet, { commitment: "confirmed" });
anchor.setProvider(provider);

const program = new anchor.Program(IDL, provider);

async function main() {
  const [vaultConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_config"), MINT.toBuffer()],
    PROGRAM_ID
  );
  const [vaultAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), MINT.toBuffer()],
    PROGRAM_ID
  );
  const vaultTokenAccount = getAssociatedTokenAddressSync(MINT, vaultAuthority, true);

  console.log("vaultConfig:", vaultConfig.toBase58());
  console.log("vaultAuthority:", vaultAuthority.toBase58());
  console.log("vaultTokenAccount:", vaultTokenAccount.toBase58());

  const tx = await program.methods
    .initialize()
    .accounts({
      payer: treasuryKeypair.publicKey,
      backendAuthority: treasuryKeypair.publicKey,
      mint: MINT,
      vaultConfig,
      vaultAuthority,
      vaultTokenAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  console.log("Initialize tx:", tx);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
