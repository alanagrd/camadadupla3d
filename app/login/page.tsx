import { login } from "@/app/auth/actions";
import { Layers } from "lucide-react";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <Layers size={22} color="var(--amber)" />
          <span className="font-display font-bold text-xl">camadadupla3D</span>
        </div>

        <form
          action={login}
          className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col gap-4"
        >
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-[var(--text-faint)] mb-1.5">
              E-mail
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-[var(--surface-2)] border border-[var(--border-light)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-wide text-[var(--text-faint)] mb-1.5">
              Senha
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-[var(--surface-2)] border border-[var(--border-light)] rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[var(--amber)]"
            />
          </div>

          {erro && (
            <p className="text-[var(--red)] text-xs bg-[var(--red-dim)]/20 border border-[var(--red)]/30 rounded-lg px-3 py-2">
              {erro === "Invalid login credentials"
                ? "E-mail ou senha incorretos."
                : erro}
            </p>
          )}

          <button
            type="submit"
            className="bg-[var(--amber)] text-[#1a1300] font-semibold rounded-lg py-2.5 text-sm mt-1"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
