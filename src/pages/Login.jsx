import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (username === 'Admin' && password === 'admin@123') {
        console.log(username,password);
        
      setError('');
      navigate('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fa',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '380px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
        padding: '28px 24px 24px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{
            margin: '0 0 6px 0',
            fontSize: '22px',
            fontWeight: 600,
            color: '#1890ff',
          }}>
            Handpass-500 MS
          </h1>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#64748b',
          }}>
            Palm Recognition Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px',
              color: '#475569',
              fontWeight: 500,
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontSize: '13px',
              color: '#475569',
              fontWeight: 500,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '10px',
              fontSize: '12px',
              color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '9px 0',
              border: 'none',
              borderRadius: '8px',
              background: '#1890ff',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
