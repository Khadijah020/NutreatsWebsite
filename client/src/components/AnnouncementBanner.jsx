import React, { useState, useEffect } from 'react';

const messages = [
  "🌱 Introducing our newest product — NuTriMix Seeds! Boost your day with pure nutrition.",
  "🥪 Customer favorite returns! Fish Masala is back!",]

const AnnouncementBanner = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#32792de0] py-2 text-center text-white font-semibold text-base md:text-lg shadow-md">
      <p key={index} className="transition-all duration-700 ease-in-out animate-fade">{messages[index]}</p>

      <style>{`
        @keyframes fade {
          0%, 100% { opacity: 0; transform: translateY(-10px); }
          10%, 80% { opacity: 1; transform: translateY(0); } /* stays visible here */
          50% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade {
          animation: fade 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBanner;
