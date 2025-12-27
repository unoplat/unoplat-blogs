"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type AvatarSize = "sm" | "md" | "lg"

interface AuthorAvatarProps {
  src?: string
  name: string
  size?: AvatarSize
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-7",
  md: "size-16",
  lg: "size-20",
}

const fallbackTextClasses: Record<AvatarSize, string> = {
  sm: "text-xs",
  md: "text-lg",
  lg: "text-2xl",
}

export function AuthorAvatar({ src, name, size = "md", className }: AuthorAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], "border border-border/60", className)}>
      {src ? <AvatarImage src={src} alt={`${name}'s avatar`} /> : null}
      <AvatarFallback
        className={cn(
          "bg-primary/10 text-primary font-semibold",
          fallbackTextClasses[size]
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
