"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AI_MODELS, SPEED_LABELS, PROVIDER_LABELS } from "@/constants";
import { Brain, Zap, DollarSign, Clock, CheckCircle } from "lucide-react";

export function ModelsView() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-4 w-4" />
        <h3 className="font-medium">AI Models</h3>
      </div>

      {/* Model Information */}
      <div className="space-y-3">
        {AI_MODELS.map((model) => (
          <Card key={model.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ModelIcon provider={model.provider} />
                    <div>
                      <h4 className="font-medium text-sm">{model.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {PROVIDER_LABELS[model.provider]}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {SPEED_LABELS[model.speed]}
                    </Badge>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-muted-foreground">
                  {model.description}
                </p>

                {/* Tooltip/Use Case */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs font-medium text-primary">
                    {model.tooltip}
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">
                      ${model.costPer1kTokens}/1k
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-blue-500" />
                    <span className="text-muted-foreground">Tokens:</span>
                    <span className="font-medium">
                      {model.maxTokens.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Capabilities */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">
                    Capabilities:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {model.capabilities.map((capability) => (
                      <Badge
                        key={capability}
                        variant="secondary"
                        className="text-xs"
                      >
                        {capability.replace("-", " ")}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Model Comparison */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Choosing the Right Model
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">For quick scheduling:</span>
                <span className="text-muted-foreground ml-1">
                  Use GPT-3.5 Turbo or Claude Haiku
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">For complex planning:</span>
                <span className="text-muted-foreground ml-1">
                  Use GPT-4 Turbo or Claude Sonnet
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1 flex-shrink-0" />
              <div>
                <span className="font-medium">For daily productivity:</span>
                <span className="text-muted-foreground ml-1">
                  Claude Sonnet offers the best balance
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <h4 className="text-sm font-medium">💡 Pro Tips</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Switch models mid-conversation using the dropdown</p>
              <p>
                • More expensive models often provide better context
                understanding
              </p>
              <p>• Set your default model in Settings for new conversations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ModelIcon({ provider }: { provider: "openai" | "anthropic" }) {
  if (provider === "openai") {
    return (
      <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white">AI</span>
      </div>
    );
  }

  return (
    <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center">
      <span className="text-[10px] font-bold text-white">C</span>
    </div>
  );
}
