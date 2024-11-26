import React, { useState, useEffect } from 'react';
import { checkHealth } from '../api/health';

const StatusIndicator = () => {
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const isHealthy = await checkHealth();
      setIsError(!isHealthy);
    };

    checkStatus();
    // Check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!isError) return null; // Don't show anything when everything is working

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