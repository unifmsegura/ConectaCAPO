// src/components/admin/TransactionsTable.tsx
import React from "react";
import { PALETTE as P } from "../../constants/theme";
import { AdminTransaction } from "../../data/admin";

interface TransactionsTableProps {
    transactions: AdminTransaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
    if (transactions.length === 0) {
        return (
            <div className="rounded-2xl p-8 text-center" style={{ background: P.card, border: `1.5px solid ${P.border}` }}>
                <p className="text-sm text-gray-500">Ainda não há doações registradas.</p>
            </div>
        );
    }
    function brl(n: number) {
        return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL"});
    }

    return (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: P.card, border: `1.5px solid ${P.border}`, boxShadow: "0 2px 12px rgba(18,78,102,0.06)" }}
        >
          {/* Cabeçalho da Tabela */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1.5px solid ${P.border}` }}
          >
            <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: P.text, fontFamily: "Poppins,sans-serif"}}>
                    Transações Recentes
                </p>
                <p style={{ fontSize: 13, color: P.textMuted}}>Últimas 10 doações via Pix</p>
            </div>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-[#BED7E2]"
              style={{ background: P.blueLight, border: `1.5px solid ${P.blueMid}` }}
            >
                <svg width= "16" height="16" viewBox="0 0 24 24" fill="none" stroke={P.blue} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span style={{ fontSize: 14, fontWeight: 700, color: P.blue }}>Exportar CSV</span>
            </button>
        </div>

        {/* Tabela de Doações */}
        <table className="w-full">
            <thead>
                <tr style={{ background: P.bg }}>
                    {["Doador (E-mail)", "Valor", "Campanha Destinada", "Data", "Status"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-6 py-3"
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: P.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            borderBottom: `1.5px solid ${P.border}`
                          }}
                        >
                          {h}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {transactions.map((tx, i) => (
                    <tr
                      key={tx.id}
                      style={{ borderBottom: i < transactions.length - 1 ? `1px solid ${P.border}` : "none" }}
                      className="hover:bg-[#EAF3F7]"
                    >
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                  style={{ background: P.blueLight, color: P.blue }}
                                >
                                    {tx.email.charAt(0).toUpperCase()}
                                </div>
                                <span style={{ fontSize: 15, fontWeight: 600, color: P.text }}>{tx.email}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span style={{ fontSize: 16, fontWeight: 800, color: P.green, fontFamily: "Poppins,sans-serif" }}>
                                {brl(tx.value)}
                            </span>
                        </td>
                        <td className="px-6 py-4">
                            <span style={{ fontSize: 16, fontWeight: 500, color: P.textSub }}>{tx.campaign}</span>
                        </td>   
                        <td className="px-6 py-4">
                            <span style={{ fontSize: 16, fontWeight: 500, color: P.textSub }}>{tx.date}</span>
                        </td>      
                        <td className="px-6 py-4">
                            <span
                              className="px-3 py-1.5 rounded-full inline-block"        
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                background: tx.status === "Aprovado" ? P.greenLight : P.amberLight,
                                color: tx.status === "Aprovado" ? P.green : P.amber,
                                border: `1px solid ${tx.status === "Aprovado" ? P.greenMid : "#FDE68A"}`,
                              }}   
                            >
                                {tx.status === "Aprovado" ? "✓ " : "⏳ " }{tx.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
    );
}