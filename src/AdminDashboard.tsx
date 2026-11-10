// src/AdminDashboard.tsx

import React, { useEffect, useState } from "react";
import { PALETTE as P } from "./constants/theme";
import { Sidebar, NavItem } from "./components/admin/Sidebar";
import { MetricCard } from "./components/admin/MetricCard";
import { AreaChartSVG } from "./components/admin/AreaChartSVG";
import { TransactionsTable } from "./components/admin/TransactionsTable";
import { NewCampaignModal } from "./components/admin/modals/NewCampaignModal";
import { CampaignsView } from "./views/CampaignsView";
import { RecurrentDonorsView } from "./views/RecurrentDonorsView";
import { FinancialReportsView } from "./views/FinancialReportsView";
import { SettingsView } from "./views/SettingsView";
import { MuralAdminView } from "./views/MuralAdminView";
import { useCampaigns } from "./data/campaigns";
import { fetchAdminResumo, fetchAdminSemanal, fetchAdminTransactions, AdminResumo, WeeklyPix, AdminTransaction } from "./data/admin";

import { Campaign } from "./types";

// Widget de Destaque da Van
function VanProgressCard({ campaign }: { campaign: Campaign }) {
  const pct = Math.min(100, Math.round((campaign.raised / campaign.goal) * 100));
  const missing = campaign.goal - campaign.raised;
  const brl = (n: number) => n.toLocaleString("pt-BR");
  return (
    <div
      className="flex flex-col rounded-2xl px-6 py-5 flex-1"
      style={{ background: P.card, border: `1.5px solid ${P.border}`, boxShadow: "0 2px 12px rgba(18,78,102,0.06)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: P.amberLight }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={P.amber} strokeWidth="2.5" strokeLinecap="round">
            <rect x="1" y="3" width="15" height="13" rx="2" />
            <path d="M16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full" style={{ background: P.amberLight, border: "1px solid #FDE68A" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: P.amber }}>⚡ Urgente</span>
        </div>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: P.textMuted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {campaign.title}
      </p>
      <p style={{ fontSize: 30, fontWeight: 900, color: P.amber, fontFamily: "Poppins,sans-serif", lineHeight: 1.1 }}>
        {pct}% <span style={{ fontSize: 18, color: P.textMuted, fontWeight: 600 }}>arrecadado</span>
      </p>
      <div className="mt-4">
        <div className="flex justify-between mb-1.5">
          <span style={{ fontSize: 13, fontWeight: 600, color: P.textSub }}>R$ {brl(campaign.raised)} arrecadados</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: P.textMuted }}>Meta: R$ {brl(campaign.goal)}</span>
        </div>
        <div className="h-4 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso de ${campaign.title}`} style={{ background: P.amberLight, border: "1.5px solid #FDE68A" }}>
          <div className="h-full rounded-full transition-all duration-700 progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${P.amber} 0%, #FBBF24 100%)` }} />
        </div>
        <p style={{ fontSize: 13, color: P.amber, fontWeight: 700, marginTop: 6 }}>
          Faltam R$ {brl(missing)} para a meta
        </p>
      </div>
    </div>
  );
}

function DashboardSection() {
  const { campaigns } = useCampaigns();
  const van = campaigns.find((c) => c.priority) ?? campaigns[0];
  const [resumo, setResumo] = useState<AdminResumo | null>(null);
  const [weekly, setWeekly] = useState<WeeklyPix[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [r, w, t] = await Promise.all([
          fetchAdminResumo(),
          fetchAdminSemanal(),
          fetchAdminTransactions(10),
        ]);
        if (cancelled) return;
        setResumo(r);
        setWeekly(w);
        setTransactions(t);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Erro ao carregar o painel.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const weeklyTotal = weekly.reduce((sum, w) => sum + w.pix, 0);

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
        <p className="text-sm font-semibold text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Fila de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          }
          label="Total Arrecadado no Mês"
          value={resumo ? `R$ ${resumo.totalMes.toLocaleString("pt-BR")}` : loading ? "..." : "R$ 0"}
          sub="doações confirmadas neste mês"
          accent={P.green}
          accentBg={P.greenLight}
        />
        <MetricCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          label="Assinantes Recorrentes"
          value={resumo ? String(resumo.assinantesAtivos) : loading ? "..." : "0"}
          sub="assinaturas com status Ativo"
          accent={P.blue}
          accentBg={P.blueLight}
        />
        {van ? <VanProgressCard campaign={van} /> : null}
      </div>

      {/* Gráfico de Doações */}
      <div className="flex gap-5">
        <div className="flex-1 rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-poppins">Doações Pix Recebidas</h2>
              <p className="text-xs text-gray-500">Últimas semanas (doações confirmadas)</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-brand">
              Total: R$ {weeklyTotal.toLocaleString("pt-BR")}
            </span>
          </div>
          <AreaChartSVG data={weekly} />
        </div>
      </div>

      {/* Tabela de Transações */}
      {transactions && <TransactionsTable transactions={transactions} />}
    </>
  );
}

export function AdminDashboard({ role, userName, onSignOut }: { role: "administradora" | "voluntaria"; userName: string; onSignOut?: () => void }) {
  const isAdmin = role === "administradora";
  const [activeNav, setActiveNav] = useState<NavItem>("dashboard");

  // Se a usuária logada perde acesso à seção ativa, volta para a primeira permitida
  useEffect(() => {
    if (!isAdmin && activeNav !== "configuracoes") {
      setActiveNav("configuracoes");
    }
  }, [isAdmin, activeNav]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [largeFont, setLargeFont] = useState(false);
  const { campaigns } = useCampaigns();

  const activeCampaigns = campaigns.filter((c) => c.raised < c.goal).length;

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div
      className={`admin-accessible flex min-h-screen ${highContrast ? "is-high-contrast" : ""} ${largeFont ? "is-large-font" : ""}`}
      style={{ background: P.bg }}
    >
      {/* Sidebar Lateral */}
      <Sidebar
        active={activeNav}
        setActive={setActiveNav}
        highContrast={highContrast}
        largeFont={largeFont}
        onToggleContrast={() => setHighContrast(!highContrast)}
        onToggleFont={() => setLargeFont(!largeFont)}
        isAdmin={isAdmin}
        userName={userName}
        onSignOut={onSignOut}
      />

      {/* Conteúdo Principal do Painel */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Cabeçalho do Painel */}
        <header className="flex items-center justify-between px-8 py-5 sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Olá, {userName || "Equipe"} 👋</h1>
            <p className="text-sm text-gray-500 capitalize">{today}</p>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-xs">🟢</span>
                  <span className="text-sm font-bold text-brand">{activeCampaigns} campanhas ativas</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-brand text-white font-bold hover:bg-brand-dark transition-all shadow-md"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  <span>Nova Campanha</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Corpo do Painel - troca de seções conforme a navegação */}
        <main className="px-8 py-7 space-y-7">
          {activeNav === "dashboard" && <DashboardSection />}
          {activeNav === "campanhas" && <CampaignsView />}
          {activeNav === "recorrentes" && <RecurrentDonorsView />}
          {activeNav === "relatorios" && <FinancialReportsView />}
          {activeNav === "mural" && <MuralAdminView />}
          {activeNav === "configuracoes" && <SettingsView />}
        </main>
      </div>

      {/* Modal de Criação de Nova Campanha */}
      {showNewModal && (
        <NewCampaignModal
          onClose={() => setShowNewModal(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
