import React, { useState, useEffect } from "react";

// نستورد الصفحات
import SalesPage from "./pages/SalesPage";
import InventoryPage from "./pages/InventoryPage";
import InvoicesPage from "./pages/InvoicesPage";
import AccountsPage from "./pages/AccountsPage";
import SuppliersPage from "./pages/SuppliersPage";
import ReportsPage from "./pages/ReportsPage";
import EmployeesPage from "./pages/EmployeesPage";

// مؤقتًا: المستخدمين
const USERS = [
  { username: "admin", password: "1234", displayName: "المدير" },
  { username: "emp1", password: "1111", displayName: "موظف ١" },
  { username: "emp2", password: "2222", displayName: "موظف ٢" },
];

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedSection, setSelectedSection] = useState("home");
  const [rememberMe, setRememberMe] = useState(false);

  // أول ما يفتح الموقع نحاول نقرأ المستخدم من التخزين
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

  const containerStyle = {
    maxWidth: "600px",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "12px",
    backgroundColor: "#f7f7f7",
    textAlign: "center",
    direction: "rtl",
    fontFamily: "system-ui",
  };

  const cardStyle = {
    cursor: "pointer",
    border: "1px solid #ddd",
    padding: "14px",
    margin: "6px 0",
    borderRadius: "8px",
    backgroundColor: "#fff",
    textAlign: "right",
    fontSize: "18px",
  };

  const activeCardStyle = {
    ...cardStyle,
    borderColor: "#4b7bec",
    background: "#eef3ff",
    fontWeight: "bold",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "8px 0",
    borderRadius: "6px",
    border: "1px solid #ccc",
    textAlign: "right",
  };

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
    setSelectedSection("home");
    localStorage.removeItem("currentUser");
  };

  // لو ما فيه مستخدم مسجّل → صفحة تسجيل الدخول
  if (!currentUser) {
    return (
      <div style={containerStyle}>
        <h1>تسجيل الدخول</h1>

        <form onSubmit={handleLogin} style={{ textAlign: "right" }}>
          <label>اسم المستخدم</label>
          <input
            style={inputStyle}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="مثال: admin أو emp1"
          />

          <label>كلمة المرور</label>
          <input
            style={inputStyle}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="مثال: 1234"
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
              borderRadius: "6px",
              color: "#fff",
              fontSize: "17px",
              cursor: "pointer",
            }}
          >
            دخول
          </button>
        </form>
      </div>
    );
  }

  // لو المستخدم مسجّل → لوحة التحكم
  return (
    <div style={containerStyle}>
      <div style={{ textAlign: "left", marginBottom: "10px" }}>
        👤 {currentUser.displayName}
        <button
          onClick={handleLogout}
          style={{
            marginRight: "10px",
            padding: "4px 10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          خروج
        </button>
      </div>

      <h1>📊 لوحة التحكم</h1>

      {/* المبيعات أولاً */}
      <div
        style={selectedSection === "sales" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("sales")}
      >
        🛒 المبيعات
      </div>

      {/* الجرد ثاني */}
      <div
        style={selectedSection === "inventory" ? activeCardStyle : cardStyle}
        onClick={() => setSelectedSection("inventory")}
      >
        📦 الجرد
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

      {/* عرض الصفحة حسب القسم */}
      <div style={{ marginTop: "25px", textAlign: "right" }}>
        {selectedSection === "sales" && <SalesPage />}
        {selectedSection === "inventory" && <InventoryPage />}
        {selectedSection === "invoices" && <InvoicesPage />}
        {selectedSection === "accounts" && <AccountsPage />}
        {selectedSection === "suppliers" && <SuppliersPage />}
        {selectedSection === "reports" && <ReportsPage />}
        {selectedSection === "employees" && <EmployeesPage />}
        {selectedSection === "home" && (
          <p>✨ اضغطي على أحد الأقسام بالأعلى لعرض تفاصيله.</p>
        )}
      </div>
    </div>
  );
}

export default App;