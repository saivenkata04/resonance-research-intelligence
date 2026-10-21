export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  institution?: string;
  projectId?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("resonance_auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("resonance_auth_token", token);
}

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("resonance_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function setCurrentUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("resonance_user", JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("resonance_auth_token");
  localStorage.removeItem("resonance_user");
}

export async function loginWithCredentials(email: string, password: string): Promise<UserProfile> {
  const params = new URLSearchParams();
  params.append("username", email);
  params.append("password", password);

  const res = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Authentication failed. Please check your credentials.");
  }

  const data = await res.json();
  setAuthToken(data.access_token);

  const profile: UserProfile = {
    id: data.user?.id,
    name: data.user?.full_name || email.split("@")[0].replace(".", " ").toUpperCase(),
    email: data.user?.email || email,
    role: data.user?.role || "researcher",
    institution: "Research Intelligence Workspace",
    projectId: data.user?.project_id,
  };

  setCurrentUser(profile);
  return profile;
}

export async function registerWithCredentials(
  email: string,
  password: string,
  fullName?: string,
  role: string = "researcher"
): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      full_name: fullName,
      role,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Registration failed. Please check your details.");
  }

  const data = await res.json();
  setAuthToken(data.access_token);

  const profile: UserProfile = {
    id: data.user?.id,
    name: data.user?.full_name || fullName || email.split("@")[0],
    email: data.user?.email || email,
    role: data.user?.role || role,
    institution: "Scientific Contributor Workspace",
    projectId: data.user?.project_id,
  };

  setCurrentUser(profile);
  return profile;
}

export async function forgotPassword(email: string): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to process password recovery request.");
  }

  const data = await res.json();
  return data.message || "Password recovery instructions dispatched.";
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
