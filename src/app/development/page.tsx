
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings2, ArrowRight, DraftingCompass, Music } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const developmentApps = [
  {
    title: "Drafting Board",
    description: "A simple 2D drafting tool for creating basic architectural plans and diagrams. Currently under development with features like grid snapping.",
    href: "/drafting-board",
    icon: <DraftingCompass className="h-8 w-8 mb-2 text-primary" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageHint: "architecture drawing blueprint",
  },
  {
    title: "Chromatic Tuner",
    description: "Tune your instruments with a chromatic tuner and generate reference tones. Pitch detection is experimental. Features QWERTY piano.",
    href: "/chromatic-tuner",
    icon: <Music className="h-8 w-8 mb-2 text-primary" />,
    imageSrc: "https://placehold.co/600x400.png",
    imageHint: "music guitar tuning",
  },
  // Add other in-development apps here
];

export default function DevelopmentPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <Settings2 className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Apps In Development
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The following applications are currently under active development or are experimental.
          Features may be incomplete, and functionality might change. Your feedback is welcome!
        </p>
      </section>

      {developmentApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {developmentApps.sort((a,b) => a.title.localeCompare(b.title)).map((app, index) => (
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
                    View App
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No applications are currently listed as in development.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
