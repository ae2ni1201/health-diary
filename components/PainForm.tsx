"use client";

import { useState } from "react";

// 자주 쓰는 "아픈 부위" 목록 — 큰 버튼으로 보여줍니다.
const BODY_PARTS = ["머리", "목", "어깨", "가슴", "배", "허리", "팔", "다리", "무릎", "기타"];

// "아픈 정도" 1~5 — 숫자 + 쉬운 말 + 색깔
const LEVELS = [
  { value: 1, label: "약함", color: "bg-emerald-600 border-emerald-600" },
  { value: 2, label: "조금", color: "bg-green-600 border-green-600" },
  { value: 3, label: "보통", color: "bg-amber-600 border-amber-600" },
  { value: 4, label: "아픔", color: "bg-orange-600 border-orange-600" },
  { value: 5, label: "심함", color: "bg-red-600 border-red-600" },
];

type PainInput = { date: string; bodyPart: string; level: number; memo: string };

export default function PainForm({ onAdd }: { onAdd: (input: PainInput) => void }) {
  // 오늘 날짜 (예: "2026-07-29")
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [bodyPart, setBodyPart] = useState("");
  const [customPart, setCustomPart] = useState(""); // "기타"일 때 직접 입력
  const [level, setLevel] = useState(0);
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);

  // "기타"를 골랐으면 직접 입력한 값을 사용
  const finalPart = bodyPart === "기타" ? customPart.trim() : bodyPart;
  const canSave = finalPart !== "" && level >= 1;

  function handleSave() {
    if (!canSave) return;
    onAdd({ date, bodyPart: finalPart, level, memo: memo.trim() });
    // 저장 후 입력칸 비우기
    setBodyPart("");
    setCustomPart("");
    setLevel(0);
    setMemo("");
    setDate(today);
    // "저장됐어요" 안내를 잠깐 보여주기
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const btnBase = "rounded-xl border-2 py-4 text-xl font-semibold transition-colors";

  return (
    <div className="space-y-6">
      {/* 1) 아픈 부위 고르기 */}
      <div>
        <p className="mb-3 text-xl font-bold">1. 어디가 아프세요?</p>
        <div className="grid grid-cols-3 gap-3">
          {BODY_PARTS.map((part) => {
            const selected = bodyPart === part;
            return (
              <button
                key={part}
                type="button"
                onClick={() => setBodyPart(part)}
                className={`${btnBase} ${
                  selected
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"
                }`}
              >
                {part}
              </button>
            );
          })}
        </div>
        {/* "기타"를 고르면 직접 입력칸이 나타남 */}
        {bodyPart === "기타" && (
          <input
            type="text"
            value={customPart}
            onChange={(e) => setCustomPart(e.target.value)}
            placeholder="아픈 곳을 적어주세요 (예: 손목)"
            className="mt-3 w-full rounded-xl border-2 border-gray-300 p-4 text-xl"
          />
        )}
      </div>

      {/* 2) 아픈 정도 고르기 */}
      <div>
        <p className="mb-3 text-xl font-bold">2. 얼마나 아프세요?</p>
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map((lv) => {
            const selected = level === lv.value;
            return (
              <button
                key={lv.value}
                type="button"
                onClick={() => setLevel(lv.value)}
                className={`rounded-xl border-2 py-3 transition-colors ${
                  selected
                    ? `${lv.color} text-white`
                    : "bg-white border-gray-300 text-gray-800 hover:border-blue-400"
                }`}
              >
                <span className="block text-2xl font-bold">{lv.value}</span>
                <span className="block text-base">{lv.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3) 날짜 고르기 */}
      <div>
        <p className="mb-3 text-xl font-bold">3. 언제 아프셨어요?</p>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border-2 border-gray-300 p-4 text-xl"
        />
      </div>

      {/* 4) 한 줄 메모 (선택) */}
      <div>
        <p className="mb-3 text-xl font-bold">
          4. 한 줄 메모{" "}
          <span className="text-base font-normal text-gray-500">(안 적어도 돼요)</span>
        </p>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 계단 내려올 때 시큰함"
          className="w-full rounded-xl border-2 border-gray-300 p-4 text-xl"
        />
      </div>

      {/* 저장 버튼 */}
      <button
        type="button"
        onClick={handleSave}
        disabled={!canSave}
        className="w-full rounded-2xl bg-blue-600 py-5 text-2xl font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        저장하기
      </button>

      {/* 안내 문구 */}
      {!canSave && !saved && (
        <p className="text-center text-lg text-gray-500">
          아픈 부위와 정도를 고르면 저장할 수 있어요.
        </p>
      )}
      {saved && (
        <p className="text-center text-xl font-bold text-green-600">✓ 저장됐어요!</p>
      )}
    </div>
  );
}
