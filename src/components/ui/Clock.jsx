"use client";

import { useEffect, useState } from "react";

const fmt = () =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

// Studio local time, Mumbai.
export default function Clock({ className = "", prefix = "MUM" }) {
  const [time, setTime] = useState("--:--:--");

  useEffect(() => {
    const update = () => setTime(fmt());
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className={className} suppressHydrationWarning>
      {prefix} <span className="tnum">{time}</span> IST
    </span>
  );
}
