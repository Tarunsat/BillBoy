import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../hooks/useConfig';
import { useDB } from '../hooks/useDB';
import type { Bill, BillItem } from '../types';
import { calcBillTotals } from '../utils';
import { Plus, Trash2 } from 'lucide-react';

export function EntryPage() {
  const { config, loading } = useConfig();
  const { addBill } = useDB();
  const navigate = useNavigate();

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState(config.defaultCustomer);
  const [customerGroup, setCustomerGroup] = useState(config.defaultGroup);
  const [advance, setAdvance] = useState(0);

  const [items, setItems] = useState<BillItem[]>([]);
  const [itemName, setItemName] = useState(config.defaultItemName);
  const [qty, setQty] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [luggage, setLuggage] = useState<number | ''>('');
  const [isInitialized, setIsInitialized] = useState(false);

  React.useEffect(() => {
    if (!loading && !isInitialized) {
      setCustomerName(config.defaultCustomer);
      setCustomerGroup(config.defaultGroup);
      setItemName(config.defaultItemName);
      setIsInitialized(true);
    }
  }, [loading, config, isInitialized]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || qty === '' || price === '') return;

    const nQty = Number(qty);
    const nPrice = Number(price);
    const nLuggage = Number(luggage) || 0;

    const newItem: BillItem = {
      item_name: itemName,
      qty: nQty,
      price: nPrice,
      total: nQty * nPrice,
      luggage: nLuggage,
      p_amount: 0,
    };

    setItems([...items, newItem]);
    setQty('');
    setPrice('');
    setLuggage('');
    // keep itemName same for next entry
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleGenerateBill = async () => {
    if (items.length === 0) return;

    const newBill: Bill = {
      date,
      customer_name: customerName,
      customer_group: customerGroup,
      advance: Number(advance) || 0,
      paid: 0,
    };

    const billId = await addBill(newBill, items);
    navigate(`/bill?id=${billId}`);
  };

  const totals = calcBillTotals(items, config, { paid: 0 });

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">New Entry</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-card p-4 rounded-xl shadow-sm border border-border">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name</label>
          <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Group</label>
          <input type="text" value={customerGroup} onChange={e => setCustomerGroup(e.target.value)} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Advance (₹)</label>
          <input type="number" value={advance} onChange={e => setAdvance(Number(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
      </div>

      <form onSubmit={handleAddItem} className="bg-card p-4 rounded-xl shadow-sm border border-border grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
        <div className="col-span-2 md:col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">Item Name</label>
          <input type="text" value={itemName} onChange={e => setItemName(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Qty</label>
          <input type="number" step="0.01" value={qty} onChange={e => setQty(Number(e.target.value))} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Price (₹)</label>
          <input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Luggage (₹)</label>
          <input type="number" step="0.01" value={luggage} onChange={e => setLuggage(Number(e.target.value))} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
        </div>
        <div className="col-span-2 md:col-span-1">
          <button type="submit" className="w-full h-10 bg-green text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green/90 transition-colors">
            <Plus className="w-5 h-5" /> Add
          </button>
        </div>
      </form>

      {items.length > 0 && (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-saffron-light text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Luggage</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.item_name}</td>
                    <td className="px-4 py-3 text-right">{item.qty.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{item.total.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">{item.luggage.toFixed(2)}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => removeItem(idx)} className="text-red-500 p-1 hover:bg-red-50 rounded-md">
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 p-4 border-t border-gray-100 flex flex-wrap justify-between items-center gap-4">
            <div className="flex gap-6 text-sm">
              <div><span className="text-gray-500">Commission:</span> <span className="font-bold">₹{totals.commission.toFixed(2)}</span></div>
              <div><span className="text-gray-500">Coolie:</span> <span className="font-bold">₹{totals.coolie.toFixed(2)}</span></div>
              <div><span className="text-gray-500">Net Amount:</span> <span className="font-bold text-saffron text-lg">₹{totals.netAmount.toFixed(2)}</span></div>
            </div>
            <button onClick={handleGenerateBill} className="bg-saffron text-white px-6 py-2 rounded-lg font-bold hover:bg-saffron/90 transition-colors shadow-sm">
              Generate Bill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
