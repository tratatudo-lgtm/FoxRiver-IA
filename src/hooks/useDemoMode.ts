import { useState, useEffect, useCallback } from 'react';
import { Lead, LeadType, LeadOrigin, LeadStatus, STATUS_MAP } from '../types';

const NAMES = ["Tiago Ferreira", "Ana Silva", "Carlos Santos", "Mafalda Sousa", "Ricardo Pereira", "Inês Oliveira", "Duarte Menezes", "Beatriz Lima", "Gonçalo Rebelo", "Joana Matos"];
const INTERESTS_BUYER = ["T3 em Braga", "Penthouse na Foz", "T2 renovado em Lisboa", "Moradia com piscina", "Apartamento perto do metro"];
const INTERESTS_SELLER = ["Venda de T2", "Avaliação de Moradia", "Terreno industrial", "Herdade no Alentejo"];
const INTERESTS_RECRUITER = ["Consultor Imobiliário", "Team Leader", "Angariador experiente", "Gestor de Equipa"];

const ORIGINS: LeadOrigin[] = ['Instagram', 'Facebook', 'WhatsApp'];

export function useDemoMode(
  active: boolean, 
  onNewLead: (lead: Lead) => void, 
  onUpdateLead: (id: string, updates: Partial<Lead>) => void,
  onUpdateInsight?: (location: string, updates: Partial<InvestmentInsight>) => void,
  onEvent?: (event: { id: string, text: string, type: 'info' | 'success' | 'alert' | 'event' }) => void
) {
  useEffect(() => {
    if (!active) return;

    // Helper to log actions
    const log = (text: string, type: 'info' | 'success' | 'alert' | 'event' = 'info') => {
      onEvent?.({ id: Math.random().toString(16).slice(2), text, type });
    };

    const generateLead = () => {
      const types: LeadType[] = ['comprador', 'vendedor', 'angariador', 'negócio', 'investor'];
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
      } else if (type === 'investor') {
        interest = "Portfolio Diversification";
        value = Math.floor(Math.random() * 5000000) + 1000000;
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
        status: (STATUS_MAP[type] || STATUS_MAP['angariador'])[0],
        createdAt: new Date().toISOString(),
        score,
        scoreLabel,
        probability: Math.floor(Math.random() * 30) + 30,
        value: value > 0 ? value : undefined
      };

      onNewLead(newLead);
      log(`Nova Lead via ${origin}: ${name}`, 'event');
      
      setTimeout(() => {
        log(`IA Triagem: ${name} classificado como ${scoreLabel} (${score}%)`, score > 75 ? 'success' : 'info');
      }, 1500);

      // Randomly schedule a pipeline update for this new lead
      if (Math.random() > 0.5) {
        setTimeout(() => {
          const nextStatus = STATUS_MAP[type][1];
          onUpdateLead(newLead.id, { status: nextStatus, probability: newLead.probability + 15 });
          log(`Progressão Auto-Funil: ${name} -> ${nextStatus}`, 'success');
        }, 8000);
      }
    };

    // Market Insight Updates
    const updateMarket = () => {
      const locations = ['Viana do Castelo', 'Caminha', 'Braga Centro', 'Valença'];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      const change = (Math.random() * 0.4) - 0.1; // -0.1 to +0.3
      const scoreChange = Math.floor(Math.random() * 3) - 1; // -1 to +1

      onUpdateInsight?.(loc, { 
        yield: Math.max(2, Math.min(12, 6 + change)),
        score: Math.max(50, Math.min(100, 85 + scoreChange))
      });

      if (Math.abs(change) > 0.2) {
        log(`IA Detectou anomalia em ${loc}: Yield ajustado para ${ (6+change).toFixed(1) }%`, 'alert');
      }
    };

    // Burst initial activity
    const timers = [
      setTimeout(generateLead, 1000),
      setTimeout(generateLead, 3000),
      setTimeout(updateMarket, 5000),
      setTimeout(generateLead, 10000),
    ];

    const leadInterval = setInterval(generateLead, 25000);
    const marketInterval = setInterval(updateMarket, 12000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(leadInterval);
      clearInterval(marketInterval);
    };
  }, [active, onNewLead, onUpdateLead, onUpdateInsight, onEvent]);
}
