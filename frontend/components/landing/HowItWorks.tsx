export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mt-24">
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
        How It Works
      </h2>
      <div className="grid md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            1
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Register Property
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Upload and hash property documents on-chain.
          </p>
        </div>
        <div>
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            2
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Mint Tokens
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Create fractional tokens representing ownership shares.
          </p>
        </div>
        <div>
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            3
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Transfer Privately
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Trade tokens with shielded transactions.
          </p>
        </div>
        <div>
          <div className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
            4
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Verify Ownership
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Generate ZK proofs for secure verification.
          </p>
        </div>
      </div>
    </section>
  );
}