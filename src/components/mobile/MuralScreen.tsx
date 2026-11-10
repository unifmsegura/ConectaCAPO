// src/components/mobile/MuralScreen.tsx
import React, { useEffect, useState } from "react";
import { MuralPost, MuralStats, MuralDonor, fetchPosts, fetchMuralStats, fetchMuralDonors } from "../../data/api";
import { supabase } from "../../lib/supabase";

const GRADIENTS = [
    "linear-gradient(135deg, #124E66 0%, #0D3748 100%)",
    "linear-gradient(135deg, #D45D79 0%, #9C3B56 100%)",
    "linear-gradient(135deg, #16724C 0%, #0E5236 100%)",
];

interface MuralScreenProps {
    onDonate: () => void;
}

export function MuralScreen({ onDonate }: MuralScreenProps) {
    const [posts, setPosts] = useState<MuralPost[]>([]);
    const [stats, setStats] = useState<MuralStats | null>(null);
    const [donors, setDonors] = useState<MuralDonor[]>([]);
    const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            try {
                const [postsData, statsData, donorsData] = await Promise.all([
                    fetchPosts(),
                    fetchMuralStats(),
                    fetchMuralDonors(),
                ]);
                if (cancelled) return;

                setPosts(postsData);
                setStats(statsData);
                setDonors(donorsData);
                setError(null);

                const urls: Record<string, string> = {};
                for (const post of postsData) {
                    if (post.imagePath) {
                        const { data } = supabase.storage.from("mural").getPublicUrl(post.imagePath);
                        if (data?.publicUrl) urls[post.id] = data.publicUrl;
                    }
                }
                if (!cancelled) setPhotoUrls(urls);
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Erro ao carregar o mural.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const brl = (n: number) =>
        n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

    return (
        <div className="flex flex-col flex-1 overflow-hidden bg-[#F8F9FA]">
            {/* Cabeçalho do Mural */}
            <div className="px-5 py-4 bg-white border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ONG Eliane Martins
                </p>
                <p className="text-xl font-extrabold text-brand font-poppins">
                    Mural de Impacto: Nossas Divas 🎀
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                    Veja a transparência e o resultado da sua doação
                </p>
            </div>

            {/* Card de Estatísticas do Impacto */}
            <div className="relative mx-4 mt-4 rounded-2xl grid grid-cols-3 gap-2 p-4 bg-gradient-to-r from-brand to-brand-dark text-white shadow-md">
                <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-black">{stats ? stats.doadoras : "—"}</span>
                    <span className="text-[11px] text-blue-200 font-semibold">Doadores</span>
                </div>
                <div className="flex flex-col items-center text-center border-x border-white/10">
                    <span className="text-xl font-black">{stats ? brl(stats.arrecadado) : "—"}</span>
                    <span className="text-[11px] text-blue-200 font-semibold">Arrecadados</span>
                </div>
                <div className="flex flex-col items-center text-center">
                    <span className="text-xl font-black">{stats ? stats.metasAtingidas : "—"}</span>
                    <span className="text-[11px] text-blue-200 font-semibold">Metas ✓</span>
                </div>
            </div>

            {/* Feed de Postagens */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-4">
                {loading && (
                    <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                        <p className="text-sm font-semibold text-gray-500">Carregando o mural...</p>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                        <p className="text-sm font-semibold text-red-700">{error}</p>
                    </div>
                )}

                {!loading && !error && posts.length === 0 && (
                    <div className="p-8 bg-white rounded-2xl border border-gray-200 text-center">
                        <p className="text-2xl mb-1">🎀</p>
                        <p className="text-sm font-bold text-gray-800">Ainda não há publicações no mural</p>
                        <p className="text-xs text-gray-500 mt-1">
                            Em breve a equipe vai compartilhar as novidades por aqui.
                        </p>
                    </div>
                )}

                {posts.map((post, index) => {
                    const photoUrl = photoUrls[post.id];
                    const gradient = GRADIENTS[index % GRADIENTS.length];
                    const date = new Date(post.createdAt).toLocaleDateString("pt-BR");
                    return (
                        <article
                            key={post.id}
                            className="rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-sm"
                        >
                            {/* Foto real do bucket "mural" ou gradiente temático */}
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt={post.title}
                                    className="relative w-full h-48 object-cover"
                                />
                            ) : (
                                <div
                                    className="relative w-full h-48 flex items-center justify-center"
                                    style={{ background: gradient }}
                                    role="img"
                                    aria-label={post.title}
                                >
                                    <span className="text-6xl" aria-hidden="true">🎀</span>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-4 right-4">
                                        <p className="text-xs text-blue-100 font-medium">📅 {date}</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4">
                                <h3 className="text-base font-bold text-gray-900 font-poppins mb-1">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {post.message}
                                </p>
                            </div>
                        </article>
                    );
                })}

                {/* Quem já ajudou */}
                {!loading && !error && donors.length > 0 && (
                    <section className="rounded-3xl p-5 bg-white border border-gray-200">
                        <h3 className="text-base font-bold text-gray-900 font-poppins mb-3">
                            Quem já ajudou 💲
                        </h3>
                        <ul className="space-y-2">
                            {donors.map((donor, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between text-sm border-b border-gray-100 last:border-0 pb-2 last:pb-0"
                                >
                                    <span className="font-semibold text-gray-800">
                                        {donor.anonymous ? "Anônima" : donor.name.split(" ")[0]}
                                    </span>
                                    <span className="text-xs text-gray-500 flex-1 px-2 truncate">
                                        {donor.campaign}
                                    </span>
                                    <span className="font-bold text-emerald-600">
                                        {brl(donor.amount)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {!loading && !error && posts.length > 0 && donors.length === 0 && (
                    <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                            Seja a primeira a apoiar — sua doação aparece aqui.
                        </p>
                    </div>
                )}

                {/* Chamada para Doação */}
                <div className="rounded-3xl p-5 text-center bg-pink-50 border border-pink-200">
                    <p className="text-2xl mb-1">💲</p>
                    <p className="text-base font-bold text-pink-900 font-poppins">
                        Faça parte dessa história
                    </p>
                    <p className="text-xs text-pink-700 mb-4">
                        Ajude a criar o próximo impacto para nossas pacientes.
                    </p>
                    <button
                        type="button"
                        onClick={onDonate}
                        className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold text-sm shadow-md hover:bg-brand-dark transition-colors"
                    >
                        Quero Contribuir Agora
                    </button>
                </div>
            </div>
        </div>
    );
}
