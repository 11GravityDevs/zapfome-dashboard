"use client";

import { useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, CreditCard, Link2, Unlink } from "lucide-react";
import { Badge } from "@/components/badge";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Modal } from "@/components/modal";
import { Spinner } from "@/components/spinner";
import { formatDateTime } from "@/lib/format";
import { MP_LIVE_MODE_LABELS } from "@/lib/constants/payments";
import type { MercadoPagoStatus } from "@/lib/api/mercadopago";
import { useMercadoPagoConnection } from "./use-mercado-pago-connection";

export default function PagamentosPage() {
  const {
    status,
    error,
    isLoading,
    isConnecting,
    isDisconnecting,
    connect,
    disconnect,
    reload,
  } = useMercadoPagoConnection();

  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  async function handleConfirmDisconnect() {
    await disconnect();
    setConfirmDisconnect(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-font-primary">Pagamentos</h1>
        <p className="mt-1 text-sm text-font-secondary">
          Conecte seu Mercado Pago para receber via Pix pelo bot.
        </p>
      </div>

      <Card padding="xl" className="mx-auto w-full max-w-md">
        {isLoading ? (
          <LoadingView />
        ) : error ? (
          <ErrorView message={error} onRetry={reload} />
        ) : status?.connected ? (
          <ConnectedView
            status={status}
            onDisconnect={() => setConfirmDisconnect(true)}
          />
        ) : (
          <DisconnectedView onConnect={connect} isConnecting={isConnecting} />
        )}
      </Card>

      <Modal
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        title="Desconectar Mercado Pago"
        size="sm"
        locked={isDisconnecting}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isDisconnecting}
              onClick={() => setConfirmDisconnect(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="red"
              loading={isDisconnecting}
              onClick={handleConfirmDisconnect}
            >
              Desconectar
            </Button>
          </>
        }
      >
        <p className="text-sm text-font-secondary">
          O bot deixará de gerar Pix automaticamente até você reconectar. Deseja continuar?
        </p>
      </Modal>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Spinner size="lg" />
      <p className="text-sm text-font-secondary">Carregando status…</p>
    </div>
  );
}

function DisconnectedView({
  onConnect,
  isConnecting,
}: {
  onConnect: () => void;
  isConnecting: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-bg-secondary">
        <CreditCard className="text-font-secondary" size={32} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-font-primary">
        Mercado Pago não conectado
      </h2>
      <p className="text-sm text-font-secondary">
        Autorize sua conta para o bot poder gerar Pix automaticamente.
      </p>
      <Button
        variant="primary"
        fullWidth
        loading={isConnecting}
        leadingIcon={<Link2 size={20} aria-hidden="true" />}
        onClick={onConnect}
      >
        Conectar Mercado Pago
      </Button>
    </div>
  );
}

function ConnectedView({
  status,
  onDisconnect,
}: {
  status: MercadoPagoStatus;
  onDisconnect: () => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-green-light">
          <CircleCheck className="text-accent-green" size={32} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-font-primary">
          Mercado Pago conectado
        </h2>
      </div>

      <dl className="flex flex-col">
        <DefinitionRow label="Conta" value={status.mp_user_id ?? "—"} valueBold />
        <DefinitionRow
          label="Modo"
          value={
            status.live_mode === null ? (
              "—"
            ) : status.live_mode ? (
              <Badge variant="green">{MP_LIVE_MODE_LABELS.production}</Badge>
            ) : (
              <Badge variant="yellow">{MP_LIVE_MODE_LABELS.test}</Badge>
            )
          }
        />
        <DefinitionRow
          label="Conectado em"
          value={status.connected_at ? formatDateTime(status.connected_at) : "—"}
        />
        <DefinitionRow
          label="Token expira em"
          value={
            status.token_expires_at ? formatDateTime(status.token_expires_at) : "—"
          }
          last
        />
      </dl>

      <Button
        variant="red"
        fullWidth
        leadingIcon={<Unlink size={20} aria-hidden="true" />}
        onClick={onDisconnect}
      >
        Desconectar
      </Button>
    </div>
  );
}

function DefinitionRow({
  label,
  value,
  valueBold,
  last,
}: {
  label: string;
  value: ReactNode;
  valueBold?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        last
          ? "flex items-center justify-between gap-3 py-2"
          : "flex items-center justify-between gap-3 border-b border-border-light py-2"
      }
    >
      <dt className="text-xs font-medium tracking-wider text-font-secondary uppercase">
        {label}
      </dt>
      <dd
        className={
          valueBold ? "text-sm font-medium text-font-primary" : "text-sm text-font-primary"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function ErrorView({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-error-50">
        <CircleAlert className="text-error-500" size={32} aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold text-font-primary">
        Não foi possível carregar
      </h2>
      <p className="text-sm text-font-secondary">{message}</p>
      <Button variant="primary" onClick={onRetry}>
        Tentar novamente
      </Button>
    </div>
  );
}
