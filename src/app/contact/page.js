export const metadata = {
  title: 'Contact Us - Info Bytes',
  description: 'Get in touch with the Info Bytes team. We\'d love to hear from you.',
};

export default function ContactPage() {
  return (
    <div className="container-blog py-12">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-8">
          Have a question, suggestion, or feedback? We&apos;d love to hear from you.
        </p>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Get in Touch</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Info Bytes is an AI-powered financial knowledge platform covering investing, trading,
              insurance, tax planning, and personal finance topics across Indian, US, and global markets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl mb-2">📧</div>
              <h3 className="font-semibold text-gray-900 text-sm">Email</h3>
              <p className="text-gray-500 text-sm mt-1">contact@infobytes.com</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl mb-2">🐦</div>
              <h3 className="font-semibold text-gray-900 text-sm">Twitter / X</h3>
              <p className="text-gray-500 text-sm mt-1">@InfoBytesHQ</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Topics We Cover</h3>
            <div className="flex flex-wrap gap-2">
              {['Stock Market', 'Mutual Funds', 'Insurance', 'Tax Planning', 'Cryptocurrency',
                'Options Trading', 'Retirement Planning', 'Personal Finance', 'Real Estate'].map(tag => (
                <span key={tag} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-semibold text-gray-900 mb-2">Disclaimer</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              The content on Info Bytes is for informational purposes only and should not be considered
              financial advice. Always consult with qualified financial professionals before making
              investment decisions. Past performance does not guarantee future results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
