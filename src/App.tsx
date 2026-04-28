/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Users, 
  Target, 
  Briefcase, 
  TrendingUp,
  TrendingDown,
  MessageSquare, 
  LayoutDashboard, 
  Settings, 
  Power, 
  Instagram, 
  Facebook, 
  MessageCircle,
  Clock,
  Phone,
  Search,
  ChevronRight,
  Send,
  MoreVertical,
  X,
  PlayCircle,
  PauseCircle,
  Filter,
  Building2,
  Euro,
  Scale,
  MapPin,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  BarChart3,
  CreditCard,
  PieChart,
  Globe,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lead, LeadType, LeadStatus, ChatMessage, Property, BusinessTraspass, MortgageProcess, STATUS_MAP, InvestmentInsight, HotDeal } from './types';
import { useDemoMode } from './hooks/useDemoMode';
import { getAIReply } from './lib/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = 1 - Math.pow(1 - Math.min(elapsed / duration, 1), 3); // Ease out cubic
      const current = start + (end - start) * progress;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  const formatted = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.floor(displayValue).toLocaleString();

  return <>{prefix}{formatted}{suffix}</>;
}

// Mock initial data
const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'João Silva',
    phone: '+351 912 345 678',
    origin: 'Instagram',
    type: 'comprador',
    interest: 'T2 em Lisboa',
    status: 'quente',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastMessage: 'Vou ver as fotos que enviou.'
  },
  {
    id: '2',
    name: 'Maria Santos',
    phone: '+351 933 111 222',
    origin: 'Facebook',
    type: 'vendedor',
    interest: 'Moradia em Cascais',
    status: 'novo',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastMessage: 'Pode avaliar o meu imóvel amanhã?'
  },
  {
    id: '3',
    name: 'Pedro Costa',
    phone: '+351 966 999 888',
    origin: 'WhatsApp',
    type: 'angariador',
    interest: 'Consultor focado em Sintra',
    status: 'entrevista',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    lastMessage: 'Sim, tenho experiência na Remax.'
  }
];

const CHART_DATA = [
  { name: 'Seg', leads: 40 },
  { name: 'Ter', leads: 65 },
  { name: 'Qua', leads: 45 },
  { name: 'Qui', leads: 90 },
  { name: 'Sex', leads: 70 },
  { name: 'Sáb', leads: 30 },
  { name: 'Dom', leads: 20 },
];

// War Room Mock Data - Northern Portugal Focus
const INITIAL_PROPERTIES: Property[] = [
  { id: 'p1', title: 'Moradia T4 Premium', type: 'Moradia', location: 'Braga', price: 650000, status: 'disponível', sqm: 320, beds: 4 },
  { id: 'p2', title: 'Apartamento T3 Vista Rio', type: 'Apartamento', location: 'Viana do Castelo', price: 320000, status: 'em negociação', sqm: 145, beds: 3 },
  { id: 'p3', title: 'Solar Histórico', type: 'Moradia', location: 'Caminha', price: 1200000, status: 'disponível', sqm: 550, beds: 6 },
  { id: 'p4', title: 'Penthouse Central', type: 'Apartamento', location: 'Braga', price: 480000, status: 'reservado', sqm: 180, beds: 3 },
  { id: 'p5', title: 'Loteamento Industrial', type: 'Terreno', location: 'Valença', price: 250000, status: 'disponível', sqm: 2500 },
];

const INITIAL_BUSINESSES: BusinessTraspass[] = [
  { id: 'b1', title: 'Restaurante Tradicional', category: 'Restaurante', location: 'Braga', price: 120000, revenue: 15000, status: 'disponível' },
  { id: 'b2', title: 'Café & Pastelaria', category: 'Café', location: 'Viana do Castelo', price: 45000, revenue: 8000, status: 'negociação' },
  { id: 'b3', title: 'Alojamento Local Rural', category: 'Alojamento Local', location: 'Monção', price: 280000, revenue: 45000, status: 'disponível' },
  { id: 'b4', title: 'Mini Mercado Prime', category: 'Mini Mercado', location: 'Braga', price: 85000, revenue: 22000, status: 'disponível' },
];

const INITIAL_MORTGAGES: MortgageProcess[] = [
  { id: 'm1', clientName: 'Ricardo Pereira', amount: 285000, status: 'Pré-Aprovado', probability: 95, bank: 'CGD' },
  { id: 'm2', clientName: 'Ana Rodrigues', amount: 120000, status: 'Avaliação', probability: 70, bank: 'Santander' },
  { id: 'm3', clientName: 'Miguel Sousa', amount: 450000, status: 'Análise', probability: 45, bank: 'BPI' },
  { id: 'm4', clientName: 'Sandra Gomes', amount: 210000, status: 'Aprovado', probability: 100, bank: 'Novo Banco' },
];

// REGIONAL_HEATMAP removed in favor of dynamic investmentInsights

const INVESTMENT_INSIGHTS: InvestmentInsight[] = [
  { location: 'Viana do Castelo', score: 92, yield: 6.8, demand: 'High', forecast: 14.2 },
  { location: 'Caminha', score: 88, yield: 5.4, demand: 'High', forecast: 18.5 },
  { location: 'Braga Centro', score: 85, yield: 4.2, demand: 'High', forecast: 9.1 },
  { location: 'Valença', score: 76, yield: 8.1, demand: 'Medium', forecast: 12.0 },
  { location: 'Pontes de Lima', score: 79, yield: 5.9, demand: 'Medium', forecast: 10.5 },
  { location: 'Monção', score: 72, yield: 7.4, demand: 'Low', forecast: 8.2 },
];

