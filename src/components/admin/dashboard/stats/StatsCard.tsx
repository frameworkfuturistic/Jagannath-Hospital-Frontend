// components/dashboard/StatsCard.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LucideIcon,
  CalendarClock,
  CalendarCheck,
  Users,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type StatCardIcon = 'CalendarClock' | 'CalendarCheck' | 'Users' | 'IndianRupee';

interface StatsCardProps {
  title: string;
  subTitleOne: string;
  subTitleTwo: string;
  subTitleThree: string;
  valueOne?: string | number;
  valueTwo?: string | number;
  valueThree?: string | number;
  value: string;
  icon: StatCardIcon;
  description: string;
  loading: boolean;
  trend?: number;
}

const iconMap: Record<StatCardIcon, LucideIcon> = {
  CalendarClock: CalendarClock,
  CalendarCheck: CalendarCheck,
  Users: Users,
  IndianRupee: IndianRupee,
};

const iconColors: Record<StatCardIcon, string> = {
  CalendarClock: 'text-blue-500',
  CalendarCheck: 'text-emerald-500',
  Users: 'text-violet-500',
  IndianRupee: 'text-amber-500',
};

export default function StatsCard({
  title,
  subTitleOne,
  subTitleTwo,
  subTitleThree,
  valueOne,
  valueTwo,
  valueThree,
  value,
  icon,
  description,
  loading,
  trend,
}: StatsCardProps) {
  const Icon = iconMap[icon];
  const TrendIcon =
    trend !== undefined ? (trend >= 0 ? TrendingUp : TrendingDown) : null;
  const trendColor =
    trend !== undefined ? (trend >= 0 ? 'text-green-500' : 'text-red-500') : '';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn('h-4 w-4', iconColors[icon])} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-8 w-full mb-1" />
            <Skeleton className="h-4 w-3/4" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex">
              <div className="grid grid-cols-3 gap-2 w-full">
                {/* Paid */}
                <div className="relative bg-red-50 p-3 rounded-md">
                  <CreditCard className="w-4 h-4 text-red-500 absolute top-2 left-2" />
                  <div className="flex flex-col items-end">
                    <strong className="text-base font-semibold">
                      {valueOne}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      {subTitleOne}
                    </span>
                  </div>
                </div>

                {/* Completed */}
                <div className="relative bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-500 absolute top-2 left-2" />
                  <div className="flex flex-col items-end">
                    <strong className="text-base font-semibold">
                      {valueTwo}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      {subTitleTwo}
                    </span>
                  </div>
                </div>

                {/* Refund */}
                <div className="relative bg-yellow-50 p-3 rounded-md">
                  <RotateCcw className="w-4 h-4 text-yellow-500 absolute top-2 left-2" />
                  <div className="flex flex-col items-end">
                    <strong className="text-base font-semibold">
                      {valueThree}
                    </strong>
                    <span className="text-xs text-muted-foreground">
                      {subTitleThree}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 mt-1">
              {trend !== undefined && TrendIcon && (
                <>
                  <TrendIcon className={cn('h-3 w-3', trendColor)} />
                  <span className={cn('text-xs', trendColor)}>
                    {Math.abs(trend)}%
                  </span>
                </>
              )}
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
