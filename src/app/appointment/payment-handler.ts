import axios from 'axios';
import { toast } from "sonner"

const API_BASE_URL = 'https://sjhrc.in/backend/api/v1';

export const handleAppointmentAndPayment = async (data: any, state: any, dispatch: any) => {
  try {
    // Step 1: Create appointment
    const appointmentData = {
      ConsultantID: data.doctorId,
      MRNo: state.patientData?.MRNo,
      ConsultationDate: data.appointmentDate,
      SlotID: data.slotId,
      SlotToken: data.slotToken,
      Pending: 1,
      Remarks: data.reason,
      PatientName: state.patientData?.PatientName,
      MobileNo: state.patientData?.MobileNo,
    };

    const appointmentResponse = await axios.post(`${API_BASE_URL}/appointments`, appointmentData);
    
    if (!appointmentResponse.data || !appointmentResponse.data.appointment || !appointmentResponse.data.appointment.OPDOnlineAppointmentID) {
      throw new Error('Invalid appointment response from server');
    }

    const appointmentId = appointmentResponse.data.appointment.OPDOnlineAppointmentID;

    // Step 2: Initiate payment
    const paymentData = {
      OPDOnlineAppointmentID: appointmentId,
      AmountPaid: state.selectedDoctor?.Fee || 0,
      PaymentMode: 'Online',
    };

    const paymentResponse = await axios.post(`${API_BASE_URL}/payments`, paymentData);

    if (!paymentResponse.data.order_id) {
      throw new Error('Order ID not found in the payment response.');
    }

    // Step 3: Configure Razorpay
    const razorpayOptions = {
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentData.AmountPaid * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'Shree Jagannath Hospital & Research Centre',
      description: 'Appointment Payment',
      order_id: paymentResponse.data.order_id,
      handler: async function (response: any) {
        try {
          const callbackPaymentData = {
            OPDOnlineAppointmentID: appointmentId,
            PaymentMode: 'Razorpay',
            PaymentStatus: 'Paid',
            AmountPaid: paymentData.AmountPaid,
            TransactionID: response.razorpay_payment_id,
          };

          // Send callback data to the backend
          await axios.post(`${API_BASE_URL}/payments/callback`, callbackPaymentData);

          // Update appointment status
          await axios.put(`${API_BASE_URL}/appointments/${appointmentId}`, {
            Pending: 0,
            TransactionID: response.razorpay_payment_id,
          });

          dispatch({ type: 'SET_PAYMENT_STATUS', payload: 'success' });
          toast("Payment Successful", {
            description: 'Your payment has been processed and appointment confirmed.',
       });
          
          

          if (state.temporaryAppointmentId) {
            sessionStorage.removeItem(state.temporaryAppointmentId);
          }
        } catch (error) {
          console.error('Error updating payment or appointment status:', error);
          toast('Payment Error',{
            description: 'Payment was processed, but there was an error confirming your appointment.',
           
          });
        } finally {
          dispatch({ type: 'SET_IS_PROCESSING_PAYMENT', payload: false });
        }
      },
      prefill: {
        name: state.patientData?.PatientName,
        contact: state.patientData?.MobileNo,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const razorpay = new (window as any).Razorpay(razorpayOptions);
    razorpay.open();

    return appointmentResponse.data.data;
  } catch (error: any) {
    console.error('Error in handleAppointmentAndPayment:', error);
    let errorMessage = 'Error processing appointment and payment';

    if (error.response) {
      errorMessage = error.response.data?.message || errorMessage;
      console.error('Error response data:', error.response.data);
    } else if (error.request) {
      errorMessage = 'No response from the server';
      console.error('Error request data:', error.request);
    } else {
      errorMessage = error.message;
      console.error('Error message:', error.message);
    }

    toast("Payment Error", {
        description: errorMessage,
      });
      throw new Error(errorMessage);
  }
};

