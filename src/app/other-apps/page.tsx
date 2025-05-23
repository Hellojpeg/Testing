
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppWindow } from 'lucide-react';
import Image from 'next/image';

export default function OtherAppsPage() {
  return (
    <div className="space-y-12">
      <section className="text-center py-8 bg-card shadow-lg rounded-xl border">
        <AppWindow className="mx-auto h-16 w-16 text-primary mb-4" />
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
          Discover Other Apps
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          This is a place for new and exciting applications and features. Explore what's available or coming soon!
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "Awesome App 1", description: "A brief description of what this fantastic app does.", hint: "innovation tech" },
          { title: "Feature Showcase B", description: "Discover the power of this upcoming feature.", hint: "creative solution" },
          { title: "Utility Tool C", description: "A handy tool to make your life easier.", hint: "productivity tools" },
        ].map((item, index) => (
          <Card key={index} className="shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border">
            <CardHeader>
              <CardTitle className="text-2xl">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Image
                src={`https://placehold.co/600x400.png`}
                alt={`Placeholder for ${item.title}`}
                data-ai-hint={item.hint}
                width={600}
                height={400}
                className="mb-4 rounded-md aspect-video object-cover"
              />
              <p className="text-muted-foreground text-sm">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
