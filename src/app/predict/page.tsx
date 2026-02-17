'use client';
import { useState } from 'react';
import Predict from '@/components/predict/page';
import Footer from '@/components/footer/page';
import HeroSection from '@/components/predict-comp/hero/page';

export default function Prediction() {
    return (
        <div>
            <HeroSection/>
            <Predict />
            <Footer />
        </div>
    )
}