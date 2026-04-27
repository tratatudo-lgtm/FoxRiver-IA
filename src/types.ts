export type LeadType = 'comprador' | 'vendedor' | 'angariador';

export type LeadOrigin = 'Instagram' | 'Facebook' | 'WhatsApp';

export type LeadStatus = 
  | 'fria' | 'morna' | 'quente'            // Compradores
  | 'novo' | 'avaliação' | 'angariado'     // Vendedores
  | 'candidato' | 'entrevista' | 'contratado'; // Angariadores

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
}

export interface ChatMessage {
  id: string;
  sender: 'lead' | 'ai';
  text: string;
  timestamp: string;
}
