"use client";

import { Badge } from "@/components/ui/badge";
import React from "react";
import { Input } from "@/components/ui/input";

export default function InputLabels({ labels }: { labels: string[] }) {
  return (
    <div>
      {labels.map((label) => (
        <Badge key={label} className="w-fit">
          <Input value={label}> {label} </Input>
        </Badge>
      ))}
    </div>
  );
}
