import { type LucideIcon, Heart, Bed, Microscope, Cog, Activity, Pill, UserPlus, Hospital, Clock, CreditCard, Scan, BrainCircuit, Radiation, HeartPulse, FlaskConical, Droplet, Syringe, PillIcon, Stethoscope, SyringeIcon, ActivityIcon, Footprints, MilkOff, Salad, Music, Zap } from 'lucide-react'

export interface ServiceItem {
  name: string
  icon: LucideIcon
  description: string
  image: string
  details: string[]
}

export interface ServiceCategory {
  name: string
  icon: LucideIcon
  color: string
  image: string
  about: string
  items: ServiceItem[]
}

export const serviceCategories: ServiceCategory[] = [
    {
        name: '24x7 Services',
        icon: Heart,
        color: 'bg-blue-100 text-blue-700',
        image: '/emergency/ambu.jpg',
        about:
          'Our 24x7 services ensure round-the-clock care for all patients, providing continuous support and immediate attention when needed.',
        items: [
          {
            name: 'Emergency and Trauma Unit',
            icon: Zap,
            description:
              '24/7 emergency care for critical conditions and injuries.',
            image: '/emergency/emergency.jpg',
            details: [
              'State-of-the-art emergency room equipped to handle all types of medical emergencies',
              'Dedicated trauma bay for immediate care of severely injured patients',
              'Triage system to prioritize critical patients',
              'Direct access to on-call specialists',
              'Fully equipped ambulances for rapid response',
            ],
          },
          {
            name: 'BLS Ambulance',
            icon: Activity,
            description: 'Basic Life Support ambulances available round the clock.',
            image: '/emergency/ambu.jpg',
            details: [
              'Modern fleet of ambulances equipped for emergency response',
              'Trained paramedics and EMTs available 24/7',
              'GPS-enabled for quick routing',
              'Essential life-saving equipment on board',
              'Regular maintenance for full readiness',
            ],
          },
          {
            name: 'Dialysis (AKD)',
            icon: Activity,
            description:
              'Continuous renal replacement therapy for acute kidney disorders.',
            image: '/emergency/operation-ot.jpg',
            details: [
              'Advanced dialysis machines for effective treatment',
              'Consultations with specialized nephrologists',
              'Trained nursing staff in renal care',
              'Flexible scheduling for convenience',
              'Ongoing monitoring for optimized care',
            ],
          },
          {
            name: 'Pharmacy',
            icon: Pill,
            description: 'Full-service pharmacy open 24 hours a day.',
            image: '/emergency/pharmacy.jpg',
            details: [
              'Wide range of medications available',
              'Experienced pharmacists for consultations',
              'Accurate prescription filling system',
              'Coordination with hospital departments',
              'Home delivery for discharged patients',
            ],
          },
          {
            name: 'Front Office',
            icon: UserPlus,
            description: 'Always available for inquiries and assistance.',
            image: '/emergency/front.jpg',
            details: [
              '24/7 reception for patient and visitor assistance',
              'Multilingual staff for diverse needs',
              'Efficient admission and discharge processes',
              'Information center for services and schedules',
              'Complaint and feedback system',
            ],
          },
          {
            name: 'Intensive Care Unit (ICU+HDU)',
            icon: Heart,
            description:
              'Advanced critical care facilities with High Dependency Units.',
            image: '/emergency/emergency.jpg',
            details: [
              '24/7 monitoring by trained specialists',
              'Cutting-edge medical equipment',
              'Private rooms for patient comfort',
              'Seamless access to diagnostics and specialists',
              'Dedicated infection control measures',
            ],
          },
          {
            name: 'Ultra Modular Complex OT',
            icon: Hospital,
            description:
              'Fully equipped operation theatres for all types of surgeries.',
            image: '/emergency/modular-ot.jpg',
            details: [
              'Latest surgical technology for precision and safety',
              'Sterile environment with infection control',
              'Advanced anesthesia monitoring systems',
              'Specialized teams for various surgeries',
              '24/7 availability for emergency surgeries',
            ],
          },
          {
            name: 'Day Care Services',
            icon: Clock,
            description: 'Daycare facilities for minor procedures and surgeries.',
            image: '/emergency/daycare.jpg',
            details: [
              'Efficient procedures with same-day discharge',
              'Dedicated nursing care for post-procedure recovery',
              'State-of-the-art equipment for minor surgeries',
              'Flexible appointment scheduling',
              'Comfortable recovery spaces',
            ],
          },
          {
            name: 'Cashless Services',
            icon: CreditCard,
            description:
              'Cashless treatment options available through partner insurance providers.',
            image: '/emergency/cashless.jpg',
            details: [
              'Cashless claims for a hassle-free experience',
              'Network of partner insurance providers',
              'Assistance with claim processing',
              '24/7 support for insurance-related queries',
              'Seamless coordination with finance department',
            ],
          },
        ],
      },
      {
        name: 'Rooms & Bed Services',
        icon: Bed,
        color: 'bg-green-100 text-green-700',
        image: '/rooms/deluxe-room.jpg',
        about:
          "We offer a range of comfortable and well-equipped rooms to suit every patient's needs, ensuring a restful and healing environment during their stay.",
        items: [
          {
            name: 'Deluxe Room',
            icon: Bed,
            description: 'Comfortable private rooms with modern amenities.',
            image: '/rooms/deluxe-room.jpg',
            details: [
              'Private room with en-suite bathroom',
              'Adjustable bed for patient comfort',
              'TV and Wi-Fi for entertainment',
              'Daily housekeeping services',
              'Visitor seating for comfort',
            ],
          },
          {
            name: 'Super Deluxe Room',
            icon: Bed,
            description: 'Extra-spacious room with luxury amenities.',
            image: '/rooms/super-dekuxe.jpg',
            details: [
              'Enhanced room size for added comfort',
              'Advanced medical equipment for safety',
              'Private living area and dining space',
              'Personalized meal services',
              '24/7 nursing and doctor care',
            ],
          },
          {
            name: 'Single Room',
            icon: Bed,
            description: 'Private room for a more personal and quiet environment.',
            image: '/rooms/single-room.jpg',
            details: [
              'Private space with single occupancy',
              'En-suite bathroom for convenience',
              'Television and comfortable seating',
              'Daily maintenance for hygiene',
              '24/7 nursing and doctor rounds',
            ],
          },
          {
            name: 'Twin Sharing Room',
            icon: Bed,
            description: 'Economical option with two beds per room.',
            image: '/rooms/Twin-sharing.jpg',
            details: [
              'Two beds separated by privacy curtains',
              'Shared bathroom and seating area',
              'Visitor space for each patient',
              'Daily maintenance and sanitation',
              '24/7 nursing care',
            ],
          },
          {
            name: 'General Ward (Male)',
            icon: Bed,
            description: 'Multi-bed wards for male patients.',
            image: '/rooms/General-ward.jpg',
            details: [
              'Efficient ward layout for easy monitoring',
              'Shared bathroom and dining area',
              'Communal space for recreation',
              'Regular medical rounds by doctors',
              'Round-the-clock nursing care',
            ],
          },
          {
            name: 'General Ward (Female)',
            icon: Bed,
            description: 'Multi-bed wards for female patients.',
            image: '/rooms/General-ward-female.jpg',
            details: [
              'Separate ward for female patients',
              'Communal recreation and dining areas',
              '24/7 nursing and medical staff',
              'Privacy measures for comfort',
              'Daily monitoring by doctors',
            ],
          },
        ],
      },
      {
        name: 'Imaging Services',
        icon: Microscope,
        color: 'bg-purple-100 text-purple-700',
        image: '/imaging/color-d.jpg',
        about:
          'Our state-of-the-art diagnostic services utilize cutting-edge technology to provide accurate and timely results, aiding in precise diagnosis and treatment planning.',
        items: [
          {
            name: 'Color Doppler',
            icon: Scan,
            description: 'High-resolution imaging for blood flow assessment.',
            image: '/imaging/color-d.jpg',
            details: [
              'Real-time color Doppler imaging',
              'Specialized for vascular and cardiac evaluations',
              'Non-invasive and safe procedure',
              'Detailed blood flow assessment',
              'Immediate reporting by specialists',
            ],
          },
          {
            name: 'CT Scan',
            icon: Scan,
            description:
              'High-precision imaging for detailed internal assessments.',
            image: '/imaging/ctscan.jpg',
            details: [
              'Advanced multi-slice CT scanner for rapid imaging',
              '3D reconstruction for accurate diagnosis',
              'Non-invasive procedure with quick results',
              'Ideal for trauma, neurological, and vascular imaging',
              'Available 24/7 for emergency cases',
            ],
          },
    
          {
            name: 'Ultrasound',
            icon: BrainCircuit,
            description: 'Sound wave imaging for a variety of medical conditions.',
            image: '/imaging/ultrasound.jpg',
            details: [
              'Non-invasive ultrasound technology',
              'Useful for abdominal, pelvic, and vascular assessments',
              'Safe for all patients including pregnant women',
              'Real-time imaging for quick diagnostics',
              '24/7 availability for emergency diagnostics',
            ],
          },
          {
            name: 'X-Ray',
            icon: Radiation,
            description: 'Digital X-ray imaging for quick diagnostics.',
            image: '/imaging/x-ray.jpg',
            details: [
              'Advanced digital X-ray technology for clearer images',
              'Rapid results for bone fractures and internal injuries',
              'Safe procedure with minimal radiation exposure',
              'Portable X-ray machines for bed-side imaging',
              '24/7 service for emergency cases',
            ],
          },
          {
            name: 'ECG',
            icon: HeartPulse,
            description: 'Electrocardiogram for monitoring heart activity.',
            image: '/imaging/ecg.jpg',
            details: [
              'Non-invasive procedure to monitor heart rhythms',
              'Useful for diagnosing heart attacks and arrhythmias',
              'Instant results with real-time monitoring',
              'Performed by trained cardiologists',
              'Available 24/7 for emergency cardiac care',
            ],
          },
        ],
      },
      {
        name: 'Pathology Services',
        icon: Microscope,
        color: 'bg-red-100 text-red-700',
        image: '/pathology/biochemistry.jpg',
        about:
          'Our comprehensive pathology services are equipped with state-of-the-art diagnostic tools and highly qualified pathologists to ensure accurate and timely results for various tests and analyses. We offer a wide range of pathology services, including biochemistry, microbiology, hematology, histopathology, serology, and hormone analysis to support diagnosis and treatment plans.',
        items: [
          {
            name: 'Biochemistry',
            icon: FlaskConical,
            description:
              'Comprehensive biochemical testing for diagnostic purposes.',
            image: '/pathology/Biochemistry.jpg',
            details: [
              'Analysis of blood and body fluids for metabolic and organ function assessment',
              'Testing for glucose, cholesterol, enzymes, and electrolytes',
              'Advanced equipment for precise and quick results',
              'Vital for diagnosing conditions like diabetes, liver disorders, and kidney diseases',
              'Routine and specialized tests available round the clock',
            ],
          },
          {
            name: 'Microbiology',
            icon: Music,
            description:
              'Laboratory analysis of infections and microbial cultures.',
            image: '/pathology/Microbiology.jpg',
            details: [
              'Detection and identification of bacteria, viruses, fungi, and parasites',
              'Antibiotic sensitivity testing to guide treatment plans',
              'Specialized tests for infectious diseases like tuberculosis, COVID-19, and HIV',
              'State-of-the-art equipment for rapid culture and diagnostic analysis',
              'Infection control and epidemiology services available',
            ],
          },
          {
            name: 'Haematology',
            icon: Droplet,
            description:
              'Advanced blood testing for a wide range of medical conditions.',
            image: '/pathology/Hemat.jpg',
            details: [
              'Complete blood count (CBC) and blood coagulation profiles',
              'Detection and monitoring of blood disorders like anemia, leukemia, and clotting disorders',
              'Specialized equipment for accurate and quick analysis',
              'Bone marrow biopsy services available',
              'Routine and emergency services available 24/7',
            ],
          },
    
          {
            name: 'Serology',
            icon: Syringe,
            description: 'Blood tests for detecting antibodies and antigens.',
            image: '/pathology/serolog.jpeg',
            details: [
              'Testing for viral infections like HIV, hepatitis, and dengue',
              'Immunological tests for autoimmune diseases',
              'Accurate and rapid results for infectious disease detection',
              'Safe procedures with highly skilled laboratory technicians',
              'Regular screening tests and diagnostic services available',
            ],
          },
          {
            name: 'Hormone Analysis',
            icon: PillIcon,
            description:
              'Specialized testing for endocrine disorders and hormone levels.',
            image: '/pathology/Hormone.webp',
            details: [
              'Assessment of thyroid, adrenal, and reproductive hormones',
              'Tests for conditions like diabetes, PCOS, and infertility',
              'Advanced technology for accurate and timely results',
              'Routine and specialized tests available for men and women',
              'Consultation with endocrinologists for tailored treatment plans',
            ],
          },
        ],
      },
      {
        name: 'Other Services',
        icon: Cog,
        color: 'bg-yellow-100 text-yellow-700',
        image: '/other/Bronchoscop.jpeg',
        about:
          'Our hospital provides a variety of additional specialized services to ensure comprehensive care. From diagnostic procedures like endoscopies and bronchoscopies to support services like physiotherapy, dietetics, and even an in-house cafeteria, we cater to every aspect of patient well-being.',
        items: [
          {
            name: 'Bronchoscopy',
            icon: Stethoscope,
            description: 'A diagnostic procedure to examine the lungs and airways.',
            image: '/other/Bronchoscop.jpeg',
            details: [
              'Minimally invasive procedure using a bronchoscope',
              'Used to diagnose lung infections, blockages, and other conditions',
              'Performed by skilled pulmonologists in a sterile environment',
              'Real-time imaging to guide diagnosis and treatment',
              'Safe procedure with quick recovery time',
            ],
          },
          {
            name: 'Colonoscopy',
            icon: SyringeIcon,
            description:
              'Endoscopic examination of the large intestine (colon) for diagnostic purposes.',
            image: '/other/Colonoscopyn.jpg',
            details: [
              'Procedure to detect colon polyps, cancer, and other abnormalities',
              'Real-time visualization using a flexible colonoscope',
              'Performed by experienced gastroenterologists',
              'Early detection of colorectal issues for timely intervention',
              'Minimal recovery time and high patient safety',
            ],
          },
          {
            name: 'Upper GI Endoscopy',
            icon: ActivityIcon,
            description:
              'Endoscopic procedure to examine the upper gastrointestinal tract.',
            image: '/other/Endoscopy.webp',
            details: [
              'Used to diagnose conditions like ulcers, GERD, and esophageal issues',
              'Performed by expert gastroenterologists',
              'Real-time imaging for accurate diagnosis and treatment',
              'Minimally invasive with quick recovery',
              'Safe and efficient procedure with sedation available',
            ],
          },
          {
            name: 'Physiotherapy',
            icon: Footprints,
            description:
              'Therapeutic exercises and treatments to aid recovery and improve mobility.',
            image: '/other/phy.jpg',
            details: [
              'Personalized treatment plans for musculoskeletal, neurological, and cardiovascular conditions',
              'Specialized in post-operative rehabilitation and injury recovery',
              'Experienced physiotherapists using advanced equipment',
              'Focus on restoring mobility, strength, and functionality',
              'One-on-one sessions and group therapy options available',
            ],
          },
          {
            name: 'Dietetics',
            icon: MilkOff,
            description:
              'Nutritional counseling and personalized diet plans for patients.',
            image: '/other/Dietetics.jpg',
            details: [
              'Customized meal plans for various health conditions',
              'Expert dieticians providing nutritional guidance for diabetes, heart disease, obesity, and more',
              'Nutritional support for patients undergoing treatments like chemotherapy and dialysis',
              'Focus on healthy eating habits to improve patient outcomes',
              'Inpatient and outpatient diet consultation services available',
            ],
          },
          {
            name: 'Cafeteria',
            icon: Salad,
            description:
              'On-site cafeteria offering healthy meals for patients and visitors.',
            image: '/other/Cafeteria.jpg',
            details: [
              'Wide variety of nutritious and freshly prepared meals',
              'Special dietary options available for patients (low sodium, diabetic, gluten-free, etc.)',
              'Comfortable seating area for patients, visitors, and staff',
              'Open daily with convenient hours',
              'Strict hygiene and quality standards to ensure safe food preparation',
            ],
          },
        ],
      },
]



export const emergencyServices: string[] = [
    'The policy at SJHRC is to provide initial medical care to all emergency patients & also to guide transfer of patients who do not match with the scope of services to a suitable facility.',
    'The emergency protocol and procedure for emergency care is documented.',
    'SJHRC do not issue death certificate for brought dead cases without a post mortem to ascertain the cause of death. Entry is made in brought death register.',
    'The policy at SJHRC is to handle medico-legal cases as per documented procedure and police intimation is also done.',
    'The procedure for handling of medico-legal cases is documented',
    'In emergency, resuscitation and stabilization of the patient will be carried out first and medico-legal formalities are performed subsequently.',
    'Patient care is provided in consonance with documented procedure described.',
    'All the staffs working in emergency area are oriented to the policies & procedures through periodic internal training and EMOs and Nursing Staff in the emergency are trained in BLS as well as ACLS.',
    "Admission of patients is documented in patient's records as well as in and Discharge Summary ",
    "In case of transfer to another organization the evidence is documented in patient's medical record.",
    'For emergency cases initial medical care is given & then the patient is admitted or transferred to another facility with a treatment Sheet or sent home as per patient condition.',
    'The records are maintained in the Emergency Master Register',
    'SJHRC is having two in-house ambulances which are equipped with Basic Life Support (BLS) facilities. The outsourced ambulance is equipped with Advanced Cardiac Life Support (ACLS) facilities and MOU',
    'Personnel, allotted in the ambulance are trained in BLS and are competent to handle medical emergency situations.',
    'A critical care ambulance is arranged in case of patient is in a critical condition or the patient is on ventilator.',
    'A doctor & a nurse/GDA staff accompany the unstable or critically ill patient.',
    'The ambulance driver is having valid driving license.',
  ];