import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

interface Props {
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function InputField({ label, type = "text", value, onChange, placeholder }: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col mb-3 relative">
      <label className="mb-1 font-semibold">{label}</label>
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded-md px-3 py-2 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-[70%] -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center justify-center"
        >
          {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
        </button>
      )}
    </div>
  );
}