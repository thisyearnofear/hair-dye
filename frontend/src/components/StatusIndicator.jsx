import React, { useState, useEffect } from 'react';
import { API_URL } from '../api/config';

const StatusIndicator = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.json();
        console.log('Backend status:', data);
        setIsConnected(data.status === 'healthy');
      } catch (error) {
        console.error('Backend connection failed:', error);
        setIsConnected(false);
      }
    };

    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (isConnected) return null; // Don't show anything when everything is working

  return (
    <div className="error-banner">
      <p>
        😅 Our service is taking a little break. 
        Please try again in a few moments.
      </p>
    </div>
  );
};

export default StatusIndicator; 