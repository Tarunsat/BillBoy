import { forwardRef } from 'react';
import type { Bill, BillItem, ConfigData } from '../types';
import { formatDate } from '../utils';

interface Props {
  bill: Bill;
  items: BillItem[];
  config: ConfigData;
  totals: {
    totalQty: number;
    totalAmount: number;
    totalLuggage: number;
    commission: number;
    coolie: number;
    deductions: number;
    netAmount: number;
    netPayable: number;
  };
}

export const BillDocument = forwardRef<HTMLDivElement, Props>(({ bill, items, config, totals }, ref) => {
  return (
    <div ref={ref} className="bg-white p-8 w-full max-w-[800px] mx-auto text-black font-mono text-sm print-only">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold font-sans uppercase">{config.shopName}</h1>
        <p className="text-sm">{config.shopAddress}</p>
        <div className="flex justify-between items-center mt-2 font-bold text-xs">
          <span>Trade Mark: {config.tradeMark}</span>
          <span className="space-x-4">
            <span>PH: {config.phone}</span>
            {config.mobile && <span>Mob: {config.mobile}</span>}
          </span>
        </div>
      </div>

      <div className="border-t border-b border-black py-2 mb-4 flex justify-between font-bold">
        <span>Name: {bill.customer_name}</span>
        <span>Group: {bill.customer_group}</span>
        <span>Advance: {bill.advance.toFixed(2)}</span>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="border-b border-black text-left">
            <th className="py-1">Date</th>
            <th className="py-1">Item Name</th>
            <th className="py-1 text-right">Qty</th>
            <th className="py-1 text-right">Price</th>
            <th className="py-1 text-right">Total</th>
            <th className="py-1 text-right">Lagauge</th>
            <th className="py-1 text-right">P Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={i} className="border-b border-gray-200">
              <td className="py-1">{formatDate(item.date || bill.date)}</td>
              <td className="py-1">{item.item_name}</td>
              <td className="py-1 text-right">{item.qty.toFixed(2)}</td>
              <td className="py-1 text-right">{item.price.toFixed(2)}</td>
              <td className="py-1 text-right">{item.total.toFixed(2)}</td>
              <td className="py-1 text-right">{item.luggage.toFixed(2)}</td>
              <td className="py-1 text-right">{item.p_amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-black font-bold">
            <td colSpan={2} className="py-1">Total</td>
            <td className="py-1 text-right">{totals.totalQty.toFixed(2)}</td>
            <td></td>
            <td className="py-1 text-right">{totals.totalAmount.toFixed(2)}</td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <div className="border-t border-black pt-4 flex justify-between">
        <div className="w-1/2">
          <div className="flex justify-between pr-8 mb-1">
            <span>Comm...</span>
            <span>{totals.commission.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pr-8 mb-1">
            <span>Lug ...</span>
            <span>{totals.totalLuggage.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pr-8 mb-1">
            <span>Coolie..</span>
            <span>{totals.coolie.toFixed(2)}</span>
          </div>
          <div className="flex justify-between pr-8 font-bold mt-2 border-t border-gray-400 pt-1">
            <span>Total</span>
            <span>{totals.deductions.toFixed(2)}</span>
          </div>
        </div>
        <div className="w-1/2 border-l border-gray-400 pl-8 flex flex-col justify-between">
          <div>
             <div className="flex justify-between mb-1">
              <span>Net Amount</span>
              <span>{totals.netAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Paid :</span>
              <span>{bill.paid.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-lg mt-4 border-t border-gray-400 pt-2">
            <span>Net Amount Payable:</span>
            <span>{totals.netPayable.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-black mt-8 pt-8 flex justify-between text-xs">
        <span>Signature line</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  );
});

BillDocument.displayName = 'BillDocument';
