import type { Bill, BillItem, ConfigData } from './types';

export function calcBillTotals(items: BillItem[], config: ConfigData, bill: Partial<Bill>) {
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const totalLuggage = items.reduce((sum, item) => sum + item.luggage, 0);
  
  const commission = totalAmount * (config.commissionPct / 100);
  const coolie = items.length * config.cooliePerEntry;
  
  const deductions = commission + totalLuggage + coolie;
  const netAmount = totalAmount - deductions;
  const paid = bill.paid || 0;
  const netPayable = netAmount - paid;

  return {
    totalQty,
    totalAmount,
    totalLuggage,
    commission,
    coolie,
    deductions,
    netAmount,
    netPayable
  };
}
