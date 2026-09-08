import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/auth/actions";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Boxes,
  PiggyBank,
  Settings2,
  Layers,
  LogOut,
  Calculator,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/produtos", label: "Produtos", icon: Package },
  { href: "/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/estoque", label: "Estoque", icon: Boxes },
  { href: "/contas", label: "Contas das crianças", icon: PiggyBank },
  { href: "/calculadora", label: "Calculadora", icon: Calculator },
  { href: "/configuracoes", label: "Configurações", icon: Settings2 },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex">
      <aside className="w-[220px] shrink-0 border-r border-[var(--border)] flex flex-col p-4">
        <div className="flex items-center gap-2 mb-8 px-1">
          <Layers size={18} color="var(--amber)" />
          <span className="font-display font-bold text-[15px]">
            camadadupla3D
          </span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[var(--border)] pt-3 mt-3">
          <p className="text-[11px] text-[var(--text-faint)] px-2.5 mb-2 truncate">
            {user.email}
          </p>
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-[var(--text-muted)] hover:bg-[var(--surface-2)] w-full"
            >
              <LogOut size={15} />
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 max-w-[1400px]">{children}</main>
    </div>
  );
}
