"use client";

import { createContext, useContext } from "react";
import type { ActiveSession } from "@/lib/workspace";

const Ctx = createContext<ActiveSession | null>(null);

export function DashboardShellProvider({
  session,
  children,
}: {
  session: ActiveSession;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={session}>{children}</Ctx.Provider>;
}

export function useActiveSession(): ActiveSession {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error(
      "useActiveSession must be used inside a DashboardShellProvider"
    );
  }
  return v;
}
