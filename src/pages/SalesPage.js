// src/pages/SalesPage.js
import React, { useState, useEffect } from "react";

const DEFAULT_CUSTOMER = "عميل المحل تجزئة";

const PAYMENT_TYPES = {
  CASH: "cash",
  CARD: "card",
  MIXED: "mixed",
};

function formatDateTime(date) {
  return date.toLocaleString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function SalesPage({ currentUser }) {
  // بيانات الفاتورة
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [branch, setBranch] = useState("فرع الرياض");
  const [customer, setCustomer] = useState(DEFAULT_CUSTOMER);

  // أصناف الفاتورة
  const [items, setItems] = useState([]);

  // طريقة الدفع
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.CASH);
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [networks, setNetworks] = useState([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState("");

  // فواتير محفوظة محليًا + مؤشر للتنقل بينها
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(null);

  const isAdmin = currentUser?.role === "admin";

  // تحميل الشبكات والفواتير من localStorage
  useEffect(() => {
    const storedNetworks = localStorage.getItem("pos_networks");
    if (storedNetworks) {
      try {
        const parsed = JSON.parse(storedNetworks);
        setNetworks(parsed);
        if (parsed.length > 0) setSelectedNetworkId(parsed[0].id);
      } catch (e) {
        console.error("خطأ في قراءة الشبكات", e);
      }
    } else {
      // شبكة افتراضية
      const defaultNet = [{ id: 1, name: "مدى" }];
      setNetworks(defaultNet);
      setSelectedNetworkId(1);
      localStorage.setItem("pos_networks", JSON.stringify(defaultNet));
    }

    const storedInvoices = localStorage.getItem("sales_invoices_v1");
    if (storedInvoices) {
      try {
        const parsed = JSON.parse(storedInvoices);
        setSavedInvoices(parsed);
        if (parsed.length > 0) {
          setInvoiceNumber(parsed[parsed.length - 1].number + 1);
        }
      } catch (e) {
        console.error("خطأ في قراءة الفواتير", e);
      }
    }
  }, []);

  useEffect(() => {
    // تحديث الوقت تلقائيًا كل ما تفتح الفاتورة
    setInvoiceDate(new Date());
  }, [invoiceNumber]);

  const saveInvoicesToStorage = (list) => {
    localStorage.setItem("sales_invoices_v1", JSON.stringify(list));
  };

  // ====== حسابات سريعة ======

  const calcRowTotal = (row) => {
    const qty = Number(row.qty) || 0;
    const price = Number(row.unitPrice) || 0;
    return qty * price;
  };

  const calcInvoiceTotal = () => {
    return items.reduce((sum, row) => sum + calcRowTotal(row), 0);
  };

  // ملخص اليوم (للكروت اللي فوق مثل الميزان)
  const todayKey = new Date().toISOString().slice(0, 10);
  const visibleInvoicesForUser = savedInvoices.filter((inv) => {
    if (!inv.date) return false;
    const d = inv.date.slice(0, 10);
    if (d !== todayKey) return false;
    // لو سوينا لاحقًا إخفاء عن موظفين نفلتر هنا
    if (inv.hiddenFromEmployees && !isAdmin) return false;
    return true;
  });

  const todayTotals = visibleInvoicesForUser.reduce(
    (acc, inv) => {
      acc.count += 1;
      acc.total += inv.total || 0;
      acc.cash += inv.cashAmount || 0;
      acc.card += inv.cardAmount || 0;
      return acc;
    },
    { count: 0, total: 0, cash: 0, card: 0 }
  );

  // ====== إدارة الأصناف ======

  const handleAddEmptyRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        unit: "حبة",
        qty: 1,
        unitPrice: "",
      },
    ]);
  };

  const handleRowFieldChange = (rowId, field, value) => {
    setItems((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };
        return updated;
      })
    );
  };

  const handleDeleteRow = (rowId) => {
    setItems((prev) => prev.filter((row) => row.id !== rowId));
  };

  // ====== إدارة الشبكات ======

  const handleAddNetwork = () => {
    const name = window.prompt("أدخل اسم الشبكة (مثال: مدى 2):");
    if (!name) return;
    const id = Date.now();
    const newList = [...networks, { id, name }];
    setNetworks(newList);
    localStorage.setItem("pos_networks", JSON.stringify(newList));
    setSelectedNetworkId(id);
  };

  const handleDeleteNetwork = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الشبكة؟")) return;
    const newList = networks.filter((n) => n.id !== id);
    setNetworks(newList);
    localStorage.setItem("pos_networks", JSON.stringify(newList));
    if (selectedNetworkId === id && newList.length > 0) {
      setSelectedNetworkId(newList[0].id);
    }
  };

  // ====== حفظ الفاتورة ======

  const handleSaveInvoice = (printAfter = false) => {
    if (items.length === 0) {
      window.alert("لم يتم إضافة أصناف للفاتورة.");
      return;
    }

    const total = calcInvoiceTotal();
    if (total <= 0) {
      window.alert("إجمالي الفاتورة يجب أن يكون أكبر من صفر.");
      return;
    }

    let finalCash = 0;
    let finalCard = 0;

    if (paymentType === PAYMENT_TYPES.CASH) {
      finalCash = total;
    } else if (paymentType === PAYMENT_TYPES.CARD) {
      finalCard = total;
    } else if (paymentType === PAYMENT_TYPES.MIXED) {
      const c = Number(cashAmount) || 0;
      const k = Number(cardAmount) || 0;
      if (Math.abs(c + k - total) > 0.01) {
        window.alert("مجموع النقدي + الشبكة يجب أن يساوي إجمالي الفاتورة.");
        return;
      }
      finalCash = c;
      finalCard = k;
    }

    const invoiceObj = {
      id: Date.now(),
      number: invoiceNumber,
      date: invoiceDate.toISOString(),
      branch,
      customer,
      items,
      paymentType,
      cashAmount: finalCash,
      cardAmount: finalCard,
      networkId:
        paymentType === PAYMENT_TYPES.CARD ||
        paymentType === PAYMENT_TYPES.MIXED
          ? selectedNetworkId
          : null,
      total,
      createdBy: currentUser?.username || null,
      hiddenFromEmployees: false, // ممكن نستخدمها لاحقًا
    };

    const newList = [...savedInvoices, invoiceObj];
    setSavedInvoices(newList);
    saveInvoicesToStorage(newList);
    setCurrentInvoiceIndex(newList.length - 1);

    // تجهيز فاتورة جديدة
    setInvoiceNumber((prev) => prev + 1);
    setItems([]);
    setPaymentType(PAYMENT_TYPES.CASH);
    setCashAmount("");
    setCardAmount("");
    setInvoiceDate(new Date());

    if (printAfter) {
      // مؤقتًا نطبع الصفحة كلها، لاحقًا نخلي قسم الفاتورة فقط للطباعة
      setTimeout(() => {
        window.print();
      }, 100);
    } else {
      window.alert("تم حفظ الفاتورة بنجاح (بدون طباعة).");
    }
  };

  // ====== التنقل بين الفواتير المحفوظة (بسيط) ======

  const handleLoadInvoiceByIndex = (index) => {
    if (index < 0 || index >= savedInvoices.length) return;
    const inv = savedInvoices[index];
    setCurrentInvoiceIndex(index);
    setInvoiceNumber(inv.number);
    setInvoiceDate(new Date(inv.date));
    setBranch(inv.branch);
    setCustomer(inv.customer);
    setPaymentType(inv.paymentType);
    setCashAmount(inv.cashAmount || "");
    setCardAmount(inv.cardAmount || "");
    setSelectedNetworkId(inv.networkId || "");
    setItems(
      inv.items.map((row) => ({
        ...row,
        id: row.id || Date.now() + Math.random(),
      }))
    );
  };

  const handlePrevInvoice = () => {
    if (currentInvoiceIndex === null) return;
    const newIndex = currentInvoiceIndex - 1;
    if (newIndex >= 0) handleLoadInvoiceByIndex(newIndex);
  };

  const handleNextInvoice = () => {
    if (currentInvoiceIndex === null) return;
    const newIndex = currentInvoiceIndex + 1;
    if (newIndex < savedInvoices.length) handleLoadInvoiceByIndex(newIndex);
  };

  const total = calcInvoiceTotal();

  // ====== JSX ======
  return (
    <div style={{ padding: "8px" }}>
      {/* كروت ملخص اليوم */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            background: "#fef3c7",
            borderRadius: "10px",
            padding: "8px",
            fontSize: "12px",
          }}
        >
          <div>💰 مبيعات اليوم</div>
          <div style={{ fontWeight: 700 }}>
            {todayTotals.total.toFixed(2)} ريال
          </div>
        </div>
        <div
          style={{
            background: "#dcfce7",
            borderRadius: "10px",
            padding: "8px",
            fontSize: "12px",
          }}
        >
          <div>💵 كاش اليوم</div>
          <div style={{ fontWeight: 700 }}>
            {todayTotals.cash.toFixed(2)} ريال
          </div>
        </div>
        <div
          style={{
            background: "#dbeafe",
            borderRadius: "10px",
            padding: "8px",
            fontSize: "12px",
          }}
        >
          <div>💳 شبكة اليوم</div>
          <div style={{ fontWeight: 700 }}>
            {todayTotals.card.toFixed(2)} ريال
          </div>
        </div>
        <div
          style={{
            background: "#f3e8ff",
            borderRadius: "10px",
            padding: "8px",
            fontSize: "12px",
          }}
        >
          <div>🧾 عدد الفواتير</div>
          <div style={{ fontWeight: 700 }}>{todayTotals.count}</div>
        </div>
      </div>

      {/* بطاقة الفاتورة */}
      <div
        style={{
          borderRadius: "14px",
          border: "1px solid #e5e7eb",
          padding: "10px",
          backgroundColor: "#ffffff",
        }}
      >
        <h2
          style={{
            fontSize: "18px",
            marginTop: 0,
            marginBottom: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          واجهة المبيعات 🛒
        </h2>
        <p
          style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: 0,
            marginBottom: "10px",
          }}
        >
          شاشة مبسّطة لكتابة فاتورة المبيعات اليومية. لاحقًا نربطها بطباعة
          الفاتورة الحرارية والباركود.
        </p>

        {/* رأس الفاتورة */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "6px",
            marginBottom: "10px",
          }}
        >
          <div>
            <label style={{ fontSize: "12px" }}>رقم الفاتورة</label>
            <input
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(Number(e.target.value) || 1)}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px" }}>التاريخ</label>
            <input
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              value={formatDateTime(invoiceDate)}
              readOnly
            />
          </div>
          <div>
            <label style={{ fontSize: "12px" }}>الفرع</label>
            <input
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontSize: "12px" }}>العميل</label>
            <input
              style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
            />
          </div>
        </div>

        {/* طريقة الدفع */}
        <div
          style={{
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            padding: "8px",
            marginBottom: "10px",
          }}
        >
          <div style={{ fontSize: "13px", marginBottom: "6px" }}>طريقة الدفع 💰</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              fontSize: "13px",
              alignItems: "center",
            }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="radio"
                name="payType"
                checked={paymentType === PAYMENT_TYPES.CASH}
                onChange={() => setPaymentType(PAYMENT_TYPES.CASH)}
              />
              نقدي
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="radio"
                name="payType"
                checked={paymentType === PAYMENT_TYPES.CARD}
                onChange={() => setPaymentType(PAYMENT_TYPES.CARD)}
              />
              شبكة
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <input
                type="radio"
                name="payType"
                checked={paymentType === PAYMENT_TYPES.MIXED}
                onChange={() => setPaymentType(PAYMENT_TYPES.MIXED)}
              />
              نقدي + شبكة
            </label>
          </div>

          {(paymentType === PAYMENT_TYPES.CARD ||
            paymentType === PAYMENT_TYPES.MIXED) && (
            <div style={{ marginTop: "8px" }}>
              <label style={{ fontSize: "12px" }}>اختر الشبكة</label>
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  marginTop: "4px",
                }}
              >
                <select
                  style={{
                    flex: 1,
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                  value={selectedNetworkId}
                  onChange={(e) => setSelectedNetworkId(Number(e.target.value))}
                >
                  {networks.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddNetwork}
                  style={{
                    padding: "4px 8px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  ➕ شبكة
                </button>
              </div>
              {isAdmin && networks.length > 0 && (
                <div style={{ marginTop: "4px", fontSize: "11px" }}>
                  لحذف شبكة محددة اختاريها ثم اضغطي
                  <button
                    type="button"
                    onClick={() => handleDeleteNetwork(selectedNetworkId)}
                    style={{
                      marginRight: "6px",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      border: "1px solid #fecaca",
                      backgroundColor: "#fee2e2",
                      cursor: "pointer",
                      fontSize: "11px",
                    }}
                  >
                    حذف الشبكة الحالية
                  </button>
                </div>
              )}
            </div>
          )}

          {paymentType === PAYMENT_TYPES.MIXED && (
            <div
              style={{
                marginTop: "8px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "6px",
              }}
            >
              <div>
                <label style={{ fontSize: "12px" }}>مبلغ نقدي</label>
                <input
                  type="number"
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: "12px" }}>مبلغ شبكة</label>
                <input
                  type="number"
                  style={{
                    width: "100%",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                  value={cardAmount}
                  onChange={(e) => setCardAmount(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* أصناف الفاتورة */}
        <div
          style={{
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            padding: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "6px",
            }}
          >
            <div style={{ fontSize: "14px" }}>أصناف الفاتورة 🧾</div>
            <button
              type="button"
              onClick={handleAddEmptyRow}
              style={{
                padding: "4px 10px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              ➕ إضافة سطر
            </button>
          </div>

          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "12px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f9fafb" }}>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
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
                    سعر الوحدة (شامل)
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الإجمالي
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    حذف
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={row.id}>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {idx + 1}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <input
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          fontSize: "12px",
                        }}
                        value={row.name}
                        onChange={(e) =>
                          handleRowFieldChange(row.id, "name", e.target.value)
                        }
                        placeholder="اسم الصنف"
                      />
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <select
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          fontSize: "12px",
                        }}
                        value={row.unit}
                        onChange={(e) =>
                          handleRowFieldChange(row.id, "unit", e.target.value)
                        }
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
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          fontSize: "12px",
                        }}
                        value={row.qty}
                        onChange={(e) =>
                          handleRowFieldChange(row.id, "qty", e.target.value)
                        }
                      />
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      <input
                        type="number"
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          fontSize: "12px",
                        }}
                        value={row.unitPrice}
                        onChange={(e) =>
                          handleRowFieldChange(
                            row.id,
                            "unitPrice",
                            e.target.value
                          )
                        }
                      />
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {calcRowTotal(row).toFixed(2)}
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
                        onClick={() => handleDeleteRow(row.id)}
                        style={{
                          padding: "2px 6px",
                          borderRadius: "6px",
                          border: "1px solid #fecaca",
                          backgroundColor: "#fee2e2",
                          cursor: "pointer",
                          fontSize: "11px",
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}

                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "8px",
                        textAlign: "center",
                        fontSize: "12px",
                        color: "#6b7280",
                      }}
                    >
                      لم تتم إضافة أصناف بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* إجمالي الفاتورة + أزرار الحفظ */}
          <div
            style={{
              marginTop: "10px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
            }}
          >
            <div style={{ fontSize: "14px", textAlign: "left" }}>
              إجمالي الفاتورة:{" "}
              <span style={{ color: "#16a34a", fontWeight: 700 }}>
                {total.toFixed(2)} ريال
              </span>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                justifyContent: "flex-start",
              }}
            >
              <button
                type="button"
                onClick={() => handleSaveInvoice(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                💾 حفظ الفاتورة (بدون طباعة)
              </button>
              <button
                type="button"
                onClick={() => handleSaveInvoice(true)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#16a34a",
                  color: "#ffffff",
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                🖨 حفظ + طباعة
              </button>
            </div>

            {savedInvoices.length > 0 && (
              <div
                style={{
                  marginTop: "6px",
                  paddingTop: "6px",
                  borderTop: "1px dashed #e5e7eb",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span>التنقل بين الفواتير المحفوظة:</span>
                <button
                  type="button"
                  onClick={handlePrevInvoice}
                  style={{
                    padding: "2px 6px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  ◀ السابقة
                </button>
                <button
                  type="button"
                  onClick={handleNextInvoice}
                  style={{
                    padding: "2px 6px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#f9fafb",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  التالية ▶
                </button>
                {currentInvoiceIndex !== null &&
                  currentInvoiceIndex >= 0 &&
                  currentInvoiceIndex < savedInvoices.length && (
                    <span>
                      (حالياً تعرضين فاتورة رقم{" "}
                      {savedInvoices[currentInvoiceIndex].number})
                    </span>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesPage;