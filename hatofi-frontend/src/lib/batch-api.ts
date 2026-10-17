const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export type BatchStatus =
  | "DRAFT" | "FUNDING" | "FUNDED" | "BUYING_PROCESS"
  | "IN_PROGRESS" | "READY_FOR_SALE" | "CLOSED" | "CANCELLED";

export type BatchCategory = "CEBA_INTENSIVA" | "CRIA_LEVANTE";

export type Batch = {
  id: number;
  title: string;
  code: string;
  description: string | null;
  category: BatchCategory;
  target_amount: number;
  collected_amount: number;
  price_per_share: number;
  estimated_roi_percentage: number;
  duration_months: number;
  funding_start_date: string;
  funding_end_date: string | null;
  status: BatchStatus;
  farm_id: number;
};

export type BatchCreatePayload = {
  title: string;
  description?: string;
  category: BatchCategory;
  target_amount: number;
  duration_months: number;
  funding_start_date: string;
  farm_id: number;
};

export type BatchUpdatePayload = Partial<Omit<BatchCreatePayload, "farm_id" | "description">> & {
  description?: string | null;
  funding_end_date?: string | null;
};

type ApiErrorBody = { detail?: string | Array<{ msg?: string }> };

async function getApiErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail.map((error) => error.msg).filter((error): error is string => Boolean(error)).join(", ") || fallbackMessage;
    }
  } catch {
    // La API puede responder sin JSON cuando ocurre un error de red.
  }
  return fallbackMessage;
}

function getAccessToken(): string {
  const token = window.localStorage.getItem("hatofi_access_token");
  if (!token) throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
  return token;
}

function getApiUrl(): string {
  if (!apiUrl) throw new Error("La URL de la API no está configurada.");
  return apiUrl;
}

function authHeaders() {
  return { Authorization: `Bearer ${getAccessToken()}` };
}

export async function getBatchesByFarm(farmId: number, status?: BatchStatus): Promise<Batch[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  const response = await fetch(`${getApiUrl()}/batches/farm/${farmId}${query}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "No fue posible cargar los lotes."));
  return (await response.json()) as Batch[];
}

export async function getOpenBatches(category?: BatchCategory): Promise<Batch[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : "";
  const response = await fetch(`${getApiUrl()}/batches/open${query}`, { headers: authHeaders() });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "No fue posible cargar los lotes disponibles."));
  return (await response.json()) as Batch[];
}

export async function createBatch(payload: BatchCreatePayload): Promise<Batch> {
  const response = await fetch(`${getApiUrl()}/batches`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "No fue posible crear el lote."));
  return (await response.json()) as Batch;
}

export async function updateBatch(batchId: number, payload: BatchUpdatePayload): Promise<Batch> {
  const response = await fetch(`${getApiUrl()}/batches/${batchId}`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "No fue posible actualizar el lote."));
  return (await response.json()) as Batch;
}

export async function updateBatchStatus(batchId: number, status: BatchStatus): Promise<Batch> {
  const response = await fetch(`${getApiUrl()}/batches/${batchId}/status`, {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error(await getApiErrorMessage(response, "No fue posible cambiar el estado del lote."));
  return (await response.json()) as Batch;
}
