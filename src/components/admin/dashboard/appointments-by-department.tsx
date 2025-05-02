// components/dashboard/AppointmentsByDepartment.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/context/useDashboardData';
import { cn, formatCurrency } from '@/lib/utils';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#6366f1',
  '#ec4899',
  '#8b5cf6',
];

interface DepartmentData {
  name: string;
  value: number;
}

export default function AppointmentsByDepartment() {
  const { data, loading } = useDashboardData();

  const departmentData: DepartmentData[] =
    data?.appointments?.byDepartment?.map((dept) => ({
      name: dept.Department,
      value: dept.totalAppointments,
    })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-lg shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">Appointments: {data.value}</p>
          {data?.revenue && (
            <p className="text-sm">Revenue: {formatCurrency(data.revenue)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Appointments by Department</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : departmentData.length === 0 ? (
          <div className="h-80 flex items-center justify-center">
            <p>No department data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                }
              >
                {departmentData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                verticalAlign="middle"
                align="right"
                formatter={(value, entry: any, index) => (
                  <span className="text-sm">
                    {value} ({entry.payload.value})
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
