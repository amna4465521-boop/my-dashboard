// src/App.js
import React, { useState, useEffect } from "react";

// الصفحات
import SalesPage from "./pages/SalesPage";
import DailyCollectionPage from "./pages/DailyCollectionPage";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import AccountsPage from "./pages/AccountsPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import EmployeesPage from "./pages/EmployeesPage";

// 👤 المستخدمين (حسابات الدخول)
const USERS = [
  { username: "N1", password: "12345", displayName: "نجيب" },
  { username: "D1", password: "12345", displayName: "دارس" },
  { username: "A1", password: "12345", displayName: "تجربة" },
];

// 🎨 تنسيقات عامة
const pageWrapperStyle = {
  minHeight: "100vh",
  margin: 0,
  padding: "30px 10px",
  background: "linear-gradient(135deg, #0f172a, #1e293b)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const containerStyle = {
  width: "100%",
  maxWidth: "900px",
  margin: "0 auto",
  padding: "24px 28px",
  borderRadius: "18px",
  backgroundColor: "#f9fafb",
  boxShadow: "0 18px 45px rgba(15, 23, 42, 0.35)",
  direction: "rtl",
  fontFamily:
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const sectionsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "10px",
  marginTop: "15px",
};

const cardStyle = {
  cursor: "pointer",
  border: "1px solid #e5e7eb",
  padding: "14px 16px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  textAlign: "right",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  transition: "all 0.18s ease",
};

const activeCardStyle = {
  ...cardStyle,
  borderColor: "#4b7bec",
  background: "linear-gradient(135deg, #eef2ff, #e0f2fe)",
  boxShadow: "0 8px 20px rgba(59, 130, 246, 0.35)",
  fontWeight: "600",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  margin: "6px 0 10px 0",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  backgroundColor: "#ffffff",
  textAlign: "right",
  fontSize: "14px",
};

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedSection, setSelectedSection] = useState("sales");
  const [rememberMe, setRememberMe] = useState(false);

  // أول ما يفتح الموقع نحاول نقرأ المستخدم من التخزين (تذكرني)
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
      } catch (e) {
        console.error("خطأ في قراءة المستخدم من التخزين", e);
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const user = USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (!user) {
      setLoginError("❌ بيانات الدخول غير صحيحة");
    } else {
      setCurrentUser(user);
      setUsername("");
      setPassword("");
      setLoginError("");

      if (rememberMe) {
        localStorage.setItem("currentUser", JSON.stringify(user));
      } else {
        localStorage.removeItem("currentUser");
      }
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedSection("sales");
    localStorage.removeItem("currentUser");
  };

  // لو مو مسجل دخول → صفحة الدخول
  if (!currentUser) {
    return (
      <div style={pageWrapperStyle}>
        <div style={containerStyle}>
          <h1 style={{ textAlign: "center", marginBottom: "10px" }}>
            تسجيل الدخول
          </h1>

          <form onSubmit={handleLogin} style={{ textAlign: "right" }}>
            <label>اسم المستخدم</label>
            <input
              style={inputStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="مثال: N1 أو D1 أو A1"
            />

            <label>كلمة المرور</label>
            <input
              style={inputStyle}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="مثال: 12345"
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "10px",
                marginTop: "4px",
              }}
            >
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" style={{ fontSize: "14px" }}>
                تذكرني (لا تخرجني من الحساب في هذا الجهاز)
              </label>
            </div>

            {loginError && (
              <p style={{ color: "red", fontSize: "14px" }}>{loginError}</p>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "#4b7bec",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "17px",
                cursor: "pointer",
              }}
            >
              دخول
            </button>
          </form>
        </div>
      </div>
    );
  }

  // بعد تسجيل الدخول → لوحة التحكم
  return (
    <div style={pageWrapperStyle}>
      <div style={containerStyle}>
        {/* شريط علوي */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            alignItems: "center",
          }}
        >
          <div>
            👤 {currentUser.displayName}
            <span style={{ fontSize: "12px", color: "#6b7280", marginRight: 6 }}>
              ({currentUser.username})
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: "4px 10px",
              borderRadius: "6px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            خروج
          </button>
        </div>

        <h1 style={{ marginBottom: "6px" }}>📊 لوحة التحكم</h1>
        <p style={{ marginBottom: "15px", fontSize: "14px", color: "#4b5563" }}>
          اختاري أحد الأقسام لبدء العمل.
        </p>

        {/* الأقسام الرئيسية بالترتيب اللي اتفقنا عليه */}
        <div style={sectionsGridStyle}>
          {/* 1) المبيعات */}
          <div
            style={selectedSection === "sales" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("sales")}
          >
            <span>🛒 المبيعات</span>
          </div>

          {/* 2) التحصيل اليومي */}
          <div
            style={
              selectedSection === "dailyCollection"
                ? activeCardStyle
                : cardStyle
            }
            onClick={() => setSelectedSection("dailyCollection")}
          >
            <span>💳 التحصيل اليومي</span>
          </div>

          {/* 3) الجرد */}
          <div
            style={selectedSection === "inventory" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("inventory")}
          >
            <span>📦 الجرد / المخزون</span>
          </div>

          {/* 4) الفواتير */}
          <div
            style={selectedSection === "invoices" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("invoices")}
          >
            <span>🧾 الفواتير</span>
          </div>

          {/* 5) الموردين والمندوبين */}
          <div
            style={selectedSection === "suppliers" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("suppliers")}
          >
            <span>🚚 الموردين والمندوبين</span>
          </div>

          {/* 6) الحسابات */}
          <div
            style={selectedSection === "accounts" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("accounts")}
          >
            <span>💰 الحسابات</span>
          </div>

          {/* 7) التقارير */}
          <div
            style={selectedSection === "reports" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("reports")}
          >
            <span>📑 التقارير</span>
          </div>

          {/* 8) الموظفين والصلاحيات */}
          <div
            style={selectedSection === "employees" ? activeCardStyle : cardStyle}
            onClick={() => setSelectedSection("employees")}
          >
            <span>🧑‍💼 الموظفين والصلاحيات</span>
          </div>
        </div>

        {/* عرض محتوى الصفحة المختارة */}
        <div style={{ marginTop: "25px" }}>
          {selectedSection === "sales" && <SalesPage />}
          {selectedSection === "dailyCollection" && <DailyCollectionPage />}
          {selectedSection === "inventory" && <InventoryPage />}
          {selectedSection === "invoices" && <InvoicesPage />}
          {selectedSection === "suppliers" && <SuppliersPage />}
          {selectedSection === "accounts" && <AccountsPage />}
          {selectedSection === "reports" && <ReportsPage />}
          {selectedSection === "employees" && <EmployeesPage />}
        </div>
      </div>
    </div>
  );
}

export default App;