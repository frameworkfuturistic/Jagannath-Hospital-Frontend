'use client';
import { Calendar, User, CreditCard, Printer } from 'lucide-react';

interface AppointmentStepperProps {
  currentStep: number;
}

export default function AppointmentStepper({
  currentStep,
}: AppointmentStepperProps) {
  const steps = [
    {
      id: 'choose-slot',
      title: 'Choose Slot',
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      id: 'patient-details',
      title: 'Patient Details',
      icon: <User className="h-5 w-5" />,
    },
    {
      id: 'payment',
      title: 'Payment',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: 'confirmation',
      title: 'Confirmation',
      icon: <Printer className="h-5 w-5" />,
    },
  ];

  return (
    <div className="w-full px-4 py-5">
      <div className="relative">
        {/* Progress bar */}
        <div className="hidden sm:block absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 z-10 transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {step.icon}
              </div>
              <span
                className={` text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  index <= currentStep ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
