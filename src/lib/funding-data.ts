export type FeedSource = {
  label: string;
  url: string;
};

export type FundingItem = {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
  summary?: string;
};

export const scholarshipRssSources: FeedSource[] = [
  {
    label: 'Scholarships.com RSS',
    url: 'https://www.scholarships.com/rss',
  },
  {
    label: 'CollegeScholarships.org RSS',
    url: 'https://www.collegescholarships.org/rss/scholarships.xml',
  },
];

export const grantsRssSources: FeedSource[] = [
  {
    label: 'Grants.gov New Opportunities',
    url: 'https://www.grants.gov/rss/GG_NewOppByCategory.xml',
  },
  {
    label: 'Grants.gov Modified Opportunities',
    url: 'https://www.grants.gov/rss/GG_OppModByCategory.xml',
  },
];

export const usaspendingApiBase = 'https://api.usaspending.gov/api/v2';

export const FALLBACK_SCHOLARSHIP_LINKS: FundingItem[] = [
  {
    title: 'Federal Student Aid - Scholarships and Grants Guide',
    link: 'https://studentaid.gov/understand-aid/types/scholarships',
    source: 'Federal Student Aid',
    summary: 'Official U.S. guidance for finding scholarship and grant aid options.',
  },
  {
    title: 'College Board BigFuture Scholarship Search',
    link: 'https://bigfuture.collegeboard.org/pay-for-college/scholarship-search',
    source: 'College Board',
    summary: 'Major scholarship directory with search filters and eligibility information.',
  },
];
