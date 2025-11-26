import { useState } from 'react';
// Import image query interface (ensure consistency with handpassApi.js definition: accepts { sn, id } parameters)
import { queryUserImages } from '../api/handpassApi';

// Default test data (adapts to existing records in the database to avoid query failures; modify based on actual data)
const TEST_DATA = {
  SN: 'VS01LB17V4001815', // Test device serial number (ensure the device has registered records in the database)
  USER_ID: '10010'        // Test student ID (ensure this ID is registered under the above device, corresponding to the user_id field in the users table)
};

const ImageQuery = () => {
  // 1. State management: Required parameters for Document 2.6 (sn/student ID), query results, loading state
  const [sn, setSn] = useState(TEST_DATA.SN); // Pre-fill test sn for quick testing
  const [userId, setUserId] = useState(TEST_DATA.USER_ID); // Pre-fill test student ID
  const [queryResult, setQueryResult] = useState({
    name: '',          // User name (returned field in Document 2.6)
    imageLeft: '',     // Left palm image (base64, returned field in Document 2.6)
    imageRight: '',    // Right palm image (base64, returned field in Document 2.6)
    msg: '',           // Result prompt (success/error)
    errorType: ''      // Error type (param error/ID not exist/network error, for differentiated handling)
  });
  const [isLoading, setIsLoading] = useState(false);

  // 2. Default image for failed image loading (avoids broken image icons, improves experience)
  const DEFAULT_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2NiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgZmFpbGVkIHRvIGxvYWQ8L3RleHQ+PC9zdmc+';

  // 3. Handle image query (strictly adapts to Document 2.6 interface logic, no nested parameters)
  const handleQueryImages = async (e) => {
    e.preventDefault();
    // Reset results (avoid interference from old data)
    setQueryResult(prev => ({ ...prev, name: '', imageLeft: '', imageRight: '', msg: '', errorType: '' }));
    setIsLoading(true);

    // 3.1 Frontend parameter pre-validation (Document 2.6 required: sn and id cannot be empty, valid format)
    const trimmedSn = sn.trim();
    const trimmedUserId = userId.trim();
    if (!trimmedSn) {
      setQueryResult({
        msg: 'Device serial number (sn) cannot be empty! (Required parameter for Document 2.6, Error Code 10000)',
        errorType: 'param'
      });
      setIsLoading(false);
      return;
    }
    if (!trimmedUserId) {
      setQueryResult({
        msg: 'Student ID (id) cannot be empty! (Required parameter for Document 2.6, Error Code 10000)',
        errorType: 'param'
      });
      setIsLoading(false);
      return;
    }
    // Additional format validation: sn only allows letters, numbers, underscores, and hyphens (optional, based on actual business needs)
    if (/[^\w-]/.test(trimmedSn)) {
      setQueryResult({
        msg: 'Device serial number (sn) only supports letters, numbers, underscores, and hyphens! (Error Code 10000)',
        errorType: 'param'
      });
      setIsLoading(false);
      return;
    }

    try {
      // 3.2 Call interface: pass top-level parameters (sn and id are not nested, consistent with handpassApi.js definition)
      console.log('Calling Document 2.6 interface, request parameters:', { sn: trimmedSn, id: trimmedUserId });
      const res = await queryUserImages({ sn: trimmedSn, id: trimmedUserId });

      // 3.3 Handle interface response (strictly matches Document 2.6 return format)
      if (res.code === 0) {
        // Success: Extract name, image_left, image_right returned by Document 2.6
        const { name, image_left, image_right } = res.data;
        setQueryResult({
          name: name || 'Unknown User',
          imageLeft: image_left || DEFAULT_IMAGE,
          imageRight: image_right || DEFAULT_IMAGE,
          msg: `✅ Query successful!\nUser: ${name || 'Unknown User'} | Student ID: ${trimmedUserId} | Device: ${trimmedSn}`,
          errorType: 'success'
        });
        // Reset input fields after success (optional, for convenient next query)
        // setSn('');
        // setUserId('');
      } else {
        // Failure: Match Document 3.1 error codes to differentiate error types
        let errorMsg = '';
        let errorType = 'other';
        switch (res.code) {
          case 10000:
            errorMsg = `❌ Parameter error: ${res.msg || 'Invalid sn or id format'} (Error Code 10000, Document 3.1)`;
            errorType = 'param';
            break;
          case 30004:
            errorMsg = `❌ Query failed: ${res.msg || 'Database query exception'} (Error Code 30004, Document 3.1)`;
            errorType = 'db';
            break;
          case 30006:
            errorMsg = `❌ ID does not exist: ${res.msg || 'This student ID is not registered under the current device'} (Error Code 30006, Document 3.1)`;
            errorType = 'id_not_exist';
            break;
          default:
            errorMsg = `❌ Interface call failed: ${res.msg || 'Unknown error'} (Error Code ${res.code}, refer to Document 3.1)`;
        }
        setQueryResult({ msg: errorMsg, errorType });
      }
    } catch (error) {
      // 3.4 Network exception (Document 3.1 Error Code 20000)
      setQueryResult({
        msg: `❌ Network error: ${error.message || 'Backend service not started or incorrect interface address'} (Error Code 20000, Document 3.1)`,
        errorType: 'network'
      });
    } finally {
      setIsLoading(false); // End loading state regardless of success or failure
    }
  };

  // 4. Reset form (clear input fields with one click for re-entry)
  const handleResetForm = () => {
    setSn('');
    setUserId('');
    setQueryResult(prev => ({ ...prev, name: '', imageLeft: '', imageRight: '', msg: '', errorType: '' }));
  };

  return (
    <div style={{ 
      padding: '24px', 
      maxWidth: '700px', 
      margin: '0 auto', 
      border: '1px solid #f0f0f0', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)' 
    }}>
      <h2 style={{ margin: '0 0 20px 0', color: '#1890ff' }}>
        Registered Image Query (Document 2.6 Interface · Test Example)
      </h2>

      {/* Form Area: sn and id are top-level inputs (no nesting) */}
      <form onSubmit={handleQueryImages} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px', 
        marginBottom: '20px' 
      }}>
        {/* Device Serial Number (sn) Input (Required for Document 2.6) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#333', 
            fontWeight: '500' 
          }}>
            Device Serial Number (sn) <span style={{ color: 'red' }}>*</span>
            <span style={{ marginLeft: 8, fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
              Example: {TEST_DATA.SN} (registered device for testing)
            </span>
          </label>
          <input
            type="text"
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            placeholder="Please enter device serial number (e.g., VS01LB17V4001815)"
            disabled={isLoading}
            style={{ 
              padding: '10px 12px', 
              borderRadius: '4px', 
              border: queryResult.errorType === 'param' ? '1px solid red' : '1px solid #ddd',
              fontSize: '14px',
              transition: 'border 0.2s'
            }}
          />
        </div>

        {/* Student ID (id) Input (Required for Document 2.6, corresponds to interface parameter "id") */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#333', 
            fontWeight: '500' 
          }}>
            Student ID (id) <span style={{ color: 'red' }}>*</span>
            <span style={{ marginLeft: 8, fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
              Example: {TEST_DATA.USER_ID} (registered student ID for testing)
            </span>
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Please enter the student ID to query (e.g., 10010)"
            disabled={isLoading}
            style={{ 
              padding: '10px 12px', 
              borderRadius: '4px', 
              border: queryResult.errorType === 'param' ? '1px solid red' : '1px solid #ddd',
              fontSize: '14px',
              transition: 'border 0.2s'
            }}
          />
        </div>

        {/* Action Buttons: Query + Reset */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="submit"
            disabled={isLoading}
            style={{ 
              flex: 1,
              padding: '10px 0', 
              backgroundColor: isLoading ? '#ccc' : '#1890ff', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner" style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderTopColor: '#fff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Querying...
              </>
            ) : (
              'Query Registered Images (Call Document 2.6 Interface)'
            )}
          </button>

          <button
            type="button"
            onClick={handleResetForm}
            disabled={isLoading}
            style={{ 
              padding: '0 16px', 
              backgroundColor: '#fff', 
              color: '#666', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {/* Result Display Area: Differentiate success/error states */}
      {queryResult.msg && (
        <div style={{ 
          padding: '12px 16px', 
          borderRadius: '4px',
          backgroundColor: queryResult.errorType === 'success' ? 'rgba(52,199,89,0.1)' : 'rgba(255,59,48,0.1)',
          color: queryResult.errorType === 'success' ? '#2ecc71' : '#e74c3c',
          fontSize: '14px',
          whiteSpace: 'pre-line' // Support line breaks for better prompt display
        }}>
          {queryResult.msg}
        </div>
      )}

      {/* Image Preview Area (Only shown on successful query, adapts to images returned by Document 2.6) */}
      {queryResult.errorType === 'success' && (queryResult.imageLeft || queryResult.imageRight) && (
        <div style={{ 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px dashed #eee' 
        }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#333' }}>
            📋 User Information: {queryResult.name} (Student ID: {userId.trim()} | Device: {sn.trim()})
          </h4>

          <div style={{ 
            display: 'flex', 
            gap: '30px', 
            flexWrap: 'wrap', 
            justifyContent: 'flex-start' 
          }}>
            {/* Left Palm Image Preview (Returned field in Document 2.6: image_left) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Left Palm Image</span>
              <div style={{ 
                width: '220px', 
                height: '220px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #eee',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <img
                  src={queryResult.imageLeft}
                  alt="Left Palm Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                  onError={(e) => e.target.src = DEFAULT_IMAGE} // Show default image on load failure
                />
              </div>
            </div>

            {/* Right Palm Image Preview (Returned field in Document 2.6: image_right) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Right Palm Image</span>
              <div style={{ 
                width: '220px', 
                height: '220px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid #eee',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <img
                  src={queryResult.imageRight}
                  alt="Right Palm Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                  onError={(e) => e.target.src = DEFAULT_IMAGE} // Show default image on load failure
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Instructions (Help users verify quickly) */}
      <div style={{ 
        marginTop: '30px', 
        padding: '12px', 
        backgroundColor: '#f5f7fa', 
        borderRadius: '4px', 
        fontSize: '12px', 
        color: '#666' 
      }}>
        <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>📝 Test Instructions:</h5>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>1. The default test data (sn: {TEST_DATA.SN} | Student ID: {TEST_DATA.USER_ID}) must be registered in the database; otherwise, it will return "ID does not exist" (Error Code 30006);</li>
          <li>2. If "Parameter error" (10000) is prompted, check: whether sn/student ID is empty or contains special characters;</li>
          <li>3. If "Network error" (20000) is prompted, confirm the backend service is running (Port 3001);</li>
          <li>4. A gray default image will be displayed if image loading fails, which does not affect functionality.</li>
        </ul>
      </div>

      {/* Loading Animation Style (Inline to avoid additional CSS files) */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ImageQuery;