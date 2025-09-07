"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
const Services = () => {
  const [shapes, setShapes] = useState([]);

  useEffect(() => {
    // Generate random shapes on client only
    const generated = Array.from({ length: 20 }, () => ({
      width: Math.random() * 40 + 20,
      height: Math.random() * 40 + 20,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 5 + Math.random() * 5,
    }));
    setShapes(generated);
  }, []);

  const services = [
    {
      title: "Full Stack Developement",
      description:
        "Building responsive, fast, and scalable web applications tailored to your needs.",
      icon: "🌐",
    },
    {
      title: "Frontend Developement",
      description:
        "Crafting intuitive and user-friendly designs with modern tools and practices.",
      icon: "🎨",
    },
    {
      title: "Backend Development",
      description:
        "Creating robust, secure, and scalable server-side applications and APIs.",
      icon: "⚙️",
    },
    {
      title: "GitHub",
description: "Managing repositories, version control, and collaborative development.",
icon: "🐙",

    },
  ];

  // ✅ Testimonials now with avatar + logo
  const testimonials = [
    {
      name: "Ali Khan",
      feedback:
        'Amazing work! Delivered the project on time with outstanding quality.',
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      logo: "🌟",
    },
    {
      name: "Sarah Ahmed",
      feedback:
        'Very professional and easy to work with. Highly recommended!',
      rating: 4,
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      logo: "💼",
    },
    {
      name: "John Doe",
      feedback: 'Creative solutions and great communication throughout.',
      rating: 5,
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      logo: "🚀",
    },
  ];

  return (
    <section id="services" className="py-20 bg-gray-900 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-gray-900 -z-10" />

      {/* Animated Background Shapes */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {shapes.map((shape, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, 15, 0], rotate: [0, 180, 360] }}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute rounded-full bg-indigo-500/10 backdrop-blur-sm"
            style={{
              width: `${shape.width}px`,
              height: `${shape.height}px`,
              left: `${shape.left}%`,
              top: `${shape.top}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            My <span className="text-indigo-400">Services</span>
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            I provide end-to-end solutions for web and mobile development,
            ensuring performance, design, and scalability.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700/50 text-center hover:border-indigo-400 hover:shadow-indigo-500/20 transition-all"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {service.title}
              </h3>
              <p className="text-gray-400 text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mt-20"
        >
          <h3 className="text-3xl font-bold text-center text-white mb-10">
            What <span className="text-indigo-400">Clients Say</span>
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700/50 hover:border-indigo-400 transition-all shadow-lg"
              >
                {/* Avatar + Logo */}
                <div className="flex items-center mb-4">
                 <Image
  src={testimonial.avatar}
  alt={testimonial.name}
  width={48}
  height={48}
  className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover"
/>

                  <div className="ml-4">
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <span className="text-indigo-400 text-sm">{testimonial.logo}</span>
                  </div>
                </div>

                {/* Feedback */}
                <p className="text-gray-300 italic mb-4">
                  {testimonial.feedback}
                </p>

                {/* Rating */}
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`${
                        i < testimonial.rating
                          ? "text-yellow-400"
                          : "text-gray-600"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
