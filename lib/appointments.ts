// lib/appointments.ts
// 병원 예약을 Supabase에 저장/불러오기 합니다. (로그인 계정 기준)
import { supabase } from "./supabase";
import { ymd } from "./painStore";

// 예약 한 개의 모양
export type Appointment = {
  id: string;
  date: string; // 예약 날짜 "2026-08-05"
  time: string; // 예약 시간 "14:30" ("" 가능)
  hospital: string; // 병원 이름 ("" 가능)
  memo: string;
  createdAt: string;
};

type Row = {
  id: string;
  appt_date: string;
  appt_time: string | null;
  hospital: string | null;
  memo: string | null;
  created_at: string;
};

function toAppt(row: Row): Appointment {
  return {
    id: row.id,
    date: row.appt_date,
    time: row.appt_time ?? "",
    hospital: row.hospital ?? "",
    memo: row.memo ?? "",
    createdAt: row.created_at,
  };
}

// 내 예약을 모두 불러옵니다. (가까운 날짜 순, RLS가 내 것만 걸러줌)
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .order("appt_date", { ascending: true });
  if (error) {
    console.error("예약 불러오기 실패:", error.message);
    return [];
  }
  return (data as Row[]).map(toAppt);
}

// 새 예약을 저장합니다. (user_id는 DB가 자동으로 로그인 계정으로 채웁니다)
export async function addAppointment(input: {
  date: string;
  time: string;
  hospital: string;
  memo: string;
}): Promise<void> {
  const { error } = await supabase.from("appointments").insert({
    appt_date: input.date,
    appt_time: input.time || null,
    hospital: input.hospital || null,
    memo: input.memo || null,
  });
  if (error) {
    console.error("예약 저장 실패:", error.message);
    throw error;
  }
}

// 예약 한 개를 지웁니다.
export async function deleteAppointment(id: string): Promise<void> {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  if (error) {
    console.error("예약 삭제 실패:", error.message);
    throw error;
  }
}

// 날짜 문자열에 며칠을 더한 날짜를 돌려줍니다. (예: "2026-08-05" + (-7) = "2026-07-29")
export function addDaysStr(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + days);
  return ymd(dt.getFullYear(), dt.getMonth(), dt.getDate());
}

// 오늘 기준으로 알림이 필요한 예약을 찾습니다.
export type Reminder = { appt: Appointment; kind: "week" | "day" | "today" };

export function getDueReminders(appts: Appointment[], today: string): Reminder[] {
  const result: Reminder[] = [];
  for (const a of appts) {
    if (a.date === today) result.push({ appt: a, kind: "today" });
    else if (addDaysStr(a.date, -1) === today) result.push({ appt: a, kind: "day" });
    else if (addDaysStr(a.date, -7) === today) result.push({ appt: a, kind: "week" });
  }
  return result;
}
