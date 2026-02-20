import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    keywords,
    image = "https://expath.vercel.app/og-image.jpg",
    url = "https://expath.vercel.app",
    lang = 'en'
}) => {
    const siteTitle = "Expath - Valencia Interactive Map";
    const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

    const schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Expath Valencia",
        "description": description || "Interactive Valencia travel guide with landmarks, metro network, and local tips.",
        "url": url,
        "applicationCategory": "TravelApplication",
        "operatingSystem": "Web",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR"
        },
        "author": {
            "@type": "Organization",
            "name": "Expath",
            "url": "https://expath.vercel.app",
            "logo": "https://expath.vercel.app/logo.png",
            "sameAs": [
                "https://twitter.com/Expath_app",
                "https://instagram.com/Expath_valencia"
            ]
        }
    };

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <html lang={lang} />
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={url} />

            {/* Open Graph (Facebook/LinkedIn) */}
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:site_name" content="Expath Valencia" />

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </Helmet>
    );
};

export default SEO;
