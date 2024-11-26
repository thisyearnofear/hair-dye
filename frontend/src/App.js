import React, { useState, useEffect } from "react";
import "./App.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead } from "wagmi";
import MusicPlayer from "./components/MusicPlayer";
import axios from "axios";
import { QRCodeSVG } from "qrcode.react";
import FarcasterAuth from "./components/FarcasterAuth";
import CastPreview from "./components/CastPreview";

// ABI for basic ERC20 balanceOf function
const tokenAbi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

function App() {
  const { isConnected, address } = useAccount();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [dyedImage, setDyedImage] = useState(null);
  const [signerData, setSignerData] = useState(null);
  const [castStatus, setCastStatus] = useState("idle");
  const [farcasterUser, setFarcasterUser] = useState(null);
  const [showCastPreview, setShowCastPreview] = useState(false);
  const [imageError, setImageError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processError, setProcessError] = useState(null);

  const { data: tokenBalance } = useContractRead({
    address: "0x34C990Ee5aA627E9304234cc59b0734163eAc06b",
    abi: tokenAbi,
    functionName: "balanceOf",
    args: [address],
    watch: true,
  });

  // Load stored signer data on mount
  useEffect(() => {
    const stored = localStorage.getItem("FARCASTER_SIGNER");
    if (stored) {
      setSignerData(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (signerData?.status === "pending_approval") {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(
            `/api/farcaster/status/${signerData.signer_uuid}`
          );
          const status = response.data.status;

          if (status === "approved") {
            const updatedData = { ...signerData, status: "approved" };
            setSignerData(updatedData);
            localStorage.setItem(
              "FARCASTER_SIGNER",
              JSON.stringify(updatedData)
            );
            clearInterval(interval);
          }
        } catch (error) {
          console.error("Error checking status:", error);
        }
      }, 2000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [signerData]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file != null) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };
  const handleDyeClick = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!tokenBalance || tokenBalance <= 0n) {
      alert("You need to own $BRUNETTE tokens to use this app!");
      return;
    }

    if (!selectedImage) {
      alert("Please select an image.");
      return;
    }

    setIsProcessing(true);
    setProcessError(null);
    const formData = new FormData();
    formData.append("color", "#000000");
    formData.append("image", selectedImage);

    try {
      const response = await fetch("/dye", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process image");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setDyedImage(imageUrl);
    } catch (error) {
      setProcessError(error.message);
      console.error("Error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTweetClick = () => {
    if (dyedImage) {
      const tweetText =
        "Once you go $brunette....(you never go back 😉) @Base Brunette Brigade FTW 💃🏾🔵✨";
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweetText
      )}&url=${encodeURIComponent(window.location.href)}`;
      window.open(tweetUrl, "_blank");
    }
  };

  const handleAuthSuccess = (data) => {
    setFarcasterUser(data);
    localStorage.setItem("FARCASTER_USER", JSON.stringify(data));
  };

  const handleCastClick = async () => {
    setShowCastPreview(true);
  };

  const handleConfirmCast = async (castText) => {
    try {
      setCastStatus("casting");
      const response = await axios.post("/api/cast", {
        signer_uuid: farcasterUser.signer_uuid,
        text: castText,
        image_url: dyedImage,
      });
      setCastStatus("success");
      setShowCastPreview(false);
    } catch (error) {
      console.error("Error casting:", error);
      setCastStatus("error");
    }
  };

  const handleImageUpload = (event) => {
    setImageError(null);
    const file = event.target.files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setImageError("Please upload an image file.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB.");
      return;
    }

    // Continue with upload...
  };

  return (
    <div className="App">
      <h1 className="sweet-title">
        <span data-text="BRUNETTEHQ">
          {"BRUNETTEHQ".split("").map((letter, index) => (
            <span key={index}>{letter}</span>
          ))}
        </span>
      </h1>

      <div className="wallet-connect-centered">
        <ConnectButton />
      </div>

      <div className="display">
        <div className="flex-item">
          <h2>✨ SELFIE 📸</h2>
          <div className="Image">
            {previewImage && (
              <img
                src={previewImage}
                alt="Selected"
                style={{ maxWidth: "300px" }}
              />
            )}
            <label className="button-4" id="selectImage">
              Select an image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </label>
          </div>
        </div>

        <div className="setting">
          <button
            className="button-30"
            id="butDye"
            onClick={handleDyeClick}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Brunettify 🪄"}
          </button>

          {processError && (
            <div className="error-banner">
              <p>{processError}</p>
              <button onClick={() => setProcessError(null)}>×</button>
            </div>
          )}
        </div>

        <div className="dyeImage">
          <h2>✨ BESTIE 👩🏻‍🦱👩🏾‍🦱</h2>
          <div className="Image">
            {dyedImage && (
              <div className="share-section">
                <img src={dyedImage} alt="Dyed" style={{ maxWidth: "300px" }} />
                <div className="share-buttons">
                  <button className="button-twitter" onClick={handleTweetClick}>
                    Share on Twitter
                  </button>
                  {!farcasterUser ? (
                    <FarcasterAuth onSuccess={handleAuthSuccess} />
                  ) : (
                    <button
                      onClick={handleCastClick}
                      disabled={castStatus === "casting"}
                      className="button-farcaster"
                    >
                      {castStatus === "casting"
                        ? "Casting..."
                        : "Share on Farcaster"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="upload-guidelines">
        <h3>For Best Results:</h3>
        <ul>
          <li>Use a clear, front-facing photo</li>
          <li>Ensure good lighting</li>
          <li>Hair should be visible and not covered</li>
          <li>Minimum image size: 256x256 pixels</li>
          <li>Maximum file size: 5MB</li>
        </ul>
        <p className="note">
          Works best with lighter hair colors, human portraits, and is not (yet)
          optimized for cartoons/pfps for v1
        </p>
      </div>

      <div className="community-links">
        <h3>$BRUNETTE(s) 💃🏾🔵</h3>
        <div className="social-links">
          <a
            href="https://x.com/buybrunette"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter 🐦
          </a>
          <a
            href="https://t.me/+q69ankgNqQI5MjIx"
            target="_blank"
            rel="noopener noreferrer"
          >
            Telegram 💬
          </a>
          <a
            href="https://www.jokerace.io/contest/base/0xc13b404de0284a86dc1e296f77462f3f89df214d"
            target="_blank"
            rel="noopener noreferrer"
          >
            RACE 🏃‍♀️
          </a>
        </div>
        <div className="contract-address">
          <p>Contract Address:</p>
          <code>0x34C990Ee5aA627E9304234cc59b0734163eAc06b</code>
        </div>
      </div>

      <footer>
        <div className="credits">
          <a
            href="https://warpcast.com/papa/0xab672d62"
            target="_blank"
            rel="noopener noreferrer"
            className="credit-link papa"
          >
            PAPA 🕺🏿
          </a>
          <a
            href="https://warpcast.com/awkquarian.eth/0x082db5fcb6150452e32ada286dfd09c3b116c636"
            target="_blank"
            rel="noopener noreferrer"
            className="credit-link mama"
          >
            MAMA 💃
          </a>
        </div>
      </footer>
      <MusicPlayer />

      {/* Approval QR Code/Link */}
      {signerData?.status === "pending_approval" && (
        <div className="approval-container">
          <h3>Approve on Farcaster</h3>
          <p>Scan QR code or click link to approve:</p>
          <QRCodeSVG
            value={signerData.signer_approval_url}
            size={256}
            level="H"
            includeMargin={true}
            bgColor="#ffffff"
            fgColor="#000000"
          />
          <a
            href={signerData.signer_approval_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open approval link
          </a>
        </div>
      )}

      {/* Success/Error Messages */}
      {castStatus === "success" && (
        <div className="success-message">Cast published successfully!</div>
      )}
      {castStatus === "error" && (
        <div className="error-message">
          Failed to publish cast. Please try again.
        </div>
      )}

      {showCastPreview && (
        <CastPreview
          imageUrl={dyedImage}
          onConfirm={handleConfirmCast}
          onCancel={() => setShowCastPreview(false)}
          isLoading={castStatus === "casting"}
          initialText="New hair, folks. Its incredible, you're gonna love it. $Brunette Brigade — unstoppable! 💪👨🏻"
        />
      )}

      {imageError && <div className="error-message">{imageError}</div>}
    </div>
  );
}

export default App;
