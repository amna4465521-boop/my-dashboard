function App() {
  const containerStyle = {
    maxWidth: "500px",
    margin: "50px auto",
    padding: "20px",
    textAlign: "center",
    fontFamily: "Arial",
  };

  const cardStyle = {
    padding: "15px",
    margin: "10px 0",
    background: "#f5f5f5",
    borderRadius: "10px",
    fontSize: "18px",
    cursor: "pointer",
    border: "1px solid #ddd"
  };

  return (
    <div style={containerStyle}>
      <h1>📊 لوحة التحكم</h1>
      <p>اختر أحد الأقسام للبدء:</p>

      <div style={cardStyle}>📦 الجرد</div>
      <div style={cardStyle}>🛒 المبيعات</div>
      <div style={cardStyle}>🧾 الفواتير</div>
      <div style={cardStyle}>💰 الحسابات</div>
      <div style={cardStyle}>🚚 الموردين والمناديب</div>
      <div style={cardStyle}>📑 التقارير</div>
      <div style={cardStyle}>🧍 الموظفين والصلاحيات</div>
    </div>
  );
}

export default App;

