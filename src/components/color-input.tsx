import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ColorInput: React.FC<ColorInputProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <div className="w-4 h-4 rounded" style={{ backgroundColor: value }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-0 bg-transparent p-0 focus:outline-none focus:ring-0 w-[70px] text-sm"
          placeholder="#000000"
        />
      </div>
      {isMounted && (
        <Input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      )}
      <div className="w-full h-10 rounded-md border border-input bg-background" />
    </div>
  );
};

export default ColorInput;
