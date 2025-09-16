"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type DbLevel = "beginner" | "intermediate" | "advanced";
type DisplayLevel =
  | "beginner"
  | "elementary"
  | "intermediate"
  | "upper-intermediate"
  | "advanced";

export interface DifficultyLevelSelectProps {
  id?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  value: "" | DbLevel;
  onChange: (dbLevel: DbLevel) => void;
  placeholder?: string;
}

const mapDisplayToDbLevel = (display: DisplayLevel): DbLevel => {
  if (display === "beginner" || display === "elementary") return "beginner";
  if (display === "intermediate" || display === "upper-intermediate") return "intermediate";
  return "advanced";
};

const mapDbToDefaultDisplay = (dbLevel: DbLevel): DisplayLevel => {
  if (dbLevel === "beginner") return "beginner"; // default to A1
  if (dbLevel === "intermediate") return "intermediate"; // default to B1
  return "advanced"; // C1
};

export function DifficultyLevelSelect({
  id,
  label = "Difficulty Level",
  required = false,
  disabled = false,
  value,
  onChange,
  placeholder = "Level",
}: DifficultyLevelSelectProps) {
  const [displayValue, setDisplayValue] = useState<"" | DisplayLevel>("");

  useEffect(() => {
    if (!value) {
      setDisplayValue("");
      return;
    }
    setDisplayValue(mapDbToDefaultDisplay(value));
  }, [value]);

  const items = useMemo(
    () => [
      { value: "beginner", label: "Beginner (A1)" },
      { value: "elementary", label: "Elementary (A2)" },
      { value: "intermediate", label: "Intermediate (B1)" },
      { value: "upper-intermediate", label: "Upper-Intermediate (B2)" },
      { value: "advanced", label: "Advanced (C1)" },
    ] as { value: DisplayLevel; label: string }[],
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
        value={displayValue}
        onValueChange={(newDisplay) => {
          setDisplayValue(newDisplay as DisplayLevel);
          onChange(mapDisplayToDbLevel(newDisplay as DisplayLevel));
        }}
        disabled={disabled}
      >
        <SelectTrigger className="mt-1" id={id}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default DifficultyLevelSelect;


