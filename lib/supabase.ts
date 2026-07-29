// lib/supabase.ts
// Supabase(인터넷 저장소)에 연결하는 코드입니다.
// 주소와 연결 키(anon key)는 비밀 설정 파일(.env.local)에서 불러옵니다.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// 앱 전체에서 함께 쓰는 Supabase 연결 도구
export const supabase = createClient(supabaseUrl, supabaseKey);
