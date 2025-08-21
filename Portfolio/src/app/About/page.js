"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Image from "next/image";

const About = () => {
  const skills = [
    { name: "Next.js", level: 98 },
    { name: "React", level: 90 },
    { name: "Tailwind CSS", level: 95 },
    { name: "Node.js", level: 80 },
    { name: "MongoDB", level: 75 },
    { name: "AWS", level: 85 },
    { name: "Docker", level: 80 },
    { name: "Socket.IO", level: 70 },
  ];

  const canvasRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [randomValues, setRandomValues] = useState([]);

  useEffect(() => {
    setIsClient(true);

    // ✅ Generate once on mount
    setRandomValues(
      skills.map(() => ({
        width: Math.random() * 30 + 20,
        height: Math.random() * 30 + 20,
      }))
    );

    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvasRef.current.appendChild(renderer.domElement);

    // Lights
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(3, 10, 10);
    scene.add(dirLight);

    // Camera
    camera.position.set(0, 1, 3);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    let model = null;
    // ✅ Load GLB Model
    const loader = new GLTFLoader();
    loader.load(
      "/models/hero-model.glb",
      (gltf) => {
        model = gltf.scene;
        model.position.set(0, -1, 0);
        model.scale.set(1.5, 1.5, 1.5);
        scene.add(model);
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

    // Animate Scene
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (model) model.rotation.y += 0.005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle Resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      // ✅ Proper cleanup: remove the same renderer DOM element
      if (canvasRef.current) {
        while (canvasRef.current.firstChild) {
          canvasRef.current.removeChild(canvasRef.current.firstChild);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ✅ no `skills` in dependencies

  if (!isClient) {
    return (
      <section id="about" className="py-20 bg-gray-900 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">About Me</h2>
            <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Three.js Background Canvas */}
      <div ref={canvasRef} className="absolute inset-0 -z-10 opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">About Me</h2>
          <div className="w-20 h-1 bg-indigo-600 mx-auto"></div>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center">
          {/* Profile Image + Floating Circles */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-1/3 mb-10 md:mb-0 relative"
          >
            <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-indigo-500 z-10">
              <Image
                src="/p.jpg"
                alt="Profile"
                width={256}
                height={256}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Floating decorative circles */}
            <motion.div
              animate={{
                rotate: 360,
                transition: { duration: 30, repeat: Infinity, ease: "linear" },
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {randomValues.map((val, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute rounded-full bg-indigo-500/20 backdrop-blur-sm"
                  style={{
                    width: `${val.width}px`,
                    height: `${val.height}px`,
                    left: `${
                      50 + Math.cos((i / skills.length) * Math.PI * 2) * 100
                    }px`,
                    top: `${
                      50 + Math.sin((i / skills.length) * Math.PI * 2) * 100
                    }px`,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>

          {/* Text & Skills */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:w-2/3 md:pl-12"
          >
            <h3 className="text-2xl font-semibold text-white mb-4">Who am I?</h3>
            <p className="text-white mb-6">
              I&apos;m a passionate web developer with 1 year of experience
              creating modern, responsive, and user-friendly websites and
              applications. I specialize in JavaScript technologies including
              React, Next.js, and Node.js.
            </p>
            <p className="text-white mb-8">
              My approach combines technical expertise with creative
              problem-solving to deliver high-quality solutions that meet client
              needs. I&apos;m dedicated to continuous learning and staying
              up-to-date with the latest industry trends.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {skills.map((skill, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-indigo-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="text-white font-medium">
                        {skill.name}
                      </span>
                      <span className="text-white">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
