"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { Button } from "@/components/button";
import { useToast } from "@/contexts/toast-context";
import { buildDefaultBusinessHours, type BusinessHourRow } from "@/lib/constants/settings";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryZone } from "@/lib/types/database";
import {
  validateOnboardingData,
  hasErrors,
  type OnboardingErrors,
} from "@/lib/utils/onboarding";
import {
  EstablishmentSection,
  type EstablishmentData,
} from "@/app/(dashboard)/configuracoes/establishment-section";
import {
  GeneralSettingsSection,
  type GeneralSettingsData,
} from "@/app/(dashboard)/configuracoes/general-settings-section";
import { BusinessHoursSection } from "@/app/(dashboard)/configuracoes/business-hours-section";
import { DeliveryZonesSection } from "@/app/(dashboard)/configuracoes/delivery-zones-section";
import { MenuImageSection } from "@/components/menu-image-section";

export function OnboardingForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [establishment, setEstablishment] = useState<EstablishmentData>({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  const [general, setGeneral] = useState<GeneralSettingsData>({
    minOrderValue: "",
    deliveryTimeMin: "",
    deliveryTimeMax: "",
    pickupTimeMin: "",
    pickupTimeMax: "",
    greetingMessage: "",
    closedMessage: "",
  });

  const [hours, setHours] = useState<BusinessHourRow[]>(buildDefaultBusinessHours());
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [menuImageUrls, setMenuImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<OnboardingErrors>({});

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validateOnboardingData(establishment, menuImageUrls);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      requestAnimationFrame(() => {
        const firstError = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [data-field-error]");
        firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setErrors({});

    setSubmitting(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        showToast({ variant: "error", title: "Sessão expirada. Faça login novamente." });
        router.push("/login");
        return;
      }

      const minOrderValue = (Number(general.minOrderValue) || 0) / 100;
      const deliveryTimeMin = Math.max(parseInt(general.deliveryTimeMin) || 1, 1);
      const deliveryTimeMax = Math.max(parseInt(general.deliveryTimeMax) || deliveryTimeMin, deliveryTimeMin);
      const pickupTimeMin = Math.max(parseInt(general.pickupTimeMin) || 1, 1);
      const pickupTimeMax = Math.max(parseInt(general.pickupTimeMax) || pickupTimeMin, pickupTimeMin);

      const { error } = await supabase.rpc("create_tenant", {
        p_user_id: user.id,
        p_name: establishment.name.trim(),
        p_phone: establishment.phone.trim(),
        p_address: establishment.address.trim(),
        p_city: establishment.city.trim(),
        p_greeting_message: general.greetingMessage.trim(),
        p_closed_message: general.closedMessage.trim(),
        p_min_order_value: minOrderValue,
        p_delivery_time_min: deliveryTimeMin,
        p_delivery_time_max: deliveryTimeMax,
        p_pickup_time_min: pickupTimeMin,
        p_pickup_time_max: pickupTimeMax,
        p_business_hours: hours.map((h) => ({
          day_of_week: h.dayOfWeek,
          open_time: h.openTime,
          close_time: h.closeTime,
          is_closed: h.isClosed,
        })),
        p_menu_image_urls: menuImageUrls,
        p_delivery_zones: zones.map((z) => ({
          neighborhood: z.neighborhood,
          city: z.city,
          fee: z.fee,
        })),
      });

      if (error) {
        console.error("[Onboarding] RPC error:", error);
        showToast({ variant: "error", title: "Erro ao criar estabelecimento. Tente novamente." });
        return;
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[Onboarding] Unexpected error:", err);
      showToast({ variant: "error", title: "Erro ao criar estabelecimento. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-(--spacing-lg)">
      <div className="text-center">
        <h1 className="text-xl font-bold text-font-primary">Configure seu estabelecimento</h1>
        <p className="mt-(--spacing-xs) text-sm text-font-secondary">
          Preencha as informações abaixo para começar a receber pedidos.
        </p>
      </div>

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

      <BusinessHoursSection hours={hours} onChange={setHours} />

      <DeliveryZonesSection zones={zones} onZonesChange={setZones} />

      <div className="flex justify-end pb-(--spacing-md)">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          leadingIcon={<Rocket size={20} />}
          loading={submitting}
          disabled={uploading}
        >
          Criar estabelecimento
        </Button>
      </div>
    </form>
  );
}
