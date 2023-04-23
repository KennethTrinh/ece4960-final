import { useState } from "react";

function Checkbox({ color, checked = false, callback = () => {} }) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleClick = () => {
    setIsChecked(!isChecked);
    callback(!isChecked);
  };

  return (
    <div
      style={{
        position: "relative",
        // left: "-10px",
        top: "3px",
        width: "20px",
        height: "20px",
        backgroundColor: isChecked ? color : "white",
        borderRadius: "3px",
        opacity: "0.8",
        border: `2px solid ${isChecked ? "rgba(255, 255, 255, 0)" : color}`,
        boxShadow: "inset 1px 1px 3px rgba(0, 0, 0, 0.1)",
        userSelect: "none",
      }}
      onClick={handleClick}
    >
      <div
        style={{
          cursor: "default",
          fontSize: "20px",
          left: "2px",
          top: "-1px",
          position: "absolute",
          color: "white",
        }}
      >
        {isChecked ? "✓" : ""}
      </div>
    </div>
  );
}

export default Checkbox;