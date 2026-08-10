// Tipos batendo 1:1 com camadadupla3d_schema.sql

export interface Config {
  id: true;
  custo_hora_maquina: number;
  margem_padrao_pct: number;
  piso_rhora: number;
  potencia_w: number;
  tarifa_kwh: number;
  preco_impressora: number;
  vida_util_horas: number;
  custo_hora_trabalho: number;
  taxa_falha_pct: number;
  updated_at: string;
}

export interface Filamento {
  id: string;
  nome: string;
  preco_kg: number;
  estoque_g: number;
  ativo: boolean;
  created_at: string;
}

export interface Insumo {
  id: string;
  nome: string;
  custo: number;
  estoque_un: number;
  ativo: boolean;
  created_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  tempo_impressao_min: number;
  tempo_acabamento_min: number;
  pecas_por_chapa: number;
  perda_extra_pct: number;
  margem_personalizada: number | null;
  preco_manual: number | null;
  ativo: boolean;
  created_at: string;
}

export interface ProdutoComponente {
  id: string;
  produto_id: string;
  filamento_id: string;
  gramas: number;
  filamentos?: Filamento;
}

export interface ProdutoInsumo {
  id: string;
  produto_id: string;
  insumo_id: string;
  qtd: number;
  insumos?: Insumo;
}

export type ClienteTipo =
  | "pessoal"
  | "organizador_torneio"
  | "patrocinador"
  | "escola"
  | "outro";

export interface Cliente {
  id: string;
  nome: string;
  telefone: string | null;
  instagram: string | null;
  tipo: ClienteTipo;
  observacoes: string | null;
  created_at: string;
}

export type PedidoStatus =
  | "novo"
  | "em_producao"
  | "pronto"
  | "entregue"
  | "cancelado";
export type PedidoCanal = "instagram" | "whatsapp" | "pessoal" | "outro";

export interface Pedido {
  id: string;
  cliente_id: string | null;
  vendedor_id: string | null;
  status: PedidoStatus;
  canal: PedidoCanal | null;
  prazo_entrega: string | null;
  observacoes: string | null;
  created_at: string;
  clientes?: Cliente;
}

export interface PedidoItem {
  id: string;
  pedido_id: string;
  produto_id: string | null;
  nome_personalizado: string | null;
  quantidade: number;
  preco_unitario: number;
  custo_unitario_calc: number | null;
  produtos?: Produto;
}

export type PagamentoForma = "pix" | "dinheiro" | "cartao" | "outro";
export type PagamentoStatus = "pendente" | "pago" | "estornado";

export interface Pagamento {
  id: string;
  pedido_id: string;
  valor: number;
  forma: PagamentoForma | null;
  status: PagamentoStatus;
  pago_em: string | null;
  created_at: string;
}

export interface ContaCrianca {
  id: string;
  nome: string;
  created_at: string;
}

export type MovimentacaoTipo =
  | "venda"
  | "custo_material"
  | "retirada"
  | "deposito";
export type Pote = "gastar" | "guardar" | "reinvestir";

export interface MovimentacaoConta {
  id: string;
  crianca_id: string;
  pedido_item_id: string | null;
  tipo: MovimentacaoTipo;
  pote: Pote | null;
  valor: number;
  descricao: string | null;
  created_at: string;
}

export type EstoqueTipo = "compra" | "consumo" | "ajuste";

export interface EstoqueMovimentacao {
  id: string;
  filamento_id: string;
  tipo: EstoqueTipo;
  gramas: number;
  pedido_id: string | null;
  created_at: string;
}
