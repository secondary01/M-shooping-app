import { useState, useCallback, useEffect, useRef } from "react";
import { API_BASE_URL, ENDPOINTS } from "@/lib/apiConfig";
import type {
  SendOtpRequest,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/lib/apiConfig";

// ──────────────────────────────────────────────
// Storage keys
// ──────────────────────────────────────────────
const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  USER_ID: "auth_user_id",
  EXPIRES_AT: "auth_expires_at",
  USER: "auth_user", // optional user object (name, etc.)
} as const;

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface AuthUser {
  id: string;
  phone: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ──────────────────────────────────────────────
// Auth Provider & Hook
// ──────────────────────────────────────────────
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    expiresAt: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load persisted session on mount ──────────
  useEffect(() => {
    const loadSession = () => {
      try {
        const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        const expiresAt = localStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
        const userStr = localStorage.getItem(STORAGE_KEYS.USER);

        if (accessToken && refreshToken && userId && expiresAt) {
          const exp = parseInt(expiresAt, 10);
          const now = Date.now();
          if (exp > now) {
            // Still valid
            const user = userStr ? JSON.parse(userStr) : { id: userId, phone: "", name: "User" };
            setState({
              user,
              accessToken,
              refreshToken,
              expiresAt: exp,
              isAuthenticated: true,
              isLoading: false,
            });
            scheduleAutoRefresh(exp);
            return;
          } else {
            // Expired – try to refresh
            attemptRefresh(refreshToken);
            return;
          }
        }
      } catch (e) {
        console.warn("Failed to load session:", e);
      }
      setState((s) => ({ ...s, isLoading: false }));
    };

    loadSession();
  }, []);

  // ── Cleanup refresh timer on unmount ─────────
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, []);

  // ── Helper: API request (unauthenticated) ───
  const apiRequest = useCallback(
    async <T>(endpoint: string, body: any): Promise<T> => {
      const url = `${API_BASE_URL}${endpoint}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      return res.json();
    },
    [],
  );

  // ── Helper: API request (authenticated) ─────
  const authApiRequest = useCallback(
    async <T>(
      endpoint: string,
      options?: { method?: string; body?: any; params?: Record<string, string | number> },
    ): Promise<T> => {
      const { method = "POST", body, params = {} } = options || {};

      // Resolve path parameters
      let resolvedPath = endpoint;
      for (const [key, value] of Object.entries(params)) {
        resolvedPath = resolvedPath.replace(`:${key}`, String(value));
      }

      const url = `${API_BASE_URL}${resolvedPath}`;
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        // If unauthorized, clear session
        if (res.status === 401) {
          logout();
        }
        throw new Error(errorData.message || `Request failed with status ${res.status}`);
      }

      return res.json();
    },
    [],
  );

  // ── Auto‑refresh scheduling ──────────────────
  const scheduleAutoRefresh = useCallback((expiresAt: number) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    // Refresh 5 minutes before expiry, but at least 10 seconds from now
    const refreshIn = Math.max(timeUntilExpiry - 5 * 60 * 1000, 10_000);

    if (timeUntilExpiry > 0) {
      refreshTimerRef.current = setTimeout(() => {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          attemptRefresh(refreshToken);
        } else {
          logout();
        }
      }, refreshIn);
    }
  }, []);

  // ── Refresh token logic ──────────────────────
  const attemptRefresh = useCallback(async (refreshToken: string) => {
    if (!refreshToken) {
      logout();
      return;
    }

    try {
      // /auth/refresh-token expects { refreshToken }
      const response = await apiRequest<{
        success: boolean;
        accessToken: string;
        refreshToken: string;
        userId: string;
        expiresAt: number;
        phone?: string;
        message: string;
      }>(ENDPOINTS.auth.refreshToken, { refreshToken });

      if (response.success) {
        const user: AuthUser = {
          id: response.userId,
          phone: response.phone || "",
          name: "User", // if name not returned, keep default
        };
        saveTokens(
          response.accessToken,
          response.refreshToken,
          response.userId,
          response.expiresAt,
          user,
        );
        setState((s) => ({
          ...s,
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
          isAuthenticated: true,
          isLoading: false,
        }));
        scheduleAutoRefresh(response.expiresAt);
      } else {
        logout();
      }
    } catch (e) {
      console.warn("Token refresh failed:", e);
      logout();
    }
  }, []);

  // ── Save tokens to localStorage ──────────────
  const saveTokens = useCallback(
    (accessToken: string, refreshToken: string, userId: string, expiresAt: number, user: AuthUser) => {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
      localStorage.setItem(STORAGE_KEYS.EXPIRES_AT, String(expiresAt));
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    [],
  );

  // ── Public methods ───────────────────────────

  const sendOtp = useCallback(
    async (phone: string): Promise<SendOtpResponse> => {
      const payload: SendOtpRequest = {
        phone,
        deviceId: localStorage.getItem("deviceId") || undefined,
      };
      return apiRequest<SendOtpResponse>(ENDPOINTS.auth.sendOtp, payload);
    },
    [apiRequest],
  );

  const verifyOtp = useCallback(
    async (phone: string, otp: string, sessionId?: string): Promise<VerifyOtpResponse> => {
      const payload: VerifyOtpRequest = {
        phone,
        otp,
        sessionId,
        deviceId: localStorage.getItem("deviceId") || undefined,
      };
      const response = await apiRequest<VerifyOtpResponse>(ENDPOINTS.auth.verifyOtp, payload);

      if (response.success) {
        const user: AuthUser = {
          id: response.userId,
          phone,
          name: "User", // optionally update name from response if provided
        };
        saveTokens(
          response.accessToken,
          response.refreshToken,
          response.userId,
          response.expiresAt,
          user,
        );

        setState({
          user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: response.expiresAt,
          isAuthenticated: true,
          isLoading: false,
        });

        scheduleAutoRefresh(response.expiresAt);
      }

      return response;
    },
    [apiRequest, saveTokens, scheduleAutoRefresh],
  );

  const refreshSession = useCallback(async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      logout();
      return false;
    }
    try {
      await attemptRefresh(refreshToken);
      return true;
    } catch {
      return false;
    }
  }, [attemptRefresh]);

  const logout = useCallback(async () => {
    // Try to call logout endpoint, but clear session regardless
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      try {
        await authApiRequest(ENDPOINTS.auth.logout, {
          method: "POST",
          body: { refreshToken },
        });
      } catch (e) {
        // ignore errors
      }
    }

    // Clear local storage
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
    localStorage.removeItem(STORAGE_KEYS.USER);

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, [authApiRequest]);

  // ── Guest login (mock – replace with real endpoint if available) ──
  const signInAsGuest = useCallback(() => {
    // For guest mode, we don't have real tokens; we simulate one.
    // If your backend supports guest sessions, you could call a real endpoint.
    // For now, we create a fake guest user.
    const guestUser: AuthUser = {
      id: `guest_${Date.now()}`,
      phone: "",
      name: "Guest",
    };
    // Use a fake token (expires in 2 days)
    const fakeToken = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const expiresAt = Date.now() + 2 * 24 * 60 * 60 * 1000;
    saveTokens(fakeToken, fakeToken, guestUser.id, expiresAt, guestUser);

    setState({
      user: guestUser,
      accessToken: fakeToken,
      refreshToken: fakeToken,
      expiresAt,
      isAuthenticated: true,
      isLoading: false,
    });

    scheduleAutoRefresh(expiresAt);
  }, [saveTokens, scheduleAutoRefresh]);

  // ── Return value ─────────────────────────────
  return {
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    accessToken: state.accessToken,
    refreshToken: state.refreshToken,
    expiresAt: state.expiresAt,
    sendOtp,
    verifyOtp,
    refreshSession,
    signOut: logout,
    signInAsGuest,
    // Keep original signIn for backward compatibility with existing UI
    signIn: async (method: string, data?: Record<string, string>) => {
      if (method === "phone-otp") {
        const phone = data?.email || data?.phone || "";
        const code = data?.code;
        if (code && code.length === 6) {
          // This is the verification step
          await verifyOtp(phone, code);
        } else {
          // This is the send OTP step
          await sendOtp(phone);
        }
      } else if (method === "anonymous") {
        signInAsGuest();
      }
    },
  };
}

// ──────────────────────────────────────────────
// Optional helper to get token for API client
// ──────────────────────────────────────────────
export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
              }
