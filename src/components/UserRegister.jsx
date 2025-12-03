import { useState } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
// Import registration interface (adapts to Document 2.2 Registration Interface; ensure handpassApi.js has wrapped this interface)
import { registerUser, checkRegistration } from '../api/handpassApi';
import { createUser } from '../api/usersApi';

const UserRegister = () => {
  // 1. Basic information state (corresponds to required parameters of Document 2.2 Registration Interface, ensuring alignment with users table fields in the database)
  const [sn, setSn] = useState(''); // Device serial number (required in Document 2.2, example: "VS01LB17V4001815")
  const [name, setName] = useState(''); // User name (required in Document 2.2, example: "keven")
  const [userId, setUserId] = useState(''); // Student ID (required in Document 2.2, corresponds to interface parameter "id", example: "10010")
  const [wiegandFlag, setWiegandFlag] = useState(0); // Access control permission (required in Document 2.2, 0 = none / 1 = granted)
  const [adminAuth, setAdminAuth] = useState(0); // Administrator permission (required in Document 2.2, 0 = none / 1 = granted)
  const [submitMsg, setSubmitMsg] = useState(''); // Submission result prompt (success/failure)

  // 2. Image preview state (left/right palms, corresponds to image_left/image_right in Document 2.2)
  const [leftImage, setLeftImage] = useState(null); // Left palm image (base64)
  const [leftCrop, setLeftCrop] = useState({ unit: '%', width: 50, aspect: 1 }); // 1:1 ratio for palm adaptation
  const [rightImage, setRightImage] = useState(null); // Right palm image (base64)
  const [rightCrop, setRightCrop] = useState({ unit: '%', width: 50, aspect: 1 });

  // 3. Handle image upload (convert to base64, adapting to Document 2.2 requirement: "image parameters must be base64 encoded")
  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      // Restrict image format (images only) and size (avoid overly long base64; adjust as needed)
      if (!file.type.startsWith('image/')) {
        setSubmitMsg('Please upload an image file (e.g., JPG, PNG)');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // Limit to 5MB or less
        setSubmitMsg('Image size cannot exceed 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === 'left') setLeftImage(event.target.result);
        if (type === 'right') setRightImage(event.target.result);
        setSubmitMsg(''); // Clear previous error prompts
      };
      reader.readAsDataURL(file); // Convert to base64 format (required by Document 2.2)
    }
  };

  // 4. Form submission (adapts to Document 2.2 Registration Interface; submits complete data to the database)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('');

    // 4.1 Basic form validation (ensure required fields are not empty, adapting to Document 2.2 required parameters)
    if (!sn.trim()) return setSubmitMsg('Device serial number (sn) cannot be empty (required in Document 2.2)');
    if (!name.trim()) return setSubmitMsg('Name cannot be empty (required in Document 2.2)');
    if (!userId.trim()) return setSubmitMsg('Student ID cannot be empty (required in Document 2.2)');
    if (!leftImage) return setSubmitMsg('Please upload left palm image (required in Document 2.2)');
    if (!rightImage) return setSubmitMsg('Please upload right palm image (required in Document 2.2)');

    try {
      // 4.2 First check if the student ID is already registered (adapts to Document 2.5 Interface to avoid duplicate insertion, corresponding to Error Code 30005)
      const checkRes = await checkRegistration(sn, userId);
      if (checkRes.code === 0 && checkRes.data.is_registered) {
        return setSubmitMsg(`Student ID ${userId} is already registered (Error Code 30005, Document 3.1)`);
      }

      // 4.3 Construct registration interface parameters (strictly align with Document 2.2 request parameter format)
      const registerData = {
        sn: sn.trim(),
        name: name.trim(),
        id: userId.trim(), // Correct: Pass "id" (student ID) per Document 2.2, not "user_id"
        image_left: leftImage,
        image_right: rightImage,
        wiegand_flag: wiegandFlag,
        admin_auth: adminAuth
      };

      // 4.4 Call registration interface (Document 2.2 Interface; save data to users table in the database)
      // const registerRes = await registerUser(registerData);
      const registerRes = await createUser(registerData);
      if (registerRes.code === 0) {
        setSubmitMsg('Registration successful! (Document 2.2 Interface called successfully)');
        // Reset form (clear after successful registration)
        setSn('');
        setName('');
        setUserId('');
        setWiegandFlag(0);
        setAdminAuth(0);
        setLeftImage(null);
        setRightImage(null);
      } else {
        // Adapt to Document 3.1 error codes (e.g., 10000 = Parameter Error, 30002 = Database Insertion Failed)
        setSubmitMsg(`Registration failed: ${registerRes.msg} (Error Code ${registerRes.code}, Document 3.1)`);
      }

    } catch (error) {
      setSubmitMsg('Network Error: Please check if the backend service is running (Document 2.2 Interface call failed)');
    }
  };

  const handleSubmit1 = async (e)=>{
    e.preventDefault()
    try {
      const response = await createUser({
        sn: sn.trim(),
        name: name.trim(),
        id: userId.trim(), // Correct: Pass "id" (student ID) per Document 2.2, not "user_id"
        image_left: leftImage,
        image_right: rightImage,
        wiegand_flag: wiegandFlag,
        admin_auth: adminAuth
      });
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div style={{ padding: '', maxWidth: '', margin: '' }}>
      <h2>Palm Registration (Adapts to Document 2.2 Registration Interface)</h2>
      <form onSubmit={handleSubmit1} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '40px' }}>
        {/* 1. Device Serial Number (required in Document 2.2) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Device Serial Number (sn) <span style={{ color: 'red' }}>*</span> (Example: VS01LB17V4001815)
          </label>
          <input
            type="text"
            value={sn}
            onChange={(e) => setSn(e.target.value)}
            placeholder="Please enter device serial number"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* 2. Name (required in Document 2.2) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Name <span style={{ color: 'red' }}>*</span> (Example: keven)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Please enter name"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* 3. Student ID (required in Document 2.2, corresponds to interface parameter "id") */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Student ID <span style={{ color: 'red' }}>*</span> (Example: 10010)
          </label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Please enter student ID"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        {/* 4. Access Control Permission (required in Document 2.2, 0 = none / 1 = granted) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Access Control Permission <span style={{ color: 'red' }}>*</span> (Document 2.2 Parameter: wiegand_flag)
          </label>
          <select
            value={wiegandFlag}
            onChange={(e) => setWiegandFlag(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value={0}>No Permission (0)</option>
            <option value={1}>Has Permission (1)</option>
          </select>
        </div>

        {/* 5. Administrator Permission (required in Document 2.2, 0 = none / 1 = granted) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Administrator Permission <span style={{ color: 'red' }}>*</span> (Document 2.2 Parameter: admin_auth)
          </label>
          <select
            value={adminAuth}
            onChange={(e) => setAdminAuth(Number(e.target.value))}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value={0}>No Permission (0)</option>
            <option value={1}>Has Permission (1)</option>
          </select>
        </div>

        {/* 6. Left Palm Image (required in Document 2.2, base64 encoded) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Left Palm Image <span style={{ color: 'red' }}>*</span> (Document 2.2 Parameter: image_left)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'left')}
            style={{ padding: '8px' }}
          />
          {/* Image preview area (1:1 ratio for palm adaptation) */}
          {leftImage && (
            <div style={{ marginTop: '10px', width: '200px', height: '200px', border: '1px solid #eee' }}>
              <ReactCrop
                src={leftImage}
                crop={leftCrop}
                onChange={setLeftCrop}
                keepSelection
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
        </div>

        {/* 7. Right Palm Image (required in Document 2.2, base64 encoded) */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            Right Palm Image <span style={{ color: 'red' }}>*</span> (Document 2.2 Parameter: image_right)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageChange(e, 'right')}
            style={{ padding: '8px' }}
          />
          {/* Image preview area (1:1 ratio for palm adaptation) */}
          {rightImage && (
            <div style={{ marginTop: '10px', width: '200px', height: '200px', border: '1px solid #eee' }}>
              <ReactCrop
                src={rightImage}
                crop={rightCrop}
                onChange={setRightCrop}
                keepSelection
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          )}
        </div>
        <div></div>
        <div></div>

        {/* 8. Submit Button & Result Prompt */}
        <button
          type="submit"
          style={{
            padding: '10px',
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            width: "500px",
            maxWidth: '600px',
            marginLeft: "auto"
          }}
        >
          Submit Registration (Call Document 2.2 Interface)
        </button>

        {submitMsg && (
          <p style={{
            marginTop: '10px',
            color: submitMsg.includes('successful') ? 'green' : 'red',
            margin: 0
          }}>
            {submitMsg}
          </p>
        )}
      </form>
    </div>
  );
};

export default UserRegister;