export type PendingOrder = {
  id: string;
  canteenId: number;
  items: string;
  subtotal: number;
  runnerFee: number;
  dropOff: string;
};

const KEY = "paddlergo-pending-order";

// PayMongo wants whole numbers in centavos: ₱150.00 = 15000
export const toCentavos = (pesos: number) => Math.round(pesos * 100);

export const newOrderId = () => `PG-${Date.now().toString().slice(-6)}`;

export function savePending(order: PendingOrder) {
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
  } catch {
    // ignore blocked storage
  }
}

export function loadPending(): PendingOrder | null {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? (JSON.parse(saved) as PendingOrder) : null;
  } catch {
    return null;
  }
}

export function clearPending() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore blocked storage
  }
}