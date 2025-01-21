"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandInput, CommandItem } from "@/components/ui/command";
import { debounce } from "@/lib/utils";
import { CommandList, CommandSeparator } from "cmdk";
import { X, MinusCircle, XCircle } from "lucide-react";
import * as React from "react";

interface SelectedValue {
  id: string;
  name: string;
  excluded?: boolean;
}

interface MultiSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  allowExclude: boolean;
  multiple?: boolean;
  getOptions: (
    value: string,
    name: string
  ) => Promise<{ id: string; name: string }[]>;
}

export function MultiSelect({
  name,
  label,
  getOptions,
  multiple = true,
  allowExclude = true,
  searchPlaceholder = "type to search...",
}: MultiSelectProps) {
  const [selectedValues, setSelectedValues] = React.useState<SelectedValue[]>(
    []
  );
  const [options, setOptions] = React.useState<{ id: string; name: string }[]>(
    []
  );

  const setValues = (values: SelectedValue[]) => {
    if (multiple) {
      setSelectedValues(values);
    } else {
      setSelectedValues([values[0]]);
    }
    setOptions([]);
  };

  const debouncedHandleValueChange = React.useCallback(
    debounce(async (value: string) => {
      if (value) {
        const newOptions = await getOptions(value, name);
        setOptions(newOptions);
      } else {
        setOptions([]);
      }
    }, 600),
    [getOptions, name]
  );

  return (
    <div className="relative">
      <input type="hidden" name={name} value={JSON.stringify(selectedValues)} />
      {label || name}
      <Command>
        <div className="flex flex-col gap-4 text-xs">
          <CommandInput
            placeholder={searchPlaceholder}
            className="w-full"
            onValueChange={debouncedHandleValueChange}
          />
          <div className="flex flex-wrap gap-2 px-2">
            {selectedValues.map((value, index) => (
              <Badge
                key={value.id}
                variant={value.excluded ? "destructive" : "secondary"}
                className="flex items-center gap-1 px-3 py-1"
              >
                {value.excluded ? "-" : ""}
                {value.name}
                <X
                  size={14}
                  className="cursor-pointer hover:text-destructive"
                  onClick={() =>
                    setValues(selectedValues.filter((_, i) => i !== index))
                  }
                />
              </Badge>
            ))}
          </div>
          <CommandSeparator />
        </div>
        <CommandList>
          {options.slice(0, 5).map((option) => (
            <CommandItem
              className="flex items-center justify-between gap-2 pr-2"
              key={option.id}
              value={option.id}
              onSelect={() => {
                if (!selectedValues.find((value) => value.id === option.id)) {
                  setValues([...selectedValues, { ...option }]);
                }
              }}
            >
              <span className="truncate">{option.name}</span>
              {allowExclude && (
                <button className="flex-shrink-0 cursor-pointer text-muted-foreground hover:text-destructive">
                  <MinusCircle
                    size={16}
                    onSelect={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (
                        !selectedValues.find((value) => value.id === option.id)
                      ) {
                        setValues([
                          ...selectedValues,
                          { ...option, excluded: true },
                        ]);
                      }
                    }}
                  />
                </button>
              )}
            </CommandItem>
          ))}
        </CommandList>
      </Command>
    </div>
  );
}
