"use client";

import { useEffect, useState } from "react";
import { getMoviesWithFetch } from "../api/movies/get-movies-with-fetch";

export function FetchMoviesStatus() {
  const [status, setStatus] = useState("요청 중이에요.");

  useEffect(() => {
    let active = true;
    void getMoviesWithFetch(1).then(({ results }) => {
      if (!active) return;
      console.log(results);
      setStatus(`인기 영화 ${results.length}편을 받았어요.`);
    }).catch(() => {
      if (active) setStatus("영화 목록 요청에 실패했어요. Network 패널을 확인하세요.");
    });
    return () => { active = false; };
  }, []);

  return <p role="status">{status}</p>;
}
