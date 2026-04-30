"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/contexts/toast-context";
import {
  fetchOnboarding,
  type OnboardingError,
  type OnboardingResponse,
} from "@/lib/api/connection";
import {
  CONNECTION_BACKOFF_MAX_MS,
  CONNECTION_BACKOFF_MS,
  CONNECTION_POLL_INTERVAL_MS,
  CONNECTION_POLL_JITTER_MS,
} from "@/lib/constants/connection";

export type ConnectionError = { message: string; permanent: boolean };

export type UseWhatsappOnboardingResult = {
  state: OnboardingResponse | null;
  error: ConnectionError | null;
  isInitialLoading: boolean;
  retry: () => void;
};

export function useWhatsappOnboarding(): UseWhatsappOnboardingResult {
  const { showToast } = useToast();
  const [state, setState] = useState<OnboardingResponse | null>(null);
  const [error, setError] = useState<ConnectionError | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const retry = useCallback(() => {
    setError(null);
    setState(null);
    setIsInitialLoading(true);
    setRetryTrigger((value) => value + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let backoff = CONNECTION_BACKOFF_MS;
    let inErrorSequence = false;
    let lastQrFingerprint: string | null = null;
    let fetchId = 0;

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }

    async function tick() {
      if (cancelled) return;
      const id = ++fetchId;

      try {
        const result = await fetchOnboarding();

        if (cancelled || id !== fetchId) return;

        backoff = CONNECTION_BACKOFF_MS;
        inErrorSequence = false;

        if (result.status === "qr") {
          const fingerprint = `${result.code}|${result.pairing_code ?? ""}`;
          if (fingerprint !== lastQrFingerprint) {
            lastQrFingerprint = fingerprint;
            setState(result);
          }
        } else {
          lastQrFingerprint = null;
          setState(result);
        }

        setError(null);
        setIsInitialLoading(false);

        if (result.status === "connected") return;

        const delay =
          CONNECTION_POLL_INTERVAL_MS + Math.random() * CONNECTION_POLL_JITTER_MS;
        clearTimer();
        timer = setTimeout(tick, delay);
      } catch (err) {
        if (cancelled || id !== fetchId) return;

        const status = (err as OnboardingError).status;
        const message = (err as Error).message || "Erro inesperado.";
        const permanent = typeof status === "number" && status >= 400 && status < 500;

        setError({ message, permanent });
        setIsInitialLoading(false);

        if (!inErrorSequence) {
          showToast({
            variant: "error",
            title: permanent
              ? "Não foi possível conectar ao WhatsApp."
              : "Conexão instável. Tentando novamente...",
            description: message,
          });
          inErrorSequence = true;
        }

        if (permanent) return;

        const delay = backoff;
        backoff = Math.min(backoff * 2, CONNECTION_BACKOFF_MAX_MS);
        clearTimer();
        timer = setTimeout(tick, delay);
      }
    }

    function handleVisibilityChange() {
      if (cancelled) return;
      if (document.hidden) {
        clearTimer();
      } else {
        clearTimer();
        tick();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    tick();

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [retryTrigger, showToast]);

  return { state, error, isInitialLoading, retry };
}
