import React from 'react';
import Head from 'next/head';

const SEO: React.FC = () => {
  return (
    <Head>
      <link rel="apple-touch-icon" sizes="180x180" href="/icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icon.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icon.png" />
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
            "url": "https://sjhrc.in",
            "logo": "https://sjhrc.in",
            "sameAs": [
              "https://www.facebook.com/sjhrc.in",
              "https://x.com/Sjhrcranchi",
              "https://www.instagram.com/shreejagannathhospital/",
              "https://www.youtube.com/@sjhrcjagannath9636"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9471373714",
              "contactType": "customer service",
              "areaServed": "IN",
              "availableLanguage": ["English", "Hindi"]
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Mayor's Road - Booty Road, Radium Rd, Behind Machali Ghar, Ranchi,
              Jharkhand 834001",
              "addressLocality": "Ranchi",
              "addressRegion": "Ranchi",
              "postalCode": "834001",
              "addressCountry": "IN"
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
