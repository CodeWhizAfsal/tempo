"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Clipboard, Share2, Save } from "lucide-react";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./ui/tooltip";

interface SummaryDisplayProps {
  summary: string;
  isLoading?: boolean;
  onCopy?: () => void;
  onSave?: () => void;
  onShare?: () => void;
}

const SummaryDisplay = ({
  summary = "",
  isLoading = false,
  onCopy = () => {
    navigator.clipboard.writeText(summary);
  },
  onSave = () => console.log("Saving summary"),
  onShare = () => console.log("Sharing summary"),
}: SummaryDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-card border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[85%]" />
          </div>
        ) : summary ? (
          <div className="text-base leading-relaxed whitespace-pre-wrap">
            {summary}
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            Record your voice to generate a summary
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!summary || isLoading}
              >
                <Clipboard className="h-4 w-4 mr-2" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy summary to clipboard</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onSave}
                disabled={!summary || isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save summary to history</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                disabled={!summary || isLoading}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share this summary</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
};

export default SummaryDisplay;
