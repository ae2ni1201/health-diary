"use client";

import { useState } from "react";

// 자주 쓰는 "아픈 부위" 목록
const BODY_PARTS = ["머리", "목", "어깨", "가슴", "배", "허리", "팔", "다리", "무릎", "기타"];

// "어떻게 아픈지" 통증 종류
const PAIN_TYPES = [
  { value: "aching", label: "쑤심" },
  { value: "stabbing", label: "콕콕" },
  { value: "throbbing", label: "욱신" },
  { value: "sharp", label: "찌릿" },
  { value: "stiff", label: "뻐근" },
  { value: "burning", label: "화끈" },
];

// "아픈 정도" 1~5 (초록→빨강, 심할수록 진한 색)
const LEVELS = [
  { value: 1, label: "약함", color: "bg-emerald-600 border-emerald-600" },
  { value: 2, label: "조금", color: "bg-green-600 border-green-600" },
  { value: 3, label: "보통", color: "bg-amber-600 border-amber-600" },
  { value: 4, label: "아픔", color: "bg-orange-600 border-orange-600" },
  { value: 5, label: "심함", color: "bg-red-600 border-red-600" },
];

// "지속 시간" 3가지
const DURATIONS = [
  { value: "under5", label: "5분 이내" },
  { value: "5to10", label: "5~10분" },
  { value: "over10", label: "10분 이상" },
];

type PainInput = {
  bodyPart: string;
  painType: string;
  level: number;
  duration: string;
  memo: string;
};

// 날짜는 달력에서 고른 값을 쓰므로, 이 폼에는 날짜 입력이 없습니다.
export default function PainForm({ onAdd }: { onAdd: (input: PainInput) => Promise<void> }) {
  const [bodyPart, setBodyPart] = useState("");
  const [customPart, setCustomPart] = useState(""); // "기타"일 때 직접 입력
  const [painType, setPainType] = useState("");
  const [level, setLevel] = useState(0);
  const [duration, setDuration] = useState("");
  const [memo, setMemo] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const finalPart = bodyPart === "기타" ? customPart.trim() : bodyPart;
  const canSave = finalPart !== "" && level >= 1;

  async function handleSave() {
    if (!canSave || saving) return;
    try {
      setSaving(true);
      await onAdd({ bodyPart: finalPart, painType, level, duration, memo: memo.trim() });
      // 저장 후 입력칸 비우기
      setBodyPart("");
      setCustomPart("");
      setPainType("");
      setLevel(0);
      setDuration("");
      setMemo("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert("저장에 실패했어요. 인터넷 연결을 확인하고 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  const btnBase = "rounded-xl border-2 py-4 text-xl font-semibold transition-colors";
  const chosen = "bg-green-600 border-green-600 text-white";
  const unchosen = "bg-white border-gray-300 text-gray-800 hover:border-green-500";

  return (
    <div className="space-y-6">
      {/* 1) 아픈 부위 */}
      <div>
        <p className="mb-3 text-xl font-bold">1. 어디가 아프세요?</p>
        <div className="grid grid-cols-3 gap-3">
          {BODY_PARTS.map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => setBodyPart(part)}
              className={`${btnBase} ${bodyPart === part ? chosen : unchosen}`}
            >
              {part}
            </button>
          ))}
        </div>
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

      {/* 2) 통증 종류 (선택) */}
      <div>
        <p className="mb-3 text-xl font-bold">
          2. 어떻게 아프세요?{" "}
          <span className="text-base font-normal text-gray-500">(안 골라도 돼요)</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {PAIN_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => setPainType(painType === pt.value ? "" : pt.value)}
              className={`${btnBase} ${painType === pt.value ? chosen : unchosen}`}
            >
              {pt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3) 아픈 정도 */}
      <div>
        <p className="mb-3 text-xl font-bold">3. 얼마나 아프세요?</p>
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map((lv) => (
            <button
              key={lv.value}
              type="button"
              onClick={() => setLevel(lv.value)}
              className={`rounded-xl border-2 py-3 transition-colors ${
                level === lv.value
                  ? `${lv.color} text-white`
                  : "bg-white border-gray-300 text-gray-800 hover:border-green-500"
              }`}
            >
              <span className="block text-2xl font-bold">{lv.value}</span>
              <span className="block text-base">{lv.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4) 지속 시간 (선택) */}
      <div>
        <p className="mb-3 text-xl font-bold">
          4. 얼마나 오래 아팠어요?{" "}
          <span className="text-base font-normal text-gray-500">(안 골라도 돼요)</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {DURATIONS.map((dr) => (
            <button
              key={dr.value}
              type="button"
              onClick={() => setDuration(duration === dr.value ? "" : dr.value)}
              className={`${btnBase} ${duration === dr.value ? chosen : unchosen}`}
            >
              {dr.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5) 한 줄 메모 (선택) */}
      <div>
        <p className="mb-3 text-xl font-bold">
          5. 한 줄 메모{" "}
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
        disabled={!canSave || saving}
        className="w-full rounded-2xl bg-green-600 py-5 text-2xl font-bold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "저장 중..." : "저장하기"}
      </button>

      {!canSave && !saved && (
        <p className="text-center text-lg text-gray-500">
          아픈 부위와 정도를 고르면 저장할 수 있어요.
        </p>
      )}
      {saved && (
        <p className="text-center text-xl font-bold text-green-700">✓ 저장됐어요!</p>
      )}
    </div>
  );
}
