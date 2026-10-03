import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, ShoppingBag, Package, CheckCircle2, AlertTriangle, Clock, 
  Search, Filter, Check, User, Phone, Building2, Send, 
  RotateCcw, Volume2, VolumeX, ArrowRight, ShieldCheck, Tag,
  MessageCircle, ExternalLink, QrCode, CreditCard, ChevronRight
} from 'lucide-react';
import { ProShopOrder, ProShopOrderStatus } from '../../types';
import { ProShopOrderService } from '../../services/proShopOrderService';
import { bjjAudio } from '../../utils/audio';

interface ProShopFulfillmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  academyName?: string;
  academyId?: string;
  responsibleStaffName?: string;
  onSendStudentPush?: (title: string, body: string) => void;
}

export const ProShopFulfillmentModal: React.FC<ProShopFulfillmentModalProps> = ({
  isOpen,
  onClose,
  academyName = 'Loyalty Jiu-Jitsu • Matriz Oficial',
  academyId,
  responsibleStaffName = 'Recepção / Prof. Messias',
  onSendStudentPush
}) => {
  const [orders, setOrders] = useState<ProShopOrder[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Carregar e se inscrever em pedidos em tempo real
  useEffect(() => {
    if (!isOpen) return;

    setOrders(ProShopOrderService.getOrders(academyId));

    const unsubscribe = ProShopOrderService.subscribe((updated) => {
      setOrders(academyId && academyId !== 'all' ? updated.filter(o => !o.academyId || o.academyId === academyId) : updated);
    });

    return () => unsubscribe();
  }, [isOpen, academyId]);

  if (!isOpen) return null;

  const pendingCount = orders.filter(o => o.status === 'aguardando_separacao').length;
  const separatedCount = orders.filter(o => o.status === 'separado_estoque').length;
  const deliveredCount = orders.filter(o => o.status === 'entregue').length;
  const outOfStockCount = orders.filter(o => o.status === 'sem_estoque').length;

  const filteredOrders = orders.filter(ord => {
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'pending' ? ord.status === 'aguardando_separacao' :
      filterStatus === 'separated' ? ord.status === 'separado_estoque' :
      filterStatus === 'delivered' ? ord.status === 'entregue' :
      filterStatus === 'out_of_stock' ? ord.status === 'sem_estoque' : true;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      ord.studentName.toLowerCase().includes(q) ||
      ord.productName.toLowerCase().includes(q) ||
      ord.orderNumber.toLowerCase().includes(q) ||
      (ord.responsibleName && ord.responsibleName.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleSeparateOrder = (order: ProShopOrder) => {
    ProShopOrderService.markAsSeparated(order.id, responsibleStaffName);
    if (audioAlertEnabled) {
      try { bjjAudio.playAccessGranted(); } catch {}
    }
    showFeedback(`📦 Pedido ${order.orderNumber} marcado como SEPARADO no armário da recepção!`);

    if (onSendStudentPush) {
      onSendStudentPush(
        `📦 Seu Pedido BJJ Academy Está Pronto!`,
        `Olá ${order.studentName}! Seu item ${order.productName} (Tam: ${order.size || 'Único'}) já foi separado no balcão da recepção. Pode retirar antes ou após o treino!`
      );
    }
  };

  const handleDeliverOrder = (order: ProShopOrder) => {
    ProShopOrderService.markAsDelivered(order.id);
    if (audioAlertEnabled) {
      try { bjjAudio.playAccessGranted(); } catch {}
    }
    showFeedback(`🥋 Pedido ${order.orderNumber} entregue ao atleta ${order.studentName}!`);
  };

  const handleOutOfStock = (order: ProShopOrder) => {
    ProShopOrderService.markAsOutOfStock(order.id, `Falta de estoque físico do tamanho ${order.size}. Reposição solicitada.`);
    showFeedback(`⚠️ Pedido ${order.orderNumber} sinalizado como SEM ESTOQUE. Reposição solicitada à matriz.`);
  };

  const handleNotifyWhatsApp = (order: ProShopOrder) => {
    const text = encodeURIComponent(
      `Olá ${order.studentName}! 🥋\n\n` +
      `Aqui é da recepção da ${academyName}.\n` +
      `Seu pedido *${order.productName}* (Tam: ${order.size || 'Padrão'} • ${order.color || 'Oficial'}) foi separado no nosso estoque físico e já está disponível para retirada na recepção!\n\n` +
      `Protocolo: *${order.orderNumber}*\n` +
      `Te aguardamos no tatame! Oss! 👊`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-pro-shop-fulfillment"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-4xl h-[94vh] sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/20">
              <Package size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base leading-tight">
                  Central de Separação de Pedidos • Pro-Shop
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 font-bold border border-purple-800/60">
                  RECEPÇÃO & ESTOQUE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {academyName} • Separação de uniformes, kimonos e entrega aos alunos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setAudioAlertEnabled(!audioAlertEnabled)}
              title={audioAlertEnabled ? 'Avisos sonoros ativos' : 'Avisos sonoros mudos'}
              className={`p-2 rounded-xl border text-xs font-bold transition-colors ${
                audioAlertEnabled
                  ? 'bg-purple-950/60 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {audioAlertEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button 
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {actionSuccessMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/50 text-emerald-300 px-4 py-2 text-xs font-bold flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{actionSuccessMessage}</span>
            </div>
            <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'pending'
                ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span className="flex items-center gap-1">
                <Clock size={12} /> Para Separar
              </span>
              <span className="text-sm font-black bg-amber-500/20 px-1.5 py-0.2 rounded-md">
                {pendingCount}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Verificar estoque físico</div>
          </button>

          <button
            onClick={() => setFilterStatus('separated')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'separated'
                ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500/50'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-blue-400">
              <span className="flex items-center gap-1">
                <Package size={12} /> Prontos Balcão
              </span>
              <span className="text-sm font-black bg-blue-500/20 px-1.5 py-0.2 rounded-md">
                {separatedCount}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Separados na recepção</div>
          </button>

          <button
            onClick={() => setFilterStatus('delivered')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'delivered'
                ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} /> Entregues
              </span>
              <span className="text-sm font-black bg-emerald-500/20 px-1.5 py-0.2 rounded-md">
                {deliveredCount}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Retirados pelo atleta</div>
          </button>

          <button
            onClick={() => setFilterStatus('out_of_stock')}
            className={`p-3 rounded-xl border text-left transition-all ${
              filterStatus === 'out_of_stock'
                ? 'bg-rose-950/40 border-rose-500 ring-1 ring-rose-500/50'
                : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
              <span className="flex items-center gap-1">
                <AlertTriangle size={12} /> Sem Estoque
              </span>
              <span className="text-sm font-black bg-rose-500/20 px-1.5 py-0.2 rounded-md">
                {outOfStockCount}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Acionar reposição</div>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-900/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                filterStatus === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>⏳ Aguardando Separação</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-slate-900 text-[10px] font-black">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilterStatus('separated')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                filterStatus === 'separated'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              📦 Prontos para Retirada ({separatedCount})
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap ${
                filterStatus === 'delivered'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              ✅ Entregues ({deliveredCount})
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno, item ou nº..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Package size={36} className="mx-auto text-slate-600" />
              <h4 className="text-sm font-bold text-white">Nenhum pedido encontrado</h4>
              <p className="text-xs text-slate-400">
                {searchQuery ? 'Tente buscar com outro termo.' : 'Não há pedidos para a categoria selecionada.'}
              </p>
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isPending = ord.status === 'aguardando_separacao';
              const isSeparated = ord.status === 'separado_estoque';
              const isDelivered = ord.status === 'entregue';
              const isOutOfStock = ord.status === 'sem_estoque';

              return (
                <div
                  key={ord.id}
                  className={`p-4 rounded-2xl border transition-all shadow-md ${
                    isPending 
                      ? 'bg-amber-950/20 border-amber-500/50 hover:border-amber-400'
                      : isSeparated 
                      ? 'bg-blue-950/20 border-blue-500/50 hover:border-blue-400'
                      : isOutOfStock
                      ? 'bg-rose-950/20 border-rose-500/50 hover:border-rose-400'
                      : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs text-amber-400">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {ord.createdAt}
                      </span>

                      {/* Status Badge */}
                      {isPending && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <Clock size={11} /> AGUARDANDO SEPARAÇÃO NO ESTOQUE
                        </span>
                      )}
                      {isSeparated && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1">
                          <Package size={11} /> SEPARADO NO BALCÃO • PRONTO PARA ENTREGA
                        </span>
                      )}
                      {isDelivered && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                          <CheckCircle2 size={11} /> ENTREGUE AO ATLETA
                        </span>
                      )}
                      {isOutOfStock && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertTriangle size={11} /> SEM ESTOQUE FÍSICO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">
                        {ord.paymentMethod === 'pix' ? 'PIX' : 'Na Mensalidade'}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-400">
                        R$ {ord.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Body Grid: Aluno e Produto */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3">
                    {/* Aluno Beneficiário */}
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <User size={12} className="text-red-400" /> Aluno Comprador
                        </span>
                        <span className="text-amber-400 font-mono font-bold">
                          {ord.studentRegistration}
                        </span>
                      </div>
                      <div className="text-sm font-extrabold text-white">
                        {ord.studentName}
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-2">
                        <span>{ord.studentBelt}</span>
                      </div>
                      {ord.responsibleName && ord.responsibleName !== 'O próprio aluno' && (
                        <div className="text-[11px] text-blue-300 pt-1 border-t border-slate-800">
                          Responsável Legal: <strong>{ord.responsibleName}</strong>
                        </div>
                      )}
                    </div>

                    {/* Produto Adquirido & Detalhes de Separação */}
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="text-[10px] font-extrabold uppercase text-slate-400 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={12} className="text-purple-400" /> Item para Separar
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 font-extrabold text-[10px] border border-purple-800">
                          {ord.category}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white line-clamp-1">
                        {ord.productName}
                      </div>
                      <div className="text-xs text-slate-300 flex gap-3 pt-0.5">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-bold border border-slate-700">
                          Tam: {ord.size || 'Único'}
                        </span>
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-200 border border-slate-700">
                          Cor: {ord.color || 'Oficial'}
                        </span>
                      </div>

                      {/* Informações de quem separou / entregou */}
                      {ord.separatedAt && (
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          Separado em: {ord.separatedAt} por {ord.separatedBy || 'Recepção'}
                        </div>
                      )}
                      {ord.stockNote && (
                        <div className="text-[10px] text-rose-300 pt-1 font-semibold">
                          Obs: {ord.stockNote}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Operational Action Bar for Staff */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleNotifyWhatsApp(ord)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <MessageCircle size={13} />
                        Avisar no WhatsApp
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleOutOfStock(ord)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-600/40 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <AlertTriangle size={13} />
                            Falta no Estoque
                          </button>

                          <button
                            onClick={() => handleSeparateOrder(ord)}
                            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-purple-900/30 active:scale-95"
                          >
                            <Package size={14} />
                            Separar no Estoque 📦
                          </button>
                        </>
                      )}

                      {isSeparated && (
                        <button
                          onClick={() => handleDeliverOrder(ord)}
                          className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-900/30 active:scale-95"
                        >
                          <CheckCircle2 size={14} />
                          Confirmar Entrega ao Aluno 🥋
                        </button>
                      )}

                      {isOutOfStock && (
                        <button
                          onClick={() => handleSeparateOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw size={13} />
                          Estoque Chegou / Separar
                        </button>
                      )}

                      {isDelivered && (
                        <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                          <Check size={14} /> Pedido Finalizado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
