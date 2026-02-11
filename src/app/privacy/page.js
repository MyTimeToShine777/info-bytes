export const metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'SmartFinance Blog';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.com';

  return (
    <div className="container-blog py-12">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>
        <p><em>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</em></p>
        <p>
          At <strong>{siteName}</strong> ({siteUrl}), the privacy of our
          visitors is extremely important. This Privacy Policy explains the
          types of information we collect and how we use it.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We do not require registration or collect personal data directly.
          However, third-party services used on this site may collect data
          as described below.
        </p>
        <h2>Cookies &amp; Third-Party Ads</h2>
        <p>
          We use <strong>Google AdSense</strong> to display advertisements.
          Google and its partners may use cookies and web beacons to serve
          ads based on your prior visits. You can opt out of personalized
          advertising at{' '}
          <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">
            Google Ads Settings
          </a>.
        </p>
        <h2>Analytics</h2>
        <p>
          We may use analytics services (such as Google Analytics) to
          understand traffic patterns. These services collect anonymous data
          such as pages visited, time on site, and referral source.
        </p>
        <h2>External Links</h2>
        <p>
          Our articles may link to external sites. We are not responsible
          for the privacy practices of those sites.
        </p>
        <h2>Changes</h2>
        <p>
          We may update this policy from time to time. Changes will be
          posted on this page.
        </p>
        <h2>Contact</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us
          at <strong>contact@yourdomain.com</strong>.
        </p>
      </div>
    </div>
  );
}
