// src/components/admin/LoginScreen.tsx
import React, { useState } from "react";
import { signIn } from "../../data/auth";
import { PALETTE as P } from "../../constants/theme";

export function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await signIn(email.trim(), password);
            // A sessão dispara onAuthStateChange e o App troca de tela
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao entrar. Tente novamente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: P.bg }}
        >
            <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
                {/* Logotipo */}
                <div className="flex items-center gap-3 mb-6 justify-center">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
                        style={{ background: P.blue, color: "#FFFFFF", fontFamily: "Poppins,sans-serif" }}
                    >
                        EM
                    </div>
                    <div>
                        <p className="font-extrabold text-gray-900 font-poppins" style={{ fontSize: 18 }}>
                            Eliane Martins
                        </p>
                        <p className="text-xs text-gray-500">Painel Administrativo</p>
                    </div>
                </div>

                <h1 className="text-xl font-extrabold text-gray-900 font-poppins text-center mb-1">
                    Entrar no painel
                </h1>
                <p className="text-xs text-gray-500 text-center mb-6">
                    Use o e-mail e a senha da equipe.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="login-email" className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            E-mail
                        </label>
                        <input
                            id="login-email"
                            type="email"
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="voce@ong.org"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand"
                        />
                    </div>

                    <div>
                        <label htmlFor="login-password" className="block text-xs font-bold text-gray-600 uppercase mb-1">
                            Senha
                        </label>
                        <input
                            id="login-password"
                            type="password"
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand"
                        />
                    </div>

                    {error && (
                        <p className="text-xs font-semibold text-red-600 text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-brand text-white font-bold rounded-xl text-sm shadow-md hover:bg-brand-dark transition-colors disabled:opacity-60"
                    >
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
