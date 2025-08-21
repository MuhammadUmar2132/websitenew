"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const downloadCV = () => {
    const link = document.createElement('a');
    link.href = '/assets/CV.docx';
    link.download = 'CV.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-600 ${scrolled ? 'bg-gray-900 py-2 shadow-lg' : 'bg-transparent py-4'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="text-white text-2xl font-bold hover:text-indigo-400 transition-colors">
          Muhammad Umar
        </Link>
        
        <div className="hidden md:flex space-x-8 items-center">
          <Link href="/About" className="text-white hover:text-indigo-400 transition-colors">About</Link>
          <Link href="/Services" className="text-white hover:text-indigo-400 transition-colors">Services</Link>
          <Link href="/Project" className="text-white hover:text-indigo-400 transition-colors">Projects</Link>
          <Link href="/Contact" className="text-white hover:text-indigo-400 transition-colors">Contact</Link>
          
          <button onClick={downloadCV} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105">
            Download CV
          </button>
          <button onClick={() => router.push('/Login')} className="text-white hover:text-indigo-400 transition-colors">
            Sign In
          </button>
          <button onClick={() => router.push('/Signup')} className="bg-white text-gray-900 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all transform hover:scale-105">
            Sign Up
          </button>
        </div>

        <button className="md:hidden text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
