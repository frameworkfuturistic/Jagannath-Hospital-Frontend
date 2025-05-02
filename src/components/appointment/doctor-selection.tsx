'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { StarIcon, Clock, Calendar, Users, ThumbsUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

interface Doctor {
  ConsultantID: number;
  ConsultantName: string;
  Fee?: number;
  Specialty?: string;
  Experience?: number;
  Rating?: number;
  PatientCount?: number;
  NextAvailable?: string;
  Specialization?: string;
  ImageUrl?: string;
  ConsultantType?: string;
  Department?: string;
}

interface DoctorSelectionProps {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (doctorId: string) => void;
  disabled: boolean;
}

export default function DoctorSelection({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  disabled,
}: DoctorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  console.log('doctors', doctors);
  // Add some mock data to enhance the doctor cards
  const enhancedDoctors = doctors.map((doctor) => ({
    ...doctor,
    Specialty: doctor.Specialty || 'speclist',
    Experience: doctor.Experience || 'experienced',
    Rating: doctor.Rating || getRandomRating(),
    PatientCount: doctor.PatientCount || 'N/A',
    NextAvailable: doctor.NextAvailable || 'Full-Time',
  }));

  const filteredDoctors = enhancedDoctors.filter(
    (doctor) =>
      doctor.ConsultantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.Specialty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (disabled) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Users className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 text-center">
          Please select a department first to view available doctors.
        </p>
      </div>
    );
  }

  if (doctors.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search doctors by name or specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredDoctors.map((doctor) => (
            <motion.div
              key={doctor.ConsultantID}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                  selectedDoctorId === doctor.ConsultantID.toString()
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelectDoctor(doctor.ConsultantID.toString())}
              >
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-1/3 bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex flex-col items-center justify-center text-white">
                      <Avatar className="h-16 w-16 border-2 border-white">
                        <AvatarImage
                          src={
                            doctor.ImageUrl ||
                            `/placeholder.svg?height=80&width=80`
                          }
                          alt={doctor.ConsultantName}
                        />
                        <AvatarFallback className="bg-blue-700 text-white">
                          {getInitials(doctor.ConsultantName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="mt-2 text-center">
                        <div className="flex items-center justify-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-3 w-3 ${
                                i < Math.floor(doctor.Rating || 0)
                                  ? 'text-yellow-300 fill-yellow-300'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-xs mt-1 font-medium">
                          {doctor.Rating?.toFixed(1)} / 5
                        </div>
                      </div>
                    </div>

                    <div className="w-2/3 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-gray-800">
                            {doctor.ConsultantName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {doctor.Specialization || doctor.Department}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          ₹{doctor.Fee}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          <span>available: {doctor.NextAvailable}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Calendar className="h-3 w-3 mr-1 text-blue-500" />
                          <span>{doctor.ConsultantType} </span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Users className="h-3 w-3 mr-1 text-blue-500" />
                          <span>{doctor.PatientCount}+ patients</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <ThumbsUp className="h-3 w-3 mr-1 text-blue-500" />
                          <span>
                            {Math.round((doctor.Rating || 4) * 20)}%
                            satisfaction
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper functions to generate random data for the mock doctor profiles

function getRandomExperience() {
  return Math.floor(Math.random() * (8 - 3 + 1)) + 3; // 3-8 years
}

function getRandomRating() {
  return Math.random() * 1.5 + 3.5; // 3.5-5.0 rating
}

function getRandomPatientCount() {
  return (Math.floor(Math.random() * 9) + 1) * 100; // 1000-9000 patients
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
