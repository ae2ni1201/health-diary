"use client";

import { useEffect, useState } from "react";
import { getRecords, addRecord, deleteRecord, type PainRecord } from "@/lib/painStore";
import PainForm from "@/components/PainForm";
import PainList from "@/components/PainList";

export default function Home() {
  // 화면에 보여줄 통증 기록 목록
  const [records, setRecords] = useState<PainRecord[]>([]);
  const [loading, setLoading] = useState(true); // 불러오는 중 표시

  // 저장된 기록을 다시 불러옵니다.
  async function reload() {
    setRecords(await getRecords());
  }

  // 화면이 처음 열릴 때 기록을 불러옵니다.
  useEffect(() => {
    reload().finally(() => setLoading(false));
  }, []);

  // 새 기록 저장하기
  async function handleAdd(input: { date: string; bodyPart: string; level: number; memo: string }) {
    await addRecord(input);
    await reload(); // 목록 새로고침
  }

  // 기록 삭제하기
  async function handleDelete(id: string) {
    await deleteRecord(id);
    await reload();
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* 머리말 */}
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-blue-700">📔 건강일기</h1>
        <p className="mt-2 text-xl text-gray-600">아픈 곳을 날짜별로 기록해요</p>
      </header>

      {/* 의료 면책 안내 (CLAUDE.md 규칙) */}
      <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
        <p className="text-lg text-amber-900">
          ⚠️ 이 서비스는 <b>의료 조언을 대신하지 않아요.</b> 정확한 진단은 꼭 의료진과
          상담하세요. 위급할 때는 <b>119</b>에 전화하세요.
        </p>
      </div>

      {/* 기록 작성 */}
      <section className="mb-8 rounded-3xl border-2 border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-2xl font-bold">오늘 아픈 곳 적기</h2>
        <PainForm onAdd={handleAdd} />
      </section>

      {/* 기록 목록 */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">
          내 기록 <span className="text-xl text-gray-500">({records.length}개)</span>
        </h2>
        {loading ? (
          <p className="py-8 text-center text-xl text-gray-500">기록을 불러오는 중...</p>
        ) : (
          <PainList records={records} onDelete={handleDelete} />
        )}
      </section>

      {/* 꼬리말 */}
      <footer className="mt-10 text-center text-base text-gray-400">
        건강일기 · 통증 기록 일지
      </footer>
    </main>
  );
}
