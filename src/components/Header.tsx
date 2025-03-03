'use client';
import {
  Clock10Icon,
  MapPinIcon,
  Phone,
 
} from 'lucide-react';
import { FaFacebookF, FaInstagram, FaYoutube, FaTwitter } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import React from 'react';

import Link from 'next/link';

const Header = () => {
  return (
    <section>
      {/* Top Bar */}

      <div className="hidden lg:flex justify-between items-center py-4 text-xs text-gray-100 px-8 bg-primary">
        <div className="flex items-center space-x-4">
          <Link
            href=""
            className="flex items-center hover:text-primary-foreground transition-colors"
          >
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="">
              Mayor's Road - Booty Road, Radium Rd, Behind Machali Ghar, Ranchi,
              Jharkhand 834001
            </span>
          </Link>

          <Link
            href="https://wa.me/8987999200"
            className="flex items-center hover:text-primary-foreground transition-colors"
          >
            <Phone className="h-4 w-4 mr-1" />
            <span>+91 89879 99200</span>
          </Link>
          <Link
            href="https://wa.me/9471373714"
            className="flex items-center hover:text-primary-foreground transition-colors"
          >
            <Phone className="h-4 w-4 mr-1" />
            <span>+91 94713 73714</span>
          </Link>

          <Link
            href=""
            className="flex items-center hover:text-sidebar-primary-foreground transition-colors"
          >
            <Clock10Icon className="h-4 w-4 mr-1" />
            <span className="">24X7 Emergency Service Available</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://www.facebook.com/sjhrc.in"
            className="flex items-center hover:text-primary transition-colors"
          >
            <FaFacebookF className="h-4 w-4 mr-1" />
          </Link>

          <Link
            href="https://x.com/Sjhrcranchi"
            className="flex items-center hover:text-primary transition-colors"
          >
            <FaTwitter className="h-4 w-4 mr-1" />
          </Link>

          <Link
            href="https://www.instagram.com/shreejagannathhospital/"
            className="flex items-center hover:text-primary transition-colors"
          >
            <FaInstagram className="h-4 w-4 mr-1" />
          </Link>

          <Link
            href="https://www.youtube.com/@sjhrcjagannath9636"
            className="flex items-center hover:text transition-colors"
          >
            <FaYoutube className="h-4 w-4 mr-1" />
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <Navbar />
    </section>
  );
};

export default Header;
