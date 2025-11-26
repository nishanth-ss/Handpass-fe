import { useState } from 'react';
import { connectTest } from '../api/connecttestApi';
// Import connection interface from dedicated connecttestApi module

const ConnectTest = () => {
  // State management: Device serial number, test result, loading state
  const [sn, setSn] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle connection test (adapts to Document 2.1 interface logic)
  const handleTestConnect = async (e) => {
    e.preventDefault();
    setTestResult('');
    setIsLoading(true);

    // 1. Parameter validation (Document 2.1 requires sn; missing parameter returns Error Code 10000)
    if (!sn.trim()) {
      setTestResult('Device serial number (sn) cannot be empty (required parameter for Document 2.1, Error Code 10000)');
      setIsLoading(false);
      return;
    }

    try {
      // 2. Call connection interface (Document 2.1: http://ip:port/v1/connect)
      const res = await connectTest(sn.trim());

      // 3. Handle interface response (complies with the document's common response format)
      if (res.code === 0) {
        setTestResult(`Connection successful! (Document 2.1 Interface called successfully, sn: ${sn.trim()})`);
      } 
      // else {
        // Match Document 3.1 error codes (e.g., 20000 = Network Error)
        // setTestResult(`Connection failed: ${res.msg} (Error Code ${res.code}, refer to Document 3.1)`); AI code
      // }
    } catch (error) {
      // Network exception (Document 3.1 Error Code 20000)
      // setTestResult(`Network error: Please check if the backend service is running (Error Code 20000, Document 3.1)`); AI code
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Connection Test (Document 2.1 Interface)</h2>
      <form onSubmit={handleTestConnect} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Device Serial Number Input (required for Document 2.1) */}
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
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              cursor: isLoading ? 'not-allowed' : 'text'
            }}
          />
        </div>

        {/* Test Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isLoading ? 'Testing...' : 'Verify Connection (Call Document 2.1 Interface)'}
        </button>

        {/* Test Result Prompt */}
        {testResult && (
          <p style={{
            marginTop: '10px',
            color: testResult.includes('successful') ? 'green' : 'red',
            margin: 0,
            fontSize: '14px'
          }}>
            {testResult}
          </p>
        )}
      </form>
    </div>
  );
};

export default ConnectTest;