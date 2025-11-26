import axios from 'axios';

// Get current host (dynamically adapt to the deployment environment)
const currentHost = window.location.hostname;
// Dynamically generated base URL (matches the backend API base path: http://{host}:3001/v1)
const baseURL = `http://${currentHost}:3001/v1`;
const handpassApi = axios.create({
  baseURL: baseURL, 
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  timeout: 5000 // Request timeout (5 seconds)
});

// Original axios instance configuration (retained for reference, no modification needed)
// const handpassApi = axios.create({
//   // baseURL: 'http://localhost:3001/v1', // Backend API prefix (matches the document's API base path)
//   baseURL: 'http://192.168.1.133:3001/v1', // Backend API prefix (matches the document's API base path)
//   headers: {
//     'Content-Type': 'application/json;charset=UTF-8' // Request body format required by the document (JSON + UTF-8 encoding)
//   },
//   timeout: 5000
// });

// Request interceptor (original code, no modification needed)
handpassApi.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor (original code, no modification needed)
handpassApi.interceptors.response.use(
  (response) => response.data, // Directly return the response data body
  (error) => {
    alert(`Network error (${error.message})`);
    return Promise.reject(error);
  }
);

// 1. Connection Test (Document 2.1) - Original code, no modification needed
export const connectTest = (sn) => {
  return handpassApi.post('/connect', { sn }); // Document 2.1 API path: /v1/connect
};

// 2. User Registration (Document 2.2) - Original code, no modification needed
export const registerUser = (userData) => {
  return handpassApi.post('/add', userData); // Document 2.2 API path: /v1/add
};

// 3. User Deletion (Document 2.3) - Original code, no modification needed
export const deleteUser = (sn, id) => {
  return handpassApi.post('/delete', { sn, id }); // Document 2.3 API path: /v1/delete
};

// 4. Query All Users (Document 2.4) - Original code, no modification needed
export const queryAllUsers = (sn) => {
  return handpassApi.post('/query', { sn }); // Document 2.4 API path: /v1/query
};

// 5. Check if ID is Registered (Document 2.5) - Original code, no modification needed
export const checkRegistration = (sn, id) => {
  return handpassApi.post('/check_registration', { sn, id }); // Document 2.5 API path: /v1/check_registration
};

// 6. Query User Images (Document 2.6) - Original code, no modification needed
export const queryUserImages = (data) => {
  // Destructure sn and id from the object (corresponds to fields passed by the component)
  const { sn, id } = data;
  console.log('xxxx Request parameters:', { sn, id }); // Log format: { sn: "VS01LB17V4001815", id: "10010" }
  // Pass top-level sn and id to the backend
  return handpassApi.post('/query_images', { sn, id }); // Document 2.6 API path: /v1/query_images
};

// 7. Firmware Upgrade (Document 2.7) - Newly added
export const firmwareUpgrade = (data) => {
  // Required parameters for Document 2.7: sn (device serial number), version (firmware version)
  // API path: /v1/firmware_upgrade
  return handpassApi.post('/firmware_upgrade', {
    sn: data.sn, // Required by Document 2.7, example value: "VS01LB17V4001815"
    version: data.version // Required by Document 2.7, example value: "1.0.1"
  });
};

// 8. Access Record Submission (Document 2.8) - Newly added
export const passList = (data) => {
  // Required parameters for Document 2.8: sn, name, type, device_date_time
  // Optional parameter: id (student ID)
  // API path: /v1/pass_list
  return handpassApi.post('/pass_list', {
    sn: data.sn, // Required by Document 2.8, example value: "VS01LB17V4001815"
    name: data.name, // Required by Document 2.8, example value: "keven"
    id: data.id || '', // Optional parameter for Document 2.8 (student ID), example value: "10010"
    type: data.type, // Required by Document 2.8 (palm type: left/right), example value: "left"
    device_date_time: data.device_date_time // Required by Document 2.8 (access time), example value: "2025-04-09 13:52:02"
  });
};

// 9. Query Batch Import File (Document 2.9) - Newly added
export const queryBatchImportPath = (sn) => {
  // Required parameter for Document 2.9: sn (device serial number)
  // API path: /v1/query_batch_import_path
  return handpassApi.post('/query_batch_import_path', {
    sn: sn // Required by Document 2.9, example value: "VS01LB17V4001815"
  });
};

//------------
// Newly added APIs for Device Management (frontend/src/api/handpassApi.js)
// 1. Query all devices
export const getAllDevices = () => {
  return handpassApi.post('/device/getAll'); // API path: /v1/device/getAll
};

// 2. Update device status (e.g., called during connection test)
export const updateDeviceStatus = (data) => {
  return handpassApi.post('/device/updateStatus', data); // API path: /v1/device/updateStatus
};

// 3. Query users by device serial number (sn)
export const getUsersByDeviceSn = (sn) => {
  return handpassApi.post('/device/getUsers', { sn }); // API path: /v1/device/getUsers
};

// 4. Query access records by device serial number (sn)
export const getPassRecordsByDeviceSn = (sn) => {
  return handpassApi.post('/device/getPassRecords', { sn }); // API path: /v1/device/getPassRecords
};
//------------

export default handpassApi;