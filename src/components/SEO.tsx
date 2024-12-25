import React from 'react';
import Head from 'next/head';

const SEO: React.FC = () => {
  return (
    <Head>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
      <meta name="msapplication-TileColor" content="#da532c" />

      {/* Schema.org markup for Google */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Hospital",
            "name": "SJHRC: SHREE JAGANNATH HOSPITAL & RESEARCH CENTRE",
            "alternateName": "SJHRC",
            "url": "https://sjhrc.org",
            "logo": "https://sjhrc.org/logo.png",
            "sameAs": [
              "https://www.facebook.com/SJHRC",
              "https://twitter.com/SJHRC_Official",
              "https://www.linkedin.com/company/sjhrc",
              "https://www.instagram.com/sjhrc_official"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-XXX-XXX-XXXX",
              "contactType": "customer service",
              "areaServed": "IN",
              "availableLanguage": ["English", "Hindi", "Odia"]
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "123 Hospital Road",
              "addressLocality": "Bhubaneswar",
              "addressRegion": "Odisha",
              "postalCode": "751XXX",
              "addressCountry": "IN"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "20.2961",
              "longitude": "85.8245"
            },
            "openingHoursSpecification": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": [
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday"
              ],
              "opens": "00:00",
              "closes": "23:59"
            },
            "department": [
              {
                "@type": "MedicalSpecialty",
                "name": "Cardiology"
              },
              {
                "@type": "MedicalSpecialty",
                "name": "Neurology"
              },
              {
                "@type": "MedicalSpecialty",
                "name": "Oncology"
              },
              {
                "@type": "MedicalSpecialty",
                "name": "Orthopedics"
              },
              {
                "@type": "MedicalSpecialty",
                "name": "Pediatrics"
              }
            ]
          }
        `}
      </script>
    </Head>
  );
};

export default SEO;
