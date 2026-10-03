import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingBag, Check, QrCode, CreditCard, ChevronRight, 
  Sparkles, CheckCircle2, Package, Tag, ArrowRight, User,
  Shield, CheckCheck, Clock, Receipt, UserCheck, AlertCircle,
  Building2, Award, Printer, Copy, RotateCcw
} from 'lucide-react';
import { ShopProduct, ProShopOrder, StudentProfile, DependentStudent, UserRole } from '../../types';
import { mockShopProducts } from '../../data/mockData';
import { bjjAudio } from '../../utils/audio';
import { ProShopOrderService } from '../../services/proShopOrderService';

interface ProShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPix?: (amount: number, title: string, studentName?: string) => void;
  currentStudent?: StudentProfile;
  activeRole?: UserRole;
  dependents?: DependentStudent[];
  allStudents?: StudentProfile[];
  academyName?: string;
  onRegisterPurchase?: (order: ProShopOrder) => void;
  onOpenFulfillment?: () => void;
}

export const ProShopModal: React.FC<ProShopModalProps> = ({ 
  isOpen, 
  onClose, 
  onOpenPix,
  currentStudent,
  activeRole = 'student',
  dependents = [],
  allStudents = [],
  academyName = 'Loyalty Jiu-Jitsu • Matriz Oficial',
  onRegisterPurchase,
  onOpenFulfillment
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'orders'>('catalog');
  const [products] = useState<ShopProduct[]>(mockShopProducts);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'mensalidade'>('pix');
  const [pickupNote, setPickupNote] = useState<string>('');
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Identificação do Comprador / Beneficiário
  const [buyerStudentName, setBuyerStudentName] = useState<string>('');
  const [buyerResponsibleName, setBuyerResponsibleName] = useState<string>('');
  const [buyerBelt, setBuyerBelt] = useState<string>('');
  const [buyerRegistration, setBuyerRegistration] = useState<string>('');
  const [buyerStudentId, setBuyerStudentId] = useState<string>('');
  const [isCustomBuyer, setIsCustomBuyer] = useState<boolean>(false);

  // Pedidos e Confirmação
  const [completedOrder, setCompletedOrder] = useState<ProShopOrder | null>(null);
  const [ordersHistory, setOrdersHistory] = useState<ProShopOrder[]>(() => {
    return ProShopOrderService.getOrders();
  });

  useEffect(() => {
    const unsub = ProShopOrderService.subscribe((updated) => {
      setOrdersHistory(updated);
    });
    return () => unsub();
  }, []);

  // Inicializar identificação do comprador com base na role e no aluno ativo
  useEffect(() => {
    if (activeRole === 'parent' && dependents.length > 0) {
      const firstChild = dependents[0];
      setBuyerStudentName(firstChild.name);
      setBuyerResponsibleName(firstChild.parentRelationship || 'Responsável Financeiro');
      setBuyerBelt(formatBelt(firstChild.belt, firstChild.stripes));
      setBuyerRegistration(`#BJJ-KIDS-${firstChild.id.replace(/\D/g, '').slice(0, 4) || '2026'}`);
      setBuyerStudentId(firstChild.id);
    } else if (currentStudent) {
      setBuyerStudentName(currentStudent.name);
      setBuyerResponsibleName(activeRole === 'parent' ? 'Responsável Financeiro' : 'O próprio aluno');
      setBuyerBelt(formatBelt(currentStudent.belt, currentStudent.stripes));
      setBuyerRegistration(`#BJJ-${currentStudent.id.replace(/\D/g, '').slice(0, 4) || '2026-084'}`);
      setBuyerStudentId(currentStudent.id);
    } else {
      setBuyerStudentName('Lucas Silva');
      setBuyerResponsibleName('O próprio aluno');
      setBuyerBelt('Faixa Azul • 2 Graus');
      setBuyerRegistration('#BJJ-2026-084');
      setBuyerStudentId('stu_lucas_silva');
    }
  }, [currentStudent, activeRole, dependents, isOpen]);

  if (!isOpen) return null;

  function formatBelt(belt: string, stripes = 0): string {
    const beltMap: Record<string, string> = {
      white: 'Faixa Branca',
      grey: 'Faixa Cinza',
      yellow: 'Faixa Amarela',
      orange: 'Faixa Laranja',
      green: 'Faixa Verde',
      blue: 'Faixa Azul',
      purple: 'Faixa Roxa',
      brown: 'Faixa Marrom',
      black: 'Faixa Preta'
    };
    const name = beltMap[belt] || belt;
    return stripes > 0 ? `${name} • ${stripes} Grau${stripes > 1 ? 's' : ''}` : name;
  }

  const categories = ['Todos', 'Kimonos', 'No-Gi / Rashguard', 'Faixas', 'Acessórios & Patches', 'Nutrição'];

  const filtered = products.filter(p => 
    selectedCategory === 'Todos' || p.category === selectedCategory
  );

  const handleSelectProduct = (prod: ShopProduct) => {
    setSelectedProduct(prod);
    // Se for pai com dependente e o produto tiver tamanhos infantis, tenta selecionar o tamanho da criança
    let defaultSize = prod.sizes[0] || 'Tamanho Único';
    if (activeRole === 'parent' && dependents.length > 0) {
      const activeChild = dependents.find(d => d.id === buyerStudentId) || dependents[0];
      const kidsSizes = prod.sizes.filter(s => s.startsWith('M'));
      if (kidsSizes.length > 0) {
        let prefix = 'M0';
        if (activeChild.age <= 3) prefix = 'M000';
        else if (activeChild.age <= 5) prefix = 'M00';
        else if (activeChild.age <= 7) prefix = 'M0';
        else if (activeChild.age <= 9) prefix = 'M1';
        else if (activeChild.age <= 11) prefix = 'M2';
        else if (activeChild.age <= 13) prefix = 'M3';
        else prefix = 'M4';

        const matched = kidsSizes.find(s => s.startsWith(prefix));
        if (matched) defaultSize = matched;
      }
    }
    setSelectedSize(defaultSize);
    setSelectedColor(prod.colors[0] || 'Padrão Oficial');
    setCompletedOrder(null);
  };

  const handleSelectDependent = (dep: DependentStudent) => {
    setBuyerStudentName(dep.name);
    setBuyerResponsibleName(dep.parentRelationship || 'Responsável Financeiro');
    setBuyerBelt(formatBelt(dep.belt, dep.stripes));
    setBuyerRegistration(`#BJJ-KIDS-${dep.id.replace(/\D/g, '').slice(0, 4) || '2026'}`);
    setBuyerStudentId(dep.id);
    setIsCustomBuyer(false);

    if (selectedProduct && selectedProduct.sizes) {
      const kidsSizes = selectedProduct.sizes.filter(s => s.startsWith('M'));
      if (kidsSizes.length > 0) {
        let prefix = 'M0';
        if (dep.age <= 3) prefix = 'M000';
        else if (dep.age <= 5) prefix = 'M00';
        else if (dep.age <= 7) prefix = 'M0';
        else if (dep.age <= 9) prefix = 'M1';
        else if (dep.age <= 11) prefix = 'M2';
        else if (dep.age <= 13) prefix = 'M3';
        else prefix = 'M4';

        const matched = kidsSizes.find(s => s.startsWith(prefix));
        if (matched) setSelectedSize(matched);
      }
    }
  };

  const handleSelectRosterStudent = (stu: StudentProfile) => {
    setBuyerStudentName(stu.name);
    setBuyerResponsibleName('Atleta BJJ Academy');
    setBuyerBelt(formatBelt(stu.belt, stu.stripes));
    setBuyerRegistration(`#BJJ-${stu.id.replace(/\D/g, '').slice(0, 4) || '2026'}`);
    setBuyerStudentId(stu.id);
    setIsCustomBuyer(false);
  };

  const handleConfirmPurchase = () => {
    if (!selectedProduct) return;

    bjjAudio.playAccessGranted();

    const orderNumber = 'ORD-BJJ-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder: ProShopOrder = {
      id: 'ord_' + Date.now(),
      orderNumber,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      category: selectedProduct.category,
      price: selectedProduct.price,
      size: selectedSize,
      color: selectedColor,
      paymentMethod,
      buyerRole: activeRole,
      studentId: buyerStudentId || 'stu_generic',
      studentName: buyerStudentName || (currentStudent?.name || 'Aluno BJJ Academy'),
      responsibleName: buyerResponsibleName || (activeRole === 'parent' ? 'Responsável Financeiro' : undefined),
      studentBelt: buyerBelt || 'Faixa Oficial',
      studentRegistration: buyerRegistration || '#BJJ-2026',
      academyName,
      createdAt: new Date().toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      status: 'aguardando_separacao',
      pickupLocation: `Balcão da Recepção • ${academyName}`,
      stockChecked: false
    };

    ProShopOrderService.createOrder(newOrder);
    setCompletedOrder(newOrder);

    if (onRegisterPurchase) {
      onRegisterPurchase(newOrder);
    }

    // Se a forma for PIX, podemos disparar a abertura do modal PIX já identificado
    if (paymentMethod === 'pix' && onOpenPix) {
      const pixDescription = `Pro-Shop • ${selectedProduct.name} [Aluno: ${newOrder.studentName}]`;
      onOpenPix(selectedProduct.price, pixDescription, newOrder.studentName);
    }
  };

  const handleCopyVoucher = (orderCode: string) => {
    navigator.clipboard.writeText(orderCode);
    setCopiedOrderId(orderCode);
    setTimeout(() => setCopiedOrderId(null), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-pro-shop"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[94vh] sm:h-[88vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/15 text-red-500 border border-red-500/20">
              <ShoppingBag size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-white text-base leading-tight">Pro-Shop Oficial BJJ Academy</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950 text-red-400 font-bold border border-red-800/60">
                  LOJA OFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {academyName} • Retirada presencial garantida no tatame
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs Bar: Catálogo vs Meus Pedidos */}
        <div className="px-4 py-2 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('catalog');
                setSelectedProduct(null);
                setCompletedOrder(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag size={14} />
              Catálogo de Produtos
            </button>

            <button
              onClick={() => {
                setActiveTab('orders');
                setSelectedProduct(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Receipt size={14} />
              Meus Pedidos & Vouchers
              {ordersHistory.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white text-slate-900 font-extrabold">
                  {ordersHistory.length}
                </span>
              )}
            </button>

            {onOpenFulfillment && (activeRole === 'manager' || activeRole === 'ceo' || activeRole === 'teacher' || activeRole === 'general_manager') && (
              <button
                onClick={onOpenFulfillment}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-purple-950/70 text-purple-300 border border-purple-600/40 hover:bg-purple-900/80 shadow-md"
              >
                <Package size={14} />
                <span className="hidden sm:inline">Central de</span> Separação
                {ordersHistory.filter(o => o.status === 'aguardando_separacao').length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-black animate-pulse">
                    {ordersHistory.filter(o => o.status === 'aguardando_separacao').length}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Quick Active Buyer Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <User size={13} className="text-red-400" />
            <span className="text-[11px]">Comprador:</span>
            <span className="font-bold text-slate-200 truncate max-w-[130px]">{buyerStudentName}</span>
          </div>
        </div>

        {activeTab === 'catalog' ? (
          <>
            {/* Categories Bar */}
            {!selectedProduct && (
              <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar bg-slate-900/50">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      selectedCategory === cat 
                        ? 'bg-red-600 text-white shadow-md shadow-red-900/20' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedProduct ? (
                /* Product Detail & Checkout View */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setCompletedOrder(null);
                      }}
                      className="text-xs text-red-400 hover:underline flex items-center gap-1 font-bold"
                    >
                      ← Voltar ao catálogo de produtos
                    </button>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Shield size={12} className="text-emerald-400" />
                      Garantia Oficial da Academia
                    </div>
                  </div>

                  {completedOrder ? (
                    /* 🎟️ TICKET / VOUCHER DE COMPRA COM IDENTIFICAÇÃO DO COMPRADOR */
                    <div className="bg-slate-800/90 border-2 border-emerald-500/50 rounded-2xl p-5 space-y-4 shadow-xl">
                      <div className="text-center space-y-1.5">
                        <div className="inline-flex p-3 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 mb-1">
                          <CheckCircle2 size={32} />
                        </div>
                        <h3 className="text-lg font-black text-white">
                          Pedido Confirmado com Sucesso!
                        </h3>
                        <p className="text-xs text-emerald-300">
                          O item foi reservado e vinculado à ficha do aluno no tatame.
                        </p>
                      </div>

                      {/* Card do Voucher Oficial */}
                      <div className="bg-slate-950/90 border border-slate-700/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Código do Pedido</span>
                            <div className="text-sm font-mono font-black text-amber-400">{completedOrder.orderNumber}</div>
                          </div>
                          <button
                            onClick={() => handleCopyVoucher(completedOrder.orderNumber)}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 flex items-center gap-1 border border-slate-700"
                          >
                            {copiedOrderId === completedOrder.orderNumber ? (
                              <>
                                <Check size={12} className="text-emerald-400" /> Copiado!
                              </>
                            ) : (
                              <>
                                <Copy size={12} /> Copiar
                              </>
                            )}
                          </button>
                        </div>

                        {/* Detalhes do Aluno Comprador */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                              <User size={11} className="text-red-400" /> Aluno Beneficiário
                            </span>
                            <div className="font-extrabold text-white text-sm">{completedOrder.studentName}</div>
                            <div className="text-[11px] text-slate-400">
                              {completedOrder.studentBelt} • {completedOrder.studentRegistration}
                            </div>
                          </div>

                          <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                              <UserCheck size={11} className="text-blue-400" /> Responsável / Pagador
                            </span>
                            <div className="font-bold text-white text-sm">
                              {completedOrder.responsibleName || 'O próprio aluno'}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Perfil: {completedOrder.buyerRole.toUpperCase()}
                            </div>
                          </div>
                        </div>

                        {/* Detalhes do Produto */}
                        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-xs">{completedOrder.productName}</span>
                            <span className="font-black text-emerald-400 text-sm">
                              R$ {completedOrder.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex gap-3">
                            <span>Tamanho: <strong className="text-slate-200">{completedOrder.size}</strong></span>
                            <span>Cor: <strong className="text-slate-200">{completedOrder.color}</strong></span>
                            <span>Pagamento: <strong className="text-slate-200">{completedOrder.paymentMethod === 'pix' ? 'PIX Instantâneo' : 'Mensalidade'}</strong></span>
                          </div>
                        </div>

                        {/* Local de Retirada */}
                        <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 text-[11px] text-red-200 flex items-center gap-2">
                          <Building2 size={16} className="text-red-400 flex-shrink-0" />
                          <div>
                            <strong>Local para Retirada:</strong> {completedOrder.pickupLocation}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedProduct(null);
                            setCompletedOrder(null);
                          }}
                          className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                        >
                          Continuar Comprando
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('orders');
                            setSelectedProduct(null);
                            setCompletedOrder(null);
                          }}
                          className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors"
                        >
                          Ver Histórico de Pedidos
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Checkout Form */
                    <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-5">
                      {/* Product Preview */}
                      <div className="flex flex-col sm:flex-row gap-4 pb-4 border-b border-slate-700/70">
                        <div className="w-full sm:w-44 h-44 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700 relative">
                          <img 
                            src={selectedProduct.image} 
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                          {selectedProduct.officialAcademy && (
                            <span className="absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider shadow">
                              Uniforme Oficial
                            </span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {selectedProduct.category}
                          </span>
                          <h3 className="font-extrabold text-white text-lg leading-tight">
                            {selectedProduct.name}
                          </h3>
                          <div className="text-2xl font-black text-emerald-400">
                            R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {selectedProduct.description}
                          </p>
                        </div>
                      </div>

                      {/* 👤 SEÇÃO CRÍTICA: IDENTIFICAÇÃO DO COMPRADOR E ALUNO BENEFICIÁRIO */}
                      <div className="bg-slate-900/90 border-2 border-red-500/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                              <UserCheck size={16} />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-wide">
                                Identificação do Comprador / Aluno
                              </h4>
                              <p className="text-[11px] text-slate-400">
                                Como este pedido será identificado no tatame e no controle da academia:
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setIsCustomBuyer(!isCustomBuyer)}
                            className="text-[11px] font-bold text-red-400 hover:text-red-300 underline"
                          >
                            {isCustomBuyer ? 'Usar cadastro automático' : 'Alterar / Presentear'}
                          </button>
                        </div>

                        {/* Se for Responsável com dependentes, exibe botões rápidos dos filhos */}
                        {activeRole === 'parent' && dependents.length > 0 && !isCustomBuyer && (
                          <div className="pt-2 border-t border-slate-800 space-y-1.5">
                            <label className="text-[11px] font-bold text-amber-300">
                              Selecione qual filho(a) vai receber o item:
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {dependents.map((dep) => (
                                <button
                                  key={dep.id}
                                  type="button"
                                  onClick={() => handleSelectDependent(dep)}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                                    buyerStudentName === dep.name
                                      ? 'bg-red-600 text-white border-red-500 shadow-md'
                                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                                  }`}
                                >
                                  <User size={12} />
                                  <span>{dep.name}</span>
                                  <span className="text-[10px] opacity-75">({dep.age} anos)</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Se for Professor/Gerente/CEO com lista de alunos */}
                        {(activeRole === 'teacher' || activeRole === 'manager' || activeRole === 'ceo' || activeRole === 'general_manager') && allStudents.length > 0 && !isCustomBuyer && (
                          <div className="pt-2 border-t border-slate-800 space-y-1.5">
                            <label className="text-[11px] font-bold text-blue-300">
                              Venda no Balcão • Selecione o aluno da academia:
                            </label>
                            <select
                              value={buyerStudentId}
                              onChange={(e) => {
                                const found = allStudents.find(s => s.id === e.target.value);
                                if (found) handleSelectRosterStudent(found);
                              }}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-medium focus:ring-1 focus:ring-red-500"
                            >
                              {allStudents.map(s => (
                                <option key={s.id} value={s.id}>
                                  {s.name} • {formatBelt(s.belt, s.stripes)}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Card Exibindo os Dados Atuais do Comprador */}
                        {!isCustomBuyer ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Nome do Aluno</div>
                              <div className="font-extrabold text-white text-sm">{buyerStudentName}</div>
                              <div className="text-[11px] text-slate-400">
                                Matrícula: <span className="text-amber-400 font-mono font-bold">{buyerRegistration}</span>
                              </div>
                            </div>

                            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Graduação & Responsável</div>
                              <div className="font-bold text-slate-200 text-xs">{buyerBelt}</div>
                              <div className="text-[11px] text-slate-400">
                                Responsável: <span className="text-slate-300 font-semibold">{buyerResponsibleName}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Campos de Edição Manual do Comprador */
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                Nome do Aluno Beneficiário *
                              </label>
                              <input
                                type="text"
                                value={buyerStudentName}
                                onChange={(e) => setBuyerStudentName(e.target.value)}
                                placeholder="Ex: Lucas Silva"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-red-500 mt-1"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 uppercase">
                                Nome do Responsável / Pagador
                              </label>
                              <input
                                type="text"
                                value={buyerResponsibleName}
                                onChange={(e) => setBuyerResponsibleName(e.target.value)}
                                placeholder="Ex: Carlos Silva (Pai/Mãe)"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-bold focus:ring-1 focus:ring-red-500 mt-1"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Size Selector with Kids & Adult Categorization */}
                      {selectedProduct.sizes.length > 0 && (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-300">
                              Selecione o Tamanho:
                            </label>
                            <span className="text-[11px] text-slate-400">
                              Selecionado: <strong className="text-white font-bold">{selectedSize}</strong>
                            </span>
                          </div>

                          {/* Se tiver tamanhos Kids e Adultos juntos */}
                          {selectedProduct.sizes.some(s => s.startsWith('M')) && selectedProduct.sizes.some(s => s.startsWith('A')) ? (
                            <div className="space-y-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                              {/* Seção Kids */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-extrabold text-amber-400 flex items-center gap-1.5">
                                    <span>🥋 Tamanhos Kids / Infantis</span>
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold">2 a 15 anos</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                                  >
                                    {showSizeGuide ? 'Ocultar Tabela' : '📏 Guia de Medidas Kids'}
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedProduct.sizes.filter(s => s.startsWith('M')).map((sz) => (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => setSelectedSize(sz)}
                                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                        selectedSize === sz 
                                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black ring-1 ring-amber-400' 
                                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Seção Adulto */}
                              <div className="space-y-1.5 pt-2.5 border-t border-slate-800/80">
                                <span className="text-[11px] font-extrabold text-slate-300 flex items-center gap-1.5">
                                  <span>🥋 Tamanhos Adulto</span>
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-bold">A0 ao A4</span>
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {selectedProduct.sizes.filter(s => s.startsWith('A')).map((sz) => (
                                    <button
                                      key={sz}
                                      type="button"
                                      onClick={() => setSelectedSize(sz)}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                        selectedSize === sz 
                                          ? 'bg-red-600 text-white border-red-500 shadow-md font-black' 
                                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                                      }`}
                                    >
                                      {sz}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Se for exclusivamente kids ou lista simples */
                            <div className="space-y-2">
                              {selectedProduct.sizes.some(s => s.startsWith('M')) && (
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-extrabold text-amber-400">
                                    🥋 Tamanhos Infantis Oficiais (M000 a M4)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowSizeGuide(!showSizeGuide)}
                                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                                  >
                                    {showSizeGuide ? 'Ocultar Tabela' : '📏 Guia de Medidas Kids'}
                                  </button>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {selectedProduct.sizes.map((sz) => (
                                  <button
                                    key={sz}
                                    type="button"
                                    onClick={() => setSelectedSize(sz)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                      selectedSize === sz 
                                        ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30' 
                                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                                    }`}
                                  >
                                    {sz}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tabela Interativa de Medidas Kids */}
                          {showSizeGuide && (
                            <div className="p-3 rounded-xl bg-slate-950 border border-cyan-500/40 space-y-2 text-xs animate-fadeIn">
                              <div className="font-extrabold text-cyan-300 flex items-center justify-between">
                                <span>📏 Tabela de Medidas Kids Oficial (CBJJ / IBJJF)</span>
                                <span className="text-[10px] text-slate-400 font-normal">Base: Idade, Altura e Peso</span>
                              </div>
                              <div className="grid grid-cols-4 gap-1 text-[11px] text-center font-semibold text-slate-400 border-b border-slate-800 pb-1">
                                <span>Tamanho</span>
                                <span>Idade</span>
                                <span>Altura Recomendada</span>
                                <span>Peso Médio</span>
                              </div>
                              {[
                                { sz: 'M000', age: '2 a 3 anos', h: 'Até 1,00m', w: 'Até 18 kg' },
                                { sz: 'M00', age: '4 a 5 anos', h: '1,00m a 1,12m', w: '18 kg a 23 kg' },
                                { sz: 'M0', age: '6 a 7 anos', h: '1,12m a 1,22m', w: '23 kg a 28 kg' },
                                { sz: 'M1', age: '8 a 9 anos', h: '1,22m a 1,33m', w: '28 kg a 35 kg' },
                                { sz: 'M2', age: '10 a 11 anos', h: '1,33m a 1,43m', w: '35 kg a 42 kg' },
                                { sz: 'M3', age: '12 a 13 anos', h: '1,43m a 1,52m', w: '42 kg a 50 kg' },
                                { sz: 'M4', age: '14 a 15 anos', h: '1,52m a 1,60m', w: '50 kg a 58 kg' }
                              ].map((row) => (
                                <div 
                                  key={row.sz}
                                  onClick={() => {
                                    const match = selectedProduct.sizes.find(s => s.startsWith(row.sz));
                                    if (match) setSelectedSize(match);
                                  }}
                                  className={`grid grid-cols-4 gap-1 text-[11px] text-center py-1.5 rounded cursor-pointer transition ${
                                    selectedSize.startsWith(row.sz)
                                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                                      : 'hover:bg-slate-900 text-slate-300'
                                  }`}
                                >
                                  <span className="font-extrabold text-amber-400">{row.sz}</span>
                                  <span>{row.age}</span>
                                  <span>{row.h}</span>
                                  <span>{row.w}</span>
                                </div>
                              ))}
                              <p className="text-[10px] text-slate-400 text-center pt-1 italic">
                                Dica: Clique na linha do tamanho desejado para selecioná-lo automaticamente.
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Color Selector */}
                      {selectedProduct.colors.length > 0 && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                            <span>Cor do Item:</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              Cor selecionada: <strong className="text-white font-bold">{selectedColor}</strong>
                            </span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedProduct.colors.map((c) => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setSelectedColor(c)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                                  selectedColor === c 
                                    ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-900/30' 
                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                                }`}
                              >
                                {c}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Payment Option */}
                      <div className="space-y-2 pt-2 border-t border-slate-700/60">
                        <label className="text-xs font-bold text-slate-300">Forma de Pagamento:</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod('pix')}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                              paymentMethod === 'pix' 
                                ? 'bg-emerald-950/40 border-emerald-500 text-white ring-1 ring-emerald-500/40' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                              <QrCode size={20} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">PIX Instantâneo</div>
                              <div className="text-[10px] text-slate-400">QR Code gerado para o aluno</div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod('mensalidade')}
                            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-colors ${
                              paymentMethod === 'mensalidade' 
                                ? 'bg-blue-950/40 border-blue-500 text-white ring-1 ring-blue-500/40' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                            }`}
                          >
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">Lançar na Mensalidade</div>
                              <div className="text-[10px] text-slate-400">Na fatura de {buyerStudentName}</div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Observações de Retirada */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-400">
                          Observações de Retirada (Opcional):
                        </label>
                        <input
                          type="text"
                          value={pickupNote}
                          onChange={(e) => setPickupNote(e.target.value)}
                          placeholder="Ex: Retirar no início do treino com Prof. Messias"
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 mt-1 focus:ring-1 focus:ring-red-500"
                        />
                      </div>

                      {/* Action Button: Claramente exibindo quem é o comprador */}
                      <button
                        onClick={handleConfirmPurchase}
                        className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 font-extrabold text-white text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                      >
                        <ShoppingBag size={18} />
                        <span>Confirmar Compra para {buyerStudentName || 'o Aluno'}</span>
                        <span>•</span>
                        <span className="text-emerald-300">R$ {selectedProduct.price.toFixed(2).replace('.', ',')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Product Catalog Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {filtered.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleSelectProduct(prod)}
                      className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] group shadow-md"
                    >
                      <div className="space-y-2.5">
                        <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 relative">
                          <img 
                            src={prod.image} 
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {prod.officialAcademy && (
                            <span className="absolute top-2 left-2 text-[9px] font-extrabold px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider shadow">
                              Oficial BJJ
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded bg-slate-950/80 text-emerald-400 backdrop-blur-sm border border-slate-800">
                            Pronta Entrega
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                            {prod.category}
                          </span>
                          <h4 className="font-extrabold text-white text-sm leading-snug line-clamp-2">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                            {prod.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">Valor</div>
                          <div className="font-black text-emerald-400 text-base">
                            R$ {prod.price.toFixed(2).replace('.', ',')}
                          </div>
                        </div>

                        <button 
                          className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shadow-md shadow-red-900/30"
                        >
                          Comprar <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          /* Aba: Meus Pedidos & Vouchers */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ordersHistory.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="p-4 rounded-full bg-slate-800 text-slate-500 w-16 h-16 mx-auto flex items-center justify-center">
                  <Receipt size={32} />
                </div>
                <h4 className="text-base font-bold text-white">Nenhum pedido realizado ainda</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Os itens comprados no Pro-Shop com o nome do aluno e comprovante de retirada aparecerão aqui.
                </p>
                <button
                  onClick={() => setActiveTab('catalog')}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
                >
                  Ir para o Catálogo
                </button>
              </div>
            ) : (
              ordersHistory.map((ord) => (
                <div 
                  key={ord.id}
                  className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-amber-400">{ord.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                        {ord.status === 'pago' ? 'PAGO / RESERVADO' : 'RESERVADO • AGUARDANDO RETIRADA'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyVoucher(ord.orderNumber)}
                      className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedOrderId === ord.orderNumber ? (
                        <span className="text-emerald-400 font-bold">Copiado!</span>
                      ) : (
                        <>
                          <Copy size={11} /> Copiar Código
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                    <div>
                      <h4 className="text-sm font-extrabold text-white">{ord.productName}</h4>
                      <div className="text-xs text-slate-400 flex gap-2">
                        <span>Tam: <strong className="text-slate-300">{ord.size}</strong></span>
                        <span>Cor: <strong className="text-slate-300">{ord.color}</strong></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-sm text-emerald-400">
                        R$ {ord.price.toFixed(2).replace('.', ',')}
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">
                        {ord.paymentMethod === 'pix' ? 'PIX' : 'Na Mensalidade'}
                      </div>
                    </div>
                  </div>

                  {/* Identificação explícita do Aluno e Responsável no histórico */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <User size={10} className="text-red-400" /> Aluno
                      </span>
                      <div className="font-bold text-white truncate">{ord.studentName}</div>
                      <div className="text-[10px] text-slate-400">{ord.studentRegistration}</div>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1">
                        <UserCheck size={10} className="text-blue-400" /> Responsável
                      </span>
                      <div className="font-bold text-slate-300 truncate">
                        {ord.responsibleName || 'O próprio aluno'}
                      </div>
                      <div className="text-[10px] text-slate-400">{ord.createdAt}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <Building2 size={13} className="text-slate-500 flex-shrink-0" />
                    <span>Retirada: <strong className="text-slate-300">{ord.pickupLocation}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
