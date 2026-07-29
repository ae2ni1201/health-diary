// lib/auth.ts
// 로그인 / 회원가입 / 로그아웃 도우미 (Supabase 로그인 기능 사용)
import { supabase } from "./supabase";

// Supabase 로그인은 "이메일"이 필요합니다.
// 하지만 어르신·가족이 쓰기엔 이메일이 어렵고 오타(gmail↔gamil)가 잘 납니다.
// 그래서 사용자는 간단한 "아이디"만 입력하고, 뒤의 주소는 앱이 자동으로 붙입니다.
// 이렇게 하면 오타가 날 수 있는 부분(@뒤 주소)이 아예 사라집니다.
const ID_DOMAIN = "geonghealth.app";

// 사용자가 적은 아이디 → 내부에서 쓰는 이메일 형식으로 변환
// (예: "gimhealth" → "gimhealth@geonghealth.app")
// 만약 이미 이메일(@ 포함)을 적었으면 그대로 사용합니다.
export function idToEmail(id: string): string {
  const raw = id.trim().toLowerCase();
  if (!raw) return "";
  return raw.includes("@") ? raw : `${raw}@${ID_DOMAIN}`;
}

// 아이디가 올바른지 확인합니다.
// 문제가 없으면 빈 문자열 "", 있으면 안내 메시지를 돌려줍니다.
// (Supabase가 한글 이메일을 거부하므로 영어 소문자/숫자/일부 기호만 허용)
export function checkId(id: string): string {
  const raw = id.trim().toLowerCase();
  if (!raw) return "아이디를 입력해주세요.";
  const local = raw.includes("@") ? raw.split("@")[0] : raw;
  if (!/^[a-z0-9._-]+$/.test(local)) {
    return "아이디는 영어와 숫자로 만들어주세요. (예: gimhealth2026, 또는 숫자 19501225)";
  }
  return "";
}

// 회원가입 (이메일 인증을 꺼놔서 가입하면 바로 로그인돼요)
export async function signUp(id: string, password: string) {
  return supabase.auth.signUp({ email: idToEmail(id), password });
}

// 로그인
export async function signIn(id: string, password: string) {
  return supabase.auth.signInWithPassword({ email: idToEmail(id), password });
}

// 로그아웃
export async function signOut() {
  return supabase.auth.signOut();
}