const HOT_DEALS: HotDeal[] = [
  {
    id: 'hd1',
    title: 'Edifício Industrial Revitalizado',
    location: 'Viana (Zona Portuária)',
    price: 850000,
    status: 'oportunidade',
    type: 'Comercial',
    sqm: 1200,
    discount: 15,
    estRoi: 12.4,
    investorScore: 94
  },
  {
    id: 'hd2',
    title: 'Lote Urbano c/ Projecto Aprovado',
    location: 'Caminha (Foz)',
    price: 245000,
    status: 'oportunidade',
    type: 'Terreno',
    sqm: 600,
    discount: 12,
    estRoi: 22.0,
    investorScore: 89
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'war-room' | 'imoveis' | 'negocios' | 'credito' | 'leads' | 'settings' | 'investor'>('war-room');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [businesses, setBusinesses] = useState<BusinessTraspass[]>(INITIAL_BUSINESSES);
  const [mortgages, setMortgages] = useState<MortgageProcess[]>(INITIAL_MORTGAGES);
  const [isDemoActive, setIsDemoActive] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Feature Flags System
  const [features, setFeatures] = useState({
    insights: true,
    autopilot: true,
    scoring: true,
    recrutamento: true,
    previsao: true,
    ranking: true
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [investmentInsights, setInvestmentInsights] = useState<InvestmentInsight[]>(INVESTMENT_INSIGHTS);

  // Multi-tenant State
  const [agencies, setAgencies] = useState([
    { id: '1', name: "Fox River Real Estate", theme: 'orange' },
    { id: '2', name: "Algarve Luxury Prime", theme: 'blue' },
    { id: '3', name: "Porto City Living", theme: 'purple' }
  ]);
  const [currentAgencyId, setCurrentAgencyId] = useState('1');

  // Settings State
  const [settings, setSettings] = useState({
    agencyName: "Fox River Real Estate",
    autoPilot: true,
    responseTime: "imediato",
    maxLeadsDay: 100,
    apiConnected: true,
    workflows: [
      { id: '1', name: 'Boas-vindas Instagram', trigger: 'Novo Lead (IG)', action: 'Mensagem AI' },
      { id: '2', name: 'Follow-up Vendedores', trigger: 'Sem resposta (24h)', action: 'SMS Lembrete' }
    ]
  });

  const [settingsTab, setSettingsTab] = useState<'geral' | 'automação' | 'equipa' | 'planos'>('geral');

  // Initial Data Generation (Realistic)
  useEffect(() => {
    const initialLeads: Lead[] = [
      {
        id: '1',
        name: 'João Silva',
        phone: '+351 912 345 678',
        origin: 'Instagram',
        type: 'comprador',
        interest: 'T2 em Lisboa',
        status: 'quente',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        score: 88,
        scoreLabel: '🔥 quente',
        probability: 78,
        value: 450000
      },
      {
        id: '2',
        name: 'Maria Santos',
        phone: '+351 933 111 222',
        origin: 'Facebook',
        type: 'vendedor',
        interest: 'Moradia em Cascais',
        status: 'novo',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        score: 65,
        scoreLabel: '⚠️ morna',
        probability: 45,
        value: 1200000
      }
    ];
    setLeads(initialLeads);
  }, []);

  // Sync settings name with current agency for demo purposes
  useEffect(() => {
    const agency = agencies.find(a => a.id === currentAgencyId);
    if (agency) {
      setSettings(prev => ({ ...prev, agencyName: agency.name }));
    }
  }, [currentAgencyId, agencies]);

  // Handle new lead from Demo Mode or otherwise
  const handleNewLead = useCallback((newLead: Lead) => {
    setLeads(prev => [newLead, ...prev].slice(0, 50));
    
    // Auto-reply if demo mode is active and autopilot is ON
    if (isDemoActive && settings.autoPilot) {
      setTimeout(async () => {
        setIsTyping(true);
        // Simulated delay for realism
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const reply = await getAIReply(newLead.type as any, newLead.name, newLead.interest, []);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: 'ai',
          text: reply,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => ({
          ...prev,
          [newLead.id]: [...(prev[newLead.id] || []), aiMsg]
        }));
        setIsTyping(false);

        // Notify
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
        audio.volume = 0.2;
        audio.play().catch(() => {});
      }, 1000);
    }
  }, [isDemoActive, settings.autoPilot]);

  const [demoEvents, setDemoEvents] = useState<{ id: string, text: string, type: 'info' | 'success' | 'alert', time: Date }[]>([]);

  const addDemoEvent = useCallback((event: any) => {
    setDemoEvents(prev => [{ ...event, time: new Date() }, ...prev].slice(0, 15));
  }, []);

  const handleUpdateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const handleUpdateInsight = useCallback((location: string, updates: Partial<InvestmentInsight>) => {
    setInvestmentInsights(prev => prev.map(i => i.location === location ? { ...i, ...updates } : i));
  }, []);

  useDemoMode(isDemoActive, handleNewLead, handleUpdateLead, handleUpdateInsight, addDemoEvent);

  // Pipeline Evolution Simulation logic removed as it's now handled by the useDemoMode hook

  const selectedLead = useMemo(() => leads.find(l => l.id === selectedLeadId), [leads, selectedLeadId]);

  const kpis = useMemo(() => ({
    leadsToday: leads.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length,
    buyers: leads.filter(l => l.type === 'comprador').length,
    sellers: leads.filter(l => l.type === 'vendedor').length,
    recruiters: leads.filter(l => l.type === 'angariador').length,
    convRate: '12.4%'
  }), [leads]);

  const handleSendMessage = async (text: string) => {
    if (!selectedLeadId || !text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'lead',
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] || []), userMsg]
    }));

    setIsTyping(true);
    const lead = leads.find(l => l.id === selectedLeadId)!;
    const history = chatHistory[selectedLeadId] || [];
    const reply = await getAIReply(lead.type, lead.name, lead.interest, [...history, userMsg]);
    
    const aiMsg: ChatMessage = {
      id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: 'ai',
      text: reply,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] || []), aiMsg]
    }));
    setIsTyping(false);
  };

  const updateLeadStatus = (id: string, status: LeadStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  return (
    <div className="flex h-screen bg-dashboard-bg text-white overflow-hidden font-sans relative">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-64 border-r border-card-border bg-dashboard-bg/50 backdrop-blur-xl flex-col z-20">
        <SidebarContent 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          isDemoActive={isDemoActive} 
          setIsDemoActive={setIsDemoActive} 
          settings={settings}
          agencies={agencies}
          currentAgencyId={currentAgencyId}
          setCurrentAgencyId={setCurrentAgencyId}
          features={features}
        />
      </aside>

      {/* Sidebar - mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed inset-y-0 left-0 w-72 bg-dashboard-bg border-r border-card-border z-40 lg:hidden flex flex-col"
            >
              <SidebarContent 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isDemoActive={isDemoActive} 
                setIsDemoActive={setIsDemoActive}
                settings={settings}
                agencies={agencies}
                currentAgencyId={currentAgencyId}
                setCurrentAgencyId={setCurrentAgencyId}
                onClose={() => setIsMobileMenuOpen(false)}
                features={features}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto bg-gradient-to-br from-dashboard-bg to-[#0d0d12]">
        <header className="sticky top-0 h-16 lg:h-20 bg-dashboard-bg/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-10 border-b border-card-border z-10">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 lg:hidden text-zinc-400 hover:text-white"
            >
              <LayoutDashboard size={24} />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold capitalize truncate">
              {activeTab === 'war-room' ? 'War Room Executivo' : 
               activeTab === 'imoveis' ? 'Portfolio Imobiliário' :
               activeTab === 'negocios' ? 'Oportunidades' :
               activeTab === 'credito' ? 'Gestão de Crédito' :
               activeTab === 'investor' ? 'Investor Mode AI' : 
               activeTab === 'leads' ? 'Pipeline & Leads' : activeTab}
            </h2>
            {isDemoActive && (
              <div className="flex items-center gap-2 bg-brand/10 px-2 lg:px-3 py-1 rounded-full border border-brand/20">
                <span className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-brand rounded-full animate-pulse-orange" />
                <span className="text-[8px] lg:text-[10px] font-bold text-brand uppercase tracking-wider">Demo</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3 lg:gap-6">
            <div className="hidden xl:flex items-center gap-4 bg-zinc-900 px-4 py-1.5 rounded-2xl border border-card-border">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <Instagram size={14} className="text-pink-500" />
               </div>
               <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <Facebook size={14} className="text-blue-500" />
               </div>
               <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <MessageCircle size={14} className="text-green-500" />
               </div>
            </div>
            
            {features.autopilot && (
               <button 
                onClick={() => setSettings({...settings, autoPilot: !settings.autoPilot})}
                className={cn(
                  "hidden sm:flex items-center gap-3 px-4 py-2 rounded-xl border transition-all text-xs font-bold",
                  settings.autoPilot ? "bg-brand/10 border-brand/40 text-brand orange-glow" : "bg-zinc-900 border-card-border text-zinc-500"
                )}
               >
                 {settings.autoPilot ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
                 {settings.autoPilot ? "AUTOPILOT: ON" : "AUTOPILOT: PAUSED"}
               </button>
            )}

            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-300 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="bg-card-bg border border-card-border rounded-full py-2 pl-10 pr-6 text-sm w-32 lg:w-64 focus:outline-none focus:border-brand/50 transition-all"
              />
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-zinc-800 border-2 border-brand/50 flex items-center justify-center overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-10 max-w-7xl mx-auto">
          {activeTab === 'war-room' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              {/* TOP STATUS BAR */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <MetricCard 
                  label="PROJEÇÃO TRIMESTRAL" 
                  value={leads.reduce((acc, l) => acc + (l.value || 0) * ((l.probability || 0) / 100), 0)} 
                  prefix="€"
                  trend="+12.4%"
                  icon={<Cpu className="text-brand" size={16} />}
                />
                <MetricCard 
                  label="ATIVOS IMOBILIÁRIOS" 
                  value={properties.reduce((acc, p) => acc + p.price, 0)} 
                  prefix="€"
                  trend="Braga/Viana"
                  icon={<Building2 className="text-zinc-400" size={16} />}
                />
                <MetricCard 
                  label="NEGÓCIOS EM TRÂNSITO" 
                  value={businesses.reduce((acc, b) => acc + b.price, 0)} 
                  prefix="€"
                  trend="Oportunidade"
                  icon={<Briefcase className="text-zinc-400" size={16} />}
                />
                <MetricCard 
                  label="CRÉDITO SOB ANÁLISE" 
                  value={mortgages.reduce((acc, m) => acc + m.amount, 0)} 
                  prefix="€"
                  trend="High Probability"
                  icon={<CreditCard className="text-zinc-400" size={16} />}
                />
              </div>

              {/* MAIN WAR ROOM GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* COLUMN 1: Operational Core (Imóveis + Negócios) */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <ModuleQuadrant 
                        title="IMÓVEIS ALTO MINHO" 
                        icon={<Building2 size={18} />}
                        items={properties.slice(0, 4).map(p => ({
                           id: p.id,
                           title: p.title,
                           meta: `${p.location} • ${p.type}`,
                           value: `€${(p.price/1000).toFixed(0)}k`,
                           status: p.status
                        }))}
                     />
                     <ModuleQuadrant 
                        title="NEGÓCIOS EM CURSO" 
                        icon={<Briefcase size={18} />}
                        items={businesses.slice(0, 4).map(b => ({
                           id: b.id,
                           title: b.title,
                           meta: `${b.location} • ${b.category}`,
                           value: `€${(b.price/1000).toFixed(0)}k`,
                           status: b.status
                        }))}
                     />
                  </div>

                  {/* REGIONAL HEATMAP / PERFORMANCE */}
                  <div className="glass-premium rounded-[2.5rem] p-10 border border-white/5 relative overflow-hidden h-full flex flex-col">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                       <MapPin size={150} />
                    </div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                       <div>
                          <h3 className="text-xl font-bold tracking-tight uppercase">Dashboard de Rendimento Regional</h3>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mt-1">Análise preditiva de hotspots em tempo real</p>
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 px-3 py-1 bg-brand/10 border border-brand/20 rounded-full">
                             <div className="w-1.5 h-1.5 bg-brand rounded-full animate-pulse" />
                             <span className="text-[9px] font-bold text-brand uppercase tracking-tighter">AI_ACTIVE</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                       <div className="space-y-4">
                          {investmentInsights.slice(0, 5).map(region => (
                            <div key={region.location} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl group hover:bg-white/[0.04] transition-all">
                               <div className="flex items-center justify-between mb-3">
                                  <span className="text-xs font-bold tracking-tight">{region.location}</span>
                                  <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 rounded",
                                    region.score > 85 ? "bg-red-500/10 text-red-500" : "bg-brand/10 text-brand"
                                  )}>{region.score > 85 ? 'HIGH_RENTABILITY' : 'GROWING'}</span>
                               </div>
                               <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${region.score}%` }}
                                    className={cn(
                                      "h-full rounded-full",
                                      region.score > 85 ? "bg-red-500" : "bg-brand"
                                    )}
                                  />
                               </div>
                               <div className="flex items-center justify-between">
                                  <div className="flex gap-4">
                                     <div>
                                        <p className="text-[8px] text-zinc-500 uppercase font-mono">Score</p>
                                        <p className="text-sm font-bold">{region.score}</p>
                                     </div>
                                     <div>
                                        <p className="text-[8px] text-zinc-500 uppercase font-mono">Forecast</p>
                                        <p className="text-sm font-bold text-green-500">+{region.forecast}%</p>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <p className="text-[8px] text-zinc-500 uppercase font-mono">ROI</p>
                                     <p className="text-sm font-bold text-brand">{region.yield}%</p>
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                       
                       <div className="bg-zinc-950/50 rounded-3xl border border-white/5 p-6 relative overflow-hidden flex flex-col justify-center items-center text-center">
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(232,81,26,0.1)_0%,transparent_60%)]" />
                          <Activity size={48} className="text-brand/20 mb-6" />
                          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.3em] mb-2 font-mono">Recomendação de Alocação</h4>
                          <p className="text-lg font-bold mb-6 text-white tracking-tight">"Foco agressivo em Viana do Castelo para ativos de yield superior a 8.2%"</p>
                          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-6" />
                          <div className="grid grid-cols-2 gap-8 w-full">
                             <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Confiança IA</p>
                                <p className="text-xl font-bold">94%</p>
                             </div>
                             <div>
                                <p className="text-[10px] text-zinc-500 uppercase font-mono mb-1">Risco Médio</p>
                                <p className="text-xl font-bold text-green-500">Baixo</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: COMMAND FEED + MORTGAGE */}
                <div className="lg:col-span-4 space-y-8">
                   <ModuleQuadrant 
                      title="CRÉDITO HABITAÇÃO" 
                      icon={<CreditCard size={18} />}
                      variant="dark"
                      items={mortgages.map(m => ({
                         id: m.id,
                         title: m.clientName,
                         meta: `${m.bank} • Prob: ${m.probability}%`,
                         value: `€${(m.amount/1000).toFixed(0)}k`,
                         status: m.status.toLowerCase() as any
                      }))}
                   />

                   <div className="glass p-8 rounded-[2.5rem] border border-white/5 h-full min-h-[400px] flex flex-col bg-zinc-950/50">
                      <div className="flex items-center justify-between mb-8">
                         <div className="flex items-center gap-2">
                            <Cpu size={16} className="text-brand" />
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] font-mono">AI Command Stream</h3>
                         </div>
                         <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      </div>
                      
                      <div className="flex-1 space-y-4 overflow-y-auto pr-1 font-mono text-[10px]">
                         <AnimatePresence mode="popLayout">
                            {demoEvents.map((event) => (
                              <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3 text-zinc-500 border-l border-white/5 pl-3 py-1"
                              >
                                 <span className="text-zinc-800">[{event.time.toLocaleTimeString([], { hour12: false })}]</span>
                                 <span className={cn(
                                   "flex-1",
                                   event.type === 'success' ? "text-green-500/80" :
                                   event.type === 'alert' ? "text-red-500/80" : ""
                                 )}>{event.text}</span>
                              </motion.div>
                            ))}
                         </AnimatePresence>
                         {demoEvents.length === 0 && <p className="text-zinc-800 italic">SYSTEM_IDLE... AWAITING_INPUT</p>}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'imoveis' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-3xl font-bold tracking-tight">Portfolio Imobiliário</h3>
                     <p className="text-sm text-zinc-500 mt-1 font-mono">Alto Minho & Norte Litoral // Real-time Units</p>
                  </div>
                  <div className="flex gap-4">
                     <button className="px-6 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all">Filtrar</button>
                     <button className="px-6 py-2 bg-brand text-white rounded-xl text-xs font-bold orange-glow">+ Novo Ativo</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {properties.map(p => (
                     <PropertyCard key={p.id} property={p} />
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'negocios' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="flex items-center justify-between">
                  <div>
                     <h3 className="text-3xl font-bold tracking-tight">Oportunidades de Negócio</h3>
                     <p className="text-sm text-zinc-500 mt-1 font-mono">Trespasse & Ativos Comerciais</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {businesses.map(b => (
                     <BusinessCard key={b.id} business={b} />
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'credito' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                     <div className="glass-premium p-10 rounded-[2.5rem] border border-white/5 bg-dashboard-bg">
                        <div className="flex items-center justify-between mb-10">
                           <h3 className="text-xl font-bold">Motor de Crédito Integrado</h3>
                           <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded-full border border-green-500/20">LIVE_BRIDGE_ACTIVE</span>
                        </div>
                        <div className="space-y-6">
                           {mortgages.map(m => (
                              <MortgageRow key={m.id} mortgage={m} />
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950/40">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-6 font-mono">Performance Crédito</h4>
                        <div className="space-y-8">
                           <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-mono mb-2">Volume Pré-Aprovado</p>
                              <p className="text-4xl font-bold">€{(mortgages.reduce((acc, m) => acc + (m.status === 'Pré-Aprovado' || m.status === 'Aprovado' ? m.amount : 0), 0) / 1000000).toFixed(2)}M</p>
                           </div>
                           <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-brand w-[78%]" />
                           </div>
                           <p className="text-[10px] text-zinc-600 leading-relaxed italic">
                              78% dos processos em análise têm probabilidade de aprovação superior a 85% segundo o scoring Fox Engine.
                           </p>
                        </div>
                     </div>

                     <div className="glass p-8 rounded-[2.5rem] border border-brand/20 bg-brand/5">
                        <ShieldCheck className="text-brand mb-6" size={32} />
                        <h4 className="text-lg font-bold mb-3">Compliance & Risco</h4>
                        <p className="text-sm text-zinc-400 font-light leading-relaxed">
                           Todos os processos são triados automaticamente pela IA contra critérios de risco bancário (DSTI, LTV).
                        </p>
                        <button className="w-full mt-8 py-4 bg-zinc-900 border border-white/5 text-xs font-bold rounded-2xl hover:bg-zinc-800 transition-all">Configurar Filtros de Risco</button>
                     </div>
                   </div>
                </div>
             </div>
           )}

          {activeTab === 'investor' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               {/* INVESTMENT HEADER STATS */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950/40 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-4 text-brand opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={40} />
                     </div>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Investment Score Médio</p>
                     <div className="flex items-baseline gap-2">
                        <h4 className="text-4xl font-bold">{(investmentInsights.reduce((acc, i) => acc + i.score, 0) / investmentInsights.length).toFixed(1)}</h4>
                        <span className="text-xs text-green-500 font-bold font-mono">ULTRA_BULLISH</span>
                     </div>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950/40">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Volume Sob Análise</p>
                     <h4 className="text-4xl font-bold">€{(leads.filter(l => l.type === 'investor' || l.type === 'negócio').reduce((acc, l) => acc + (l.value || 0), 0) / 1000000).toFixed(1)}M</h4>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950/40">
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Yield Média Portfolio</p>
                     <h4 className="text-4xl font-bold">{(investmentInsights.reduce((acc, i) => acc + i.yield, 0) / investmentInsights.length).toFixed(1)}%</h4>
                  </div>
                  <div className="glass p-8 rounded-[2.5rem] border border-brand/20 bg-brand/5">
                     <p className="text-[10px] font-bold text-brand uppercase tracking-widest mb-2 font-mono">IA Forecast (24m)</p>
                     <h4 className="text-4xl font-bold text-white">+{ (investmentInsights.reduce((acc, i) => acc + i.forecast, 0) / investmentInsights.length).toFixed(1) }%</h4>
                  </div>
               </div>

               {/* GIS MAP SECTION */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                     <div className="glass-premium rounded-[3rem] border border-white/5 bg-dashboard-bg overflow-hidden relative h-[650px]">
                        <div className="absolute top-8 left-8 z-20 space-y-4">
                           <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4 w-64">
                              <div className="flex items-center justify-between">
                                 <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-zinc-400">Map Layers</h4>
                                 <Layers size={14} className="text-brand" />
                              </div>
                              <div className="space-y-2">
                                 {['Heatmap: Rentabilidade', 'Zonamento Urbano', 'Projetos Futuros'].map(filter => (
                                    <div key={filter} className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                                       <span className="text-[9px] font-bold uppercase tracking-tighter">{filter}</span>
                                       <div className="w-2 h-2 rounded-full bg-brand" />
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* MOCK 3D MAP VISUALIZATION */}
                        <div className="absolute inset-0 bg-[#070708] flex items-center justify-center">
                           <div className="relative w-full h-full opacity-40">
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(232,81,26,0.1)_0%,transparent_70%)]" />
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                 <div className="w-[800px] h-[600px] relative border border-white/[0.02] rotate-x-12 -rotate-z-12 transform-gpu perspective-1000">
                                    {/* GRID LINES */}
                                    <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-20">
                                       {Array.from({ length: 121 }).map((_, i) => (
                                          <div key={i} className="border-[0.5px] border-zinc-900" />
                                       ))}
                                    </div>
                                    {/* HEATMAP BLOBS */}
                                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand/30 blur-[60px] rounded-full animate-pulse-soft" />
                                    <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-brand/20 blur-[80px] rounded-full" />
                                    
                                    {/* DATA PINS */}
                                    {investmentInsights.map((insight, idx) => (
                                       <motion.div
                                          key={insight.location}
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: insight.score * 2.5, opacity: 1 }}
                                          className="absolute w-1 bg-gradient-to-t from-brand to-transparent group cursor-pointer"
                                          style={{ 
                                             left: `${20 + idx * 12}%`, 
                                             top: `${30 + (idx % 3) * 15}%` 
                                          }}
                                       >
                                          <div className="absolute -top-1 w-2 h-2 -left-0.5 rounded-full bg-brand shadow-[0_0_15px_rgba(232,81,26,0.8)]" />
                                          <div className="absolute -top-12 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all w-32 whitespace-nowrap">
                                             <p className="text-[8px] font-bold text-brand uppercase tracking-widest">{insight.location}</p>
                                             <p className="text-xs font-bold">ROI: {insight.yield.toFixed(1)}%</p>
                                          </div>
                                       </motion.div>
                                    ))}
                                 </div>
                              </div>
                           </div>
                           <div className="absolute bottom-12 right-12 text-right">
                              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.5em] font-mono mb-2">GIS_CORE_V4.2</p>
                              <h3 className="text-3xl font-bold tracking-tighter text-zinc-800">ALTO MINHO ANALYTICS</h3>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-4 space-y-8">
                     <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-zinc-950/40">
                        <div className="flex items-center gap-3 mb-8">
                           <BarChart3 className="text-brand" size={18} />
                           <h3 className="text-xs font-bold uppercase tracking-[0.2em] font-mono">Market Hotspots</h3>
                        </div>
                        <div className="space-y-6">
                           {investmentInsights.sort((a,b) => b.score - a.score).map((insight) => (
                              <div key={insight.location} className="flex items-center justify-between group cursor-pointer">
                                 <div>
                                    <p className="text-sm font-bold">{insight.location}</p>
                                    <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5">Forecast: +{insight.forecast}%</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-lg font-bold text-brand">{insight.score}</p>
                                    <div className="w-16 h-0.5 bg-white/5 rounded-full overflow-hidden mt-1">
                                       <div className="h-full bg-brand" style={{ width: `${insight.score}%` }} />
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="glass-premium p-8 rounded-[2.5rem] border border-white/5 bg-dashboard-bg relative overflow-hidden flex flex-col justify-between h-[300px]">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                           <Globe size={180} />
                        </div>
                        <div className="relative z-10">
                           <h4 className="text-lg font-bold mb-2">Global Opportunity Engine</h4>
                           <p className="text-xs text-zinc-500 leading-relaxed font-light">
                              Cross-checking Northern Portugal yields with international capital flows (D2/D7/Golden Visa).
                           </p>
                        </div>
                        <div className="relative z-10">
                           <button className="w-full py-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-center gap-3 group hover:bg-zinc-800 transition-all">
                              <span className="text-[10px] font-bold uppercase tracking-widest">Relatório Completo</span>
                              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>

               {/* HOT DEALS SECTION */}
               <div className="space-y-8 mt-12">
                  <div className="flex items-center justify-between">
                     <h3 className="text-3xl font-bold tracking-tight uppercase">Hot Deals: Under Market Value</h3>
                     <div className="px-4 py-2 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 text-[10px] font-black flex items-center gap-2 animate-pulse font-mono">
                        <TrendingDown size={14} />
                        OPORTUNIDADES ABAIXO DE 20% KVM DETECTADAS
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {HOT_DEALS.map(deal => (
                        <div key={deal.id} className="glass-premium p-10 rounded-[3rem] border border-white/5 bg-dashboard-bg group hover:border-brand/30 transition-all cursor-pointer relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 blur-[50px] -mr-16 -mt-16" />
                           <div className="flex items-center justify-between mb-8 relative z-10">
                              <div className="p-4 rounded-2xl bg-brand/10 border border-brand/20 text-brand">
                                 <Zap size={24} />
                              </div>
                              <div className="text-right">
                                 <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest font-mono">Discount vs Market</span>
                                 <p className="text-3xl font-bold text-white">-{deal.discount}%</p>
                              </div>
                           </div>

                           <div className="space-y-2 mb-10 relative z-10">
                              <p className="text-[10px] font-bold text-brand uppercase tracking-widest font-mono">{deal.location}</p>
                              <h4 className="text-2xl font-bold tracking-tight text-zinc-100">{deal.title}</h4>
                           </div>

                           <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 relative z-10">
                              <div>
                                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Preço Alvo</p>
                                 <p className="text-lg font-bold">€{(deal.price/1000).toFixed(0)}k</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">ROI Est.</p>
                                 <p className="text-lg font-bold text-green-500">{deal.estRoi}%</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Score IA</p>
                                 <p className="text-lg font-bold text-brand">{deal.investorScore}/100</p>
                              </div>
                           </div>

                           <button className="w-full mt-10 py-5 bg-white text-black rounded-[2rem] text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand hover:text-white transition-all group-hover:scale-[1.02] active:scale-95 shadow-xl">
                              Analisar Business Plan
                              <ArrowUpRight size={18} />
                           </button>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="max-w-5xl space-y-8 pb-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold">Configurações do Sistema</h3>
                  <p className="text-zinc-500 text-sm">Controle as regras de negócio e automação da sua agência.</p>
                </div>
                <div className="flex bg-zinc-900 p-1 rounded-2xl border border-card-border">
                  {[
                    { id: 'geral', label: 'Geral', icon: <Settings size={14} /> },
                    { id: 'automação', label: 'Automação', icon: <Target size={14} /> },
                    { id: 'equipa', label: 'Equipa', icon: <Users size={14} /> },
                    { id: 'planos', label: 'Planos', icon: <Briefcase size={14} /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSettingsTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all",
                        settingsTab === tab.id ? "bg-brand text-white orange-glow" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {settingsTab === 'geral' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-8">
                    <div className="glass rounded-3xl p-8 border border-card-border">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                        Identidade da Agência
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Nome da Agência</label>
                          <input 
                            type="text" 
                            value={settings.agencyName} 
                            onChange={(e) => setSettings({...settings, agencyName: e.target.value})}
                            className="w-full bg-zinc-900 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                           <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Website Corporativo</label>
                           <input 
                            type="text" 
                            defaultValue="www.foxriver.pt" 
                            className="w-full bg-zinc-900 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="glass rounded-3xl p-8 border border-card-border">
                      <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                        Limites e Quotas
                      </h3>
                      <div className="space-y-6">
                        <div className="p-4 bg-zinc-900/50 rounded-2xl border border-card-border">
                          <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold block mb-4">Limite Diário de Leads</label>
                          <div className="flex items-center gap-6">
                            <input 
                              type="range" 
                              min="10" 
                              max="1000" 
                              step="10"
                              value={settings.maxLeadsDay} 
                              onChange={(e) => setSettings({...settings, maxLeadsDay: parseInt(e.target.value)})}
                              className="flex-1 accent-brand"
                            />
                            <span className="text-xl font-bold w-20 text-center">{settings.maxLeadsDay}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 border border-card-border">
                      <h4 className="text-sm font-bold mb-4">Integridade do Sistema</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Uptime AI</span>
                          <span className="font-mono text-green-500">99.98%</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Latência</span>
                          <span className="font-mono text-zinc-400">120ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'automação' && (
                <div className="space-y-8">
                  <div className="glass rounded-3xl p-8 border border-card-border">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-semibold flex items-center gap-3">
                        <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                        Fluxos de Automação
                      </h3>
                      <button 
                        onClick={() => alert('Abrir criador de Workflows...')}
                        className="bg-brand/10 text-brand px-4 py-2 rounded-xl text-xs font-bold hover:bg-brand/20 transition-all"
                      >
                        + Novo Fluxo
                      </button>
                    </div>
                    <div className="divide-y divide-card-border border border-card-border rounded-2xl overflow-hidden">
                      {settings.workflows.map(wf => (
                        <div key={wf.id} className="p-4 bg-zinc-900/30 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-brand">
                              <Target size={20} />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{wf.name}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Gatilho: {wf.trigger}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[10px] bg-brand/10 text-brand px-2 py-0.5 rounded font-bold">{wf.action}</span>
                            <button className="text-zinc-500 hover:text-white"><Settings size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-3xl p-8 border border-card-border">
                    <h3 className="text-lg font-semibold mb-6">Regras Globais de Resposta</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-6 bg-zinc-900/50 rounded-2xl border border-card-border">
                         <h4 className="text-sm font-bold mb-4">Piloto Automático Inteligente</h4>
                         <p className="text-xs text-zinc-500 mb-6">Quando ativado, a IA assume as primeiras 5 mensagens de cada conversa para qualificar o lead.</p>
                         <button 
                          onClick={() => setSettings({...settings, autoPilot: !settings.autoPilot})}
                          className={cn(
                            "w-full py-3 rounded-xl border text-xs font-bold transition-all",
                            settings.autoPilot ? "bg-brand text-white border-brand orange-glow" : "bg-zinc-800 border-transparent text-zinc-500"
                          )}
                        >
                          {settings.autoPilot ? "ATURANDO - ONLINE" : "DESATIVADO - MANUAL"}
                        </button>
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Personalidade da IA</label>
                        <select className="w-full bg-zinc-900 border border-card-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand">
                          <option>Profissional e Executivo</option>
                          <option>Amigável e Casual</option>
                          <option>Agressivo e Focado em Fecho</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'equipa' && (
                <div className="space-y-8">
                  <div className="glass rounded-3xl p-8 border border-card-border">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-semibold">Membros da Plataforma</h3>
                      <button className="bg-brand text-white px-6 py-2 rounded-xl text-xs font-bold orange-glow">+ Convidar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[
                        { name: 'Admin Principal', role: 'Owner', email: 'pt.jcosta@gmail.com' },
                        { name: 'Consultor Carlos', role: 'Membro', email: 'carlos@foxriver.pt' },
                        { name: 'Maria Imobiliário', role: 'Membro', email: 'maria@foxriver.pt' }
                      ].map(member => (
                        <div key={member.email} className="p-6 bg-zinc-900/50 rounded-2xl border border-card-border relative group">
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Settings size={14} className="text-zinc-600 hover:text-white cursor-pointer" />
                          </div>
                          <div className="w-12 h-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold mb-4">
                            {member.name[0]}
                          </div>
                          <h4 className="text-sm font-bold">{member.name}</h4>
                          <p className="text-[10px] text-zinc-500 mb-4">{member.email}</p>
                          <span className={cn(
                            "text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded",
                            member.role === 'Owner' ? "bg-brand/20 text-brand" : "bg-zinc-800 text-zinc-400"
                          )}>
                            {member.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'planos' && (
                <div className="space-y-8">
                  <div className="glass rounded-3xl p-8 border border-card-border">
                    <h3 className="text-lg font-semibold mb-8">Subscrição da Agência</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="p-6 bg-brand/5 border border-brand/20 rounded-3xl">
                          <span className="text-[10px] uppercase font-bold text-brand tracking-widest">Plano Atual</span>
                          <h4 className="text-3xl font-bold mt-2">Enterprise AI</h4>
                          <p className="text-zinc-500 text-sm mt-1">Uso ilimitado de copiloto e angariação</p>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-zinc-400">Próxima fatura</span>
                             <span className="font-bold">14 Maio, 2026</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                             <span className="text-zinc-400">Valor mensal</span>
                             <span className="font-bold">€249.00</span>
                           </div>
                        </div>
                      </div>
                      <div className="p-6 bg-zinc-900/50 rounded-3xl border border-card-border">
                         <h4 className="font-bold mb-4">Método de Pagamento</h4>
                         <div className="flex items-center gap-4 p-4 bg-zinc-900 rounded-2xl border border-card-border mb-6">
                            <div className="w-10 h-6 bg-zinc-800 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                            <div>
                               <p className="text-xs font-bold">•••• 4429</p>
                               <p className="text-[10px] text-zinc-500">Expira em 12/28</p>
                            </div>
                         </div>
                         <button className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all">Alterar Cartão</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-4 mt-12 bg-dashboard-bg/80 backdrop-blur-md p-4 rounded-2xl border border-card-border sticky bottom-4 z-10">
                 <button className="px-8 py-3 rounded-xl bg-zinc-900 border border-card-border text-sm font-semibold hover:bg-zinc-800 transition-colors">Descartar</button>
                 <button 
                  onClick={() => alert('Configurações da agência guardadas com sucesso!')}
                  className="px-8 py-3 rounded-xl bg-brand text-white text-sm font-semibold orange-glow hover:bg-brand-hover transition-colors"
                 >
                   Guardar Tudo
                 </button>
              </div>
            </div>
          )}

          {activeTab === 'copilot' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="glass rounded-3xl p-8 border border-card-border">
                  <h3 className="text-xl font-bold mb-4">Central de Copiloto IA</h3>
                  <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
                    Sua IA está atualmente treinada em 4.2k interações do mercado imobiliário local. 
                    Ela consegue identificar intenção de compra vs curiosidade em 0.4s.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-zinc-900/50 rounded-2xl border border-card-border">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                            <Target size={18} />
                          </div>
                          <span className="font-semibold text-sm">Targeting</span>
                       </div>
                       <p className="text-xs text-zinc-400">Focado em leads de alta rotatividade em centros urbanos.</p>
                    </div>
                    <div className="p-6 bg-zinc-900/50 rounded-2xl border border-card-border">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                            <MessageSquare size={18} />
                          </div>
                          <span className="font-semibold text-sm">Tom de Voz</span>
                       </div>
                       <p className="text-xs text-zinc-400">Profissional, acolhedor e focado na urgência da oportunidade.</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass rounded-3xl p-8 border border-card-border">
                  <h4 className="font-semibold mb-6">Logs de Actividade AI</h4>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-card-border last:border-0 border-dashed">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-xs text-zinc-300">Resposta enviada para Lead #348</span>
                        </div>
                        <span className="text-[10px] text-zinc-600">há {i * 2}min</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-brand/10 border border-brand/20 p-6 rounded-3xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand/20 blur-3xl rounded-full transition-all group-hover:scale-150" />
                  <Target className="text-brand mb-4" size={32} />
                  <h4 className="text-lg font-bold mb-2">Treino em Tempo Real</h4>
                  <p className="text-xs text-brand/80 mb-6">Submeta os seus scripts de venda favoritos para a sua IA aprender o seu estilo único.</p>
                  <button 
                    onClick={() => alert('A carregar base de conhecimento... A IA começará a processar os seus scripts em segundos.')}
                    className="w-full bg-brand text-white py-3 rounded-xl text-xs font-bold orange-glow hover:bg-brand-hover transition-colors"
                  >
                    Treinar Agora
                  </button>
                </div>
                
                <div className="glass border border-card-border p-6 rounded-3xl">
                   <h4 className="text-sm font-bold mb-4">Performance AI</h4>
                   <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 font-bold uppercase">
                          <span>Acurácia</span>
                          <span>98%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                           <div className="h-full bg-brand w-[98%]" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1 font-bold uppercase">
                          <span>Velocidade</span>
                          <span>99%</span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                           <div className="h-full bg-brand w-[99%]" />
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recruiter' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Recrutamento Inteligente</h3>
                  <p className="text-zinc-500 text-sm">Expanda a sua equipa com consultores de topo filtrados por IA.</p>
                </div>
                <button 
                  onClick={() => alert('Defina os critérios da vaga e a IA irá filtrar candidatos no LinkedIn e Instagram automaticamente.')}
                  className="bg-brand px-6 py-3 rounded-xl text-sm font-bold orange-glow flex items-center gap-2 hover:bg-brand-hover transition-colors"
                >
                   <Users size={18} />
                   Abrir Vaga Nova
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard icon={<Users size={24} />} label="Candidatos" value={leads.filter(l => l.type === 'angariador').length} trend="+12" color="purple" />
                <KPICard icon={<MessageSquare size={24} />} label="Entrevistas" value={leads.filter(l => l.type === 'angariador' && l.status === 'entrevista').length} trend="Ativas" color="brand" />
                <KPICard icon={<Target size={24} />} label="Contratados" value={leads.filter(l => l.type === 'angariador' && l.status === 'contratado').length} trend="Total" color="blue" />
              </div>

              <div className="glass border border-card-border rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-card-border bg-dashboard-bg/50">
                  <h4 className="font-bold">Candidatos Recentes</h4>
                </div>
                <div className="divide-y divide-card-border">
                  {leads.filter(l => l.type === 'angariador').map(c => (
                    <div key={c.id} className="p-6 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-zinc-800 border border-card-border flex items-center justify-center">
                            <Users className="text-zinc-500" size={20} />
                          </div>
                          <div>
                            <h5 className="font-bold text-sm">{c.name}</h5>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{c.interest}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <div className="text-xs font-bold text-brand uppercase">{c.status}</div>
                             <div className="text-[10px] text-zinc-600">Submetido há 4h</div>
                          </div>
                          <button 
                            onClick={() => { setSelectedLeadId(c.id); setIsChatOpen(true); }}
                            className="bg-zinc-900 border border-card-border px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-800 transition-all"
                          >
                            Ver Perfil
                          </button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Modal / Sidebar */}
      <AnimatePresence>
        {isChatOpen && selectedLead && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full lg:w-[500px] h-full bg-card-bg border-l border-card-border flex flex-col shadow-2xl"
            >
              {/* Chat Header */}
              <div className="p-4 lg:p-6 border-b border-card-border bg-dashboard-bg flex items-center justify-between">
                <div className="flex items-center gap-3 lg:gap-4">
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedLead.name}`} className="rounded-full" alt="" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base lg:text-lg truncate max-w-[150px] lg:max-w-none">{selectedLead.name}</h3>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                       <span className="text-[10px] lg:text-xs text-zinc-500">Online via {selectedLead.origin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <MoreVertical size={18} />
                  </button>
                  <button onClick={() => setIsChatOpen(false)} className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <X size={22} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0a0a0b] bg-[radial-gradient(#1a1a1f_1px,transparent_1px)] bg-[size:20px_20px]">
                <div className="flex justify-center mb-10">
                   <div className="bg-zinc-900 border border-card-border px-4 py-2 rounded-2xl">
                      <p className="text-xs text-zinc-500 text-center">
                        <Target size={12} className="inline mr-2 text-brand" />
                        AI Copilot ativado para captar {selectedLead.type}
                      </p>
                      <p className="text-[10px] text-zinc-700 text-center mt-1 italic">
                        "Pretende: {selectedLead.interest}"
                      </p>
                   </div>
                </div>
                
                {(chatHistory[selectedLead.id] || []).map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      msg.sender === 'ai' ? "mr-auto items-start" : "ml-auto items-end"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-2xl text-sm",
                      msg.sender === 'ai' 
                        ? "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700/50" 
                        : "bg-brand text-white rounded-tr-none orange-glow"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))}
                {isTyping && (
                   <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mr-auto bg-zinc-800 px-4 py-2 rounded-full text-xs text-zinc-400 flex gap-1 items-center"
                   >
                     <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                     <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                     <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
                     IA a escrever...
                   </motion.div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-card-border bg-dashboard-bg/80 backdrop-blur-md">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.message as HTMLInputElement;
                    handleSendMessage(input.value);
                    input.value = '';
                  }}
                  className="flex gap-4"
                >
                  <input 
                    name="message"
                    type="text" 
                    autoComplete="off"
                    placeholder="Escreva uma mensagem..."
                    className="flex-1 bg-zinc-900 border border-card-border rounded-2xl px-6 py-3 text-sm focus:outline-none focus:border-brand transition-colors"
                  />
                  <button 
                    type="submit"
                    className="w-12 h-12 rounded-2xl bg-brand flex items-center justify-center text-white hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({ 
  activeTab, 
  setActiveTab, 
  isDemoActive, 
  setIsDemoActive,
  settings,
  agencies,
  currentAgencyId,
  setCurrentAgencyId,
  onClose,
  features
}: { 
  activeTab: string, 
  setActiveTab: (tab: any) => void, 
  isDemoActive: boolean, 
  setIsDemoActive: (val: boolean) => void,
  settings: any,
  agencies: any[],
  currentAgencyId: string,
  setCurrentAgencyId: (id: string) => void,
  onClose?: () => void,
  features: any
}) {
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    onClose?.();
  };

  return (
    <>
      <div className="p-8 pb-4 flex items-center gap-4">
        <div className="w-10 h-10 bg-brand rounded-2xl flex items-center justify-center orange-glow shrink-0">
          <Target className="text-white" size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <select 
            value={currentAgencyId}
            onChange={(e) => setCurrentAgencyId(e.target.value)}
            className="bg-transparent border-none text-white font-bold text-sm tracking-tight uppercase focus:ring-0 w-full cursor-pointer appearance-none hover:text-brand transition-colors p-0"
          >
            {agencies.map(a => (
              <option key={a.id} value={a.id} className="bg-zinc-950 text-white">{a.name.split(' ')[0]}</option>
            ))}
          </select>
          <div className="flex items-center gap-1.5 mt-0.5">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
             <p className="text-[9px] text-zinc-600 uppercase tracking-[0.2em] font-bold">Fox River Engine</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-8">
        <NavItem 
          active={activeTab === 'war-room'} 
          onClick={() => handleTabChange('war-room')}
          icon={<LayoutDashboard size={18} />}
          label="War Room"
        />
        <NavItem 
          active={activeTab === 'imoveis'} 
          onClick={() => handleTabChange('imoveis')}
          icon={<Building2 size={18} />}
          label="Imóveis"
        />
        <NavItem 
          active={activeTab === 'negocios'} 
          onClick={() => handleTabChange('negocios')}
          icon={<Briefcase size={18} />}
          label="Negócios"
        />
        <NavItem 
          active={activeTab === 'credito'} 
          onClick={() => handleTabChange('credito')}
          icon={<CreditCard size={18} />}
          label="Crédito Habitação"
        />
        <NavItem 
          active={activeTab === 'leads'} 
          onClick={() => handleTabChange('leads')}
          icon={<Target size={18} />}
          label="Leads & Pipeline"
        />

        <div className="h-px bg-white/5 my-4" />

        <NavItem 
          active={activeTab === 'investor'} 
          onClick={() => handleTabChange('investor')}
          icon={<Globe size={18} />}
          label="Investor Mode (PRO)"
        />

        <div className="pt-8 space-y-2">
          <NavItem 
            active={activeTab === 'settings'}
            onClick={() => handleTabChange('settings')}
            icon={<Settings size={18} />}
            label="Configurações"
          />
        </div>
      </nav>

      <div className="p-6 border-t border-card-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-zinc-500">Modo Demo</span>
          <button 
            onClick={() => setIsDemoActive(!isDemoActive)}
            className={cn(
              "relative w-10 h-5 lg:w-12 lg:h-6 rounded-full transition-colors",
              isDemoActive ? "bg-brand" : "bg-zinc-800"
            )}
          >
            <div className={cn(
              "absolute top-1 left-1 w-3 h-3 lg:w-4 lg:h-4 bg-white rounded-full transition-transform",
              isDemoActive ? "translate-x-5 lg:translate-x-6" : "translate-x-0"
            )} />
          </button>
        </div>
        <button 
          onClick={() => handleTabChange('settings')}
          className={cn(
            "flex items-center gap-3 text-sm transition-colors w-full px-2 py-2 rounded-xl",
            activeTab === 'settings' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          <Settings size={18} />
          Configurações
        </button>
        <button 
          onClick={() => {
            if(confirm('Deseja realmente sair da plataforma?')) {
              window.location.reload();
            }
          }}
          className="flex items-center gap-3 text-sm text-red-500/80 hover:text-red-500 transition-colors w-full px-2 py-2 mt-2"
        >
          <Power size={18} />
          Sair
        </button>
      </div>
    </>
  );
}

function NavItem({ active, onClick, icon, label }: { active?: boolean, onClick?: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full px-5 py-3 rounded-2xl text-[13px] transition-all duration-500 group relative",
        active 
          ? "bg-white/[0.03] text-white border border-white/5 shadow-2xl" 
          : "text-zinc-500 hover:text-zinc-200"
      )}
    >
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute -left-2 w-1 h-4 bg-brand rounded-full orange-glow"
        />
      )}
      <div className={cn(
        "transition-all duration-500",
        active ? "text-brand scale-110" : "text-zinc-600 group-hover:text-zinc-400 group-hover:scale-105"
      )}>
        {React.cloneElement(icon as React.ReactElement, { size: 18 })}
      </div>
      <span className={cn(
        "tracking-tight",
        active ? "font-bold" : "font-medium"
      )}>{label}</span>
      {active && <ChevronRight className="ml-auto text-brand/50" size={14} />}
    </button>
  );
}

