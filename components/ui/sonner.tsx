"use client";

import {
  CircleCheckIcon,
  CircleXIcon,
  InfoIcon,
  LoaderCircleIcon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "hsl(142.1 76.2% 36.3%)",
          "--success-text": "white",
          "--success-border": "hsl(142.1 76.2% 36.3%)",
          "--error-bg": "hsl(0 84.2% 60.2%)",
          "--error-text": "white",
          "--error-border": "hsl(0 84.2% 60.2%)",
          "--warning-bg": "hsl(38 92% 50%)",
          "--warning-text": "white",
          "--warning-border": "hsl(38 92% 50%)",
          "--info-bg": "hsl(221.2 83.2% 53.3%)",
          "--info-text": "white",
          "--info-border": "hsl(221.2 83.2% 53.3%)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
