import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for Meta Tags
 * 
 * Handles page title, description, Open Graph, and Twitter Card meta tags
 */
const SEO = ({ 
  title, 
  description, 
  image, 
  url,
  type = 'website'
}) => {
  const siteName = 'BANIBS';
  const defaultImage = `${process.env.REACT_APP_BACKEND_URL || ''}/static/img/og-default.jpg`;
  const baseUrl = window.location.origin;
  
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const fullUrl = url || window.location.href;
  const ogImage = image || defaultImage;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

export default SEO;
