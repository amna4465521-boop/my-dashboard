// src/pages/SalesPage.js
import React, { useState, useEffect } from "react";

const PAYMENT_TYPES = {
  CASH: "cash",
  CARD: "card",
  MIXED: "mixed",
};

// تنسيق التاريخ والوقت بالإنجليزي مع الثواني
function formatDateTime(date) {
  return new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// نموذج صف فاضي (مربع صنف)
function makeEmptyRow(index) {
  return {
    id: index, // 1..5
    itemCode: "",
    name: "",
    unit: "حبة",
    qty: "",
    unitPrice: "",
  };
}

function SalesPage({ currentUser }) {
  const isAdmin = currentUser?.role === "admin";

  // معلومات الفاتورة
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [branch, setBranch] = useState("فرع الرياض");
  const [customer, setCustomer] = useState("عميل المحل تجزئة");

  // طريقة الدفع
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.CASH);
  const [cashAmount, setCashAmount] = useState("");
  const [cardAmount, setCardAmount] = useState("");

  // الشبكات
  const [networks, setNetworks] = useState([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState("");

  // المخزون (للربط مع الباركود/الكود)
  const [inventoryItems, setInventoryItems] = useState([]);

  // الفواتير المحفوظة (للحسابات وملخص اليوم)
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(null);

  // ٥ مربعات أصناف جاهزة
  const [rows, setRows] = useState(() =>
    Array.from({ length: 5 }).map((_, idx) => makeEmptyRow(idx + 1))
  );

  // تحميل المخزون من localStorage
  useEffect(() => {
    const savedInv = localStorage.getItem("inventory_items");
    if (savedInv) {
      try {
        setInventoryItems(JSON.parse(savedInv));
      } catch (e) {
        console.error("خطأ في قراءة المخزون", e);
      }
    }
  }, []);

  // تحميل الشبكات + الفواتير + رقم الفاتورة
  useEffect(() => {
    const storedNetworks = localStorage.getItem("pos_networks");
    if (storedNetworks) {
      try {
        const parsed = JSON.parse(storedNetworks);
        setNetworks(parsed);
        if (parsed.length > 0) {
          setSelectedNetworkId(parsed[0].id);
        }
      } catch (e) {
        console.error("خطأ في قراءة الشبكات", e);
      }
    } else {
      // شبكة افتراضية واحدة
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

  // كل ما تغير رقم الفاتورة نحدّث الوقت
  useEffect(() => {
    setInvoiceDate(new Date());
  }, [invoiceNumber]);

  // حفظ الفواتير في التخزين
  const saveInvoicesToStorage = (list) => {
    localStorage.setItem("sales_invoices_v1", JSON.stringify(list));
  };

  // حساب إجمالي سطر
  const calcRowTotal = (row) => {
    const qty = Number(row.qty) || 0;
    const price = Number(row.unitPrice) || 0;
    return qty * price;
  };

  // إجمالي الفاتورة
  const calcInvoiceTotal = () => {
    return rows.reduce((sum, row) => sum + calcRowTotal(row), 0);
  };

  const total = calcInvoiceTotal();

  // ملخص اليوم (مبيعات اليوم/كاش/شبكة/عدد فواتير)
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayInvoices = savedInvoices.filter((inv) => {
    if (!inv.date) return false;
    const d = inv.date.slice(0, 10);
    return d === todayKey;
  });

  const todayTotals = todayInvoices.reduce(
    (acc, inv) => {
      acc.count += 1;
      acc.total += inv.total || 0;
      acc.cash += inv.cashAmount || 0;
      acc.card += inv.cardAmount || 0;
      return acc;
    },
    { count: 0, total: 0, cash: 0, card: 0 }
  );

  // تغيير قيمة حقل في صف
  const updateRowField = (rowId, field, value) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };

        // لو غيّرنا الكود/الباركود → نحاول نجيب الصنف تلقائي
        if (field === "itemCode") {
          const codeVal = value.trim();
          if (codeVal && inventoryItems.length > 0) {
            const found =
              inventoryItems.find((it) => String(it.barcode) === codeVal) ||
              inventoryItems.find((it) => String(it.code) === codeVal);
            if (found) {
              updated.name = found.name || updated.name;
              if (found.priceWithTax) {
                updated.unitPrice = found.priceWithTax.toString();
              }
            }
          }
        }

        return updated;
      })
    );
  };

  // إعادة صف إلى حالة فاضية (بدل حذفه فعليًا)
  const clearRow = (rowId) => {
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? makeEmptyRow(rowId) : row))
    );
  };

  // إدارة الشبكات (إضافة/حذف → أدمن فقط)
  const handleAddNetwork = () => {
    if (!isAdmin) {
      window.alert("فقط المدير يمكنه إضافة شبكة جديدة.");
      return;
    }
    const name = window.prompt("أدخل اسم الشبكة (مثال: مدى 2):");
    if (!name) return;
    const id = Date.now();
    const newList = [...networks, { id, name }];
    setNetworks(newList);
    localStorage.setItem("pos_networks", JSON.stringify(newList));
    setSelectedNetworkId(id);
  };

  const handleDeleteNetwork = () => {
    if (!isAdmin) {
      window.alert("فقط المدير يمكنه حذف الشبكة.");
      return;
    }
    if (!selectedNetworkId) return;
    if (!window.confirm("هل أنت متأكد من حذف هذه الشبكة؟")) return;

    const newList = networks.filter((n) => n.id !== selectedNetworkId);
    setNetworks(newList);
    localStorage.setItem("pos_networks", JSON.stringify(newList));
    if (newList.length > 0) {
      setSelectedNetworkId(newList[0].id);
    } else {
      setSelectedNetworkId("");
    }
  };

  // حفظ الفاتورة
  const handleSaveInvoice = (printAfter = false) => {
    // نفلتر الصفوف اللي فيها بيانات فعلًا
    const usedRows = rows.filter(
      (r) =>
        r.name.trim() ||
        r.itemCode.trim() ||
        (r.qty && Number(r.qty) > 0) ||
        (r.unitPrice && Number(r.unitPrice) > 0)
    );

    if (usedRows.length === 0) {
      window.alert("لم يتم إدخال أي صنف في الفاتورة.");
      return;
    }

    const totalAmount = calcInvoiceTotal();
    if (totalAmount <= 0) {
      window.alert("إجمالي الفاتورة يجب أن يكون أكبر من صفر.");
      return;
    }

    let finalCash = 0;
    let finalCard = 0;

    if (paymentType === PAYMENT_TYPES.CASH) {
      finalCash = totalAmount;
    } else if (paymentType === PAYMENT_TYPES.CARD) {
      finalCard = totalAmount;
    } else if (paymentType === PAYMENT_TYPES.MIXED) {
      const c = Number(cashAmount) || 0;
      const k = Number(cardAmount) || 0;
      if (Math.abs(c + k - totalAmount) > 0.01) {
        window.alert("مجموع النقدي + الشبكة يجب أن يساوي إجمالي الفاتورة.");
        return;
      }
      finalCash = c;
      finalCard = k;
    }

    const invoiceObj = {
      id: Date.now(),
      number: invoiceNumber,
      date: new Date(invoiceDate).toISOString(),
      branch,
      customer,
      total: totalAmount,
      paymentType,
      cashAmount: finalCash,
      cardAmount: finalCard,
      networkId:
        paymentType === PAYMENT_TYPES.CARD ||
        paymentType === PAYMENT_TYPES.MIXED
          ? selectedNetworkId
          : null,
      createdBy: currentUser?.username || null,
      items: usedRows.map((r) => ({
        itemCode: r.itemCode,
        name: r.name,
        unit: r.unit,
        qty: Number(r.qty) || 0,
        unitPrice: Number(r.unitPrice) || 0,
        total: calcRowTotal(r),
      })),
    };

    const newList = [...savedInvoices, invoiceObj];
    setSavedInvoices(newList);
    saveInvoicesToStorage(newList);
    setCurrentInvoiceIndex(newList.length - 1);

    // تجهيز فاتورة جديدة
    setInvoiceNumber((prev) => prev + 1);
    setInvoiceDate(new Date());
    setRows(Array.from({ length: 5 }).map((_, idx) => makeEmptyRow(idx + 1)));
    setPaymentType(PAYMENT_TYPES.CASH);
    setCashAmount("");
    setCardAmount("");

    if (printAfter) {
      // لاحقًا نخليها تطبع نموذج ضريبي مبسط
      setTimeout(() => {
        window.print();
      }, 100);
    } else {
      window.alert("تم حفظ الفاتورة بنجاح.");
    }
  };

  // التنقل بين الفواتير المحفوظة (بسيط)
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
    setRows(
      inv.items.map((it, idx) => ({
        id: idx + 1,
        itemCode: it.itemCode || "",
        name: it.name || "",
        unit: it.unit || "حبة",
        qty: it.qty?.toString() || "",
        unitPrice: it.unitPrice?.toString() || "",
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

  // ========== واجهة المستخدم ==========
  return (
    <div style={{ padding: "8px" }}>
      {/* مربعات ملخص اليوم (زي الميزان) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
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

      {/* بطاقة الفاتورة الرئيسية */}
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
            marginBottom: "6px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
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
          شاشة مبسّطة لكتابة فاتورة المبيعات اليومية. لاحقًا نربطها بالطابعة
          الحرارية والباركود من الجوال.
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
              onChange={(e) =>
                setInvoiceNumber(Number(e.target.value) || invoiceNumber)
              }
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
          <div style={{ fontSize: "13px", marginBottom: "6px" }}>
            طريقة الدفع 💰
          </div>
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
              {isAdmin && (
                <div style={{ marginTop: "4px", fontSize: "11px" }}>
                  <button
                    type="button"
                    onClick={handleDeleteNetwork}
                    style={{
                      padding: "2px 6px",
                      borderRadius: "6px",
                      border: "1px solid #fecaca",
                      backgroundColor: "#fee2e2",
                      cursor: "pointer",
                      fontSize: "11px",
                      marginTop: "4px",
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

        {/* مربعات أصناف الفاتورة */}
        <div
          style={{
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            padding: "8px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              marginBottom: "8px",
            }}
          >
            أصناف الفاتورة 🧾 (٥ مربعات)
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "6px",
            }}
          >
            {rows.map((row) => {
              const rowTotal = calcRowTotal(row);
              return (
                <div
                  key={row.id}
                  style={{
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    padding: "8px",
                    backgroundColor: "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "6px",
                      fontSize: "13px",
                    }}
                  >
                    <span>سطر رقم {row.id}</span>
                    <button
                      type="button"
                      onClick={() => clearRow(row.id)}
                      style={{
                        padding: "2px 8px",
                        borderRadius: "6px",
                        border: "1px solid #fecaca",
                        backgroundColor: "#fee2e2",
                        cursor: "pointer",
                        fontSize: "11px",
                      }}
                    >
                      حذف / تفريغ
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "6px",
                      fontSize: "12px",
                    }}
                  >
                    <div>
                      <label>رقم الصنف (كود/باركود)</label>
                      <input
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                        value={row.itemCode}
                        onChange={(e) =>
                          updateRowField(row.id, "itemCode", e.target.value)
                        }
                        placeholder="اكتبيه أو امسحيه باركود مستقبلاً"
                      />
                    </div>
                    <div>
                      <label>اسم الصنف</label>
                      <input
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                        value={row.name}
                        onChange={(e) =>
                          updateRowField(row.id, "name", e.target.value)
                        }
                        placeholder="مثال: معسل تفاحتين"
                      />
                    </div>
                    <div>
                      <label>الوحدة</label>
                      <select
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                        value={row.unit}
                        onChange={(e) =>
                          updateRowField(row.id, "unit", e.target.value)
                        }
                      >
                        <option value="حبة">حبة</option>
                        <option value="كرتون">كرتون</option>
                        <option value="كيس">كيس</option>
                        <option value="شدة">شدة</option>
                      </select>
                    </div>
                    <div>
                      <label>الكمية</label>
                      <input
                        type="number"
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                        value={row.qty}
                        onChange={(e) =>
                          updateRowField(row.id, "qty", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label>سعر الوحدة (شامل ضريبة)</label>
                      <input
                        type="number"
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                        }}
                        value={row.unitPrice}
                        onChange={(e) =>
                          updateRowField(row.id, "unitPrice", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label>الإجمالي</label>
                      <div
                        style={{
                          width: "100%",
                          padding: "4px",
                          borderRadius: "6px",
                          border: "1px solid #e5e7eb",
                          fontSize: "12px",
                          backgroundColor: "#e5f9e7",
                          textAlign: "center",
                        }}
                      >
                        {rowTotal.toFixed(2)} ريال
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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