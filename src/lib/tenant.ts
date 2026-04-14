import { createClient } from "@/lib/supabase/server";
import type { Tenant, TenantUser } from "@/lib/types/database";

export type TenantResolution =
  | { status: "unauthenticated" }
  | { status: "no_tenant"; userId: string }
  | { status: "inactive"; tenant: Tenant; tenantUser: TenantUser }
  | { status: "ok"; tenant: Tenant; tenantId: string; tenantUser: TenantUser };

export async function getCurrentTenant(): Promise<TenantResolution> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { status: "unauthenticated" };
    }

    const { data: tenantUser, error: tenantUserError } = await supabase
      .from("tenant_user")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle<TenantUser>();

    if (tenantUserError) {
      console.error("[Tenant] tenant_user query error:", tenantUserError);
    }

    if (tenantUserError || !tenantUser) {
      return { status: "no_tenant", userId: user.id };
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenant")
      .select("*")
      .eq("id", tenantUser.tenant_id)
      .maybeSingle<Tenant>();

    if (tenantError) {
      console.error("[Tenant] tenant query error:", tenantError);
    }

    if (tenantError || !tenant) {
      return { status: "no_tenant", userId: user.id };
    }

    if (!tenant.is_active) {
      return { status: "inactive", tenant, tenantUser };
    }

    return { status: "ok", tenant, tenantId: tenant.id, tenantUser };
  } catch (err) {
    console.error("[Tenant] Unexpected error resolving tenant:", err);
    return { status: "unauthenticated" };
  }
}
