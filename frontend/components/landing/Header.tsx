export default function Header() {
  return (
    <header className="container mx-auto px-4 py-6">
      <nav className="flex items-center justify-between">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          🧱 BrickChain
        </div>
        <div className="space-x-4">
          <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            How It Works
          </a>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Connect Wallet
          </button>
        </div>
      </nav>
    </header>
  );
}