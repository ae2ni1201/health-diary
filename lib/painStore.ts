// lib/painStore.ts
// 통증 기록을 Supabase(인터넷 저장소)에 저장/불러오기 합니다.
// 로그인한 계정(user_id)에 자동으로 연결되고, 각 계정은 자기 기록만 봅니다. (RLS)
import { supabase } from "./supabase";

// 통증 기록 한 개의 "모양(형태)"
export type PainRecord = {
  id: string; // 고유 번호
  date: string; // 아픈 날짜 (예: "2026-07-29")
  bodyPart: string; // 아픈 부위
  painType: string; // 통증 종류 ("aching" 등, "" 가능)
  level: number; // 아픈 정도 (1~5)
  duration: string; // 지속 시간 ("under5" | "5to10" | "over10" | "")
  memo: string; // 한 줄 메모
  createdAt: string; // 저장한 시각
};

// 날짜를 "2026-07-29" 형식 문자열로 만듭니다. (m은 0~11)
export function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// 오늘 날짜를 "2026-07-29" 형식으로 돌려줍니다.
export function todayString(): string {
  const n = new Date();
  return ymd(n.getFullYear(), n.getMonth(), n.getDate());
}

// 데이터베이스 한 줄(row)의 모양
type Row = {
  id: string;
  pain_date: string;
  body_part: string;
  pain_type: string | null;
  level: number;
  duration: string | null;
  memo: string | null;
  created_at: string;
};

// DB 한 줄 → 앱에서 쓰는 PainRecord로 변환
function toRecord(row: Row): PainRecord {
  return {
    id: row.id,
    date: row.pain_date,
    bodyPart: row.body_part,
    painType: row.pain_type ?? "",
    level: row.level,
    duration: row.duration ?? "",
    memo: row.memo ?? "",
    createdAt: row.created_at,
  };
}

// 내 기록을 모두 불러옵니다. (로그인 계정 기준, RLS가 자동으로 내 것만 걸러줌)
export async function getRecords(): Promise<PainRecord[]> {
  const { data, error } = await supabase
    .from("pain_records")
    .select("*")
    .order("pain_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("기록 불러오기 실패:", error.message);
    return [];
  }
  return (data as Row[]).map(toRecord);
}

// 새 기록을 저장합니다. (user_id는 DB가 자동으로 로그인 계정으로 채웁니다)
export async function addRecord(input: {
  date: string;
  bodyPart: string;
  painType: string;
  level: number;
  duration: string;
  memo: string;
}): Promise<void> {
  const { error } = await supabase.from("pain_records").insert({
    pain_date: input.date,
    body_part: input.bodyPart,
    pain_type: input.painType || null,
    level: input.level,
    duration: input.duration || null,
    memo: input.memo,
  });
  if (error) {
    console.error("저장 실패:", error.message);
    throw error;
  }
}

// id에 해당하는 기록 한 개를 지웁니다.
export async function deleteRecord(id: string): Promise<void> {
  const { error } = await supabase.from("pain_records").delete().eq("id", id);
  if (error) {
    console.error("삭제 실패:", error.message);
    throw error;
  }
}
