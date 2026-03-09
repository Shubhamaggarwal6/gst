import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Customer, Product, Invoice, Payment, PurchaseEntry } from '@/lib/types';
import { initialUsers, initialCustomers, initialProducts, initialInvoices, initialPayments, initialPurchases } from '@/lib/demoData';
import {
  fetchAllUsers, upsertUser,
  fetchCustomers, upsertCustomer, deleteCustomer,
  fetchProducts, upsertProduct, deleteProduct,
  fetchInvoices, upsertInvoice, deleteInvoice,
  fetchPayments, upsertPayment, deletePayment,
  fetchPurchases, upsertPurchase, deletePurchase,
} from '@/lib/supabaseDb';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {}
  return fallback;
}

function saveToStorage(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

interface AppState {
  currentUser: User | null;
  users: User[];
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  payments: Payment[];
  purchases: PurchaseEntry[];
  loading: boolean;
  setCurrentUser: (u: User | null) => void;
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setPurchases: React.Dispatch<React.SetStateAction<PurchaseEntry[]>>;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUserState] = useState<User | null>(() => loadFromStorage('bs_currentUser', null));
  const [users, setUsersState] = useState<User[]>(() => loadFromStorage('bs_users', initialUsers));
  const [customers, setCustomersState] = useState<Customer[]>(() => loadFromStorage('bs_customers', initialCustomers));
  const [products, setProductsState] = useState<Product[]>(() => loadFromStorage('bs_products', initialProducts));
  const [invoices, setInvoicesState] = useState<Invoice[]>(() => loadFromStorage('bs_invoices', initialInvoices));
  const [payments, setPaymentsState] = useState<Payment[]>(() => loadFromStorage('bs_payments', initialPayments));
  const [purchases, setPurchasesState] = useState<PurchaseEntry[]>(() => loadFromStorage('bs_purchases', initialPurchases));

  // On mount: sync users from Supabase
  useEffect(() => {
    async function syncFromSupabase() {
      try {
        const dbUsers = await fetchAllUsers();
        if (dbUsers.length > 0) {
          setUsersState(dbUsers);
          saveToStorage('bs_users', dbUsers);
        }
      } catch (e) {
        console.error('Supabase sync error:', e);
      } finally {
        setLoading(false);
      }
    }
    syncFromSupabase();
  }, []);

  // Sync currentUser's data when they log in
  useEffect(() => {
    const user = currentUser;
    if (!user) return;
    // For employees, data is stored under the parent user's ID
    const dataUserId = user.role === 'employee' && user.parentUserId ? user.parentUserId : user.id;
    async function syncUserData() {
      try {
        const [dbCustomers, dbProducts, dbInvoices, dbPayments, dbPurchases] = await Promise.all([
          fetchCustomers(dataUserId),
          fetchProducts(dataUserId),
          fetchInvoices(dataUserId),
          fetchPayments(dataUserId),
          fetchPurchases(dataUserId),
        ]);
        setCustomersState(dbCustomers); saveToStorage('bs_customers', dbCustomers);
        setProductsState(dbProducts); saveToStorage('bs_products', dbProducts);
        setInvoicesState(dbInvoices); saveToStorage('bs_invoices', dbInvoices);
        setPaymentsState(dbPayments); saveToStorage('bs_payments', dbPayments);
        setPurchasesState(dbPurchases); saveToStorage('bs_purchases', dbPurchases);
      } catch (e) {
        console.error('User data sync error:', e);
      }
    }
    syncUserData();
  }, [currentUser?.id]);

  // Wrapped setters that also persist to localStorage and sync to Supabase
  const setCurrentUser = (u: User | null) => {
    setCurrentUserState(u);
    saveToStorage('bs_currentUser', u);
    // Clear previous user's data on logout or user switch to prevent data bleed
    if (!u) {
      setCustomersState([]); saveToStorage('bs_customers', []);
      setProductsState([]); saveToStorage('bs_products', []);
      setInvoicesState([]); saveToStorage('bs_invoices', []);
      setPaymentsState([]); saveToStorage('bs_payments', []);
      setPurchasesState([]); saveToStorage('bs_purchases', []);
    }
  };

  const setUsers: React.Dispatch<React.SetStateAction<User[]>> = (action) => {
    setUsersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_users', next);
      next.forEach(u => upsertUser(u).catch(console.error));
      return next;
    });
  };

  const setCustomers: React.Dispatch<React.SetStateAction<Customer[]>> = (action) => {
    setCustomersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_customers', next);
      next.forEach(c => upsertCustomer(c).catch(console.error));
      const nextIds = new Set(next.map(c => c.id));
      prev.filter(c => !nextIds.has(c.id)).forEach(c => deleteCustomer(c.id, c.userId).catch(console.error));
      return next;
    });
  };

  const setProducts: React.Dispatch<React.SetStateAction<Product[]>> = (action) => {
    setProductsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_products', next);
      next.forEach(p => upsertProduct(p).catch(console.error));
      const nextIds = new Set(next.map(p => p.id));
      prev.filter(p => !nextIds.has(p.id)).forEach(p => deleteProduct(p.id, p.userId).catch(console.error));
      return next;
    });
  };

  const setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>> = (action) => {
    setInvoicesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_invoices', next);
      next.forEach(i => upsertInvoice(i).catch(console.error));
      const nextIds = new Set(next.map(i => i.id));
      prev.filter(i => !nextIds.has(i.id)).forEach(i => deleteInvoice(i.id, i.userId).catch(console.error));
      return next;
    });
  };

  const setPayments: React.Dispatch<React.SetStateAction<Payment[]>> = (action) => {
    setPaymentsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_payments', next);
      next.forEach(p => upsertPayment(p).catch(console.error));
      const nextIds = new Set(next.map(p => p.id));
      prev.filter(p => !nextIds.has(p.id)).forEach(p => deletePayment(p.id, p.userId).catch(console.error));
      return next;
    });
  };

  const setPurchases: React.Dispatch<React.SetStateAction<PurchaseEntry[]>> = (action) => {
    setPurchasesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_purchases', next);
      next.forEach(p => upsertPurchase(p).catch(console.error));
      const nextIds = new Set(next.map(p => p.id));
      prev.filter(p => !nextIds.has(p.id)).forEach(p => deletePurchase(p.id, p.userId).catch(console.error));
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, customers, products, invoices, payments, purchases, loading,
      setCurrentUser, setUsers, setCustomers, setProducts, setInvoices, setPayments, setPurchases,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
