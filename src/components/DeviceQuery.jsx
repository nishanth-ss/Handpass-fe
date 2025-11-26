// frontend/src/components/DeviceQuery.js
import { useState, useEffect } from 'react';
import { getAllDevices, getUsersByDeviceSn, getPassRecordsByDeviceSn } from '../api/handpassApi';
import UserDeviceModal from './UserDeviceModal';  
import PassRecordModal from './PassRecordModal'; 

// Connection status tag style (visually distinguish online/offline)
const OnlineStatusTag = ({ status }) => {
  return (
    <span style={{
      padding: '2px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      backgroundColor: status === 1 ? 'rgba(52, 199, 89, 0.2)' : 'rgba(153, 153, 153, 0.2)',
      color: status === 1 ? '#34c759' : '#999'
    }}>
      {status === 1 ? 'Online' : 'Offline'}
    </span>
  );
};

const DeviceQuery = () => {
  const [deviceList, setDeviceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  // Modal states
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [currentSn, setCurrentSn] = useState(''); // Current device serial number (sn) for operations

  // Fetch all devices when page loads
  useEffect(() => {
    fetchAllDevices();
  }, []);

  // Fetch all devices
  const fetchAllDevices = async () => {
    setLoading(true);
    try {
      const res = await getAllDevices();
      if (res.code === 0) {
        setDeviceList(res.data.deviceList || []);
        setMsg(`Total ${res.data.deviceList?.length || 0} devices found`);
      } else {
        setMsg(`Query failed: ${res.msg} (Error Code ${res.code})`);
      }
    } catch (error) {
      setMsg('Network error: Please check the backend service');
    } finally {
      setLoading(false);
    }
  };

  // Open "View Users" modal
  const handleViewUsers = (sn) => {
    setCurrentSn(sn);
    setUserModalVisible(true);
  };

  // Open "View Access Records" modal
  const handleViewPassRecords = (sn) => {
    setCurrentSn(sn);
    setPassModalVisible(true);
  };

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#333', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>📱 Device Management (Total {deviceList.length})</span>
        <button
          onClick={fetchAllDevices}
          style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          Refresh List
        </button>
      </h2>

      {/* Result message */}
      {msg && (
        <p style={{
          margin: '0 0 16px 0',
          color: msg.includes('found') ? 'green' : 'red',
          fontSize: '14px'
        }}>
          {msg}
        </p>
      )}

      {/* Device list table */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>⏳ Loading device list...</div>
      ) : deviceList.length > 0 ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f7fa' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Device Serial Number (sn)</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Device Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Device IP</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Firmware Version</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Last Connection Time</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Connection Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deviceList.map((device, index) => (
              <tr key={device.sn} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{device.sn}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{device.device_name || 'Not set'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{device.device_ip || 'Unknown'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{device.firmware_version}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  {device.last_connect_time ? new Date(device.last_connect_time).toLocaleString() : 'Not connected'}
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <OnlineStatusTag status={device.online_status} />
                </td>
                <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                  <button
                    onClick={() => handleViewUsers(device.sn)}
                    style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#1890ff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    View Users
                  </button>
                  <button
                    onClick={() => handleViewPassRecords(device.sn)}
                    style={{ padding: '4px 8px', backgroundColor: '#32c957', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    View Access Records
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666', border: '1px dashed #eee', borderRadius: '4px' }}>
          📭 No device data available, please add devices first
        </div>
      )}

      {/* View Users modal (pass current device sn and visibility state) */}
      <UserDeviceModal
        visible={userModalVisible}
        sn={currentSn}
        onClose={() => setUserModalVisible(false)}
      />

      {/* View Access Records modal (pass current device sn and visibility state) */}
      <PassRecordModal
        visible={passModalVisible}
        sn={currentSn}
        onClose={() => setPassModalVisible(false)}
      />
    </div>
  );
};

export default DeviceQuery;