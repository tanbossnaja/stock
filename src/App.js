import React, { useEffect, useState } from "react";

function StockTable() {
  const [stockData, setStockData] = useState([]);
  const API_URL ="https://script.google.com/macros/s/AKfycbxw--4_TblPQqTw6CqzeTJL1R6-1rX-Hflb9WvNWEy1bQvmMljr_PlcC9n0KTb5MDX9/exec"; 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);


  useEffect(() => {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      //console.log("DATA:", data);  // 🔍 ดูว่าเป็น array จริงไหม
      setStockData(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error("Error fetching stock data:", error);
      setLoading(false);
    });
}, []);

// 🔄 จัดกลุ่มตาม category
  const groupedData = stockData.reduce((groups, item) => {
    const category = item.category || 'ไม่ระบุหมวด';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});

  const handleChange = (category, index, field, value) => {
    const newData = [...groupedData[category]];
    
    newData[index][field] = value;
    
    const updatedGroupedData = { ...groupedData, [category]: newData };

    // แปลงกลับเป็น array flat
    const newFlatData = Object.values(updatedGroupedData).flat();
    setStockData(newFlatData);
    //console.log("newDATA:", newFlatData);
  };

  const handleSave = () => {
    setSaving(true);
    //const url = `${API_URL}?data=${encodeURIComponent(JSON.stringify(stockData))}`;
    const formData = new URLSearchParams();
    formData.append('data', JSON.stringify(stockData));
    fetch(API_URL , {
      method: 'POST',
      headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      },
      //body: JSON.stringify(stockData)
      body: formData.toString(),
    })
      .then(res => res.json())
      .then(response => {
        alert('✅ บันทึกข้อมูลเรียบร้อยแล้ว');
        setSaving(false);
      })
      .catch(err => {
        console.error('Save error:', err);
        alert('❌ บันทึกล้มเหลว');
        setSaving(false);
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Stock</h2>
      {Object.keys(groupedData).map(category => (
        <div key={category} style={{ marginBottom: '30px'} } >
          <h3>{category}</h3>
          <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>เหลือ</th>
              </tr>
            </thead>
            <tbody>
              {groupedData[category].map((item, index) => (
                <tr key={item.code || index}>
                  <td>{item.name || '-'}</td>
                  <td>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    pattern="\d*"
                    value={item.currentStock ?? ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      if (/^\d*$/.test(newValue)) { // ✅ รับเฉพาะตัวเลข 0-9
                        handleChange(category, index, 'currentStock', newValue);
                      }
                    }}
                    style={{ width: '100%' }}
                    
                  />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <button onClick={handleSave} disabled={saving} style={{ padding: '10px 20px', fontSize: '16px' }}>
        {saving ? 'saving...' : 'save'}
      </button>
      
    </div>
  );
}

export default StockTable;
