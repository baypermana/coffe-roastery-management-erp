import { supabase } from '../lib/supabase';
import {
  Supplier,
  PurchaseOrder,
  GreenBeanGrade,
  RoastProfile,
  ExternalRoastLog,
  CuppingSession,
  Blend,
  StockItem,
  WarehouseLog,
  SalesRecord,
  AlertSetting,
  Packaging,
  Expense,
  Todo,
  Comment,
  User,
} from '../types';

const generateNewId = (prefix: string): string => {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const datePart = `${month}${year}`;
  const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${datePart}-${randomNum}`;
};

const crudOperations = <T extends { id: string }>(tableName: string, prefix: string) => ({
  getAll: async (): Promise<T[]> => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${tableName}:`, error);
      return [];
    }
    return data as T[];
  },

  getById: async (id: string): Promise<T | null> => {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${tableName} by id:`, error);
      return null;
    }
    return data as T | null;
  },

  add: async (item: Omit<T, 'id' | 'created_at'>): Promise<T | null> => {
    const newId = generateNewId(prefix);
    const newItem = { ...item, id: newId };

    const { data, error } = await supabase
      .from(tableName)
      .insert(newItem)
      .select()
      .single();

    if (error) {
      console.error(`Error adding ${tableName}:`, error);
      return null;
    }
    return data as T;
  },

  update: async (id: string, updates: Partial<T>): Promise<T | null> => {
    const { data, error } = await supabase
      .from(tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${tableName}:`, error);
      return null;
    }
    return data as T;
  },

  remove: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error removing ${tableName}:`, error);
      return false;
    }
    return true;
  },
});

export const dataService = {
  users: {
    ...crudOperations<User>('users', 'US'),
    getByUsername: async (username: string): Promise<User | null> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user by username:', error);
        return null;
      }
      return data as User | null;
    },
  },
  suppliers: crudOperations<Supplier>('suppliers', 'SP'),
  purchaseOrders: crudOperations<PurchaseOrder>('purchase_orders', 'PO'),
  stock: crudOperations<StockItem>('stock_items', 'ST'),
  sales: crudOperations<SalesRecord>('sales_records', 'SL'),
  grades: crudOperations<GreenBeanGrade>('green_bean_grades', 'GR'),
  roasts: crudOperations<RoastProfile>('roast_profiles', 'RT'),
  externalRoasts: crudOperations<ExternalRoastLog>('external_roast_logs', 'ER'),
  cuppings: crudOperations<CuppingSession>('cupping_sessions', 'CP'),
  blends: crudOperations<Blend>('blends', 'BL'),
  warehouseLogs: crudOperations<WarehouseLog>('warehouse_logs', 'LG'),
  alertSettings: crudOperations<AlertSetting>('alert_settings', 'AL'),
  packaging: crudOperations<Packaging>('packaging', 'PK'),
  expenses: crudOperations<Expense>('expenses', 'EX'),
  todos: crudOperations<Todo>('todos', 'TD'),
  comments: crudOperations<Comment>('comments', 'CM'),
};

export const useSupabaseData = () => {
  return { dataService, isLoading: false };
};
