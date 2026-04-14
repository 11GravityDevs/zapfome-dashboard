import type { EstablishmentData } from "@/app/(dashboard)/configuracoes/establishment-section";

export type OnboardingErrors = {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  menuImages?: string;
};

export function validateOnboardingData(
  establishment: EstablishmentData,
  menuImageUrls: string[],
): OnboardingErrors {
  const errors: OnboardingErrors = {};

  if (!establishment.name.trim()) errors.name = "Preencha o nome do estabelecimento.";
  if (!establishment.phone.trim()) errors.phone = "Preencha o telefone.";
  if (!establishment.address.trim()) errors.address = "Preencha o endereço.";
  if (!establishment.city.trim()) errors.city = "Preencha a cidade.";
  if (menuImageUrls.length === 0) errors.menuImages = "Envie pelo menos 1 imagem do cardápio.";

  return errors;
}

export function hasErrors(errors: OnboardingErrors): boolean {
  return Object.keys(errors).length > 0;
}
