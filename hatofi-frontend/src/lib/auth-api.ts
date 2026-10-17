const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

export type RegisterRoleId = 3 | 4;

export type RegisterPayload = {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  role_id: RegisterRoleId;
  terms_accepted: boolean;
};

export type AuthUser = {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  terms_accepted: boolean;
  role: {
    id: number;
    name: "admin" | "develop" | "user_investment" | "user_farmer";
    description?: string | null;
  };
  created_at: string;
};

export type LoginResponse = {
  user: AuthUser;
  access_token: string;
  token_type: string;
};

type ApiErrorBody = {
  detail?: string | Array<{ msg?: string }>;
};

async function getApiErrorMessage(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (typeof body.detail === "string") {
      return body.detail;
    }
    if (Array.isArray(body.detail) && body.detail.length > 0) {
      return body.detail
        .map((error) => error.msg)
        .filter((error): error is string => Boolean(error))
        .join(", ") || fallbackMessage;
    }
  } catch {
    // Mantener el mensaje genérico cuando la API no devuelve JSON.
  }

  return fallbackMessage;
}

export async function loginUser(
  email: string,
  password: string
): Promise<LoginResponse> {
  if (!apiUrl) {
    throw new Error("La URL de la API no está configurada.");
  }

  const formData = new URLSearchParams();
  formData.set("username", email);
  formData.set("password", password);

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  if (response.ok) {
    return (await response.json()) as LoginResponse;
  }

  throw new Error(
    await getApiErrorMessage(response, "No fue posible iniciar sesión.")
  );
}

export async function registerUser(payload: RegisterPayload): Promise<void> {
  if (!apiUrl) {
    throw new Error("La URL de la API no está configurada.");
  }

  const response = await fetch(`${apiUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (response.ok) {
    return;
  }

  throw new Error(
    await getApiErrorMessage(response, "No fue posible completar el registro.")
  );
}
