import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserRegister from '../components/UserRegister';
import UserDelete from '../components/UserDelete';
import UserQuery from '../components/UserQuery';
import ImageQuery from '../components/ImageQuery';
import ConnectTest from '../components/ConnectTest';
import PassRecord from '../components/PassRecord';
import FirmwareCheck from '../components/FirmwareCheck';
import DeviceQuery from '../components/DeviceQuery';


const GlobalStyles = () => (
  <style>
    {`
      
      ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      ::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb {
        background: #c0c6cc;
        border-radius: 3px;
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #98a2b3;
      }

   
      .tab-content {
        transition: opacity 0.3s ease, transform 0.3s ease;
      }
      .tab-content-enter {
        opacity: 0;
        transform: translateY(10px);
      }
    `}
  </style>
);

const Dashboard = () => {
  // const [activeTab, setActiveTab] = useState('register');
  const [activeTab, setActiveTab] = useState('device');

  const [tabEnter, setTabEnter] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  // 
  useEffect(() => {
    setTabEnter(true);
    const timer = setTimeout(() => setTabEnter(false), 300);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const tabs = [
    { key: 'connect', label: 'Connection Test', icon: '🔌' },
    { key: 'register', label: 'User Register', icon: '📝' },
    { key: 'delete', label: 'User Delete', icon: '🗑️' },
    { key: 'query', label: 'User Query', icon: '🔍' },
    { key: 'imageQuery', label: 'User Image', icon: '🖼️' },
    { key: 'passRecord', label: 'Pass Record', icon: '📊' },
    { key: 'device', label: 'Device Management', icon: '📱' },
    { key: 'firmware', label: 'Firmware Check', icon: '🔄' }
  ];

  return (
    <div className="dashboard" style={{
      height: '100vh',
      background: '#f5f7fa',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      <GlobalStyles />

      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'stretch',
        height: '100%'
      }}>
        <div className="tab-container" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '16px 12px',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          width: '230px',
          flexShrink: 0,
          height: '100%',
          overflowY: 'auto'
        }}>
          <div className="dashboard-header" style={{
            textAlign: 'center',
            padding: '16px 0 0 0',
            background: "#fff",
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
          }}>
            <h1 style={{
              margin: '0 0 8px 0',
              color: '#1890ff',
              fontSize: '20px',
              fontWeight: 600,
            }}>
              Handpass-500 MS
            </h1>
            <p style={{
              margin: 0,
              color: '#64748b',
              fontSize: '10px',
              opacity: 0.9
            }}>
              Palm Recognition Management System | V1.0.0
            </p>
          </div>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                background: activeTab === tab.key ? '#1890ff' : 'transparent',
                color: activeTab === tab.key ? '#fff' : '#334155',
                fontSize: '14px',
                fontWeight: 500,
                textAlign: 'left',
                transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
                boxShadow: activeTab === tab.key ? '0 2px 8px rgba(24, 144, 255, 0.25)' : 'none'
              }}
            >
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#0f172a',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Logout
          </button>

          <div className="dashboard-footer" style={{
            textAlign: 'center',
            padding: '16px 0',
            color: '#94a3b8',
            fontSize: '12px',
            borderTop: '1px solid #e2e8f0',
            marginTop: '16px'
          }}>
            &copy; {new Date().getFullYear()} Handpass-500 MS. All rights reserved.
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100%',
          overflow: 'hidden'
        }}>
          <div
            className={`tab-content ${tabEnter ? 'tab-content-enter' : ''}`}
            style={{
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              padding: '28px',
              flex: 1,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              overflowY: 'auto'
            }}
          >
            {activeTab === 'connect' && <ConnectTest />}
            {activeTab === 'register' && <UserRegister />}
            {activeTab === 'delete' && <UserDelete />}
            {activeTab === 'query' && <UserQuery />}
            {activeTab === 'imageQuery' && <ImageQuery />}
            {activeTab === 'passRecord' && <PassRecord />}
            {activeTab === 'device' && <DeviceQuery />}
            {activeTab === 'firmware' && <FirmwareCheck />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;