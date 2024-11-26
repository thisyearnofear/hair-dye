import { useEffect } from "react";

const FarcasterAuth = ({ onSuccess }) => {
  useEffect(() => {
    if (!process.env.REACT_APP_NEYNAR_CLIENT_ID) {
      console.error("Missing Neynar Client ID!");
      return;
    }

    const script = document.createElement("script");
    script.src = "https://neynarxyz.github.io/siwn/raw/1.2.0/index.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSignInSuccess = (data) => {
      console.log("Sign-in success:", data);
      if (onSuccess) onSuccess(data);
    };

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [onSuccess]);

  return (
    <div className="farcaster-auth-container">
      <div
        className="neynar_signin"
        data-client_id={process.env.REACT_APP_NEYNAR_CLIENT_ID}
        data-success-callback="onSignInSuccess"
        data-theme="dark"
      />
    </div>
  );
};

export default FarcasterAuth;
