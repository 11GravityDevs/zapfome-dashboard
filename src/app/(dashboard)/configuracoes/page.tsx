"use client";

import { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/button";
import { Spinner } from "@/components/spinner";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { buildDefaultBusinessHours, type BusinessHourRow } from "@/lib/constants/settings";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryZone, TenantSettings } from "@/lib/types/database";
import { toBusinessHourRows } from "@/lib/utils/settings";
import { validateOnboardingData, hasErrors, type OnboardingErrors } from "@/lib/utils/onboarding";
import { MenuImageSection } from "@/components/menu-image-section";
import { BusinessHoursSection } from "./business-hours-section";
import { DeliveryZonesSection } from "./delivery-zones-section";
import { EstablishmentSection, type EstablishmentData } from "./establishment-section";
import { GeneralSettingsSection, type GeneralSettingsData } from "./general-settings-section";

export default function ConfiguracoesPage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<OnboardingErrors>({});

  const [hours, setHours] = useState<BusinessHourRow[]>(buildDefaultBusinessHours());
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [general, setGeneral] = useState<GeneralSettingsData>({
    minOrderValue: "",
    deliveryTimeMin: "",
    deliveryTimeMax: "",
    pickupTimeMin: "",
    pickupTimeMax: "",
    greetingMessage: "",
    closedMessage: "",
  });
  const [establishment, setEstablishment] = useState<EstablishmentData>({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [menuImageUrls, setMenuImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [initialSnapshot, setInitialSnapshot] = useState("");

  const isDirty =
    !loading &&
    initialSnapshot !== "" &&
    initialSnapshot !== JSON.stringify({ hours, general, establishment, menuImageUrls });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const supabase = createClient();

        const [tenantRes, settingsRes, hoursRes, zonesRes, imagesRes] = await Promise.all([
          supabase
            .from("tenant")
            .select("name, phone, address, city, greeting_message, closed_message")
            .eq("id", tenantId)
            .single(),
          supabase.from("tenant_settings").select("*").eq("tenant_id", tenantId).single(),
          supabase
            .from("business_hours")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("day_of_week"),
          supabase
            .from("delivery_zone")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("neighborhood"),
          supabase
            .from("tenant_menu_image")
            .select("image_url, sort_order")
            .eq("tenant_id", tenantId)
            .order("sort_order"),
        ]);

        if (cancelled) return;

        if (tenantRes.error || hoursRes.error || zonesRes.error || imagesRes.error) {
          console.error(
            "[Settings] Fetch error:",
            tenantRes.error ?? hoursRes.error ?? zonesRes.error ?? imagesRes.error,
          );
          showToast({ variant: "error", title: "Não foi possível carregar as configurações." });
          setLoading(false);
          return;
        }

        const t = tenantRes.data;
        const s = settingsRes.data as TenantSettings | null;

        const newEstablishment: EstablishmentData = {
          name: t.name ?? "",
          phone: (t.phone ?? "").replace(/\D/g, ""),
          address: t.address ?? "",
          city: t.city ?? "",
        };

        const newGeneral: GeneralSettingsData = {
          minOrderValue: s ? String(Math.round(s.min_order_value * 100)) : "",
          deliveryTimeMin: s ? String(s.delivery_time_min) : "",
          deliveryTimeMax: s ? String(s.delivery_time_max) : "",
          pickupTimeMin: s ? String(s.pickup_time_min) : "",
          pickupTimeMax: s ? String(s.pickup_time_max) : "",
          greetingMessage: t.greeting_message ?? "",
          closedMessage: t.closed_message ?? "",
        };

        const newHours =
          hoursRes.data && hoursRes.data.length > 0
            ? toBusinessHourRows(hoursRes.data)
            : buildDefaultBusinessHours();

        const newMenuImageUrls = (imagesRes.data ?? []).map((r) => r.image_url);

        setInitialSnapshot(
          JSON.stringify({ hours: newHours, general: newGeneral, establishment: newEstablishment, menuImageUrls: newMenuImageUrls }),
        );

        setEstablishment(newEstablishment);
        setGeneral(newGeneral);
        setHours(newHours);
        setZones(zonesRes.data ?? []);
        setMenuImageUrls(newMenuImageUrls);
        setLoading(false);
      } catch (err) {
        console.error("[Settings] Unexpected error:", err);
        if (!cancelled) {
          showToast({ variant: "error", title: "Não foi possível carregar as configurações." });
          setLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [tenantId, showToast]);

  async function handleSave() {
    const validationErrors = validateOnboardingData(establishment, menuImageUrls);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      requestAnimationFrame(() => {
        const firstError = containerRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [data-field-error]");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const supabase = createClient();

      const minOrderValue = (Number(general.minOrderValue) || 0) / 100;
      const deliveryTimeMin = parseInt(general.deliveryTimeMin) || 0;
      const deliveryTimeMax = Math.max(parseInt(general.deliveryTimeMax) || 0, deliveryTimeMin);
      const pickupTimeMin = parseInt(general.pickupTimeMin) || 0;
      const pickupTimeMax = Math.max(parseInt(general.pickupTimeMax) || 0, pickupTimeMin);

      const deleteImagesRes = await supabase
        .from("tenant_menu_image")
        .delete()
        .eq("tenant_id", tenantId);

      if (deleteImagesRes.error) {
        console.error("[Settings] Delete images error:", deleteImagesRes.error);
        showToast({ variant: "error", title: "Erro ao salvar configurações." });
        return;
      }

      const [hoursRes, settingsRes, tenantRes, imagesRes] = await Promise.all([
        supabase.from("business_hours").upsert(
          hours.map((day) => ({
            tenant_id: tenantId,
            day_of_week: day.dayOfWeek,
            open_time: day.isClosed ? null : day.openTime,
            close_time: day.isClosed ? null : day.closeTime,
            is_closed: day.isClosed,
          })),
          { onConflict: "tenant_id,day_of_week" },
        ),
        supabase.from("tenant_settings").upsert(
          {
            tenant_id: tenantId,
            min_order_value: minOrderValue,
            delivery_time_min: deliveryTimeMin,
            delivery_time_max: deliveryTimeMax,
            pickup_time_min: pickupTimeMin,
            pickup_time_max: pickupTimeMax,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "tenant_id" },
        ),
        supabase
          .from("tenant")
          .update({
            name: establishment.name,
            phone: establishment.phone,
            address: establishment.address,
            city: establishment.city,
            greeting_message: general.greetingMessage,
            closed_message: general.closedMessage,
          })
          .eq("id", tenantId),
        menuImageUrls.length > 0
          ? supabase.from("tenant_menu_image").insert(
              menuImageUrls.map((url, i) => ({
                tenant_id: tenantId,
                image_url: url,
                sort_order: i,
              })),
            )
          : Promise.resolve({ error: null }),
      ]);

      if (hoursRes.error || settingsRes.error || tenantRes.error || imagesRes.error) {
        console.error(
          "[Settings] Save error:",
          hoursRes.error ?? settingsRes.error ?? tenantRes.error ?? imagesRes.error,
        );
        showToast({ variant: "error", title: "Erro ao salvar configurações." });
        return;
      }

      setInitialSnapshot(JSON.stringify({ hours, general, establishment, menuImageUrls }));
      showToast({ variant: "success", title: "Configurações salvas com sucesso." });
    } catch (err) {
      console.error("[Settings] Unexpected save error:", err);
      showToast({ variant: "error", title: "Erro ao salvar configurações." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-(--spacing-lg)">
      <h1 className="text-xl font-bold text-font-primary">Configurações</h1>

      <EstablishmentSection
        data={establishment}
        onChange={(data) => {
          setEstablishment(data);
          setErrors((prev) => ({ ...prev, name: undefined, phone: undefined, address: undefined, city: undefined }));
        }}
        errors={errors}
      />

      <MenuImageSection
        imageUrls={menuImageUrls}
        onChange={(urls) => {
          setMenuImageUrls(urls);
          setErrors((prev) => ({ ...prev, menuImages: undefined }));
        }}
        uploading={uploading}
        onUploadingChange={setUploading}
        error={errors.menuImages}
      />

      <GeneralSettingsSection data={general} onChange={setGeneral} />

      <BusinessHoursSection
        hours={hours}
        onChange={setHours}
        tenantId={tenantId}
        onToggleSaved={(savedHours) => {
          setInitialSnapshot((prev) => {
            const parsed = JSON.parse(prev);
            return JSON.stringify({ ...parsed, hours: savedHours });
          });
        }}
      />

      <DeliveryZonesSection tenantId={tenantId} zones={zones} onZonesChange={setZones} />

      <div className="flex justify-end pb-(--spacing-md)">
        <Button
          variant="primary"
          size="lg"
          leadingIcon={<Save size={20} />}
          disabled={!isDirty || uploading}
          loading={saving}
          onClick={handleSave}
        >
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
