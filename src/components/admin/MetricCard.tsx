// src/components/admin/MetricCard.tsx
import React from "react";
import { PALETTE as P } from "../../constants/theme";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent: string;
  accentBg: string;
  trend?: { pct: number; dir: "up" | "down" };
}

export function MetricCard({
  icon,
  label,
  value,
  sub,
  accent,
  accentBg,
  trend,
}: MetricCardProps) {
  return (
    <div
      className="flex flex-col justify-between rounded-2xl p-5 flex-1 bg-white border border-gray-200 shadow-sm min-w-0"
      style={{ background: P.card, border: `1.5px solid ${P.border}` }}
    >
      {/* Topo: Ícone e Badge de Porcentagem lado a lado */}
      <div className="flex items-center justify-between w-full mb-3 min-w-0">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: accentBg, color: accent }}
        >
          {icon}
        </div>
        {trend && (
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: trend.dir === "up" ? P.greenLight : P.redLight,
              border: `1px solid ${trend.dir === "up" ? P.greenMid : "#FECACA"}`,
            }}
          >
            <span style={{ fontSize: 12 }}>{trend.dir === "up" ? "↑" : "↓"}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: trend.dir === "up" ? P.green : P.red,
              }}
            >
              {trend.pct}%
            </span>
          </div>
        )}
      </div>

      {/* Conteúdo: Título, Valor Grande e Subtexto isolados */}
      <div className="flex flex-col w-full min-w-0">
        <p
          className="text-xs font-bold uppercase tracking-wider mb-1 truncate"
          style={{ color: P.textSub }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-black font-poppins leading-tight truncate"
          style={{ color: accent }}
        >
          {value}
        </p>
        {sub && (
          <p
            className="text-xs font-medium mt-1 truncate"
            style={{ color: P.textSub }}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}
