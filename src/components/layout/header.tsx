
'use client';

import Link from 'next/link';
import { 
  Lightbulb, Home, Compass, ChefHat, ClipboardEdit, Menu, Edit, Youtube as YoutubeIcon, 
  BookOpenText, Calculator, Settings2, LightbulbIcon as HangoutIcon, DraftingCompass, Music, Brain, 
  Link as LinkLucideIcon, UserCircle, LogOut, LogIn, UserPlus, LayoutDashboard
} from 'lucide-react';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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


  const UserAvatar = () => {
    if (!user) return null;
    const initial = user.email ? user.email.charAt(0).toUpperCase() : <UserCircle className="h-5 w-5" />;
    return (
      <Avatar className="h-8 w-8">
        {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || user.email || 'User'} />}
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
    );
  }


  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Lightbulb className="h-8 w-8 text-primary group-hover:animate-pulse" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary tracking-tight">Beautiful Ideas</h1>
        </Link>

        <div className="flex items-center gap-2">
          {isClient && !loading && (
            <>
              {user ? (
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                        <UserAvatar />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.displayName || user.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                        </Link>
                      </DropdownMenuItem>
                       <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}
          {loading && isClient && <div className="h-10 w-20 animate-pulse bg-muted rounded-md hidden sm:block"></div> }


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
                  <hr className="my-4"/>
                  {isClient && !loading && !user && (
                    <>
                      <SheetClose asChild>
                        <Link
                          href="/login"
                          className="flex items-center gap-3 py-3 px-2 text-lg font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <LogIn className="h-5 w-5 text-primary/80"/> Login
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                         <Link
                          href="/signup"
                          className="flex items-center gap-3 py-3 px-2 text-lg font-medium text-foreground hover:text-primary hover:bg-accent rounded-md transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <UserPlus className="h-5 w-5 text-primary/80"/> Sign Up
                        </Link>
                      </SheetClose>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
