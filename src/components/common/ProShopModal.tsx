import React, { useState } from 'react';
import { 
  X, ShoppingBag, Check, QrCode, CreditCard, ChevronRight, 
  Sparkles, CheckCircle2, Package, Tag, ArrowRight
} from 'lucide-react';
import { ShopProduct } from '../../types';
import { mockShopProducts } from '../../data/mockData';
import { bjjAudio } from '../../utils/audio';

interface ProShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPix?: (amount: number, title: string) => void;
}

export const ProShopModal: React.FC<ProShopModalProps> = ({ isOpen, onClose, onOpenPix }) => {
  const [products] = useState<ShopProduct[]>(mockShopProducts);
  const [selectedProduct, setSelectedProduct] = useState<ShopProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [purchaseSuccess, setPurchaseSuccess] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'mensalidade'>('pix');

  if (!isOpen) return null;

  const categories = ['Todos', 'Kimonos', 'No-Gi / Rashguard', 'Faixas', 'Acessórios & Patches', 'Nutrição'];

  const filtered = products.filter(p => 
    selectedCategory === 'Todos' || p.category === selectedCategory
  );

  const handleSelectProduct = (prod: ShopProduct) => {
    setSelectedProduct(prod);
    setSelectedSize(prod.sizes[0] || '');
    setSelectedColor(prod.colors[0] || '');
    setPurchaseSuccess(false);
  };

  const handleConfirmPurchase = () => {
    bjjAudio.playAccessGranted();
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setSelectedProduct(null);
    }, 2800);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center sm:p-4"
      id="modal-pro-shop"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[92vh] sm:h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-500">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base leading-tight">Pro-Shop Oficial BJJ Academy</h2>
              <p className="text-xs text-slate-400">Kimonos, rashguards, faixas e suplementos para treino</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar bg-slate-900/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedProduct ? (
            /* Product Detail & Checkout View */
            <div className="space-y-4">
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-xs text-red-400 hover:underline flex items-center gap-1 font-semibold"
              >
                ← Voltar para a loja
              </button>

              <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-48 h-48 rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 border border-slate-700">
                    <img 
                      src={selectedProduct.image} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    {selectedProduct.officialAcademy && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-400 uppercase tracking-wider">
                        Uniforme Oficial da Equipe
                      </span>
                    )}
                    <h3 className="font-bold text-white text-lg leading-tight">
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

                {/* Size Selector */}
                {selectedProduct.sizes.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-700/60">
                    <label className="text-xs font-bold text-slate-300">Selecione o Tamanho:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.sizes.map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            selectedSize === sz 
                              ? 'bg-red-600 text-white border-red-500' 
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selector */}
                {selectedProduct.colors.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Cor:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            selectedColor === c 
                              ? 'bg-red-600 text-white border-red-500' 
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
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                        paymentMethod === 'pix' 
                          ? 'bg-emerald-950/40 border-emerald-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <QrCode size={18} className="text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold">PIX Instantâneo</div>
                        <div className="text-[10px] text-slate-400">Retirada no tatame</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('mensalidade')}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors ${
                        paymentMethod === 'mensalidade' 
                          ? 'bg-blue-950/40 border-blue-500 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <CreditCard size={18} className="text-blue-400" />
                      <div>
                        <div className="text-xs font-bold">Lançar na Mensalidade</div>
                        <div className="text-[10px] text-slate-400">Vencimento próximo mês</div>
                      </div>
                    </button>
                  </div>
                </div>

                {purchaseSuccess ? (
                  <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-center text-emerald-300 space-y-1">
                    <CheckCircle2 size={28} className="mx-auto text-emerald-400" />
                    <div className="font-bold text-sm">Pedido Confirmado com Sucesso!</div>
                    <div className="text-xs text-emerald-200">
                      Seu kimono/item já está reservado na recepção. Apresente este voucher ao professor.
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirmPurchase}
                    className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white text-sm shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    Confirmar Compra • R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Product Catalog Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => handleSelectProduct(prod)}
                  className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all active:scale-[0.99] group"
                >
                  <div className="space-y-2">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-700/80 relative">
                      <img 
                        src={prod.image} 
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.officialAcademy && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold px-2 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider shadow">
                          Oficial BJJ
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {prod.category}
                      </span>
                      <h4 className="font-bold text-white text-sm leading-snug line-clamp-2">
                        {prod.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-400">Preço</div>
                      <div className="font-extrabold text-white text-base text-emerald-400">
                        R$ {prod.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>

                    <button 
                      className="px-3 py-1.5 rounded-lg bg-slate-700 group-hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      Comprar <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
