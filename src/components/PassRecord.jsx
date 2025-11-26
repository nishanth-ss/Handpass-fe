import { useState } from 'react';
// Import access record interface (adapts to Document 2.8; ensure handpassApi.js has wrapped the passList method)
import { passList } from '../api/handpassApi';

const PassRecord = () => {
  // State management: Document 2.8 required parameters, submission result, loading state
  const [sn, setSn] = useState('');
  const [name, setName] = useState('');
  const [userId, setUserId] = useState(''); // Document 2.8 optional parameter (Student ID)
  const [palmType, setPalmType] = useState('left'); // Palm type: left/right (required in Document 2.8)
  const [passTime, setPassTime] = useState(''); // Access time (adapts to document format: YYYY-MM-DD HH:MM:SS)
  const [submitResult, setSubmitResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle time format conversion: convert datetime-local input to "YYYY-MM-DD HH:MM:SS" required by the document
  const formatPassTime = (localTime) => {
    if (!localTime) return '';
    // Browser datetime-local returns format: "YYYY-MM-DDTHH:MM"; replace "T" with space and append ":00" for seconds
    return localTime.replace('T', ' ') + ':00';
  };

  // Handle access record submission (adapts to Document 2.8 interface logic)
  const handleSubmitRecord = async (e) => {
    e.preventDefault();
    setSubmitResult('');
    setIsLoading(true);

    // 1. Parameter validation (Document 2.8 required: sn, name, type, device_date_time)
    if (!sn.trim()) {
      setSubmitResult('Device serial number (sn) cannot be empty (required in Document 2.8, Error Code 10000)');
      setIsLoading(false);
      return;
    }
    if (!name.trim()) {
      setSubmitResult('Name cannot be empty (required in Document 2.8, Error Code 10000)');
      setIsLoading(false);
      return;
    }
    if (!passTime.trim()) {
      setSubmitResult('Access time cannot be empty (required in Document 2.8, Error Code 10000)');
      setIsLoading(false);
      return;
    }

    try {
      // 2. Construct request parameters (strictly align with Document 2.8 parameter names)
      const recordData = {
        sn: sn.trim(),
        name: name.trim(),
        id: userId.trim() || '', // Student ID is optional; pass empty string if empty
        type: palmType, // Document 2.8 parameter name "type" (palm type)
        device_date_time: formatPassTime(passTime) // Convert to time format required by the document
      };

      // 3. Call access record interface (Document 2.8: http://ip:port/v1/pass_list)
      const res = await passList(recordData);

      // 4. Handle interface response (complies with Document 2.8 common response format)
      if (res.code === 0) {
        setSubmitResult(`Access record submitted successfully! (User: ${name.trim()}, Time: ${formatPassTime(passTime)}, Document 2.8 interface called successfully)`);
        // Reset form after successful submission
        setSn('');
        setName('');
        setUserId('');
        setPassTime('');
        setPalmType('left');
      } else {
        // Match Document 3.1 error codes (e.g., 30002 = Database insertion failed)
        setSubmitResult(`Submission failed: ${res.msg} (Error Code ${res.code}, refer to Document 3.1)`);
      }
    } catch (error) {
      // Network exception (Document 3.1 Error Code 20000)
      setSubmitResult(`Network error: Please check the backend service (Error Code 20000, Document 3.1)`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>Access Record Submission (Document 2.8 Interface)</h2>
      <form onSubmit={handleSubmitRecord} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Device Serial Number (required in Document 2.8) */}
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

        {/* Name (required in Document 2.8) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Name <span style={{ color: 'red' }}>*</span> (Example: keven)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Please enter access user's name"
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Student ID (optional parameter in Document 2.8) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Student ID (Optional) (Example: 10010)
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Optional: Enter access user's student ID"
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Palm Type (required in Document 2.8, left/right) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Palm Type <span style={{ color: 'red' }}>*</span> (Document 2.8 Parameter: type)
          </label>
          <select
            value={palmType}
            onChange={(e) => setPalmType(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="left">Left Hand (left)</option>
            <option value="right">Right Hand (right)</option>
          </select>
        </div>

        {/* Access Time (required in Document 2.8, Format: YYYY-MM-DD HH:MM:SS) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Access Time <span style={{ color: 'red' }}>*</span> (Document 2.8 Parameter: device_date_time)
          </label>
          <input
            type="datetime-local"
            value={passTime}
            onChange={(e) => setPassTime(e.target.value)}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
            Note: Selected time will be automatically converted to "YYYY-MM-DD HH:MM:SS" format required by the document
          </p>
        </div>

        {/* Submit Button */}
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
          {isLoading ? 'Submitting...' : 'Submit Access Record (Call Document 2.8 Interface)'}
        </button>

        {/* Submission Result Prompt */}
        {submitResult && (
          <p style={{
            marginTop: '10px',
            color: submitResult.includes('successfully') ? 'green' : 'red',
            margin: 0
          }}>
            {submitResult}
          </p>
        )}
      </form>
    </div>
  );
};

export default PassRecord;