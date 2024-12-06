// @ts-nocheck
"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, isToday, isPast, isFuture, isSameDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns"
import { CalendarIcon, Clock, Filter, Search, RefreshCw, Star, ChevronLeft, ChevronRight, Plus, ChevronDown } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

import { TodaySlotModal } from "./TodaySlotModal"
import { SlotRangeModal } from "./SlotRangeModal"
import { fetchConsultants, fetchAppointments } from "./api"
import { Consultant, AppointmentsByDate, Slot } from "./types"

export default function AdvancedResponsiveAppointmentsPage() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null)
  const [appointments, setAppointments] = useState<AppointmentsByDate>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [doctorSearchQuery, setDoctorSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [todaySlotModalOpen, setTodaySlotModalOpen] = useState(false)
  const [slotRangeModalOpen, setSlotRangeModalOpen] = useState(false)
  const [appointmentView, setAppointmentView] = useState<"recent" | "all">("recent")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [calendarView, setCalendarView] = useState<"day" | "week" | "month">("week")

  useEffect(() => {
    fetchConsultantsData()
  }, [])

  useEffect(() => {
    if (selectedConsultant) {
      fetchAppointmentsData(selectedConsultant.ConsultantID)
    }
  }, [selectedConsultant])

  const fetchConsultantsData = async () => {
    setIsLoading(true)
    try {
      const data = await fetchConsultants()
      setConsultants(data)
      if (data.length > 0) {
        setSelectedConsultant(data[0])
      }
    } catch (error) {
      console.error("Error fetching consultants:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAppointmentsData = async (consultantId: number) => {
    setIsLoading(true)
    try {
      const data = await fetchAppointments(consultantId)
      setAppointments(data)
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleDoctorSearch = (query: string) => {
    setDoctorSearchQuery(query)
    const filteredConsultants = consultants.filter(
      (consultant) =>
        consultant.ConsultantName.toLowerCase().includes(query.toLowerCase()) ||
        consultant.Department.toLowerCase().includes(query.toLowerCase())
    )
    if (filteredConsultants.length > 0) {
      setSelectedConsultant(filteredConsultants[0])
    }
  }

  const getFilteredAppointments = useMemo(() => {
    if (!selectedConsultant) return {}
    
    let filteredAppointments: AppointmentsByDate = {}
    
    Object.entries(appointments).forEach(([date, slots]) => {
      const filteredSlots = slots.filter(slot => 
        (appointmentView === "recent" ? isToday(parseISO(slot.ConsultationDate)) || isFuture(parseISO(slot.ConsultationDate)) : true) &&
        (slot.SlotToken.toLowerCase().includes(searchQuery.toLowerCase()) || 
         slot.SlotTime.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      
      if (filteredSlots.length > 0) {
        filteredAppointments[date] = filteredSlots
      }
    })
    
    return filteredAppointments
  }, [selectedConsultant, appointments, appointmentView, searchQuery])

  const handleRefresh = () => {
    if (selectedConsultant) {
      fetchAppointmentsData(selectedConsultant.ConsultantID)
    }
  }

  const renderConsultantList = () => (
    <div className="space-y-2">
      {consultants.map((consultant) => (
        <button
          key={consultant.ConsultantID}
          className={`w-full text-left p-3 rounded-lg transition-all transform hover:scale-105 ${
            selectedConsultant?.ConsultantID === consultant.ConsultantID
              ? `bg-primary text-primary-foreground shadow-lg`
              : "bg-background hover:bg-accent hover:text-accent-foreground"
          }`}
          onClick={() => setSelectedConsultant(consultant)}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10 ring-2 ring-background">
              <AvatarFallback>{consultant.ConsultantName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{consultant.ConsultantName}</p>
              <p className="text-sm text-muted-foreground">{consultant.Department}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  )

  const renderAppointmentTable = () => (
    <div className="space-y-4">
      {Object.entries(getFilteredAppointments).map(([date, slots]) => (
        <Collapsible key={date}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-accent rounded-lg">
            <h3 className="text-lg font-semibold">{format(parseISO(date), "MMMM d, yyyy")}</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Available Slots</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Patient Name</TableHead>
                    <TableHead>Mobile No</TableHead>
                    <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.map((slot) => (
                      <TableRow key={slot.SlotID}>
                        <TableCell>{slot.SlotTime}</TableCell>
                        <TableCell>{slot.AvailableSlots}/{slot.MaxSlots}</TableCell>
                        <TableCell>
                          <Badge
                            variant={slot.isBooked ? "destructive" : "success"}
                          >
                            {slot.isBooked ? "Booked" : "Available"}
                          </Badge>
                        </TableCell>
                        <TableCell>{slot.SlotToken}</TableCell>

                        {slot.appointments && slot.appointments.length > 0 ? (
                        slot.appointments.map((appointment) => (
                          <React.Fragment key={appointment.OPDOnlineAppointmentID}>
                            <TableCell>{appointment.PatientName}</TableCell>
                            <TableCell>{appointment.MobileNo}</TableCell>
                            <TableCell>{appointment.Remarks}</TableCell>
                          </React.Fragment>
                        ))
                      ) : (
                        <>
                          <TableCell colSpan={3}>No appointments</TableCell>
                        </>
                      )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )

  const renderCalendarView = () => {
    let startDate: Date, endDate: Date
    switch (calendarView) {
      case "day":
        startDate = selectedDate
        endDate = selectedDate
        break
      case "week":
        startDate = startOfWeek(selectedDate)
        endDate = endOfWeek(selectedDate)
        break
      case "month":
        startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
        endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)
        break
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate })

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, calendarView === "day" ? -1 : calendarView === "week" ? -7 : -30))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {calendarView === "day"
              ? format(selectedDate, "MMMM d, yyyy")
              : calendarView === "week"
              ? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`
              : format(selectedDate, "MMMM yyyy")}
          </h3>
          <Button variant="outline" size="sm" onClick={() => setSelectedDate(addDays(selectedDate, calendarView === "day" ? 1 : calendarView === "week" ? 7 : 30))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className={`grid gap-4 ${calendarView === "month" ? "grid-cols-7" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
          {days.map((day) => (
            <Card key={day.toISOString()} className={calendarView === "month" ? "h-24 overflow-hidden" : ""}>
              <CardHeader className={calendarView === "month" ? "p-2" : ""}>
                <CardTitle className={calendarView === "month" ? "text-sm" : ""}>{format(day, calendarView === "month" ? "d" : "EEEE, MMM d")}</CardTitle>
              </CardHeader>
              <CardContent className={calendarView === "month" ? "p-1" : ""}>
                <ScrollArea className={calendarView === "month" ? "h-16" : "h-64"}>
                  {appointments[format(day, "yyyy-MM-dd")]?.map((slot) => (
                    <TooltipProvider key={slot.SlotID}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`mb-2 p-2 bg-accent rounded-md ${calendarView === "month" ? "text-xs" : ""}`}>
                            <p className="font-medium">{slot.SlotTime}</p>
                            {calendarView !== "month" && (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  {slot.isBooked ? "Booked" : `Available: ${slot.AvailableSlots}/${slot.MaxSlots}`}
                                </p>
                                <p className="text-sm">{slot.SlotToken}</p>
                              </>
                            )}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Time: {slot.SlotTime}</p>
                          <p>Status: {slot.isBooked ? "Booked" : "Available"}</p>
                          <p>Slots: {slot.AvailableSlots}/{slot.MaxSlots}</p>
                          <p>Token: {slot.SlotToken}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen bg-background text-foreground transition-colors duration-200`}>
      {/* Sidebar for larger screens */}
      <aside className="hidden md:block w-72 bg-card shadow-lg border-r border-border overflow-hidden">
        <div className="p-4">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Search doctors..."
              value={doctorSearchQuery}
              onChange={(e) => handleDoctorSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            {renderConsultantList()}
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
          {selectedConsultant && (
            <>
              <Card>
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle>
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 ring-4 ring-background">
                        <AvatarFallback>{selectedConsultant.ConsultantName.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedConsultant.ConsultantName}</h2>
                        <p className="text-lg">{selectedConsultant.Department}</p>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-accent p-4 rounded-lg">
                      <p className="text-lg font-medium text-accent-foreground">Professional Degree</p>
                      <p className="text-xl font-bold mt-2">{selectedConsultant.ProfessionalDegree}</p>
                    </div>
                    <div className="bg-accent p-4 rounded-lg">
                      <p className="text-lg font-medium text-accent-foreground">Fee</p>
                      <p className="text-xl font-bold mt-2">{selectedConsultant.Fee}</p>
                    </div>
                    <div className="bg-accent p-4 rounded-lg">
                      <p className="text-lg font-medium text-accent-foreground">Total Appointments</p>
                      <p className="text-xl font-bold mt-2">{Object.values(appointments).flat().length}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="space-x-2">
                      <Button onClick={() => setTodaySlotModalOpen(true)}>Today's Slots</Button>
                      <Button onClick={() => setSlotRangeModalOpen(true)}>Slot Range</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <Select value={appointmentView} onValueChange={(value: "recent" | "all") => setAppointmentView(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recent & Upcoming</SelectItem>
                      <SelectItem value="all">All Appointments</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center space-x-2 w-full md:w-auto">
                  <Input
                    type="text"
                    placeholder="Search appointments..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full md:w-64"
                  />
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleRefresh}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="table" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                </TabsList>
                <TabsContent value="table">
                  <Card>
                    <CardHeader>
                      <CardTitle>Appointments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[calc(100vh-24rem)]">
                        {renderAppointmentTable()}
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="calendar">
                  <Card>
                    <CardHeader>
                      <CardTitle>Calendar View</CardTitle>
                      <div className="flex justify-between items-center">
                        <Select value={calendarView} onValueChange={(value: "day" | "week" | "month") => setCalendarView(value)}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="View" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="day">Day View</SelectItem>
                            <SelectItem value="week">Week View</SelectItem>
                            <SelectItem value="month">Month View</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {renderCalendarView()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>

      {selectedConsultant && (
        <>
          <TodaySlotModal
            isOpen={todaySlotModalOpen}
            onClose={() => setTodaySlotModalOpen(false)}
            onSubmit={(data) => {
              console.log("Today's slot data:", data)
              // Here you would typically send this data to your backend
              handleRefresh()
            }}
            consultantId={selectedConsultant.ConsultantID}
          />
          <SlotRangeModal
            isOpen={slotRangeModalOpen}
            onClose={() => setSlotRangeModalOpen(false)}
            onSubmit={(data) => {
              console.log("Slot range data:", data)
              // Here you would typically send this data to your backend
              handleRefresh()
            }}
            consultantId={selectedConsultant.ConsultantID}
          />
        </>
      )}
    </div>
  )
}

