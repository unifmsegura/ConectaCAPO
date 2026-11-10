// src/views/SettingsView.tsx
import React, { useEffect, useState } from "react";
import { fetchTeam, TeamMember } from "../data/admin";

export function SettingsView() {
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await fetchTeam();
                if (!cancelled) {
                    setTeam(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar a equipe.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="p-8 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Configurações da Plataforma</h1>
                <p className="text-sm text-gray-500">Parâmetros do sistema, pagamentos e equipe.</p>
            </div>

            {/* Pagamento */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">🔑 Integração Pix / Gateway</h3>
                <p className="text-sm text-gray-500">
                    A chave Pix da ONG é configurada diretamente no provedor de pagamento (gestão do Pix e das
                    cobranças). Por segurança, nenhuma credencial do provedor é armazenada nesta plataforma —
                    o site usa apenas as chaves públicas do Supabase.
                </p>
            </div>

            {/* Acessibilidade */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2">♿ Acessibilidade</h3>
                <p className="text-sm text-gray-500">
                    As preferências de alto contraste e fonte ampliada ficam disponíveis na barra lateral do painel e são
                    aplicadas a toda a administração automaticamente.
                </p>
            </div>

            {/* Equipe */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-2 mb-4">👥 Equipe com Acesso</h3>

                {loading && <p className="text-sm font-semibold text-gray-500">Carregando equipe...</p>}
                {error && <p className="text-sm font-semibold text-red-700">{error}</p>}

                {!loading && !error && team.length === 0 && (
                    <p className="text-sm text-gray-500">Nenhuma pessoa da equipe cadastrada ainda.</p>
                )}

                {!loading && !error && (
                    <div className="space-y-3">
                        {team.map((m) => (
                            <div key={m.email} className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-semibold text-gray-800">{m.name}</p>
                                    <p className="text-xs text-gray-600">{m.email}</p>
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${m.role === "Admin" ? "bg-sky-100 text-sky-700" : "bg-gray-100 text-gray-500"
                                        }`}
                                >
                                    {m.role}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
