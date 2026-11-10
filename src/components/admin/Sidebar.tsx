// src/components/admin/Sidebar.tsx
import React from "react";
import { PALETTE as P } from "../../constants/theme";

export type NavItem = "dashboard" | "campanhas" | "recorrentes" | "relatorios" | "mural" | "configuracoes";

interface NavOption {
    key: NavItem;
    label: string;
    adminOnly: boolean;
    icon: React.ReactElement;
}

export const ADMIN_ONLY_NAV: NavItem[] = ["dashboard", "campanhas", "recorrentes", "relatorios"];

const NAV_ITEMS: NavOption[] = [
    {
        key: "dashboard",
        adminOnly: true,
        label: "Dashboard",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
        ),
    },
    {
        key: "campanhas",
        adminOnly: true,
        label: "Gerenciar Campanhas",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
        ),
    },
    {
        key: "recorrentes",
        adminOnly: true,
        label: "Doadores Recorrentes",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
        ),
    },
    {
        key: "relatorios",
        adminOnly: true,
        label: "Relatórios Financeiros",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
        ),
    },
    {
        key: "mural",
        adminOnly: false,
        label: "Mural de Impacto",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
        ),
    },
    {
        key: "configuracoes",
        adminOnly: false,
        label: "Configurações",
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
            </svg>
        ),
    }
];

interface SidebarProps {
    active: NavItem;
    setActive: (item: NavItem) => void;
    highContrast: boolean;
    largeFont: boolean;
    onToggleContrast: () => void;
    onToggleFont: () => void;
    isAdmin: boolean;
    userName: string;
    onSignOut?: () => void;
    onExit?: () => void;
}

export function Sidebar ({
    active,
    setActive,
    highContrast,
    largeFont,
    onToggleContrast,
    onToggleFont,
    isAdmin,
    userName,
    onSignOut,
    onExit,
}: SidebarProps) {
    const visibleItems = NAV_ITEMS.filter((item) => isAdmin || !item.adminOnly);
    const initials = userName
        ? userName.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("")
        : "";
    const roleLabel = isAdmin ? "Admin" : "Voluntária";
    return (
        <aside
          className="flex flex-col flex-shrink-0"
          style={{ width: 264, background: P.sidebar, minHeight: "100vh" }}
        >
            {/* Logotipo da ONG */}
            <div className="px-6 pt-8 pb-8" style={{ borderBottom: `1px solid ${P.sidebarBorder}` }}>
                <div className="flex items-center gap-3 mb-1">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg"
                      style={{ background: "#FFFFFF", color: P.blue, fontFamily: "Poppins,sans-serif" }}
                    >
                        EM
                    </div>
                    <div>
                        <p style={{ fontSize: 17, fontWeight: 800, color: "#FFFFFF", fontFamily: "Poppins,sans-serif", lineHeight: 1.2 }}>
                          Eliane Martins
                        </p>
                        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.9)" ,fontWeight: 500 }}>ONG Oncológica</p>
                    </div>
                </div>
                <div
                  className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(18,78,102,0.25)", border: "1px solid rgba(18,78,102,0.4)" }}
                >
                    <span aria-hidden="true" style={{ width: 9, height: 9, borderRadius: "50%", background: "#7EE0B6" }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>
                      Painel Administrativo
                    </span>
                </div>
            </div>

            {/* Menus de Navegação (itens sem permissão ficam ocultos) */}
            <nav className="flex-1 px-3 py-6 space-y-1">
                {visibleItems.map((item) => {
                    const isActive = active === item.key;
                    return (
                        <button
                          key={item.key}
                          onClick={() => setActive(item.key)}
                          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                          style={{
                            background: isActive ? P.sidebarActive : "transparent",
                            color: "#FFFFFF",
                            fontFamily: "Inter,sans-serif",
                            fontSize: 16,
                            fontWeight: isActive ? 700 : 500,
                            boxShadow: isActive ? "inset 4px 0 0 #FFFFFF" : "none",
                          }}
                          onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.background = P.sidebarHover;
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <span style={{ opacity: isActive ? 1 : 0.7, flexShrink: 0 }}>{item.icon}</span>
                          <span style={{ lineHeight: 1.3 }}>{item.label}</span>
                          {isActive && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: P.pink, flexShrink: 0 }} />
                          )}
                          </button>
                      );
                  })}
                  </nav>

                  {/* Ferramentas de Acessibilidade e Perfil */}
                  <div className="px-6 pb-6 pt-4" style={{ borderTop: `1px solid ${P.sidebarBorder}` }}> 
                    <div className="flex flex-col gap-2 mb-4 text-xs text-white">
                        <button
                          type="button"
                          aria-pressed={highContrast}
                          onClick={onToggleContrast}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#0D4258] transition-colors"
                        >
                            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18V3Z"/>
                            </svg>
                            Modo Alto Contraste
                        </button>
                        <button
                          type="button"
                          aria-pressed={largeFont}
                          onClick={onToggleFont}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-[#0D4258] transition-colors"
                        >
                            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M4 19 9 5h2l5 14M6 14h8"/><path d="M18 8h4M20 6v4"/>
                            </svg>  
                            Aumentar Fonte
                        </button>
                      </div>

                    {/* Perfil da usuária logada */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                          style={{ background: "rgba(244,114,182,0.2)" , color: P.pink}}
                        >
                          {initials || "—"}
                        </div>
                        <div>
                            <p style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF"}}>{userName || "Equipe"}</p>
                            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{roleLabel}</p>
                        </div>
                    </div>

                    <button
                      type="button"
                      onClick={onSignOut ?? onExit}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors"
                      style={{ background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.25)" }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#F87171"}}>Sair</span>
                    </button>
                </div>
            </aside>
    );
}