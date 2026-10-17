const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export type Farm = {
  id: number;
  name: string;
  description: string | null;
  location: string;
  capacity_head_count: number;
  capacity_current_head_count: number;
  user_id: number;
};

export type FarmCreatePayload = {
  name: string;
  description?: string;
  location: string;
  capacity_head_count: number;
  capacity_current_head_count: number;
};

type ApiErrorBody = {
  detail?: string | Array<{ msg?: string }>;
};

async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map((error) => error.msg)
        .filter((error): error is string => Boolean(error))
        .join(", ") || fallbackMessage;
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

export async function getFarms(): Promise<Farm[]> {
  const response = await fetch(`${getApiUrl()}/farms`, {
    headers: { Authorization: `Bearer ${getAccessToken()}` },
  });
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "No fue posible cargar tus fincas."));
  }
  return (await response.json()) as Farm[];
}

export async function createFarm(payload: FarmCreatePayload): Promise<Farm> {
  const response = await fetch(`${getApiUrl()}/farms`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response, "No fue posible registrar la finca."));
  }
  return (await response.json()) as Farm;
}