function KPICard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string | number, trend: string, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="flex flex-col justify-between gap-4">
        <div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1 font-mono">{label}</p>
          <h4 className="text-2xl font-bold tracking-tight">
             {typeof value === 'number' ? <AnimatedCounter value={value} /> : value}
          </h4>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
             {trend}
           </span>
           <span className="text-[10px] text-zinc-600 font-medium">vs total</span>
        </div>
      </div>
    </motion.div>
  );
}

function OriginIcon({ origin }: { origin: string }) {
  switch (origin) {
    case 'Instagram': return <Instagram className="text-pink-500" size={14} />;
    case 'Facebook': return <Facebook className="text-blue-500" size={14} />;
    case 'WhatsApp': return <MessageCircle className="text-green-500" size={14} />;
    default: return null;
  }
}

function PipelineGroup({ title, leads, stages, onSelectLead }: { title: string, leads: Lead[], stages: string[], onSelectLead: (id: string) => void }) {
  return (
    <div className="space-y-6 lg:space-y-10">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-1.5 bg-brand rounded-full orange-glow" />
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {stages.map(stage => (
          <div key={stage} className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 font-mono italic">{stage}</span>
                 <div className="w-1 h-1 rounded-full bg-zinc-800" />
              </div>
              <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 border border-white/5 py-0.5 px-2 rounded-full font-mono">
                 {leads.filter(l => l.status === stage).length}
              </span>
            </div>
            
            <div className="space-y-4 min-h-[100px] rounded-[2rem] border border-dashed border-white/5 p-4">
              <AnimatePresence mode="popLayout">
                {leads.filter(l => l.status === stage).map(lead => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => onSelectLead(lead.id)}
                    className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-brand/40 group cursor-pointer transition-all active:scale-[0.96]"
                  >
                    <div className="flex items-center justify-between mb-4">
                       <span className="text-sm font-bold text-zinc-200 truncate pr-4">{lead.name}</span>
                       <OriginIcon origin={lead.origin} />
                    </div>
                    
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand" style={{ width: `${lead.score}%` }} />
                             </div>
                             <span className="text-[9px] font-bold text-zinc-500 font-mono">{lead.score}%</span>
                          </div>
                          <span className="text-sm font-bold text-brand">€{(lead.value/1000).toFixed(0)}k</span>
                       </div>
                       
                       <div className="flex items-center justify-between pt-4 border-t border-white/5">
                          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">{lead.scoreLabel}</span>
                          <span className="text-[9px] font-mono text-zinc-700">{new Date(lead.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- WAR ROOM COMPONENTS ---

function MetricCard({ label, value, prefix = "", trend, icon, secondaryValue }: { label: string, value: number, prefix?: string, trend?: string, icon: React.ReactNode, secondaryValue?: string }) {
  return (
    <div className="glass p-6 rounded-[2rem] border border-white/5 bg-dashboard-bg relative group overflow-hidden hover:border-brand/30 transition-all cursor-crosshair">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-brand transition-all">
         {icon}
      </div>
      <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-4 font-mono flex items-center gap-2">
         <span className="w-1 h-1 bg-brand rounded-full animate-pulse" />
         {label}
      </p>
      
      <div className="space-y-1">
         <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-bold tracking-tighter">
               <AnimatedCounter value={value} prefix={prefix} />
            </h4>
            {trend && (
               <span className={cn(
                  "text-[10px] font-black px-1.5 py-0.5 rounded",
                  trend.startsWith('+') ? "bg-green-500/10 text-green-500" : "bg-zinc-800 text-zinc-500"
               )}>
                  {trend}
               </span>
            )}
         </div>
         {secondaryValue && (
            <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{secondaryValue}</p>
         )}
      </div>
      
      <div className="mt-6 flex gap-1 items-end h-3">
         {[...Array(12)].map((_, i) => (
            <div 
               key={i} 
               className={cn(
                  "flex-1 rounded-full transition-all duration-500",
                  i < 8 ? "bg-brand/20 group-hover:bg-brand" : "bg-zinc-800"
               )}
               style={{ height: `${Math.random() * 100}%` }}
            />
         ))}
      </div>
    </div>
  );
}

function ModuleQuadrant({ title, icon, items, variant = 'light' }: { title: string, icon: React.ReactNode, items: any[], variant?: 'light' | 'dark' }) {
  return (
    <div className={cn(
      "glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col",
      variant === 'dark' ? "bg-zinc-950/40" : "bg-dashboard-bg"
    )}>
      <div className="flex items-center gap-3 mb-8 px-1">
         <div className="text-brand opacity-80">{icon}</div>
         <h3 className="text-xs font-bold uppercase tracking-[0.2em] font-mono">{title}</h3>
      </div>
      
      <div className="space-y-4 flex-1">
        {items.map((item) => (
          <div key={item.id} className="group cursor-pointer p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all">
            <div className="flex items-center justify-between mb-1">
               <span className="text-[11px] font-bold text-zinc-300 truncate mr-2">{item.title}</span>
               <span className="text-[11px] font-bold text-white shrink-0">{item.value}</span>
            </div>
            <div className="flex items-center justify-between">
               <span className="text-[9px] text-zinc-600 font-mono italic">{item.meta}</span>
               <span className={cn(
                 "text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded",
                 item.status === 'disponível' || item.status === 'aprovado' ? "bg-green-500/10 text-green-500" :
                 item.status === 'fechado' || item.status === 'vendido' ? "bg-brand/10 text-brand" :
                 "bg-zinc-800 text-zinc-500"
               )}>{item.status}</span>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-[10px] text-zinc-700 italic px-2">A aguardar dados...</p>}
      </div>
    </div>
  );
}

function PropertyCard({ property }: { property: Property } & React.Attributes) {
   return (
      <div className="glass group rounded-[2.5rem] border border-white/5 overflow-hidden transition-all hover:border-white/10 hover:shadow-2xl">
         <div className="h-48 bg-zinc-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
               <span className="text-[10px] font-bold text-white uppercase tracking-widest">{property.status}</span>
            </div>
            <div className="absolute bottom-4 left-6">
               <p className="text-[10px] font-bold text-brand uppercase tracking-widest font-mono mb-1">{property.type}</p>
               <h3 className="text-xl font-bold">{property.title}</h3>
            </div>
         </div>
         <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin size={14} />
                  <span className="text-xs">{property.location}</span>
               </div>
               <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                  <span>{property.sqm}m²</span>
                  {property.beds && <span> • {property.beds} quartos</span>}
               </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-2xl font-bold tracking-tight">€{property.price.toLocaleString()}</span>
                <button className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:bg-brand hover:text-white transition-all">
                   <ChevronRight size={18} />
                </button>
            </div>
         </div>
      </div>
   );
}

function BusinessCard({ business }: { business: BusinessTraspass } & React.Attributes) {
   return (
      <div className="glass-premium group rounded-[2.5rem] border border-white/5 p-10 space-y-8 relative overflow-hidden transition-all hover:-translate-y-1">
         <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand/5 blur-3xl rounded-full" />
         <div className="flex items-center justify-between relative z-10">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-brand group-hover:bg-brand group-hover:text-white transition-all">
               <Briefcase size={22} />
            </div>
            <span className={cn(
              "text-[9px] font-bold uppercase tracking-[0.2em] px-2 py-1 rounded border",
              business.status === 'disponível' ? "border-green-500/20 text-green-500" : "border-white/10 text-zinc-500"
            )}>{business.status}</span>
         </div>
         <div className="space-y-2 relative z-10">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">{business.category}</p>
            <h3 className="text-2xl font-bold tracking-tight">{business.title}</h3>
            <p className="text-xs text-zinc-500 italic">{business.location}</p>
         </div>
         <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
               <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Preço</p>
               <p className="text-lg font-bold">€{(business.price / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
               <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Rev. Mensal</p>
               <p className="text-lg font-bold">€{(business.revenue / 1000).toFixed(1)}k</p>
            </div>
         </div>
      </div>
   );
}

function MortgageRow({ mortgage }: { mortgage: MortgageProcess } & React.Attributes) {
   return (
      <div className="glass p-6 rounded-3xl border border-white/5 flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
         <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-brand transition-colors shrink-0">
            <CreditCard size={24} />
         </div>
         <div className="flex-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 font-mono">{mortgage.bank}</p>
            <h4 className="text-lg font-bold tracking-tight">{mortgage.clientName}</h4>
            <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-green-500" />
                  <span className="text-[10px] text-zinc-500">{mortgage.status}</span>
               </div>
               <span className="text-[10px] text-zinc-600 italic">Previsão: {mortgage.probability}%</span>
            </div>
         </div>
         <div className="text-right">
            <p className="text-xl font-bold">€{(mortgage.amount / 1000).toFixed(0)}k</p>
            <button className="text-[10px] font-bold text-brand uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Ver Detalhes</button>
         </div>
      </div>
   );
}
