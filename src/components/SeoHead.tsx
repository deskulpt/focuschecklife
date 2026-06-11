import { Helmet } from 'react-helmet-async';

interface SeoHeadProps {
  title: string;
  description: string;
  path: string; // route path starting with "/"
  ogType?: 'website' | 'article';
  jsonLd?: object | object[];
}

const SITE_URL = 'https://focuscheck.life';
const OG_IMAGE = `${SITE_URL}/og-cover.jpg`;

export const SeoHead = ({ title, description, path, ogType = 'website', jsonLd }: SeoHeadProps) => {
  const url = `${SITE_URL}${path === '/' ? '/' : path}`;
  const schemas = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={OG_IMAGE} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(s)}</script>
      ))}
    </Helmet>
  );
};
