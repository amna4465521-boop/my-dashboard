// src/App.js
import React, { useState, useEffect } from "react";
import "./App.css";

// الصفحات
import SalesPage from "./pages/SalesPage";
import DailyCollectionPage from "./pages/DailyCollectionPage";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import SuppliersPage from "./pages/SuppliersPage";
import AccountsPage from "./pages/AccountsPage";
import ReportsPage from "./pages/ReportsPage";
import EmployeesPage from "./pages/EmployeesPage";
import LedgerPage from "./pages/LedgerPage";

// المستخدمين (مؤقتًا داخل الكود)
const USERS = [
  { username: "N1", password: "12345", displayName: "نجيب", role: "employee" },
  { username: "D1", password: "12345", displayName: "دارس", role: "employee" },
  { username: "A1", password: "12345", displayName: "تجربة", role: "admin" },
];

// ***************  ستايلات عامة  ***************
const containerStyle = {
  maxWidth: "1200px",
  margin: "20px auto",
  padding: "16px",
  borderRadius: "16px",
  backgroundColor: "#f5f5f8",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  direction: "rtl",
  color: "#111827",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.12)",
  boxSizing: "border-box",
};

const loginCardStyle = {
  maxWidth: "420px",
  width: "100%",
  margin: "0 auto",
  padding: "24px 20px",
  borderRadius: "16px",
  backgroundColor: "#ffffff",
  textAlign: "right",
  boxShadow: "0 10px 25px rgba(15, 23, 42, 0.15)",
  boxSizing: "border-box",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  margin: "6px 0 14px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "15px",
  boxSizing: "border-box",
};

const buttonPrimary = {
  width: "100%",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background:
    "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(59,130,246,1) 100%)",
  color: "#ffffff",
  fontSize: "16px",
  cursor: "pointer",
  fontWeight: 600,
};

