"use client";
import React from "react";
import styled from "@emotion/styled";
import { useAuth } from "./auth_context";
import { useLang } from "./lang_context";
import { useRouter } from "next/router";

const Card = styled.div`
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px;
  margin-bottom: 10px;
  color: #0f172a;

  .dark & {
    background: #0f172a;
    border-color: #1e293b;
    color: #e2e8f0;
  }
`;

const Name = styled.div`
  font-weight: 700;
  margin-bottom: 8px;
  text-align: center;
  word-break: break-all; /* Tördeljük a hosszú email címeket */
`;

const Btn = styled.button`
  width: 100%;
  appearance: none;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  margin-top: 6px;

  &:hover { background: #ffffff; }

  .dark & {
    background: #0f172a;
    border-color: #334155;
    color: #e2e8f0;
  }
`;

export default function UserMenuBar() {
  const { user, logout } = useAuth();
  const { lang } = useLang();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isGuest, setIsGuest] = React.useState(false);

  const text = (hu: string, en: string) => (lang === "hu" ? hu : en);
  const displayName = user?.username ?? text("Vendég", "Guest");

  React.useEffect(() => {
    setMounted(true);
    try {
      const g = localStorage.getItem("guest_mode");
      setIsGuest(!!g);
    } catch {}
  }, []);

  if (!mounted) return null;

  if (isGuest) {
    return (
      <Card>
        <Name>{text("Vendégként belépve", "Logged in as guest")}</Name>
        <Btn
          onClick={() => {
            try { localStorage.removeItem("guest_mode"); } catch {}
            router.push("/");
          }}
        >
          {text("Vissza a főoldalra", "Back to home")}
        </Btn>
      </Card>
    );
  }

  return (
    <Card>
      <Name>{displayName}</Name>
      <Btn onClick={() => router.push("/profile")}>
        {text("Profil beállítások", "Profile settings")}
      </Btn>
      <Btn
        onClick={async () => {
          try { await logout(); } catch {}
          router.push("/");
        }}
      >
        {text("Kijelentkezés", "Log out")}
      </Btn>
    </Card>
  );
}


