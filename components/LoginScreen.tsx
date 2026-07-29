"use client";

import { useState } from "react";
import { signIn, signUp, checkId } from "@/lib/auth";

// 로그인 / 회원가입 화면
export default function LoginScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false); // 비밀번호 보기 여부
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    // 1) 아이디 형식 확인 (한글/빈칸 등 걸러내기)
    const idError = checkId(id);
    if (idError) {
      setError(idError);
      return;
    }
    // 2) 비밀번호 길이 확인
    if (password.length < 6) {
      setError("비밀번호는 6자 이상으로 만들어주세요.");
      return;
    }
    setBusy(true);
    try {
      const { error } = mode === "login" ? await signIn(id, password) : await signUp(id, password);
      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (mode === "signup" && msg.includes("already")) {
          setError("이미 있는 아이디예요. 위에서 '로그인'을 눌러 들어가세요.");
        } else if (mode === "login") {
          setError(
            "아이디 또는 비밀번호가 맞지 않아요. 회원가입할 때 만든 것과 똑같이(오타 없이) 입력했는지 확인해주세요."
          );
        } else {
          setError("회원가입에 실패했어요. 잠시 후 다시 시도해주세요.");
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
          <p className="mb-1 text-lg font-bold">아이디</p>
          <p className="mb-2 text-base text-gray-500">영어·숫자로 만들어요 (예: gimhealth)</p>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="예: gimhealth 또는 19501225"
            className={inputCls}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>
        <div>
          <p className="mb-2 text-lg font-bold">
            비밀번호 <span className="text-base font-normal text-gray-500">(6자 이상)</span>
          </p>
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className={inputCls}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {/* 비밀번호 보기 (오타 방지) */}
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="mt-2 text-lg font-semibold text-green-700 underline"
          >
            {showPw ? "🙈 비밀번호 숨기기" : "👁 비밀번호 보기"}
          </button>
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
