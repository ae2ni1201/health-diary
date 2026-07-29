// lib/painStore.ts
// 통증 기록을 Supabase(인터넷 저장소)에 저장하고 불러오는 도우미 코드입니다.
// 로그인이 없으므로, "기기 ID"(이 브라우저의 무작위 번호)로 내 기록만 구분합니다.
import { supabase } from "./supabase";

// 통증 기록 한 개의 "모양(형태)"
export type PainRecord = {
  id: string; // 고유 번호
  date: string; // 아픈 날짜 (예: "2026-07-29")
  bodyPart: string; // 아픈 부위
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

// 이 기기를 구분하는 무작위 번호를 가져옵니다. (없으면 새로 만들어 저장)
function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem("geongang-ilgi.deviceId");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("geongang-ilgi.deviceId", id);
  }
  return id;
}

// 데이터베이스 한 줄(row)의 모양
type Row = {
  id: string;
  pain_date: string;
  body_part: string;
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
    level: row.level,
    duration: row.duration ?? "",
    memo: row.memo ?? "",
    createdAt: row.created_at,
  };
}

// 내 기록을 모두 불러옵니다. (최신 날짜가 위로)
export async function getRecords(): Promise<PainRecord[]> {
  const deviceId = getDeviceId();
  const { data, error } = await supabase
    .from("pain_records")
    .select("*")
    .eq("device_id", deviceId)
    .order("pain_date", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    console.error("기록 불러오기 실패:", error.message);
    return [];
  }
  return (data as Row[]).map(toRecord);
}

// 새 기록을 저장합니다.
export async function addRecord(input: {
  date: string;
  bodyPart: string;
  level: number;
  duration: string;
  memo: string;
}): Promise<void> {
  const deviceId = getDeviceId();
  const { error } = await supabase.from("pain_records").insert({
    device_id: deviceId,
    pain_date: input.date,
    body_part: input.bodyPart,
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
