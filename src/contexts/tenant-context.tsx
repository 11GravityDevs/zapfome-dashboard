"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Tenant, TenantUser } from "@/lib/types/database";

export type TenantContextValue = {
  tenant: Tenant;
  tenantId: string;
  tenantUser: TenantUser;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({
  value,
  children,
}: {
  value: TenantContextValue;
  children: ReactNode;
}) {
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used inside a <TenantProvider>.");
  }
  return ctx;
}
