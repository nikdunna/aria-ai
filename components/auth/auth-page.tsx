"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, MessageSquare, Zap, Brain } from "lucide-react";
import { APP_CONFIG } from "@/constants";

export function AuthPage() {
  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/chat" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">{APP_CONFIG.name}</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {APP_CONFIG.description}. Manage your schedule through natural
            conversation with AI-powered assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="grid gap-4">
              <FeatureCard
                icon={<MessageSquare className="h-5 w-5" />}
                title="Chat-Based Scheduling"
                description="Schedule events naturally through conversation"
              />
              <FeatureCard
                icon={<Calendar className="h-5 w-5" />}
                title="Google Calendar Integration"
                description="Seamlessly sync with your existing calendar"
              />
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="AI-Powered Intelligence"
                description="Smart scheduling with conflict detection"
              />
            </div>
          </div>

          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Sign in with Google to connect your calendar and start
                scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGoogleSignIn} className="w-full" size="lg">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="mt-4 text-xs text-center text-muted-foreground">
                By signing in, you agree to connect your Google Calendar for
                scheduling features.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-card border">
      <div className="mt-0.5 text-primary">{icon}</div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
