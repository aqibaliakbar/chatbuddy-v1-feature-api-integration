"use client";

import React from "react";
const baseUrl = process.env.NEXT_PUBLIC_CHATBUDDY_CHATBOT_URL;
type ChatbotIframeProps = {
  userId: string;
  chatbotId: string;
};
const ChatbotIframe: React.FC<ChatbotIframeProps> = ({ userId, chatbotId }) => {
  return (
    <>
      <iframe
        id="chatbuddyIframe"
        className="chatbuddy"
        allow="microphone;"
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "22px",
          border: "none",
          overflow: "hidden",
          transition: "all 0.3s ease",
        }}
        scrolling="no"
        src={`http://localhost:3001?user_id=${userId}&chatbot_id=${chatbotId}&isFromChatbuddy=true`}
      ></iframe>
    </>
  );
};

export default ChatbotIframe;
