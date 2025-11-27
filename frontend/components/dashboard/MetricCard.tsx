import React from 'react';
import { Card } from '../ui/Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn('flex items-center justify-between', className)}>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p
            className={cn(
              'text-sm mt-2 flex items-center',
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            )}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span className="ml-1">{Math.abs(trend.value)}%</span>
          </p>
        )}
      </div>
      <div className="p-4 bg-primary-50 rounded-lg">
        <Icon className="h-8 w-8 text-primary-600" />
      </div>
    </Card>
  );
};
