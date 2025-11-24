// src/pages/SalesPage.js
import React, { useEffect, useState } from "react";

// دالة بسيطة لتنسيق المبلغ
function formatCurrency(value) {
  const num = Number(value) || 0;
  return num.toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function todayKey(dateStr) {
  // نخزن التاريخ بصيغة YYYY-MM-DD
  const d = dateStr ? new Date(dateStr) : new Date();
  return d.toISOString().slice(0, 10);
}

export default function SalesPage({ currentUser }) {
  // ======= الحالة العامة =======
  const [inventoryItems, setInventoryItems] = useState([]); // من صفحة الجرد
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [branchName, setBranchName] = useState("فرع الرياض");
  const [customerName, setCustomerName] = useState("عميل المحل تجزئة");
  const [invoiceDate, setInvoiceDate] = useState(todayKey());
  const [invoiceNumber, setInvoiceNumber] = useState(1);

  // طريقة الدفع
  const [paymentType, setPaymentType] = useState("cash"); // cash | network | split
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [splitCash, setSplitCash] = useState("");
  const [splitCard, setSplitCard] = useState("");

  // إعدادات عرض الكروت
  const [showStatsForEmployees, setShowStatsForEmployees] = useState(false);

  // أرقام اليوم
  const [todayStats, setTodayStats] = useState({
    totalReconciliation: 0,
    totalNetwork: 0,
    totalCash: 0,
  });

  const isAdmin = currentUser?.role === "admin";

  // ======= تحميل البيانات من localStorage عند أول فتح =======
  useEffect(() => {
    // المخزون
    const savedInventory = localStorage.getItem("inventory_items");
    if (savedInventory) {
      try {
        setInventoryItems(JSON.parse(savedInventory));
      } catch (e) {
        console.error("خطأ في قراءة المخزون:", e);
      }
    }

    // الشبكات
    const savedNetworks = localStorage.getItem("pos_networks");
    if (savedNetworks) {
      try {
        const parsed = JSON.parse(savedNetworks);
        setNetworks(parsed);
        if (parsed[0]) setSelectedNetwork(parsed[0].id);
      } catch (e) {
        console.error("خطأ في قراءة الشبكات:", e);
      }
    } else {
      // قيم افتراضية
      const defaults = [
        { id: "mada", name: "مدى" },
        { id: "visa", name: "فيزا" },
        { id: "mc", name: "ماستركارد" },
      ];
      setNetworks(defaults);
      setSelectedNetwork(defaults[0].id);
      localStorage.setItem("pos_networks", JSON.stringify(defaults));
    }

    // إعداد عرض الكروت
    const savedShowStats = localStorage.getItem("sales_show_stats_for_employees");
    if (savedShowStats) {
      setShowStatsForEmployees(savedShowStats === "true");
    }

    // الفواتير السابقة (لحساب رقم الفاتورة وأرقام اليوم)
    const savedInvoices = localStorage.getItem("sales_invoices");
    if (savedInvoices) {
      try {
        const parsed = JSON.parse(savedInvoices);
        if (parsed.length > 0) {
          const maxNo = Math.max(...parsed.map((inv) => inv.invoiceNumber || 0));
          setInvoiceNumber(maxNo + 1);
        }
        recomputeTodayStats(parsed);
      } catch (e) {
        console.error("خطأ في قراءة فواتير المبيعات:", e);
      }
    }
  }, []);

  // ======= دوال مساعدة =======

  const recomputeTodayStats = (invoices) => {
    const today = todayKey();
    const todays = invoices.filter((inv) => inv.dateKey === today);

    let totalCash = 0;
    let totalCard = 0;

    todays.forEach((inv) => {
      totalCash += Number(inv.cashAmount || 0);
      totalCard += Number(inv.cardAmount || 0);
    });

    setTodayStats({
      // مبدئيًا نخلي الموازنة = مجموع الشبكة (نقدر نعدلها لاحقًا إذا ربطناها بالموازنة الحقيقية)
      totalReconciliation: totalCard,
      totalNetwork: totalCard,
      totalCash: totalCash,
    });
  };

  const invoiceTotal = invoiceItems.reduce(
    (sum, row) => sum + (Number(row.total) || 0),
    0
  );

  const handleAddRow = () => {
    setInvoiceItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        itemId: "",
        name: "",
        unit: "حبة",
        qty: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const handleRemoveRow = (rowId) => {
    setInvoiceItems((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleItemChange = (rowId, itemId) => {
    const item = inventoryItems.find((it) => String(it.id) === String(itemId));
    setInvoiceItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        if (!item) {
          return { ...row, itemId, name: "", unitPrice: 0, total: 0 };
        }
        const unitPrice = Number(item.priceWithTax || 0);
        const qty = Number(row.qty || 0) || 1;
        return {
          ...row,
          itemId,
          name: item.name,
          unitPrice,
          total: unitPrice * qty,
        };
      })
    );
  };

  const handleRowFieldChange = (rowId, field, value) => {
    setInvoiceItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };

        const qtyNum = Number(
          field === "qty" ? value : updated.qty
        );
        const priceNum = Number(
          field === "unitPrice" ? value : updated.unitPrice
        );

        if (!isNaN(qtyNum) && !isNaN(priceNum)) {
          updated.total = qtyNum * priceNum;
        }
        return updated;
      })
    );
  };

  // حفظ الشبكات
  const handleAddNetwork = () => {
    const name = window.prompt("أدخل اسم الشبكة (مثال: مدى 2):");
    if (!name) return;
    const id = Date.now();
    const newList = [...networks, { id, name }];
    setNetworks(newList);
    localStorage.setItem("pos_networks", JSON.stringify(newList));
    setSelectedNetwork(id);
  };

  const handleDeleteNetwork = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الشبكة؟")) return;
    const newList = networks.filter((n) => n.id !== id);
    setNetworks(newList);
    localStorage.setItem("pos_networks", JSON.stringify(newList));
    if (selectedNetwork === id && newList[0]) {
      setSelectedNetwork(newList[0].id);
    }
  };

  const handleToggleStatsForEmployees = () => {
    const newVal = !showStatsForEmployees;
    setShowStatsForEmployees(newVal);
    localStorage.setItem("sales_show_stats_for_employees", String(newVal));
  };

  // حفظ الفاتورة
  const handleSaveInvoice = () => {
    if (invoiceItems.length === 0) {
      window.alert("الرجاء إضافة أصناف للفاتورة أولاً.");
      return;
    }

    if (!paymentType) {
      window.alert("الرجاء اختيار طريقة الدفع.");
      return;
    }

    const total = invoiceTotal;
    let cashAmount = 0;
    let cardAmount = 0;
    let usedNetwork = "";

    if (paymentType === "cash") {
      cashAmount = total;
    } else if (paymentType === "network") {
      cardAmount = total;
      usedNetwork = selectedNetwork;
      if (!usedNetwork) {
        window.alert("الرجاء اختيار شبكة.");
        return;
      }
    } else if (paymentType === "split") {
      const cash = Number(splitCash) || 0;
      const card = Number(splitCard) || 0;
      const diff = Math.abs(total - (cash + card));
      if (diff > 0.01) {
        window.alert(
          "مجموع الكاش + الشبكة لا يساوي إجمالي الفاتورة. الرجاء التأكد."
        );
        return;
      }
      cashAmount = cash;
      cardAmount = card;
      usedNetwork = selectedNetwork;
      if (!usedNetwork) {
        window.alert("الرجاء اختيار شبكة للدفع بالشبكة.");
        return;
      }
    }

    const newInvoice = {
      id: Date.now(),
      invoiceNumber,
      branchName,
      customerName,
      dateKey: todayKey(invoiceDate),
      invoiceDate,
      items: invoiceItems,
      totalAmount: total,
      paymentType,
      networkId: usedNetwork,
      cashAmount,
      cardAmount,
      createdBy: currentUser?.username || "",
    };

    // حفظ في localStorage
    const savedInvoices = localStorage.getItem("sales_invoices");
    let list = [];
    if (savedInvoices) {
      try {
        list = JSON.parse(savedInvoices);
      } catch {
        list = [];
      }
    }
    const newList = [...list, newInvoice];
    localStorage.setItem("sales_invoices", JSON.stringify(newList));

    // تحديث أرقام اليوم
    recomputeTodayStats(newList);

    // تحديث رقم الفاتورة
    setInvoiceNumber((prev) => prev + 1);

    // تنظيف الفاتورة الجارية
    setInvoiceItems([]);
    setPaymentType("cash");
    setSplitCash("");
    setSplitCard("");

    window.alert("تم حفظ الفاتورة مؤقتاً في النظام المحلي.");
  };

  // ======= JSX =======
  const showStats =
    isAdmin || showStatsForEmployees;

  return (
    <div
      style={{
        direction: "rtl",
        textAlign: "right",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* كروت اليوم */}
      {showStats && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "12px",
          }}
        >
          <div
            style={{
              flex: "1 1 120px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#0f172a",
              color: "#e5e7eb",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              💳 مجموع شغل اليوم (موازنة)
            </div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>
              {formatCurrency(todayStats.totalReconciliation)} ريال
            </div>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#111827",
              color: "#e5e7eb",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              🧾 مجموع شغل اليوم شبكة
            </div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>
              {formatCurrency(todayStats.totalNetwork)} ريال
            </div>
          </div>

          <div
            style={{
              flex: "1 1 120px",
              padding: "8px 10px",
              borderRadius: "10px",
              background: "#022c22",
              color: "#d1fae5",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>
              💵 مجموع شغل اليوم كاش
            </div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>
              {formatCurrency(todayStats.totalCash)} ريال
            </div>
          </div>

          {/* إعدادات إظهار الكروت + إعداد الشبكات (للمدير فقط) */}
          {isAdmin && (
            <div
              style={{
                flex: "1 1 180px",
                padding: "8px 10px",
                borderRadius: "10px",
                background: "#f9fafb",
                border: "1px dashed #e5e7eb",
                fontSize: "12px",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                ⚙ إعدادات صفحة المبيعات
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="checkbox"
                  checked={showStatsForEmployees}
                  onChange={handleToggleStatsForEmployees}
                />
                <span>إظهار كروت إجمالي اليوم للموظفين</span>
              </label>

              <div style={{ marginTop: "6px" }}>
                <div style={{ marginBottom: "2px" }}>شبكات نقاط البيع:</div>
                <ul style={{ margin: 0, paddingInlineStart: "1.2rem" }}>
                  {networks.map((n) => (
                    <li key={n.id}>
                      {n.name}{" "}
                      <button
                        type="button"
                        onClick={() => handleDeleteNetwork(n.id)}
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#ef4444",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        حذف
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleAddNetwork}
                  style={{
                    marginTop: "4px",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    border: "1px solid #4b5563",
                    background: "#fff",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  ➕ إضافة شبكة جديدة
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* بطاقة الفاتورة */}
      <div
        style={{
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          padding: "10px 12px",
          background: "#f9fafb",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: "6px",
            fontSize: "18px",
          }}
        >
          🛒 واجهة المبيعات
        </h2>
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: 0 }}>
          شاشة مبسطة لكتابة فاتورة المبيعات اليومية. لاحقاً نربطها بطباعة
          الفاتورة والباركود الحراري وكل التفاصيل.
        </p>

        {/* رأس الفاتورة */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <div>
            <label style={{ fontSize: "13px" }}>رقم الفاتورة</label>
            <input
              type="text"
              value={invoiceNumber}
              readOnly
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
                background: "#f3f4f6",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "13px" }}>التاريخ</label>
            <input
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "13px" }}>الفرع</label>
            <input
              type="text"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: "13px" }}>العميل</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "6px",
                border: "1px solid #d1d5db",
              }}
            />
          </div>
        </div>

        {/* طريقة الدفع */}
        <div
          style={{
            borderRadius: "10px",
            padding: "8px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            marginBottom: "10px",
          }}
        >
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: 4 }}>
            💰 طريقة الدفع
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <label>
              <input
                type="radio"
                value="cash"
                checked={paymentType === "cash"}
                onChange={(e) => setPaymentType(e.target.value)}
              />{" "}
              نقدي (يذهب لصندوق المحل الرئيسي)
            </label>
            <label>
              <input
                type="radio"
                value="network"
                checked={paymentType === "network"}
                onChange={(e) => setPaymentType(e.target.value)}
              />{" "}
              شبكة
            </label>
            <label>
              <input
                type="radio"
                value="split"
                checked={paymentType === "split"}
                onChange={(e) => setPaymentType(e.target.value)}
              />{" "}
              شبكة + نقدي
            </label>
          </div>

          {/* اختيار الشبكة */}
          {(paymentType === "network" || paymentType === "split") && (
            <div style={{ marginTop: "6px" }}>
              <label style={{ fontSize: "13px" }}>اختر الشبكة</label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  marginTop: "2px",
                }}
              >
                {networks.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* تقسيم المبلغ في حالة split */}
          {paymentType === "split" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))",
                gap: "8px",
                marginTop: "6px",
              }}
            >
              <div>
                <label style={{ fontSize: "13px" }}>مبلغ الكاش</label>
                <input
                  type="number"
                  value={splitCash}
                  onChange={(e) => setSplitCash(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: "13px" }}>مبلغ الشبكة</label>
                <input
                  type="number"
                  value={splitCard}
                  onChange={(e) => setSplitCard(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "6px",
                    border: "1px solid #d1d5db",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* جدول الأصناف */}
        <div
          style={{
            borderRadius: "10px",
            padding: "8px",
            background: "#ffffff",
            border: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              🧾 أصناف الفاتورة
            </div>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                border: "none",
                background: "#4f46e5",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              ➕ إضافة سطر
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                minWidth: "600px",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      width: "30px",
                    }}
                  >
                    #
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الصنف
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الوحدة
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الكمية
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    سعر الوحدة (شامل ضريبة)
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الإجمالي
                  </th>
                  <th
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      width: "50px",
                    }}
                  >
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "8px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}
                    >
                      لم تتم إضافة أصناف بعد.
                    </td>
                  </tr>
                )}

                {invoiceItems.map((row, index) => (
                  <tr key={row.id}>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {index + 1}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <select
                        value={row.itemId}
                        onChange={(e) =>
                          handleItemChange(row.id, e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                        }}
                      >
                        <option value="">اختر صنفاً من المخزون</option>
                        {inventoryItems.map((it) => (
                          <option key={it.id} value={it.id}>
                            {it.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <select
                        value={row.unit}
                        onChange={(e) =>
                          handleRowFieldChange(row.id, "unit", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                        }}
                      >
                        <option value="حبة">حبة</option>
                        <option value="كرتون">كرتون</option>
                        <option value="كيس">كيس</option>
                        <option value="شدة">شدة</option>
                      </select>
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <input
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleRowFieldChange(row.id, "qty", e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <input
                        type="number"
                        value={row.unitPrice}
                        onChange={(e) =>
                          handleRowFieldChange(
                            row.id,
                            "unitPrice",
                            e.target.value
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #d1d5db",
                        }}
                      />
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {formatCurrency(row.total)} ريال
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        style={{
                          padding: "3px 6px",
                          borderRadius: "6px",
                          border: "none",
                          background: "#fee2e2",
                          color: "#b91c1c",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        ✖
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* إجمالي الفاتورة + حفظ */}
          <div
            style={{
              marginTop: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 600 }}>
              إجمالي الفاتورة:{" "}
              <span style={{ color: "#16a34a" }}>
                {formatCurrency(invoiceTotal)} ريال
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveInvoice}
              style={{
                padding: "6px 16px",
                borderRadius: "10px",
                border: "none",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,1), rgba(59,130,246,1))",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              💾 حفظ الفاتورة (مؤقت)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}