// src/components/Footer.tsx
import React from "react";

export function Footer() {
    return (
        <footer className="w-full bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-500 mt-auto">
            <p className="font-bold text-brand">
                CENTRO DE APOIO AO PACIENTE ONCOLÓGICO - ELIANE MARTINS
            </p>
            <p className="mt-1 text-gray-600">
                Doações via Pix · Centro de Apoio ao Paciente Oncológico
            </p>
        </footer>
    );
}