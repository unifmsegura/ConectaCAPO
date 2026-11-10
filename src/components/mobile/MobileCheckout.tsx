// src/components/mobile/MobileCheckout.tsx
import React, { useState } from "react";
import { ChargeResult, createCharge } from "../../data/api";

interface MobileCheckoutProps {
  campaignId: string;
  campaignTitle: string;
  initialAmount?: number;
  subscriptionNotice?: boolean;
  onPixGenerated: (result: ChargeResult, amount: number) => void;
  onCancel: () => void;
}

const PRESETS = [20, 50, 100];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function MobileCheckout({
  campaignId,
  campaignTitle,
  initialAmount,
  subscriptionNotice = false,
  onPixGenerated,
  onCancel,
}: MobileCheckoutProps) {
  const [amount, setAmount] = useState<number>(initialAmount ?? 20);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleGeneratePix() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Informe seu e-mail para receber o comprovante.");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError("E-mail inválido. Verifique e tente novamente.");
      return;
    }
    setEmailError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      const result = await createCharge({
        campaignId,
        amount,
        name: anonymous ? "" : name.trim(),
        email: trimmedEmail,
        anonymous,
      });
      onPixGenerated(result, amount);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erro ao gerar o Pix. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden">
      {/* Cabeçalho com Botão Voltar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 text-sm font-bold text-[#124E66] hover:text-[#0d3b4e] transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Voltar
        </button>
        <span className="text-sm font-extrabold text-gray-800 font-poppins">Doação via Pix</span>
        <div className="w-12" /> {/* Espaçador visual */}
      </div>

      {/* Conteúdo do Checkout (Valores + Dados) */}
      <div className="p-5 flex-1 space-y-4 overflow-y-auto">
        <div>
          <span className="text-xs font-semibold text-gray-600 uppercase">Campanha</span>
          <h2 className="text-lg font-bold text-gray-900 font-poppins">{campaignTitle}</h2>
          {subscriptionNotice && (
            <p className="mt-1 text-xs font-semibold text-emerald-600">Assinatura mensal — cobrança do primeiro mês</p>
          )}
        </div>

        {/* Seleção de valores com tipagem explicita (val: number) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-600 uppercase">Escolha o Valor</label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((val: number) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${amount === val
                    ? "bg-[#124E66] text-white border-[#124E66]"
                    : "bg-gray-50 text-gray-700 border-gray-200"
                  }`}
              >
                R$ {val}
              </button>
            ))}
          </div>
        </div>

        {/* Dados da doadora */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-600 uppercase">Seus dados</label>

          <div>
            <label htmlFor="donor-name" className="block text-xs font-semibold text-gray-600 mb-1">
              Nome (opcional)
            </label>
            <input
              id="donor-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer aparecer no mural"
              disabled={anonymous}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>

          <div>
            <label htmlFor="donor-email" className="block text-xs font-semibold text-gray-600 mb-1">
              E-mail *
            </label>
            <input
              id="donor-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              placeholder="voce@email.com"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand"
            />
            {emailError && <p className="mt-1 text-xs font-semibold text-red-600">{emailError}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="w-4 h-4 accent-[#124E66]"
            />
            <span className="text-xs font-semibold text-gray-600">Doação anônima no mural</span>
          </label>
        </div>
      </div>

      {/* Rodapé com Botões de Ação */}
      <div className="p-4 border-t border-gray-100 space-y-2">
        {formError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center">
            <p className="text-xs font-semibold text-red-700">{formError}</p>
            <button
              type="button"
              onClick={handleGeneratePix}
              className="mt-2 px-4 py-1.5 bg-brand text-white text-xs font-bold rounded-lg"
            >
              Tentar de novo
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleGeneratePix}
          disabled={submitting}
          className="w-full py-3.5 bg-[#124E66] text-white font-bold rounded-xl text-sm shadow-md hover:bg-[#0d3b4e] transition-colors disabled:opacity-60"
        >
          {submitting ? "Gerando Pix..." : `Gerar Chave Pix de R$ ${amount},00`}
        </button>

        {/* Botão Secundário de Cancelar */}
        <button
          type="button"
          onClick={onCancel}
          className="w-full py-2.5 text-xs font-bold text-gray-600 hover:text-gray-700 transition-colors"
        >
          Cancelar e voltar para o início
        </button>
      </div>
    </div>
  );
}
