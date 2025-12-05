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
  const [pollingInterval, setPollingInterval] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId = null;
    let intervalId = null;
    let isMounted = true;

    const fetchData = async () => {
      if (!isMounted) return;

      try {
        setLoading(true);

        // Timeout safety: abort request after 8 seconds
        timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await getAllDevices({ signal: controller.signal });

        if (!isMounted) return;

        if (res?.data) {
          const devices = res.data.data || res.data;
          const total = res.data.pagination?.total || (Array.isArray(devices) ? devices.length : 0);

          setDeviceList(Array.isArray(devices) ? devices : []);
          setMsg(`Total ${total} devices found (Last updated: ${new Date().toLocaleTimeString()})`);
        }
      } catch (error) {
        if (isMounted && error.name !== 'AbortError') {
          console.error("API Error:", error);
          setMsg(`Error: ${error.message || "Failed to fetch devices"}`);
        }
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Poll every 60 seconds
    intervalId = setInterval(() => {
      fetchData();
    }, 60000);

    // Cleanup
    return () => {
      isMounted = false;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);
  // Empty dependency array means this runs once on mount and cleanup on unmount

  // Remove the second useEffect as it's no longer needed

  // Add cleanup for interval when component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Fetch all devices
  const fetchAllDevices = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 1000;

    try {
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      try {
        const res = await getAllDevices({ signal: controller.signal });
        clearTimeout(timeoutId);

        // Check if response has data property
        if (res && res.data) {
          // Handle both response formats
          const devices = res.data.data || res.data;
          const total = res.data.pagination?.total || (Array.isArray(devices) ? devices.length : 0);

          setDeviceList(Array.isArray(devices) ? devices : []);
          setMsg(`Total ${total} devices found`);
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('API Error:', error);

      if (error.name === 'AbortError') {
        setMsg('Request timed out. The server is taking too long to respond.');
      } else if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retryCount);
        setTimeout(() => fetchAllDevices(retryCount + 1), delay);
        setMsg(`Attempt ${retryCount + 1} failed. Retrying in ${delay / 1000} seconds...`);
      } else {
        setMsg(`Failed to load devices: ${error.message || 'Unknown error'}`);
      }
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
              <tr
                key={device.id}
                style={{
                  backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9',
                  borderBottom: '1px solid #eee',
                  transition: 'background-color 0.2s',
                  ':hover': {
                    backgroundColor: '#f0f7ff'
                  }
                }}
              >
                <td style={{
                  padding: '14px 16px',
                  color: '#2c3e50',
                  fontWeight: 500
                }}>{device.sn}</td>
                <td style={{
                  padding: '14px 16px',
                  color: '#2c3e50'
                }}>{device.device_name || '-'}</td>
                <td style={{
                  padding: '14px 16px',
                  color: '#2c3e50',
                  fontFamily: 'monospace'
                }}>{device.device_ip}</td>
                <td style={{
                  padding: '14px 16px',
                  color: '#2c3e50'
                }}>v{device.firmware_version}</td>
                <td style={{
                  padding: '14px 16px',
                  color: '#2c3e50'
                }}>
                  {device.last_connect_time ?
                    new Date(device.last_connect_time).toLocaleString() :
                    <span style={{ color: '#95a5a6' }}>Never</span>
                  }
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: device.online_status === 1 ? '#e3f9e5' : '#ffebee',
                    color: device.online_status === 1 ? '#1b5e20' : '#c62828',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {device.online_status === 1 ? 'Online' : 'Offline'}
                  </span>
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