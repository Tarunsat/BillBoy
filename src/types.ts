export interface ConfigData {
  shopName: string;
  shopAddress: string;
  phone: string;
  mobile: string;
  tradeMark: string;
  commissionPct: number;
  cooliePerEntry: number;
  defaultCustomer: string;
  defaultGroup: string;
  defaultItemName: string;
}

export interface BillItem {
  id?: number;
  bill_id?: number;
  date?: string; // For cumulative bills
  item_name: string;
  qty: number;
  price: number;
  total: number;
  luggage: number;
  p_amount: number;
}

export interface Bill {
  id?: number;
  date: string;
  customer_name: string;
  customer_group: string;
  advance: number;
  paid: number;
  created_at?: string;
  items?: BillItem[]; // Added for convenience when fetching a full bill
}

export const defaultConfig: ConfigData = {
  shopName: "M.D.K BHUVANA FLOWER STALL",
  shopAddress: "Shop No.91/A S.K.R Market, Bangalore-560002",
  phone: "080-22374775",
  mobile: "",
  tradeMark: "M.D.K",
  commissionPct: 12,
  cooliePerEntry: 3,
  defaultCustomer: "SKT",
  defaultGroup: "MDK",
  defaultItemName: "JASMINE",
};
