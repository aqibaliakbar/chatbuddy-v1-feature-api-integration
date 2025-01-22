import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { X } from "lucide-react";

const WhatsAppIntegration = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    businessId: "",
    phoneNumber: "",
    accessToken: "",
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    // Handle integration logic here
    setIsDialogOpen(false);
    setIsSuccessDialogOpen(true);
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4 ">
          <div className="flex items-center gap-2">
            <Image
              src="/whatsapp.svg"
              alt="WhatsApp"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-medium">WhatsApp</span>
          </div>
          <p className="text-sm text-muted-foreground">
            ChatBuddy will connect with WhatsApp to enable direct customer
            communication through this popular channel.
          </p>
          <Button className="w-full" onClick={() => setIsDialogOpen(true)}>
            Connect
          </Button>
        </CardContent>
      </Card>

      {/* Integration Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="h-[90%] sm:max-w-2xl ">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Image
                src="/whatsapp.svg"
                alt="WhatsApp"
                width={36}
                height={36}
                className="rounded-lg"
              />
              <DialogTitle>WhatsApp Business Integration</DialogTitle>
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              Integrate your WhatsApp Business account to communicate directly
              with your customers through Chatbuddy.{" "}
              <a href="#" className="text-primary hover:underline">
                Help with WhatsApp Business API
              </a>
            </div>
          </DialogHeader>

          <button
            onClick={() => setIsDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <form onSubmit={handleSubmit} className="space-y-6 mt-[-20%] 2xl:mt-[-40%]">
            <div className="space-y-2">
              <Label htmlFor="businessId">WhatsApp Business ID</Label>
              <Input
                id="businessId"
                name="businessId"
                value={formData.businessId}
                onChange={handleInputChange}
                placeholder="Enter your Business ID"
              />
              <p className="text-sm text-muted-foreground">
                Enter the Business ID of your WhatsApp Business account. You can
                find it in the settings of your Meta Business Manager under
                &quot;WhatsApp Accounts.&quot;
                <a href="#" className="text-primary hover:underline block">
                  How to find your Business ID
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
              />
              <p className="text-sm text-muted-foreground">
                Please use the international format, e.g., +1 234 567 8900.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                name="accessToken"
                value={formData.accessToken}
                onChange={handleInputChange}
                type="password"
              />
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              Start Integration
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="h-[90%] sm:max-w-2xl  flex justify-center items-center text-center  p-6">
          <div className="flex flex-col items-center gap-4 mt-[-10%]">
            <div className="relative w-24 h-24">
              <Image
                src="/wintegration.svg"
                alt="WhatsApp Integraion"
                width={500}
                height={500}
                className="rounded-lg"
              />
            </div>
            <DialogTitle className="text-2xl font-semibold sm:w-[70%]">
              Your WhatsApp integration was successful!
            </DialogTitle>
            <Button
              className="w-full sm:w-auto sm:min-w-36"
              onClick={() => setIsSuccessDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WhatsAppIntegration;
