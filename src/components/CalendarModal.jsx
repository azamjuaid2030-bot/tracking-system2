import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarModal = ({ currentDate, onClose, onDateSelect }) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(viewDate.getMonth() + direction);
    setViewDate(newDate);
  };

  const handleDateClick = (day) => {
    if (day) {
      const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      onDateSelect(selectedDate);
      onClose();
    }
  };

  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return checkDate.toDateString() === today.toDateString();
  };

  const isSelected = (day) => {
    if (!day) return false;
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return checkDate.toDateString() === currentDate.toDateString();
  };

  const days = getDaysInMonth(viewDate);

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(-1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateMonth(1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day names header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((dayName) => (
              <div key={dayName} className="text-center text-sm font-medium text-gray-600 p-2">
                {dayName.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(day)}
                disabled={!day}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${!day ? 'invisible' : 'hover:bg-gray-100'}
                  ${isToday(day) ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
                  ${isSelected(day) ? 'bg-blue-600 text-white' : ''}
                  ${day && !isToday(day) && !isSelected(day) ? 'text-gray-700' : ''}
                `}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="currentDay" className="rounded" />
                <label htmlFor="currentDay" className="text-gray-600">
                  اليوم الحالي
                </label>
              </div>
              <div className="text-gray-500">
                يوم منجز (+10 انجاز)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarModal;
