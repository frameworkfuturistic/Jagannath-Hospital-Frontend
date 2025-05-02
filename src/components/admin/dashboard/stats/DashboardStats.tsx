'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatsCard from './StatsCard';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardStatstypes } from '@/types/types';
import { useDashboardData } from '@/context/useDashboardData';

export default function DashboardStats() {
  const { stats, loading, timeRange, setTimeRange, formattedDate } =
    useDashboardData();

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="today"
        onValueChange={(value: 'today' | 'week' | 'month' | 'year') =>
          setTimeRange(value)
        }
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {!loading && (
              <p className="text-sm text-muted-foreground">
                Last updated: {formattedDate}
              </p>
            )}
          </div>
          <TabsList>
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={timeRange}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Total Appointments"
              subTitleOne="Paid"
              subTitleTwo="Completed"
              subTitleThree="Refund"
              valueOne={stats.paidAppointments.toLocaleString()}
              valueTwo={stats.completedAppointments.toLocaleString()}
              valueThree={stats.refundAppointments.toLocaleString()}
              value={stats.totalAppointments.toLocaleString()}
              icon="CalendarClock"
              trend={stats.appointmentsChange}
              description="from last period"
              loading={loading}
            />
            <StatsCard
              title="Available Slots"
              subTitleOne="Booked"
              subTitleTwo="Today"
              subTitleThree="Trending"
              valueOne={stats.bookedSlots.toLocaleString()}
              valueTwo={stats.fullSlots.toLocaleString()}
              valueThree={stats.slotsChange.toLocaleString()}
              value={stats.availableSlots.toLocaleString()}
              icon="CalendarCheck"
              trend={stats.slotsChange}
              description="utilization rate"
              loading={loading}
            />
            <StatsCard
              title="Doctors"
              subTitleOne="Active"
              subTitleTwo="All"
              subTitleThree="Featured"
              valueOne={stats.activeDoctors.toString()}
              valueTwo={stats.totalDoctors.toString()}
              valueThree={stats.activeDoctors.toString()}
              value={stats.totalDoctors.toString()}
              icon="Users"
              description={`Out of ${stats.totalDoctors} total`}
              loading={loading}
            />
            <StatsCard
              title="Total Revenue"
              subTitleOne=""
              subTitleTwo=""
              subTitleThree=""
              value={formatCurrency(stats.totalRevenue)}
              icon="IndianRupee"
              trend={stats.revenueChange}
              description="from last period"
              loading={loading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
