// src/components/mobile/MobilePix.tsx
import React, { useEffect, useRef, useState } from "react";
import { ChargeResult, DonationStatus, confirmDemoDonation, getDonationStatus } from "../../data/api";

interface MobilePixProps {
  charge: ChargeResult;
  amount: number;
  onConfirm: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
}

const POLL_INTERVAL_MS = 4000;

export function MobilePix({ charge, amount, onConfirm, onCancel, onRegenerate }: MobilePixProps) {
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  async function handleSimulate() {
    setSimulating(true);
    setSimError(null);
    try {
      await confirmDemoDonation(charge.donationId);
      // O polling de getDonationStatus detecta "confirmed" e leva à tela de sucesso
    } catch (err) {
      setSimError(err instanceof Error ? err.message : "Erro ao simular o pagamento.");
    } finally {
      setSimulating(false);
    }
  }

  const [expiresAtMs] = useState(() => new Date(charge.expiresAt).getTime());
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000))
  );

  const confirmedRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(Math.max(0, Math.floor((expiresAtMs - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAtMs]);

  // Consulta o status da doação até vir "confirmed"
  useEffect(() => {
    if (secondsLeft <= 0 || confirmedRef.current) return;

    let cancelled = false;

    async function poll() {
      try {
        const status: DonationStatus = await getDonationStatus(charge.donationId);
        if (cancelled || confirmedRef.current) return;
        setStatusError(null);
        if (status === "confirmed") {
          confirmedRef.current = true;
          onConfirm();
        }
      } catch (err) {
        if (!cancelled) {
          setStatusError(
            err instanceof Error ? err.message : "Erro ao verificar o status da doação."
          );
        }
      }
    }

    poll();
    const interval = setInterval(poll, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [charge.donationId, secondsLeft <= 0, onConfirm]);

  const expired = secondsLeft <= 0;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(charge.payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="p-4 bg-white rounded-2xl border border-gray-200 space-y-4 text-center">
      {/* Aviso do modo demonstração + botão de simulação */}
      {charge.demo && (
        <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-xl text-xs font-semibold space-y-2">
          <p>🧪 Modo demonstração: nenhum pagamento real será cobrado.</p>
          {simError && <p className="text-red-600">{simError}</p>}
          <button
            type="button"
            onClick={handleSimulate}
            disabled={simulating}
            className="w-full py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs disabled:opacity-60"
          >
            {simulating ? "Confirmando..." : "Simular pagamento"}
          </button>
        </div>
      )}

      {/* Alerta de Status / Cronômetro */}
      <div
        className={`p-3 rounded-xl text-xs font-semibold ${expired
            ? "bg-red-50 border border-red-200 text-red-700"
            : "bg-amber-50 border border-amber-200 text-amber-800"
          }`}
      >
        {expired ? (
          <>⌛ <strong>Código expirado</strong></>
        ) : (
          <>⏳ Aguardando confirmação do pagamento... Chave expira em: <strong>{formatTime(secondsLeft)} min</strong></>
        )}
      </div>

      {statusError && !expired && (
        <p className="text-xs font-semibold text-red-600">{statusError}</p>
      )}

      <h2 className="text-lg font-bold text-gray-900 font-poppins">Pagamento via Pix</h2>
      <p className="text-2xl font-extrabold text-[#16724C]">
        R$ {amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>

      {/* QR Code real gerado pela cobrança */}
      <div className="flex justify-center my-2">
        {expired ? (
          <button
            type="button"
            onClick={onRegenerate}
            className="w-44 py-3 bg-brand text-white text-sm font-bold rounded-xl"
          >
            Gerar outro código
          </button>
        ) : (
          <img
            src={`data:image/png;base64,${charge.image}`}
            alt="QR code do Pix"
            className="w-44 h-44 rounded-xl border-2 border-brand"
          />
        )}
      </div>

      {/* Copia e Cola */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-600 text-left">Código Copia e Cola:</label>
        <button
          type="button"
          onClick={handleCopy}
          disabled={expired}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all disabled:opacity-50 ${copied ? "bg-[#16724C] text-white border-[#16724C]" : "bg-brand text-white border-brand"
            }`}
        >
          {copied ? "✓ Código Copiado!" : "Copiar Código Pix"}
        </button>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="text-xs text-gray-500 underline mt-2 inline-block"
      >
        Cancelar e Voltar
      </button>
    </div>
  );
}
