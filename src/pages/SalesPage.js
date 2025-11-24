import React, { useEffect, useState } from "react";
import {
  getInventoryItems,
  getInvoices,
  setInvoices,
  addLedgerEntry,
} from "../services/storage";

function SalesPage({ currentUser }) {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("عميل المحل تجزئة");
  const [paymentCash, setPaymentCash] = useState(0);
  const [paymentCard, setPaymentCard] = useState(0);
  const [paymentTransfer, setPaymentTransfer] = useState(0);
  const [lastInvoiceNumber, setLastInvoiceNumber] = useState(0);

  useEffect(() => {
    const invItems = getInventoryItems();
    setItems(invItems);
    const invoices = getInvoices();
    if (invoices.length > 0) {
      const maxNum = Math.max(
        ...invoices.map((inv) => Number(inv.invoiceNumber || 0))
      );
      setLastInvoiceNumber(maxNum);
    }
  }, []);

  const handleAddToCart = () => {
    if (!selectedItemId) {
      alert("اختاري صنفاً أولاً");
      return;
    }
    const item = items.find((i) => String(i.id) === String(selectedItemId));
    if (!item) {
      alert("الصنف غير موجود");
      return;
    }
    const quantity = Number(qty || 0);
    if (quantity <= 0) {
      alert("الكمية يجب أن تكون أكبر من صفر");
      return;
    }
    // تحقق بسيط من الكمية المتاحة
    if (quantity > item.qty) {
      alert("الكمية المدخلة أكبر من الكمية في المخزون");
      return;
    }

    const lineTotal = item.priceWithTax * quantity;
    const newLine = {
      itemId: item.id,
      name: item.name,
      qty: quantity,
      unitPrice: item.priceWithTax,
      lineTotal,
    };
    setCart((prev) => [...prev, newLine]);
  };

  const cartTotal = cart.reduce((sum, line) => sum + line.lineTotal, 0);
  const totalPaid =
    Number(paymentCash || 0) +
    Number(paymentCard || 0) +
    Number(paymentTransfer || 0);
  const changeAmount =
    totalPaid > cartTotal ? totalPaid - cartTotal : 0;

  const handleSaveInvoice = () => {
    if (cart.length === 0) {
      alert("لا توجد أصناف في الفاتورة");
      return;
    }
    if (totalPaid <= 0) {
      alert("أدخلي طريقة دفع واحدة على الأقل");
      return;
    }

    const nextNumber = lastInvoiceNumber + 1;
    const invoiceNumber = String(nextNumber);

    const newInvoice = {
      id: Date.now(),
      invoiceNumber,
      customerName,
      items: cart,
      total: cartTotal,
      paymentCash: Number(paymentCash || 0),
      paymentCard: Number(paymentCard || 0),
      paymentTransfer: Number(paymentTransfer || 0),
      changeAmount,
      createdBy: currentUser ? currentUser.username : "",
      createdAt: new Date().toISOString(),
    };

    const existingInvoices = getInvoices();
    const updated = [...existingInvoices, newInvoice];
    setInvoices(updated);
    setLastInvoiceNumber(nextNumber);

    // تحديث المخزون (إنقاص الكمية)
    const updatedItems = items.map((it) => {
      const line = cart.find((c) => c.itemId === it.id);
      if (!line) return it;
      return {
        ...it,
        qty: (it.qty || 0) - line.qty,
      };
    });
    setItems(updatedItems);

    // قيد في دفتر أستاذ (مبسط)
    addLedgerEntry({
      accountName: "مبيعات المحل",
      accountType: "إيراد",
      credit: cartTotal,
      debit: 0,
      description: "فاتورة مبيعات رقم " + invoiceNumber,
      refType: "invoice",
      refId: invoiceNumber,
    });

    if (paymentCash > 0) {
      addLedgerEntry({
        accountName: "صندوق المحل",
        accountType: "صندوق",
        debit: Number(paymentCash || 0),
        credit: 0,
        description: "تحصيل كاش فاتورة " + invoiceNumber,
        refType: "invoice",
        refId: invoiceNumber,
    });
    }

    if (paymentCard > 0) {
      addLedgerEntry({
        accountName: "حساب الشبكات",
        accountType: "تحصيل إلكتروني",
        debit: Number(paymentCard || 0),
        credit: 0,
        description: "تحصيل شبكة فاتورة " + invoiceNumber,
        refType: "invoice",
        refId: invoiceNumber,
      });
    }

    if (paymentTransfer > 0) {
      addLedgerEntry({
        accountName: "صندوق الحوالات",
        accountType: "تحصيل",
        debit: Number(paymentTransfer || 0),
        credit: 0,
        description: "تحصيل حوالة فاتورة " + invoiceNumber,
        refType: "invoice",
        refId: invoiceNumber,
      });
    }

    // تصفير النموذج
    setCart([]);
    setPaymentCash(0);
    setPaymentCard(0);
    setPaymentTransfer(0);
    alert("تم حفظ الفاتورة رقم " + invoiceNumber);
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>🛒 واجهة المبيعات</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        واجهة بسيطة للمبيعات اليومية. لاحقاً نضيف الباركود والطباعة الحرارية
        وكل التفاصيل التي اتفقنا عليها.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1.2fr",
          gap: "12px",
        }}
      >
        {/* اختيار الأصناف */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "10px",
            backgroundColor: "#f9fafb",
          }}
        >
          <h4 style={{ marginTop: 0 }}>إضافة أصناف للفاتورة</h4>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "13px" }}>العميل</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginTop: "2px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "13px" }}>الصنف</label>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginTop: "2px",
                fontSize: "13px",
              }}
            >
              <option value="">اختاري صنفاً</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.name} — {it.priceWithTax.toFixed(2)} ريال — متاح:{" "}
                  {it.qty}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ fontSize: "13px" }}>الكمية</label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginTop: "2px",
                fontSize: "13px",
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            style={{
              padding: "8px 12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#4b7bec",
              color: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            ➕ إضافة للفاتورة
          </button>

          <div style={{ marginTop: "10px" }}>
            <h5>محتوى الفاتورة</h5>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#ffffff",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#eef2ff" }}>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الصنف
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الكمية
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    سعر الوحدة
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الإجمالي
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart.map((line, idx) => (
                  <tr key={idx}>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        fontSize: "12px",
                      }}
                    >
                      {line.name}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {line.qty}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {line.unitPrice.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {line.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
                {cart.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "6px",
                        fontSize: "12px",
                        textAlign: "center",
                      }}
                    >
                      لم تتم إضافة أصناف بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <div
              style={{
                marginTop: "6px",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              إجمالي الفاتورة: {cartTotal.toFixed(2)} ريال
            </div>
          </div>
        </div>

        {/* الدفع */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "10px",
            backgroundColor: "#f9fafb",
          }}
        >
          <h4 style={{ marginTop: 0 }}>طريقة الدفع</h4>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            يمكنك تقسيم المبلغ بين شبكة / كاش / حوالة.
          </div>

          <div style={{ marginTop: "8px" }}>
            <label style={{ fontSize: "13px" }}>نقدي (كاش)</label>
            <input
              type="number"
              value={paymentCash}
              onChange={(e) => setPaymentCash(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginTop: "2px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ marginTop: "8px" }}>
            <label style={{ fontSize: "13px" }}>شبكة</label>
            <input
              type="number"
              value={paymentCard}
              onChange={(e) => setPaymentCard(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginTop: "2px",
                fontSize: "13px",
              }}
            />
          </div>

          <div style={{ marginTop: "8px" }}>
            <label style={{ fontSize: "13px" }}>حوالة</label>
            <input
              type="number"
              value={paymentTransfer}
              onChange={(e) => setPaymentTransfer(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                marginTop: "2px",
                fontSize: "13px",
              }}
            />
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "13px",
              borderTop: "1px dashed #e5e7eb",
              paddingTop: "8px",
            }}
          >
            <div>إجمالي الفاتورة: {cartTotal.toFixed(2)} ريال</div>
            <div>إجمالي المدفوع: {totalPaid.toFixed(2)} ريال</div>
            <div>
              المتبقي للعميل:{" "}
              {changeAmount > 0 ? changeAmount.toFixed(2) : "0.00"} ريال
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveInvoice}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              fontSize: "13px",
              cursor: "pointer",
              width: "100%",
            }}
          >
            💾 حفظ الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
}

export default SalesPage;