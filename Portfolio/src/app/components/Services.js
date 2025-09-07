"use client";
import { motion } from 'framer-motion';

const services = [
  {
    title: "Basic Website",
    price: "$85",
    description: "Simple one-page website with responsive design and basic functionality.",
    features: ["1 Page Design", "Responsive Layout", "Basic SEO", "Contact Form"]
  },
  {
    title: "Standard Web App",
    price: "$150",
    description: "Multi-page application with custom functionality and backend integration.",
    features: ["Up to 5 Pages", "Database Integration", "User Authentication", "API Integration"]
  },
  {
    title: "Premium Solution",
    price: "$1000+",
    description: "Complex web applications with advanced features and custom development.",
    features: ["Custom Design", "Advanced Functionality", "Scalable Architecture", "Ongoing Support"]
  }
];

const clients = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechNova Solutions",
    description: "This solution transformed our customer engagement metrics. The intuitive interface and powerful analytics helped us increase conversions by 42%.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    logo: "TN"
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "CTO",
    company: "TechStart",
    description: "Implementation was seamless and the support team was exceptional. We reduced our operational costs by 30% while improving performance.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    logo: "TS"
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "E-commerce Manager",
    company: "ShopGlobal",
    description: "The customizable features allowed us to tailor the platform perfectly to our needs. Our team adoption rate was 95% in the first week.",
    avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    logo: "SG"
  },
  {
    id: 4,
    name: "David Wilson",
    role: "Founder",
    company: "GreenLeaf Organics",
    description: "Our new e-commerce platform increased online sales by 200% within the first quarter of launch.",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    logo: "GL"
  },
  {
    id: 5,
    name: "Olivia Martinez",
    role: "Creative Director",
    company: "PixelPerfect Agency",
    description: "The custom CMS built for our agency has streamlined our workflow and improved client satisfaction significantly.",
    avatar: "https://randomuser.me/api/portraits/women/25.jpg",
    logo: "PP"
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        {/* Services Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">My Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive solutions tailored to your business needs
          </p>
          <div className="w-20 h-1 bg-indigo-600 mx-auto mt-4 rounded-full"></div>
        </motion.div>
        
        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="bg-gradient-to-b from-gray-50 to-slate-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
              <div className="text-center mb-6 relative z-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-3xl font-bold text-indigo-600 mb-2">{service.price}</p>
                <p className="text-gray-600">{service.description}</p>
              </div>
              <ul className="space-y-3 mb-8 relative z-10">
                {service.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-medium transition-colors relative z-10">
                Get Started
              </button>
            </motion.div>
          ))}
        </div>
        
        {/* Clients Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Trusted By Industry Leaders</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Collaborating with innovative companies to deliver exceptional results
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            {clients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-24"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600">{client.logo}</div>
                  <p className="text-xs text-gray-500 mt-1">{client.company}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Client Success Stories</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Do not just take our word for it hear what our clients have to say
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {clients.slice(0, 3).map((client) => (
              <motion.div 
                key={client.id}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 relative"
              >
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <div className="flex items-center mb-4">
                  <img 
                    src={client.avatar} 
                    alt={client.name}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-indigo-100"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800">{client.name}</h4>
                    <p className="text-gray-600 text-sm">{client.role}, {client.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">{client.description}</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your digital presence?</h3>
          <p className="text-indigo-100 max-w-2xl mx-auto mb-6">
            Let discuss how we can create a custom solution tailored to your business needs.
          </p>
          <button className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg">
            Schedule a Consultation
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;