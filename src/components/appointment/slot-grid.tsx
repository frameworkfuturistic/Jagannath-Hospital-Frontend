"use client"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, Check } from "lucide-react"
import { format, parse } from "date-fns"

interface Slot {
  SlotID: number
  SlotTime: string
  isBooked?: boolean
  SlotToken?: string
}

interface SlotGridProps {
  slots: Slot[]
  selectedSlot: number | null
  onSelectSlot: (slotId: number) => void
  isLoading: boolean
}

export default function SlotGrid({ slots, selectedSlot, onSelectSlot, isLoading }: SlotGridProps) {
  const parseAndFormatTime = (timeString: string) => {
    try {
      // Try parsing with 'HH:mm:ss' format
      const parsedTime = parse(timeString, "HH:mm:ss", new Date())
      return format(parsedTime, "h:mm a")
    } catch {
      try {
        // Fallback to 'HH:mm' format if parsing fails
        const parsedTime = parse(timeString, "HH:mm", new Date())
        return format(parsedTime, "h:mm a")
      } catch {
        // Return original if all parsing fails
        return timeString
      }
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Clock className="h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-500 text-center">
          No available slots for the selected date.
          <br />
          Please select a different date or doctor.
        </p>
      </div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        {slots.map((slot) => (
          <motion.div
            key={slot.SlotID}
            whileHover={!slot.isBooked ? { scale: 1.05 } : {}}
            whileTap={!slot.isBooked ? { scale: 0.95 } : {}}
          >
            <Card
              className={`cursor-pointer transition-all duration-200 h-full ${
                selectedSlot === slot.SlotID
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : slot.isBooked
                    ? "bg-red-50 opacity-70 cursor-not-allowed"
                    : "bg-green-50 hover:bg-green-100"
              }`}
              onClick={() => {
                if (!slot.isBooked) {
                  onSelectSlot(slot.SlotID)
                }
              }}
            >
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <p className="font-semibold text-center">{parseAndFormatTime(slot.SlotTime)}</p>
                <div className="mt-2 flex items-center">
                  {selectedSlot === slot.SlotID ? (
                    <div className="flex items-center text-blue-600">
                      <Check className="h-4 w-4 mr-1" />
                      <span className="text-xs">Selected</span>
                    </div>
                  ) : (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        slot.isBooked ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {slot.isBooked ? "Booked" : "Available"}
                    </span>
                  )}
                </div>
                {slot.SlotToken && <p className="text-xs mt-1 text-gray-500">Token: {slot.SlotToken}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
