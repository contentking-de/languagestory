"use client";

import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CefrDifficultySelectProps {
  id?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value: number; // 1..5
  onChange: (level: number) => void;
  placeholder?: string;
}

export default function CefrDifficultySelect({
  id,
  label = "Difficulty Level",
  required = false,
  disabled = false,
  value,
  onChange,
  placeholder = "Select difficulty",
}: CefrDifficultySelectProps) {
  const items = useMemo(
    () => [
      { value: 1, label: "Beginner (A1)" },
      { value: 2, label: "Elementary (A2)" },
      { value: 3, label: "Intermediate (B1)" },
      { value: 4, label: "Upper-Intermediate (B2)" },
      { value: 5, label: "Advanced (C1)" },
    ],
    []
  );

  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required ? " *" : ""}
        </Label>
      )}
      <Select
        value={value ? String(value) : ""}
        onValueChange={(newVal) => onChange(parseInt(newVal))}
        disabled={disabled}
      >
        <SelectTrigger className="mt-1" id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


