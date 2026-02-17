'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import featureImg from '@/../public/card.png'

const Features = () => {
  const imageVariants = {
    initial: { scale: 1.2, opacity: 0 },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        duration: 1.2,
        ease: "easeOut"
      }
    }
  };

  const textVariants = {
    initial: { y: 30, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const gradientTextStyle = {
    backgroundImage: 'linear-gradient(45deg, #484813, #505025)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    color: 'transparent'
  };

  return (
    <section className="relative py-32 bg-gradient-to-b from-neutral-100 to-neutral-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(22,101,52,0.1),transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto px-6 relative">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center"
        >
          <motion.div
            variants={textVariants}
            className="relative z-10"
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "60px" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-1 bg-[#504620] mb-8"
            />
            
            <motion.h2 
              className="text-4xl md:text-5xl font-light mb-8 leading-tight font-dance"
              style={gradientTextStyle}
            >
              Our Approach
            </motion.h2>
            
            <motion.p 
              className="text-lg text-[#584e29] leading-relaxed mb-8 font-montserrat"
              variants={textVariants}
            >
              We believe in the power of design to shape culture and drive meaningful change. 
              Our process combines strategic thinking with creative excellence to deliver 
              results that exceed expectations.
            </motion.p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-[#504620] text-white rounded-full 
                         shadow-lg hover:shadow-xl transition-all duration-300
                         hover:bg-[#31290b] font-montserrat"
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#cac5b3] rounded-full blur-3xl" />
            
            <motion.div
              variants={imageVariants}
              className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl
                         transform rotate-3 hover:rotate-0 transition-transform duration-500
                         before:absolute before:-inset-1 before:bg-gradient-to-r 
                         before:from-[#98927c] before:to-[#b8b096] before:-z-10 
                         before:rounded-2xl before:blur-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={featureImg} 
                  alt="Our Approach Illustration"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-6 -right-6 bg-white px-6 py-4 rounded-lg shadow-lg"
              >
                <h3 className="text-xl font-medium text-green-900 mb-1 font-Inconsolata">ERYX Media</h3>
                <p className="text-neutral-600 font-montserrat">Envision. Execute. Excel</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;