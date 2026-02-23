"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-center"
      gap={6}
      duration={2000}
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-[#1C1C1C] !text-white !border-0 !rounded-full !py-2 !px-4 !min-h-0 !w-auto !max-w-[280px] !mx-auto !text-[13px] !font-medium !shadow-[0_4px_12px_rgba(0,0,0,0.15)]",
          description: "!text-white/60 !text-[12px]",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "!bg-[#2D5A3D]",
          error: "!bg-[#B5403A]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
