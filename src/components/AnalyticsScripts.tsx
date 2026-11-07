"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/* The Meta Pixel must initialize before hydration so browser diagnostics can detect it. */
/* eslint-disable @next/next/no-before-interactive-script-outside-document */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    __deromaMetaPixelScriptLoaded?: boolean;
    __deromaMetaPixelInitialized?: boolean;
    clarity?: (...args: unknown[]) => void;
  }
}

function getConfiguredAnalyticsId(value?: string) {
  const normalized = value?.trim();
  if (!normalized) return undefined;

  // Do not ship vendor scripts with the placeholders from .env.example (or
  // accidentally send production traffic to a dummy Meta Pixel).
  if (/^(your|replace|change|example|placeholder)[-_]/i.test(normalized)) return undefined;
  if (/x{4,}/i.test(normalized)) return undefined;

  return normalized;
}

const gaMeasurementId = getConfiguredAnalyticsId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
const metaPixelId = getConfiguredAnalyticsId(process.env.NEXT_PUBLIC_META_PIXEL_ID) ?? "2046371669400378";
const clarityId = getConfiguredAnalyticsId(process.env.NEXT_PUBLIC_CLARITY_ID) ?? "y0hv6rdfno";

function AnalyticsPageViews() {
  const pathname = usePathname();
  const hasTrackedInitialView = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    if (!hasTrackedInitialView.current) {
      hasTrackedInitialView.current = true;
      return;
    }

    const pagePath = `${pathname}${window.location.search}`;

    if (gaMeasurementId && window.gtag) {
      window.gtag("config", gaMeasurementId, {
        page_path: pagePath,
      });
    }

    if (metaPixelId && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [pathname]);

  return null;
}

export default function AnalyticsScripts() {
  return (
    <>
      {gaMeasurementId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaMeasurementId}');
            `}
          </Script>
        </>
      ) : null}

      {clarityId ? (
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityId}");
          `}
        </Script>
      ) : null}

      {metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="beforeInteractive">
            {`
            (function(w, d) {
              var n = w.fbq;
              if (!n) {
                n = w.fbq = function() {
                  n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
                };
                n.push = n;
                n.loaded = true;
                n.version = '2.0';
                n.queue = [];
              }

              if (!w.__deromaMetaPixelScriptLoaded && !d.querySelector('script[src*="connect.facebook.net/en_US/fbevents.js"]')) {
                var t = d.createElement('script');
                t.async = true;
                t.src = 'https://connect.facebook.net/en_US/fbevents.js';
                var s = d.getElementsByTagName('script')[0];
                s.parentNode.insertBefore(t, s);
                w.__deromaMetaPixelScriptLoaded = true;
              }

              if (!w.__deromaMetaPixelInitialized) {
                n('init', '${metaPixelId}');
                n('track', 'PageView');
                w.__deromaMetaPixelInitialized = true;
              }
            })(window, document);
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      ) : null}

      <AnalyticsPageViews />
    </>
  );
}
