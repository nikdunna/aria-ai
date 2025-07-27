"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  AI_MODELS,
  SPEED_LABELS,
  PROVIDER_LABELS,
  getModelById,
} from "@/constants";
import { Brain, Zap, DollarSign, Info } from "lucide-react";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  const currentModel = getModelById(selectedModel);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="w-[280px]">
          <SelectValue placeholder="Select AI Model">
            {currentModel && (
              <div className="flex items-center gap-2">
                <ModelIcon provider={currentModel.provider} />
                <span className="font-medium">{currentModel.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {SPEED_LABELS[currentModel.speed]}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {AI_MODELS.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <ModelIcon provider={model.provider} />
                  <div>
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {PROVIDER_LABELS[model.provider]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {SPEED_LABELS[model.speed]}
                  </Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-xs">
                      <div className="space-y-2">
                        <p className="font-medium">{model.tooltip}</p>
                        <p className="text-xs">{model.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <span>${model.costPer1kTokens}/1k tokens</span>
                          <span>•</span>
                          <span>{model.maxTokens} max tokens</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentModel && (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs">
              <DollarSign className="w-3 h-3" />
              <span>${currentModel.costPer1kTokens}/1k</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Cost per 1,000 tokens</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

function ModelIcon({ provider }: { provider: "openai" | "anthropic" }) {
  if (provider === "openai") {
    return (
      <div className="w-4 h-4 rounded-sm bg-emerald-500 flex items-center justify-center">
        <span className="text-[8px] font-bold text-white">AI</span>
      </div>
    );
  }

  return (
    <div className="w-4 h-4 rounded-sm bg-orange-500 flex items-center justify-center">
      <span className="text-[8px] font-bold text-white">C</span>
    </div>
  );
}
