import React from "react";
import Image from "next/image";
import google from "../../../../../../public/google.svg";

interface GoogleLoadingScreenProps {
  isVisible?: boolean;
  step?: LoadingStep;
  customMessage?: string;
}

type StepState = "complete" | "current" | "pending";
type LoadingStep = "connecting" | "authorizing" | "fetching" | "training";

interface StepProps {
  label: string;
  state: StepState;
}

interface StepStateConfig {
  icon: React.ReactNode;
  line: string;
  text: string;
}

const getStepStates = (currentStep: LoadingStep): Record<string, StepState> => {
  const steps = ["connecting", "authorizing", "fetching", "training"];
  const currentIndex = steps.indexOf(currentStep);

  return {
    connecting:
      currentIndex === 0
        ? "current"
        : currentIndex > 0
        ? "complete"
        : "pending",
    authorizing:
      currentIndex === 1
        ? "current"
        : currentIndex > 1
        ? "complete"
        : "pending",
    fetching:
      currentIndex === 2
        ? "current"
        : currentIndex > 2
        ? "complete"
        : "pending",
    training: currentIndex === 3 ? "current" : "pending",
  };
};

const getLoadingText = (
  step: LoadingStep
): { title: string; description: string } => {
  const texts = {
    connecting: {
      title: "Connecting to Google",
      description: "Please complete the authorization in the popup window",
    },
    authorizing: {
      title: "Authorizing Access",
      description: "Establishing secure connection with Google Drive",
    },
    fetching: {
      title: "Fetching Your Files",
      description: "Retrieving your Google Docs and files",
    },
    training: {
      title: "Training Chatbot",
      description: "Processing selected files for your chatbot",
    },
  };

  return texts[step];
};

const GoogleLoadingScreen: React.FC<GoogleLoadingScreenProps> = ({
  isVisible = false,
  step = "connecting",
  customMessage,
}) => {
  if (!isVisible) return null;

  const stepStates = getStepStates(step);
  const { title, description } = getLoadingText(step);

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-xl shadow-lg border border-border w-full max-w-sm mx-4">
        <div className="space-y-6">
          {/* Google Logo Animation */}
          <div className="flex justify-center">
            <div className="relative w-20 h-20">
              {/* Rainbow spinner effect */}
              <div className="absolute inset-0">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #4285F4, #DB4437, #F4B400, #0F9D58, #4285F4)",
                    animation: "spin 2s linear infinite",
                    clipPath: "circle(50% at center)",
                  }}
                />
              </div>
              {/* White background for logo */}
              <div className="absolute inset-2 bg-card rounded-full" />
              {/* Static logo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src={google}
                  alt="Google Logo"
                  width={32}
                  height={32}
                  className="relative z-10"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Loading Text */}
          <div className="space-y-2 text-center">
            <h3 className="text-xl font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">
              {customMessage || description}
            </p>
          </div>

          {/* Loading Steps */}
          <div className="space-y-3">
            <Step
              label="Initializing connection"
              state={stepStates.connecting}
            />
            <Step
              label="Waiting for authorization"
              state={stepStates.authorizing}
            />
            <Step label="Fetching your files" state={stepStates.fetching} />
            <Step
              label="Training with selected files"
              state={stepStates.training}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const Step: React.FC<StepProps> = ({ label, state }) => {
  const states: Record<StepState, StepStateConfig> = {
    complete: {
      icon: (
        <svg
          className="w-4 h-4 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
      line: "bg-green-500",
      text: "text-muted-foreground",
    },
    current: {
      icon: (
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{
            background:
              "conic-gradient(from 0deg, #4285F4, #DB4437, #F4B400, #0F9D58, #4285F4)",
          }}
        />
      ),
      line: "bg-border",
      text: "text-foreground font-medium",
    },
    pending: {
      icon: <div className="w-2 h-2 bg-muted rounded-full" />,
      line: "bg-border",
      text: "text-muted-foreground",
    },
  };

  return (
    <div className="flex items-center">
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-card border border-border">
        {states[state].icon}
      </div>
      <div className={`flex-1 ml-4 ${states[state].text}`}>{label}</div>
    </div>
  );
};

// Add keyframes for the animation
const styles = `
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

// Add the styles to the document
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default GoogleLoadingScreen;
