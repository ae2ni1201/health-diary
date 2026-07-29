"use client";

import type { PainRecord } from "@/lib/painStore";

// 아픈 정도(1~5)에 붙는 쉬운 말과 색
const LEVEL_INFO: Record<number, { label: string; color: string }> = {
  1: { label: "약함", color: "bg-emerald-600" },
  2: { label: "조금", color: "bg-green-600" },
  3: { label: "보통", color: "bg-amber-600" },
  4: { label: "아픔", color: "bg-orange-600" },
  5: { label: "심함", color: "bg-red-600" },
};

// 날짜("2026-07-29")를 "2026년 7월 29일 (화)"처럼 보기 좋게 바꿉니다.
function formatDate(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  const date = new Date(y, m - 1, day);
  const week = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${y}년 ${m}월 ${day}일 (${week})`;
}

export default function PainList({
  records,
  onDelete,
}: {
  records: PainRecord[];
  onDelete: (id: string) => void;
}) {
  // 기록이 하나도 없을 때 보여줄 안내
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-xl text-gray-500">
          아직 기록이 없어요.
          <br />
          위에서 오늘 아픈 곳을 적어보세요.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {records.map((r) => {
        const info = LEVEL_INFO[r.level] ?? { label: "", color: "bg-gray-500" };
        return (
          <li
            key={r.id}
            className="rounded-2xl border-2 border-gray-200 bg-white p-5 shadow-sm"
          >
            <p className="text-lg font-semibold text-gray-500">{formatDate(r.date)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold">{r.bodyPart}</span>
              <span
                className={`rounded-full ${info.color} px-3 py-1 text-lg font-bold text-white`}
              >
                {r.level} · {info.label}
              </span>
            </div>
            {r.memo && <p className="mt-2 text-xl text-gray-800">📝 {r.memo}</p>}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("이 기록을 정말 지울까요?")) onDelete(r.id);
              }}
              className="mt-3 rounded-lg border-2 border-red-200 px-4 py-2 text-lg font-semibold text-red-600 hover:bg-red-50"
            >
              삭제
            </button>
          </li>
        );
      })}
    </ul>
  );
}
