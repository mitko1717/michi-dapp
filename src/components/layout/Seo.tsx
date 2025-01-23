import React from "react";
import Head from "next/head";

interface SEOProps {
    title: string;
    description: string;
    url: string;
    logo: string;
    keywords?: string[];
    author?: string;
    twitterUsername?: string;
}

const Seo: React.FC<SEOProps> = ({
                                     title,
                                     description,
                                     url,
                                     logo,
                                     keywords = [],
                                     author,
                                     twitterUsername
                                 }) => {
    const seoImageUrl = "https://pichi.finance/seo.png";
    return (
        <Head>
            <title>Pichi Finance | Buy and sell points from pre-token projects</title>
            <meta name="description" content={description}/>
            <meta name="keywords" content={keywords.join(", ")}/>
            {author && <meta name="author" content={author}/>}
            <script
                async
                src="https://www.googletagmanager.com/gtag/js?id=G-EKZWF46MDB"
            ></script>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-EKZWF46MDB');
            `,
                }}
            />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-52T6GSNG');
            `,
                }}
            />
            <meta property="og:type" content="website"/>
            <meta property="og:url" content={url}/>
            <meta property="og:title" content={`${title} | ${description}`}/>
            <meta property="og:description" content={description}/>
            <meta property="og:image" content={seoImageUrl}/>
            <meta property="og:site_name" content={title}/>
            <meta property="og:image:width" content="1280"/>
            <meta property="og:image:height" content="720"/>

            <meta name="twitter:card" content="summary_large_image"/>
            <meta name="twitter:url" content={url}/>
            <meta name="twitter:title" content={`${title} | ${description}`}/>
            <meta name="twitter:description" content={description}/>
            <meta name="twitter:image" content={seoImageUrl}/>
            {twitterUsername && <meta name="twitter:creator" content={`@${twitterUsername}`}/>}
            <link rel="preconnect" href="https://fonts.googleapis.com"/>
            <link rel="preconnect" href="https://fonts.gstatic.com"/>
            <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet"/>
            <link rel="icon" href={logo}/>
            <link rel="apple-touch-icon" sizes="180x180" href="/logo.png"/>
            <link rel="icon" type="image/png" sizes="32x32" href="/logo.png"/>
            <link rel="icon" type="image/png" sizes="16x16" href="/logo.png"/>
            <meta name="msapplication-TileColor" content="#F39983"/>
            <meta name="theme-color" content="#F39983"/>
            <meta name="apple-mobile-web-app-status-bar-style" content="#F39983"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>
        </Head>
    );
};

export default Seo;