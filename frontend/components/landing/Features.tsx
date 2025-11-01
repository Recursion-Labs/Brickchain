export default function Features() {
  return (
    <section id="features" className="mt-24">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
        Key Features
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Property Tokenization
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Turn real estate into fractional digital tokens for easy trading and investment.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Privacy-First
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Shielded transactions ensure your ownership details remain confidential.
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            ZK Verification
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Prove ownership without revealing sensitive information using zero-knowledge proofs.
          </p>
        </div>
      </div>
    </section>
  );
}