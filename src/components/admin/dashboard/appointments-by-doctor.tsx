'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/context/useDashboardData';
import { formatCurrency } from '@/lib/utils';

interface DoctorData {
  ConsultantID: number;
  ConsultantName: string;
  totalAppointments: number;
  completed: string;
  totalRevenue: string;
  avgRevenue: string;
  completionRate: string;
}

const DEPARTMENT_COLORS: Record<string, string> = {
  ORTHO: '#3b82f6',
  DIETCIAN: '#10b981',
  CARDIOLOGY: '#ef4444',
  NEUROLOGY: '#8b5cf6',
  PEDIATRICS: '#ec4899',
  DERMATOLOGY: '#f59e0b',
  ENT: '#6366f1',
  GYNECOLOGY: '#f97316',
  OPHTHALMOLOGY: '#14b8a6',
  DEFAULT: '#64748b',
};

export default function AppointmentsByDoctor() {
  const { data, loading } = useDashboardData();

  // Transform API data for the chart
  const doctorData =
    data?.appointments?.byConsultant
      ?.map((doctor) => ({
        name: doctor.ConsultantName,
        appointments: doctor.totalAppointments,
        completed: parseInt(doctor.completed) || 0,
        revenue: parseFloat(doctor.totalRevenue) || 0,
        completionRate: parseFloat(doctor.completionRate) || 0,
        department:
          data.appointments.byDepartment.find(
            (dept) => dept.DepartmentID === doctor.ConsultantID
          )?.Department || 'General',
      }))
      .sort((a, b) => b.appointments - a.appointments) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const doctor = payload[0].payload;
      return (
        <div className="bg-background p-4 border rounded-lg shadow-sm">
          <p className="font-medium">{doctor.name}</p>
          <p className="text-sm">
            Department:{' '}
            <span className="text-muted-foreground">{doctor.department}</span>
          </p>
          <p className="text-sm">
            Appointments:{' '}
            <span className="text-blue-500">{doctor.appointments}</span>
          </p>
          <p className="text-sm">
            Completed:{' '}
            <span className="text-green-500">{doctor.completed}</span>
          </p>
          <p className="text-sm">
            Revenue:{' '}
            <span className="text-purple-500">
              {formatCurrency(doctor.revenue)}
            </span>
          </p>
          <p className="text-sm">
            Completion Rate:{' '}
            <span className="text-amber-500">{doctor.completionRate}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Top Doctors by Appointments</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : doctorData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p>No doctor data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={doctorData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
              />
              <XAxis type="number" tickFormatter={(value) => `${value}`} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="appointments"
                radius={[0, 4, 4, 0]}
                label={{ position: 'right' }}
              >
                {doctorData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      DEPARTMENT_COLORS[entry.department] ||
                      DEPARTMENT_COLORS.DEFAULT
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
