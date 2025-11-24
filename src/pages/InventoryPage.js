import React, { useState, useEffect } from "react";
import {
  getInventoryItems,
  setInventoryItems,
} from "../services/storage";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [preview, setPreview] = useState([]);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    const saved = getInventoryItems();
    setItems(saved);
  }, []);

  useEffect(() => {
    setInventoryItems(items);
  }, [items]);

  const handlePreview = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed = [];
    let lineNumber = 0;

    for (const line of lines) {
      lineNumber += 1;
      const parts = line.split(",").map((p) => p.trim());
      if (parts.length < 2) {
        alert(
          "السطر رقم " +
            lineNumber +
            " غير واضح. الصيغة: اسم الصنف , السعر شامل الضريبة , [الكمية]"
        );
        return;
      }
      const name = parts[0];
      const priceWithTax = parseFloat(parts[1]);
      if (Number.isNaN(priceWithTax)) {
        alert("سعر غير صحيح في السطر " + lineNumber);
        return;
      }
      let qty = 0;
      if (parts.length >= 3) {
        qty = parseFloat(parts[2]);
        if (Number.isNaN(qty)) {
          qty = 0;
        }
      }
      const priceWithoutTax = priceWithTax / 1.15;
      const vat = priceWithTax - priceWithoutTax;

      parsed.push({
        tempId: lineNumber,
        name,
        priceWithTax,
        priceWithoutTax,
        vat,
        qty,
        unit: "حبة",
        category: "",
        minPrice: priceWithTax * 0.7,
        profitPercent: 30,
      });
    }

    setPreview(parsed);
  };

  const handleSaveAll = () => {
    if (preview.length === 0) {
      alert("لا يوجد أصناف في المعاينة");
      return;
    }
    const existingCount = items.length;
    const now = Date.now();
    const newItems = preview.map((p, index) => {
      const codeNumber = existingCount + index + 1;
      const code = "I" + codeNumber.toString().padStart(4, "0");
      const barcode = "9" + (now + index).toString().slice(-11);

      return {
        id: now + index,
        code,
        barcode,
        name: p.name,
        priceWithTax: p.priceWithTax,
        priceWithoutTax: p.priceWithoutTax,
        vat: p.vat,
        qty: p.qty,
        unit: p.unit,
        category: p.category,
        minPrice: p.minPrice,
        profitPercent: p.profitPercent,
        createdAt: new Date().toISOString(),
      };
    });

    setItems((prev) => [...prev, ...newItems]);
    setPreview([]);
    setBulkText("");
  };

  const handleFieldChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              [field]:
                field === "priceWithTax" ||
                field === "minPrice" ||
                field === "profitPercent" ||
                field === "qty"
                  ? Number(value || 0)
                  : value,
            }
          : it
      )
    );
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h3>📦 المخزون / الجرد</h3>
      <p style={{ fontSize: "13px", color: "#6b7280" }}>
        من هنا تضيفين الرصيد الافتتاحي للمخزون دفعة واحدة، وبعدها تقدرين
        تعدلين كل صنف (الوحدة، الفهرس، الحد الأدنى، نسبة الربح).
      </p>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "10px",
          marginBottom: "16px",
          backgroundColor: "#f9fafb",
        }}
      >
        <h4>🧾 إضافة أصناف افتتاحية (دفعة واحدة)</h4>
        <p style={{ fontSize: "13px", color: "#6b7280" }}>
          اكتبي كل صنف في سطر بالشكل التالي:
          <br />
          <code>اسم الصنف , السعر شامل الضريبة , الكمية</code>
          <br />
          مثال:
          <br />
          <code>معسل تفاحتين 250جم , 25 , 120</code>
        </p>

        <textarea
          rows={6}
          value={bulkText}
          onChange={(e) => setBulkText(e.target.value)}
          style={{
            width: "100%",
            marginBottom: "8px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            padding: "8px",
            fontSize: "13px",
            boxSizing: "border-box",
          }}
          placeholder={
            "مثال:\nمعسل تفاحتين 250جم , 25 , 120\nفحم 3 كيلو , 18 , 40\n..."
          }
        />

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={handlePreview}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#4b7bec",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            👀 معاينة
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            💾 حفظ في المخزون
          </button>
        </div>

        {preview.length > 0 && (
          <div style={{ marginTop: "10px" }}>
            <h5>معاينة الأصناف قبل الحفظ</h5>
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
                    #
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الاسم
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    السعر شامل الضريبة
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الكمية
                  </th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p) => (
                  <tr key={p.tempId}>
                    <td
                      style={{
                        border: "1px solid #e5e7eb",
                        padding: "4px",
                        textAlign: "center",
                      }}
                    >
                      {p.tempId}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      {p.name}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      {p.priceWithTax.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      {p.qty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <h4>📋 قائمة الأصناف</h4>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#ffffff",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الكود
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الاسم
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الفهرس
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الوحدة
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الباركود
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                السعر (مع الضريبة)
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الحد الأدنى
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                نسبة الربح %
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                الكمية
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                تعديل
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => {
              const isEditing = editingId === it.id;
              return (
                <tr key={it.id}>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      fontSize: "12px",
                    }}
                  >
                    {it.code}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {it.name}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {isEditing ? (
                      <input
                        value={it.category || ""}
                        onChange={(e) =>
                          handleFieldChange(it.id, "category", e.target.value)
                        }
                        style={{ width: "90%", fontSize: "11px" }}
                      />
                    ) : (
                      it.category || "-"
                    )}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {isEditing ? (
                      <input
                        value={it.unit || ""}
                        onChange={(e) =>
                          handleFieldChange(it.id, "unit", e.target.value)
                        }
                        style={{ width: "80%", fontSize: "11px" }}
                        placeholder="حبة / كرتون / كيس / شدة"
                      />
                    ) : (
                      it.unit
                    )}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      fontSize: "10px",
                      direction: "ltr",
                    }}
                  >
                    {it.barcode}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={it.priceWithTax}
                        onChange={(e) =>
                          handleFieldChange(
                            it.id,
                            "priceWithTax",
                            e.target.value
                          )
                        }
                        style={{ width: "80%", fontSize: "11px" }}
                      />
                    ) : (
                      it.priceWithTax.toFixed(2)
                    )}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={it.minPrice || 0}
                        onChange={(e) =>
                          handleFieldChange(it.id, "minPrice", e.target.value)
                        }
                        style={{ width: "80%", fontSize: "11px" }}
                      />
                    ) : (
                      (it.minPrice || 0).toFixed(2)
                    )}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={it.profitPercent || 0}
                        onChange={(e) =>
                          handleFieldChange(
                            it.id,
                            "profitPercent",
                            e.target.value
                          )
                        }
                        style={{ width: "70%", fontSize: "11px" }}
                      />
                    ) : (
                      (it.profitPercent || 0).toFixed(0)
                    )}
                  </td>
                  <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={it.qty || 0}
                        onChange={(e) =>
                          handleFieldChange(it.id, "qty", e.target.value)
                        }
                        style={{ width: "60%", fontSize: "11px" }}
                      />
                    ) : (
                      it.qty
                    )}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "4px",
                      textAlign: "center",
                    }}
                  >
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        حفظ
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingId(it.id)}
                        style={{
                          padding: "4px 8px",
                          fontSize: "11px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#4b7bec",
                          color: "#ffffff",
                          cursor: "pointer",
                        }}
                      >
                        تعديل
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={10}
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "10px",
                    textAlign: "center",
                    fontSize: "13px",
                  }}
                >
                  لا توجد أصناف في المخزون حتى الآن.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryPage;