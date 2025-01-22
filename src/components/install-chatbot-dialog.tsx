"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Code2, MonitorSmartphone, Share2, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import useChatbotStore from "@/store/useChatbotStore";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InstallChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedBot?: string;
}

export function InstallChatbotDialog({
  open,
  onOpenChange,
}: InstallChatbotDialogProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("javascript");
  const selectedChatbotId = useChatbotStore((state) => state.selectedChatbotId);
  const chatbots = useChatbotStore((state) => state.chatbots);

  const selectedChatbot = chatbots.find(
    (bot) =>
      bot.chatbot.id === selectedChatbotId ||
      bot.chatbot_id === selectedChatbotId
  )?.chatbot;

  const CHATBUDDY_CHATBOT_URL =
   "http://localhost:3001";
  const customDomain =
    (selectedChatbot?.public_settings as any)?.domain
      ?.custom_domain_for_script_iframe_andchatbot || CHATBUDDY_CHATBOT_URL;

  const iframeSrc = `${customDomain}?user_id=${selectedChatbot?.created_by}&chatbot_id=${selectedChatbot?.id}`;
  const jsSrc = `${customDomain}/chatbot-widget.js`;
  const jsSrcForIframe = `${customDomain}/iframe-chatbot.js`;
  const shareSrc = `${customDomain}/pages/share?user_id=${selectedChatbot?.created_by}&chatbot_id=${selectedChatbot?.id}`;

  const javascriptCode = `<script type="text/javascript">
window.chatbotBotId = '${selectedChatbot?.id}'; 
window.chatbotUserId = '${selectedChatbot?.created_by}'; 
</script>
<script type="text/javascript">
(function() {
  const script = document.createElement("script");
  script.src = "${jsSrc}";
  script.async = true;
  document.getElementsByTagName("head")[0].appendChild(script);
})();
</script>`;

  const iframeCode = `<iframe
id="chatbuddyIframe"
class="chatbuddy"
allow="microphone;"
style="width: 0; height: 0; border-radius: 22px; border: none; position: fixed; bottom: 10px; right: 15px; z-index: 9999; overflow: hidden; transition: all 0.3s ease;"
scrolling="no">
</iframe>
<script type="text/javascript">
window.chatbotBotId = '${selectedChatbot?.id}'; 
window.chatbotUserId = '${selectedChatbot?.created_by}'; 
const iframe = document.getElementById('chatbuddyIframe');
iframe.src = '${iframeSrc}';
</script>
<script src="${jsSrcForIframe}"></script>`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      description: "Copied to clipboard",
    });
  };

  const CodeBlock = ({ code }: { code: string }) => (
    <ScrollArea className="relative h-[200px] w-full rounded-md border">
      <pre className="p-4 text-sm">
        <code className="text-sm break-all whitespace-pre-wrap font-mono">
          {code}
        </code>
      </pre>
    </ScrollArea>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Install Your Chatbot</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="javascript" className="gap-2">
              <Code2 className="h-4 w-4" />
              Javascript
            </TabsTrigger>
            <TabsTrigger value="iframe" className="gap-2">
              <MonitorSmartphone className="h-4 w-4" />
              iFrame
            </TabsTrigger>
            <TabsTrigger value="share" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="javascript" className="mt-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Javascript Code Snippet</h3>
                <p className="text-sm text-muted-foreground">
                  Embed this code snippet in the head section of your website to
                  display your chatbot.
                </p>
              </div>
              <CodeBlock code={javascriptCode} />
              <Button
                className="w-full"
                onClick={() => handleCopy(javascriptCode)}
              >
                Copy Code
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="iframe" className="mt-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">iFrame Code Snippet</h3>
                <p className="text-sm text-muted-foreground">
                  Embed this code snippet in the body section of your website to
                  display your chatbot.
                </p>
              </div>
              <CodeBlock code={iframeCode} />
              <Button className="w-full" onClick={() => handleCopy(iframeCode)}>
                Copy Code
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="share" className="mt-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium">Share Your Chatbot</h3>
                <p className="text-sm text-muted-foreground">
                  Great sharing information about your business or products in a
                  conversational way.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={shareSrc}
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={() => handleCopy(shareSrc)}>
                  Copy
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 px-4 border rounded-lg">
                <span className="w-full gap-2 flex items-center">
                  <Globe className="h-4 w-4" />
                  Custom domains for iframe and chatbot
                </span>
                <Button size="sm" className="ml-4">
                  Connect
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
