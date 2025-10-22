import { ArrowRight } from "lucide-react";
import { assets } from "../assets/assets";

const MainBanner = () => {
  return (
    <section className="relative flex items-center justify-center h-[80vh] sm:h-[90vh] bg-gradient-to-b from-green-50 to-green-100 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={assets.main_banner_image}
          alt="Spices and pantry items"
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/40 via-black/20 to-transparent"></div>
      </div>

      {/* Content Box */}
      <div className="relative z-10 px-4 sm:px-6 text-center sm:text-left">
        <div className="bg-white opacity-90 backdrop-blur-md p-5 sm:p-8 rounded-2xl shadow-lg max-w-md sm:max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 leading-tight">
            Premium Quality <br />
            <span className="bg-gradient-to-r from-orange-500 to-green-600 bg-clip-text text-transparent">
              Natural Pantry Essentials
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
            Discover our curated collection of authentic spices, organic lentils,
            pure oils, and wholesome grains. Freshness and quality delivered to your
            doorstep.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center sm:justify-start">
            <button className="group flex items-center justify-center gap-2 px-5 py-3 text-sm sm:text-base text-white bg-green-600 rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 hover:shadow-green-400/40 hover:scale-105 active:scale-95">
              Shop Now
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transform transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button className="group px-5 py-3 text-sm sm:text-base border-2 border-green-600 rounded-lg text-green-600 bg-white hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:border-green-700 hover:scale-105 active:scale-95">
              View All Products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainBanner;
