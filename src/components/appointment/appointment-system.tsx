'use client';

import { useState } from 'react';
import { AppointmentProvider } from '@/context/appointment-context';

import AppointmentStepper from './appointment-stepper';
import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/loading-spinner';

const SlotSelection = dynamic(() => import('./steps/slot-selection'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const PatientDetails = dynamic(() => import('./steps/patient-details'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const PaymentStep = dynamic(() => import('./steps/payment-step'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const ConfirmationStep = dynamic(() => import('./steps/confirmation-step'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

import RazorpayLoader from '@/lib/razorpay-loader';

export default function AppointmentSystem() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 'choose-slot',
      component: <SlotSelection onNext={() => setCurrentStep(1)} />,
    },
    {
      id: 'patient-details',
      component: (
        <PatientDetails
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />
      ),
    },
    {
      id: 'payment',
      component: (
        <PaymentStep
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      ),
    },
    {
      id: 'confirmation',
      component: <ConfirmationStep onBack={() => setCurrentStep(2)} />,
    },
  ];

  return (
    <AppointmentProvider>
      <RazorpayLoader />

      {/* <AppointmentHeader /> */}
      <div className="container mx-auto px-4 py-8">
        <AppointmentStepper currentStep={currentStep} />
        <div className="mt-8">{steps[currentStep].component}</div>
      </div>
    </AppointmentProvider>
  );
}
