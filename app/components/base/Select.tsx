import { Button } from "@/components/ui/button";
import {
  Select as BaseSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import React from "react";

export function Select({
  options,
  placeholder = "Select an option...",
  name,
  label,
}: {
  options: { id: string; name: string }[];
  placeholder?: string;
  name?: string;
  label?: string;
}) {
  const [value, setValue] = React.useState<string>("");

  return (
    <div className="flex flex-col gap-2">
      {label && label}
      <BaseSelect name={name} value={value} onValueChange={setValue}>
        <SelectTrigger className="border border-b-4 shadow-none">
          <div className="flex flex-1 items-center justify-between">
            <SelectValue placeholder={placeholder} />
          </div>
          {value && (
            <X
              className="h-4 w-4 opacity-50"
              onClick={(event) => {
                event.stopPropagation();
                setValue("");
              }}
            />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={JSON.stringify(option)}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </BaseSelect>
    </div>
  );
}
