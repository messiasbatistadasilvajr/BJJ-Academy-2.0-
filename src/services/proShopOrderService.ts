import { ProShopOrder, ProShopOrderStatus } from '../types';
import { mockInitialProShopOrders } from '../data/mockData';
import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/safeStorage';
import { bjjAudio } from '../utils/audio';

const STORAGE_KEY = 'bjja_pro_shop_orders_v2';

type OrderListener = (orders: ProShopOrder[]) => void;

class ProShopOrderServiceClass {
  private listeners: OrderListener[] = [];

  public getOrders(academyId?: string): ProShopOrder[] {
    const orders = safeLocalStorageGet<ProShopOrder[]>(STORAGE_KEY, mockInitialProShopOrders);
    if (!academyId || academyId === 'all') {
      return orders;
    }
    return orders.filter(o => !o.academyId || o.academyId === academyId);
  }

  public getPendingSeparationCount(academyId?: string): number {
    const orders = this.getOrders(academyId);
    return orders.filter(o => o.status === 'aguardando_separacao').length;
  }

  public createOrder(newOrder: ProShopOrder): ProShopOrder {
    const all = safeLocalStorageGet<ProShopOrder[]>(STORAGE_KEY, mockInitialProShopOrders);
    const updated = [newOrder, ...all];
    safeLocalStorageSet(STORAGE_KEY, updated);

    // Play operational alert audio chime
    try {
      bjjAudio.playAccessGranted();
    } catch {
      // Audio fallback
    }

    this.notifyListeners(updated);
    return newOrder;
  }

  public updateOrderStatus(
    orderId: string, 
    status: ProShopOrderStatus, 
    extra?: Partial<ProShopOrder>
  ): ProShopOrder | null {
    const all = safeLocalStorageGet<ProShopOrder[]>(STORAGE_KEY, mockInitialProShopOrders);
    let updatedOrder: ProShopOrder | null = null;

    const updated = all.map(ord => {
      if (ord.id === orderId) {
        updatedOrder = {
          ...ord,
          status,
          ...(extra || {})
        };
        return updatedOrder;
      }
      return ord;
    });

    if (updatedOrder) {
      safeLocalStorageSet(STORAGE_KEY, updated);
      this.notifyListeners(updated);
    }

    return updatedOrder;
  }

  public markAsSeparated(orderId: string, separatedBy: string): ProShopOrder | null {
    const now = new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    return this.updateOrderStatus(orderId, 'separado_estoque', {
      stockChecked: true,
      separatedAt: now,
      separatedBy
    });
  }

  public markAsDelivered(orderId: string): ProShopOrder | null {
    const now = new Date().toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    return this.updateOrderStatus(orderId, 'entregue', {
      deliveredAt: now
    });
  }

  public markAsOutOfStock(orderId: string, note?: string): ProShopOrder | null {
    return this.updateOrderStatus(orderId, 'sem_estoque', {
      stockChecked: false,
      stockNote: note || 'Produto em falta no estoque físico da unidade. Solicitar reposição.'
    });
  }

  public subscribe(listener: OrderListener): () => void {
    this.listeners.push(listener);
    // emit current state
    listener(this.getOrders());

    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(orders: ProShopOrder[]) {
    this.listeners.forEach(l => {
      try {
        l(orders);
      } catch (err) {
        console.warn('Listener error in ProShopOrderService:', err);
      }
    });
  }
}

export const ProShopOrderService = new ProShopOrderServiceClass();
