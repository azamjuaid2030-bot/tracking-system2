import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Calendar, Trophy } from 'lucide-react';
import activityManager from '../lib/storage';

const StreakCounter = () => {
  const [streakData, setStreakData] = useState({
    current: 0,
    longest: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    calculateStreakData();
  }, []);

  const calculateStreakData = () => {
    const dailyStats = activityManager.storage.getItem(activityManager.storage.keys.DAILY_STATS) || [];
    const completedDays = dailyStats.filter(day => day.isCompleted);
    
    // حساب الأيام المتتالية الحالية
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // التحقق من اليوم الحالي
    const todayStats = completedDays.find(day => day.date === today);
    if (todayStats) {
      currentStreak = 1;
      
      // العد التنازلي للأيام السابقة
      for (let i = 1; i < 365; i++) {
        const checkDate = new Date();
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateString = checkDate.toISOString().split('T')[0];
        
        const dayStats = completedDays.find(day => day.date === checkDateString);
        if (dayStats && dayStats.isCompleted) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // حساب أطول سلسلة
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDays = completedDays.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    for (let i = 0; i < sortedDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDays[i - 1].date);
        const currentDate = new Date(sortedDays[i].date);
        const diffTime = Math.abs(currentDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // حساب أيام هذا الأسبوع
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const thisWeekDays = completedDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startOfWeek;
    }).length;

    // حساب أيام هذا الشهر
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const thisMonthDays = completedDays.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startOfMonth;
    }).length;

    setStreakData({
      current: currentStreak,
      longest: longestStreak,
      thisWeek: thisWeekDays,
      thisMonth: thisMonthDays
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <CardContent className="p-4 text-center">
          <Flame className="h-8 w-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{streakData.current}</div>
          <div className="text-sm opacity-90">أيام متتالية</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{streakData.longest}</div>
          <div className="text-sm opacity-90">أطول سلسلة</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
        <CardContent className="p-4 text-center">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{streakData.thisWeek}</div>
          <div className="text-sm opacity-90">هذا الأسبوع</div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
        <CardContent className="p-4 text-center">
          <Calendar className="h-8 w-8 mx-auto mb-2" />
          <div className="text-2xl font-bold">{streakData.thisMonth}</div>
          <div className="text-sm opacity-90">هذا الشهر</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreakCounter;
