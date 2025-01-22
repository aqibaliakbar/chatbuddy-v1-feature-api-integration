"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import iphonepro from "../../../../public/iPhonepro.svg";
import shopify from "../../../../public/shopify.svg";
import slack from "../../../../public/slack.svg";
import whatsapp from "../../../../public/whatsapp.svg";
import wordpress from "../../../../public/wordpress.svg";
import customweb from "../../../../public/customweb.svg";
import notion from "../../../../public/notion.svg";
import instagram from "../../../../public/Instagram.svg";
import googledocs from "../../../../public/googledocs.svg";
import puzzle from "../../../../public/puzzle.svg";
import googleplay from "../../../../public/googleplay.svg";
import appstore from "../../../../public/appstore.svg";
import WhatsAppIntegration from "./components/whatsapp-integration";

export default function IntegrationsPage() {
  const router = useRouter();
  const [connectedApps, setConnectedApps] = useState<Record<string, boolean>>(
    {}
  );

  const handleIntegrationClick = (appName: string) => {
    if (connectedApps[appName]) {
      router.push(`/add-sources/${appName.toLowerCase()}`);
    } else {
      setConnectedApps((prev) => ({
        ...prev,
        [appName]: true,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-cmuted p-4 sm:p-6">
      <div className="space-y-6 sm:space-y-8 max-w-6xl mx-auto mb-10 sm:mb-20">
        {/* Header */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-semibold">
            Your Integration Hub
          </h1>
          <Image
            src={puzzle}
            alt="puzzle"
            width={32}
            height={32}
            className="rounded-lg dark:invert"
          />
        </div>

        {/* Mobile App Download Banner */}
        <Card className="bg-[#1E1E1E] text-white overflow-hidden">
          <CardContent className="p-6 sm:px-8 md:px-20">
            <div className="flex flex-col md:flex-row justify-between relative min-h-[300px] md:min-h-[373px]">
              <div className="space-y-6 sm:space-y-8 max-w-[600px] z-10 ">
                <h2 className="text-2xl sm:text-3xl font-semibold pt-4 md:pt-[120px]">
                  Download our mobile APP
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <Image
                    src={googleplay}
                    alt="Get it on Google Play"
                    width={167}
                    height={51}
                    className="w-40 sm:w-auto"
                  />
                  <Image
                    src={appstore}
                    alt="Download on the App Store"
                    width={167}
                    height={51}
                    className="w-40 sm:w-auto"
                  />
                </div>
              </div>
              <div className="absolute right-[-20px] md:right-0 bottom-[-20px] md:top-[60px] w-[200px] md:w-auto opacity-50 md:opacity-100">
                <Image
                  src={iphonepro}
                  alt="Mobile App Preview"
                  width={244}
                  height={500}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Social Media Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Connect with Social Media
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={slack}
                    alt="Slack"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">Slack</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Integrate Slack to receive notifications about ChatBuddy
                  interactions and quickly respond to customer inquiries.
                </p>
                <Button
                  variant={connectedApps["Slack"] ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleIntegrationClick("Slack")}
                >
                  {connectedApps["Slack"] ? "Settings" : "Connect"}
                </Button>
              </CardContent>
            </Card>

         <WhatsAppIntegration/>

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={instagram}
                    alt="Instagram"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">Instagram</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use ChatBuddy on Instagram to engage with your customers via
                  DM and respond to inquiries directly.
                </p>
                <Button variant="secondary" className="w-full">
                  Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* E-Commerce Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Connect with E-Commerce Apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={shopify}
                    alt="Shopify"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">Shopify</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  We&apos;ve developed a dedicated app for Shopify, allowing you
                  to seamlessly integrate your products into ChatBuddy.
                </p>
                <Button
                  variant={connectedApps["Shopify"] ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleIntegrationClick("Shopify")}
                >
                  {connectedApps["Shopify"] ? "Settings" : "Connect"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={wordpress}
                    alt="WordPress"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">WordPress</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Simply paste the link to your shop, and all products will be
                  automatically crawled and synced.
                </p>
                <Button
                  variant={connectedApps["WordPress"] ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleIntegrationClick("WordPress")}
                >
                  {connectedApps["WordPress"] ? "Settings" : "Connect"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={customweb}
                    alt="Custom Website"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">Custom Website</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter the URL of your custom website to fetch product data in
                  JSON format for integration.
                </p>
                <Button
                  variant={
                    connectedApps["Custom-Website"] ? "outline" : "default"
                  }
                  className="w-full"
                  onClick={() => handleIntegrationClick("Custom-Website")}
                >
                  {connectedApps["Custom-Website"] ? "Settings" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Apps Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">
            Use apps to train your chatbot
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={notion}
                    alt="Notion"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">Notion</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define Your Chatbot&apos;s Role. Provide clear instructions
                  and assign a role to your chatbot.
                </p>
                <Button
                  variant={connectedApps["Notion"] ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleIntegrationClick("Notion")}
                >
                  {connectedApps["Notion"] ? "Settings" : "Connect"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Image
                    src={googledocs}
                    alt="Google Docs"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="font-medium">Google Docs</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sync Google Docs with ChatBuddy to easily access important
                  documents and information for customer support.
                </p>
                <Button
                  variant={connectedApps["Google-Doc"] ? "outline" : "default"}
                  className="w-full"
                  onClick={() => handleIntegrationClick("Google-Doc")}
                >
                  {connectedApps["Google-Doc"] ? "Settings" : "Connect"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
