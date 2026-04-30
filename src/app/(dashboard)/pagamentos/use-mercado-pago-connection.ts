"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  disconnectMercadoPago,
  getMercadoPagoStatus,
  startMercadoPagoConnect,
  type MercadoPagoStatus,
} from "@/lib/api/mercadopago";
import { useToast } from "@/contexts/toast-context";
import {
  MP_CALLBACK_REASON_FALLBACK,
  MP_CALLBACK_REASON_LABELS,
} from "@/lib/constants/payments";

export type UseMercadoPagoConnectionResult = {
  status: MercadoPagoStatus | null;
  error: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  isDisconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  reload: () => Promise<void>;
};

export function useMercadoPagoConnection(): UseMercadoPagoConnectionResult {
  const router = useRouter();
  const { showToast } = useToast();

  const [status, setStatus] = useState<MercadoPagoStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const callbackHandled = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const next = await getMercadoPagoStatus();
      setStatus(next);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (callbackHandled.current) return;
    callbackHandled.current = true;

    const params = new URLSearchParams(window.location.search);
    const callbackStatus = params.get("status");
    const reason = params.get("reason");

    if (callbackStatus === "connected") {
      showToast({ variant: "success", title: "Mercado Pago conectado." });
      router.replace("/pagamentos");
    } else if (callbackStatus === "error") {
      const message =
        (reason && MP_CALLBACK_REASON_LABELS[reason]) ?? MP_CALLBACK_REASON_FALLBACK;
      showToast({ variant: "error", title: message });
      router.replace("/pagamentos");
    }

    void fetchStatus();
  }, [fetchStatus, router, showToast]);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      await startMercadoPagoConnect();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      showToast({
        variant: "error",
        title: "Não foi possível iniciar a conexão.",
        description: message,
      });
      setIsConnecting(false);
    }
  }, [showToast]);

  const disconnect = useCallback(async () => {
    setIsDisconnecting(true);
    try {
      await disconnectMercadoPago();
      await fetchStatus();
      showToast({ variant: "success", title: "Mercado Pago desconectado." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      showToast({
        variant: "error",
        title: "Não foi possível desconectar.",
        description: message,
      });
    } finally {
      setIsDisconnecting(false);
    }
  }, [fetchStatus, showToast]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchStatus();
  }, [fetchStatus]);

  return {
    status,
    error,
    isLoading,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
    reload,
  };
}
