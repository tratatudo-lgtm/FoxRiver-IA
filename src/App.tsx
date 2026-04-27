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
import { Lead, LeadType, LeadStatus, ChatMessage } from './types';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pipelines' | 'crm'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [isDemoActive, setIsDemoActive] = useState(true);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle new lead from Demo Mode or otherwise
  const handleNewLead = useCallback((newLead: Lead) => {
    setLeads(prev => [newLead, ...prev].slice(0, 50));
    // Auto-reply if demo mode is active
    if (isDemoActive) {
      setTimeout(async () => {
        setIsTyping(true);
        const reply = await getAIReply(newLead.type, newLead.name, newLead.interest, []);
        const aiMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'ai',
          text: reply,
          timestamp: new Date().toISOString()
        };
        setChatHistory(prev => ({
          ...prev,
          [newLead.id]: [...(prev[newLead.id] || []), aiMsg]
        }));
        setIsTyping(false);
      }, 1500);
    }
  }, [isDemoActive]);

  useDemoMode(isDemoActive, handleNewLead);

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
      id: Math.random().toString(),
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
      id: Math.random().toString(),
      sender: 'ai',
      text: reply,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] || []), userMsg, aiMsg]
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
                onClose={() => setIsMobileMenuOpen(false)}
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
                <KPICard icon={<TrendingUp size={24} />} label="Leads Hoje" value={kpis.leadsToday} color="brand" trend="+24%" />
                <KPICard icon={<Target size={24} />} label="Compradores" value={kpis.buyers} color="blue" trend="+8%" />
                <KPICard icon={<Phone size={24} />} label="Vendedores" value={kpis.sellers} color="green" trend="+12%" />
                <KPICard icon={<Briefcase size={24} />} label="Angariadores" value={kpis.recruiters} color="purple" trend="+5%" />
                <div className="hidden lg:block">
                  <KPICard icon={<TrendingUp size={24} />} label="Conversão" value={kpis.convRate} color="orange" trend="+2.1%" />
                </div>
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
            <div className="glass rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-card-border overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="text-left text-zinc-500 text-xs uppercase tracking-widest border-b border-card-border">
                    <th className="pb-4 font-semibold px-4">Lead</th>
                    <th className="pb-4 font-semibold">Tipo</th>
                    <th className="pb-4 font-semibold">Estado</th>
                    <th className="pb-4 font-semibold">Origem</th>
                    <th className="pb-4 font-semibold">Data</th>
                    <th className="pb-4 font-semibold text-right px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id} className="group hover:bg-zinc-800/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium">{lead.name}</span>
                          <span className="text-xs text-zinc-500">{lead.phone}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={cn(
                          "px-2 py-1 rounded text-[10px] font-bold uppercase",
                          lead.type === 'comprador' ? "bg-blue-500/10 text-blue-400" : 
                          lead.type === 'vendedor' ? "bg-green-500/10 text-green-400" : "bg-purple-500/10 text-purple-400"
                        )}>
                          {lead.type}
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-xs text-zinc-300 capitalize">{lead.status}</span>
                      </td>
                      <td className="py-4">
                        <OriginIcon origin={lead.origin} />
                      </td>
                      <td className="py-4 text-xs text-zinc-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button 
                          onClick={() => { setSelectedLeadId(lead.id); setIsChatOpen(true); }}
                          className="p-2 text-zinc-500 hover:text-brand transition-colors"
                        >
                          <MessageSquare size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  onClose 
}: { 
  activeTab: string, 
  setActiveTab: (tab: any) => void, 
  isDemoActive: boolean, 
  setIsDemoActive: (val: boolean) => void,
  onClose?: () => void
}) {
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    onClose?.();
  };

  return (
    <>
      <div className="p-6 lg:p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-brand rounded-xl flex items-center justify-center orange-glow">
            <Target className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base lg:text-lg tracking-tight">FOX RIVER</h1>
            <p className="text-[8px] lg:text-[10px] text-zinc-500 uppercase tracking-[0.2em] -mt-1">AI PLATFORM</p>
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
        <NavItem 
          active={activeTab === 'pipelines'} 
          onClick={() => handleTabChange('pipelines')}
          icon={<TrendingUp size={20} />}
          label="Pipelines"
        />
        <NavItem 
          active={activeTab === 'crm'} 
          onClick={() => handleTabChange('crm')}
          icon={<Users size={20} />}
          label="CRM"
        />
        <div className="pt-6 lg:pt-8 px-4">
          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-4">Ferramentas AI</p>
          <NavItem 
            icon={<MessageSquare size={20} />}
            label="Copiloto"
          />
          <NavItem 
            icon={<Briefcase size={20} />}
            label="Recrutador"
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
        <button className="flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors w-full px-2 py-2">
          <Settings size={18} />
          Configurações
        </button>
        <button className="flex items-center gap-3 text-sm text-red-500/80 hover:text-red-500 transition-colors w-full px-2 py-2 mt-2">
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
                        <OriginIcon origin={lead.origin} />
                      </div>
                      <p className="text-[10px] text-zinc-500 mb-2 lg:mb-3 line-clamp-1">{lead.interest}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                        <span className="text-[9px] lg:text-[10px] text-zinc-600">{new Date(lead.createdAt).toLocaleDateString()}</span>
                        <div className="flex">
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
