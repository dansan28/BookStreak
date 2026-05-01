"use client";

import { getGreeting } from "@/utils/formatTime";

export function Greeting() {
  return <>{getGreeting()}</>;
}
