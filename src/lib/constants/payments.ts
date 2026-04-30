export const MP_CALLBACK_REASON_LABELS: Record<string, string> = {
  access_denied: "Autorização cancelada no Mercado Pago.",
  invalid_state: "Sessão de autorização expirou. Tente novamente.",
  invalid_query: "Resposta inválida do Mercado Pago. Tente novamente.",
  missing_code_or_state: "Resposta inválida do Mercado Pago. Tente novamente.",
  persistence_failed: "Não conseguimos salvar a conexão. Tente novamente.",
  token_exchange_failed: "Falha ao validar autorização. Tente novamente.",
  invalid_grant: "Falha ao validar autorização. Tente novamente.",
  invalid_client: "Falha ao validar autorização. Tente novamente.",
  invalid_request: "Falha ao validar autorização. Tente novamente.",
  network_error: "Erro de rede ao confirmar autorização. Tente novamente.",
};

export const MP_CALLBACK_REASON_FALLBACK =
  "Não foi possível conectar ao Mercado Pago. Tente novamente.";

export const MP_LIVE_MODE_LABELS = {
  production: "Produção",
  test: "Teste",
} as const;
