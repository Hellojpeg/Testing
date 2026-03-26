import {
  FALLBACK_SCHOLARSHIP_LINKS,
  FundingItem,
  grantsRssSources,
  scholarshipRssSources,
  usaspendingApiBase,
} from '@/lib/funding-data';

function cleanText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? cleanText(match[1]) : '';
}

async function fetchRss(url: string): Promise<string> {
  const response = await fetch(url, {
    next: { revalidate: 60 * 30 },
    headers: {
      'User-Agent': 'FundingFinderUSA/1.0 (+https://example.com)',
      Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`RSS fetch failed (${response.status}) for ${url}`);
  }

  return response.text();
}

function parseRssItems(xml: string, source: string): FundingItem[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const parsed: FundingItem[] = [];

  for (const itemXml of items) {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');

    if (!title || !link) {
      continue;
    }

    const publishedAt = extractTag(itemXml, 'pubDate') || undefined;
    const summary = extractTag(itemXml, 'description') || undefined;

    parsed.push({
      title,
      link,
      source,
      publishedAt,
      summary,
    });
  }

  return parsed;
}

export async function getLatestScholarships(limit = 18): Promise<FundingItem[]> {
  const allItems: FundingItem[] = [];

  await Promise.all(
    scholarshipRssSources.map(async (feed) => {
      try {
        const xml = await fetchRss(feed.url);
        allItems.push(...parseRssItems(xml, feed.label));
      } catch {
        // Keep page resilient if one source fails.
      }
    })
  );

  if (allItems.length === 0) {
    return FALLBACK_SCHOLARSHIP_LINKS;
  }

  return allItems
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}

type UsaspendingAward = {
  'Award ID'?: string;
  'Recipient Name'?: string;
  'Award Amount'?: number;
  'Start Date'?: string;
  'Awarding Agency'?: string;
};

export async function getLatestGrantApiResults(limit = 12): Promise<FundingItem[]> {
  const now = new Date();
  const yearStart = `${now.getUTCFullYear()}-01-01`;
  const yearEnd = `${now.getUTCFullYear()}-12-31`;

  const response = await fetch(`${usaspendingApiBase}/search/spending_by_award/`, {
    method: 'POST',
    next: { revalidate: 60 * 30 },
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: ['Award ID', 'Recipient Name', 'Award Amount', 'Start Date', 'Awarding Agency'],
      filters: {
        award_type_codes: ['02', '03', '04', '05'],
        time_period: [{ start_date: yearStart, end_date: yearEnd }],
      },
      page: 1,
      limit,
      sort: '-Start Date',
    }),
  });

  if (!response.ok) {
    throw new Error(`USAspending API failed (${response.status})`);
  }

  const payload = (await response.json()) as { results?: UsaspendingAward[] };

  return (payload.results ?? []).map((award) => {
    const amount =
      typeof award['Award Amount'] === 'number'
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
            award['Award Amount']
          )
        : 'Amount not listed';

    const awardId = award['Award ID'] ?? 'Unknown Award ID';
    const recipient = award['Recipient Name'] ?? 'Unknown Recipient';
    const agency = award['Awarding Agency'] ?? 'Unknown Agency';

    return {
      title: `${awardId} - ${recipient}`,
      link: 'https://www.usaspending.gov/search',
      source: `USAspending API (${agency})`,
      publishedAt: award['Start Date'] ?? '',
      summary: `Award Amount: ${amount}`,
    } satisfies FundingItem;
  });
}

export async function getLatestGrants(limit = 18): Promise<FundingItem[]> {
  const rssItems: FundingItem[] = [];

  await Promise.all(
    grantsRssSources.map(async (feed) => {
      try {
        const xml = await fetchRss(feed.url);
        rssItems.push(...parseRssItems(xml, feed.label));
      } catch {
        // Keep page resilient if one source fails.
      }
    })
  );

  let apiItems: FundingItem[] = [];
  try {
    apiItems = await getLatestGrantApiResults(8);
  } catch {
    apiItems = [];
  }

  const merged = [...rssItems, ...apiItems];

  return merged
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, limit);
}
