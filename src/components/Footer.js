import Link from 'next/link';

const categories = [
  'Movies', 'TV Series', 'Trending', 'Finance', 'Technology', 'Crypto',
];

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-16">
      <div className="container-blog py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <h3 className="font-extrabold text-lg text-gray-900">⚡ {process.env.NEXT_PUBLIC_SITE_NAME || 'Info Bytes'}</h3>
          <p className="mt-2 text-sm text-gray-500 leading-relaxed">
            Trending news, movie reviews, financial insights & more — fresh content updated daily with AI-powered research.
          </p>
        </div>

        {/* Categories */}
        <div>
          <h4 className="font-bold text-sm text-gray-900 mb-3">Categories</h4>
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c}>
                <Link href={`/category/${c.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm text-gray-500 hover:text-brand-600 transition-colors">{c}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-bold text-sm text-gray-900 mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li><Link href="/about" className="text-sm text-gray-500 hover:text-brand-600">About</Link></li>
            <li><Link href="/privacy" className="text-sm text-gray-500 hover:text-brand-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-sm text-gray-500 hover:text-brand-600">Terms of Service</Link></li>
            <li><Link href="/contact" className="text-sm text-gray-500 hover:text-brand-600">Contact</Link></li>
            <li><Link href="/sitemap.xml" className="text-sm text-gray-500 hover:text-brand-600">Sitemap</Link></li>
          </ul>
        </div>

        {/* Disclaimer */}
        <div>
          <h4 className="font-bold text-sm text-gray-900 mb-3">Disclaimer</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Content is for informational purposes only and does not constitute financial, legal, or medical advice. Always consult a qualified professional.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="container-blog py-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>&copy; {year} {process.env.NEXT_PUBLIC_SITE_NAME || 'SmartFinance Blog'}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">Powered by Next.js &amp; AI</p>
        </div>
      </div>
    </footer>
  );
}
