import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const ConnectTest = lazy(() => import('./components/ConnectTest'));
const UserRegister = lazy(() => import('./components/UserRegister'));
const UserDelete = lazy(() => import('./components/UserDelete'));
const UserQuery = lazy(() => import('./components/UserQuery'));
const UserImage = lazy(() => import('./components/ImageQuery'));
const GroupManagement = lazy(() => import('./components/GroupManagement'));
const RulesManagement = lazy(() => import('./components/RulesManagement'));
const PassRecord = lazy(() => import('./components/PassRecord'));
const DeviceManagement = lazy(() => import('./components/DeviceQuery'));
const FirmwareCheck = lazy(() => import('./components/FirmwareCheck'));
const Reports = lazy(() => import('./components/Reports'));


function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Router>
        <div className="App">
          <Suspense fallback={<div style={{ textAlign: "center", marginTop: 50 }}>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Login />} />
              {/* Dashboard Layout */}
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<DeviceManagement />} />
                <Route path="device-management" element={<DeviceManagement />} />
                <Route path="connection-test" element={<ConnectTest />} />
                <Route path="user-register" element={<UserRegister />} />
                <Route path="user-delete" element={<UserDelete />} />
                <Route path="user-query" element={<UserQuery />} />
                <Route path="user-image" element={<UserImage />} />
                <Route path="group-management" element={<GroupManagement />} />
                <Route path="rules-management" element={<RulesManagement />} />
                <Route path="pass-record" element={<PassRecord />} />
                <Route path="firmware-check" element={<FirmwareCheck />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </Suspense>
        </div>
      </Router>
    </LocalizationProvider>
  );
}

export default App;