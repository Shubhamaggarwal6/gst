import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Customer, Product, Invoice, Payment, PurchaseEntry } from '@/lib/types';
import { initialUsers, initialCustomers, initialProducts, initialInvoices, initialPayments, initialPurchases } from '@/lib/demoData';
import {
  fetchAllUsers, upsertUser,
  fetchCustomers, upsertCustomer,
  fetchProducts, upsertProduct,
  fetchInvoices, upsertInvoice,
  fetchPayments, upsertPayment,
  fetchPurchases, upsertPurchase,
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

function getChangedItems<T extends { id: string }>(prev: T[], next: T[]): T[] {
  const prevIds = new Set(prev.map(item => item.id));
  return next.filter(item => {
    if (!prevIds.has(item.id)) return true;
    const old = prev.find(o => o.id === item.id);
    return JSON.stringify(old) !== JSON.stringify(item);
  });
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

  // On mount: seed Supabase if empty, then sync data for any already-logged-in user
  useEffect(() => {
    async function init() {
      try {
        // Step 1: Sync users
        const dbUsers = await fetchAllUsers();
        if (dbUsers.length > 0) {
          setUsersState(dbUsers);
          saveToStorage('bs_users', dbUsers);
        } else {
          // Supabase has no users — seed it from localStorage/initialUsers
          const localUsers = loadFromStorage<User[]>('bs_users', initialUsers);
          await Promise.all(localUsers.map(u => upsertUser(u).catch(console.error)));
          console.log('Seeded', localUsers.length, 'users to Supabase');
        }

        // Step 2: If user is already logged in (from localStorage), sync their data immediately
        const storedUser = loadFromStorage<User | null>('bs_currentUser', null);
        if (storedUser) {
          const dataUserId = storedUser.role === 'employee' && storedUser.parentUserId
            ? storedUser.parentUserId
            : storedUser.id;
          const [dbCustomers, dbProducts, dbInvoices, dbPayments, dbPurchases] = await Promise.all([
            fetchCustomers(dataUserId),
            fetchProducts(dataUserId),
            fetchInvoices(dataUserId),
            fetchPayments(dataUserId),
            fetchPurchases(dataUserId),
          ]);
          setCustomersState(dbCustomers);   saveToStorage('bs_customers', dbCustomers);
          setProductsState(dbProducts);     saveToStorage('bs_products', dbProducts);
          setInvoicesState(dbInvoices);     saveToStorage('bs_invoices', dbInvoices);
          setPaymentsState(dbPayments);     saveToStorage('bs_payments', dbPayments);
          setPurchasesState(dbPurchases);   saveToStorage('bs_purchases', dbPurchases);
        }
      } catch (e) {
        console.error('Supabase init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []); // runs ONCE on mount

  // Sync currentUser's data when they log in (handles fresh logins, not reloads)
  useEffect(() => {
    const user = currentUser;
    if (!user) return;
    async function syncUserData() {
      try {
        // Employees share the parent (owner) user's data
        const dataUserId = user.role === 'employee' && user.parentUserId ? user.parentUserId : user.id;
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
  };

  const setUsers: React.Dispatch<React.SetStateAction<User[]>> = (action) => {
    setUsersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_users', next);
      getChangedItems(prev, next).forEach(u => upsertUser(u).catch(console.error));
      return next;
    });
  };

  const setCustomers: React.Dispatch<React.SetStateAction<Customer[]>> = (action) => {
    setCustomersState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_customers', next);
      getChangedItems(prev, next).forEach(c => upsertCustomer(c).catch(console.error));
      return next;
    });
  };

  const setProducts: React.Dispatch<React.SetStateAction<Product[]>> = (action) => {
    setProductsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_products', next);
      getChangedItems(prev, next).forEach(p => upsertProduct(p).catch(console.error));
      return next;
    });
  };

  const setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>> = (action) => {
    setInvoicesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_invoices', next);
      getChangedItems(prev, next).forEach(i => upsertInvoice(i).catch(console.error));
      return next;
    });
  };

  const setPayments: React.Dispatch<React.SetStateAction<Payment[]>> = (action) => {
    setPaymentsState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_payments', next);
      getChangedItems(prev, next).forEach(p => upsertPayment(p).catch(console.error));
      return next;
    });
  };

  const setPurchases: React.Dispatch<React.SetStateAction<PurchaseEntry[]>> = (action) => {
    setPurchasesState(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      saveToStorage('bs_purchases', next);
      getChangedItems(prev, next).forEach(p => upsertPurchase(p).catch(console.error));
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
