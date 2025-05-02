// components/dashboard/RevenueChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/context/useDashboardData';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface ChartData {
  name: string;
  revenue: number;
  appointments?: number;
  completed?: number;
}

export default function RevenueChart() {
  const { data, loading } = useDashboardData();

  // Transform API data into chart formats
  const dailyData: ChartData[] =
    data?.appointments?.dailyTrends?.map((trend) => ({
      name: format(parseISO(trend.date), 'ha'),
      revenue: parseFloat(trend.dailyRevenue) || 0,
      appointments: trend.totalAppointments,
      completed: parseInt(trend.completed) || 0,
    })) || [];

  const weeklyData: ChartData[] =
    data?.appointments?.dailyTrends
      ?.reduce((acc: ChartData[], trend) => {
        const date = parseISO(trend.date);
        const dayName = format(date, 'EEE');
        const existingDay = acc.find((item) => item.name === dayName);

        if (existingDay) {
          existingDay.revenue += parseFloat(trend.dailyRevenue) || 0;
          existingDay.appointments =
            (existingDay.appointments || 0) + trend.totalAppointments;
          existingDay.completed =
            (existingDay.completed || 0) + (parseInt(trend.completed) || 0);
        } else {
          acc.push({
            name: dayName,
            revenue: parseFloat(trend.dailyRevenue) || 0,
            appointments: trend.totalAppointments,
            completed: parseInt(trend.completed) || 0,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => {
        // Sort by day of week
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days.indexOf(a.name) - days.indexOf(b.name);
      }) || [];

  const monthlyData: ChartData[] =
    data?.appointments?.dailyTrends
      ?.reduce((acc: ChartData[], trend) => {
        const date = parseISO(trend.date);
        const monthName = format(date, 'MMM');
        const existingMonth = acc.find((item) => item.name === monthName);

        if (existingMonth) {
          existingMonth.revenue += parseFloat(trend.dailyRevenue) || 0;
          existingMonth.appointments =
            (existingMonth.appointments || 0) + trend.totalAppointments;
          existingMonth.completed =
            (existingMonth.completed || 0) + (parseInt(trend.completed) || 0);
        } else {
          acc.push({
            name: monthName,
            revenue: parseFloat(trend.dailyRevenue) || 0,
            appointments: trend.totalAppointments,
            completed: parseInt(trend.completed) || 0,
          });
        }
        return acc;
      }, [])
      .sort((a, b) => {
        // Sort by month
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        return months.indexOf(a.name) - months.indexOf(b.name);
      }) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-4 border rounded-lg shadow-sm">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Revenue:{' '}
            <span className="text-blue-500">
              {formatCurrency(payload[0].value)}
            </span>
          </p>
          {payload[1] && (
            <p className="text-sm">
              Appointments:{' '}
              <span className="text-green-500">{payload[1].value}</span>
            </p>
          )}
          {payload[2] && (
            <p className="text-sm">
              Completed:{' '}
              <span className="text-purple-500">{payload[2].value}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="mb-4">
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : dailyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p>No daily data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    fillOpacity={0.8}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="appointments"
                    stroke="#10b981"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="weekly">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : weeklyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p>No weekly data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey="revenue"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="appointments"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    opacity={0.6}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="monthly">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : monthlyData.length === 0 ? (
              <div className="h-80 flex items-center justify-center">
                <p>No monthly data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis
                    yAxisId="left"
                    tickFormatter={(value) => `₹${value / 1000}k`}
                  />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="appointments"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
