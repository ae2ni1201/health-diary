"use client";

import { useState } from "react";

type ApptInput = { date: string; time: string; hospital: string; memo: string };

// 숫자만 남기기
const onlyDigits = (s: string) => s.replace(/[^0-9]/g, "");

// 오전/오후 + 시(1~12) + 분(0~59) → "HH:MM"(24시간) 문자열로 변환
function buildTime(ampm: "오전" | "오후", hour: string, minute: string): string {
  if (hour === "") return "";
  let h = parseInt(hour, 10);
  if (isNaN(h)) return "";
  h = Math.min(12, Math.max(1, h));
  let m = minute === "" ? 0 : parseInt(minute, 10);
  if (isNaN(m)) m = 0;
  m = Math.min(59, Math.max(0, m));
  let h24: number;
  if (ampm === "오전") h24 = h === 12 ? 0 : h;
  else h24 = h === 12 ? 12 : h + 12;
  return `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// 병원 예약 등록 화면 (날짜 + 시간 + 병원이름 + 메모)
export default function AppointmentForm({
  defaultDate,
  onAdd,
  onCancel,
}: {
  defaultDate: string; // 달력에서 고른 날짜
  onAdd: (input: ApptInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(defaultDate);
  const [ampm, setAmpm] = useState<"오전" | "오후">("오전");
  const [hour, setHour] = useState(""); // 1~12
  const [minute, setMinute] = useState(""); // 0~59
  const [hospital, setHospital] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = date !== "";

  async function handleSave() {
    if (!canSave || saving) return;
    try {
      setSaving(true);
      // 알림 권한 요청 — 저장을 막지 않도록 "기다리지 않고" 요청만 합니다.
      // (권한 창에 응답하지 않아도 저장은 정상 진행돼요)
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        Notification.requestPermission().catch(() => {});
      }
      const time = buildTime(ampm, hour, minute);
      await onAdd({ date, time, hospital: hospital.trim(), memo: memo.trim() });
    } catch {
      alert("예약 저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-xl border-2 border-gray-300 p-4 text-xl";
  const numCls = "w-24 rounded-xl border-2 border-gray-300 p-3 text-center text-2xl font-bold";

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xl font-bold">📅 예약 날짜</p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </div>

      {/* 시간: 키보드로 숫자 입력 (오전/오후 + 시 + 분) */}
      <div>
        <p className="mb-2 text-xl font-bold">
          ⏰ 예약 시간{" "}
          <span className="text-base font-normal text-gray-500">(숫자로 입력, 선택)</span>
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2">
            {(["오전", "오후"] as const).map((ap) => (
              <button
                key={ap}
                type="button"
                onClick={() => setAmpm(ap)}
                className={`rounded-xl border-2 px-5 py-3 text-xl font-bold ${
                  ampm === ap
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
              >
                {ap}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={hour}
              onChange={(e) => setHour(onlyDigits(e.target.value).slice(0, 2))}
              placeholder="시"
              aria-label="시"
              className={numCls}
            />
            <span className="text-xl font-bold">시</span>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              inputMode="numeric"
              value={minute}
              onChange={(e) => setMinute(onlyDigits(e.target.value).slice(0, 2))}
              placeholder="분"
              aria-label="분"
              className={numCls}
            />
            <span className="text-xl font-bold">분</span>
          </div>
        </div>
        <p className="mt-1 text-base text-gray-500">예: 오후 · 2 · 30 → 오후 2시 30분</p>
      </div>

      <div>
        <p className="mb-2 text-xl font-bold">
          🏥 병원 이름 <span className="text-base font-normal text-gray-500">(선택)</span>
        </p>
        <input
          type="text"
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="예: 튼튼정형외과"
          className={inputCls}
        />
      </div>
      <div>
        <p className="mb-2 text-xl font-bold">
          📝 메모 <span className="text-base font-normal text-gray-500">(선택)</span>
        </p>
        <input
          type="text"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="예: 무릎 엑스레이 찍기"
          className={inputCls}
        />
      </div>

      <div className="rounded-xl bg-green-50 p-3 text-base text-green-800">
        🔔 예약일 <b>일주일 전 · 하루 전 · 당일</b>에 앱을 열면 알려드려요. (알림을 허용하면 브라우저 알림도 울려요.)
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-2xl border-2 border-gray-300 py-4 text-xl font-bold text-gray-700 hover:bg-gray-50"
        >
          닫기
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave || saving}
          className="flex-[2] rounded-2xl bg-green-600 py-4 text-xl font-bold text-white hover:bg-green-700 disabled:opacity-40"
        >
          {saving ? "저장 중..." : "예약 저장하기"}
        </button>
      </div>
    </div>
  );
}
