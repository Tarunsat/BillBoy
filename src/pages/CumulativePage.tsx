import { useState, useEffect, useRef, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useConfig } from '../hooks/useConfig';
import { useDB } from '../hooks/useDB';
import type { Bill, BillItem } from '../types';
import { calcBillTotals } from '../utils';
import { BillDocument } from '../components/BillDocument';
import { Printer, Filter } from 'lucide-react';

type TimeRange = 'Today' | 'Yesterday' | 'This Week' | 'This Month' | 'Custom';

export function CumulativePage() {
  const { config, loading: configLoading } = useConfig();
  const { bills, loading: dbLoading, loadBillItems } = useDB();

  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [timeRange, setTimeRange] = useState<TimeRange>('Today');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const [loadingBulk, setLoadingBulk] = useState(false);
  const [bulkItems, setBulkItems] = useState<BillItem[]>([]);
  const [bulkBill, setBulkBill] = useState<Bill | null>(null);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const uniqueCustomers = useMemo(() => {
    const names = bills.map(b => b.customer_name).filter(Boolean);
    return Array.from(new Set(names)).sort();
  }, [bills]);

  useEffect(() => {
    if (uniqueCustomers.length > 0 && !selectedCustomer) {
      setSelectedCustomer(uniqueCustomers[0]);
    }
  }, [uniqueCustomers, selectedCustomer]);

  const generateBulkBill = async () => {
    if (!selectedCustomer) return;
    setLoadingBulk(true);

    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const filteredBills = bills.filter(b => {
        if (b.customer_name !== selectedCustomer) return false;

        const bDate = new Date(b.date);
        let match = false;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (timeRange) {
          case 'Today':
            match = bDate.getTime() === today.getTime();
            break;
          case 'Yesterday':
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            match = bDate.getTime() === yesterday.getTime();
            break;
          case 'This Week':
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            match = bDate >= startOfWeek;
            break;
          case 'This Month':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            match = bDate >= startOfMonth;
            break;
          case 'Custom':
            match = bDate >= start && bDate <= end;
            break;
        }
        return match;
      });

      let allItems: BillItem[] = [];
      let totalAdvance = 0;
      let totalPaid = 0;
      let group = config.defaultGroup;

      for (const b of filteredBills) {
        if (b.customer_group) group = b.customer_group;
        totalAdvance += b.advance || 0;
        totalPaid += b.paid || 0;
        
        if (b.id) {
          const items = await loadBillItems(b.id);
          const mappedItems = items.map(i => ({ ...i, date: b.date }));
          allItems = allItems.concat(mappedItems);
        }
      }

      setBulkItems(allItems);
      setBulkBill({
        date: timeRange === 'Custom' ? `${startDate} to ${endDate}` : timeRange,
        customer_name: selectedCustomer,
        customer_group: group,
        advance: totalAdvance,
        paid: totalPaid,
      });

    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBulk(false);
    }
  };

  if (configLoading || dbLoading) return <div>Loading...</div>;

  const totals = bulkBill ? calcBillTotals(bulkItems, config, bulkBill) : null;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Cumulative Bill</h1>

      <div className="bg-card p-4 rounded-xl shadow-sm border border-border space-y-4 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer</label>
            <select 
              value={selectedCustomer} 
              onChange={e => setSelectedCustomer(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none"
            >
              {uniqueCustomers.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Time Range</label>
            <select 
              value={timeRange} 
              onChange={e => setTimeRange(e.target.value as TimeRange)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none"
            >
              <option value="Today">Today</option>
              <option value="Yesterday">Yesterday</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="Custom">Custom Range</option>
            </select>
          </div>
          <div className="flex items-end">
             <button 
                onClick={generateBulkBill} 
                disabled={loadingBulk || !selectedCustomer}
                className="w-full h-10 bg-saffron text-white rounded-lg font-bold flex justify-center items-center gap-2 hover:bg-saffron/90 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Filter className="w-5 h-5" /> {loadingBulk ? 'Generating...' : 'Generate'}
              </button>
          </div>
        </div>

        {timeRange === 'Custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" 
              />
            </div>
          </div>
        )}
      </div>

      {bulkBill && totals && (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border">
          <div className="flex justify-between items-center mb-4 no-print">
            <h2 className="text-lg font-bold">Generated Bill</h2>
            <button 
              onClick={handlePrint}
              className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex justify-center w-full overflow-x-auto">
            {bulkItems.length > 0 ? (
               <BillDocument 
                 ref={printRef}
                 bill={bulkBill} 
                 items={bulkItems} 
                 config={config} 
                 totals={totals} 
               />
            ) : (
              <div className="p-8 text-center text-gray-500 w-full">No items found for this selection.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
