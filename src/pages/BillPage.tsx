import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { useConfig } from '../hooks/useConfig';
import { useDB } from '../hooks/useDB';
import type { Bill, BillItem } from '../types';
import { calcBillTotals } from '../utils';
import { BillDocument } from '../components/BillDocument';
import { Printer } from 'lucide-react';

export function BillPage() {
  const { config, loading: configLoading } = useConfig();
  const { bills, loading: dbLoading, loadBillItems, payBill } = useDB();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [paidInput, setPaidInput] = useState<string>('');

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const billIdParam = searchParams.get('id');

  useEffect(() => {
    if (dbLoading) return;

    if (bills.length > 0) {
      let targetBill = bills[0];
      if (billIdParam) {
        const found = bills.find(b => b.id === Number(billIdParam));
        if (found) targetBill = found;
      }
      setSelectedBill(targetBill);
      setPaidInput(targetBill.paid.toString());
      if (billIdParam !== targetBill.id?.toString()) {
        setSearchParams({ id: targetBill.id!.toString() }, { replace: true });
      }
    } else {
      setSelectedBill(null);
    }
  }, [bills, dbLoading, billIdParam, setSearchParams]);

  useEffect(() => {
    if (selectedBill?.id) {
      loadBillItems(selectedBill.id).then(setItems);
    } else {
      setItems([]);
    }
  }, [selectedBill?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBillSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({ id: e.target.value });
  };

  const handlePaidUpdate = async () => {
    if (!selectedBill?.id) return;
    const amount = Number(paidInput);
    if (!isNaN(amount)) {
      await payBill(selectedBill.id, amount);
      setSelectedBill({ ...selectedBill, paid: amount });
    }
  };

  if (configLoading || dbLoading) return <div>Loading...</div>;

  if (!selectedBill) {
    return <div className="p-8 text-center text-gray-500">No bills found. Create one in the Entry tab.</div>;
  }

  const totals = calcBillTotals(items, config, selectedBill);

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-xl shadow-sm border border-border no-print">
        <div className="flex-1 w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-600 mb-1">Select Bill</label>
          <select value={selectedBill.id || ''} onChange={handleBillSelect} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none">
            {bills.map(b => (
              <option key={b.id} value={b.id}>
                {b.date} - {b.customer_name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-end gap-2 w-full md:w-auto">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Paid Amount (₹)</label>
            <input 
              type="number" 
              value={paidInput} 
              onChange={e => setPaidInput(e.target.value)} 
              onBlur={handlePaidUpdate}
              className="w-full md:w-32 p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" 
            />
          </div>
          <button onClick={handlePrint} className="bg-saffron text-white h-10 px-6 rounded-lg font-bold flex items-center gap-2 hover:bg-saffron/90 transition-colors shadow-sm whitespace-nowrap">
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="bg-gray-100 p-4 md:p-8 rounded-xl overflow-x-auto no-print flex justify-center">
        <div className="shadow-lg border border-gray-200">
          <BillDocument ref={printRef} bill={selectedBill} items={items} config={config} totals={totals} />
        </div>
      </div>

      {/* Actual print area is handled by the print-only css class inside BillDocument */}
    </div>
  );
}
