import React, { useEffect } from 'react';
import { Loader } from 'lucide-react';

const InstagramCallback: React.FC = () => {
  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');

    if (error) {
      // Send error to parent window
      window.opener?.postMessage({
        type: 'INSTAGRAM_OAUTH_ERROR',
        error: errorDescription || error
      }, window.location.origin);
    } else if (code) {
      // Send success to parent window
      window.opener?.postMessage({
        type: 'INSTAGRAM_OAUTH_SUCCESS',
        code: code
      }, window.location.origin);
    } else {
      // No code or error - something went wrong
      window.opener?.postMessage({
        type: 'INSTAGRAM_OAUTH_ERROR',
        error: 'No authorization code received'
      }, window.location.origin);
    }

    // Close the popup
    window.close();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="text-center">
        <Loader className="animate-spin h-8 w-8 text-blue-400 mx-auto mb-4" />
        <h2 className="text-xl font-medium text-white mb-2">Connecting Instagram...</h2>
        <p className="text-gray-400">Please wait while we complete the connection.</p>
      </div>
    </div>
  );
};

export default InstagramCallback;
