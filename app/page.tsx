"use client";

import { useEffect, useState } from "react";
import {
  getRecords,
  addRecord,
  deleteRecord,
  todayString,
  type PainRecord,
} from "@/lib/painStore";
import Calendar from "@/components/Calendar";
import PainForm from "@/components/PainForm";
import PainList from "@/components/PainList";

// 글자 크기 단계 (어르신 시력 배려)
const FONT_LEVELS = [
  { label: "보통", px: 18 },
  { label: "크게", px: 21 },
  { label: "아주 크게", px: 24 },
];

// "2026-07-29" → "7월 29일 (수)"
function dateLabelKo(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${dow})`;
}

export default function Home() {
  const [records, setRecords] = useState<PainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(""); // "2026-07-29"
  const [fontPx, setFontPx] = useState(18);

  // 저장된 기록을 다시 불러옵니다.
  async function reload() {
    setRecords(await getRecords());
  }

  // 화면이 처음 열릴 때: 오늘 날짜 선택 + 저장된 글자크기 적용 + 기록 불러오기
  useEffect(() => {
    setSelectedDate(todayString());
    const savedFont = Number(window.localStorage.getItem("geongang-ilgi.fontPx"));
    if (savedFont) setFontPx(savedFont);
    reload().finally(() => setLoading(false));
  }, []);

  // 글자 크기 적용 (화면 전체 글씨가 커짐) + 저장
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontPx}px`;
    window.localStorage.setItem("geongang-ilgi.fontPx", String(fontPx));
  }, [fontPx]);

  // 새 기록 저장 (날짜는 달력에서 고른 날)
  async function handleAdd(input: {
    bodyPart: string;
    level: number;
    duration: string;
    memo: string;
  }) {
    await addRecord({ date: selectedDate, ...input });
    await reload();
  }

  async function handleDelete(id: string) {
    await deleteRecord(id);
    await reload();
  }

  // 기록이 있는 날짜들 (달력에 점 표시용)
  const datesWithRecords = new Set(records.map((r) => r.date));
  // 선택한 날짜의 기록만
  const selectedRecords = records.filter((r) => r.date === selectedDate);

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      {/* 글자 크기 조절 (상단) */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white p-3">
        <span className="mr-1 text-base font-bold text-gray-600">🔠 글자 크기</span>
        {FONT_LEVELS.map((f) => (
          <button
            key={f.px}
            type="button"
            onClick={() => setFontPx(f.px)}
            className={`rounded-xl border-2 px-4 py-2 font-bold ${
              fontPx === f.px
                ? "bg-blue-600 border-blue-600 text-white"
                : "bg-white border-gray-300 text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 제목 */}
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-extrabold text-blue-700">📔 건강일기</h1>
        <p className="mt-1 text-lg text-gray-600">날짜를 눌러 통증을 기록해요</p>
      </header>

      {/* 의료 면책 안내 */}
      <div className="mb-4 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3">
        <p className="text-base text-amber-900">
          ⚠️ 이 서비스는 <b>의료 조언을 대신하지 않아요.</b> 정확한 진단은 의료진과 상담하세요. 위급 시 <b>119</b>.
        </p>
      </div>

      {!selectedDate ? (
        <p className="py-10 text-center text-xl text-gray-500">불러오는 중...</p>
      ) : (
        <>
          {/* 달력 */}
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            datesWithRecords={datesWithRecords}
          />

          {/* 기록 작성 (선택한 날짜로 저장) */}
          <section className="mt-6 rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-2xl font-bold">
              <span className="text-blue-700">{dateLabelKo(selectedDate)}</span> 기록하기
            </h2>
            <PainForm onAdd={handleAdd} />
          </section>

          {/* 선택한 날짜의 기록 목록 */}
          <section className="mt-8">
            <h2 className="mb-4 text-2xl font-bold">
              {dateLabelKo(selectedDate)} 기록{" "}
              <span className="text-xl text-gray-500">({selectedRecords.length}개)</span>
            </h2>
            {loading ? (
              <p className="py-8 text-center text-xl text-gray-500">기록을 불러오는 중...</p>
            ) : (
              <PainList records={selectedRecords} onDelete={handleDelete} />
            )}
          </section>
        </>
      )}

      <footer className="mt-10 text-center text-base text-gray-400">
        건강일기 · 통증 기록 일지
      </footer>
    </main>
  );
}
