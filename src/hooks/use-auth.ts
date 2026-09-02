import { useState, useCallback, useEffect } from "react";

interface AuthUser {
  id: string;
  phone: string;
  name: string;
}

const AUTH_KEY = "shop_auth";

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = user !== null;

  const signIn = useCallback(
    async (method: string, data?: Record<string, string>) => {
      setIsLoading(true);
      try {
        if (method === "phone-otp") {
          const phone = data?.email || data?.phone || "";
          const code = data?.code;

          // Simulate OTP verification — accept any 6-digit code
          if (code && code.length === 6) {
            const newUser: AuthUser = {
              id: crypto.randomUUID(),
              phone: phone.replace(/^91/, ""),
              name: "User",
            };
            saveUser(newUser);
            setUser(newUser);
            return;
          }

          // Send OTP step — just return success
          if (!code) {
            return;
          }
        }

        if (method === "anonymous") {
          const newUser: AuthUser = {
            id: crypto.randomUUID(),
            phone: "",
            name: "Guest",
          };
          saveUser(newUser);
          setUser(newUser);
          return;
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const signOut = useCallback(() => {
    saveUser(null);
    setUser(null);
  }, []);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn,
    signOut,
  };
}
