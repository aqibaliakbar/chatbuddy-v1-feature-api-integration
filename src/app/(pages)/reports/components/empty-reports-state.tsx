import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, MessageCircle, Users, Globe } from "lucide-react";

const ReportsEmptyState = () => {
  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Reports</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-4">
        {/* Message Credits Preview Card */}
        <Card className="p-6 opacity-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-primary">Message Credits</p>
              <h3 className="text-2xl font-bold mt-6">--</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Start chatting to see credits usage
              </p>
            </div>
          </div>
        </Card>

        {/* Conversations Preview Card */}
        <Card className="p-6 opacity-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-primary">Conversations</p>
              <h3 className="text-2xl font-bold mt-6">--</h3>
              <p className="text-xs text-muted-foreground mt-1">
                No conversations yet
              </p>
            </div>
          </div>
        </Card>

        {/* Visitors Preview Card */}
        <Card className="p-6 opacity-50">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-primary">Visitors</p>
              <h3 className="text-2xl font-bold mt-6">--</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Waiting for first visitor
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center mt-12 px-4">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <BarChart3 className="h-12 w-12 text-primary" />
        </div>

        <h3 className="text-lg font-semibold mb-2">No data to report yet</h3>

        <p className="text-muted-foreground text-center max-w-sm mb-8">
          Your reports will appear here once your chatbot starts interacting
          with visitors. Add your chatbot to your website to begin collecting
          data.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4 max-w-2xl">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-primary/5 p-3 rounded-full">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Conversations</p>
            <p className="text-sm text-muted-foreground">
              Track chat interactions
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-primary/5 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Visitor Analytics</p>
            <p className="text-sm text-muted-foreground">
              Monitor user engagement
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <div className="bg-primary/5 p-3 rounded-full">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">Global Reach</p>
            <p className="text-sm text-muted-foreground">
              View visitor locations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsEmptyState;
