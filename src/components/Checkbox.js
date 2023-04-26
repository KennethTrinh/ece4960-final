import { useState } from "react";

function Checkbox({ color, checked = false, callback = () => {}, checkable = true, label = "" }) {
  const [isChecked, setIsChecked] = useState(checked);

  const handleClick = () => {
    setIsChecked(!isChecked);
    callback(!isChecked);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center"
      }}
    >
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
        onClick={checkable? handleClick: () => {}}
      >
        <div
          style={{
            cursor: "default",
            fontSize: "20px",
            left: "0px",
            top: "0px",
            position: "relative",
            color: "white",
          }}
        >
          {isChecked ? "✓" : ""}
        </div>
      </div>
      {label && <label style={{marginLeft: "5px"}}>{label}</label>}
    </div>
  );
}

export default Checkbox;
