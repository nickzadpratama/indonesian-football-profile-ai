import { useCallback, useEffect, useRef, useState } from "react";

const TRACK_URL = `${import.meta.env.BASE_URL}${encodeURIComponent("Garuda_Di_Dadaku_-_Netral_(mp3.pm).mp3")}`;

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const desiredPlayingRef = useRef(false);
  const requestRef = useRef(0);
  const [status, setStatus] = useState("paused");
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const start = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    desiredPlayingRef.current = true;
    const request = ++requestRef.current;
    setStatus("starting");
    setAutoplayBlocked(false);

    audio.play().then(
      () => {
        if (request !== requestRef.current) return;
        if (!desiredPlayingRef.current) {
          audio.pause();
          return;
        }
        setStatus("playing");
      },
      (error) => {
        if (request !== requestRef.current) return;
        desiredPlayingRef.current = false;
        setStatus(error.name === "NotAllowedError" ? "paused" : "unavailable");
        setAutoplayBlocked(error.name === "NotAllowedError");
      },
    );
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const request = requestRef;
    start();
    return () => {
      desiredPlayingRef.current = false;
      ++request.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [start]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (desiredPlayingRef.current) {
      desiredPlayingRef.current = false;
      ++requestRef.current;
      audio.pause();
      setStatus("paused");
    } else {
      start();
    }
  };

  const active = status === "playing" || status === "starting";

  return (
    <>
      <audio
        ref={audioRef}
        src={TRACK_URL}
        loop
        preload="auto"
        onError={() => {
          desiredPlayingRef.current = false;
          ++requestRef.current;
          setStatus("unavailable");
        }}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={status === "unavailable"}
        aria-label={active ? "Jeda Garuda di Dadaku" : "Putar Garuda di Dadaku"}
        aria-pressed={active}
        title={
          status === "unavailable"
            ? "Musik tidak tersedia"
            : autoplayBlocked
              ? "Autoplay diblokir; tekan untuk memutar"
              : "Garuda di Dadaku"
        }
        className="rounded-lg bg-white/5 px-2.5 py-1.5 text-xs font-bold text-slate-200 ring-1 ring-white/10 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span aria-hidden="true">{active ? "⏸" : "▶"}</span>{" "}
        <span>{status === "unavailable" ? "Musik tidak tersedia" : "Musik"}</span>
      </button>
    </>
  );
}
