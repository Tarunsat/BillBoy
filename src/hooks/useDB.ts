import { useState, useEffect } from 'react';
import { getBills, getBillItems, createBill, updateBillPaid, deleteBill } from '../db';
import type { Bill, BillItem } from '../types';

export function useDB() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const b = await getBills();
      setBills(b);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const addBill = async (bill: Bill, items: BillItem[]) => {
    const id = await createBill(bill, items);
    await fetchBills();
    return id;
  };

  const loadBillItems = async (billId: number) => {
    return await getBillItems(billId);
  };

  const payBill = async (billId: number, amount: number) => {
    await updateBillPaid(billId, amount);
    await fetchBills();
  };

  const removeBill = async (billId: number) => {
    await deleteBill(billId);
    await fetchBills();
  };

  return { bills, loading, fetchBills, addBill, loadBillItems, payBill, removeBill };
}
