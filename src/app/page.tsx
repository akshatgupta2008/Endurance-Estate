import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/nav-bar/page';
import { m as motion, LazyMotion, domAnimation } from 'framer-motion';
import Head from 'next/head';
import {Hero} from '@/components/home/hero/page';
import Services from '@/components/home/services/page';
import Footer from '@/components/footer/page';

export default function Home() {
  return (
    <LazyMotion features={domAnimation} >
    <div className="min-h-screen">
        <Head>
          <title>Endurance States</title>
          <meta name="description" content="We are a design-driven agency creating meaningful digital experiences." />
        </Head>
      <main>
        <Navbar/>
        <Hero/>
        <Link href="/auction-form">Form</Link>
        {/* <Link href="/agreement">Agreement</Link> */}
        <Services/>
        <Footer/>
      </main>
    </div>
    </LazyMotion>
    
  )
}