import { useState, type CSSProperties } from "react";
import { useStore } from "../vat/store";

export function VatSlider() {
  const [isHovered, setIsHovered] = useState(false);
  const setPause = useStore((state) => state.setPause);
  const togglePause = useStore((state) => state.togglePause);

  const setProgress = useStore((state) => state.setProgress);
  const progress = useStore((state) => state.progress);
  const isPaused = useStore((state) => state.isPaused);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setPause(true);
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      setProgress(value);
    }
  };

  return (
    <div className="bottom-bar-container">
      <button onClick={togglePause} className="control-button">
        {isPaused ? "▶" : "⏸"}
      </button>

      <div className="slider-wrapper">
        <input
          id="vat-time"
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={progress}
          onChange={handleChange}
          className="timeline-slider"
          style={
            {
              "--progress-percent": `${progress * 100}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
