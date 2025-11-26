import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { deleteUser } from '../api/handpassApi';

// Global unified test data (consistent with other components for quick user input)
const DEFAULT_SN = 'VS01LB17V4001815';
const TEST_USER_ID = '10010';

const schema = yup.object({
  sn: yup.string().required('Device serial number is required'),
  id: yup.string().required('Student ID is required')
}).required();

const UserDelete = () => {
  const [msg, setMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // New loading state to improve interaction feedback

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    // Optional: Populate default test values for quick user testing (retain/remove as needed)
    defaultValues: {
      sn: DEFAULT_SN,
      id: TEST_USER_ID
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMsg(''); // Clear previous prompts
    try {
      const res = await deleteUser(data.sn, data.id);
      if (res.code === 0) {
        setMsg(`✅ Deletion successful! (Device: ${data.sn} | Student ID: ${data.id})`);
        reset(); // Reset form after success (optional, adjust based on needs)
      } else {
        // Adapt to Document 3.1 error codes and display specific reasons
        const errorMsgMap = {
          30006: 'This student ID is not registered under the current device',
          30003: 'Database deletion operation failed',
          10000: 'Invalid parameter format'
        };
        const errorMsg = errorMsgMap[res.code] || res.msg;
        setMsg(`❌ Deletion failed: ${errorMsg} (Error Code ${res.code}, refer to Document 3.1)`);
      }
    } catch (error) {
      setMsg('❌ Network error: Please check if the backend service is running (Port 3001)');
    } finally {
      setIsSubmitting(false); // End loading state regardless of success or failure
    }
  };

  return (
    <div 
      className="user-delete" 
      style={{ 
        margin: '24px auto', 
        padding: '24px', 
        maxWidth: '500px', // Fixed maximum width to prevent stretching
        backgroundColor: '#fff', 
        borderRadius: '8px', 
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)', // Light shadow for better layering
        fontFamily: 'Arial, sans-serif' // Unified font
      }}
    >
      {/* Title Area: With icon prompt for clear functionality */}
      <h3 style={{ 
        margin: '0 0 20px 0', 
        color: '#333', 
        fontSize: '18px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <span style={{ color: '#ff4d4f' }}>🗑️</span>
        User Deletion (Document 2.3 Interface)
      </h3>

      {/* Form Area: Structured layout with unified spacing */}
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px' // Unified spacing for form elements
        }}
      >
        {/* Device Serial Number (sn) Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#666', 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
            <span>Device Serial Number (sn) <span style={{ color: '#ff4d4f' }}>*</span></span>
            {/* Example value prompt to help users fill quickly */}
            <span style={{ fontSize: '12px', color: '#999' }}>Example: {DEFAULT_SN}</span>
          </label>
          <input 
            type="text" 
            {...register('sn')} 
            style={{ 
              padding: '10px 12px', 
              borderRadius: '4px', 
              border: '1px solid #dcdcdc', 
              fontSize: '14px',
              transition: 'border 0.2s', // Smooth transition effect
              outline: 'none'
            }}
            placeholder="Please enter device serial number"
            disabled={isSubmitting} // Disable input during loading
          />
          {/* Error Prompt: Smaller font with soft color */}
          {errors.sn && (
            <span style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '2px' }}>
              {errors.sn.message}
            </span>
          )}
        </div>

        {/* Student ID Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ 
            fontSize: '14px', 
            color: '#666', 
            display: 'flex', 
            justifyContent: 'space-between' 
          }}>
            <span>Student ID (id) <span style={{ color: '#ff4d4f' }}>*</span></span>
            {/* Example value prompt */}
            <span style={{ fontSize: '12px', color: '#999' }}>Example: {TEST_USER_ID}</span>
          </label>
          <input 
            type="text" 
            {...register('id')} 
            style={{ 
              padding: '10px 12px', 
              borderRadius: '4px', 
              border: '1px solid #dcdcdc', 
              fontSize: '14px',
              transition: 'border 0.2s',
              outline: 'none'
            }}
            placeholder="Please enter the student ID to delete"
            disabled={isSubmitting} // Disable input during loading
          />
          {/* Error Prompt */}
          {errors.id && (
            <span style={{ color: '#ff4d4f', fontSize: '12px', marginTop: '2px' }}>
              {errors.id.message}
            </span>
          )}
        </div>

        {/* Action Button: Enhanced interaction feedback */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{ 
            padding: '10px 0', 
            backgroundColor: isSubmitting ? '#ccc' : '#ff4d4f', // Gray out when loading
            color: '#fff', 
            border: 'none', 
            borderRadius: '4px', 
            fontSize: '14px', 
            fontWeight: '500',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'backgroundColor 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting ? (
            // Loading animation (simple text prompt, no complex icons)
            <>⏳ Processing...</>
          ) : (
            <>Confirm Deletion</>
          )}
        </button>

        {/* Result Prompt: Distinguish success/failure with visual feedback */}
        {msg && (
          <div 
            style={{ 
              padding: '10px 12px', 
              borderRadius: '4px', 
              fontSize: '14px',
              marginTop: '4px',
              backgroundColor: msg.includes('successful') ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 77, 79, 0.1)',
              color: msg.includes('successful') ? '#34c759' : '#ff4d4f'
            }}
          >
            {msg}
          </div>
        )}

        {/* Warning Prompt: Emphasize irreversibility of deletion */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 12px', 
          backgroundColor: 'rgba(255, 149, 0, 0.1)', 
          borderRadius: '4px', 
          fontSize: '12px', 
          color: '#ff9500' 
        }}>
          ⚠️ Warning: Deletion is irreversible. Please confirm the device serial number and student ID are correct before submitting!
        </div>
      </form>
    </div>
  );
};

export default UserDelete;