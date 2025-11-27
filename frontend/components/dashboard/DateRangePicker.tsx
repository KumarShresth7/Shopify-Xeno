'use client';

import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Calendar } from 'lucide-react';

interface DateRangePickerProps {
  onDateChange: (startDate: string, endDate: string) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ onDateChange }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApply = () => {
    if (startDate && endDate) {
      onDateChange(startDate, endDate);
    }
  };

  return (
    <div className="flex items-end gap-4 bg-white p-4 rounded-lg shadow-sm border">
      <Input
        type="date"
        label="Start Date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        type="date"
        label="End Date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Button onClick={handleApply} className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        Apply
      </Button>
    </div>
  );
};
