"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BadgeCheck, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import business from "../../../../../public/business.svg";
import pro from "../../../../../public/pro.svg";
import startup from "../../../../../public/startup.svg";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";


const renderCellContent = (content: string | boolean) => {
  if (typeof content === "boolean") {
    return content ? (
      <Check className="h-4 w-4 mx-auto text-primary" />
    ) : (
      <X className="h-4 w-4 mx-auto text-muted-foreground" />
    );
  }
  if (content === "coming soon") {
    return <Badge variant={"outline"} className="text-sm">{content}</Badge>;
  }
  return content;
};

export default function PlansPage() {

    const { toast } = useToast();
    const [isAnnual, setIsAnnual] = useState(false);
    const [currentPlan, setCurrentPlan] = useState("pro"); 
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
      {}
    ); 

    const planFeatures = [
      "10 AI Chatbot",
      "Unlimited Training sources",
      "40K message credits /mo",
      "Latest GPT-4o Model",
      "Auto sync sources daily",
      "CommercePro",
    ];

    const plans = [
      {
        name: "Business",
        price: isAnnual ? "209€" : "299€",
        icon: business,
        features: planFeatures,
        disabledFeatures: [],
      },
      {
        name: "Pro",
        price: isAnnual ? "69€" : "99€",
        icon: pro,
        features: planFeatures,
        disabledFeatures: ["CommercePro"],
      },
      {
        name: "Startup",
        price: isAnnual ? "17€" : "24€",
        icon: startup,
        features: planFeatures,
        disabledFeatures: ["CommercePro"],
      },
    ];

    const handlePlanChange = async (planName: string) => {
    
      setLoadingStates((prev) => ({ ...prev, [planName]: true }));
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)); 

        if (!currentPlan) {
          toast({
            title: "Plan Selected",
            description: `Successfully subscribed to ${planName} plan.`,
          });
          setCurrentPlan(planName.toLowerCase());
          return;
        }

        const planRank = { business: 3, pro: 2, startup: 1 };
        
        const currentRank =
          planRank[currentPlan.toLowerCase() as keyof typeof planRank];
        const targetRank =
          planRank[planName.toLowerCase() as keyof typeof planRank];

        let action;
        if (currentRank === targetRank) {
          action = "changed";
        } else if (targetRank > currentRank) {
          action = "upgraded";
        } else {
          action = "downgraded";
        }

        toast({
          title: `Plan ${action}`,
          description:
            action === "changed"
              ? `Your subscription has been updated to ${planName}.`
              : `Successfully ${action} to ${planName} plan.`,
        });

        setCurrentPlan(planName.toLowerCase());
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to change plan. Please try again.",
        });
      } finally {
        
        setLoadingStates((prev) => ({ ...prev, [planName]: false }));
      }
    };

    const getButtonText = (planName: string, currentPlan: string | null) => {
      if (!currentPlan) return `Choose ${planName}`;

      const planRank = { business: 3, pro: 2, startup: 1 };
      const currentRank =
        planRank[currentPlan.toLowerCase() as keyof typeof planRank];
      const targetRank =
        planRank[planName.toLowerCase() as keyof typeof planRank];

      if (currentRank === targetRank) {
        return (
          <span className="flex gap-2 items-center justify-center">
            <BadgeCheck className="h-4 w-4" />
            You&apos;re on {planName}
          </span>
        );
      }

      return currentRank > targetRank
        ? `Downgrade to ${planName}`
        : `Upgrade to ${planName}`;
    };
  return (
    <div className="container max-w-7xl py-10">
      {/* Header with Switch */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold">Pricing & Plans</h1>
        <div className="flex items-center gap-2">
          <Label htmlFor="billing-toggle" className="text-sm">
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <span className="text-sm text-muted-foreground">
            Annually {isAnnual && "30%"}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPlanCurrent = plan.name.toLowerCase() === currentPlan;

          return (
            <Card
              key={plan.name}
              className={cn(isPlanCurrent && "border-primary")}
            >
              <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                   <Image src={plan.icon} alt="plan-icon" className="dark:invert" />
                    <h3 className="font-semibold">{plan.name}</h3>
                  </div>
                  <div className="text-2xl font-bold">{plan.price}</div>
                </div>

                <Button
                  variant={isPlanCurrent ? "outline" : "default"}
                  className="w-full"
                  disabled={loadingStates[plan.name] || isPlanCurrent}
                  onClick={() => handlePlanChange(plan.name)}
                >
                  {loadingStates[plan.name] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    getButtonText(plan.name, currentPlan)
                  )}
                </Button>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className={cn(
                        "flex items-center gap-2",
                        plan.disabledFeatures.includes(feature) &&
                          "text-muted-foreground"
                      )}
                    >
                      {plan.disabledFeatures.includes(feature) ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="space-y-6 pt-16">
        <h2 className="text-xl font-semibold">Compare plans</h2>
        <Table className="border-2 rounded-md border-muted p-2">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]"></TableHead>
              <TableHead className="text-center">Business</TableHead>
              <TableHead className="text-center">Pro</TableHead>
              <TableHead className="text-center">Startup</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Configuration */}
            <TableRow className="bg-muted hover:bg-muted">
              <TableCell colSpan={4} className="font-medium">
                Configuration
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Message credits (monthly)</TableCell>
              <TableCell className="text-center">40,000</TableCell>
              <TableCell className="text-center">10,000</TableCell>
              <TableCell className="text-center">3,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Chatbots</TableCell>
              <TableCell className="text-center">10 AI Chatbot</TableCell>
              <TableCell className="text-center">3 AI Chatbot</TableCell>
              <TableCell className="text-center">1 AI Chatbot</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Team members</TableCell>
              <TableCell className="text-center">
                {renderCellContent("coming soon")}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent("coming soon")}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent("coming soon")}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Embed on unlimited websites</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
            </TableRow>

            {/* Training */}
            <TableRow className="bg-muted hover:bg-muted">
              <TableCell colSpan={4} className="font-medium">
                Training
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Links to train on</TableCell>
              <TableCell className="text-center">Unlimited links</TableCell>
              <TableCell className="text-center">4000</TableCell>
              <TableCell className="text-center">500</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Auto sync sources</TableCell>
              <TableCell className="text-center">daily</TableCell>
              <TableCell className="text-center">weekly</TableCell>
              <TableCell className="text-center">monthly</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Additional training resources</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
            </TableRow>

            {/* Activity */}
            <TableRow className="bg-muted hover:bg-muted">
              <TableCell colSpan={4} className="font-medium">
                Activity
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Chat History</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Capture Leads</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(false)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Analytics</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
            </TableRow>

            {/* Integrations & API */}
            <TableRow className="bg-muted hover:bg-muted">
              <TableCell colSpan={4} className="font-medium">
                Integrations & API
              </TableCell>
            </TableRow>
            {["API access", "Wordpress", "Webflow", "Google Doc", "Slack"].map(
              (integration) => (
                <TableRow key={integration}>
                  <TableCell>{integration}</TableCell>
                  <TableCell className="text-center">
                    {renderCellContent(true)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderCellContent(true)}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderCellContent(true)}
                  </TableCell>
                </TableRow>
              )
            )}
            {["Notion", "Whatsapp", "Instagram", "Messager"].map(
              (integration) => (
                <TableRow key={integration}>
                  <TableCell>{integration}</TableCell>
                  <TableCell className="text-center">
                    {renderCellContent("coming soon")}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderCellContent("coming soon")}
                  </TableCell>
                  <TableCell className="text-center">
                    {renderCellContent("coming soon")}
                  </TableCell>
                </TableRow>
              )
            )}

            {/* Model */}
            <TableRow className="bg-muted hover:bg-muted">
              <TableCell colSpan={4} className="font-medium">
                Model
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Fast models</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Advanced OpenAI models</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
            </TableRow>

            {/* Branding */}
            <TableRow className="bg-muted hover:bg-muted">
              <TableCell colSpan={4} className="font-medium">
                Branding
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Remove &quot;Powered by Chatbuddy&quot;</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(false)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(false)}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Choose your own custom domain</TableCell>
              <TableCell className="text-center">
                {renderCellContent(true)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(false)}
              </TableCell>
              <TableCell className="text-center">
                {renderCellContent(false)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
