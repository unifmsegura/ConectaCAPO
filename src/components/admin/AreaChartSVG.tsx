// src/components/admin/AreaChartsSVG.tsx
import React, { useState } from "react";
import { PALETTE as P } from "../../constants/theme";
import { WeeklyPix } from "../../data/admin";

interface AreaChartsSVGProps {
    data: WeeklyPix[];
}

export function AreaChartSVG({ data }: AreaChartsSVGProps) {
    if (data.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-gray-500">
                Ainda não há doações confirmadas nas últimas semanas.
            </p>
        );
    }
    return <AreaChartInner data={data} />;
}

function AreaChartInner({ data }: { data: WeeklyPix[] }) {
    const W = 620;
    const H = 220;
    const padL = 52;
    const padR = 55;  
    const padT = 16;
    const padB = 32;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;

    const values = data.map((d) => d.pix);
    const step = 500;
    const maxVal = Math.max(step, Math.ceil(Math.max(...values) / step) * step);

    function xPos(i: number) {
        return values.length === 1 ? padL + innerW / 2 : padL + (i / (values.length - 1)) * innerW;
    }

    function yPos(v: number) {
        return padT + innerH - (v / maxVal) * innerH;
    }

    const linePts = values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(" ");
    const areaPath =
    `M${xPos(0)},${yPos(values[0])} ` +
    values.slice(1).map((v, i) => `L${xPos(i + 1)},${yPos(v)}`).join(" ") +
    ` L${xPos(values.length - 1)},${padT + innerH} L${xPos(0)},${padT + innerH} Z`;

    const yTicks: number[] = [];
    for (let t = 0; t <= maxVal; t += step) yTicks.push(t);

    const [hovered, setHovered] = useState<number | null>(null);

    function brl(n: number) {
      return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function formatWeek(iso: string) {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    }

    return (
      <div style={{ position: "relative" }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.blue} stopOpacity={0.18} />
              <stop offset="100%" stopColor={P.blue} stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Linhas de grade do eixo Y */}
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={padL} y1={yPos(t)} x2={padL + innerW} y2={yPos(t)}
                stroke={P.border} strokeWidth={1} strokeDasharray="4 4"
             />
             <text
               x={padL - 6} y={yPos(t) + 4}
               textAnchor="end" fontSize={10} fill={P.textMuted} fontFamily="Inter,sans-serif" fontWeight={600}
             >
               {t === 0 ? "R$0" : `R$${t / 1000}k`}
             </text>
            </g>
          ))}

          {/*Preenchimento de área */}
          <path d={areaPath} fill="url(#areaGrad)" />

          {/*Linha do gráfico */}
          <polyline points={linePts} fill="none" stroke={P.blue} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />

          {/* Pontos clicáveis e rótulos X */}
          {values.map((v: number, i: number) => (
            <g key={i}>
              <circle
                cx={xPos(i)} cy={yPos(v)} r={hovered === i ? 7 : 5}
                fill={hovered === i ? P.pink : P.blue}
                stroke="#FFF" strokeWidth={2}
                style={{ cursor: "pointer", transition: "r 0.15s" }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              <text
                x={xPos(i)} 
                y={H - 4}
                textAnchor={i === data.length - 1 ? "end" : "middle"}
                fontSize={10}
                fill={P.textMuted} 
                fontFamily="Inter,sans-serif" 
                fontWeight={600}
              >
                {formatWeek(data[i].week)}
              </text>
            </g>
          ))}

          {/* Tooltip flutuante de valor ao passar o mouse */}
          {hovered !== null && (
            <g>
              <rect
                x={Math.min(xPos(hovered) - 60, W - padR - 130)}
                y={yPos(values[hovered]) - 52}
                width={120} height={44} rx={8}
                fill={P.text}
              />
              <text
                x={Math.min(xPos(hovered), W - padR - 10) - 60 + 60}
                y={yPos(values[hovered]) - 34}
                textAnchor="middle" fontSize={11} fill="rgba(255,255,255,0.6)" fontFamily="Inter,sans-serif" fontWeight={600}
              >
                {formatWeek(data[hovered].week)}
              </text>
              <text
                x={Math.min(xPos(hovered), W - padR - 10) - 60 + 60}
                y={yPos(values[hovered]) - 18}
                textAnchor="middle" fontSize={11} fill="#FFFFFF" fontFamily="Poppins,sans-serif" fontWeight={600}   
              >
                {brl(values[hovered])}     
              </text>
            </g>        
          )}
        </svg>
      </div> 
    );
}