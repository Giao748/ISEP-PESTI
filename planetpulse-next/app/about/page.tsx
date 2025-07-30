// import { Nunito, Lato } from "next/font/google";
import Link from "next/link";

// Using fallback fonts instead of Google Fonts due to connectivity issues
// const nunito = Nunito({ subsets: ["latin"], weight: ["700"] });
// const lato = Lato({ subsets: ["latin"], weight: ["400"] });

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center py-12 px-4 bg-cover bg-center" style={{ backgroundImage: "url('/turtle.png')" }}>
      {/* 🌿 Main Content */}
      <section className="relative z-10 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl shadow-2xl max-w-6xl w-full p-20 border-2 border-green-300 dark:border-green-800">
        {/* ← Home Link */}
        <Link
          href="/"
          className="absolute top-6 left-8 text-green-700 dark:text-green-300 font-bold text-lg hover:underline transition"
        >
          ← Home
        </Link>

        <div>
          <h2
            className="text-6xl md:text-7xl font-extrabold mb-10 text-center drop-shadow-lg text-green-800 dark:text-green-300"
          >
            About <span className="text-green-500 dark:text-green-200">PlanetPulse</span>
          </h2>

          <p
            className="text-2xl md:text-3xl text-gray-900 dark:text-gray-100 leading-snug mb-8 text-center font-semibold"
          >
            Empowering youth to act on sustainability and create a positive impact!
          </p>

          <hr className="my-10 border-green-400 dark:border-green-700" />

          <div className="text-lg md:text-2xl text-gray-800 dark:text-gray-200 leading-relaxed space-y-6">
            <p>
              Our planet faces big challenges as the world grows. We need everyone’s help to protect the environment and make smart choices for the future!
            </p>
            <p>
              By sharing good and bad habits, we can learn together and help each other take care of Earth. PlanetPulse inspires you to be a hero for our planet!
            </p>
            <p>
              Discover and share cool ideas for sustainability, and see what others are doing too. Send us your news and stories—our awesome team will check them out and share them with everyone!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
