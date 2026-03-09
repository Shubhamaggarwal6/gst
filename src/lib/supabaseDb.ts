import { supabase } from './supabase';
import { User, Customer, Product, Invoice, Payment, PurchaseEntry } from './types';

// ─── Mappers ─────────────────────────────────────────────────────────────────

function mapUserFromDb(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    username: row.username as string,
    password: row.password as string,
    role: row.role as User['role'],
    firmName: row.firm_name as string,
    gstNumber: row.gst_number as string,
    email: row.email as string,
    phone: row.phone as string,
    plan: row.plan as User['plan'],
    maxEmployees: row.max_employees as number,
    subscriptionStart: row.subscription_start as string,
    subscriptionEnd: row.subscription_end as string,
    active: row.active as boolean,
    parentUserId: row.parent_user_id as string | undefined,
    showStockToEmployees: row.show_stock_to_employees as boolean,
    showProductsToEmployees: row.show_products_to_employees as boolean,
    firmSettings: row.firm_settings as User['firmSettings'],
  };
}

function mapUserToDb(user: User): Record<string, unknown> {
  return {
    id: user.id,
    username: user.username,
    password: user.password,
    role: user.role,
    firm_name: user.firmName,
    gst_number: user.gstNumber,
    email: user.email,
    phone: user.phone,
    plan: user.plan,
    max_employees: user.maxEmployees,
    subscription_start: user.subscriptionStart,
    subscription_end: user.subscriptionEnd,
    active: user.active,
    parent_user_id: user.parentUserId ?? null,
    show_stock_to_employees: user.showStockToEmployees,
    show_products_to_employees: user.showProductsToEmployees,
    firm_settings: user.firmSettings ?? null,
  };
}

function mapCustomerFromDb(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    phone: row.phone as string,
    gstNumber: row.gst_number as string,
    address: row.address as string,
    city: row.city as string | undefined,
    state: row.state as string | undefined,
    stateCode: row.state_code as string | undefined,
    pincode: row.pincode as string | undefined,
    createdAt: row.created_at as string | undefined,
  };
}

function mapCustomerToDb(customer: Customer): Record<string, unknown> {
  return {
    id: customer.id,
    user_id: customer.userId,
    name: customer.name,
    phone: customer.phone,
    gst_number: customer.gstNumber,
    address: customer.address,
    city: customer.city ?? null,
    state: customer.state ?? null,
    state_code: customer.stateCode ?? null,
    pincode: customer.pincode ?? null,
  };
}

function mapProductFromDb(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    hsn: row.hsn as string,
    price: Number(row.price),
    gstPercent: Number(row.gst_percent),
    unit: row.unit as string,
    stock: Number(row.stock),
    lowStockThreshold: Number(row.low_stock_threshold),
  };
}

function mapProductToDb(product: Product): Record<string, unknown> {
  return {
    id: product.id,
    user_id: product.userId,
    name: product.name,
    hsn: product.hsn,
    price: product.price,
    gst_percent: product.gstPercent,
    unit: product.unit,
    stock: product.stock,
    low_stock_threshold: product.lowStockThreshold,
  };
}

function mapInvoiceFromDb(row: Record<string, unknown>): Invoice {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    invoiceNumber: row.invoice_number as string,
    date: row.date as string,
    customerId: row.customer_id as string,
    customerName: row.customer_name as string,
    customerGst: row.customer_gst as string,
    customerAddress: row.customer_address as string,
    customerState: row.customer_state as string | undefined,
    customerStateCode: row.customer_state_code as string | undefined,
    vehicleNumber: row.vehicle_number as string,
    ewayBillNumber: row.eway_bill_number as string | undefined,
    items: row.items as Invoice['items'],
    totalAmount: Number(row.total_amount),
    totalGst: Number(row.total_gst),
    totalCgst: Number(row.total_cgst),
    totalSgst: Number(row.total_sgst),
    totalIgst: Number(row.total_igst),
    grandTotal: Number(row.grand_total),
    roundOff: Number(row.round_off),
    isInterState: row.is_inter_state as boolean,
    placeOfSupply: row.place_of_supply as string,
    status: row.status as Invoice['status'],
    paidAmount: Number(row.paid_amount),
    createdBy: row.created_by as Invoice['createdBy'],
  };
}

function mapInvoiceToDb(invoice: Invoice): Record<string, unknown> {
  return {
    id: invoice.id,
    user_id: invoice.userId,
    invoice_number: invoice.invoiceNumber,
    date: invoice.date,
    customer_id: invoice.customerId,
    customer_name: invoice.customerName,
    customer_gst: invoice.customerGst,
    customer_address: invoice.customerAddress,
    customer_state: invoice.customerState ?? null,
    customer_state_code: invoice.customerStateCode ?? null,
    vehicle_number: invoice.vehicleNumber,
    eway_bill_number: invoice.ewayBillNumber ?? null,
    items: invoice.items,
    total_amount: invoice.totalAmount,
    total_gst: invoice.totalGst,
    total_cgst: invoice.totalCgst,
    total_sgst: invoice.totalSgst,
    total_igst: invoice.totalIgst,
    grand_total: invoice.grandTotal,
    round_off: invoice.roundOff,
    is_inter_state: invoice.isInterState,
    place_of_supply: invoice.placeOfSupply,
    status: invoice.status,
    paid_amount: invoice.paidAmount,
    created_by: invoice.createdBy,
  };
}

