export type LeadType = 'comprador' | 'vendedor' | 'angariador' | 'negócio' | 'crédito' | 'recruta';

export type LeadOrigin = 'Instagram' | 'Facebook' | 'WhatsApp' | 'Internal' | 'Bank';

export type LeadStatus = 
  | 'fria' | 'morna' | 'quente'            // Compradores
  | 'novo' | 'avaliação' | 'angariado'     // Vendedores
  | 'análise' | 'pré-aprovado' | 'escritura' // Crédito / Negócios
  | 'candidato' | 'entrevista' | 'contratado';

export type ScoreLabel = '🔥 quente' | '⚠️ morna' | '❄️ fria' | '💎 elite';

export type PropertyStatus = 'disponível' | 'em negociação' | 'reservado' | 'vendido';
export type PropertyType = 'Apartamento' | 'Moradia' | 'Terreno' | 'Comercial';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  location: 'Braga' | 'Viana do Castelo' | 'Caminha' | 'Valença' | 'Monção';
  price: number;
  status: PropertyStatus;
  sqm: number;
  beds?: number;
}

export interface BusinessTraspass {
  id: string;
  title: string;
  category: 'Restaurante' | 'Café' | 'Mini Mercado' | 'Alojamento Local' | 'Serviços';
  location: string;
  price: number;
  revenue: number;
  status: 'disponível' | 'negociação' | 'fechado';
}

export interface MortgageProcess {
  id: string;
  clientName: string;
  amount: number;
  status: 'Análise' | 'Avaliação' | 'Pré-Aprovado' | 'Aprovado' | 'Recusado';
  probability: number;
  bank: 'CGD' | 'Santander' | 'BPI' | 'Novo Banco';
  propertyId?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  origin: LeadOrigin;
  type: LeadType;
  interest: string;
  status: LeadStatus;
  createdAt: string;
  lastMessage?: string;
  score?: number; // 0-100
  scoreLabel?: ScoreLabel;
  probability?: number; // 0-100
  value?: number; // Estimated financial value
}

export const STATUS_MAP: Record<LeadType, LeadStatus[]> = {
  'comprador': ['fria', 'morna', 'quente'],
  'vendedor': ['novo', 'avaliação', 'angariado'],
  'crédito': ['análise', 'pré-aprovado', 'escritura'],
  'negócio': ['análise', 'pré-aprovado', 'escritura'],
  'angariador': ['candidato', 'entrevista', 'contratado'],
  'recruta': ['candidato', 'entrevista', 'contratado']
};

export interface ChatMessage {
  id: string;
  sender: 'lead' | 'ai';
  text: string;
  timestamp: string;
}
