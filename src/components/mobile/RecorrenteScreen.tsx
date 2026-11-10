// src/components/mobile/RecorrenteScreen.tsx
import React from "react";

interface Plan {
    label: string;
    amount: number;
    perks: string[];
    highlight: boolean;
}

const PLANS: Plan[] = [
    {
        label: "Apoiadora Diva",
        amount: 20,
        perks: ["Mural de impacto exclusivo", "Comprovante mensal automático", "Badge de apoiadora no app"],
        highlight: false,
    },
    {
        label: "Guardiã das Divas",
        amount: 50,
        perks: ["Todos os benefícios do plano Diva", "Agradecimento em vídeo da equipe", "Acesso antecipado a fotos do Mural"],
        highlight: true,
    },
    {
        label: "Anjo das Divas",
        amount: 100,
        perks: ["Todos do plano Guardiã", "Relatório de transparência completo", "Menção de agradecimento especial"],
        highlight: false,
    },
];

interface RecorrenteScreenProps {
    onSubscribe: (amount: number) => void;
}

export function RecorrenteScreen({ onSubscribe }: RecorrenteScreenProps) {
    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-[#F8F9FA]">
            {/* Cabeçalho */}
            <div className="px-5 py-4 bg-white border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ONG Eliane Martins
                </p>
                <p className="text-xl font-extrabold text-brand font-poppins">
                    Apoio Recorrente 💲
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                    Contribua mensalmente e garanta o transporte das nossas pacientes
                </p>
            </div>

            {/* Lista de Planos Mensais */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
                {PLANS.map((plan) => (
                    <div
                        key={plan.label}
                        className={`rounded-3xl overflow-hidden border transition-all ${
                            plan.highlight
                                ? "bg-gradient-to-br from-brand to-brand-dark text-white border-brand shadow-lg"
                                : "bg-white border-gray-200 text-gray-900 shadow-sm"
                        }`}
                    >
                        {plan.highlight && (
                            <div className="bg-[#B83B5E] text-white text-center py-1 text-xs font-bold tracking-widest uppercase">
                                ⭐ Mais Popular
                            </div>
                        )}
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className={`text-base font-extrabold font-poppins ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                                        {plan.label}
                                    </h3>
                                    <p className={`text-xs ${plan.highlight ? "text-blue-200" : "text-gray-600"}`}>
                                        cobrança mensal via Pix
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className={`text-2xl font-black font-poppins ${plan.highlight ? "text-white" : "text-brand"}`}>
                                        R$ {plan.amount}
                                    </span>
                                    <span className="text-xs font-medium block">/mês</span>
                                </div>
                            </div>

                            <ul className="space-y-2 mb-5">
                                {plan.perks.map((perk) => (
                                    <li key={perk} className="flex items-center gap-2 text-xs">
                                        <span className={plan.highlight ? "text-pink-300" : "text-brand"}>✓</span>
                                        <span className={plan.highlight ? "text-blue-100" : "text-gray-600"}>{perk}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                type="button"
                                onClick={() => onSubscribe(plan.amount)}
                                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                                    plan.highlight
                                        ? "bg-[#B83B5E] text-white hover:bg-[#9C3B56] shadow-md"
                                        : "bg-sky-50 text-brand hover:bg-sky-100"
                                }`}
                            >
                                Assinar R$ {plan.amount}/mês
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
