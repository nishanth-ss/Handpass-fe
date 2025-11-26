import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { queryAllUsers } from '../api/handpassApi';

// Default device serial number for testing (consistent with TEST_DATA in components like ImageQuery for easy quick testing)
const DEFAULT_SN = 'VS01LB17V4001815';

const schema = yup.object({
  sn: yup.string().required('Device serial number is required')
}).required();

const UserQuery = () => {
  const [userList, setUserList] = useState([]);
  const [msg, setMsg] = useState('');
  
  // Key modification: Configure default value for 'sn' via useForm's defaultValues
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      sn: DEFAULT_SN // Set default value for 'sn' field (auto-filled in input box when page loads)
    }
  });

  const onSubmit = async (data) => {
    try {
      // Automatically get the value from the input box on submission (default value or user-modified value)
      const res = await queryAllUsers(data.sn);
      if (res.code === 0) {
        setUserList(res.data.idDataList || []);
        setMsg(`Query successful, total ${res.data.idDataList?.length || 0} records`);
      } else {
        setMsg(`Query failed: ${res.msg} (Error Code ${res.code})`);
        setUserList([]);
      }
    } catch (error) {
      setMsg('Network error, please check if the backend service is running');
      setUserList([]);
    }
  };

  return (
    <div className="user-query" style={{ margin: '20px', maxWidth: '800px', marginLeft: 'auto', marginRight: 'auto' }}>
      <h3 style={{ color: '#1890ff', marginBottom: '20px' }}>Query All Registered Users (Document 2.4 Interface)</h3>
      
      {/* Form: The 'sn' input box will be auto-filled with the default value DEFAULT_SN */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '14px', color: '#333' }}>Device Serial Number (sn):</label>
          <input 
            type="text" 
            {...register('sn')} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '4px', 
              border: '1px solid #ddd', 
              width: '280px',
              fontSize: '14px'
            }}
          />
          {/* Error prompt */}
          {errors.sn && <span style={{ color: 'red', fontSize: '12px', marginLeft: '8px' }}>{errors.sn.message}</span>}
        </div>
        <button 
          type="submit" 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#1890ff', 
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Query (Call Document 2.4 Interface)
        </button>
      </form>

      {/* Result prompt */}
      {msg && <p style={{ color: msg.includes('successful') ? 'green' : 'red', margin: '0 0 15px 0', fontSize: '14px' }}>{msg}</p>}

      {/* User list table */}
      {userList.length > 0 && (
        <table border="1" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f7fa' }}>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>Serial No.</th>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>Student ID (user_id)</th>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>Access Control Permission</th>
              <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>Administrator Permission</th>
            </tr>
          </thead>
          <tbody>
            {userList.map((user, index) => (
              <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>{index + 1}</td>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>{user.id}</td>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>
                  {user.wiegand_flag === 1 ? <span style={{ color: 'green' }}>Yes</span> : <span style={{ color: '#999' }}>No</span>}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #eee' }}>
                  {user.admin_auth === 1 ? <span style={{ color: 'green' }}>Yes</span> : <span style={{ color: '#999' }}>No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* No data prompt */}
      {msg.includes('successful') && userList.length === 0 && (
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', padding: '20px', border: '1px dashed #eee' }}>
          No registered users under the current device
        </p>
      )}
    </div>
  );
};

export default UserQuery;