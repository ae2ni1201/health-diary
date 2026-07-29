"use client";

import { useState } from "react";

type ApptInput = { date: string; time: string; hospital: string; memo: string };

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
  const [time, setTime] = useState("");
  const [hospital, setHospital] = useState("");
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = date !== "";

  async function handleSave() {
    if (!canSave || saving) return;
    try {
      setSaving(true);
      // 알림을 받으려면 브라우저 알림 권한이 필요해요. (허용하면 예약일에 알림이 울려요)
      if (
        typeof window !== "undefined" &&
        "Notification" in window &&
        Notification.permission === "default"
      ) {
        try {
          await Notification.requestPermission();
        } catch {
          /* 무시 */
        }
      }
      await onAdd({ date, time, hospital: hospital.trim(), memo: memo.trim() });
    } catch {
      alert("예약 저장에 실패했어요. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-xl border-2 border-gray-300 p-4 text-xl";

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xl font-bold">📅 예약 날짜</p>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </div>
      <div>
        <p className="mb-2 text-xl font-bold">⏰ 예약 시간</p>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
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
