import React, { useEffect, useState } from "react";
import { getSuppliers, setSuppliers } from "../services/storage";

function SuppliersPage() {
  const [suppliers, setSuppliersState] = useState([]);
  const [type, setType] = useState("company");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [iban, setIban] = useState("");

  useEffect(() => {
    const data = getSuppliers();
    setSuppliersState(data);
  }, []);

  useEffect(() => {
    setSuppliers(suppliers);
  }, [suppliers]);

  const handleAdd = () => {
    if (!name.trim()) {
      alert("اسم المورد / المندوب مطلوب");
      return;
    }
    const obj = {
      id: Date.now(),
      type,
      name,
      phone,
      taxNumber,
      iban,
      createdAt: new Date().toISOString(),
    };
    setSuppliersState((prev) => [...prev, obj]);
    setName("");
    setPhone("");
    setTaxNumber("");
    setIban("");
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>🚚 الموردين والمندوبين</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        تعريف الموردين (شركات) والمندوبين (أفراد). لاحقاً نربطهم بسندات
        المشتريات وكشف الحساب.
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
        <h4 style={{ marginTop: 0 }}>إضافة جديد</h4>
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
            <option value="company">شركة</option>
            <option value="agent">مندوب</option>
          </select>
        </div>

        <div style={{ marginBottom: "6px" }}>
          <label style={{ fontSize: "13px" }}>الاسم</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <label style={{ fontSize: "13px" }}>رقم الجوال (للمندوب)</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
          <label style={{ fontSize: "13px" }}>الرقم الضريبي (للشركة)</label>
          <input
            value={taxNumber}
            onChange={(e) => setTaxNumber(e.target.value)}
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
          <label style={{ fontSize: "13px" }}>رقم الآيبان</label>
          <input
            value={iban}
            onChange={(e) => setIban(e.target.value)}
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
          💾 حفظ
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
        <h4 style={{ marginTop: 0 }}>قائمة الموردين / المندوبين</h4>
        <div style={{ maxHeight: "320px", overflowY: "auto" }}>
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
                  النوع
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  الاسم
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  الجوال
                </th>
                <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                  الرقم الضريبي
                </th>
              </tr>
            </thead>
            <tbody>
              {suppliers
                .slice()
                .reverse()
                .map((s) => (
                  <tr key={s.id}>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {s.type === "company" ? "شركة" : "مندوب"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {s.name}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {s.phone}
                    </td>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                      }}
                    >
                      {s.taxNumber}
                    </td>
                  </tr>
                ))}
              {suppliers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "6px",
                      textAlign: "center",
                    }}
                  >
                    لا يوجد موردين / مناديب حتى الآن.
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

export default SuppliersPage;