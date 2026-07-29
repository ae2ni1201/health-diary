"use client";

import { useState } from "react";

// 병원 위치 지도 (구글 지도 삽입 + 내 위치 근처 병원)
export default function HospitalMap() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "denied">("idle");

  function locate() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("denied");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("idle");
      },
      () => setStatus("denied"),
      { timeout: 10000 }
    );
  }

  const q = encodeURIComponent("병원");
  const src = coords
    ? `https://maps.google.com/maps?q=${q}&ll=${coords.lat},${coords.lng}&z=15&output=embed`
    : `https://maps.google.com/maps?q=${q}&z=13&output=embed`;
  const link = coords
    ? `https://www.google.com/maps/search/병원/@${coords.lat},${coords.lng},15z`
    : `https://www.google.com/maps/search/병원`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-green-200 bg-white p-4">
        <p className="text-2xl font-bold">🗺️ 병원 위치</p>
        <p className="mt-1 text-base text-gray-600">아래 지도에서 가까운 병원을 찾아보세요.</p>
        <button
          type="button"
          onClick={locate}
          className="mt-3 w-full rounded-2xl bg-green-600 py-4 text-xl font-bold text-white hover:bg-green-700"
        >
          📍 내 위치 근처 병원 보기
        </button>
        {status === "loading" && (
          <p className="mt-2 text-center text-base text-gray-500">위치를 찾는 중...</p>
        )}
        {status === "denied" && (
          <p className="mt-2 text-center text-base text-gray-500">
            위치를 못 찾았어요. 아래 지도로 직접 찾아보세요.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border-2 border-green-200 bg-white">
        <iframe key={src} src={src} title="병원 지도" className="h-[420px] w-full border-0" loading="lazy" />
      </div>

      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl border-2 border-green-600 py-4 text-center text-xl font-bold text-green-700 hover:bg-green-50"
      >
        구글 지도에서 더 크게 보기 →
      </a>
    </div>
  );
}
