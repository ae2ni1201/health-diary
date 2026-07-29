"use client";

import { useEffect, useState } from "react";
import { ymd } from "@/lib/painStore";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar({
  selectedDate,
  onSelectDate,
  datesWithRecords,
}: {
  selectedDate: string; // "2026-07-29"
  onSelectDate: (date: string) => void;
  datesWithRecords: Set<string>; // 기록이 있는 날짜들
}) {
  // 화면에 보여줄 달 (처음엔 선택한 날짜의 달)
  const [sy, sm] = selectedDate.split("-").map(Number);
  const [view, setView] = useState({ y: sy, m: sm - 1 }); // m: 0~11

  // 오늘 날짜 (서버/브라우저 불일치를 막으려고 화면이 뜬 뒤 계산)
  const [todayStr, setTodayStr] = useState("");
  useEffect(() => {
    const n = new Date();
    setTodayStr(ymd(n.getFullYear(), n.getMonth(), n.getDate()));
  }, []);

  const firstDay = new Date(view.y, view.m, 1).getDay(); // 0=일요일
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  // 달력 칸 만들기: 앞쪽 빈칸 + 날짜들
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  }
  function nextMonth() {
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));
  }

  return (
    <div className="rounded-3xl border-2 border-gray-200 bg-white p-4 shadow-sm">
      {/* 월 이동 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          aria-label="이전 달"
          className="rounded-xl px-4 py-2 text-3xl font-bold text-gray-500 hover:bg-gray-100"
        >
          ‹
        </button>
        <p className="text-2xl font-bold">
          {view.y}년 {view.m + 1}월
        </p>
        <button
          type="button"
          onClick={nextMonth}
          aria-label="다음 달"
          className="rounded-xl px-4 py-2 text-3xl font-bold text-gray-500 hover:bg-gray-100"
        >
          ›
        </button>
      </div>

      {/* 요일 (일요일 빨강, 토요일 파랑) */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-1 text-center text-base font-bold ${
              i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-gray-500"
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 칸 */}
      <div className="grid grid-cols-7">
        {cells.map((d, idx) => {
          if (d === null) return <div key={idx} />;
          const dateStr = ymd(view.y, view.m, d);
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === todayStr;
          const hasRecord = datesWithRecords.has(dateStr);
          const dow = idx % 7;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className="flex flex-col items-center py-1"
            >
              <span
                className={
                  "flex h-11 w-11 items-center justify-center rounded-full text-xl " +
                  (isSelected
                    ? "bg-blue-600 font-bold text-white"
                    : isToday
                      ? "border-2 border-blue-400 font-bold text-blue-600"
                      : dow === 0
                        ? "text-red-500"
                        : dow === 6
                          ? "text-blue-500"
                          : "text-gray-800")
                }
              >
                {d}
              </span>
              {/* 기록이 있는 날엔 아래에 점 */}
              <span
                className={`mt-1 h-2 w-2 rounded-full ${
                  hasRecord ? "bg-orange-500" : "bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
