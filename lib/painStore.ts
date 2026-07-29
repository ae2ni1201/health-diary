// lib/painStore.ts
// 통증 기록을 "브라우저(localStorage)"에 저장하고 불러오는 도우미 코드입니다.
// localStorage = 이 컴퓨터의 브라우저에만 저장되는 작은 저장 공간이에요.
// 지금은 여기에 저장하지만, 4단계에서 Supabase(인터넷 저장소)로 바꿀 거예요.

// 통증 기록 한 개의 "모양(형태)"을 정합니다.
export type PainRecord = {
  id: string; // 고유 번호 (자동으로 만들어짐)
  date: string; // 아픈 날짜 (예: "2026-07-29")
  bodyPart: string; // 아픈 부위 (예: "무릎")
  level: number; // 아픈 정도 (1~5)
  memo: string; // 한 줄 메모
  createdAt: string; // 저장한 시각 (목록 정렬에 사용)
};

// localStorage에 저장할 때 쓰는 이름(칸 이름)
const STORAGE_KEY = "geongang-ilgi.records";

// 저장된 모든 기록을 불러옵니다. (최신 날짜가 위로 오도록 정렬)
export function getRecords(): PainRecord[] {
  if (typeof window === "undefined") return []; // 서버에서는 실행하지 않음
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const list: PainRecord[] = raw ? JSON.parse(raw) : [];
    // 날짜(같으면 저장시각) 기준 내림차순 = 최신이 맨 위로
    return list.sort((a, b) =>
      a.date === b.date
        ? b.createdAt.localeCompare(a.createdAt)
        : b.date.localeCompare(a.date)
    );
  } catch {
    // 저장된 값이 깨져 있어도 앱이 멈추지 않도록 빈 목록 반환
    return [];
  }
}

// 새 기록을 추가하고 저장합니다.
export function addRecord(input: {
  date: string;
  bodyPart: string;
  level: number;
  memo: string;
}): PainRecord {
  const record: PainRecord = {
    id: crypto.randomUUID(), // 고유 번호 자동 생성
    date: input.date,
    bodyPart: input.bodyPart,
    level: input.level,
    memo: input.memo,
    createdAt: new Date().toISOString(),
  };
  const list = getRecords();
  list.push(record);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return record;
}

// id에 해당하는 기록 한 개를 지웁니다.
export function deleteRecord(id: string): void {
  const list = getRecords().filter((r) => r.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
