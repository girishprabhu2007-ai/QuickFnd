export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-10">
      
      <h1 className="text-5xl font-bold mb-6">
        QuickFnd
      </h1>

      <p className="text-lg text-gray-400 mb-10 text-center max-w-xl">
        Find powerful tools, calculators, and AI resources instantly.
        QuickFnd is an automated platform designed to help you get things done faster.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">

        <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition">
          <h2 className="text-xl font-semibold mb-2">Tools</h2>
          <p className="text-gray-400">
            Online utilities like JSON formatter, password generator, and more.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition">
          <h2 className="text-xl font-semibold mb-2">Calculators</h2>
          <p className="text-gray-400">
            Financial, health, and everyday calculators.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl hover:bg-gray-800 transition">
          <h2 className="text-xl font-semibold mb-2">AI Tools</h2>
          <p className="text-gray-400">
            Discover the best AI tools for productivity, writing, coding, and more.
          </p>
        </div>

      </div>

    </main>
  );
}