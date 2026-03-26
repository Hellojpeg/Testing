'use client';

import Link from 'next/link';
import { GraduationCap, Home, Landmark, Menu } from 'lucide-react';
import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: <Home className="h-5 w-5" /> },
    { href: '/scholarships', label: 'Scholarships', icon: <GraduationCap className="h-5 w-5" /> },
    { href: '/us-grants', label: 'US Grants', icon: <Landmark className="h-5 w-5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">Funding Finder USA</h1>
        </Link>

        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-xs bg-card sm:max-w-sm">
            <SheetHeader className="mb-4 border-b p-4">
              <SheetTitle className="text-xl text-primary">Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="p-6 pt-2">
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <SheetClose key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="flex items-center gap-3 rounded-md px-2 py-3 text-lg font-medium text-foreground transition-colors hover:bg-accent hover:text-primary"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {React.cloneElement(link.icon, { className: 'h-5 w-5 text-primary/80' })}
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
