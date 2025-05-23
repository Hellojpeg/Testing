
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppWindow, ChefHat, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const apps = [
  { 
    title: "AI Meal Creator", 
    description: "Input your ingredients and preferences to get AI-generated meal ideas and recipes.", 
    href: "/meal-creator",
    icon: <ChefHat className="h-8 w-8 mb-2 text-primary" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageHint: "food cooking",
  },
  { 
    title: "Awesome App X", 
    description: "A brief description of what this fantastic app does.", 
    href: "#",
    icon: <AppWindow className="h-8 w-8 mb-2 text-primary" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageHint: "innovation tech",
  },
  { 
    title: "Feature Showcase Y", 
    description: "Discover the power of this upcoming feature.", 
    href: "#",
    icon: <AppWindow className="h-8 w-8 mb-2 text-primary" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageHint: "creative solution",
  },
];

export default function OtherAppsPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <AppWindow className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Discover Other Apps
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore other applications and tools available within this suite.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border flex flex-col">
            <CardHeader className="items-center text-center">
              {app.icon}
              <CardTitle className="text-2xl">{app.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <Image
                src={app.imageSrc}
                alt={`Placeholder for ${app.title}`}
                data-ai-hint={app.imageHint}
                width={600}
                height={400}
                className="mb-4 rounded-md aspect-video object-cover"
              />
              <CardDescription className="text-muted-foreground text-sm mb-4 flex-grow">
                {app.description}
              </CardDescription>
              <Button asChild variant="outline" className="mt-auto w-full">
                <Link href={app.href}>
                  {app.title === "AI Meal Creator" ? "Open Meal Creator" : "Learn More"} 
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
