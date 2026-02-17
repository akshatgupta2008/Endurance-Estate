'use client';
import { m as motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import predImg from '../../../../public/price-pred.jpg';
import auctionImg from '../../../../public/live-auction.jpg'; 
import rentalImage from '../../../../public/rental-property.jpg'; 
import maintainImg from '../../../../public/lease-maintenance.jpg'; 
import { ArrowRight } from 'lucide-react';
import message from "@/../public/message.png"; 

const Services = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const textHoverVariants = {
    initial: { 
      opacity: 1,
      scale: 1
    },
    hover: { 
      opacity: 0.8,
      scale: 1.05,
      transition: { duration: 0.3 } 
    }
  };

  const imageHoverVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.3 } }
  };

  const buttonHoverVariants = {
    initial: { 
      scale: 1,
      
    },
    hover: { 
      scale: 1.05,
      
      transition: { duration: 0.2 } 
    }
  };

  const services = [
    {
      title: 'Price Prediction',
      description: 'Accurately predict real estate prices using advanced data analytics and AI-driven models. Stay ahead with insights on market trends, location, and economic factors.',
      image: predImg,
      imageAlt: 'Price Prediction',
      imageSize: '3/4',
      link: '/predict'
    },
    {
      title: 'Live Auction',
      description: 'Join live real estate auctions for competitive bidding and instant property deals. Experience a fast, transparent, and secure way to buy and sell properties in real time.',
      image: auctionImg,
      imageAlt: 'Live Auction',
      imageSize: '4/3',
      link: '/properties'
    },
    {
      title: 'Rental Property',
      description: 'Find the perfect rental property with ease—whether it’s a home, apartment, or commercial space. Explore verified listings and secure your ideal rental hassle-free.',
      image: rentalImage,
      imageAlt: 'Rental Property',
      imageSize: '3/4',
      link: '/rental-property'
    },
    {
      title: 'Lease property maintenance',
      description: 'Ensure your leased property stays in top condition with our professional maintenance services. From repairs to regular upkeep, we handle it all efficiently and hassle-free.',
      image: maintainImg,
      imageAlt: 'Lease property maintenance ',
      imageSize: '4/3',
      link: '/lease-property-maintenance'
    }
  ];

  return (
    <section className="bg-white">
      <motion.h2
        initial={{ opacity: 0, y: 20}}
        animate={{ opacity: 1, y: 10 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-bold font-dance text-center text-green-900 mb-16 pt-24"
      >
        Our Services
      </motion.h2>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="space-y-16"
      >
        {services.map((service, index) => (
          <motion.div
            key={service.title}
            variants={itemVariants}
            className={`flex flex-col-reverse md:flex-row ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } min-h-[600px] items-center justify-center bg-neutral-100`}
          >
            <motion.div
              className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-6"
            >
              <motion.h3
                variants={textHoverVariants}
                initial="initial"
                whileHover="hover"
                className="text-3xl md:text-4xl font-light text-green-900 mb-4 cursor-pointer font-Inconsolata"
              >
                {service.title}
              </motion.h3>
              <motion.p
                variants={textHoverVariants}
                initial="initial"
                whileHover="hover"
                className="text-lg md:text-xl text-neutral-600 font-montserrat"
              >
                {service.description}
              </motion.p>
              <motion.div
                variants={buttonHoverVariants}
                initial="initial"
                whileHover="hover"
                className="pt-4"
              >
                <Link href={service.link}>
                  <span className="inline-block px-6 py-3 text-slate-700 rounded-md cursor-pointer">
                    Read More
                    <ArrowRight size={24} className="inline-block ml-2" />
                  </span>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              className="w-full md:w-1/2 relative h-[400px] md:h-[600px]"
            >
              <Link href={service.link}>
                <motion.div
                  variants={imageHoverVariants}
                  initial="initial"
                  whileHover="hover"
                  className="relative w-full h-full cursor-pointer"
                >
                  <Image
                    src={service.image}
                    alt={service.imageAlt}
                    quality={95}
                    priority={index === 0}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>
        ))}
        
      </motion.div>

    </section>
  );
};

export default Services;