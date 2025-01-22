"use client";
import { withAuth } from "@/lib/withAuth";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  ChevronRight,
  Circle,
  Hand,
  Link,
  LineChart,
  SquareArrowOutUpRight,
  Users,
  ChartColumnBig,
} from "lucide-react";
import appearance from "../../../../public/acc1.svg";
import datasources from "../../../../public/acc2.svg";
import instructions from "../../../../public/acc3.svg";
import iphone from "../../../../public/iPhone.svg";
import google from "../../../../public/googleplay.svg";
import app from "../../../../public/appstore.svg";
import reports from "../../../../public/reports.svg";
import leads from "../../../../public/leads.svg";
import hand from "../../../../public/hand1.svg";
import Image from "next/image";
import useAuthStore from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

function Home() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);
  const username = session?.user?.user_metadata?.name || session?.user?.email || "Username";
  const [activeSection, setActiveSection] = useState<string | null>(
    "personalize"
  );

  const images = {
    feed: { src: datasources, alt: "Data Sources" },
    personalize: { src: appearance, alt: "Appearance" },
    role: { src: instructions, alt: "Instructions" },
  };

  const handleNavigation = {
    addDataSources: () => router.push("/knowledge"),
    customize: () => router.push("/appearance"),
    setInstructions: () => router.push("/general-settings/instructions"),
    googlePlay: () =>
      window.open(
        "https://play.google.com/store/apps/details?id=your.app.id",
        "_blank"
      ),
    appStore: () =>
      window.open("https://apps.apple.com/app/your.app.id", "_blank"),
    reports: () => router.push("/reports"),
    leads: () => router.push("/leads"),
  };

  return (
    <div className="bg-cmuted lg:h-[calc(100vh-4.6rem)]">
      <div className="p-6 pt-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-semibold">Hi {username}</h1>
          <Image
            src={hand}
            alt="wave - user"
            width={50}
            height={50}
            className="dark:invert"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* First Card - Accordion */}
          <Card className="col-span-full">
            <CardContent className="p-6">
              <div className="relative flex gap-6">
                <div className="flex-1">
                  <Accordion
                    type="single"
                    defaultValue="personalize"
                    className="w-full"
                    onValueChange={setActiveSection}
                  >
                    <AccordionItem value="feed" className="border-b">
                      <AccordionTrigger className="hover:no-underline py-4 px-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400 line-through">
                            Feed Your Chatbot with Knowledge
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 px-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground ">
                            Train your chatbot with at least 10 sources, such as
                            links, data, or documents. This ensures ChatBuddy
                            has enough information about your business to handle
                            customer inquiries effectively.
                          </p>
                          <Button onClick={handleNavigation.addDataSources}>
                            Add Data Sources
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="personalize" className="border-b">
                      <AccordionTrigger className="hover:no-underline py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Circle className="h-5 w-5" />
                          <span>Personalize Your Chatbot</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 px-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Make your chatbot truly yours! Customize its design
                            and style to perfectly match your brand.
                          </p>
                          <Button onClick={handleNavigation.customize}>
                            Customize
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="role" className="border-b">
                      <AccordionTrigger className="hover:no-underline py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Circle className="h-5 w-5" />
                          <span>Define Your Chatbot&apos;s Role</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-4 px-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">
                            Provide clear instructions and assign a role to your
                            chatbot. Specify what tasks it should perform and
                            how it can assist your customers.
                          </p>
                          <Button onClick={handleNavigation.setInstructions}>
                            Set Instructions
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="hidden lg:block w-[500px] flex-shrink-0">
                  <div className="sticky top-6">
                    {activeSection && (
                      <Image
                        src={images[activeSection as keyof typeof images].src}
                        alt={images[activeSection as keyof typeof images].alt}
                        width={600}
                        height={400}
                        priority
                        className="rounded-xl "
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Second Card - Download App */}
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold max-w-36">
                  Download our mobile APP
                </h2>
                <div className="flex flex-col gap-2">
                  <Image
                    src={google}
                    alt="Get it on Google Play"
                    width={150}
                    height={36}
                    onClick={handleNavigation.googlePlay}
                    className="cursor-pointer hover:opacity-75"
                  />
                  <Image
                    src={app}
                    alt="Download on the App Store"
                    width={150}
                    height={36}
                    onClick={handleNavigation.appStore}
                    className="cursor-pointer hover:opacity-75"
                  />
                </div>
              </div>
              <Image
                src={iphone}
                alt="Mobile App"
                className="absolute top-0 right-0 w-48 md:h-[374px] object-contain "
                width={292}
                height={374}
              />
            </CardContent>
          </Card>

          {/* Third Card - Reports */}
          <Card className="relative h-[310px] overflow-hidden">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Reports</h2>
                  <ChartColumnBig className="h-5 w-5 text-muted-foreground" />
                </div>
                <Button
                  variant="outline"
                  className="text-sm flex items-center gap-1 h-8"
                  onClick={handleNavigation.reports}
                >
                  see reports <SquareArrowOutUpRight className="h-2 w-2" />
                </Button>
                <div>
                  <Image
                    src={reports}
                    alt="Reports Preview"
                    width={300}
                    height={100}
                    className="rounded-lg w-[400px] h-[200px] pt-2 right-0  bottom-[-4px] dark:invert absolute"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fourth Card - Collect Leads */}
          <Card className="relative h-[310px]">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Collect leads</h2>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <Button
                  variant="outline"
                  className="text-sm  hover:no-underline p-4 h-8"
                >
                  Customize Lead-form{" "}
                  <SquareArrowOutUpRight className="h-2 w-2" />
                </Button>
                <div>
                  <Image
                    src={leads}
                    alt="Lead form preview"
                    width={300}
                    height={100}
                    className="absolute rounded-lg dark:invert w-[400px]  h-[320px] pt-32  bottom-0 right-0 "
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Home);
