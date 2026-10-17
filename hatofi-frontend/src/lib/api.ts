const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

function authHeaders(): HeadersInit {
  const rawSession = sessionStorage.getItem("hatofi_session");
  if (!rawSession) return {};
  const session = JSON.parse(rawSession) as { access_token?: string };
  return session.access_token
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
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
