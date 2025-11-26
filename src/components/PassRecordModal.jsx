// frontend/src/components/components/PassRecordModal.js
import { useState, useEffect } from 'react';
import { getPassRecordsByDeviceSn } from '../api/handpassApi';

// Access Record Modal Component
const PassRecordModal = ({ visible, sn, onClose }) => {
  const [passRecordList, setPassRecordList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Fetch access records under the device when the modal is visible
  useEffect(() => {
    if (visible && sn) {
      fetchPassRecordsBySn();
    }
  }, [visible, sn]);

  // Fetch access records by device serial number (sn) (sorted by time in descending order)
  const fetchPassRecordsBySn = async () => {
    setLoading(true);
    try {
      const res = await getPassRecordsByDeviceSn(sn);
      if (res.code === 0) {
        setPassRecordList(res.data.passRecordList || []);
        setMsg(`Total ${res.data.count || 0} access records under Device ${sn} (sorted by time in descending order)`);
      } else {
        setMsg(`Query failed: ${res.msg} (Error Code ${res.code})`);
      }
    } catch (error) {
      setMsg('Network error: Please check the backend service');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '8px',
        maxWidth: '1000px',
        width: '95%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Device {sn} - Access Records</h3>
          <button
            onClick={onClose}
            style={{ border: 'none', backgroundColor: 'transparent', fontSize: '18px', cursor: 'pointer', color: '#666' }}
          >
            ×
          </button>
        </div>

        {/* Result Message */}
        {msg && (
          <p style={{
            margin: '0 0 16px 0',
            color: msg.includes('Total') ? 'green' : 'red',
            fontSize: '14px'
          }}>
            {msg}
          </p>
        )}

        {/* Access Record List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>⏳ Loading access records...</div>
        ) : passRecordList.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f7fa' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Serial No.</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Student ID</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Palm Type</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Access Time</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Record Creation Time</th>
              </tr>
            </thead>
            <tbody>
              {passRecordList.map((record, index) => (
                <tr key={record.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{record.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{record.user_id || 'Not filled'}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    {record.palm_type === 'left' ? 'Left Hand' : 'Right Hand'}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: '#333' }}>
                    {record.device_date_time}
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee', color: '#666' }}>
                    {new Date(record.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', border: '1px dashed #eee', borderRadius: '4px' }}>
            📭 No access records under this device
          </div>
        )}
      </div>
    </div>
  );
};

export default PassRecordModal;