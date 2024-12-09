'use client'

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { CalendarDays, Hospital, Stethoscope, User, ChevronLeft, ChevronRight, Star, Quote, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const patientReviews = [
  {
    id: 1,
    review: "Excellent and thoroughly professional treatment. Thanks to Dr Sudheer Kumar. Kind and courteous staff. Knee replacement operation done on my wife. She is being discharged on the 8 th day after operation.",
    image: "/people.png",
    name: "Anil.K Singh",
    occupation: "",
    rating: 5,
    date: "2024-12-06"
  },
  {
    id: 2,
    review: "I'm very thankful to all doctors (Dr. SUDHIR, Dr. Satyam, Dr. Chiranjib) who operate my uncle's Ankle, and also thanks to all nursing staffs of 2nd floor which really very cooperative and helpful. All the services of this hospital is really awesome like cleaning of hospital, behaviour of all staffs, food quality, overall good experience.😊",
    image: "/people.png",
    name: "Abhishek Singh",
    occupation: "",
    rating: 5,
    date: "2024-11-20"
  },
  {
    id: 3,
    review: "All the facilities here are good and I am happy to get the treatment and hope to get well soon. Thanks to the doctor and staff here for this.🙏",
    image: "/people.png",
    name: "Shaktiman Bhagat 110",
    occupation: "",
    rating: 4,
    date: "2024-10-25"
  },
  {
    id: 4,
    review: "Good for treatment but expensive also since in Ranchi what we can expect",
    image: "/people.png",
    name: "Ashish kumar",
    occupation: "Local Guide",
    rating: 4,
    date: "2024-06-30"
  },
  {
    id: 5,
    review: "My experience at hospital is very good, all the staff, doctors and nurses behaviour is so good so supporting 🙏🙏🙏.",
    image: "/people.png",
    name: "Himansu Sahu",
    occupation: "Marketing Executive",
    rating: 5,
    date: "2024-05-05"
  },
]

const stats = [
  { icon: CalendarDays, label: "Years of Experience", value: "14" },
  { icon: Stethoscope, label: "Medical Specialists", value: "14" },
  { icon: Hospital, label: "Advanced Treatments", value: "50" },
  { icon: User, label: "Happy Patients", value: "1 lakh+" },
]

export function AdvancedPatientReview() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const containerRef = useRef(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  const nextTestimonial = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' })
    }
  }

  const prevTestimonial = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const interval = setInterval(nextTestimonial, 8000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-hidden">
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/medical-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          y: backgroundY
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-white to-blue-50 z-10" />
      
      <div className="relative z-20 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
          style={{ y: textY }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Transforming Lives</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience world-class healthcare backed by years of expertise and thousands of satisfied patients.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute inset-0 rounded-2xl blur-lg transition-all duration-300 group-hover:from-white/30 group-hover:to-white/10" />
              <Card className="relative shadow-xl rounded-xl border overflow-hidden transition-all duration-300 group-hover:bg-white/20">
                <CardContent className="p-6 flex flex-col items-center">
                  <motion.div 
                    className="mb-4 relative"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full blur-md" />
                    <div className="relative bg-white rounded-full p-3">
                      <stat.icon className="h-8 w-8 text-indigo-600" />
                    </div>
                  </motion.div>
                  <p className="text-gray-900 font-medium text-center mb-2">{stat.label}</p>
                  <p className="text-4xl font-bold text-primary">{stat.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-center mb-2 text-gray-900">Patient Stories</h2>
          <p className="text-xl text-center mb-12 text-gray-600">Hear from those we've had the privilege to serve</p>
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {patientReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 snap-center px-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onHoverStart={() => setHoveredIndex(index)}
                  onHoverEnd={() => setHoveredIndex(null)}
                >
                  <Card className={`h-full border-none overflow-hidden transition-all duration-300 ${
                    hoveredIndex === index ? 'shadow-2xl shadow-indigo-500/20' : ''
                  }`}>
                    <CardContent className="p-6 h-full flex flex-col">
                      <Quote className="text-indigo-300 mb-4 h-8 w-8" />
                      <p className="text-gray-900 mb-4 flex-grow">{review.review}</p>
                      <div className="flex items-center mt-auto">
                        <Image
                          src={review.image}
                          alt={review.name}
                          width={50}
                          height={50}
                          className="rounded-full mr-4"
                        />
                        <div>
                          <h3 className="font-semibold text-black">{review.name}</h3>
                          <p className="text-gray-600 text-sm">{review.occupation}</p>
                        </div>
                      </div>
                      <div className="flex mt-4">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80"
              onClick={nextTestimonial}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col justify-center sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300"
            onClick={() => window.open('https://maps.app.goo.gl/fBAoGFnkPdJojs5SA', '_blank')}
          >
            View More on Google Reviews
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
                <Button 
                  onClick={() => window.open('https://g.page/r/CUO5fyObUrisEBM/review', '_blank')}
                className="bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300">
                  Leave a Review
                </Button>
        </div>
      </div>
    </div>
  )
}

export default AdvancedPatientReview