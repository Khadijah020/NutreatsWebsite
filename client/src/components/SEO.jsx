import { Helmet } from 'react-helmet-async';

const SEO = ({
  title = 'NuTreats - Premium Healthy Snacks & Treats',
  description = 'Shop the finest selection of healthy, nutritious treats and snacks. Organic, gluten-free, and delicious options for a better lifestyle.',
  keywords = 'healthy snacks, organic treats, nutritious food, gluten-free snacks, wellness products',
  image = 'http://localhost:5173/logo.png',
  url = 'http://localhost:5173/',
  type = 'website',
  author = 'NuTreats',
  canonicalUrl,
  schema,
  noindex = false,
  nofollow = false
}) => {
  const robots = `${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={robots} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NuTreats" />
      
      {/* Twitter Card - Optional, helps if content is shared on Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

