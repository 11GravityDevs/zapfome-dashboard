"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Spinner } from "@/components/spinner";
import { useWhatsappOnboarding } from "./use-whatsapp-onboarding";

export default function ConexaoPage() {
  const { state, error, isInitialLoading, retry } = useWhatsappOnboarding();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-font-primary">Conexão</h1>
        <p className="mt-1 text-sm text-font-secondary">
          Conecte o WhatsApp do seu restaurante para começar a receber pedidos pelo bot.
        </p>
      </div>

      <Card padding="xl" className="mx-auto w-full max-w-md">
        {error?.permanent ? (
          <PermanentErrorView message={error.message} onRetry={retry} />
        ) : isInitialLoading ? (
          <InitialLoadingView />
        ) : state?.status === "connected" ? (
          <ConnectedView />
        ) : state?.status === "qr" ? (
          <QrCodeView qrValue={state.code} pairingCode={state.pairing_code} />
        ) : (
          <InitialLoadingView />
        )}
      </Card>
    </div>
  );
}

function InitialLoadingView() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Spinner size="lg" />
      <p className="text-sm text-font-secondary">Preparando conexão...</p>
    </div>
  );
}

function ConnectedView() {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="bg-accent-green-light flex size-14 items-center justify-center rounded-full">
        <CircleCheck className="text-accent-green" size={32} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-font-primary">WhatsApp conectado</h2>
      <p className="text-sm text-font-secondary">
        Tudo pronto. Você já pode receber pedidos pelo bot.
      </p>
    </div>
  );
}

function QrCodeView({
  qrValue,
  pairingCode,
}: {
  qrValue: string;
  pairingCode: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-font-primary">Escaneie o QR Code</h2>
        <p className="mt-1 text-sm text-font-secondary">
          Use a câmera do WhatsApp do seu celular para parear.
        </p>
      </div>

      <ol className="flex flex-col gap-2 text-sm text-font-primary">
        <li>
          1. Abra o <strong>WhatsApp</strong> no seu celular.
        </li>
        <li>
          2. Toque em <strong>Configurações</strong> e depois em{" "}
          <strong>Aparelhos conectados</strong>.
        </li>
        <li>
          3. Toque em <strong>Conectar um aparelho</strong> e escaneie o código abaixo.
        </li>
      </ol>

      <div className="flex justify-center">
        <QRCodeSVG
          value={qrValue}
          size={256}
          level="M"
          bgColor="#ffffff"
          fgColor="#000000"
          aria-label="QR Code para conectar o WhatsApp"
          className="size-64 rounded-md border border-border bg-white p-(--spacing-sm)"
        />
      </div>

      {pairingCode && (
        <div className="flex flex-col items-center gap-1">
          <p className="text-xs text-font-secondary">Ou digite no WhatsApp:</p>
          <code className="bg-bg-hover rounded-md px-3 py-1 font-mono text-base font-semibold text-font-primary tracking-widest">
            {pairingCode}
          </code>
        </div>
      )}
    </div>
  );
}

function PermanentErrorView({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="bg-error-50 flex size-14 items-center justify-center rounded-full">
        <CircleAlert className="text-error-500" size={32} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-font-primary">Não foi possível conectar</h2>
      <p className="text-sm text-font-secondary">{message}</p>
      <Button variant="primary" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
