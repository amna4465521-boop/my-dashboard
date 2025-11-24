// src/pages/DailyCollectionPage.js
import React, { useState, useEffect } from "react";

function DailyCollectionPage() {
  // موازنة الشبكة (يدوي)
  const [recs, setRecs] = useState([]);
  const [recDateTime, setRecDateTime] = useState("");
  const [recNetworkName, setRecNetworkName] = useState("");
  const [recVisa, setRecVisa] = useState("");
  const [recMaster, setRecMaster] = useState("");
  const [recMada, setRecMada] = useState("");
  const [recOther, setRecOther] = useState("");
  const [recStatus, setRecStatus] = useState("في الطريق");
  const [recNote, setRecNote] = useState("");

  // تحصيل كاش
  const [cashList, setCashList] = useState([]);
  const [cashDate, setCashDate] = useState("");
  const [cashAmount, setCashAmount] = useState("");
  const [cashNote, setCashNote] = useState("");

  // تحصيل حوالات
  const [trList, setTrList] = useState([]);
  const [trDate, setTrDate] = useState("");
  const [trAmount, setTrAmount] = useState("");
  const [trBank, setTrBank] = useState("");
  const [trFees, setTrFees] = useState("");
  const [trNote, setTrNote] = useState("");

  useEffect(() => {
    const savedRecs = localStorage.getItem("daily_reconciliations");
    const savedCash = localStorage.getItem("daily_cash");
    const savedTr = localStorage.getItem("daily_transfers");

    if (savedRecs) setRecs(JSON.parse(savedRecs));
    if (savedCash) setCashList(JSON.parse(savedCash));
    if (savedTr) setTrList(JSON.parse(savedTr));

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date().toISOString().slice(0, 16);

    setRecDateTime(now);
    setCashDate(today);
    setTrDate(today);
  }, []);

  useEffect(() => {
    localStorage.setItem("daily_reconciliations", JSON.stringify(recs));
  }, [recs]);

  useEffect(() => {
    localStorage.setItem("daily_cash", JSON.stringify(cashList));
  }, [cashList]);

  useEffect(() => {
    localStorage.setItem("daily_transfers", JSON.stringify(trList));
  }, [trList]);

  const recTotal =
    (Number(recVisa) || 0) +
    (Number(recMaster) || 0) +
    (Number(recMada) || 0) +
    (Number(recOther) || 0);

  const handleAddRec = () => {
    if (!recDateTime || !recTotal) {
      alert("رجاءً أدخلي التاريخ ومبالغ الموازنة (حتى لو نوع واحد فقط).");
      return;
    }

    const item = {
      id: Date.now(),
      dateTime: recDateTime,
      networkName: recNetworkName || "شبكة بدون اسم",
      visa: Number(recVisa) || 0,
      master: Number(recMaster) || 0,
      mada: Number(recMada) || 0,
      other: Number(recOther) || 0,
      total: recTotal,
      status: recStatus,
      note: recNote,
    };

    setRecs((prev) => [item, ...prev]);
    const now = new Date().toISOString().slice(0, 16);
    setRecDateTime(now);
    setRecNetworkName("");
    setRecVisa("");
    setRecMaster("");
    setRecMada("");
    setRecOther("");
    setRecStatus("في الطريق");
    setRecNote("");
  };

  const handleAddCash = () => {
    if (!cashDate || !cashAmount) {
      alert("رجاءً أدخلي تاريخ ومبلغ الكاش.");
      return;
    }
    const item = {
      id: Date.now(),
      date: cashDate,
      amount: Number(cashAmount) || 0,
      note: cashNote,
    };
    setCashList((prev) => [item, ...prev]);
    setCashAmount("");
    setCashNote("");
  };

  const handleAddTransfer = () => {
    if (!trDate || !trAmount) {
      alert("رجاءً أدخلي تاريخ ومبلغ الحوالة.");
      return;
    }
    const item = {
      id: Date.now(),
      date: trDate,
      amount: Number(trAmount) || 0,
      bank: trBank,
      fees: Number(trFees) || 0,
      note: trNote,
    };
    setTrList((prev) => [item, ...prev]);
    setTrAmount("");
    setTrBank("");
    setTrFees("");
    setTrNote("");
  };

  // ملخص اليوم
  const today = new Date().toISOString().slice(0, 10);
  const todayRecs = recs.filter((r) => r.dateTime.slice(0, 10) === today);
  const todayCash = cashList.filter((c) => c.date === today);
  const todayTr = trList.filter((t) => t.date === today);

  const sum = (arr, field) => arr.reduce((acc, cur) => acc + (cur[field] || 0), 0);

  const totalRecToday = sum(todayRecs, "total");
  const totalCashToday = sum(todayCash, "amount");
  const totalTrToday = sum(todayTr, "amount");
  const totalAllToday = totalRecToday + totalCashToday + totalTrToday;

  return (
    <div style={{ direction: "rtl", textAlign: "right" }}>
      <h2>💳 التحصيل اليومي</h2>
      <p style={{ fontSize: "14px", color: "#4b5563", marginBottom: "10px" }}>
        شاشة بسيطة للموظفين: موازنة شبكة + تحصيل كاش + تحصيل حوالات. 
        التفاصيل المحاسبية العميقة تكون عندك في الحسابات.
      </p>

      {/* ملخص اليوم */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: "8px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            padding: "10px",
            background: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>مجموع التحصيل اليوم</strong>
          <div style={{ fontSize: "18px", marginTop: "4px" }}>
            {totalAllToday.toFixed(2)} ريال
          </div>
        </div>
        <div
          style={{
            padding: "10px",
            background: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>موازنة الشبكات</strong>
          <div style={{ marginTop: "4px" }}>
            {totalRecToday.toFixed(2)} ريال
          </div>
        </div>
        <div
          style={{
            padding: "10px",
            background: "#ffffff",
            borderRadius: "10px",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>تحصيل كاش</strong>
          <div style={{ marginTop: "4px" }}>
            {totalCashToday.toFixed(2)} ريال
          </div>
        </div>
        <div
          style={{
            padding: "10px",
            background: "#ffffff",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
          }}
        >
          <strong>تحصيل حوالات</strong>
          <div style={{ marginTop: "4px" }}>
            {totalTrToday.toFixed(2)} ريال
          </div>
        </div>
      </div>

      {/* قسم موازنة الشبكة */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          background: "#ffffff",
        }}
      >
        <h3>📡 موازنة الشبكة (يدوي)</h3>

        <label>التاريخ والوقت</label>
        <input
          type="datetime-local"
          value={recDateTime}
          onChange={(e) => setRecDateTime(e.target.value)}
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>اسم الشبكة / الجهاز</label>
        <input
          value={recNetworkName}
          onChange={(e) => setRecNetworkName(e.target.value)}
          placeholder="مثال: شبكة الفرع الرئيسي"
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "8px",
            marginBottom: "6px",
          }}
        >
          <div>
            <label>مبلغ فيزا</label>
            <input
              type="number"
              value={recVisa}
              onChange={(e) => setRecVisa(e.target.value)}
              placeholder="0"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>مبلغ ماستركارد</label>
            <input
              type="number"
              value={recMaster}
              onChange={(e) => setRecMaster(e.target.value)}
              placeholder="0"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>مبلغ مدى</label>
            <input
              type="number"
              value={recMada}
              onChange={(e) => setRecMada(e.target.value)}
              placeholder="0"
              style={{ width: "100%" }}
            />
          </div>
          <div>
            <label>مبالغ أخرى</label>
            <input
              type="number"
              value={recOther}
              onChange={(e) => setRecOther(e.target.value)}
              placeholder="0"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <p style={{ fontSize: "14px", marginBottom: "6px" }}>
          مجموع الموازنة: <strong>{recTotal.toFixed(2)} ريال</strong>
        </p>

        <label>حالة الموازنة</label>
        <select
          value={recStatus}
          onChange={(e) => setRecStatus(e.target.value)}
          style={{ width: "100%", marginBottom: "6px" }}
        >
          <option value="في الطريق">في الطريق للبنك</option>
          <option value="وصلت للبنك">وصلت للبنك</option>
        </select>

        <label>ملاحظات (اختياري)</label>
        <textarea
          value={recNote}
          onChange={(e) => setRecNote(e.target.value)}
          rows={2}
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <button
          type="button"
          onClick={handleAddRec}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#16a34a",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          ✅ حفظ موازنة
        </button>
      </div>

      {/* تحصيل كاش */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          background: "#ffffff",
        }}
      >
        <h3>💵 تحصيل كاش (صندوق المحل)</h3>

        <label>التاريخ</label>
        <input
          type="date"
          value={cashDate}
          onChange={(e) => setCashDate(e.target.value)}
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>المبلغ</label>
        <input
          type="number"
          value={cashAmount}
          onChange={(e) => setCashAmount(e.target.value)}
          placeholder="مثال: 200"
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>ملاحظات (اختياري)</label>
        <textarea
          value={cashNote}
          onChange={(e) => setCashNote(e.target.value)}
          rows={2}
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <button
          type="button"
          onClick={handleAddCash}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#2563eb",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          ✅ حفظ تحصيل كاش
        </button>
      </div>

      {/* تحصيل حوالات */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "12px",
          marginBottom: "16px",
          background: "#ffffff",
        }}
      >
        <h3>🏦 تحصيل حوالات</h3>

        <label>التاريخ</label>
        <input
          type="date"
          value={trDate}
          onChange={(e) => setTrDate(e.target.value)}
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>مبلغ الحوالة</label>
        <input
          type="number"
          value={trAmount}
          onChange={(e) => setTrAmount(e.target.value)}
          placeholder="مثال: 500"
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>اسم البنك / الجهة (اختياري)</label>
        <input
          value={trBank}
          onChange={(e) => setTrBank(e.target.value)}
          placeholder="مثال: بنك الراجحي"
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>رسوم الحوالة (اختياري)</label>
        <input
          type="number"
          value={trFees}
          onChange={(e) => setTrFees(e.target.value)}
          placeholder="0"
          style={{ width: "100%", marginBottom: "6px" }}
        />

        <label>ملاحظات</label>
        <textarea
          value={trNote}
          onChange={(e) => setTrNote(e.target.value)}
          rows={2}
          style={{ width: "100%", marginBottom: "8px" }}
        />

        <button
          type="button"
          onClick={handleAddTransfer}
          style={{
            padding: "8px 14px",
            borderRadius: "8px",
            border: "none",
            background: "#7c3aed",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          ✅ حفظ تحصيل حوالة
        </button>
      </div>
    </div>
  );
}

export default DailyCollectionPage;