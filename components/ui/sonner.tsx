<<<<<<< HEAD
"use client";
=======
"use client"
>>>>>>> 8f29b45fc1647e0a3b09df8543a8787d2627376f

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
<<<<<<< HEAD
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();
=======
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
>>>>>>> 8f29b45fc1647e0a3b09df8543a8787d2627376f

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
<<<<<<< HEAD
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
=======
>>>>>>> 8f29b45fc1647e0a3b09df8543a8787d2627376f
        } as React.CSSProperties
      }
      {...props}
    />
<<<<<<< HEAD
  );
};

export { Toaster };
=======
  )
}

export { Toaster }
>>>>>>> 8f29b45fc1647e0a3b09df8543a8787d2627376f
