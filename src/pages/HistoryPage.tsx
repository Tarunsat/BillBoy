import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDB } from '../hooks/useDB';
import { Trash2, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils';

export function HistoryPage() {
  const { bills, loading, removeBill } = useDB();
  const navigate = useNavigate();

  if (loading) return <div className="p-8 text-center text-gray-500">Loading history...</div>;

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this bill?")) {
      removeBill(id);
    }
  };

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Bill History</h1>

      {bills.length === 0 ? (
        <div className="text-center text-gray-500 bg-card p-8 rounded-xl border border-border">
          No bills found.
        </div>
      ) : (
        <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {bills.map(bill => (
              <li 
                key={bill.id} 
                onClick={() => navigate(`/bill?id=${bill.id}`)}
                className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center transition-colors group"
              >
                <div>
                  <div className="font-bold text-gray-900">{formatDate(bill.date)} <span className="text-gray-400 font-normal ml-2">#{bill.id}</span></div>
                  <div className="text-sm text-gray-600">{bill.customer_name} - {bill.customer_group}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium text-saffron">Paid: ₹{bill.paid.toFixed(2)}</div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, bill.id!)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-saffron transition-colors hidden md:block" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
