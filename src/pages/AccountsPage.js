import React, { useEffect, useState } from "react";
import { getLedgerEntries } from "../services/storage";

function AccountsPage() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const data = getLedgerEntries();
    setEntries(data);
  }, []);

  const sumAccount = (name) =>
    entries
      .filter((e) => e.accountName === name)
      .reduce((sum, e) => sum + (e.debit || 0) - (e.credit || 0), 0);

  const accounts = [
    { key: "صندوق المحل", label: "صندوق المحل (كاش)" },
    { key: "صندوق الحوالات", label: "صندوق الحوالات" },
    { key: "سند الموازنة", label: "حساب سند الموازنة" },
    { key: "حساب الشبكات", label: "حساب الشبكات" },
    { key: "مبيعات المحل", label: "مبيعات المحل (إيراد)" },
  ];

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>💰 الحسابات (عرض مبسط)</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        هذه صورة مبسطة لأرصدة بعض الحسابات الأساسية من دفتر الأستاذ. لاحقاً
        نضيف الضمار المتحرك، سلف الموظفين، الشركاء، وتحليل صافي الربح.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
        }}
      >
        {accounts.map((acc) => (
          <div
            key={acc.key}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              padding: "10px",
              backgroundColor: "#ffffff",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                marginBottom: "6px",
              }}
            >
              {acc.label}
            </div>
            <div style={{ fontSize: "13px" }}>
              الرصيد التقريبي: {sumAccount(acc.key).toFixed(2)} ريال
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AccountsPage;