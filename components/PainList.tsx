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

// 지속 시간 코드 → 보여줄 말
const DURATION_LABEL: Record<string, string> = {
  under5: "5분 이내",
  "5to10": "5~10분",
  over10: "10분 이상",
};

// 저장한 시각을 "오후 2:30"처럼 보여줍니다.
function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}

export default function PainList({
  records,
  onDelete,
}: {
  records: PainRecord[];
  onDelete: (id: string) => void;
}) {
  // 이 날 기록이 하나도 없을 때
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 text-center">
        <p className="text-xl text-gray-500">
          이 날은 기록이 없어요.
          <br />
          위에서 아픈 곳을 적어보세요.
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl font-bold">{r.bodyPart}</span>
              <span
                className={`rounded-full ${info.color} px-3 py-1 text-lg font-bold text-white`}
              >
                {r.level} · {info.label}
              </span>
              {r.duration && DURATION_LABEL[r.duration] && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-lg font-semibold text-gray-700">
                  ⏱ {DURATION_LABEL[r.duration]}
                </span>
              )}
              <span className="ml-auto text-base text-gray-400">{timeLabel(r.createdAt)}</span>
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
