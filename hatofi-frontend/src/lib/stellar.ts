import * as StellarSdk from "@stellar/stellar-sdk";
import {
  getAddress,
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction,
} from "@stellar/freighter-api";

const networkName = process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "TESTNET";
const expectedNetwork = networkName.trim().toUpperCase();
const rpcUrl =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
  "https://soroban-testnet.stellar.org";
const contractId = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID;
const decimals = Number(process.env.NEXT_PUBLIC_STELLAR_TOKEN_DECIMALS ?? "7");

if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
  throw new Error("NEXT_PUBLIC_STELLAR_TOKEN_DECIMALS debe ser un entero entre 0 y 18.");
}

export const stellarConfig = {
  networkPassphrase:
    networkName === "mainnet"
      ? StellarSdk.Networks.PUBLIC
      : StellarSdk.Networks.TESTNET,
  rpcUrl,
  contractId,
  decimals,
};

function toAtomicAmount(amount: string): bigint {
  const normalized = amount.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error("El monto debe ser un número decimal válido.");
  }
  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > stellarConfig.decimals) {
    throw new Error("El monto supera la precisión del token.");
  }
  const scale = BigInt(10) ** BigInt(stellarConfig.decimals);
  const fractionValue = fraction.padEnd(stellarConfig.decimals, "0") || "0";
  return BigInt(whole) * scale + BigInt(fractionValue);
}

export async function connectFreighter(): Promise<string> {
  const connection = await isConnected();
  if (connection.error || !connection.isConnected) {
    throw new Error("Instala y habilita la extensión Freighter.");
  }
  const access = await requestAccess();
  if (access.error || !access.address) {
    throw new Error(access.error?.message ?? "Freighter no autorizó la wallet.");
  }
  const network = await getNetwork();
  console.log("Freighter network:", network);
  if (
    network.error ||
    network.network.trim().toUpperCase() !== expectedNetwork ||
    network.networkPassphrase !== stellarConfig.networkPassphrase
  ) {
    throw new Error(`Freighter debe estar conectada a ${networkName}.`);
  }
  return access.address;
}

export async function currentFreighterAddress(): Promise<string | null> {
  const connection = await isConnected();
  if (connection.error || !connection.isConnected) return null;
  const address = await getAddress();
  return address.error || !address.address ? null : address.address;
}

export async function investOnChain(
  investor: string,
  batchCode: string,
  amount: string,
): Promise<string> {
  if (!stellarConfig.contractId) {
    throw new Error("Falta NEXT_PUBLIC_STELLAR_CONTRACT_ID.");
  }
  if (!batchCode) {
    throw new Error("Falta el código del lote para invertir en Stellar.");
  }
  const atomicAmount = toAtomicAmount(amount);
  if (atomicAmount <= BigInt(0)) {
    throw new Error("El monto debe ser mayor que cero.");
  }
  const rpc = new StellarSdk.rpc.Server(stellarConfig.rpcUrl);
  const account = await rpc.getAccount(investor);
  const operation = new StellarSdk.Contract(stellarConfig.contractId).call(
    "invest",
    StellarSdk.Address.fromString(investor).toScVal(),
    // El lote se identifica en la blockchain por su código (uuid4), no por el id
    // de la base de datos, para que siga siendo localizable tras un reinicio.
    StellarSdk.nativeToScVal(batchCode, { type: "string" }),
    StellarSdk.nativeToScVal(atomicAmount, { type: "i128" }),
  );
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(180)
    .build();
  const prepared = await rpc.prepareTransaction(transaction);
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: stellarConfig.networkPassphrase,
  });
  if (signed.error || !signed.signedTxXdr) {
    throw new Error(signed.error?.message ?? "La wallet rechazó la firma.");
  }
  const signedTransaction = StellarSdk.TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    stellarConfig.networkPassphrase,
  ) as StellarSdk.Transaction;
  const submitted = await rpc.sendTransaction(signedTransaction);
  if (submitted.status === "ERROR") {
    throw new Error(`Stellar rechazó la transacción: ${submitted.errorResult}`);
  }
  const confirmed = await rpc.pollTransaction(submitted.hash);
  if (confirmed.status !== "SUCCESS") {
    throw new Error(`La inversión no fue confirmada: ${confirmed.status}`);
  }
  return submitted.hash;
}
