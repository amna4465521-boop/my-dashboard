// خدمات بسيطة للتخزين في localStorage كبداية
const loadArray = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error("خطأ في قراءة", key, e);
    return [];
  }
};

const saveArray = (key, arr) => {
  try {
    localStorage.setItem(key, JSON.stringify(arr));
  } catch (e) {
    console.error("خطأ في حفظ", key, e);
  }
};

// المخزون
export const getInventoryItems = () => loadArray("inventory_items_v1");
export const setInventoryItems = (items) =>
  saveArray("inventory_items_v1", items);

// الموردين
export const getSuppliers = () => loadArray("suppliers_v1");
export const setSuppliers = (items) => saveArray("suppliers_v1", items);

// الفواتير
export const getInvoices = () => loadArray("invoices_v1");
export const setInvoices = (items) => saveArray("invoices_v1", items);

// التحصيل اليومي
export const getDailyCollections = () => loadArray("daily_collection_v1");
export const setDailyCollections = (items) =>
  saveArray("daily_collection_v1", items);

// دفتر الأستاذ
export const getLedgerEntries = () => loadArray("ledger_entries_v1");
export const setLedgerEntries = (items) =>
  saveArray("ledger_entries_v1", items);

// إضافة قيد جديد لدفتر أستاذ
export const addLedgerEntry = (entry) => {
  const current = getLedgerEntries();
  const withId = {
    id: Date.now(),
    date: entry.date || new Date().toISOString(),
    accountName: entry.accountName,
    accountType: entry.accountType || "عام",
    debit: Number(entry.debit || 0),
    credit: Number(entry.credit || 0),
    description: entry.description || "",
    refType: entry.refType || "",
    refId: entry.refId || "",
  };
  const updated = [...current, withId];
  setLedgerEntries(updated);
  return withId;
};