"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

type UserInfo = {
  email: string;
  username: string;
  isAdmin: boolean;
};

type AuthContextType = {
  user: UserInfo | null;
  token: string | null;
  login: (email: string, password: string) => Promise<UserInfo>;
  register: (email: string, password: string) => Promise<UserInfo>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("auth_token");
    if (t) {
      setToken(t);
      // try fetch me
      fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data) setUser({ email: data.email, username: data.username, isAdmin: !!data.isAdmin });
        })
        .catch(() => {});
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setToken(data.token);
    const info: UserInfo = { email: data.user.email, username: data.user.username, isAdmin: !!data.user.isAdmin };
    setUser(info);
    return info;
  };

  const register = async (email: string, password: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Register failed");
    const data = await res.json();
    localStorage.setItem("auth_token", data.token);
    setToken(data.token);
    const info: UserInfo = { email: data.user.email, username: data.user.username, isAdmin: !!data.user.isAdmin };
    setUser(info);
    return info;
  };

  const logout = async () => {
    const t = localStorage.getItem("auth_token");
    if (t) {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}` },
      }).catch(() => {});
    }
    localStorage.removeItem("auth_token");
    // also clear guest flag so modal can reappear
    try { localStorage.removeItem("guest_mode"); } catch {}
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


