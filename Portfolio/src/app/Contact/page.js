"use client";
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const threeContainerRef = useRef(null);
  const frameRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!threeContainerRef.current) return;

    // ✅ Copy current container into a local variable
    const container = threeContainerRef.current;

    // Initialize scene
    const scene = new THREE.Scene();

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75,
      container.offsetWidth / container.offsetHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Add floating geometric elements
    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const material = new THREE.MeshPhongMaterial({
      color: 0x4f46e5, // indigo-600
      shininess: 100,
      emissive: 0x372f85,
      transparent: true,
      opacity: 0.7
    });

    const shapes = [];
    for (let i = 0; i < 12; i++) {
      const mesh = new THREE.Mesh(geometry, material.clone());
      mesh.position.x = (Math.random() - 0.5) * 10;
      mesh.position.y = (Math.random() - 0.5) * 10;
      mesh.position.z = (Math.random() - 0.5) * 5;
      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;
      mesh.scale.setScalar(Math.random() * 0.5 + 0.3);
      scene.add(mesh);
      shapes.push(mesh);
    }

    // Add lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));

    const directionalLight = new THREE.DirectionalLight(0x4f46e5, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x818cf8, 0.7, 100);
    pointLight1.position.set(10, 10, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xc7d2fe, 0.7, 100);
    pointLight2.position.set(-10, -10, -10);
    scene.add(pointLight2);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);

      shapes.forEach((shape, i) => {
        shape.rotation.x += 0.004 * (i % 3 === 0 ? 1 : -1);
        shape.rotation.y += 0.006 * (i % 2 === 0 ? 1 : -1);
        shape.position.y += Math.sin(Date.now() * 0.001 + i) * 0.0015;
      });

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };

    window.addEventListener('resize', handleResize);

    // ✅ Cleanup using local variables (no stale ref issue)
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const response = await fetch('https://port-backend-76o0.onrender.com/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Three.js Background */}
      <div 
        ref={threeContainerRef} 
        className="absolute inset-0 z-0 opacity-15"
        style={{ height: '100%' }}
      />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Heading */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Have a project in mind or want to discuss potential opportunities? Feel free to reach out!
          </p>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>
        
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            {/* Contact Information */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl h-full border border-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-grid-white/[0.05] bg-[length:20px_20px] -z-0"></div>
              <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 blur-xl opacity-30 -z-10"></div>
              
              <h3 className="text-2xl font-semibold text-white mb-6 relative z-10">Contact Information</h3>
              
              <div className="space-y-6 relative z-10">
                {/* Phone */}
                <motion.div 
                  className="flex items-start bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <div className="bg-indigo-600 p-3 rounded-full mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Phone</h4>
                    <p className="text-gray-300">+92 (321) 6037-101</p>
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div 
                  className="flex items-start bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <div className="bg-indigo-600 p-3 rounded-full mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Email</h4>
                    <p className="text-gray-300">mrumar4722@gmail.com</p>
                  </div>
                </motion.div>

                {/* Location */}
                <motion.div 
                  className="flex items-start bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50"
                  whileHover={{ x: 5, transition: { duration: 0.2 } }}
                >
                  <div className="bg-indigo-600 p-3 rounded-full mr-4 shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-white">Location</h4>
                    <p className="text-gray-300">Lahore, Punjab, Pakistan</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Section (Form) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-1/2"
          >
            <form onSubmit={handleSubmit} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-2xl border border-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 opacity-5 bg-grid-gray-900/[0.05] bg-[length:20px_20px] -z-0"></div>
              
              {/* Name */}
              <div className="mb-6 relative z-10">
                <label htmlFor="name" className="block text-gray-800 mb-2 font-medium">Your Name</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm bg-white/80"
                  required
                />
              </div>
              
              {/* Email */}
              <div className="mb-6 relative z-10">
                <label htmlFor="email" className="block text-gray-800 mb-2 font-medium">Your Email</label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm bg-white/80"
                  required
                />
              </div>
              
              {/* Message */}
              <div className="mb-6 relative z-10">
                <label htmlFor="message" className="block text-gray-800 mb-2 font-medium">Your Message</label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm bg-white/80"
                  required
                ></motion.textarea>
              </div>
              
              {/* Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full relative bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium transition-all disabled:opacity-70 overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="relative z-10">{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                
                {/* Shine effect */}
                <div className="absolute inset-0 -z-0">
                  <div className="absolute inset-0 bg-indigo-600"></div>
                  <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover:animate-shine transition-all duration-700"></div>
                </div>
              </motion.button>
              
              {/* Success/Error */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg border border-green-200 backdrop-blur-sm"
                >
                  Message sent successfully!
                </motion.div>
              )}
              
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg border border-red-200 backdrop-blur-sm"
                >
                  Failed to send message. Please try again.
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes shine {
          100% {
            left: 125%;
          }
        }
        .animate-shine {
          animation: shine 0.75s;
        }
        .bg-grid-white\\/\\[0\\.05\\] {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
        .bg-grid-gray-900\\/\\[0\\.05\\] {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(17 24 39 / 0.05)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
        }
      `}</style>
    </section>
  );
};

export default Contact;
