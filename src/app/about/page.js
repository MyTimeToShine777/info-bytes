export const metadata = {
  title: 'About Us',
  description: 'Learn about our mission to provide expert insights on finance, insurance, technology and more.',
};

export default function AboutPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'SmartFinance Blog';
  return (
    <div className="container-blog py-12">
      <div className="max-w-3xl mx-auto prose prose-lg">
        <h1>About {siteName}</h1>
        <p>
          Welcome to <strong>{siteName}</strong> — your trusted source for
          expert insights on personal finance, investing, insurance,
          technology, health, and more.
        </p>
        <h2>Our Mission</h2>
        <p>
          We believe everyone deserves access to clear, accurate, and
          actionable information on the topics that matter most. Our team
          combines industry expertise with AI-assisted research to deliver
          high-quality articles that help you make smarter decisions.
        </p>
        <h2>What We Cover</h2>
        <ul>
          <li><strong>Finance &amp; Investing</strong> — Stock market, mutual funds, tax planning, retirement.</li>
          <li><strong>Insurance</strong> — Life, health, auto, and business insurance guides.</li>
          <li><strong>Technology</strong> — Software tools, cybersecurity, cloud computing.</li>
          <li><strong>Health &amp; Wellness</strong> — Evidence-based health, nutrition, and fitness.</li>
          <li><strong>Real Estate</strong> — Home buying, property investment, mortgages.</li>
          <li><strong>Education</strong> — Online learning, certifications, career growth.</li>
        </ul>
        <h2>Editorial Standards</h2>
        <p>
          Every article is thoroughly researched and reviewed for accuracy.
          We are committed to providing unbiased, fact-based content. Our
          content is for informational purposes only and should not be taken
          as professional advice.
        </p>
        <h2>Contact</h2>
        <p>
          Have questions or feedback? Reach us
          at <strong>contact@yourdomain.com</strong>.
        </p>
      </div>
    </div>
  );
}
