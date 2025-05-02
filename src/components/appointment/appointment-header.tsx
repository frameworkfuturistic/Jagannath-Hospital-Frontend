'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AppointmentHeader() {
  return (
    <div className="bg-[url('/hospital/hospitallogo.png?height=300&width=1920')] bg-cover bg-center">
      <div className="bg-blue-900 bg-opacity-75 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <Image
            src="/hospital/hospitallogo.png?height=100&width=100"
            alt="Hospital logo"
            width={100}
            height={100}
            className="w-16 h-16 sm:w-20 sm:h-20"
          />
          <div className="text-center md:text-left text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold uppercase text-white">
              Shree Jagannath Hospital & Research Center
            </h1>
            <p className="flex flex-col md:flex-row justify-center md:justify-evenly text-sm sm:text-md lg:text-lg text-gray-300 space-y-2 md:space-y-0 md:space-x-4">
              Mayor's Road - Booty Road, Radium Rd, Behind Machali Ghar, Ranchi,
              Jharkhand 834001
            </p>
            <div className=" flex flex-col items-center text-center mt-4">
              <h1 className="text-2xl font-bold ">
                Patient Appointment System
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Book your appointment in a few easy steps
              </p>
              <Button asChild variant="secondary" className="mt-4">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Home
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 hidden md:block">
            {' '}
            <Image
              src="/hospital/nabhlogo.png"
              alt="Hospital logo"
              width={100}
              height={100}
              className="w-16 h-16 sm:w-20 sm:h-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
