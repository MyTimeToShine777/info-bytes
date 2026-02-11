'use client';

import { useEffect } from 'react';
import Script from 'next/script';

const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || '';

/**
 * Drop this in <head> via layout.js — loads the AdSense script once.
 */
export function AdSenseScript() {
  if (!PUB_ID || PUB_ID.startsWith('ca-pub-XXX')) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}

/**
 * Reusable AdSense ad unit.  
 * Pass `slot` from your AdSense dashboard.
 * `format` defaults to 'auto' (responsive).
 */
export function AdUnit({ slot, format = 'auto', layout = '', className = '' }) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) { /* ignore */ }
  }, []);

  if (!PUB_ID || PUB_ID.startsWith('ca-pub-XXX') || !slot) {
    // Placeholder while AdSense not configured
    return (
      <div className={`ad-slot border-2 border-dashed border-gray-200 rounded-xl ${className}`}>
        <span className="text-gray-300 text-xs">Ad Space</span>
      </div>
    );
  }

  return (
    <div className={`ad-slot ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={PUB_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        {...(layout ? { 'data-ad-layout': layout } : {})}
      />
    </div>
  );
}

/**
 * In-article ad — good for between paragraphs.
 */
export function InArticleAd({ slot }) {
  return <AdUnit slot={slot} format="fluid" layout="in-article" className="my-8" />;
}
