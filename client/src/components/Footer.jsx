import React from 'react';
import { footerLinks } from "../assets/assets";
import logo from '../assets/logo.png';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="contact-section" className="px-6 md:px-16 lg:px-24 xl:px-32 mt-24 bg-[#e6dbcee0]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-8 border-b border-gray-300">
                
                {/* Company Info Section */}
                <div className="lg:col-span-1">
                    <img className="w-28 mb-2" src={logo} alt="Nutreats logo" />
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                        Your trusted source for premium quality spices and authentic ingredients.
                    </p>
                    
                    {/* Contact Info */}
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-green-700" />
                            <a href="tel:+923001234567" className="hover:text-green-700 transition">
                                +92 300 1234-567
                            </a>
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-green-700" />
                            <a href="mailto:info@nutreats.com" className="hover:text-green-700 transition">
                                info@nutreats.com
                            </a>
                        </div>
                    </div>
                    
                    {/* Social Media */}
                    <div className="flex gap-3 mt-1">
                        {[ 
                            { Icon: Facebook, url: "https://facebook.com", label: "Facebook" },
                            { Icon: Instagram, url: "https://instagram.com", label: "Instagram" },
                            { Icon: Twitter, url: "https://twitter.com", label: "Twitter" }
                        ].map(({ Icon, url, label }) => (
                            <a
                                key={label}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-green-700 hover:text-white hover:border-green-700 transition-all"
                            >
                                <Icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>
                </div>
                
                {/* Footer Links */}
                {footerLinks.map((section, index) => (
                    <div key={index}>
                        <h3 className="font-semibold text-base text-gray-900 mb-2 mt-2 ml-10">
                            {section.title}
                        </h3>
                        <ul className="text-sm space-y-1 ml-10">
                            {section.links.map((link, i) => (
                                <li key={i}>
                                    <a 
                                        href={link.url} 
                                        className="text-gray-600 hover:text-green-700 hover:underline transition"
                                    >
                                        {link.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
            
            {/* Copyright Section */}
            <div className="py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-600">
                <p>© {currentYear} Nutreats. All rights reserved.</p>
                <div className="flex gap-4 text-xs sm:text-sm">
                    <a href="/privacy" className="hover:text-green-700 transition">Privacy Policy</a>
                    <span className="text-gray-400">|</span>
                    <a href="/terms" className="hover:text-green-700 transition">Terms</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
