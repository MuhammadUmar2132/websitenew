"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu state
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const downloadCV = () => {
    const link = document.createElement("a");
    link.href = "/assets/CV.docx";
    link.download = "CV.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-600 ${
        scrolled ? "bg-gray-900 py-2 shadow-lg" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-white text-2xl font-bold hover:text-indigo-400 transition-colors"
        >
          Muhammad Umar
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/About" className="text-white hover:text-indigo-400 transition-colors">
            About
          </Link>
          <Link href="/Services" className="text-white hover:text-indigo-400 transition-colors">
            Services
          </Link>
          <Link href="/Project" className="text-white hover:text-indigo-400 transition-colors">
            Projects
          </Link>
          <Link href="/Contact" className="text-white hover:text-indigo-400 transition-colors">
            Contact
          </Link>

          <button
            onClick={downloadCV}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105"
          >
            Download CV
          </button>
          <button
            onClick={() => router.push("/Login")}
            className="text-white hover:text-indigo-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => router.push("/Signup")}
            className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all transform hover:scale-105"
          >
            Sign Up
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-900 px-6 py-4 space-y-4">
          <Link
            href="/About"
            className="block text-white hover:text-indigo-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            href="/Services"
            className="block text-white hover:text-indigo-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            href="/Project"
            className="block text-white hover:text-indigo-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Projects
          </Link>
          <Link
            href="/Contact"
            className="block text-white hover:text-indigo-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          <button
            onClick={downloadCV}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Download CV
          </button>
          <button
            onClick={() => {
              router.push("/Login");
              setMenuOpen(false);
            }}
            className="block w-full text-left text-white hover:text-indigo-400 transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              router.push("/Signup");
              setMenuOpen(false);
            }}
            className="w-full bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all"
          >
            Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
