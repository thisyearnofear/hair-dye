import React, { useState } from "react";
import "./CastPreview.css";

const CastPreview = ({
  imageUrl,
  onConfirm,
  onCancel,
  isLoading,
  initialText = "New hair, folks. Its incredible, you're gonna love it. $Brunette Brigade — unstoppable! 💪👨🏻",
}) => {
  const [castText, setCastText] = useState(initialText);

  const handleConfirm = () => {
    onConfirm(castText); // Pass the edited text back to parent
  };

  return (
    <div className="cast-preview-overlay">
      <div className="cast-preview-modal">
        <h3>Preview Your Cast</h3>

        <div className="cast-channel">
          Casting to <span className="channel-name">/brunette-brigade</span>
        </div>

        <div className="cast-content">
          <textarea
            value={castText}
            onChange={(e) => setCastText(e.target.value)}
            className="cast-text-input"
            placeholder="Write your cast..."
            maxLength={320}
            rows={3}
          />
          <div className="character-count">{castText.length}/320</div>

          {imageUrl && (
            <div className="image-preview-container">
              <img
                src={imageUrl}
                alt="Dyed hair preview"
                className="cast-image-preview"
              />
            </div>
          )}
        </div>

        <div className="cast-actions">
          <button
            onClick={onCancel}
            className="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="confirm-button"
            disabled={isLoading}
          >
            {isLoading ? "Casting..." : "Cast Now"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CastPreview;
