import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import activityManager from '../lib/storage';

const Calendar = ({ onClose, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeDays, setActiveDays] = useState(new Set());

  useEffect(() => {
    calculateActiveDays();
  }, [currentMonth]);

  const calculateActiveDays = () => {
    try {
      const activities = activityManager.getActivities();
      const activeDaysSet = new Set();
      
      activities.forEach(activity => {
        if (activity.date) {
          const activityDate = new Date(activity.date);
          const dateKey = `${activityDate.getFullYear()}-${activityDate.getMonth()}-${activityDate.getDate()}`;
          activeDaysSet.add(dateKey);
        }
      });
      
      setActiveDays(activeDaysSet);
    } catch (error) {
      console.error('Error calculating active days:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // إضافة الأيام الفارغة في بداية الشهر
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // إضافة أيام الشهر
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isActiveDay = (date) => {
    if (!date) return false;
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return activeDays.has(dateKey);
  };

  const isSelectedDay = (date) => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const handleDateClick = (date) => {
    if (date) {
      onDateSelect(date);
      onClose();
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'long'
    });
  };

  const formatDayName = (dayIndex) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[dayIndex];
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="fixed inset-0 bg-white bg-opacity-10 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600" />
            التقويم
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-4">
          {/* شريط التنقل بين الشهور */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateMonth(-1)}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {formatMonthYear(currentMonth)}
            </h3>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateMonth(1)}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* أسماء أيام الأسبوع */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {[0, 1, 2, 3, 4, 5, 6].map(dayIndex => (
              <div key={dayIndex} className="text-center text-xs font-medium text-gray-600 p-2">
                {formatDayName(dayIndex)}
              </div>
            ))}
          </div>

          {/* شبكة الأيام */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="p-2"></div>;
              }

              const isActive = isActiveDay(date);
              const isSelected = isSelectedDay(date);
              const isTodayDate = isToday(date);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(date)}
                  className={`
                    p-2 text-sm rounded-lg transition-all duration-200 hover:bg-gray-100
                    ${isSelected ? 'bg-blue-500 text-white font-bold' : ''}
                    ${isTodayDate && !isSelected ? 'bg-blue-100 text-blue-700 font-semibold' : ''}
                    ${isActive && !isSelected && !isTodayDate ? 'bg-green-100 text-green-700' : ''}
                    ${!isActive && !isSelected && !isTodayDate ? 'text-gray-400' : ''}
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* مفتاح الألوان */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>اليوم المحدد</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 rounded"></div>
                <span>اليوم الحالي</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>يوم به أنشطة</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>يوم فارغ</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;
