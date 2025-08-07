import React from "react";
import "./TextAreaInput.css";

const TextAreaInput = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="dark-textarea-wrapper">
      {label && <label className="dark-textarea-label">{label}</label>}
      <textarea
        className="dark-textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={20}
        cols={20}
      />
    </div>
  );
};

export default TextAreaInput;

