import React, { useState, useEffect } from "react";
import "../App.css";

const MusicPlayer = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [currentTrack, setCurrentTrack] = useState(1);
  const baseTrackUrl = "https://futuretape.xyz/embed/search/sara%20phillips";

  useEffect(() => {
    // Load random track on mount
    setCurrentTrack(Math.floor(Math.random() * 6) + 1);
  }, []);

  const togglePlayer = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="music-player-container">
      <div
        className={`music-player ${isMinimized ? "minimized" : "expanded"}`}
        style={{ height: isMinimized ? "40px" : "100px" }}
      >
        <iframe
          src={`${baseTrackUrl}?start=${currentTrack}&autoplay=1`}
          width="100%"
          height="300"
          frameBorder="0"
          allow="autoplay; clipboard-write;"
          loading="lazy"
          title="music-player"
        />
      </div>
      <button className="toggle-button" onClick={togglePlayer}>
        {isMinimized ? "▲" : "▼"}
      </button>
    </div>
  );
};

export default MusicPlayer;
