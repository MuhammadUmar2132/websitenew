"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu state
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);

    const updateAuthState = () => {
      try {
        const userStr = localStorage.getItem("portfolio_user");
        setUser(userStr ? JSON.parse(userStr) : null);
      } catch (e) {
        setUser(null);
      }
    };

    updateAuthState();
    window.addEventListener("auth-change", updateAuthState);
    window.addEventListener("storage", updateAuthState);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth-change", updateAuthState);
      window.removeEventListener("storage", updateAuthState);
    };
  }, []);

  const handleLogout = async () => {
    const { clearAuthSession } = await import("../../utils/auth");
    await clearAuthSession();
    setUser(null);
    router.push("/");
  };

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
        scrolled ? "bg-gray-900/90 backdrop-blur-md py-2 shadow-lg" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-white text-2xl font-bold hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          <span>Muhammad Umar</span>
          {user?.role === "admin" && (
            <span className="text-xs bg-indigo-600/80 border border-indigo-400/40 text-white px-2 py-0.5 rounded-full font-semibold">
              Admin
            </span>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 items-center">
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

          {user?.role === "admin" && (
            <Link
              href="/Admin"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 transform hover:scale-105"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Admin Panel</span>
            </Link>
          )}

          <button
            onClick={downloadCV}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 text-sm"
          >
            Download CV
          </button>

          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-300 text-sm font-medium">
                {user.name || user.username}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition-all"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => router.push("/Login")}
                className="text-white hover:text-indigo-400 transition-colors text-sm"
              >
                Sign In
              </button>
              <button
                onClick={() => router.push("/Signup")}
                className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all transform hover:scale-105 text-sm font-medium"
              >
                Sign Up
              </button>
            </>
          )}
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
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md px-6 py-4 space-y-4 border-b border-gray-800">
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

          {user?.role === "admin" && (
            <Link
              href="/Admin"
              className="block text-indigo-400 font-semibold transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              👑 Admin Panel
            </Link>
          )}

          <button
            onClick={downloadCV}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all"
          >
            Download CV
          </button>

          {user ? (
            <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
              <span className="text-gray-300 text-sm">
                Signed in as <strong>{user.name || user.username}</strong>
              </span>
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-2 pt-2 border-t border-gray-800">
              <button
                onClick={() => {
                  router.push("/Login");
                  setMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-indigo-400 transition-colors py-1"
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
        </div>
      )}
    </nav>
  );
};

export default Navbar;
