// src/App.js
import React, { useState } from "react";

function App() {
  // هنا نخزن القسم المختار
  const [selectedSection, setSelectedSection] = useState("home");

  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#f7f7f7",
    textAlign: "center",
    direction: "rtl",
    fontFamily: "system-ui, sans-serif",
  };

  const cardStyle = {
    cursor: "pointer",
    border: "1px solid #ddd",
    padding: "14px 20px",
    margin: "8px 0",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    textAlign: "right",
  };

  const activeCardStyle = {
    ...cardStyle,
    borderColor: "#4b7bec",
    backgroundColor: "#eef3ff",
    fontWeight: "bold",
  };

  return (
    <div style={containerStyle}>
      <h1>📊 لوحة التحكم</h1>
      <p>اختر أحد الأقسام للبدء:</p>

      {/* الأزرار الرئيسية */}
      <div
        style={selectedSection === "inventory" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("inventory")}
      >
        📦 الجرد
      </div>

      <div
        style={selectedSection === "sales" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("sales")}
      >
        🛒 المبيعات
      </div>

      <div
        style={selectedSection === "invoices" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("invoices")}
      >
        🧾 الفواتير
      </div>

      <div
        style={selectedSection === "accounts" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("accounts")}
      >
        💰 الحسابات
      </div>

      <div
        style={selectedSection === "suppliers" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("suppliers")}
      >
        🚚 الموردين والمندوبين
      </div>

      <div
        style={selectedSection === "reports" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("reports")}
      >
        📑 التقارير
      </div>

      <div
        style={selectedSection === "employees" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("employees")}
      >
        🧑‍💼 الموظفين والصلاحيات
      </div>

      {/* هنا المحتوى اللي يتغير حسب القسم المختار */}
      <div style={{ marginTop: "30px", textAlign: "right" }}>
        {selectedSection === "home" && (
          <p>✨ اضغطي على أحد الأقسام بالأعلى لعرض تفاصيله.</p>
        )}

        {selectedSection === "inventory" && (
          <>
            <h2>📦 الجرد</h2>
            <p>هنا لاحقًا بنضيف شاشة الجرد اليومي وحركة الأصناف وكرت الصنف.</p>
          </>
        )}

        {selectedSection === "sales" && (
          <>
            <h2>🛒 المبيعات</h2>
            <p>هنا بتكون واجهة المبيعات ومسح الباركود والفاتورة للعميل.</p>
          </>
        )}

        {selectedSection === "invoices" && (
          <>
            <h2>🧾 الفواتير</h2>
            <p>هنا فواتير المشتريات، المبيعات، الضريبية وغير الضريبية.</p>
          </>
        )}

        {selectedSection === "accounts" && (
          <>
            <h2>💰 الحسابات</h2>
            <p>هنا صندوق المحل، السلف، المصاريف التشغيلية، والمديونيات.</p>
          </>
        )}

        {selectedSection === "suppliers" && (
          <>
            <h2>🚚 الموردين والمندوبين</h2>
            <p>إدارة الموردين، المندوبين، بياناتهم، وسندات استلام البضاعة.</p>
          </>
        )}

        {selectedSection === "reports" && (
          <>
            <h2>📑 التقارير</h2>
            <p>تقارير المبيعات، المشتريات، الشبكات، صافي الربح وغيرها.</p>
          </>
        )}

        {selectedSection === "employees" && (
          <>
            <h2>🧑‍💼 الموظفين والصلاحيات</h2>
            <p>حسابات الموظفين، الصلاحيات، وتتبع ما يفعله كل موظف.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default App;