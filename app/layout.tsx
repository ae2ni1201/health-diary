import type { Metadata } from "next";
import "./globals.css";

// 브라우저 탭에 보이는 제목과 설명
export const metadata: Metadata = {
  title: "건강일기 — 통증 기록",
  description:
    "혼자 사는 어르신을 위한 통증 기록 일지. 아픈 곳을 날짜별로 쉽게 기록하고 병원 진료에 활용하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