function mapPaymentFromDb(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    customerId: row.customer_id as string,
    amount: Number(row.amount),
    date: row.date as string,
    mode: row.mode as Payment['mode'],
    invoiceId: row.invoice_id as string | undefined,
    note: row.note as string,
    timestamp: row.timestamp as string,
  };
}

function mapPaymentToDb(payment: Payment): Record<string, unknown> {
  return {
    id: payment.id,
    user_id: payment.userId,
    customer_id: payment.customerId,
    amount: payment.amount,
    date: payment.date,
    mode: payment.mode,
    invoice_id: payment.invoiceId ?? null,
    note: payment.note,
    timestamp: payment.timestamp,
  };
}

function mapPurchaseFromDb(row: Record<string, unknown>): PurchaseEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    supplierName: row.supplier_name as string,
    supplierGstin: row.supplier_gstin as string,
    invoiceNumber: row.invoice_number as string,
    invoiceDate: row.invoice_date as string,
    taxableAmount: Number(row.taxable_amount),
    igst: Number(row.igst),
    cgst: Number(row.cgst),
    sgst: Number(row.sgst),
    description: row.description as string,
    timestamp: row.timestamp as string,
  };
}

function mapPurchaseToDb(purchase: PurchaseEntry): Record<string, unknown> {
  return {
    id: purchase.id,
    user_id: purchase.userId,
    supplier_name: purchase.supplierName,
    supplier_gstin: purchase.supplierGstin,
    invoice_number: purchase.invoiceNumber,
    invoice_date: purchase.invoiceDate,
    taxable_amount: purchase.taxableAmount,
    igst: purchase.igst,
    cgst: purchase.cgst,
    sgst: purchase.sgst,
    description: purchase.description,
    timestamp: purchase.timestamp,
  };
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('app_users').select('*');
  if (error) { console.error('fetchAllUsers error:', error); return []; }
  return (data ?? []).map(mapUserFromDb);
}

export async function upsertUser(user: User): Promise<void> {
  const { error } = await supabase.from('app_users').upsert(mapUserToDb(user));
  if (error) console.error('upsertUser error:', error);
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function fetchCustomers(userId: string): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').eq('user_id', userId);
  if (error) { console.error('fetchCustomers error:', error); return []; }
  return (data ?? []).map(mapCustomerFromDb);
}

export async function upsertCustomer(customer: Customer): Promise<void> {
  const { error } = await supabase.from('customers').upsert(mapCustomerToDb(customer));
  if (error) console.error('upsertCustomer error:', error);
}

export async function deleteCustomer(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from('customers').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteCustomer error:', error);
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts(userId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('user_id', userId);
  if (error) { console.error('fetchProducts error:', error); return []; }
  return (data ?? []).map(mapProductFromDb);
}

export async function upsertProduct(product: Product): Promise<void> {
  const { error } = await supabase.from('products').upsert(mapProductToDb(product));
  if (error) console.error('upsertProduct error:', error);
}

export async function deleteProduct(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteProduct error:', error);
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export async function fetchInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase.from('invoices').select('*').eq('user_id', userId);
  if (error) { console.error('fetchInvoices error:', error); return []; }
  return (data ?? []).map(mapInvoiceFromDb);
}

export async function upsertInvoice(invoice: Invoice): Promise<void> {
  const { error } = await supabase.from('invoices').upsert(mapInvoiceToDb(invoice));
  if (error) console.error('upsertInvoice error:', error);
}

export async function deleteInvoice(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from('invoices').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deleteInvoice error:', error);
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function fetchPayments(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase.from('payments').select('*').eq('user_id', userId);
  if (error) { console.error('fetchPayments error:', error); return []; }
  return (data ?? []).map(mapPaymentFromDb);
}

export async function upsertPayment(payment: Payment): Promise<void> {
  const { error } = await supabase.from('payments').upsert(mapPaymentToDb(payment));
  if (error) console.error('upsertPayment error:', error);
}

export async function deletePayment(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from('payments').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deletePayment error:', error);
}

// ─── Purchases ────────────────────────────────────────────────────────────────

export async function fetchPurchases(userId: string): Promise<PurchaseEntry[]> {
  const { data, error } = await supabase.from('purchases').select('*').eq('user_id', userId);
  if (error) { console.error('fetchPurchases error:', error); return []; }
  return (data ?? []).map(mapPurchaseFromDb);
}

export async function upsertPurchase(purchase: PurchaseEntry): Promise<void> {
  const { error } = await supabase.from('purchases').upsert(mapPurchaseToDb(purchase));
  if (error) console.error('upsertPurchase error:', error);
}

export async function deletePurchase(id: string, userId: string): Promise<void> {
  const { error } = await supabase.from('purchases').delete().eq('id', id).eq('user_id', userId);
  if (error) console.error('deletePurchase error:', error);
}
