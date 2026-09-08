import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export function SiteHeader() {
  // Placeholder until the backend GET endpoint for the logged-in user is ready.
  const userName = 'Guest'

  return (
    <header className="bg-card">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        <img
          src="/motor-sights-international-logo.png"
          alt="Motor Sights International"
          className="h-7 w-auto"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{userName}</span>
          <Avatar>
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <Separator />
    </header>
  )
}
