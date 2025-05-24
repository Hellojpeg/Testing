
'use client';

import Link from 'next/link';
import { PartyPopper, Home, Compass, ChefHat, ClipboardEdit, Menu, Edit, Youtube as YoutubeIcon, Music, BookOpenText } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/meal-creator", label: "Meal Creator", icon: <ChefHat className="h-5 w-5" /> },
    { href: "/project-maker", label: "Project Maker", icon: <ClipboardEdit className="h-5 w-5" /> },
    { href: "/deal-out", label: "Deal Out Editor", icon: <Edit className="h-5 w-5" /> },
    { href: "/youtube-chat", label: "YouTube Chat", icon: <YoutubeIcon className="h-5 w-5" /> },
    { href: "/chromatic-tuner", label: "Chromatic Tuner", icon: <Music className="h-5 w-5" /> },
    { href: "/lesson-plan-maker", label: "Lesson Plan Maker", icon: <BookOpenText className="h-5 w-5" /> },
    { href: "/other-apps", label: "Other Apps", icon: <Compass className="h-5 w-5" /> },
  ];

  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <PartyPopper className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary tracking-tight">Hangout Helper</h1>
        </Link>

        {/* Desktop Navigation - Always Hidden */}
        <nav className="hidden items-center gap-1 md:gap-2 lg:gap-4">
          {navLinks.map((link) => (
            <Button key={link.href} variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-primary hover:bg-accent">
              <Link href={link.href} className="flex items-center gap-1.5 py-1 px-2">
                {React.cloneElement(link.icon, { className: "h-4 w-4"})}
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>

        {/* Mobile/Hamburger Navigation - Always Visible */}
        <div>
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
                <nav className="flex flex-col gap-4">
                  {navLinks.sort((a,b) => a.label.localeCompare(b.label)).map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center gap-3 py-3 px-2 text-lg font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {React.cloneElement(link.icon, { className: "h-5 w-5 text-primary"})}
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
