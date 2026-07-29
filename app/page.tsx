"use client";

import { useEffect, useState } from "react";
import {
  getRecords,
  addRecord,
  deleteRecord,
  todayString,
  type PainRecord,
} from "@/lib/painStore";
import {
  getAppointments,
  addAppointment,
  deleteAppointment,
  getDueReminders,
  type Appointment,
  type Reminder,
} from "@/lib/appointments";
import Calendar from "@/components/Calendar";
import PainForm from "@/components/PainForm";
import PainList from "@/components/PainList";
import AppointmentForm from "@/components/AppointmentForm";
import AppointmentList from "@/components/AppointmentList";
import HospitalMap from "@/components/HospitalMap";

const MIN_FONT = 16;
const MAX_FONT = 30;

// "2026-07-29" → "7월 29일 (수)"
function dateLabelKo(dateStr: string) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${dow})`;
}

// "14:30" → "오후 2시 30분"
function timeKo(t: string) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m ? `${ampm} ${h12}시 ${m}분` : `${ampm} ${h12}시`;
}

// 알림 문구 만들기
function reminderText(r: Reminder) {
  const t = r.appt.time ? ` ${timeKo(r.appt.time)}` : "";
  const h = r.appt.hospital ? ` (${r.appt.hospital})` : "";
  if (r.kind === "today") return `오늘${t} 병원 예약이 있어요! 잊지 마세요.${h}`;
  if (r.kind === "day") return `내일${t} 병원 예약이 있어요.${h}`;
  return `일주일 후${t} 병원 예약이 있어요.${h}`;
}

export default function Home() {
  const [tab, setTab] = useState<"diary" | "map">("diary");
  const [records, setRecords] = useState<PainRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [fontPx, setFontPx] = useState(18);
  // 아래 입력 화면 모드: null(버튼만) | "pain"(통증 기록) | "appointment"(예약 등록)
  const [addMode, setAddMode] = useState<null | "pain" | "appointment">(null);

  // 통증 기록 + 예약을 모두 불러오고, 알림을 확인합니다.
  async function loadAll() {
    const [pains, appts] = await Promise.all([getRecords(), getAppointments()]);
    setRecords(pains);
    setAppointments(appts);

    // 알림 확인 (일주일 전 / 하루 전 / 당일)
    const due = getDueReminders(appts, todayString());
    setReminders(due);
    // 허용된 경우 브라우저 알림 (예약+종류별로 한 번만)
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      for (const r of due) {
        const key = `geongang-ilgi.notified.${r.appt.id}.${r.kind}`;
        if (!window.localStorage.getItem(key)) {
          try {
            new Notification("건강일기 · 병원 예약 알림", { body: reminderText(r) });
          } catch {
            /* 무시 */
          }
          window.localStorage.setItem(key, "1");
        }
      }
    }
  }

  // 처음 열릴 때
  useEffect(() => {
    setSelectedDate(todayString());
    const savedFont = Number(window.localStorage.getItem("geongang-ilgi.fontPx"));
    if (savedFont) setFontPx(savedFont);
    loadAll().finally(() => setLoading(false));
  }, []);

  // 글자 크기 적용 + 저장
  useEffect(() => {
    document.documentElement.style.fontSize = `${fontPx}px`;
    window.localStorage.setItem("geongang-ilgi.fontPx", String(fontPx));
  }, [fontPx]);

  function decFont() {
    setFontPx((p) => Math.max(MIN_FONT, p - 2));
  }
  function incFont() {
    setFontPx((p) => Math.min(MAX_FONT, p + 2));
  }

  // 통증 기록 저장/삭제
  async function handleAddPain(input: {
    bodyPart: string;
    painType: string;
    level: number;
    duration: string;
    memo: string;
  }) {
    await addRecord({ date: selectedDate, ...input });
    await loadAll();
  }
  async function handleDeletePain(id: string) {
    await deleteRecord(id);
    await loadAll();
  }

  // 예약 저장/삭제
  async function handleAddAppt(input: { date: string; time: string; hospital: string; memo: string }) {
    await addAppointment(input);
    await loadAll();
    setAddMode(null); // 저장 후 닫기
  }
  async function handleDeleteAppt(id: string) {
    await deleteAppointment(id);
    await loadAll();
  }

  // 달력 점 + 선택 날짜 데이터
  const datesWithRecords = new Set(records.map((r) => r.date));
  const datesWithAppt = new Set(appointments.map((a) => a.date));
  const selectedRecords = records.filter((r) => r.date === selectedDate);
  const selectedAppts = appointments.filter((a) => a.date === selectedDate);

  const btnFont =
    "rounded-xl border-2 border-green-600 px-5 py-2 text-2xl font-bold disabled:opacity-30";

  return (
    <main className="mx-auto max-w-2xl px-4 py-5">
      {/* 글자 크기 (+/-) — 우측 상단 */}
      <div className="mb-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={decFont}
          disabled={fontPx <= MIN_FONT}
          aria-label="글자 작게"
          className={`${btnFont} bg-white text-green-700 hover:bg-green-50`}
        >
          가－
        </button>
        <button
          type="button"
          onClick={incFont}
          disabled={fontPx >= MAX_FONT}
          aria-label="글자 크게"
          className={`${btnFont} bg-green-600 text-white hover:bg-green-700`}
        >
          가＋
        </button>
      </div>

      {/* 탭: 건강일기 / 병원 지도 */}
      <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-green-100 p-1">
        <button
          type="button"
          onClick={() => setTab("diary")}
          className={`rounded-xl py-3 text-xl font-bold ${
            tab === "diary" ? "bg-green-600 text-white shadow" : "text-green-800"
          }`}
        >
          📔 건강일기
        </button>
        <button
          type="button"
          onClick={() => setTab("map")}
          className={`rounded-xl py-3 text-xl font-bold ${
            tab === "map" ? "bg-green-600 text-white shadow" : "text-green-800"
          }`}
        >
          🗺️ 병원 지도
        </button>
      </div>

      {/* 예약 알림 배너 */}
      {reminders.length > 0 && (
        <div className="mb-4 space-y-2">
          {reminders.map((r, i) => (
            <div key={i} className="rounded-2xl border-2 border-blue-300 bg-blue-50 p-4">
              <p className="text-lg font-bold text-blue-900">🔔 {reminderText(r)}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "map" ? (
        <HospitalMap />
      ) : !selectedDate ? (
        <p className="py-10 text-center text-xl text-gray-500">불러오는 중...</p>
      ) : (
        <>
          {/* 달력 */}
          <Calendar
            selectedDate={selectedDate}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setAddMode(null);
            }}
            datesWithRecords={datesWithRecords}
            datesWithAppt={datesWithAppt}
          />

          {/* 선택한 날짜의 기록 (달력 바로 아래) */}
          <section className="mt-6">
            <h2 className="mb-3 text-2xl font-bold">
              {dateLabelKo(selectedDate)} 기록{" "}
              <span className="text-xl text-gray-500">
                ({selectedRecords.length + selectedAppts.length}개)
              </span>
            </h2>
            {loading ? (
              <p className="py-8 text-center text-xl text-gray-500">불러오는 중...</p>
            ) : selectedRecords.length === 0 && selectedAppts.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-green-300 bg-white p-8 text-center">
                <p className="text-xl text-gray-500">
                  이 날은 기록이 없어요.
                  <br />
                  아래 버튼으로 통증이나 예약을 남겨보세요.
                </p>
              </div>
            ) : (
              <>
                {selectedAppts.length > 0 && (
                  <AppointmentList appointments={selectedAppts} onDelete={handleDeleteAppt} />
                )}
                {selectedRecords.length > 0 && (
                  <PainList records={selectedRecords} onDelete={handleDeletePain} />
                )}
              </>
            )}
          </section>

          {/* 통증 기록 / 예약 등록 버튼 + 입력 화면 */}
          {addMode === null && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAddMode("pain")}
                className="rounded-2xl bg-green-600 py-5 text-xl font-bold text-white hover:bg-green-700"
              >
                🩹 통증 기록
              </button>
              <button
                type="button"
                onClick={() => setAddMode("appointment")}
                className="rounded-2xl bg-blue-600 py-5 text-xl font-bold text-white hover:bg-blue-700"
              >
                🏥 예약일 등록
              </button>
            </div>
          )}

          {addMode === "pain" && (
            <section className="mt-6 rounded-3xl border-2 border-green-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  <span className="text-green-700">{dateLabelKo(selectedDate)}</span> 통증 기록
                </h2>
                <button
                  type="button"
                  onClick={() => setAddMode(null)}
                  className="rounded-lg border-2 border-gray-300 px-3 py-1 text-base font-bold text-gray-600 hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
              <PainForm onAdd={handleAddPain} />
            </section>
          )}

          {addMode === "appointment" && (
            <section className="mt-6 rounded-3xl border-2 border-blue-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-blue-700">🏥 병원 예약 등록</h2>
              <AppointmentForm
                defaultDate={selectedDate}
                onAdd={handleAddAppt}
                onCancel={() => setAddMode(null)}
              />
            </section>
          )}
        </>
      )}

      {/* 작은 의료 면책 안내 (노란 박스 대신) */}
      <footer className="mt-10 text-center text-sm text-gray-400">
        이 서비스는 의료 조언을 대신하지 않아요 · 위급 시 119
      </footer>
    </main>
  );
}
