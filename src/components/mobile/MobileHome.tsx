// src/components/mobile/MobileHome.tsx
import React from "react";
import { Campaign } from "../../types";

interface MobileHomeProps {
    campaigns: Campaign[];
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
    onSelect: (campaign: Campaign) => void;
    onRecurring?: () => void;
}

export function MobileHome({ campaigns, loading = false, error = null, onRetry, onSelect, onRecurring }: MobileHomeProps) {
    return (
        <div className="space-y-4 p-4">
            {loading && campaigns.length === 0 && (
                <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-500">Carregando campanhas...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl"
                        >
                            Tentar de novo
                        </button>
                    )}
                </div>
            )}
            {campaigns.map((c) => {
                const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
                return (
                    <article key={c.id} className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                        {c.priority && <span className="text-xs font-bold bg-brand text-white px-2 py-0.5 rounded-md">Meta Prioritária</span>}
                        <h3 className="text-base font-bold text-gray-900 mt-2">{c.title}</h3>
                        <p className="text-xs text-gray-600 my-1">{c.description}</p>

                        <div className="w-full bg-gray-100 rounded-full h-2 my-2" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso de ${c.title}`}>
                            <div className="bg-brand progress-fill h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>

                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-3">
                            <span>R$ {c.raised.toLocaleString("pt-BR")}</span>
                            <span>{pct}%</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelect(c)}
                          className="w-full py-3 bg-brand text-white text-sm font-bold rounded-xl"
                        >
                            {loading ? "Carregando..." : "Doar para esta meta"}
                        </button>
                    </article>
                );
            })}

            {onRecurring && (
                <button
                  type="button"
                  onClick={onRecurring}
                  className="w-full py-3 rounded-xl bg-sky-50 text-brand text-sm font-bold border border-sky-200 hover:bg-sky-100 transition-colors"
                >
                    💲 Quero doar todo mês (Assinatura Recorrente)
                </button>
            )}
        </div>
    );
}