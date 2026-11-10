// src/components/admin/modals/NewCampaignModal.tsx
import React, { useState } from "react";
import { PALETTE as P } from "../../../constants/theme";
import { createCampaign } from "../../../data/admin";

interface ModalProps {
    onClose: () => void;
    onPublish?: (campaign: { title: string; goal: number; description: string }) => void;
}

export function NewCampaignModal({ onClose, onPublish }: ModalProps) {
    const [title, setTitle] = useState("");
    const [goal, setGoal] = useState("");
    const [desc, setDesc] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    async function handlePublish() {
        const parsedGoal = Number(goal);
        if (!title.trim()) {
            setError("Informe o título da campanha.");
            return;
        }
        if (!goal.trim() || Number.isNaN(parsedGoal) || parsedGoal <= 0) {
            setError("Informe uma meta orçamentária positiva.");
            return;
        }
        setError("");
        setSaving(true);
        try {
            const created = await createCampaign({ title: title.trim(), goal: parsedGoal, description: desc.trim() });
            onPublish?.({ title: title.trim(), goal: parsedGoal, description: desc.trim() });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao criar a campanha.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg border border-gray-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-extrabold text-gray-900 font-poppins">Nova Campanha</h2>
                        <p className="text-xs text-gray-500">Publique uma nova meta de arrecadação</p>
                    </div>
                    <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl bg-sky-50 text-brand font-bold">✕</button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Título da Campanha</label>
                        <input
                          type="text"
                          placeholder="Ex: Combustível para a Van"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Meta Orçamentária (R$)</label>
                        <input
                          type="number"
                          placeholder="1500"
                          value={goal}
                          onChange={(e) => setGoal(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand outline-none text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Descrição</label>
                        <textarea
                          rows={3}
                          placeholder="Descreva para onde os recursos serão destinados..."
                          value={desc}
                          onChange={(e) => setDesc(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-brand outline-none text-sm resize-none"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-300 text-sm font-bold text-gray-600">Cancelar</button>
                    <button type="button" onClick={handlePublish} disabled={saving} className="flex-1 py-3 rounded-xl bg-brand text-white font-bold text-sm shadow-md disabled:opacity-60">{saving ? "Publicando..." : "Publicar Meta"}</button>
                </div>
                {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
            </div>
        </div>
    );
}