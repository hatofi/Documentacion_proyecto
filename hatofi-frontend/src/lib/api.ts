const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function authHeaders(): HeadersInit {
  const accessToken = sessionStorage.getItem("hatofi_access_token");
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function registerInvestment(input: {
  batchId: number;
  amount: string;
  walletAddress: string;
  transactionHash: string;
}): Promise<void> {
  const response = await fetch(`${apiUrl}/investments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify({
      batch_id: input.batchId,
      amount: input.amount,
      wallet_address: input.walletAddress,
      transaction_hash: input.transactionHash,
    }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      detail?: string;
    } | null;
    throw new Error(body?.detail ?? "No se pudo registrar la inversión en Hatofi.");
  }
}
