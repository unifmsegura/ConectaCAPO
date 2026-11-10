// src/views/CampaignsView.tsx
import React, { useState } from "react";
import { Campaign } from "../types";
import { useCampaigns } from "../data/campaigns";
import { createCampaign, updateCampaign, setCampaignActive } from "../data/admin";
import { NewCampaignModal } from "../components/admin/modals/NewCampaignModal";
import { MuralModal } from "../components/admin/modals/MuralModal";

function statusOf(c: Campaign) {
  if (c.raised >= c.goal) return { label: "Concluída", cls: "bg-emerald-100 text-emerald-700" };
  if (c.priority) return { label: "Urgente", cls: "bg-amber-100 text-amber-700" };
  return { label: "Ativa", cls: "bg-sky-100 text-sky-700" };
}

export function CampaignsView() {
  const { campaigns, reload } = useCampaigns();
  const [showNewModal, setShowNewModal] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [muralFor, setMuralFor] = useState<Campaign | null>(null);

  async function saveEdits() {
    if (!editing) return;
    const parsed = Number(newGoal);
    if (Number.isNaN(parsed) || parsed <= 0) {
      setError("Informe uma meta positiva.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateCampaign(editing.id, {
        title: editTitle.trim(),
        description: editDesc.trim(),
        goal: parsed,
      });
      setEditing(null);
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar a campanha.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(c: Campaign) {
    setSaving(true);
    setError(null);
    try {
      await setCampaignActive(c.id, false); // pausa
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao pausar a campanha.");
    } finally {
      setSaving(false);
    }
  }

  const brl = (n: number) => n.toLocaleString("pt-BR");

  return (
    <div className="p-8 space-y-6">
      {/* Cabeçalho com Ação */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 font-poppins">Gerenciar Campanhas</h1>
          <p className="text-sm text-gray-500">Crie, edite e acompanhe as arrecadações ativas da ONG.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="bg-brand text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-brand-dark transition-colors flex items-center gap-2 shadow-md"
        >
          <span>+</span> Nova Campanha
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      )}

      {/* Grid de Cards de Campanhas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c) => {
          const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
          const st = statusOf(c);
          return (
            <div key={c.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${st.cls}`}>{st.label}</span>
                <h3 className="text-lg font-bold text-gray-800 mt-3">{c.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{c.description}</p>

                {/* Barra de Progresso */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>R$ {brl(c.raised)} arrecadados</span>
                    <span className="text-brand">{pct}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`Progresso de ${c.title}`}>
                    <div
                      className={`h-full rounded-full transition-all duration-700 progress-fill ${c.raised >= c.goal ? "bg-emerald-500" : "bg-brand"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(c);
                    setEditTitle(c.title);
                    setEditDesc(c.description);
                    setNewGoal(String(c.goal));
                  }}
                  className="flex-1 text-xs font-semibold py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => toggleActive(c)}
                  disabled={saving}
                  className="flex-1 text-xs font-semibold py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 disabled:opacity-60"
                >
                  Pausar
                </button>
                <button
                  type="button"
                  onClick={() => setMuralFor(c)}
                  className="flex-1 text-xs font-semibold py-2 bg-sky-50 text-brand rounded-lg hover:bg-sky-100"
                >
                  Mural de Fotos
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Edição */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold text-gray-900">Editar - {editing.title}</h3>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Título</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Descrição</label>
              <textarea
                rows={3}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Nova meta (R$)</label>
              <input
                type="number"
                min={1}
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="w-full p-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(null)} className="flex-1 py-2 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600">Cancelar</button>
              <button type="button" onClick={saveEdits} disabled={saving} className="flex-1 py-2 rounded-xl bg-brand text-white text-sm font-semibold disabled:opacity-60">
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Campanha reutilizado do dashboard */}
      {showNewModal && (
        <NewCampaignModal onClose={() => setShowNewModal(false)} />
      )}

      {/* Modal do Mural de Fotos */}
      {muralFor && (
        <MuralModal
          campaignTitle={muralFor.title}
          onClose={() => setMuralFor(null)}
        />
      )}
    </div>
  );
}
