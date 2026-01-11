import { useState, useEffect } from "react";
import "./WalkingInstructions.css";

export const WalkingInstructions = () => {
  const [showInstructions, setShowInstructions] = useState(true);
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  useEffect(() => {
    const onPointerLockChange = () => {
      const locked =
        document.pointerLockElement === document.body ||
        document.pointerLockElement === document.querySelector("canvas");
      setIsPointerLocked(locked);
      if (locked) {
        setShowInstructions(false);
      }
    };

    document.addEventListener("pointerlockchange", onPointerLockChange);
    document.addEventListener("mozpointerlockchange", onPointerLockChange);
    document.addEventListener("webkitpointerlockchange", onPointerLockChange);

    return () => {
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      document.removeEventListener("mozpointerlockchange", onPointerLockChange);
      document.removeEventListener(
        "webkitpointerlockchange",
        onPointerLockChange
      );
    };
  }, []);

  if (!showInstructions && isPointerLocked) return null;

  return (
    <div className="walking-instructions">
      <div className="instructions-content">
        <h3>🎮 Walking Controls</h3>
        <p>
          <strong>Click anywhere</strong> to start walking around the classroom
        </p>
        <div className="controls-list">
          <div>
            <strong>W/↑</strong> - Move Forward
          </div>
          <div>
            <strong>S/↓</strong> - Move Backward
          </div>
          <div>
            <strong>A/←</strong> - Move Left
          </div>
          <div>
            <strong>D/→</strong> - Move Right
          </div>
          <div>
            <strong>Mouse</strong> - Look Around
          </div>
          <div>
            <strong>ESC</strong> - Release Mouse
          </div>
        </div>
      </div>
    </div>
  );
};
