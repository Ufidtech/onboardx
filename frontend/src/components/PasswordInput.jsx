import { useState } from "react";

export default function PasswordInput({ value, onChange, ...props }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        className="mt-1 w-full rounded-lg border border-gray-300 p-2 pr-16 text-sm"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-2 top-1/2 -translate-y-1/2 mt-0.5 text-xs text-teal-deep"
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}
