// lib/auth.ts
// 로그인 / 회원가입 / 로그아웃 도우미 (Supabase 로그인 기능 사용)
import { supabase } from "./supabase";

// 회원가입 (이메일 인증을 꺼놔서 가입하면 바로 로그인돼요)
export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

// 로그인
export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

// 로그아웃
export async function signOut() {
  return supabase.auth.signOut();
}
