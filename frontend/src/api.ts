const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export type ApiResponse<T> = {
  status: number;
  data: T | null;
  error: string | null;
};

export type UserRole = "TRAINER" | "ADMIN";

export type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

export type AuthState = {
  token: string | null;
  user: User | null;
};

type JwtPayload = {
  exp?: number;
};

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    // JWT uses base64url encoding, so convert before atob.
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(normalized + padding);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

export const getTokenExpiryMs = (token: string): number | null => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
};

export const isTokenExpired = (token: string, now = Date.now()): boolean => {
  const expiresAt = getTokenExpiryMs(token);
  if (!expiresAt) return true;
  return now >= expiresAt;
};

export const loadAuthState = (): AuthState => {
  try {
    const raw = localStorage.getItem("auth");
    if (!raw) return { token: null, user: null };
    const state = JSON.parse(raw) as AuthState;

    if (!state.token || !state.user) {
      return { token: null, user: null };
    }

    if (isTokenExpired(state.token)) {
      localStorage.removeItem("auth");
      return { token: null, user: null };
    }

    return state;
  } catch {
    return { token: null, user: null };
  }
};

export const saveAuthState = (state: AuthState) => {
  try {
    localStorage.setItem("auth", JSON.stringify(state));
  } catch {
    // ignore
  }
};

export const clearAuthState = () => {
  try {
    localStorage.removeItem("auth");
  } catch {
    // ignore
  }
};

const buildHeaders = (token?: string | null) => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, options);
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      const errorMessage =
        typeof body === "string"
          ? body
          : (body?.error as string) ?? JSON.stringify(body);

      return {
        status: res.status,
        data: null,
        error: errorMessage,
      };
    }

    return {
      status: res.status,
      data: body as T,
      error: null,
    };
  } catch (error) {
    return {
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// Specific API helpers

export type HealthResponse = {
  status: string;
  timestamp: string;
};

export const checkHealth = () =>
  request<HealthResponse>("/health", {
    method: "GET",
  });

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  usernameOrEmail: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export const registerUser = (payload: RegisterPayload) =>
  request<AuthResponse>("/auth/register", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

export const loginUser = (payload: LoginPayload) =>
  request<AuthResponse>("/auth/login", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

// Backward-compatible aliases during transition
export const registerTrainer = registerUser;
export const loginTrainer = loginUser;

export type Hotel = {
  id: number;
  name: string;
  city: string;
  country: string;
  biome: string;
};

export type CreateHotelPayload = {
  name: string;
  city: string;
  country: string;
  biome: string;
};

export const listHotels = () =>
  request<Hotel[]>("/hotels", {
    method: "GET",
  });

export const getHotelById = (id: number) =>
  request<Hotel>(`/hotels/${id}`, {
    method: "GET",
  });

export const createHotel = (payload: CreateHotelPayload) =>
  request<Hotel>("/hotels", {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });

