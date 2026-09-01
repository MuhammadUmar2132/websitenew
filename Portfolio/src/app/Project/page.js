'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as THREE from 'three';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState(null);

  const threeContainerRef = useRef(null);
  const frameRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8009';

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/photos`);
        const data = await res.json();
        const projectList = Array.isArray(data) ? data : data?.projects || [];
        setProjects(projectList);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [API_URL]);

  // Subtle Three.js Geometric Mesh in Background
  useEffect(() => {
    const container = threeContainerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Floating Ring & Octahedrons
    const group = new THREE.Group();
    scene.add(group);

    const torusGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 100);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.25,
      wireframe: true,
    });
    const torus = new THREE.Mesh(torusGeo, torusMat);
    group.add(torus);

    const particleCount = 40;
    const particleGeo = new THREE.OctahedronGeometry(0.2, 0);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      roughness: 0.4,
      metalness: 0.8,
      transparent: true,
      opacity: 0.6,
    });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(particleGeo, particleMat.clone());
      p.position.set(
        (Math.random() - 0.5) * 14,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6
      );
      p.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      const scale = Math.random() * 0.8 + 0.3;
      p.scale.set(scale, scale, scale);
      p.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.01,
        rotSpeedY: (Math.random() - 0.5) * 0.01,
        floatSpeed: Math.random() * 0.002 + 0.001,
        seed: Math.random() * 100,
      };
      group.add(p);
      particles.push(p);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa855f7, 2, 50);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      torus.rotation.x += 0.001;
      torus.rotation.y += 0.002;

      particles.forEach((p) => {
        p.rotation.x += p.userData.rotSpeedX;
        p.rotation.y += p.userData.rotSpeedY;
        p.position.y += Math.sin(Date.now() * 0.001 + p.userData.seed) * p.userData.floatSpeed;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (renderer) {
        renderer.dispose();
        if (container && renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  const featuredProject = projects.length > 0 ? projects[0] : null;
  const gridProjects = projects.length > 1 ? projects.slice(1) : [];

  return (
    <section 
      id="projects" 
      className="py-24 text-gray-100 relative overflow-hidden"
      style={{ backgroundColor: 'rgb(17, 24, 39)' }}
    >
      {/* Background 3D Canvas */}
      <div
        ref={threeContainerRef}
        className="absolute inset-0 z-0 opacity-25 pointer-events-none"
      />

      {/* Decorative Glow Orbs */}
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-indigo-600/15 rounded-full blur-[128px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 bg-purple-600/15 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-4 shadow-sm backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Featured Showcase
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6"
          >
            Crafted With{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Precision & Code
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-300 text-lg sm:text-xl leading-relaxed"
          >
            Explore a curated selection of full-stack web applications, interactive 3D interfaces, and high-performance digital solutions.
          </motion.p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-96 rounded-3xl bg-gray-800/40 border border-gray-700/60 animate-pulse flex flex-col p-6"
              >
                <div className="w-full h-48 bg-gray-700/50 rounded-2xl mb-4"></div>
                <div className="w-3/4 h-6 bg-gray-700/60 rounded mb-2"></div>
                <div className="w-full h-4 bg-gray-700/40 rounded mb-4"></div>
                <div className="w-1/2 h-4 bg-gray-700/40 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 bg-gray-800/40 border border-gray-700/60 rounded-3xl p-12">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Projects Coming Soon</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Exciting projects and applications are currently in development and will be showcased here soon.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* 1. HERO SPOTLIGHT BENTO CARD (First Featured Project) */}
            {featuredProject && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="group relative rounded-3xl bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-indigo-950/40 border border-gray-700/80 hover:border-indigo-500/50 transition-all duration-500 shadow-2xl overflow-hidden backdrop-blur-xl"
              >
                {/* Glow Halo */}
                <div className="absolute -top-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700 pointer-events-none"></div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10 items-center">
                  {/* Left Column - Details */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                        ⭐ Spotlight Project
                      </span>
                      <span className="text-xs text-gray-400 font-mono">01 // FEATURED</span>
                    </div>

                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                      {featuredProject.title}
                    </h3>

                    <p className="text-gray-300 text-base sm:text-lg leading-relaxed line-clamp-4">
                      {featuredProject.description ||
                        'A full-scale modern web application developed with robust performance, responsive design architecture, and sleek interactive user experiences.'}
                    </p>

                    {/* Tech stack tags */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {featuredProject.tags && featuredProject.tags.length > 0 ? (
                        featuredProject.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-gray-700/70 border border-gray-600/70 text-indigo-300 text-xs font-mono font-medium"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <>
                          <span className="px-3 py-1 rounded-lg bg-gray-700/70 border border-gray-600/70 text-indigo-300 text-xs font-mono font-medium">
                            #Next.js
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-gray-700/70 border border-gray-600/70 text-purple-300 text-xs font-mono font-medium">
                            #React
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-gray-700/70 border border-gray-600/70 text-pink-300 text-xs font-mono font-medium">
                            #TailwindCSS
                          </span>
                          <span className="px-3 py-1 rounded-lg bg-gray-700/70 border border-gray-600/70 text-emerald-300 text-xs font-mono font-medium">
                            #Node.js
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                      {featuredProject.link && (
                        <a
                          href={featuredProject.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                          <span>Launch Live Demo</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Mac Window Browser Frame */}
                  <div className="lg:col-span-6">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-700/80 shadow-2xl group/mockup">
                      {/* Mac Window Header */}
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-850 border-b border-gray-700/80">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                          <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                          <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                        </div>
                        <div className="px-3 py-0.5 rounded-md bg-gray-900 text-[11px] font-mono text-gray-300 border border-gray-700 truncate max-w-[200px]">
                          {featuredProject.link ? featuredProject.link.replace(/^https?:\/\//, '') : 'project-preview.app'}
                        </div>
                        <div className="w-10"></div>
                      </div>

                      {/* Image Frame */}
                      <div className="relative aspect-video overflow-hidden bg-gray-900">
                        <img
                          src={featuredProject.imageUrl}
                          alt={featuredProject.title}
                          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover/mockup:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent pointer-events-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. MODERN SHOWCASE GRID (Remaining Projects) */}
            {gridProjects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gridProjects.map((project, index) => {
                  return (
                    <motion.div
                      key={project._id || index}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                      onMouseEnter={() => setHoveredCard(index)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className="group relative rounded-3xl bg-gray-800/80 border border-gray-700/70 hover:border-indigo-500/50 hover:bg-gray-800/95 transition-all duration-400 shadow-xl overflow-hidden flex flex-col backdrop-blur-xl"
                    >
                      {/* Interactive Spotlight Border Highlight */}
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-indigo-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                      {/* Mac Browser Header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900/95 border-b border-gray-700/70">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                        </div>
                        <span className="text-[10px] font-mono text-gray-400 truncate max-w-[150px]">
                          {project.title.toLowerCase().replace(/\s+/g, '-')}.app
                        </span>
                        <div className="w-6"></div>
                      </div>

                      {/* Image Preview Container */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-gray-900">
                        <img
                          src={project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

                        {/* Floating Action Overlay on Hover */}
                        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-950/40 backdrop-blur-[2px]">
                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-xl bg-white text-gray-900 font-semibold text-xs flex items-center gap-1.5 shadow-xl hover:bg-gray-100 transition-all transform hover:scale-105"
                            >
                              <span>Live Preview</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
                            {project.title}
                          </h4>
                          <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">
                            {project.description ||
                              'A polished digital experience crafted with clean code and modern interface aesthetics.'}
                          </p>
                        </div>

                        {/* Tags & Action Link */}
                        <div className="pt-4 border-t border-gray-700/70 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                            {project.tags && project.tags.length > 0 ? (
                              project.tags.slice(0, 2).map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-200 font-mono"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] px-2 py-0.5 rounded bg-gray-700 text-gray-300 font-mono">
                                #FullStack
                              </span>
                            )}
                          </div>

                          {project.link && (
                            <a
                              href={project.link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group/btn"
                            >
                              <span>Explore</span>
                              <svg
                                className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;