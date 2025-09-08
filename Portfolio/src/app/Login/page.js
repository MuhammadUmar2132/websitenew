'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import * as THREE from 'three';

export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const canvasRef = useRef(null);

  // Three.js initialization
  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.2, 16, 100),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.ConeGeometry(0.8, 1.5, 6),
    ];

    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.7 }),
      new THREE.MeshPhongMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7 }),
      new THREE.MeshPhongMaterial({ color: 0xa5b4fc, transparent: true, opacity: 0.7 }),
      new THREE.MeshPhongMaterial({ color: 0xc7d2fe, transparent: true, opacity: 0.7 }),
    ];

    const objects = [];
    const count = 8;

    for (let i = 0; i < count; i++) {
      const geometry = geometries[Math.floor(Math.random() * geometries.length)];
      const material = materials[Math.floor(Math.random() * materials.length)];

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 10;
      mesh.position.y = (Math.random() - 0.5) * 10;
      mesh.position.z = (Math.random() - 0.5) * 10;

      mesh.rotation.x = Math.random() * Math.PI;
      mesh.rotation.y = Math.random() * Math.PI;

      const scale = Math.random() * 0.8 + 0.5;
      mesh.scale.set(scale, scale, scale);

      mesh.userData = {
        originalX: mesh.position.x,
        originalY: mesh.position.y,
        originalZ: mesh.position.z,
        speedX: Math.random() * 0.02 + 0.005,
        speedY: Math.random() * 0.02 + 0.005,
        speedZ: Math.random() * 0.02 + 0.005,
        rotationSpeedX: Math.random() * 0.01 + 0.005,
        rotationSpeedY: Math.random() * 0.01 + 0.005,
      };

      scene.add(mesh);
      objects.push(mesh);
    }

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      objects.forEach((obj) => {
        const time = Date.now() * 0.001;

        obj.position.x = obj.userData.originalX + Math.sin(time * obj.userData.speedX) * 0.5;
        obj.position.y = obj.userData.originalY + Math.cos(time * obj.userData.speedY) * 0.5;
        obj.position.z = obj.userData.originalZ + Math.sin(time * obj.userData.speedZ) * 0.5;

        obj.rotation.x += obj.userData.rotationSpeedX * 0.01;
        obj.rotation.y += obj.userData.rotationSpeedY * 0.01;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometries.forEach((geo) => geo.dispose());
      materials.forEach((mat) => mat.dispose());
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (validate()) {
      setIsSubmitting(true);
      try {
        const response = await fetch('https://port-backend-76o0.onrender.com/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        alert('Login successful!');
        router.push('/');
      } catch (error) {
        setServerError(error.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { delayChildren: 0.3, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 10 },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.03,
      boxShadow: '0px 5px 15px rgba(79, 70, 229, 0.3)',
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Three.js Canvas Background */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none"
      />

      {/* Floating UI Elements */}
      <div className="absolute top-1/4 left-1/4 w-16 h-16 rounded-full bg-indigo-600/20 blur-xl animate-pulse"></div>
      <div
        className="absolute top-1/3 right-1/4 w-20 h-20 rounded-full bg-purple-600/20 blur-xl animate-pulse"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute bottom-1/4 left-1/3 w-24 h-24 rounded-full bg-blue-600/20 blur-xl animate-pulse"
        style={{ animationDelay: '2s' }}
      ></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-6xl z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 flex flex-col md:flex-row mt-16"
        >
          {/* Left Section */}
          <div className="md:w-2/5 bg-gradient-to-br from-gray-900 to-indigo-900/30 p-12 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-md"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-purple-500/10 blur-md"></div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600 mb-4">
                Welcome Back
              </h1>
              <p className="text-gray-300 text-lg mb-8">
                We&apos;re excited to see you again. Access your personalized dashboard and continue your journey with us.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-indigo-500/20 mr-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">Access all your saved data</span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-indigo-500/20 mr-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">Secure and encrypted</span>
                </div>
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-indigo-500/20 mr-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <span className="text-gray-300">Sync across all your devices</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Section - Form */}
          <div className="md:w-3/5 p-12">
            <div className="text-center mb-10">
              <motion.h1
                variants={itemVariants}
                className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600"
              >
                Sign In to Your Account
              </motion.h1>
              <motion.p variants={itemVariants} className="text-gray-400 mt-2">
                Enter your credentials to continue
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {serverError && (
                <motion.div
                  variants={itemVariants}
                  className="text-rose-400 text-sm text-center bg-rose-400/10 p-3 rounded-lg"
                >
                  {serverError}
                </motion.div>
              )}

              {/* Username */}
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="username" className="block text-sm font-medium text-white">
                    Username
                  </label>
                  {errors.username && <p className="text-xs text-rose-400">{errors.username}</p>}
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 rounded-lg border ${
                    errors.username ? 'border-rose-500' : 'border-gray-600/50'
                  } focus:ring-2 focus:ring-indigo-500 text-gray-100 placeholder-gray-400 backdrop-blur-sm`}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants}>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-white">
                    Password
                  </label>
                  {errors.password && <p className="text-xs text-rose-400">{errors.password}</p>}
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-gray-700/50 rounded-lg border ${
                    errors.password ? 'border-rose-500' : 'border-gray-600/50'
                  } focus:ring-2 focus:ring-indigo-500 text-gray-100 placeholder-gray-400 backdrop-blur-sm`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between pt-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded bg-gray-700/50 border-gray-600 focus:ring-indigo-500 text-indigo-600 backdrop-blur-sm"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-indigo-400 hover:underline">
                  Forgot password?
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <motion.button
                  type="submit"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  disabled={isSubmitting}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-lg transition ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/Signup" className="text-indigo-400 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
