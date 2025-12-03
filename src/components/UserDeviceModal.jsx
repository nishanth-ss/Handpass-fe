// frontend/src/components/components/UserDeviceModal.js
import { useState, useEffect } from 'react';
import { getUsersByDeviceSn, userUpdatePermission } from '../api/handpassApi';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// Image Preview Modal (View left/right palm images)
const ImagePreviewModal = ({ visible, imageSrc, onClose, title }) => {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ border: 'none', backgroundColor: 'transparent', fontSize: '18px', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={imageSrc}
            alt={title}
            style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
            // Fallback SVG for image load failure (English: "Image failed to load")
            onError={(e) => e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzY2NiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+SW1hZ2UgZmFpbGVkIHRvIGxvYWQ8L3RleHQ+PC9zdmc+'}
          />
        </div>
      </div>
    </div>
  );
};

// Device User Modal Component
const UserDeviceModal = ({ visible, sn, onClose }) => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  // Image preview modal state
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentImage, setCurrentImage] = useState({ src: '', title: '' });

  // Fetch users under the device when modal is visible
  useEffect(() => {
    if (visible && sn) {
      fetchUsersBySn();
    }
  }, [visible, sn]);

  // Fetch users by device serial number (sn)
  const fetchUsersBySn = async () => {
    setLoading(true);
    try {
      const res = await getUsersByDeviceSn(sn);
        if (res.code === 0) {
          setUserList(res.data.users || []);
          setMsg(`Total ${res.data.total || 0} users under Device ${sn}`);
        } else {
          setMsg(`Query failed: ${res.msg} (Error Code ${res.code})`);
        }
    } catch (error) {
      setMsg('Network error: Please check the backend service');
    } finally {
      setLoading(false);
    }
  };

  // View palm image
  const handleViewImage = (imageSrc, type, userName) => {
    setCurrentImage({
      src: imageSrc,
      title: `${userName} - ${type === 'left' ? 'Left Palm Image' : 'Right Palm Image'}`
    });
    setImageModalVisible(true);
  };

  const handleWiegandChange = async (userId, value) => {
    console.log(userId,value);
    
    try {
      await userUpdatePermission(userId, value);
      const res = await getUsersByDeviceSn(sn);
      if (res.code === 0) {
        setUserList(res.data.users || []);
        setMsg(`Total ${res.data.total || 0} users under Device ${sn}`);
      } else {
        setMsg(`Query failed: ${res.msg} (Error Code ${res.code})`);
      }
      
      setMsg('Access control permission updated successfully');
    } catch (error) {
      console.error('Error updating wiegand flag:', error);
      fetchUsers(currentSn);
      setMsg('Failed to update access control permission');
    }
  };

  const handleAdminAuthChange = async (userId, value) => {
    try {
      // Update local state first for immediate UI feedback
      setUserList(prev =>
        prev.map(user =>
          user.user_id === userId
            ? { ...user, admin_auth: value }
            : user
        )
      );

      // Call API to update the value on the server
      await updateUserAdminAuth(userId, value);
      await getUsersByDeviceSn(sn)

      // Optional: Show success message
      setMsg('Administrator permission updated successfully');
    } catch (error) {
      console.error('Error updating admin auth:', error);
      // Revert UI on error
      fetchUsers(currentSn);
      setMsg('Failed to update administrator permission');
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
        maxWidth: '900px',
        width: '95%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, color: '#333' }}>Device {sn} - User List</h3>
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

        {/* User List */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>⏳ Loading user list...</div>
        ) : userList.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f7fa' }}>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Serial No.</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Student ID</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Access Control Permission</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Administrator Permission</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Palm Images</th>
              </tr>
            </thead>
            <tbody>
              {userList.map((user, index) => (
                <tr key={user.user_id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{user.user_id}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>{user.name}</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <Select
                      value={user.wiegand_flag}
                      onChange={(e) => handleWiegandChange(user.id, e.target.value)}
                      size="small"
                      sx={{
                        '& .MuiSelect-select': {
                          padding: '4px 8px',
                          fontSize: '14px',
                          color: user.wiegand_flag === 1 ? 'green' : '#999'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #ddd'
                        }
                      }}
                    >
                      <MenuItem value={1} sx={{ color: 'green' }}>Yes</MenuItem>
                      <MenuItem value={0} sx={{ color: '#999' }}>No</MenuItem>
                    </Select>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <Select
                      value={user.admin_auth}
                      onChange={(e) => handleAdminAuthChange(user.user_id, e.target.value)}
                      size="small"
                      sx={{
                        '& .MuiSelect-select': {
                          padding: '4px 8px',
                          fontSize: '14px',
                          color: user.admin_auth === 1 ? 'green' : '#999'
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                          border: 'none'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          border: '1px solid #ddd'
                        }
                      }}
                    >
                      <MenuItem value={1} sx={{ color: 'green' }}>Yes</MenuItem>
                      <MenuItem value={0} sx={{ color: '#999' }}>No</MenuItem>
                    </Select>
                  </td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #eee' }}>
                    <button
                      onClick={() => handleViewImage(user.image_left, 'left', user.name)}
                      style={{ marginRight: '6px', padding: '3px 6px', fontSize: '12px', border: '1px solid #1890ff', color: '#1890ff', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Left
                    </button>
                    <button
                      onClick={() => handleViewImage(user.image_right, 'right', user.name)}
                      style={{ padding: '3px 6px', fontSize: '12px', border: '1px solid #1890ff', color: '#1890ff', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Right
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', border: '1px dashed #eee', borderRadius: '4px' }}>
            📭 No registered users under this device
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        visible={imageModalVisible}
        imageSrc={currentImage.src}
        title={currentImage.title}
        onClose={() => setImageModalVisible(false)}
      />
    </div>
  );
};

export default UserDeviceModal;