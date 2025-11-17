import { ArrowRight } from "lucide-react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const MainBanner = () => {
  const { navigate } = useAppContext();

  return (
    <section className="relative h-[600px] md:h-[700px] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={assets.main_banner_image}
          alt="Spices and pantry items"
          className="w-full h-full object-cover transition-opacity duration-700 opacity-90 hover:opacity-100"
        />
        {/* Updated gradient to match categories theme - using greens and earth tones */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#6B6666]/80 via-[#EB8A14]/60 to-transparent"></div>

        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          {/* Updated badge with matching colors */}
          <div className="inline-block mb-4 px-5 py-2 bg-gradient-to-r from-[#EB8A14] to-[#96580D] text-white text-sm font-semibold rounded-full shadow-lg border-2 border-[#F2B469]/30">
            ✨ اصلی مصالحہ - Authentic Pakistani Spices
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Premium Quality
            <br />
            {/* Updated gradient text to match categories */}
            <span className="bg-gradient-to-r from-[#EB8A14] via-[#F2B469] to-[#F2B469] bg-clip-text text-transparent">
              Natural Pantry
            </span>
            <br />
            Essentials
          </h1>

          <p className="text-lg md:text-xl text-white/95 mb-8 max-w-xl leading-relaxed drop-shadow-lg">
            Discover our curated collection of authentic spices, organic lentils, pure oils, and wholesome grains. Traditional flavors, premium quality — delivered to your doorstep.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Shop Now Button - Updated to match categories theme */}
            <button
              onClick={() => navigate("/products")}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#EB8A14] to-[#96580D] text-white rounded-full font-semibold shadow-lg border-2 border-[#F2B469]/30 transition-all duration-300 
              hover:from-[#96580D] hover:to-[#EB8A14] hover:scale-105 hover:shadow-[0_0_15px_rgba(235,138,20,0.5)] active:scale-95"
            >
              Shop Now
              <ArrowRight className="h-5 w-5 transform transition-transform duration-300 group-hover:translate-x-1.5" />
            </button>

            {/* View All Products Button - Updated to match categories inner card color */}
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-4 bg-[#bfd9bde0] text-[#96580D] rounded-full font-semibold backdrop-blur-sm border-2 border-[#F2B469]/50 shadow-md transition-all duration-300 
              hover:bg-[#F2B469] hover:border-[#EB8A14] hover:scale-105 hover:shadow-[0_0_12px_rgba(191,217,189,0.6)] active:scale-95"
            >
              View All Products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MainBanner;