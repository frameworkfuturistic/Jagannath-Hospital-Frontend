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
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/context/useDashboardData';
import { formatCurrency } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

interface DailyTrend {
  date: string;
  totalAppointments: number;
  completed: string;
  dailyRevenue: string;
}

interface ChartData extends DailyTrend {
  name: string;
  revenue: number;
  completedCount: number;
  appointmentRate?: number;
}

export default function DailyTrendsChart() {
  const { data, loading } = useDashboardData();

  // Transform API data into chart formats
  const chartData: ChartData[] =
    data?.appointments?.dailyTrends?.map((trend) => ({
      ...trend,
      name: format(parseISO(trend.date), 'MMM d'),
      revenue: parseFloat(trend.dailyRevenue) || 0,
      completedCount: parseInt(trend.completed) || 0,
      appointmentRate:
        (parseInt(trend.completed) / trend.totalAppointments) * 100 || 0,
    })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-4 border rounded-lg shadow-sm">
          <p className="font-medium mb-2">{label}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-blue-500">Appointments:</div>
            <div className="text-right">{data.totalAppointments}</div>
            <div className="text-green-500">Completed:</div>
            <div className="text-right">{data.completedCount}</div>
            <div className="text-purple-500">Revenue:</div>
            <div className="text-right">{formatCurrency(data.revenue)}</div>
            <div className="text-amber-500">Completion Rate:</div>
            <div className="text-right">{data.appointmentRate.toFixed(1)}%</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="combo">
          <TabsList className="mb-4">
            <TabsTrigger value="combo">Combined View</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="completion">Completion Rate</TabsTrigger>
          </TabsList>

          <TabsContent value="combo">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="totalAppointments"
                    name="Total Appointments"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="completedCount"
                    name="Completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue (₹)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="revenue">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="appointments">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="totalAppointments"
                    name="Total Appointments"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="completedCount"
                    name="Completed"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>

          <TabsContent value="completion">
            {loading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="appointmentRate"
                    name="Completion Rate (%)"
                    stroke="#f59e0b"
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
