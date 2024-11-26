import { useEffect } from "react";
import { NEYNAR_CLIENT_ID } from "../api/config";

const FarcasterAuth = ({ onSuccess }) => {
  useEffect(() => {
    if (!NEYNAR_CLIENT_ID) {
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
        data-client_id={NEYNAR_CLIENT_ID}
        data-success-callback="onSignInSuccess"
        data-theme="dark"
      />
    </div>
  );
};

export default FarcasterAuth;
