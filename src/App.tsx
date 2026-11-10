// src/App.tsx
import React, { useEffect, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import { LoginScreen } from "./components/admin/LoginScreen";
import { AdminProfile, fetchAdminProfile, getCurrentUserId, onAuthChange, signOut } from "./data/auth";
import { MobileHome } from "./components/mobile/MobileHome";
import { MobileCheckout } from "./components/mobile/MobileCheckout";
import { MobilePix } from "./components/mobile/MobilePix";
import { MuralScreen } from "./components/mobile/MuralScreen";
import { RecorrenteScreen } from "./components/mobile/RecorrenteScreen";
import { TabBar, Tab } from "./components/mobile/TabBar";
import { Footer } from "./components/Footer";
import { useCampaigns } from "./data/campaigns";
import { Campaign } from "./types";
import { ChargeResult } from "./data/api";

type ViewMode = "mobile" | "admin";

// No state for ViewToggle anymore, remove leftovers
function isAdminHash() {
    return window.location.hash === "#admin";
}

export default function App() {
    const [viewMode, setViewMode] = useState<ViewMode>(isAdminHash() ? "admin" : "mobile");
    const [currentScreen, setCurrentScreen] = useState<"home" | "mural" | "recorrente" | "checkout" | "pix" | "success">("home");
    const [sessionUserId, setSessionUserId] = useState<string | null>(null);
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [profileState, setProfileState] = useState<"loading" | "ready" | "no-access">("loading");

    useEffect(() => {
        const onHash = () => setViewMode(isAdminHash() ? "admin" : "mobile");
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            setProfileState("loading");
            setProfile(null);
            const userId = await getCurrentUserId();
            if (cancelled) return;
            setSessionUserId(userId);
            if (!userId) {
                setProfileState("ready");
                return;
            }
            try {
                const p = await fetchAdminProfile(userId);
                if (cancelled) return;
                if (!p) {
                    // Sem linha em admins: sem acesso
                    await signOut();
                    if (!cancelled) setProfileState("no-access");
                    return;
                }
                setProfile(p);
                setProfileState("ready");
            } catch {
                if (!cancelled) setProfileState("ready");
            }
        }

        loadProfile();
        const unsub = onAuthChange(() => loadProfile());
        return () => {
            cancelled = true;
            unsub();
        };
    }, []);

    async function handleSignOut() {
        await signOut();
        setProfile(null);
        setSessionUserId(null);
        window.location.hash = "";
        setViewMode("mobile");
    }
    const [tab, setTab] = useState<Tab>("home");
    const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
    const [donationAmount, setDonationAmount] = useState<number>(20);
    const [fromPlan, setFromPlan] = useState(false);
    const [charge, setCharge] = useState<ChargeResult | null>(null);

    function startCheckout(campaign: Campaign | null, amount: number, fromPlanValue: boolean) {
        setCharge(null);
        if (campaign) setSelectedCampaign(campaign);
        setDonationAmount(amount);
        setFromPlan(fromPlanValue);
        setCurrentScreen("checkout");
    }
    const { campaigns, loading: campaignsLoading, error: campaignsError, reload: reloadCampaigns } = useCampaigns();

    function handleTabChange(newTab: Tab) {
        setTab(newTab);
        setCurrentScreen(newTab);
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1E1E24] flex flex-col">
            {viewMode === "admin" ? (
                profileState === "loading" ? (
                    <div className="min-h-screen flex items-center justify-center">
                        <p className="text-sm font-semibold text-gray-500">Carregando...</p>
                    </div>
                ) : !sessionUserId || !profile ? (
                    <LoginScreen />
                ) : (
                    <AdminDashboard
                        role={profile.role}
                        userName={profile.name}
                        onSignOut={handleSignOut}
                    />
                )
            ) : (
                <div className="max-w-md w-full mx-auto min-h-screen flex flex-col bg-gray-50 shadow-lg border-x border-gray-200">
                    {/* Cabeçalho do App Móvel */}
                    <header className="bg-brand text-white p-4 text-center">
                        <h1 className="text-lg font-extrabold font-poppins">CAPO - Eliane Martins</h1>
                        <p className="text-xs text-sky-100">Apoio ao Paciente Oncológico</p>
                    </header>

                    {/* Conteúdo Dinâmico da Tela Ativa */}
                    <main className="flex-1 p-4 overflow-y-auto">
                        {currentScreen === "home" && (
                            <MobileHome
                                campaigns={campaigns}
                                loading={campaignsLoading}
                                error={campaignsError}
                                onRetry={reloadCampaigns}
                                onSelect={(campaign) => startCheckout(campaign, 20, false)}
                                onRecurring={() => handleTabChange("recorrente")}
                            />
                        )}

                        {currentScreen === "mural" && (
                            <MuralScreen
                                onDonate={() => startCheckout(campaigns[0] ?? null, 20, false)}
                            />
                        )}

                        {currentScreen === "recorrente" && (
                            <RecorrenteScreen
                                onSubscribe={(amount) => startCheckout(campaigns[0] ?? null, amount, true)}
                            />
                        )}

                        {currentScreen === "checkout" && (
                            <MobileCheckout
                                campaignId={selectedCampaign?.id ?? "mensal"}
                                campaignTitle={selectedCampaign?.title ?? "Apoio Recorrente"}
                                initialAmount={fromPlan ? donationAmount : undefined}
                                subscriptionNotice={fromPlan}
                                onPixGenerated={(result, amount) => {
                                    setCharge(result);
                                    setDonationAmount(amount);
                                    setFromPlan(false);
                                    setCurrentScreen("pix");
                                }}
                                onCancel={() => setCurrentScreen(tab)}
                            />
                        )}

                        {currentScreen === "pix" && charge && (
                            <MobilePix
                                charge={charge}
                                amount={donationAmount}
                                onConfirm={() => setCurrentScreen("success")}
                                onRegenerate={() => setCurrentScreen("checkout")}
                                onCancel={() => setCurrentScreen(tab)} 
                            />
                        )}

                        {currentScreen === "success" && (
                            <div className="p-6 bg-white rounded-2xl border border-gray-200 text-center space-y-4">
                                <div className="w-16 h-16 bg-emerald-100 text-[#16724C] rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
                                    ✓
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 font-poppins">Doação Confirmada!</h2>
                                <p className="text-sm text-gray-600">
                                    Muito obrigado! Sua contribuição de <strong>R$ {donationAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong> ajuda a manter o transporte e acolhimento das nossas pacientes.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setCurrentScreen(tab)}
                                    className="w-full py-3 bg-brand text-white font-bold rounded-xl text-sm"
                                >
                                    Voltar ao Início
                                </button>
                            </div>
                        )}
                    </main>

                    {/* Barra de Navegação Inferior (TabBar) para Metas, Mural e Recorrente */}
                    {["home", "mural", "recorrente"].includes(currentScreen) && (
                        <TabBar tab={tab} setTab={handleTabChange} />
                    )}

                    <Footer />
                </div>
            )}
        </div>
    );
}
