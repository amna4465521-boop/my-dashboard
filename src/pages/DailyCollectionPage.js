import React, { useEffect, useState } from "react";
import {
  getDailyCollections,
  setDailyCollections,
  addLedgerEntry,
} from "../services/storage";

function DailyCollectionPage({ currentUser }) {
  const [items, setItems] = useState([]);
  const [type, setType] = useState("mowazana");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    const saved = getDailyCollections();
    setItems(saved);
  }, []);

  useEffect(() => {
    setDailyCollections(items);
  }, [items]);

  const handleAdd = () => {
    const value = Number(amount || 0);
    if (value <= 0) {
      alert("أدخلي مبلغاً أكبر من صفر");
      return;
    }
    const obj = {
      id: Date.now(),
      type,
      amount: value,
      note,
      user: currentUser ? currentUser.displayName : "",
      createdAt: new Date().toISOString(),
    };
    const updated = [...items, obj];
    setItems(updated);

    // دفتر أستاذ حسب النوع
    if (type === "mowazana") {
      addLedgerEntry({
        accountName: "سند الموازنة",
        accountType: "تحصيل",
        debit: value,
        credit: 0,
        description: "تحصيل موازنة " + (note || ""),
        refType: "daily_collection",
        refId: String(obj.id),
      });
    } else if (type === "cash") {
      addLedgerEntry({
        accountName: "صندوق المحل",
        accountType: "صندوق",
        debit: value,
        credit: 0,
        description: "تحصيل كاش " + (note || ""),
        refType: "daily_collection",
        refId: String(obj.id),
      });
    } else if (type === "transfer") {
      addLedgerEntry({
        accountName: "صندوق الحوالات",
        accountType: "تحصيل",
        debit: value,
        credit: 0,
        description: "تحصيل حوالة " + (note || ""),
        refType: "daily_collection",
        refId: String(obj.id),
      });
    }

    setAmount("");
    setNote("");
  };

  const sumByType = (t) =>
    items
      .filter((it) => it.type === t)
      .reduce((sum, it) => sum + it.amount, 0);

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>💳 التحصيل اليومي</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        هنا يسجل الموظف تحصيل الموازنة، الكاش، والحوالات. كل حركة تذهب أيضاً
        إلى دفتر الأستاذ.
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "10px",
          backgroundColor: "#f9fafb",
          marginBottom: "12px",
        }}
      >
        <h4 style={{ marginTop: 0 }}>إضافة تحصيل جديد</h4>
        <div style={{ marginBottom: "6px" }}>
          <label style={{ fontSize: "13px" }}>النوع</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{
              width: "100%",
              padding: "6px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              marginTop: "2px",
              fontSize: "13px",
            }}
          >
            <option value="mowazana">موازنة</option>
            <option value="cash">تحصيل كاش</option>
            <option value="transfer">تحصيل حوالة</option>
          </select>
        </div>

        <div style={{ marginBottom: "6px" }}>
          <label style={{ fontSize: "13px" }}>المبلغ</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
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

        <div style={{ marginBottom: "6px" }}>
          <label style={{ fontSize: "13px" }}>ملاحظة (اختياري)</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
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
          onClick={handleAdd}
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
          💾 حفظ التحصيل
        </button>
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          padding: "10px",
          backgroundColor: "#ffffff",
        }}
      >
        <h4 style={{ marginTop: 0 }}>ملخص اليوم (من البيانات المحفوظة)</h4>
        <p style={{ fontSize: "13px" }}>
          مجموع الموازنة: {sumByType("mowazana").toFixed(2)} ريال
        </p>
        <p style={{ fontSize: "13px" }}>
          مجموع الكاش: {sumByType("cash").toFixed(2)} ريال
        </p>
        <p style={{ fontSize: "13px" }}>
          مجموع الحوالات: {sumByType("transfer").toFixed(2)} ريال
        </p>

        <h5>قائمة الحركات</h5>
        <div style={{ maxHeight: "260px", overflowY: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f3f4f6" }}>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  التاريخ
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  النوع
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  المبلغ
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  المستخدم
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  ملاحظة
                </th>
              </tr>
            </thead>
            <tbody>
              {items
                .slice()
                .reverse()
                .map((it) => (
                  <tr key={it.id}>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {new Date(it.createdAt).toLocaleString("ar-SA")}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {it.type === "mowazana"
                        ? "موازنة"
                        : it.type === "cash"
                        ? "كاش"
                        : "حوالة"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {it.amount.toFixed(2)}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {it.user}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {it.note}
                    </td>
                  </tr>
                ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    لا توجد تحصيلات مسجلة حتى الآن.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DailyCollectionPage;