"use client";

import type { Appointment } from "@/lib/appointments";

// 시간 "14:30" → "오후 2시 30분"
function timeLabel(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${ampm} ${h12}시 ${m}분` : `${ampm} ${h12}시`;
}

// 선택한 날짜의 병원 예약 목록
export default function AppointmentList({
  appointments,
  onDelete,
}: {
  appointments: Appointment[];
  onDelete: (id: string) => void;
}) {
  if (appointments.length === 0) return null;

  return (
    <ul className="mt-3 space-y-3">
      {appointments.map((a) => (
        <li key={a.id} className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xl font-bold text-blue-800">🏥 병원 예약</span>
            {a.time && (
              <span className="rounded-full bg-blue-600 px-3 py-1 text-lg font-bold text-white">
                {timeLabel(a.time)}
              </span>
            )}
          </div>
          {a.hospital && <p className="mt-1 text-xl font-semibold">{a.hospital}</p>}
          {a.memo && <p className="mt-1 text-lg text-gray-700">📝 {a.memo}</p>}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("이 예약을 정말 지울까요?")) onDelete(a.id);
            }}
            className="mt-2 rounded-lg border-2 border-red-200 px-4 py-2 text-lg font-semibold text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </li>
      ))}
    </ul>
  );
}
