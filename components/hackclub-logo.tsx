import Image from "next/image"
import Link from "next/link"

interface HackClubLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
  href?: string
  className?: string
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12", 
  lg: "h-16 w-16",
  xl: "h-24 w-24"
}

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl", 
  xl: "text-4xl"
}

export function HackClubLogo({ 
  size = "md", 
  showText = true, 
  href,
  className = "" 
}: HackClubLogoProps) {
  const logoContent = (
    <div className={`flex items-center gap-4 group ${className}`}>
      <div className="relative">
        {/* Logo container with hover effects */}
        <div className="relative p-3 group-hover:scale-110 transition-all duration-300">
          <Image
            src="/hclogo.png"
            alt="HackClub"
            width={size === "sm" ? 32 : size === "md" ? 48 : size === "lg" ? 64 : 96}
            height={size === "sm" ? 32 : size === "md" ? 48 : size === "lg" ? 64 : 96}
            className={`${sizeClasses[size]} object-contain filter brightness-110`}
            priority
          />
        </div>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`${textSizeClasses[size]} font-black gradient-text tracking-tight`}>
            HackClub
          </span>
          <span className="text-sm text-muted-foreground font-medium tracking-wider uppercase">
            Recruitment
          </span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="transition-all duration-300 hover:scale-105">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
