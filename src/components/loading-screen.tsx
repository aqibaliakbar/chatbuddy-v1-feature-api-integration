"use client";

import Image from "next/image";
import logo from "../../public/logo.svg";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-background"
      style={{
        perspective: "1000px",
      }}
    >
      <div className="relative flex flex-col items-center">
        <div className="absolute -inset-4 z-0">
          <div className="absolute inset-0 animate-ping-slow rounded-full border border-primary/20" />
          <div
            className="absolute inset-0 animate-ping-slower rounded-full border border-primary/10"
            style={{ animationDelay: "-0.5s" }}
          />
          <div
            className="absolute inset-0 animate-ping-slowest rounded-full border border-primary/5"
            style={{ animationDelay: "-1s" }}
          />
        </div>

        <div className="relative z-10 animate-float">
          <div className="relative transform-gpu animate-spin-slow">
            <Image
              src={logo}
              alt="Loading..."
              width={50}
              height={50}
              className="dark:invert rounded-lg shadow-lg"
              priority
            />
            <div className="absolute inset-0 rounded-lg bg-primary/10 blur-sm" />
          </div>
        </div>

        <div className="mt-8 overflow-hidden">
          <p className="animate-fade-up text-sm font-medium text-muted-foreground">
            Loading
            <span className="animate-ellipsis">.</span>
            <span
              className="animate-ellipsis"
              style={{ animationDelay: "0.2s" }}
            >
              .
            </span>
            <span
              className="animate-ellipsis"
              style={{ animationDelay: "0.4s" }}
            >
              .
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
