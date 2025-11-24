import React, { useEffect, useState } from "react";
import { getInvoices } from "../services/storage";

function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const data = getInvoices();
    setInvoices(data);
  }, []);

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>🧾 الفواتير</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        هنا تظهر الفواتير التي تم حفظها من شاشة المبيعات. لاحقاً نضيف فلترة،
        بحث، وطباعة.
      </p>
      <div style={{ maxHeight: "420px", overflowY: "auto" }}>
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
                رقم الفاتورة
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                العميل
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الإجمالي
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                المستخدم
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                التاريخ
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices
              .slice()
              .reverse()
              .map((inv) => (
                <tr key={inv.id}>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {inv.invoiceNumber}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {inv.customerName}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {inv.total.toFixed(2)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {inv.createdBy}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                    }}
                  >
                    {new Date(inv.createdAt).toLocaleString("ar-SA")}
                  </td>
                </tr>
              ))}
            {invoices.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "6px",
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
    </div>
  );
}

export default InvoicesPage;