import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadType, LeadOrigin, LeadStatus } from '../types';

const NAMES = ["Tiago Ferreira", "Ana Silva", "Carlos Santos", "Mafalda Sousa", "Ricardo Pereira", "Inês Oliveira", "Duarte Menezes", "Beatriz Lima", "Gonçalo Rebelo", "Joana Matos"];
const INTERESTS_BUYER = ["T3 em Braga", "Penthouse na Foz", "T2 renovado em Lisboa", "Moradia com piscina", "Apartamento perto do metro"];
const INTERESTS_SELLER = ["Venda de T2", "Avaliação de Moradia", "Terreno industrial", "Herdade no Alentejo"];
const INTERESTS_RECRUITER = ["Consultor Imobiliário", "Team Leader", "Angariador experiente", "Gestor de Equipa"];

const STATUS_MAP: Record<LeadType, LeadStatus[]> = {
  comprador: ['fria', 'morna', 'quente'],
  vendedor: ['novo', 'avaliação', 'angariado'],
  angariador: ['candidato', 'entrevista', 'contratado'],
};

const ORIGINS: LeadOrigin[] = ['Instagram', 'Facebook', 'WhatsApp'];

export function useDemoMode(active: boolean, onNewLead: (lead: Lead) => void) {
  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      const type: LeadType = (['comprador', 'vendedor', 'angariador'] as LeadType[])[Math.floor(Math.random() * 3)];
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
      
      let interest = "";
      if (type === 'comprador') interest = INTERESTS_BUYER[Math.floor(Math.random() * INTERESTS_BUYER.length)];
      else if (type === 'vendedor') interest = INTERESTS_SELLER[Math.floor(Math.random() * INTERESTS_SELLER.length)];
      else interest = INTERESTS_RECRUITER[Math.floor(Math.random() * INTERESTS_RECRUITER.length)];

      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone: `+351 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
        origin,
        type,
        interest,
        status: STATUS_MAP[type][0],
        createdAt: new Date().toISOString(),
      };

      onNewLead(newLead);
    }, 6500); // 5-8 seconds range roughly

    return () => clearInterval(interval);
  }, [active, onNewLead]);
}
