import React, { useEffect, useState } from "react";
import { getLedgerEntries } from "../services/storage";

function LedgerPage() {
  const [entries, setEntries] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const data = getLedgerEntries();
    setEntries(data);
  }, []);

  const filtered = entries.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      (e.accountName || "").toLowerCase().includes(q) ||
      (e.description || "").toLowerCase().includes(q) ||
      (e.refType || "").toLowerCase().includes(q) ||
      String(e.refId || "").toLowerCase().includes(q)
    );
  });

  const totalDebit = filtered.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = filtered.reduce((sum, e) => sum + (e.credit || 0), 0);

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>📚 دفتر أستاذ عام</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        هنا يظهر كل القيود المحاسبية من المبيعات والتحصيل وغيرها. لاحقاً
        نوسعها لتشمل كل الحسابات بالتفصيل (الموردين، الموظفين، الضمار، إلخ).
      </p>

      <div
        style={{
          marginBottom: "8px",
          display: "flex",
          gap: "8px",
          alignItems: "center",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث باسم الحساب، الوصف، رقم المرجع..."
          style={{
            flex: 1,
            padding: "6px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            fontSize: "13px",
          }}
        />
      </div>

      <div
        style={{
          marginBottom: "8px",
          fontSize: "13px",
          backgroundColor: "#f9fafb",
          padding: "6px",
          borderRadius: "8px",
        }}
      >
        <span style={{ marginLeft: "12px" }}>
          إجمالي المدين: {totalDebit.toFixed(2)} ريال
        </span>
        <span>إجمالي الدائن: {totalCredit.toFixed(2)} ريال</span>
      </div>

      <div style={{ maxHeight: "380px", overflowY: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            backgroundColor: "#ffffff",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                التاريخ
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الحساب
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                النوع
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                مدين
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                دائن
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الوصف
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered
              .slice()
              .reverse()
              .map((e) => (
                <tr key={e.id}>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {new Date(e.date).toLocaleString("ar-SA")}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {e.accountName}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {e.accountType}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {e.debit.toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {e.credit.toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {e.description}
                  </td>
                </tr>
              ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "6px",
                    textAlign: "center",
                  }}
                >
                  لا توجد قيود مطابقة للبحث.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LedgerPage;