"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/providers/ToastProvider";

export default function AdminCopyButton({ value, label = "Copy phone number" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`"${value}" copied to clipboard!`, "COPIED");
      window.setTimeout(() => setCopied(false), 1600);
    } catch { setCopied(false); }
  };
  return <button type="button" onClick={copy} aria-label={copied ? "Copied" : label} title={copied ? "Copied" : label} className="inline-flex shrink-0 rounded-md p-1 text-[#D8B46A] transition hover:bg-[#D8B46A]/15 hover:text-[#942E3A]">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button>;
}
