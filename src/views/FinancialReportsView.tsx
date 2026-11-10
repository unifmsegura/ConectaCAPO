// src/views/FinancialReportsView.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchExpenses, createExpense, Expense, fetchAdminResumo, fetchAdminTransactions } from "../data/admin";

export function FinancialReportsView() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [totalMes, setTotalMes] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Formulário de nova despesa
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const [exp, resumo, transacoes] = await Promise.all([
                    fetchExpenses(),
                    fetchAdminResumo(),
                    fetchAdminTransactions(500),
                ]);
                if (cancelled) return;
                setExpenses(exp);
                setTotalMes(resumo.totalMes);
                setConfirmedCount(transacoes.filter((t) => t.status === "Aprovado").length);
                setError(null);
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar os relatórios.");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    // Despesas do mês atual 
    const currentMonth = new Date().toISOString().slice(0, 8) + "01";
    const monthExpenses = useMemo(
        () => expenses.filter((e) => e.month === currentMonth),
        [expenses, currentMonth]
    );

    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalMes - totalExpenses;
    const avgTicket = confirmedCount > 0 ? totalMes / confirmedCount : 0;
    const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    async function handleAddExpense() {
        const parsed = Number(amount);
        if (!category.trim()) {
            setFormError("Informe a categoria da despesa.");
            return;
        }
        if (Number.isNaN(parsed) || parsed <= 0) {
            setFormError("Informe um valor positivo.");
            return;
        }
        setFormError(null);
        setSaving(true);
        try {
            await createExpense(category.trim(), parsed, note.trim() || undefined);
            const exp = await fetchExpenses();
            setExpenses(exp);
            setCategory("");
            setAmount("");
            setNote("");
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Erro ao registrar a despesa.");
        } finally {
            setSaving(false);
        }
    }

    const summary = [
        { label: "Total Bruto (mês)", value: brl(totalMes), cls: "text-brand" },
        { label: "Despesas do Mês", value: brl(totalExpenses), cls: "text-rose-600" },
        { label: "Saldo Operacional", value: brl(balance), cls: "text-emerald-600" },
        { label: "Ticket Médio", value: confirmedCount > 0 ? brl(avgTicket) : "—", cls: "text-gray-800" },
    ];

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Relatórios Financeiros</h1>
                    <p className="text-sm text-gray-500">Transparência e consolidação das entradas e despesas.</p>
                </div>
            </div>

            {loading && (
                <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                    <p className="text-sm font-semibold text-gray-500">Carregando relatórios...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Resumo Consolidado */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {summary.map((s) => (
                            <div key={s.label} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                                <p className="text-xs font-bold text-gray-600 uppercase">{s.label}</p>
                                <p className={`text-2xl font-black mt-1 ${s.cls}`}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Formulário de Nova Despesa */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Registrar Despesa do Mês</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input
                                type="text"
                                placeholder="Categoria (ex.: Combustível)"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                            <input
                                type="number"
                                min={1}
                                step="0.01"
                                placeholder="Valor (R$)"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                            <input
                                type="text"
                                placeholder="Observação (opcional)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                            />
                            <button
                                type="button"
                                onClick={handleAddExpense}
                                disabled={saving}
                                className="py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:bg-brand-dark transition-colors disabled:opacity-60"
                            >
                                {saving ? "Salvando..." : "Registrar"}
                            </button>
                        </div>
                        {formError && <p className="mt-2 text-xs font-semibold text-red-600">{formError}</p>}
                    </div>

                    {/* Detalhamento de Despesas */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-base font-bold text-gray-800 mb-4">Despesas Operacionais do Mês</h3>
                        {monthExpenses.length === 0 ? (
                            <p className="text-sm text-gray-500 py-4 text-center">
                                Nenhuma despesa registrada neste mês.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {monthExpenses.map((e) => {
                                    const pct = totalExpenses > 0 ? Math.round((e.amount / totalExpenses) * 100) : 0;
                                    return (
                                        <div key={e.id}>
                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                <span className="text-gray-700">{e.category}{e.note ? ` · ${e.note}` : ""}</span>
                                                <span className="text-gray-500">{brl(e.amount)} · {pct}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Despesa: ${e.category}`}>
                                                <div className="h-full bg-rose-400 rounded-full progress-fill" style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex justify-between mt-5 pt-4 border-t border-gray-100 text-sm font-bold">
                            <span className="text-gray-700">Total</span>
                            <span className="text-rose-600">{brl(totalExpenses)}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
