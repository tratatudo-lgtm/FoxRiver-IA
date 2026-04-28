export type LeadType = 'comprador' | 'vendedor' | 'angariador' | 'recruta';

export type LeadOrigin = 'Instagram' | 'Facebook' | 'WhatsApp';

export type LeadStatus = 
  | 'fria' | 'morna' | 'quente'            // Compradores
  | 'novo' | 'avaliação' | 'angariado'     // Vendedores
  | 'candidato' | 'entrevista' | 'contratado'; // Angariadores / Recrutamento

export type ScoreLabel = '🔥 quente' | '⚠️ morna' | '❄️ fria';

export const STATUS_MAP: Record<string, LeadStatus[]> = {
  comprador: ['fria', 'morna', 'quente'],
  vendedor: ['novo', 'avaliação', 'angariado'],
  angariador: ['candidato', 'entrevista', 'contratado'],
  recruta: ['candidato', 'entrevista', 'contratado'],
};

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

export interface ChatMessage {
  id: string;
  sender: 'lead' | 'ai';
  text: string;
  timestamp: string;
}
