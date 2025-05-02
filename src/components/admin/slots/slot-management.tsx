// eslint-disable-next-line
// @ts-nocheck
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CalendarPlus,
  CalendarRange,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  User,
  Phone,
  Clock,
  Info,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import {
  fetchSlots,
  fetchConsultants,
  fetchDepartments,
  fetchAppointments,
} from '@/lib/api';
import type { Slot, Consultant, Department, Appointment } from '@/types/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function SlotManagement() {
  const router = useRouter();
  const [view, setView] = useState<'calendar' | 'list'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedConsultant, setSelectedConsultant] = useState<number | null>(
    null
  );
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSlots, setExpandedSlots] = useState<Record<number, boolean>>(
    {}
  );

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch data in parallel
        const [slotsData, consultantsData, departmentsData, appointmentsData] =
          await Promise.all([
            fetchSlots(),
            fetchConsultants(),
            fetchDepartments(),
            fetchAppointments(),
          ]);

        setSlots(slotsData);
        setConsultants(consultantsData);
        setDepartments(departmentsData);
        setAppointments(appointmentsData.data || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Create a map of appointments by slot ID
  const appointmentsBySlotId = useMemo(() => {
    const map: Record<number, Appointment> = {};
    appointments.forEach((appointment) => {
      if (appointment.SlotID) {
        map[appointment.SlotID] = appointment;
      }
    });
    return map;
  }, [appointments]);

  // Memoized filtered slots for better performance
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchesDate = selectedDate
        ? format(parseISO(slot.SlotDate), 'yyyy-MM-dd') ===
          format(selectedDate, 'yyyy-MM-dd')
        : true;

      const matchesConsultant = selectedConsultant
        ? slot.ConsultantID === selectedConsultant
        : true;

      const matchesDepartment = selectedDepartment
        ? consultants.find((c) => c.ConsultantID === slot.ConsultantID)
            ?.DepartmentID === selectedDepartment
        : true;

      const matchesSearch = searchQuery
        ? slot.SlotToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (consultants
            .find((c) => c.ConsultantID === slot.ConsultantID)
            ?.ConsultantName.toLowerCase()
            .includes(searchQuery.toLowerCase()) ??
            false) ||
          appointmentsBySlotId[slot.SlotID]?.PatientName.toLowerCase().includes(
            searchQuery.toLowerCase()
          )
        : true;

      return (
        matchesDate && matchesConsultant && matchesDepartment && matchesSearch
      );
    });
  }, [
    slots,
    selectedDate,
    selectedConsultant,
    selectedDepartment,
    searchQuery,
    consultants,
    appointmentsBySlotId,
  ]);

  // Get appointment for a slot
  const getAppointmentForSlot = (slotId: number): Appointment | undefined => {
    return appointmentsBySlotId[slotId];
  };

  // Get consultant name by ID
  const getConsultantName = useCallback(
    (consultantId: number) => {
      return (
        consultants.find((c) => c.ConsultantID === consultantId)
          ?.ConsultantName || 'N/A'
      );
    },
    [consultants]
  );

  const getDepartmentName = useCallback(
    (consultantId: number) => {
      const consultant = consultants.find(
        (c) => c.ConsultantID === consultantId
      );
      return consultant?.Department || 'N/A';
    },
    [consultants]
  );

  // Status badge color mapping
  const getStatusColor = (status: string, isBooked: boolean) => {
    if (isBooked) return 'bg-red-100 text-red-800 hover:bg-red-200';

    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Toggle slot expansion
  const toggleSlotExpansion = (slotId: number) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slotId]: !prev[slotId],
    }));
  };

  // Action handlers
  const handleAddSlot = () => router.push('/dashboard/appointment/slots/add');
  const handleAddSlotRange = () =>
    router.push('/dashboard/appointment/slots/range');

  // const handleViewSlot = (slot: Slot) => {
  //   router.push(`/dashboard/appointment/slots/${slot.SlotID}`);
  // };

  // const handleEditSlot = (slot: Slot) => {
  //   router.push(`/dashboard/appointment/slots/${slot.SlotID}/edit`);
  // };

  // const handleDeleteSlot = async (slotId: number) => {
  //   try {
  //     // In a real implementation, you would call your API to delete the slot
  //     // await deleteSlot(slotId);
  //     setSlots(slots.filter((slot) => slot.SlotID !== slotId));
  //     toast({
  //       title: 'Success',
  //       description: 'Slot deleted successfully',
  //     });
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to delete slot',
  //       variant: 'destructive',
  //     });
  //   }
  // };

  // Refresh slots data
  const refreshSlots = async () => {
    try {
      setLoading(true);
      const [slotsData, appointmentsData] = await Promise.all([
        fetchSlots(),
        fetchAppointments(),
      ]);

      setSlots(slotsData);
      setAppointments(appointmentsData.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Render appointment details for booked slots
  const renderAppointmentDetails = (slot: Slot) => {
    const appointment = getAppointmentForSlot(slot.SlotID);
    if (!appointment) return null;

    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Patient:</span>
            <span>{appointment.PatientName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Contact:</span>
            <span>{appointment.MobileNo}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Status:</span>
            <Badge variant="outline" className="capitalize">
              {appointment.Status.toLowerCase()}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-500" />
            <span className="font-medium">MR No:</span>
            <span>{appointment.MRNo}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        {/* Filters section */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Consultant filter */}
          <div className="w-full sm:w-auto">
            <Label htmlFor="consultant">Consultant</Label>
            <Select
              value={selectedConsultant?.toString() || ''}
              onValueChange={(value) =>
                setSelectedConsultant(value ? parseInt(value) : null)
              }
            >
              <SelectTrigger id="consultant" className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Consultants" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Consultants</SelectItem>
                {consultants.map((consultant) => (
                  <SelectItem
                    key={consultant.ConsultantID}
                    value={consultant.ConsultantID.toString()}
                  >
                    {consultant.ConsultantName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department filter */}
          <div className="w-full sm:w-auto">
            <Label htmlFor="department">Department</Label>
            <Select
              value={selectedDepartment?.toString() || ''}
              onValueChange={(value) =>
                setSelectedDepartment(value ? parseInt(value) : null)
              }
            >
              <SelectTrigger id="department" className="w-full sm:w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem
                    key={department.DepartmentID}
                    value={department.DepartmentID.toString()}
                  >
                    {department.Department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search input */}
          <div className="w-full sm:w-auto">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Search slots, patients..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
          <Button onClick={handleAddSlot}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Add Slot
          </Button>
          <Button onClick={handleAddSlotRange} variant="outline">
            <CalendarRange className="mr-2 h-4 w-4" />
            Add Slot Range
          </Button>
          <Button onClick={refreshSlots} variant="outline">
            <Loader2 className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="list"
        onValueChange={(value) => setView(value as 'calendar' | 'list')}
      >
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="h-96 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Token</TableHead>
                        <TableHead>Consultant</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Availability</TableHead>
                        <TableHead>Slot Status</TableHead>

                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSlots.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No slots found for the selected filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSlots.map((slot) => (
                          <Collapsible key={slot.SlotID} asChild>
                            <>
                              <TableRow>
                                <TableCell className="font-medium">
                                  {slot.SlotToken}
                                </TableCell>
                                <TableCell>
                                  {getConsultantName(slot.ConsultantID)}
                                </TableCell>
                                <TableCell>
                                  {getDepartmentName(slot.ConsultantID)}
                                </TableCell>
                                <TableCell>
                                  {format(
                                    parseISO(slot.SlotDate),
                                    'MMM d, yyyy'
                                  )}
                                </TableCell>
                                <TableCell>
                                  {slot.SlotTime} - {slot.SlotEndTime}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {slot.AvailableSlots}/{slot.MaxSlots}
                                    </span>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          slot.AvailableSlots === 0
                                            ? 'bg-red-500'
                                            : slot.AvailableSlots ===
                                              slot.MaxSlots
                                            ? 'bg-green-500'
                                            : 'bg-yellow-500'
                                        }`}
                                        style={{
                                          width: `${
                                            (slot.AvailableSlots /
                                              slot.MaxSlots) *
                                            100
                                          }%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={getStatusColor(
                                      slot.Status,
                                      slot.IsBooked
                                    )}
                                    variant="outline"
                                  >
                                    {slot.Status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end space-x-2">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          {slot.IsBooked && (
                                            <CollapsibleTrigger asChild>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                  toggleSlotExpansion(
                                                    slot.SlotID
                                                  )
                                                }
                                              >
                                                <Eye className="h-4 w-4" />
                                              </Button>
                                            </CollapsibleTrigger>
                                          )}
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>View details</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>

                                    {/* <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-600 hover:text-red-800"
                                            onClick={() =>
                                              handleDeleteSlot(slot.SlotID)
                                            }
                                            disabled={slot.IsBooked}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {slot.IsBooked
                                              ? 'Cannot delete booked slot'
                                              : 'Delete slot'}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider> */}
                                  </div>
                                </TableCell>
                              </TableRow>
                              {slot.IsBooked && (
                                <CollapsibleContent asChild>
                                  <TableRow>
                                    <TableCell colSpan={8} className="p-0">
                                      {renderAppointmentDetails(slot)}
                                    </TableCell>
                                  </TableRow>
                                </CollapsibleContent>
                              )}
                            </>
                          </Collapsible>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                <div className="md:col-span-2">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="border rounded-md p-3"
                    disabled={(date) => date < new Date()}
                  />
                </div>

                <div className="md:col-span-5">
                  {loading ? (
                    <div className="h-96 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">
                        Slots for{' '}
                        {selectedDate
                          ? format(selectedDate, 'MMMM d, yyyy')
                          : 'Today'}
                      </h3>

                      {filteredSlots.length === 0 ? (
                        <div className="text-center py-8 border rounded-md">
                          <p className="text-gray-500">
                            No slots found for the selected date
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredSlots.map((slot) => (
                            <Collapsible
                              key={slot.SlotID}
                              open={expandedSlots[slot.SlotID]}
                              onOpenChange={() =>
                                toggleSlotExpansion(slot.SlotID)
                              }
                            >
                              <div
                                className={`p-4 rounded-lg border ${
                                  slot.IsBooked
                                    ? 'bg-red-50 border-red-200'
                                    : 'bg-green-50 border-green-200'
                                }`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <Badge
                                      className={getStatusColor(
                                        slot.Status,
                                        slot.IsBooked
                                      )}
                                      variant="outline"
                                    >
                                      {slot.Status}
                                    </Badge>
                                    <h4 className="font-medium mt-2">
                                      {getConsultantName(slot.ConsultantID)}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      {slot.SlotToken}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm font-medium">
                                      {slot.SlotTime}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      to {slot.SlotEndTime}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-medium">
                                      Availability
                                    </span>
                                    <span className="text-sm">
                                      {slot.AvailableSlots}/{slot.MaxSlots}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full ${
                                        slot.AvailableSlots === 0
                                          ? 'bg-red-500'
                                          : slot.AvailableSlots ===
                                            slot.MaxSlots
                                          ? 'bg-green-500'
                                          : 'bg-yellow-500'
                                      }`}
                                      style={{
                                        width: `${
                                          (slot.AvailableSlots /
                                            slot.MaxSlots) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                  <span className="text-xs text-gray-500">
                                    {getDepartmentName(slot.ConsultantID)}
                                  </span>
                                  <div className="flex space-x-1">
                                    {/* <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7"
                                            onClick={() => handleEditSlot(slot)}
                                            disabled={slot.IsBooked}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {slot.IsBooked
                                              ? 'Cannot edit booked slot'
                                              : 'Edit slot'}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-red-600 hover:text-red-800"
                                            onClick={() =>
                                              handleDeleteSlot(slot.SlotID)
                                            }
                                            disabled={slot.IsBooked}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            {slot.IsBooked
                                              ? 'Cannot delete booked slot'
                                              : 'Delete slot'}
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider> */}
                                    {slot.IsBooked && (
                                      <CollapsibleTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </CollapsibleTrigger>
                                    )}
                                  </div>
                                </div>
                                <CollapsibleContent>
                                  {renderAppointmentDetails(slot)}
                                </CollapsibleContent>
                              </div>
                            </Collapsible>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
