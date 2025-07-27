
'use client';

import Link from 'next/link';
import { 
  Lightbulb, Home, Compass, ChefHat, ClipboardEdit, Menu, Edit, Youtube as YoutubeIcon, 
  BookOpenText, Calculator, Settings2, LightbulbIcon as HangoutIcon, DraftingCompass, Music, Brain, 
  Link as LinkLucideIcon
} from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const mainNavLinks = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/hangout-helper", label: "Hangout Helper", icon: <HangoutIcon className="h-5 w-5" /> },
    { href: "/meal-creator", label: "Meal Creator", icon: <ChefHat className="h-5 w-5" /> },
    { href: "/project-maker", label: "Project Maker", icon: <ClipboardEdit className="h-5 w-5" /> },
    { href: "/deal-out", label: "Deal Out Editor", icon: <Edit className="h-5 w-5" /> },
    { href: "/youtube-chat", label: "YouTube Chat", icon: <YoutubeIcon className="h-5 w-5" /> },
    { href: "/lesson-plan-maker", label: "Lesson Plan Maker", icon: <BookOpenText className="h-5 w-5" /> },
    { href: "/calculator", label: "Calculator", icon: <Calculator className="h-5 w-5" /> },
    
  ];
  
  const secondaryNavLinks = [
     { href: "/development", label: "In Development", icon: <Settings2 className="h-5 w-5" /> },
     { href: "/other-apps", label: "All Apps", icon: <Compass className="h-5 w-5" /> },
  ];

  const allNavLinks = [...mainNavLinks, ...secondaryNavLinks];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Lightbulb className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary tracking-tight">Beautiful Ideas</h1>
        </Link>

        <div className="flex items-center gap-2">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm bg-card">
              <SheetHeader className="mb-4 p-4 border-b">
                <SheetTitle className="text-xl text-primary">Navigation Menu</SheetTitle>
              </SheetHeader>
              <div className="p-6 pt-2">
                <nav className="flex flex-col gap-1">
                  {allNavLinks.sort((a,b) => a.label.localeCompare(b.label)).map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 py-3 px-2 text-lg font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {React.cloneElement(link.icon, { className: "h-5 w-5 text-primary/80"})}
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
