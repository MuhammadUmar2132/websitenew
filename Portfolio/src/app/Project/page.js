'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import * as THREE from 'three';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Projects = () => {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const frameRef = useRef(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_URL}/photos`);
        const data = await res.json();

        console.log("API Response:", data);

        // Handle both array and object responses safely
        const projectList = Array.isArray(data) ? data : data?.projects || [];
        setProjects(projectList.slice(0, 6));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      threeContainerRef.current.offsetWidth / threeContainerRef.current.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(
      threeContainerRef.current.offsetWidth,
      threeContainerRef.current.offsetHeight
    );
    renderer.setClearColor(0x000000, 0);
    threeContainerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add floating geometric elements
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4f46e5, // indigo-600
      shininess: 100,
      emissive: 0x372f85,
      transparent: true,
      opacity: 0.8
    });

    const shapes = [];
    for (let i = 0; i < 15; i++) {
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.position.x = (Math.random() - 0.5) * 10;
      mesh.position.y = (Math.random() - 0.5) * 10;
      mesh.position.z = (Math.random() - 0.5) * 5;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.scale.setScalar(Math.random() * 0.7 + 0.3);
      scene.add(mesh);
      shapes.push(mesh);
    }

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0x4f46e5, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add point lights
    const pointLight1 = new THREE.PointLight(0x818cf8, 1, 100); // indigo-400
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xc7d2fe, 1, 100); // indigo-200
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.005 * (i % 3 === 0 ? 1 : -1);
        shape.rotation.y += 0.007 * (i % 2 === 0 ? 1 : -1);
        
        // Float up and down gently
        shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!threeContainerRef.current || !camera || !renderer) return;
      
      camera.aspect = threeContainerRef.current.offsetWidth / threeContainerRef.current.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        threeContainerRef.current.offsetWidth,
        threeContainerRef.current.offsetHeight
      );
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (renderer) {
        renderer.dispose();
        if (threeContainerRef.current && renderer.domElement) {
          threeContainerRef.current.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  // DELETE handler
  const handleDelete = async (title) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/photo/title/${encodeURIComponent(title)}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete project');
      }

      // Remove from UI
      setProjects(prev => prev.filter(project => project.title !== title));
      alert(`Project "${title}" deleted successfully.`);
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete project: ' + error.message);
    }
  };

  return (
    <section id="projects" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Three.js Background */}
      <div 
        ref={threeContainerRef} 
        className="absolute inset-0 z-0 opacity-20"
        style={{ height: '100%' }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            My Projects
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore my recent works with modern interactive 3D cards
          </p>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="rounded-full h-8 w-8 bg-indigo-600 animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative px-8">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 1 },
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              navigation={{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }}
              pagination={{ 
                clickable: true,
                el: '.swiper-pagination',
                renderBullet: function (index, className) {
                  return `<span class="${className} bg-indigo-600"></span>`;
                },
              }}
              className="mySwiper"
            >
              {projects.map((project, index) => (
                <SwiperSlide key={project._id || index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50, rotateY: 15 }}
                    whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.7 }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      y: -10, 
                      rotateY: 5,
                      transition: { duration: 0.3 }
                    }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden shadow-2xl hover:shadow-indigo-500/20 transition-all border border-gray-700 group relative"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70 z-10"></div>
                    
                    {/* 3D Card Effect Container */}
                    <div 
                      className="relative h-64 overflow-hidden"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 z-0"></div>
                      <img 
                        src={project.imageUrl} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      
                      {/* Floating elements */}
                      <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 flex items-center justify-center">
                        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                      </div>
                      
                      <div className="absolute bottom-0 left-0 p-6 z-20">
                        <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{project.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {project.tags?.map((tag, i) => (
                            <motion.span 
                              key={i} 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              className="px-3 py-1 bg-indigo-600/80 backdrop-blur-sm text-xs text-white rounded-full border border-indigo-400/30"
                            >
                              {tag}
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 relative">
                      {/* Subtle grid pattern */}
                      <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
                      
                      <p className="text-gray-300 mb-4 line-clamp-3 relative z-10">{project.description}</p>
                      <div className="flex justify-between items-center relative z-10">
                        <motion.a 
                          href={project.link} 
                          className="text-white hover:text-indigo-400 font-medium inline-flex items-center transition-colors group/link"
                          target="_blank" rel="noreferrer"
                          whileHover={{ x: 5 }}
                        >
                          View Project
                          <svg className="w-4 h-4 ml-2 group-hover/link:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </motion.a>
                        <motion.button
                          onClick={() => handleDelete(project.title)}
                          className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-lg transition-colors border border-red-400/20 hover:bg-red-400/10"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl -z-10"></div>
                  </motion.div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {/* Custom navigation buttons */}
            <div className="swiper-button-prev after:text-indigo-400 after:text-2xl"></div>
            <div className="swiper-button-next after:text-indigo-400 after:text-2xl"></div>
            <div className="swiper-pagination mt-6 relative"></div>
          </div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-center mt-16"
        >
          <motion.button 
            onClick={() => router.push('/Uploads')}
            className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-medium transition-all shadow-lg hover:shadow-indigo-500/30 overflow-hidden group"
            whileHover={{ 
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">Add New Project</span>
            
            {/* Button shine effect */}
            <div className="absolute inset-0 -z-0">
              <div className="absolute inset-0 bg-indigo-600"></div>
              <div className="absolute inset-0  opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Shine animation */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine transition-all duration-700"></div>
            </div>
          </motion.button>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .animate-shine {
          animation: shine 0.75s;
        }
        .bg-grid-white\/\[0\.05\] {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </section>
  );
};

export default Projects;