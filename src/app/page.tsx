import Link from 'next/link';
import { ArrowRight, GraduationCap, Landmark, Rss, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background px-6 py-12 text-center md:px-10">
        <Badge variant="secondary" className="mb-4">
          Live Funding Discovery Hub
        </Badge>
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Latest Scholarships & US Grants</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground sm:text-lg">
          This website now pulls from real RSS feeds and APIs so you can find live scholarship and U.S. grant information.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
            <Rss className="h-4 w-4" /> Scholarships RSS Sources
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
            <Rss className="h-4 w-4" /> Grants.gov RSS
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1">
            <Database className="h-4 w-4" /> USAspending API
          </span>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <GraduationCap className="h-10 w-10 text-primary" />
            <CardTitle className="text-2xl">Scholarship Finder</CardTitle>
            <CardDescription>Live scholarship entries from RSS feeds with source links and publish dates.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/scholarships">
                Open Scholarships <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/30 shadow-sm">
          <CardHeader>
            <Landmark className="h-10 w-10 text-primary" />
            <CardTitle className="text-2xl">US Grant Finder</CardTitle>
            <CardDescription>Live grant entries from Grants.gov RSS and USAspending API data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/us-grants">
                Open U.S. Grants <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
