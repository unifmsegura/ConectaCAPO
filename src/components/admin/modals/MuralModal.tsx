// src/components/admin/modals/MuralModal.tsx
import React, { useState } from "react";

interface MuralModalProps {
    campaignTitle: string;
    onClose: () => void;
}

export function MuralModal({ campaignTitle, onClose }: MuralModalProps) {
    const [message, setMessage] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-3xl p-8 w-full max-w-lg border border-gray-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-1">Atualizar Mural de Impactos</h2>
                <p className="text-xs text-gray-500 mb-4">{campaignTitle}</p>
                <textarea
                  rows={4}
                  placeholder="Escreva uma mensagem de agradecimento ou atualização para o mural..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border text-sm mb-6 resize-none"
                />               
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl border font-bold text-sm">Cancelar</button>
                    <button type="button" onClick={onClose} className="flex-1 p-3 rounded-xl bg-[#D45D79] text-white font-bold text-sm">Publicar no Mural</button>
                </div>
            </div>
        </div>
    );
}