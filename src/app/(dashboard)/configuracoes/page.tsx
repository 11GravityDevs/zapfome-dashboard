"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/button";
import { Spinner } from "@/components/spinner";
import { useTenant } from "@/contexts/tenant-context";
import { useToast } from "@/contexts/toast-context";
import { buildDefaultBusinessHours, type BusinessHourRow } from "@/lib/constants/settings";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryZone, TenantSettings } from "@/lib/types/database";
import { toBusinessHourRows } from "@/lib/utils/settings";
import { BusinessHoursSection } from "./business-hours-section";
import { DeliveryZonesSection } from "./delivery-zones-section";
import { EstablishmentSection, type EstablishmentData } from "./establishment-section";
import {
  GeneralSettingsSection,
  type GeneralSettingsData,
} from "./general-settings-section";

export default function ConfiguracoesPage() {
  const { tenantId } = useTenant();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const [initialSnapshot, setInitialSnapshot] = useState("");

  const isDirty =
    !loading &&
    initialSnapshot !== "" &&
    initialSnapshot !== JSON.stringify({ hours, general, establishment });

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      const supabase = createClient();

      const [tenantRes, settingsRes, hoursRes, zonesRes] = await Promise.all([
        supabase
          .from("tenant")
          .select("name, phone, address, city, greeting_message, closed_message")
          .eq("id", tenantId)
          .single(),
        supabase
          .from("tenant_settings")
          .select("*")
          .eq("tenant_id", tenantId)
          .single(),
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
      ]);

      if (cancelled) return;

      if (tenantRes.error || hoursRes.error || zonesRes.error) {
        showToast({ variant: "error", title: "Não foi possível carregar as configurações." });
        setLoading(false);
        return;
      }

      const t = tenantRes.data;
      const s = settingsRes.data as TenantSettings | null;

      const newEstablishment: EstablishmentData = {
        name: t.name ?? "",
        phone: t.phone ?? "",
        address: t.address ?? "",
        city: t.city ?? "",
      };

      const newGeneral: GeneralSettingsData = {
        minOrderValue: s ? String(s.min_order_value) : "",
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

      setInitialSnapshot(
        JSON.stringify({ hours: newHours, general: newGeneral, establishment: newEstablishment }),
      );

      setEstablishment(newEstablishment);
      setGeneral(newGeneral);
      setHours(newHours);
      setZones(zonesRes.data ?? []);
      setLoading(false);
    }

    fetchData();
    return () => { cancelled = true; };
  }, [tenantId, showToast]);

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();

    const minOrderValue = parseFloat(general.minOrderValue.replace(",", ".")) || 0;
    const deliveryTimeMin = parseInt(general.deliveryTimeMin) || 0;
    const deliveryTimeMax = parseInt(general.deliveryTimeMax) || 0;
    const pickupTimeMin = parseInt(general.pickupTimeMin) || 0;
    const pickupTimeMax = parseInt(general.pickupTimeMax) || 0;

    const [hoursRes, settingsRes, tenantRes] = await Promise.all([
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
    ]);

    setSaving(false);

    if (hoursRes.error || settingsRes.error || tenantRes.error) {
      showToast({ variant: "error", title: "Erro ao salvar configurações." });
      return;
    }

    setInitialSnapshot(JSON.stringify({ hours, general, establishment }));
    showToast({ variant: "success", title: "Configurações salvas com sucesso." });
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-(--spacing-lg)">
      <h1 className="text-xl font-bold text-font-primary">Configurações</h1>

      <BusinessHoursSection hours={hours} onChange={setHours} />

      <DeliveryZonesSection
        tenantId={tenantId}
        zones={zones}
        onZonesChange={setZones}
      />

      <GeneralSettingsSection data={general} onChange={setGeneral} />

      <EstablishmentSection data={establishment} onChange={setEstablishment} />

      <div className="flex justify-end pb-(--spacing-md)">
        <Button
          variant="green"
          size="lg"
          leadingIcon={<Save size={20} />}
          disabled={!isDirty}
          loading={saving}
          onClick={handleSave}
        >
          Salvar alterações
        </Button>
      </div>
    </div>
  );
}
