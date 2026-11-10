// src/views/RecurrentDonorsView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchSubscriptions, Subscription } from "../data/admin";

const STATUS_STYLES: Record<Subscription["status"], string> = {
    Ativo: "bg-green-100 text-green-700",
    Inadimplente: "bg-amber-100 text-amber-700",
    Cancelado: "bg-gray-100 text-gray-500",
};

export function RecurrentDonorsView() {
    const [subs, setSubs] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const data = await fetchSubscriptions();
                if (!cancelled) {
                    setSubs(data);
                    setError(null);
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar as assinaturas.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const filtered = useMemo(
        () =>
            subs.filter((d) => {
                const q = searchTerm.trim().toLowerCase();
                if (!q) return true;
                return d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
            }),
        [subs, searchTerm]
    );

    const active = subs.filter((d) => d.status === "Ativo");
    const activeCount = active.length;
    const monthlyTotal = active.reduce((sum, d) => sum + d.plan, 0);
    const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Doadores Recorrentes</h1>
                    <p className="text-sm text-gray-500">
                        Gestão dos {activeCount} assinantes mensais - {brl(monthlyTotal)}/mês garantidos.
                    </p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar doador por nome ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-sm w-72 focus:outline-none focus:ring-2 focus:ring-brand"
                />
            </div>

            {loading && (
                <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-500">Carregando assinaturas...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase text-xs">
                            <tr>
                                <th className="p-4">Doador</th>
                                <th className="p-4">Plano Mensal</th>
                                <th className="p-4">Próxima Cobrança</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map((d) => (
                                <tr key={d.id} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium text-gray-900">
                                        {d.name}
                                        <br />
                                        <span className="text-xs text-gray-600 font-normal">{d.email}</span>
                                    </td>
                                    <td className="p-4 font-bold text-brand">{brl(d.plan)} / mês</td>
                                    <td className="p-4 text-gray-600">{d.nextCharge}</td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[d.status]}`}>
                                            {d.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button type="button" className="text-gray-400 hover:text-gray-600 px-2" aria-label={`Ações de ${d.name}`}>
                                            •••
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-600 text-sm">
                                        {subs.length === 0
                                            ? "Ainda não há assinaturas recorrentes."
                                            : `Nenhum doador encontrado para "${searchTerm}".`}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