const sidebarStyle = {
  width: "260px",
  padding: "12px",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  boxShadow: "0 8px 20px rgba(15,23,42,0.08)",
  boxSizing: "border-box",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const logoBox = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const logoPlaceholder = {
  width: "40px",
  height: "40px",
  borderRadius: "12px",
  background:
    "linear-gradient(135deg, rgba(59,130,246,1) 0%, rgba(129,140,248,1) 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fff",
  fontWeight: "bold",
  fontSize: "18px",
};

const sectionButton = {
  cursor: "pointer",
  borderRadius: "10px",
  padding: "8px 10px",
  marginBottom: "6px",
  border: "1px solid transparent",
  backgroundColor: "#f9fafb",
  fontSize: "14px",
  textAlign: "right",
};

const sectionButtonActive = {
  ...sectionButton,
  backgroundColor: "#eef2ff",
  borderColor: "#4f46e5",
  color: "#111827",
  fontWeight: 600,
};

const mainAreaStyle = {
  flex: 1,
  padding: "12px",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
  boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
  minHeight: "480px",
  boxSizing: "border-box",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "12px",
};

// **********************************************

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSection, setSelectedSection] = useState("sales");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false
  );

  // قراءة المستخدم من localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser_sky");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("خطأ في قراءة المستخدم المحفوظ", e);
      }
    }
  }, []);

  // مراقبة حجم الشاشة (لأجل الجوال)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = USERS.find(
      (u) => u.username === username.trim() && u.password === password.trim()
    );
    if (!user) {
      setLoginError("❌ اسم المستخدم أو كلمة المرور غير صحيحة");
      return;
    }
    setCurrentUser(user);
    setLoginError("");
    setUsername("");
    setPassword("");
    if (rememberMe) {
      localStorage.setItem("currentUser_sky", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser_sky");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("currentUser_sky");
  };

  // *************** شاشة تسجيل الدخول ***************
  if (!currentUser) {
    return (
      <div
        style={{
          ...containerStyle,
          maxWidth: "100%",
          background: "#0f172a",
          boxShadow: "none",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={loginCardStyle}>
          <h1 style={{ marginTop: 0, marginBottom: "6px", fontSize: "22px" }}>
            Sky Dashboard
          </h1>
          <p
            style={{
              marginTop: 0,
              marginBottom: "16px",
              fontSize: "13px",
              color: "#6b7280",
            }}
          >
            سجلي دخولك لمتابعة المبيعات، الجرد، والتحصيل اليومي للمحل.
          </p>

          <form onSubmit={handleLogin}>
            <label style={{ fontSize: "14px" }}>اسم المستخدم</label>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: N1 أو D1 أو A1"
            />
            <label style={{ fontSize: "14px" }}>كلمة المرور</label>
            <input
              style={inputStyle}
              value={password}
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="12345"
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "8px",
              }}
            >
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "13px" }}>
                تذكرني في هذا الجهاز
              </label>
            </div>

            {loginError && (
              <p style={{ color: "red", fontSize: "13px" }}>{loginError}</p>
            )}

            <button type="submit" style={buttonPrimary}>
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // *************** بعد تسجيل الدخول ***************

  // الأقسام
  const sections = [
    { key: "sales", label: "🛒 المبيعات" },
    { key: "dailyCollection", label: "💳 التحصيل اليومي" },
    { key: "inventory", label: "📦 الجرد" },
    { key: "invoices", label: "🧾 الفواتير" },
    { key: "suppliers", label: "🚚 الموردين والمندوبين" },
    { key: "accounts", label: "💰 الحسابات" },
    { key: "reports", label: "📑 التقارير" },
    { key: "ledger", label: "📚 دفتر أستاذ" },
    { key: "employees", label: "🧑‍💼 الموظفين والصلاحيات" },
  ];

  const isAdmin = currentUser?.role === "admin";

  const renderSection = () => {
    switch (selectedSection) {
      case "sales":
        return <SalesPage currentUser={currentUser} />;
      case "dailyCollection":
        return <DailyCollectionPage currentUser={currentUser} />;
      case "inventory":
        return <InventoryPage />;
      case "invoices":
        return <InvoicesPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "accounts":
        return <AccountsPage />;
      case "reports":
        return <ReportsPage />;
      case "employees":
        return <EmployeesPage isAdmin={isAdmin} />;
      case "ledger":
        return <LedgerPage />;
      default:
        return <SalesPage currentUser={currentUser} />;
    }
  };

  const renderSectionButtons = () => (
    <div>
      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "8px",
        }}
      >
        الأقسام الرئيسية
      </div>
      {sections.map((sec) => {
        // مثال بسيط: قسم الحسابات والموظفين للمدير فقط
        if (!isAdmin && (sec.key === "accounts" || sec.key === "employees")) {
          return null;
        }
        const isActive = selectedSection === sec.key;
        return (
          <div
            key={sec.key}
            onClick={() => setSelectedSection(sec.key)}
            style={isActive ? sectionButtonActive : sectionButton}
          >
            {sec.label}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={containerStyle}>
      {/* الهيدر العلوي */}
      <div style={headerStyle}>
        <div style={logoBox}>
          <div style={logoPlaceholder}>S</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "16px" }}>
              مون داشبورد
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              مساحة مخصصة لشعار المحل (لوغو)
            </div>
          </div>
        </div>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: "14px" }}>👤 {currentUser.displayName}</div>
          <button
            onClick={handleLogout}
            style={{
              marginTop: "4px",
              padding: "4px 10px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            خروج
          </button>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      {isMobile ? (
        // ********** شكل الجوال: صفحة وحدة **********
        <>
          <div
            style={{
              ...sidebarStyle,
              width: "100%",
              marginBottom: "12px",
            }}
          >
            {renderSectionButtons()}
          </div>

          <div style={mainAreaStyle}>
            <div style={topBarStyle}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>
                {sections.find((s) => s.key === selectedSection)?.label ||
                  "لوحة التحكم"}
              </h2>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                النظام داخلي لإدارة محل الشيش والمعسلات والجرد والحسابات.
              </div>
            </div>
            <div>{renderSection()}</div>
          </div>
        </>
      ) : (
        // ********** شكل اللابتوب / الآيباد: عمودين **********
        <div style={{ display: "flex", gap: "12px" }}>
          {/* القائمة الجانبية */}
          <div style={sidebarStyle}>{renderSectionButtons()}</div>

          {/* منطقة المحتوى */}
          <div style={mainAreaStyle}>
            <div style={topBarStyle}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>
                {sections.find((s) => s.key === selectedSection)?.label ||
                  "لوحة التحكم"}
              </h2>
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                النظام داخلي لإدارة محل الشيش والمعسلات والجرد والحسابات.
              </div>
            </div>
            <div>{renderSection()}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;