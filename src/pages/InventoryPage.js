// src/pages/InventoryPage.js
import React, { useState, useEffect } from "react";

function InventoryPage() {
  const [items, setItems] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [preview, setPreview] = useState([]);

  // تحميل الأصناف من التخزين المحلي عند فتح الصفحة
  useEffect(() => {
    const saved = localStorage.getItem("inventory_items");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error("خطأ في قراءة المخزون من التخزين", e);
      }
    }
  }, []);

  // حفظ أي تغيير في الأصناف في التخزين المحلي
  useEffect(() => {
    localStorage.setItem("inventory_items", JSON.stringify(items));
  }, [items]);

  // معاينة الإدخال الجماعي
  const handlePreview = () => {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const parsed = [];
    let lineNumber = 0;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      lineNumber += 1;

      const parts = line.split(",").map((p) => p.trim());

      // لازم يكون على الأقل "اسم , سعر"
      if (parts.length < 2) {
        window.alert(
          "السطر رقم " +
            lineNumber +
            " غير واضح. الصيغة المتوقعة: اسم الصنف , السعر شامل الضريبة , [الكمية اختياري]"
        );
        return;
      }

      const name = parts[0];

      // السعر مع الضريبة (نحذف كلمة ريال أو SAR لو موجودة)
      const cleanedPrice = parts[1]
        .replace("ريال", "")
        .replace("SAR", "")
        .trim();
      const priceWithTax = parseFloat(cleanedPrice);

      if (Number.isNaN(priceWithTax)) {
        window.alert("السعر في السطر رقم " + lineNumber + " غير صحيح.");
        return;
      }

      // الكمية (اختيارية)
      let qty = 0;
      if (parts.length >= 3 && parts[2] !== "") {
        const parsedQty = parseFloat(parts[2]);
        if (Number.isNaN(parsedQty)) {
          window.alert("الكمية في السطر رقم " + lineNumber + " غير صحيحة.");
          return;
        }
        qty = parsedQty;
      }

      // حساب السعر بدون ضريبة والضريبة (15%)
      const priceWithoutTaxRaw = priceWithTax / 1.15;
      const priceWithoutTax = parseFloat(priceWithoutTaxRaw.toFixed(2));
      const vatRaw = priceWithTax - priceWithoutTax;
      const vat = parseFloat(vatRaw.toFixed(2));

      parsed.push({
        tempId: lineNumber,
        name: name,
        priceWithTax: priceWithTax,
        priceWithoutTax: priceWithoutTax,
        vat: vat,
        qty: qty,
      });
    }

    setPreview(parsed);
  };

  // حفظ الأصناف من المعاينة إلى المخزون
  const handleSaveAll = () => {
    if (preview.length === 0) {
      window.alert("لا يوجد أصناف في المعاينة.");
      return;
    }

    const existingCount = items.length;
    const now = Date.now();

    const newItems = preview.map((p, index) => {
      const codeNumber = existingCount + index + 1;

      // كود الصنف: I0001, I0002, ...
      const code =
        "I" + codeNumber.toString().padStart(4, "0");

      // باركود رقمي بسيط من 12 رقم
      const fullNumber = (now + index).toString();
      const last11 = fullNumber.slice(-11);
      const barcode = "9" + last11;

      return {
        id: now + index,
        code: code,
        barcode: barcode,
        name: p.name,
        priceWithTax: p.priceWithTax,
        priceWithoutTax: p.priceWithoutTax,
        vat: p.vat,
        qty: p.qty,
        createdAt: new Date().toISOString(),
      };
    });

    setItems(function (prev) {
      return prev.concat(newItems);
    });
    setPreview([]);
    setBulkText("");
    window.alert("تم حفظ الأصناف في المخزون");
  };

  return (
    <div style={{ direction: "rtl", textAlign: "right", padding: "16px" }}>
      <h2>📦 المخزون / الجرد</h2>
      <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "12px" }}>
        من هنا تضيفين الرصيد الافتتاحي للمخزون دفعة واحدة. لاحقًا نربطه
        بالموردين والمشتريات.
      </p>

      {/* إضافة افتتاحية جماعية */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "18px",
          background: "#ffffff",
        }}
      >
        <h3>🧾 إضافة أصناف افتتاحية (دفعة واحدة)</h3>
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
            marginTop: "8px",
            marginBottom: "8px",
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            fontFamily: "inherit",
          }}
          placeholder={
            "مثال:\nمعسل تفاحتين 250جم , 25 , 120\nفحم 3 كيلو , 18 , 40\n..."
          }
        />

        <button
          type="button"
          onClick={handlePreview}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#4b7bec",
            color: "#ffffff",
            cursor: "pointer",
            marginRight: "8px",
          }}
        >
          👀 معاينة
        </button>
        <button
          type="button"
          onClick={handleSaveAll}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#16a34a",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          💾 حفظ في المخزون
        </button>

        {preview.length > 0 && (
          <div style={{ marginTop: "12px" }}>
            <h4>معاينة الأصناف قبل الحفظ</h4>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "#fff",
                marginTop: "6px",
              }}
            >
              <thead>
                <tr style={{ background: "#f3f4f6" }}>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    #
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الاسم
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    السعر مع الضريبة
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    السعر بدون الضريبة
                  </th>
                  <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                    الضريبة
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
                      {p.priceWithoutTax.toFixed(2)}
                    </td>
                    <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                      {p.vat.toFixed(2)}
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

      {/* جدول الأصناف المحفوظة */}
      <h3>📋 قائمة الأصناف في المخزون</h3>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          marginTop: "6px",
        }}
      >
        <thead>
          <tr style={{ background: "#f3f4f6" }}>
            <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
              الكود
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
              الاسم
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
              الباركود
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
              السعر (مع الضريبة)
            </th>
            <th style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
              الكمية
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {it.code}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {it.name}
              </td>
              <td
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "4px",
                  fontSize: "11px",
                  direction: "ltr",
                }}
              >
                {it.barcode}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {it.priceWithTax.toFixed(2)}
              </td>
              <td style={{ border: "1px solid #e5e7eb", padding: "4px" }}>
                {it.qty}
              </td>
            </tr>
          ))}

          {items.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #e5e7eb",
                  padding: "10px",
                  textAlign: "center",
                }}
              >
                لا توجد أصناف في المخزون حتى الآن.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default InventoryPage;