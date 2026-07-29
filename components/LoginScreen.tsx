"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth";

// 로그인 / 회원가입 화면
export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const em = email.trim();
    if (!em || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상으로 만들어주세요.");
      return;
    }
    setBusy(true);
    try {
      const { error } = mode === "login" ? await signIn(em, password) : await signUp(em, password);
      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (mode === "signup" && msg.includes("already")) {
          setError("이미 있는 아이디예요. 위에서 '로그인'을 눌러 들어가세요.");
        } else if (msg.includes("valid email") || msg.includes("email")) {
          setError("아이디는 이메일 형식으로 적어주세요. (예: 우리가족@gmail.com)");
        } else if (mode === "login") {
          setError("로그인에 실패했어요. 아이디·비밀번호를 다시 확인해주세요.");
        } else {
          setError("회원가입에 실패했어요. 다시 시도해주세요.");
        }
      }
      // 성공하면 상위 화면(page.tsx)이 로그인 상태를 감지해 자동으로 앱으로 바뀝니다.
    } catch {
      setError("문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls = "w-full rounded-xl border-2 border-gray-300 p-4 text-xl";

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-green-700">📔 건강일기</h1>
        <p className="mt-2 text-lg text-gray-600">가족과 함께 쓰는 통증 기록</p>
      </header>

      {/* 로그인 / 회원가입 선택 */}
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-2xl bg-green-100 p-1">
        <button
          type="button"
          onClick={() => { setMode("login"); setError(""); }}
          className={`rounded-xl py-3 text-xl font-bold ${
            mode === "login" ? "bg-green-600 text-white shadow" : "text-green-800"
          }`}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => { setMode("signup"); setError(""); }}
          className={`rounded-xl py-3 text-xl font-bold ${
            mode === "signup" ? "bg-green-600 text-white shadow" : "text-green-800"
          }`}
        >
          회원가입
        </button>
      </div>

      <div className="space-y-4 rounded-3xl border-2 border-green-200 bg-white p-6 shadow-sm">
        <div>
          <p className="mb-2 text-lg font-bold">
            아이디 <span className="text-base font-normal text-gray-500">(이메일)</span>
          </p>
          <input
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="예: 우리가족@gmail.com"
            className={inputCls}
            autoComplete="username"
          />
        </div>
        <div>
          <p className="mb-2 text-lg font-bold">
            비밀번호 <span className="text-base font-normal text-gray-500">(6자 이상)</span>
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className={inputCls}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-lg font-semibold text-red-700">{error}</p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="w-full rounded-2xl bg-green-600 py-5 text-2xl font-bold text-white hover:bg-green-700 disabled:opacity-40"
        >
          {busy ? "잠시만요..." : mode === "login" ? "로그인" : "회원가입"}
        </button>
      </div>

      <p className="mt-5 text-center text-base text-gray-600">
        💡 가족이 <b>같은 아이디·비밀번호</b>로 로그인하면
        <br />
        어느 폰에서든 <b>같은 기록</b>을 볼 수 있어요.
      </p>
      <footer className="mt-8 text-center text-sm text-gray-400">
        이 서비스는 의료 조언을 대신하지 않아요 · 위급 시 119
      </footer>
    </main>
  );
}
