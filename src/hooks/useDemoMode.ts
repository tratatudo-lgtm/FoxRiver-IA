import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadType, LeadOrigin, LeadStatus, STATUS_MAP } from '../types';

const NAMES = ["Tiago Ferreira", "Ana Silva", "Carlos Santos", "Mafalda Sousa", "Ricardo Pereira", "Inês Oliveira", "Duarte Menezes", "Beatriz Lima", "Gonçalo Rebelo", "Joana Matos"];
const INTERESTS_BUYER = ["T3 em Braga", "Penthouse na Foz", "T2 renovado em Lisboa", "Moradia com piscina", "Apartamento perto do metro"];
const INTERESTS_SELLER = ["Venda de T2", "Avaliação de Moradia", "Terreno industrial", "Herdade no Alentejo"];
const INTERESTS_RECRUITER = ["Consultor Imobiliário", "Team Leader", "Angariador experiente", "Gestor de Equipa"];

const ORIGINS: LeadOrigin[] = ['Instagram', 'Facebook', 'WhatsApp'];

export function useDemoMode(active: boolean, onNewLead: (lead: Lead) => void, onEvent?: (event: { id: string, text: string, type: 'info' | 'success' | 'alert' }) => void) {
  useEffect(() => {
    if (!active) return;

    const generateLead = () => {
      const types: LeadType[] = ['comprador', 'vendedor', 'angariador', 'recruta'];
      const type = types[Math.floor(Math.random() * types.length)];
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const origin = ORIGINS[Math.floor(Math.random() * ORIGINS.length)];
      
      let interest = "";
      let value = 0;
      if (type === 'comprador') {
        interest = INTERESTS_BUYER[Math.floor(Math.random() * INTERESTS_BUYER.length)];
        value = Math.floor(Math.random() * 800000) + 150000;
      } else if (type === 'vendedor') {
        interest = INTERESTS_SELLER[Math.floor(Math.random() * INTERESTS_SELLER.length)];
        value = Math.floor(Math.random() * 1500000) + 200000;
      } else {
        interest = INTERESTS_RECRUITER[Math.floor(Math.random() * INTERESTS_RECRUITER.length)];
      }

      const score = Math.floor(Math.random() * 30) + (value > 500000 ? 60 : 40);
      let scoreLabel: any = '❄️ fria';
      if (score > 75) scoreLabel = '🔥 quente';
      else if (score > 40) scoreLabel = '⚠️ morna';

      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone: `+351 9${Math.floor(Math.random() * 90000000 + 10000000)}`,
        origin,
        type,
        interest,
        status: (STATUS_MAP[type as any] || STATUS_MAP['angariador'])[0],
        createdAt: new Date().toISOString(),
        score,
        scoreLabel,
        probability: Math.floor(Math.random() * 30) + 30, // 30-60% initially
        value: value > 0 ? value : undefined
      };

      onNewLead(newLead);
      
      if (onEvent) {
        onEvent({
          id: Math.random().toString(16).slice(2),
          text: `Nova Lead captada via ${origin}: ${name}`,
          type: 'info'
        });
        
        setTimeout(() => {
          onEvent({
            id: Math.random().toString(16).slice(2),
            text: `IA analisou perfil: Score ${score} (${scoreLabel})`,
            type: score > 75 ? 'success' : 'info'
          });
        }, 2000);
      }
    };

    // Initial burst to show activity fast
    const t0 = setTimeout(generateLead, 500);
    const t1 = setTimeout(generateLead, 4000);
    const t2 = setTimeout(generateLead, 7000);

    const interval = setInterval(generateLead, 15000); 

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(interval);
    };
  }, [active, onNewLead, onEvent]);
}
