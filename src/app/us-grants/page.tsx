import Link from 'next/link';
import { ExternalLink, Landmark, Clock3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getLatestGrants } from '@/lib/funding-live';

export const dynamic = 'force-dynamic';

export default async function UsGrantsPage() {
  const grants = await getLatestGrants();

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <Landmark className="mt-1 h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">US Grant Website</h1>
            <p className="mt-2 text-muted-foreground">
              Live grant data from real sources: Grants.gov RSS feeds and the USAspending.gov API.
              Confirm final requirements in each funding notice before applying.
            </p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              Updated on request: {new Date().toUTCString()}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {grants.map((item) => (
          <Card key={`${item.source}-${item.link}-${item.title}`} className="flex h-full flex-col">
            <CardHeader>
              <Badge className="w-fit">U.S. Grant</Badge>
              <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
              <CardDescription>{item.source}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {item.publishedAt ? (
                <p>
                  <span className="font-medium text-foreground">Published:</span> {item.publishedAt}
                </p>
              ) : null}
              {item.summary ? <p>{item.summary}</p> : null}
            </CardContent>
            <CardFooter className="mt-auto">
              <Button asChild variant="outline" className="w-full">
                <Link href={item.link} target="_blank" rel="noreferrer">
                  Open Source <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
