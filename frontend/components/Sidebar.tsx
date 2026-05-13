"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Dumbbell, BarChart2, Calendar, User, Sparkles, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NAV = [
  { href: "/",           icon: Home,     label: "Dashboard" },
  { href: "/treinos",    icon: Dumbbell, label: "Treinos",   badge: "4" },
  { href: "/calendario", icon: Calendar, label: "Histórico" },
  { href: "/progresso",  icon: BarChart2,label: "Evolução"  },
  { href: "/perfil",     icon: User,     label: "Perfil"    },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">F</div>
        <div className="sidebar-brand-name">FitAI</div>
      </div>

      {/* Nav */}
      <div className="side-section-label">Navegação</div>
      <div className="col gap-2">
        {NAV.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={`side-item${active ? " active" : ""}`}>
              <Icon size={18} />
              {label}
              {badge && <span className="badge">{badge}</span>}
            </Link>
          );
        })}
      </div>

      {/* Tools */}
      <div className="side-section-label">Ferramentas</div>
      <Link href="/ai-gen" className="side-item-cta">
        <Sparkles size={18} />
        Gerar treino com IA
      </Link>

      {/* User */}
      <div className="sidebar-bottom">
        <div className="side-user" onClick={logout} title="Sair">
          <div className="avatar">{initials}</div>
          <div className="flex-1">
            <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name ?? "Usuário"}
            </div>
            <div style={{ fontSize: 11, color: "var(--text-mute)", marginTop: 2 }}>
              {user?.email ?? ""}
            </div>
          </div>
          <Settings size={16} color="var(--text-mute)" />
        </div>
      </div>
    </aside>
  );
}
