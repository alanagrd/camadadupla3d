"use client";

import { useState } from "react";

interface ProdutoCatalogo {
  id: string;
  nome: string;
  categoria: string | null;
  descricao_publica: string | null;
  foto_url: string | null;
  preco_catalogo: number | null;
  preco_manual: number | null;
}

const CAT_CORES: Record<string, { bg: string; text: string }> = {
  "Organizadores":  { bg: "#DBEAFE", text: "#1D4ED8" },
  "Brinquedos":     { bg: "#EDE9FE", text: "#6D28D9" },
  "Natal":          { bg: "#FEE2E2", text: "#B91C1C" },
  "Decoração":      { bg: "#D1FAE5", text: "#065F46" },
  "Educacional":    { bg: "#CCFBF1", text: "#0F766E" },
  "Personalizado":  { bg: "#FEF3C7", text: "#92400E" },
  "Outros":         { bg: "#F3F4F6", text: "#374151" },
};

function brl(v: number | null) {
  if (v == null) return null;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function CatalogoPublico({ produtos }: { produtos: ProdutoCatalogo[] }) {
  const categorias = ["Todos", ...Array.from(new Set(produtos.map(p => p.categoria ?? "Outros").sort()))];
  const [cat, setCat] = useState("Todos");

  const visiveis = cat === "Todos" ? produtos : produtos.filter(p => (p.categoria ?? "Outros") === cat);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Header */}
      <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 22 }}>🖨️</span>
            <span style={{ fontWeight: 800, fontSize: 17, letterSpacing: "-0.5px", color: "#111" }}>
              camadadupla<span style={{ color: "#F59E0B" }}>3D</span>
            </span>
          </div>
          <a
            href="https://wa.me/5511987084768"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: "#25D366", color: "#fff", borderRadius: 8, padding: "7px 16px",
              fontSize: 13, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Pedir pelo WhatsApp
          </a>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)", borderBottom: "1px solid #FDE68A", padding: "36px 20px 28px", textAlign: "center" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: "#111", margin: "0 0 8px", letterSpacing: "-1px" }}>
          Catálogo de Produtos
        </h1>
        <p style={{ color: "#6B7280", fontSize: 15, margin: 0 }}>
          Impressão 3D personalizada · Feito com 💛 por Kayky &amp; Yago
        </p>
      </div>

      {/* Category tabs */}
      {categorias.length > 2 && (
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", overflowX: "auto" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", display: "flex", gap: 4, whiteSpace: "nowrap" }}>
            {categorias.map(c => {
              const cores = CAT_CORES[c] ?? { bg: "#F3F4F6", text: "#374151" };
              const ativo = c === cat;
              return (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  style={{
                    padding: "12px 16px",
                    border: "none",
                    borderBottom: ativo ? "2px solid #F59E0B" : "2px solid transparent",
                    background: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: ativo ? 700 : 500,
                    color: ativo ? "#D97706" : "#6B7280",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c === "Todos" ? `Todos (${produtos.length})` : c}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px 64px" }}>
        {visiveis.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#9CA3AF" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
            <p style={{ fontSize: 16 }}>Nenhum produto nessa categoria ainda.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
            {visiveis.map(p => {
              const preco = p.preco_catalogo ?? p.preco_manual;
              const catNome = p.categoria ?? "Outros";
              const cores = CAT_CORES[catNome] ?? { bg: "#F3F4F6", text: "#374151" };
              return (
                <div
                  key={p.id}
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = "none";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)";
                  }}
                >
                  {/* Photo */}
                  <div style={{ width: "100%", aspectRatio: "1", background: "#F9FAFB", overflow: "hidden", position: "relative" }}>
                    {p.foto_url ? (
                      <img
                        src={p.foto_url}
                        alt={p.nome}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 52 }}>🖨️</span>
                      </div>
                    )}
                    {/* Category badge */}
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      background: cores.bg, color: cores.text,
                      fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 99,
                    }}>
                      {catNome}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ padding: "14px 16px 16px" }}>
                    <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: "#111", lineHeight: 1.3 }}>
                      {p.nome}
                    </h3>
                    {p.descricao_publica && (
                      <p style={{ margin: "0 0 12px", fontSize: 12.5, color: "#6B7280", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.descricao_publica}
                      </p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: p.descricao_publica ? 0 : 8 }}>
                      {preco != null ? (
                        <span style={{ fontSize: 18, fontWeight: 800, color: "#059669" }}>
                          {brl(preco)}
                        </span>
                      ) : (
                        <span style={{ fontSize: 13, color: "#9CA3AF" }}>Sob consulta</span>
                      )}
                      <a
                        href={`https://wa.me/5511987084768?text=Oi!%20Quero%20encomendar%3A%20${encodeURIComponent(p.nome)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          background: "#F59E0B", color: "#fff", borderRadius: 8,
                          padding: "6px 12px", fontSize: 12, fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        Pedir
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: "#111", color: "#9CA3AF", textAlign: "center", padding: "24px 20px", fontSize: 13 }}>
        <p style={{ margin: 0 }}>
          camadadupla3D · Impressão 3D personalizada · Feito com 💛
        </p>
      </footer>
    </div>
  );
}
