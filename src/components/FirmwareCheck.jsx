import { useState } from 'react';
// Import firmware upgrade interface (adapts to Document 2.7; ensure handpassApi.js has wrapped the firmwareUpgrade method)
import { firmwareUpgrade } from '../api/handpassApi';

const FirmwareCheck = () => {
  // State management: Document 2.7 required parameters, check results, loading state
  const [sn, setSn] = useState('');
  const [currentVersion, setCurrentVersion] = useState('');
  const [checkResult, setCheckResult] = useState({ need: false, url: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Handle firmware check (adapts to Document 2.7 interface logic)
  const handleCheckFirmware = async (e) => {
    e.preventDefault();
    setCheckResult({ need: false, url: '', msg: '' });
    setIsLoading(true);

    // 1. Parameter validation (Document 2.7 requires sn and version; missing parameters return error code 10000)
    if (!sn.trim()) {
      setCheckResult({ msg: 'Device serial number (sn) cannot be empty (required in Document 2.7, Error Code 10000)' });
      setIsLoading(false);
      return;
    }
    if (!currentVersion.trim()) {
      setCheckResult({ msg: 'Current firmware version cannot be empty (required in Document 2.7, Error Code 10000)' });
      setIsLoading(false);
      return;
    }

    try {
      // 2. Call firmware upgrade interface (Document 2.7: http://ip:port/v1/firmware_upgrade)
      const res = await firmwareUpgrade({ sn: sn.trim(), version: currentVersion.trim() });

      // 3. Handle interface response (complies with Document 2.7 return format)
      if (res.code === 0) {
        const { need, url } = res.data;
        if (need) {
          setCheckResult({
            need: true,
            url: url,
            msg: `New version found! Firmware address: ${url} (Document 2.7 interface called successfully)`
          });
        } else {
          setCheckResult({
            need: false,
            url: '',
            msg: `Current version (${currentVersion.trim()}) is the latest (Document 2.7 interface called successfully)`
          });
        }
      } else {
        // Match Document 3.1 error codes (e.g., 30004 = Database query failed)
        setCheckResult({ msg: `Check failed: ${res.msg} (Error Code ${res.code}, refer to Document 3.1)` });
      }
    } catch (error) {
      // Network exception (Document 3.1 Error Code 20000)
      setCheckResult({ msg: `Network error: Please check the backend service (Error Code 20000, Document 3.1)` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Firmware Upgrade Check (Document 2.7 Interface)</h2>
      <form onSubmit={handleCheckFirmware} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Device Serial Number (required in Document 2.7) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Device Serial Number (sn) <span style={{ color: 'red' }}>*</span> (Example: VS01LB17V4001815)
          </label>
          <input
            type="text"
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            placeholder="Please enter device serial number"
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Current Firmware Version (required in Document 2.7) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Current Firmware Version <span style={{ color: 'red' }}>*</span> (Example: 1.0.1)
          </label>
          <input
            type="text"
            value={currentVersion}
            onChange={(e) => setCurrentVersion(e.target.value)}
            placeholder="Please enter current firmware version (e.g., 1.0.1)"
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Check Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Checking...' : 'Check for Firmware Updates (Call Document 2.7 Interface)'}
        </button>

        {/* Check Result Prompt */}
        {checkResult.msg && (
          <div style={{ marginTop: '10px' }}>
            <p style={{ color: checkResult.msg.includes('successfully') ? 'green' : 'red', margin: 0 }}>
              {checkResult.msg}
            </p>
            {/* Display firmware address (when update is needed) */}
            {checkResult.need && checkResult.url && (
              <div style={{ marginTop: '8px', padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
                <label style={{ fontSize: '14px', color: '#333' }}>Firmware Download Address:</label>
                <a
                  href={checkResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#1890ff', wordBreak: 'break-all' }}
                >
                  {checkResult.url}
                </a>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
};

export default FirmwareCheck;