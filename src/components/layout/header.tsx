
import Link from 'next/link';
import { PartyPopper, Home, Compass, ChefHat, ClipboardEdit } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <PartyPopper className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-3xl font-bold text-primary tracking-tight">Hangout Helper</h1>
        </Link>
        <nav className="flex items-center gap-1 md:gap-4 flex-wrap justify-end">
          <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-accent">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link href="/meal-creator" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-accent">
            <ChefHat className="h-4 w-4" />
            Meal Creator
          </Link>
          <Link href="/project-maker" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-accent">
            <ClipboardEdit className="h-4 w-4" />
            Project Maker
          </Link>
          <Link href="/other-apps" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-accent">
            <Compass className="h-4 w-4" />
            Other Apps
          </Link>
        </nav>
      </div>
    </header>
  );
}
