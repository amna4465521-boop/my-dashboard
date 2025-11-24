// src/pages/SalesPage.js
import React, { useState, useEffect } from "react";

function SalesPage() {
  // رقم الفاتورة يتولد تلقائي
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [dateTime, setDateTime] = useState("");
  const [customerName, setCustomerName] = useState("عميل المحل (تجزئة)");
  const [totalAmount, setTotalAmount] = useState("");

  // طرق الدفع
  const [paymentMode, setPaymentMode] = useState("network"); // network / cash / mixed
  const [networkAmount, setNetworkAmount] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  // حفظ الفواتير (محلياً) لعرضها
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    // قراءة آخر رقم فاتورة
    const last = localStorage.getItem("last_invoice_number");
    if (last) {
      setInvoiceNumber(parseInt(last, 10) + 1);
    }

    // تحميل الفواتير
    const saved = localStorage.getItem("sales_invoices");
    if (saved) {
      setInvoices(JSON.parse(saved));
    }

    const now = new Date();
    const iso = now.toISOString().slice(0, 16);
    setDateTime(iso);
  }, []);

  useEffect(() => {
    localStorage.setItem("sales_invoices", JSON.stringify(invoices));
  }, [invoices]);

  const total = Number(totalAmount) || 0;

  // حسابات الدفع
  let effectiveNetwork = 0;
  let effectiveCash = 0;

  if (paymentMode === "network") {
    effectiveNetwork = total;
    effectiveCash = 0;
  } else if (paymentMode === "cash") {
    effectiveCash = total;
    effectiveNetwork = 0;
  } else if (paymentMode === "mixed") {
    effectiveNetwork = Number(networkAmount) || 0;
    effectiveCash = Number(cashAmount) || 0;
  }

  const totalPaid = effectiveNetwork + effectiveCash;
  const cashRec = Number(cashReceived) || 0;
  const mustReturnToCustomer =
    paymentMode === "cash" || paymentMode === "mixed"
      ? cashRec - effectiveCash
      : 0;

  const handleSaveInvoice = () => {
    if (!total || !dateTime) {
      alert("رجاءً أدخلي المبلغ الإجمالي والتاريخ.");
      return;
    }

    if (paymentMode === "mixed" && totalPaid !== total) {
      alert("مجموع الدفع (شبكة + كاش) لا يساوي إجمالي الفاتورة.");
      return;
    }

    if ((paymentMode === "cash" || paymentMode === "mixed") && cashRec < effectiveCash) {
      alert("المبلغ النقدي المستلم أقل من الجزء النقدي من الفاتورة.");
      return;
    }

    const newInvoice = {
      id: Date.now(),
      invoiceNumber,
      dateTime,
      customerName,
      total,
      paymentMode,
      networkAmount: effectiveNetwork,
      cashAmount: effectiveCash,
      cashReceived: cashRec,
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    localStorage.setItem("last_invoice_number", String(invoiceNumber));
    setInvoiceNumber((prev) => prev + 1);

    // إعادة ضبط للفاتورة الجديدة
    const now = new Date();
    const iso = now.toISOString().slice(0, 16);
    setDateTime(iso);
    setCustomerName("عميل المحل (تجزئة)");
    setTotalAmount("");
    setPaymentMode("network");
    setNetworkAmount("");
    setCashAmount("");
    setCashReceived("");
  };

  // ملخص اليوم من الفواتير
  const todayDate = new Date().toISOString().slice(0, 10);
  const todayInvoices = invoices.filter(
    (inv) => inv.dateTime.slice(0, 10) === todayDate
  );
  const sum = (filterFn) =>
    todayInvoices.filter(filterFn).reduce((acc, cur) => acc + cur.total, 0);

  const totalToday = sum(() => true);
  const totalTodayCash = todayInvoices
    .filter((inv) => inv.cashAmount > 0)
    .reduce((acc, cur) => acc + cur.cashAmount, 0);
  const totalTodayNetwork = todayInvoices
    .filter((inv) => inv.networkAmount > 0)
    .reduce((acc, cur) => acc + cur.networkAmount, 0);

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h2>🛒 المبيعات اليومية</h2>
      <p style={{ marginBottom: "15px", fontSize: "14px", color: "#4b5563" }}>
        هنا يسجل الموظف الفاتورة بشكل مبسط، مع تقسيم الدفع (شبكة / كاش / معاً) وحساب الباقي للعميل.
      </p>

      {/* ملخص اليوم */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>إجمالي فواتير اليوم</strong>
          <div style={{ fontSize: "20px", marginTop: "4px" }}>
            {totalToday.toFixed(2)} ريال
          </div>
        </div>

        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>مجموع كاش اليوم</strong>
          <div style={{ marginTop: "4px" }}>
            {totalTodayCash.toFixed(2)} ريال
          </div>
        </div>

        <div
          style={{
            padding: "10px",
            borderRadius: "8px",
            background: "#fff",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>مجموع شبكة اليوم</strong>
          <div style={{ marginTop: "4px" }}>
            {totalTodayNetwork.toFixed(2)} ريال
          </div>
        </div>
      </div>

      {/* بيانات الفاتورة */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "20px",
          background: "#ffffff",
        }}
      >
        <h3>🧾 فاتورة جديدة</h3>

        <div style={{ display: "grid", gap: "8px" }}>
          <div>
            <label>رقم الفاتورة</label>
            <div>{invoiceNumber}</div>
          </div>

          <div>
            <label>التاريخ والوقت</label>
            <input
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label>اسم العميل</label>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ width: "100%" }}
              placeholder="مثال: عميل المحل (تجزئة)"
            />
          </div>

          <div>
            <label>المبلغ الإجمالي للفاتورة (مع الضريبة)</label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="مثال: 150"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* طرق الدفع */}
        <div style={{ marginTop: "15px" }}>
          <h4>💳 طريقة الدفع</h4>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <button
              type="button"
              onClick={() => setPaymentMode("network")}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border:
                  paymentMode === "network"
                    ? "2px solid #2563eb"
                    : "1px solid #d1d5db",
                background:
                  paymentMode === "network" ? "#e0f2fe" : "#ffffff",
                cursor: "pointer",
              }}
            >
              💳 شبكة (كل المبلغ)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("cash")}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border:
                  paymentMode === "cash"
                    ? "2px solid #16a34a"
                    : "1px solid #d1d5db",
                background:
                  paymentMode === "cash" ? "#dcfce7" : "#ffffff",
                cursor: "pointer",
              }}
            >
              💵 نقدي (كل المبلغ)
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("mixed")}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border:
                  paymentMode === "mixed"
                    ? "2px solid #7c3aed"
                    : "1px solid #d1d5db",
                background:
                  paymentMode === "mixed" ? "#ede9fe" : "#ffffff",
                cursor: "pointer",
              }}
            >
              💳+💵 الجميع / أخرى
            </button>
          </div>

          {paymentMode === "mixed" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div>
                <label>جزء شبكة</label>
                <input
                  type="number"
                  value={networkAmount}
                  onChange={(e) => setNetworkAmount(e.target.value)}
                  placeholder="مثال: 400"
                  style={{ width: "100%" }}
                />
              </div>
              <div>
                <label>جزء نقدي</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  placeholder="مثال: 600"
                  style={{ width: "100%" }}
                />
              </div>
              <div style={{ gridColumn: "1 / span 2", fontSize: "13px" }}>
                مجموع الدفع: {totalPaid.toFixed(2)} ريال (يجب أن يساوي{" "}
                {total.toFixed(2)} ريال)
              </div>
            </div>
          )}

          {(paymentMode === "cash" || paymentMode === "mixed") && (
            <div
              style={{
                marginTop: "10px",
                padding: "8px",
                borderRadius: "8px",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
              }}
            >
              <label>المبلغ النقدي الذي استلمه الموظف من العميل</label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="مثال: 100"
                style={{ width: "100%", marginTop: "4px" }}
              />

              {cashRec > 0 && cashRec < effectiveCash && (
                <p style={{ marginTop: "8px", color: "red", fontSize: "13px" }}>
                  المبلغ النقدي المستلم أقل من الجزء النقدي من الفاتورة.
                </p>
              )}

              {cashRec >= effectiveCash && effectiveCash > 0 && (
                <p
                  style={{ marginTop: "8px", color: "green", fontSize: "13px" }}
                >
                  الباقي المستحق للعميل:{" "}
                  <strong>{mustReturnToCustomer.toFixed(2)} ريال</strong>
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveInvoice}
          style={{
            marginTop: "15px",
            padding: "10px 16px",
            borderRadius: "10px",
            border: "none",
            background: "#4b7bec",
            color: "#ffffff",
            fontSize: "15px",
            cursor: "pointer",
          }}
        >
          ✅ حفظ الفاتورة
        </button>
      </div>

      {/* قائمة آخر الفواتير بشكل بسيط */}
      <h3>🧾 آخر الفواتير المسجلة</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ border: "1px solid #e5e7eb", padding: "6px" }}>
              رقم
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "6px" }}>
              التاريخ
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "6px" }}>
              العميل
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "6px" }}>
              الإجمالي
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "6px" }}>
              شبكة
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "6px" }}>
              نقدي
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {inv.invoiceNumber}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {inv.dateTime.replace("T", " ")}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {inv.customerName}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {inv.total.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {inv.networkAmount.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {inv.cashAmount.toFixed(2)}
              </td>
            </tr>
          ))}

          {invoices.length === 0 && (
            <tr>
              <td
                colSpan="6"
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                لا توجد فواتير مسجلة حتى الآن.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default SalesPage;