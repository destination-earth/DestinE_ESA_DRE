// ApiTestComponent.tsx
// A simple component to test API authentication

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { initializeApi } from '../services/api/axiosConfig';
import axios from 'axios';

const ApiTestComponent: React.FC = () => {
  const [apiResponse, setApiResponse] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { accessToken, isAuthenticated, apiInitialized } = useAuth();
  const [envVars, setEnvVars] = useState<Record<string, string>>({});

  // Get environment variables for debugging
  useEffect(() => {
    const vars: Record<string, string> = {};
    Object.keys(import.meta.env).forEach((key) => {
      vars[key] = import.meta.env[key] as string;
    });
    setEnvVars(vars);
  }, []);

  const testSolarApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/Assessment/solar/about');
      setApiResponse(response.data);
      console.log('✅ Solar API test successful:', response.data);
    } catch (err) {
      console.error('❌ Solar API test failed:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const testWindApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/Assessment/wind/about');
      setApiResponse(response.data);
      console.log('✅ Wind API test successful:', response.data);
    } catch (err) {
      console.error('❌ Wind API test failed:', err);
      setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const testInitializeApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await initializeApi();
      setApiResponse(response as Record<string, unknown>);
      console.log('✅ API initialization successful:', response);
    } catch (err) {
      console.error('❌ API initialization failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const testDirectApiCall = async () => {
    setLoading(true);
    setError(null);
    try {
      // Create a new axios instance with the base URL from environment
      const baseUrl = import.meta.env.VITE_BASE_URL;
      console.log('Making direct API call to:', baseUrl);
      
      const axiosInstance = axios.create({
        baseURL: baseUrl,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken || 'local-development-mock-token'}`
        }
      });
      
      const response = await axiosInstance.get('/api/Assessment/initialize');
      setApiResponse(response.data as Record<string, unknown>);
      console.log('✅ Direct API call successful:', response.data);
    } catch (err) {
      console.error('❌ Direct API call failed:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Run initialization on component mount
  useEffect(() => {
    testInitializeApi();
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>API Authentication Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Environment Variables</h3>
        <div style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {value}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Authentication Status</h3>
        <p>Is Authenticated: <strong>{isAuthenticated ? 'Yes' : 'No'}</strong></p>
        <p>API Initialized: <strong>{apiInitialized ? 'Yes' : 'No'}</strong></p>
        <p>Access Token: <code style={{ wordBreak: 'break-all' }}>{accessToken || 'No token'}</code></p>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button 
          onClick={testInitializeApi} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: '#4caf50', color: 'white', border: 'none' }}
        >
          Initialize API
        </button>
        <button 
          onClick={testDirectApiCall} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer', backgroundColor: '#2196f3', color: 'white', border: 'none' }}
        >
          Direct API Call
        </button>
        <button 
          onClick={testSolarApi} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Solar API
        </button>
        <button 
          onClick={testWindApi} 
          disabled={loading}
          style={{ padding: '8px 16px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          Test Wind API
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', borderRadius: '4px', marginBottom: '20px' }}>
          <h3 style={{ color: '#c62828', margin: '0 0 10px 0' }}>Error</h3>
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}
      
      {apiResponse && (
        <div style={{ padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
          <h3 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>API Response</h3>
          <pre style={{ margin: 0, overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
