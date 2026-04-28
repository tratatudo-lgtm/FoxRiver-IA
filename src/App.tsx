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
  PauseCircle
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
  Area
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Lead, LeadType, LeadStatus, ChatMessage, STATUS_MAP } from './types';
import { useDemoMode } from './hooks/useDemoMode';
import { getAIReply } from './lib/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipelines' | 'crm' | 'settings' | 'copilot' | 'recruiter' | 'insights' | 'ranking' | 'forecast'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]); // Will populate in useEffect
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

  useDemoMode(isDemoActive, handleNewLead);

  // Pipeline Evolution Simulation
  useEffect(() => {
    if (!isDemoActive || !settings.autoPilot) return;

    const interval = setInterval(() => {
      setLeads(prev => {
        if (prev.length === 0) return prev;
        const randomIndex = Math.floor(Math.random() * prev.length);
        const lead = prev[randomIndex];
        
        // Only move some leads
        if (Math.random() > 0.7) {
          const stages = STATUS_MAP[lead.type as any] || STATUS_MAP['angariador'];
          const currentStageIndex = stages.indexOf(lead.status);
          
          if (currentStageIndex < stages.length - 1) {
            const nextStatus = stages[currentStageIndex + 1];
            const updatedLead = { 
              ...lead, 
              status: nextStatus,
              score: Math.min(100, (lead.score || 0) + 5),
              probability: Math.min(100, (lead.probability || 0) + 10)
            };
            
            // Log move
            console.log(`Pipeline: ${lead.name} moved to ${nextStatus}`);
            
            return prev.map((l, i) => i === randomIndex ? updatedLead : l);
          }
        }
        return prev;
      });
    }, 15000); // Every 15 seconds try to move someone

    return () => clearInterval(interval);
  }, [isDemoActive, settings.autoPilot]);

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
              {activeTab === 'crm' ? 'Gestão de Leads' : activeTab}
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
          {activeTab === 'dashboard' && (
            <div className="space-y-6 lg:space-y-10">
              {/* KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-6">
                <KPICard 
                  icon={<TrendingUp size={24} />} 
                  label="Leads Hoje" 
                  value={kpis.leadsToday} 
                  color="brand" 
                  trend="+24%" 
                />
                <KPICard 
                   icon={<Briefcase size={24} />} 
                   label="Forecast" 
                   value={`€${(leads.reduce((acc, l) => acc + (l.value || 0) * ((l.probability || 0) / 100), 0) / 1000).toFixed(1)}k`} 
                   color="green" 
                   trend="Estimado" 
                />
                <KPICard icon={<Target size={24} />} label="Compradores" value={kpis.buyers} color="blue" trend="+8%" />
                <KPICard icon={<Phone size={24} />} label="Vendedores" value={kpis.sellers} color="green" trend="+12%" />
                {features.insights && (
                   <div className="col-span-2 glass border border-red-500/20 bg-red-500/5 p-4 lg:p-6 rounded-3xl flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-red-500 tracking-widest mb-1">Valor Potencial Perdido</p>
                        <h4 className="text-xl lg:text-2xl font-bold">€15,200</h4>
                        <p className="text-[10px] text-zinc-500 mt-1">Leads sem resposta &gt; 24h</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <Clock size={24} />
                      </div>
                   </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Stats Chart */}
                <div className="lg:col-span-8 glass rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-card-border overflow-hidden">
                  <div className="flex items-center justify-between mb-6 lg:mb-8">
                    <div>
                      <h3 className="text-base lg:text-lg font-semibold">Volume de Leads</h3>
                      <p className="text-xs lg:text-sm text-zinc-500">Evolução de 7 dias</p>
                    </div>
                    <select className="bg-zinc-900 border border-card-border rounded-lg px-2 lg:px-3 py-1.5 text-[10px] lg:text-xs focus:outline-none">
                      <option>Esta semana</option>
                      <option>Último mês</option>
                    </select>
                  </div>
                  <div className="h-[200px] lg:h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E8511A" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#E8511A" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A1E" />
                        <XAxis dataKey="name" stroke="#52525B" fontSize={10} lg:fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#52525B" fontSize={10} lg:fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#161618', border: '1px solid #26262A', borderRadius: '12px' }}
                          itemStyle={{ color: '#E8511A' }}
                        />
                        <Area type="monotone" dataKey="leads" stroke="#E8511A" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Real-time Feed */}
                <div className="lg:col-span-4 glass rounded-2xl lg:rounded-3xl p-6 lg:p-8 border border-card-border flex flex-col max-h-[500px]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-base lg:text-lg font-semibold">Feed Live</h3>
                    <div className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[9px] text-green-500 font-bold tracking-wider">ONLINE</div>
                  </div>
                  <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    <AnimatePresence mode="popLayout">
                      {leads.map((lead) => (
                        <motion.div
                          key={lead.id}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          onClick={() => {
                            setSelectedLeadId(lead.id);
                            setIsChatOpen(true);
                          }}
                          className="group p-3 lg:p-4 bg-zinc-900/50 border border-card-border rounded-xl lg:rounded-2xl cursor-pointer transition-all hover:border-brand/40"
                        >
                          <div className="flex items-start justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                lead.type === 'comprador' ? "bg-blue-400" : lead.type === 'vendedor' ? "bg-green-400" : "bg-purple-400"
                              )} />
                              <span className="text-xs lg:text-sm font-medium truncate max-w-[120px]">{lead.name}</span>
                            </div>
                            <OriginIcon origin={lead.origin} />
                          </div>
                          <p className="text-[10px] lg:text-xs text-zinc-500 line-clamp-1 mb-2">{lead.interest}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] lg:text-[10px] text-zinc-600 flex items-center gap-1">
                              {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{lead.type}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipelines' && (
            <div className="space-y-12">
              <PipelineGroup
                title="Compradores"
                leads={leads.filter(l => l.type === 'comprador')}
                stages={['fria', 'morna', 'quente']}
                onSelectLead={(id) => { setSelectedLeadId(id); setIsChatOpen(true); }}
              />
              <PipelineGroup
                title="Vendedores"
                leads={leads.filter(l => l.type === 'vendedor')}
                stages={['novo', 'avaliação', 'angariado']}
                onSelectLead={(id) => { setSelectedLeadId(id); setIsChatOpen(true); }}
              />
              <PipelineGroup
                title="Angariadores"
                leads={leads.filter(l => l.type === 'angariador')}
                stages={['candidato', 'entrevista', 'contratado']}
                onSelectLead={(id) => { setSelectedLeadId(id); setIsChatOpen(true); }}
              />
            </div>
          )}

          {activeTab === 'crm' && (
            <div className="space-y-6 lg:space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Gestão Geral de Leads</h3>
                  <p className="text-zinc-500 text-sm">Lista completa de todos os contactos centralizados.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="p-2 border border-card-border rounded-xl hover:bg-zinc-800 transition-all">
                    <Filter size={20} />
                  </button>
                  <button className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-bold orange-glow hover:bg-brand-hover transition-colors">
                    Exportar CSV
                  </button>
                </div>
              </div>

              <div className="glass border border-card-border rounded-3xl overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead>
                    <tr className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-card-border">
                      <th className="p-6">Lead</th>
                      <th className="p-6">Status</th>
                      <th className="p-6">Origem</th>
                      <th className="p-6">Score / Prob.</th>
                      <th className="p-6">Valor Est.</th>
                      <th className="p-6 text-right">Acções</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-card-border flex items-center justify-center font-bold">
                              {lead.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-bold">{lead.name}</p>
                              <p className="text-[10px] text-zinc-500 mt-0.5">{lead.interest}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                           <span className="text-[9px] font-bold uppercase py-1 px-2 rounded bg-zinc-900 border border-card-border">
                              {lead.status}
                           </span>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <OriginIcon origin={lead.origin} />
                            <span className="text-xs text-zinc-400">{lead.origin}</span>
                          </div>
                        </td>
                        <td className="p-6">
                           <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                  lead.score! > 75 ? "bg-red-500/10 text-red-500" : 
                                  lead.score! > 40 ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                  {lead.scoreLabel} ({lead.score})
                                </span>
                              </div>
                              <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-brand" style={{ width: `${lead.probability}%` }} />
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <span className="text-sm font-bold text-brand">€{(lead.value / 1000).toFixed(0)}k</span>
                        </td>
                        <td className="p-6 text-right">
                          <button 
                            onClick={() => { setSelectedLeadId(lead.id); setIsChatOpen(true); }}
                            className="p-2 hover:bg-brand/10 hover:text-brand rounded-lg transition-all text-zinc-500"
                          >
                            <MessageSquare size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div className="space-y-10">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Insights de Performance</h3>
                  <p className="text-zinc-500 text-sm">Análise detalhada do seu pipeline e eficiência da IA.</p>
                </div>
                <div className="flex items-center gap-2">
                   <div className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-bold border border-green-500/20 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      AUTOPILOT ATIVO
                   </div>
                </div>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass rounded-3xl p-8 border border-card-border">
                   <h4 className="font-bold mb-6">Eficiência de Resposta (Média)</h4>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={CHART_DATA}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f23" />
                            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#161618', border: '1px solid #26262A', borderRadius: '12px' }}
                            />
                            <Bar dataKey="leads" fill="#E8511A" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="space-y-8">
                   <div className="glass rounded-3xl p-8 border border-card-border">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Tempo de Resposta</h4>
                      <div className="space-y-6">
                         <div>
                            <p className="text-3xl font-bold">0.4s</p>
                            <p className="text-xs text-zinc-500">Média via Copiloto AI</p>
                         </div>
                         <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                            <div className="h-full bg-brand w-[85%]" />
                         </div>
                         <p className="text-[10px] text-zinc-600">85% mais rápido que a média do mercado local.</p>
                      </div>
                   </div>
                   <div className="glass rounded-3xl p-8 border border-card-border bg-brand/5">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-brand mb-4">Ação Recomendada</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed">
                        Detectamos que 12 leads "compradores" em Lisboa estão sem follow-up há 3 dias. 
                        <strong> Ativar sequência de re-engagement?</strong>
                      </p>
                      <button className="w-full mt-6 py-3 bg-brand text-white rounded-xl text-xs font-bold orange-glow">Executar Agora</button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ranking' && (
            <div className="space-y-8">
              <header>
                <h3 className="text-2xl font-bold">Ranking de Consultores</h3>
                <p className="text-zinc-500 text-sm">Performance em tempo real da sua equipa.</p>
              </header>

              <div className="glass rounded-3xl border border-card-border overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-900/50 text-[10px] uppercase tracking-widest text-zinc-500 border-b border-card-border">
                      <th className="p-6">Posição</th>
                      <th className="p-6">Consultor</th>
                      <th className="p-6">Conversão</th>
                      <th className="p-6">Tempo Resp.</th>
                      <th className="p-6">Volume (€)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-card-border">
                    {[
                      { pos: 1, name: 'Carlos Mendes', conv: '18.2%', resp: '12min', vol: '€2.4M' },
                      { pos: 2, name: 'Ana Silva', conv: '15.4%', resp: '5min', vol: '€1.8M' },
                      { pos: 3, name: 'João Costa', conv: '12.1%', resp: '45min', vol: '€1.2M' },
                      { pos: 4, name: 'Marta R.', conv: '9.8%', resp: '2h', vol: '€850k' }
                    ].map((row) => (
                      <tr key={row.pos} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-6 font-mono text-zinc-500">#{row.pos}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                              {row.name[0]}
                            </div>
                            <span className="font-bold">{row.name}</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm font-medium">{row.conv}</td>
                        <td className="p-6 text-sm text-zinc-400">{row.resp}</td>
                        <td className="p-6 text-sm font-bold text-brand">{row.vol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'forecast' && (
            <div className="space-y-8">
              <header>
                <h3 className="text-2xl font-bold">Previsão de Fecho</h3>
                <p className="text-zinc-500 text-sm">Projecção financeira baseada em IA e Scoring.</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass rounded-3xl p-8 border border-card-border">
                   <h4 className="font-bold mb-8">Evolução do Pipeline (€)</h4>
                   <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={CHART_DATA}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f1f23" />
                            <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#161618', border: '1px solid #26262A', borderRadius: '12px' }}
                            />
                            <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="glass rounded-3xl p-8 border border-card-border flex flex-col justify-between">
                   <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Próximos 30 Dias</h4>
                      <p className="text-4xl font-bold mb-2">€42,800</p>
                      <p className="text-xs text-green-500 font-bold mb-8">+15% vs mês anterior</p>
                   </div>
                   <div className="space-y-4">
                      <div className="p-4 bg-zinc-900 rounded-2xl border border-card-border">
                         <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Leads em Fecho</p>
                         <p className="text-lg font-bold">14</p>
                      </div>
                      <div className="p-4 bg-zinc-900 rounded-2xl border border-card-border">
                         <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Probabilidade Média</p>
                         <p className="text-lg font-bold">68%</p>
                      </div>
                   </div>
                   <button className="w-full mt-8 py-3 border border-card-border rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all">Ver Relatório Completo</button>
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
      <div className="p-6 lg:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3 w-full">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-brand rounded-xl flex items-center justify-center orange-glow shrink-0">
            <Target className="text-white" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <select 
              value={currentAgencyId}
              onChange={(e) => setCurrentAgencyId(e.target.value)}
              className="bg-transparent border-none text-white font-bold text-sm lg:text-base tracking-tight uppercase focus:ring-0 w-full cursor-pointer appearance-none hover:text-brand transition-colors"
            >
              {agencies.map(a => (
                <option key={a.id} value={a.id} className="bg-zinc-900 text-white">{a.name.split(' ')[0]}</option>
              ))}
            </select>
            <p className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-[0.2em] -mt-1">MULTI-TENANT</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-zinc-500">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        <NavItem 
          active={activeTab === 'dashboard'} 
          onClick={() => handleTabChange('dashboard')}
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
        />
        {features.insights && (
          <NavItem 
            active={activeTab === 'insights'} 
            onClick={() => handleTabChange('insights')}
            icon={<TrendingUp size={20} />}
            label="Insights"
          />
        )}
        <NavItem 
          active={activeTab === 'pipelines'} 
          onClick={() => handleTabChange('pipelines')}
          icon={<Briefcase size={20} />}
          label="Pipelines"
        />
        <NavItem 
          active={activeTab === 'crm'} 
          onClick={() => handleTabChange('crm')}
          icon={<Users size={20} />}
          label="CRM"
        />
        {features.ranking && (
          <NavItem 
            active={activeTab === 'ranking'} 
            onClick={() => handleTabChange('ranking')}
            icon={<Target size={20} />}
            label="Ranking"
          />
        )}

        <div className="pt-6 lg:pt-8 px-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-4">Ferramentas AI</p>
          <NavItem 
            active={activeTab === 'copilot'}
            onClick={() => handleTabChange('copilot')}
            icon={<MessageSquare size={20} />}
            label="Copiloto"
          />
          {features.recrutamento && (
             <NavItem 
               active={activeTab === 'recruiter'}
               onClick={() => handleTabChange('recruiter')}
               icon={<Target size={20} />}
               label="Recrutador"
             />
          )}
          {features.previsao && (
             <NavItem 
               active={activeTab === 'forecast'}
               onClick={() => handleTabChange('forecast')}
               icon={<TrendingUp size={20} />}
               label="Previsão"
             />
          )}
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
        "flex items-center gap-3 w-full px-4 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl text-sm font-medium transition-all duration-300",
        active 
          ? "bg-zinc-800 text-white shadow-lg border border-card-border" 
          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50"
      )}
    >
      <div className={cn(
        "transition-colors",
        active ? "text-brand" : "text-zinc-500"
      )}>
        {icon}
      </div>
      {label}
      {active && <ChevronRight className="ml-auto text-zinc-600" size={14} />}
    </button>
  );
}

function KPICard({ icon, label, value, trend, color }: { icon: React.ReactNode, label: string, value: string | number, trend: string, color: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-card-border relative group"
    >
      <div className={cn(
        "w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-4 transition-transform group-hover:scale-110 duration-500",
        color === 'brand' ? "bg-brand/10 text-brand" :
        color === 'blue' ? "bg-blue-500/10 text-blue-400" :
        color === 'green' ? "bg-green-500/10 text-green-400" :
        color === 'purple' ? "bg-purple-500/10 text-purple-400" : "bg-orange-500/10 text-orange-400"
      )}>
        {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      </div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-1">
        <div>
          <p className="text-zinc-500 text-[10px] lg:text-xs font-medium uppercase tracking-widest mb-0.5 lg:mb-1">{label}</p>
          <h4 className="text-lg lg:text-2xl font-bold">{value}</h4>
        </div>
        <span className="text-[9px] lg:text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded self-start lg:self-auto">
          {trend}
        </span>
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
    <div className="space-y-4 lg:space-y-6">
      <h3 className="text-base lg:text-lg font-semibold flex items-center gap-3">
        <div className="w-1.5 h-1.5 bg-brand rounded-full" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {stages.map(stage => (
          <div key={stage} className="bg-zinc-900/30 rounded-2xl lg:rounded-3xl p-4 lg:p-6 border border-card-border/50">
            <div className="flex items-center justify-between mb-4 lg:mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{stage}</span>
              <span className="px-2 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400">{leads.filter(l => l.status === stage).length}</span>
            </div>
            <div className="space-y-3 lg:space-y-4">
              <AnimatePresence mode="popLayout">
                {leads.filter(l => l.status === stage).map(lead => (
                    <motion.div
                      key={lead.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => onSelectLead(lead.id)}
                      className="p-3 lg:p-4 bg-zinc-900 border border-card-border rounded-xl lg:rounded-2xl cursor-pointer hover:border-brand/40 transition-all hover:scale-[1.02] shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5 lg:mb-2">
                        <span className="text-sm font-semibold truncate max-w-[120px]">{lead.name}</span>
                        <div className="flex items-center gap-1.5">
                           {lead.score && (
                             <span className="text-[8px] font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                               {lead.score}
                             </span>
                           )}
                           <OriginIcon origin={lead.origin} />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-500 mb-2 lg:mb-3 line-clamp-1">{lead.interest}</p>
                      
                      {lead.scoreLabel && (
                        <div className="flex items-center gap-2 mb-3">
                           <span className={cn(
                             "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                             lead.score! > 75 ? "bg-red-500/10 text-red-500" : 
                             lead.score! > 40 ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                           )}>
                             {lead.scoreLabel}
                           </span>
                           {lead.probability && (
                             <span className="text-[9px] text-zinc-600 font-medium">Prob: {lead.probability}%</span>
                           )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <span className="text-[9px] lg:text-[10px] text-zinc-600">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <div className="flex">
                           {lead.value && (
                             <span className="text-[10px] font-bold text-zinc-300 mr-2">€{(lead.value/1000).toFixed(0)}k</span>
                           )}
                          <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center orange-glow">
                            <Target size={10} className="text-white" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                ))}
              </AnimatePresence>
              {leads.filter(l => l.status === stage).length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-xs text-zinc-700 italic">Vazio</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
