import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Calendar, BarChart3, TrendingUp, Clock, Target, Award, Flame, RefreshCw, Activity, Zap } from 'lucide-react';
import activityManager from '../lib/storage';

const DataDashboard = ({ onClose, refreshTrigger }) => {
  const [timeFilter, setTimeFilter] = useState('week');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    try {
      calculateDashboardData();
    } catch (err) {
      console.error('Error calculating dashboard data:', err);
      setError('حدث خطأ في تحميل البيانات');
      setLoading(false);
    }
  }, [timeFilter, categoryFilter, refreshTrigger]);

  // التحديث التلقائي كل 30 دقيقة
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      calculateDashboardData();
      setLastUpdate(new Date());
    }, 30 * 60 * 1000); // 30 دقيقة

    return () => clearInterval(interval);
  }, [autoRefresh, timeFilter, categoryFilter]);

  const calculateDashboardData = () => {
    try {
      setLoading(true);
      setError(null);

      const range = getDateRange();
      const activities = getFilteredActivities(range);
      
      const data = {
        totalActivities: activities.length,
        totalTime: activities.reduce((sum, activity) => sum + (activity.duration || 0), 0),
        totalPoints: activities.reduce((sum, activity) => sum + (activity.points || 0), 0),
        averageDaily: calculateAverageDaily(activities, range),
        categoryBreakdown: calculateCategoryBreakdown(activities),
        detailedStats: calculateDetailedStats(activities),
        progressChart: calculateProgressChart(activities, range),
        streakData: calculateStreakData(activities)
      };

      setDashboardData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error in calculateDashboardData:', err);
      setError('حدث خطأ في حساب البيانات');
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timeFilter) {
      case 'day':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      case 'year':
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
        return { start: yearStart, end: yearEnd };
      default:
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
    }
  };

  const getFilteredActivities = (range) => {
    try {
      const allActivities = activityManager.getAllActivities() || [];
      
      return allActivities.filter(activity => {
        if (!activity || !activity.date) return false;
        
        const activityDate = new Date(activity.date);
        const inRange = activityDate >= range.start && activityDate < range.end;
        
        if (!inRange) return false;
        
        if (categoryFilter === 'all') return true;
        return activity.category === categoryFilter;
      });
    } catch (err) {
      console.error('Error filtering activities:', err);
      return [];
    }
  };

  const calculateAverageDaily = (activities, range) => {
    try {
      const days = Math.max(1, Math.ceil((range.end - range.start) / (24 * 60 * 60 * 1000)));
      const totalPoints = activities.reduce((sum, activity) => sum + (activity.points || 0), 0);
      return Math.round(totalPoints / days * 10) / 10;
    } catch (err) {
      console.error('Error calculating average daily:', err);
      return 0;
    }
  };

  const calculateCategoryBreakdown = (activities) => {
    try {
      const breakdown = {
        english: { count: 0, time: 0, points: 0 },
        university: { count: 0, time: 0, points: 0 },
        other: { count: 0, time: 0, points: 0 }
      };

      activities.forEach(activity => {
        if (!activity) return;
        
        const category = activity.category || 'other';
        if (breakdown[category]) {
          breakdown[category].count++;
          breakdown[category].time += activity.duration || 0;
          breakdown[category].points += activity.points || 0;
        }
      });

      return breakdown;
    } catch (err) {
      console.error('Error calculating category breakdown:', err);
      return { english: { count: 0, time: 0, points: 0 }, university: { count: 0, time: 0, points: 0 }, other: { count: 0, time: 0, points: 0 } };
    }
  };

  const calculateDetailedStats = (activities) => {
    try {
      const stats = {
        english: {
          listening: 0,
          reading: 0,
          grammar: 0,
          speaking: 0,
          vocabulary: 0
        },
        university: {
          lectures: 0,
          review: 0,
          assignments: 0,
          subjects: new Set()
        },
        performance: {
          mostActiveDay: 'غير محدد',
          mostActiveCategory: 'غير محدد',
          averageSessionLength: 0
        }
      };

      // حساب إحصائيات اللغة الإنجليزية
      const englishActivities = activities.filter(a => a.category === 'english');
      englishActivities.forEach(activity => {
        // استخدام activityId بدلاً من type للتطابق مع البيانات المخزنة
        if (activity.activityId === 'eng_listening') stats.english.listening++;
        else if (activity.activityId === 'eng_reading') stats.english.reading++;
        else if (activity.activityId === 'eng_grammar') stats.english.grammar++;
        else if (activity.activityId === 'eng_speaking') stats.english.speaking++;
        
        // حساب عدد المفردات من الكلمات الجديدة المتعلمة
        if (activity.newWord && activity.newWord.trim()) {
          stats.english.vocabulary++;
        }
      });

      // حساب إحصائيات الجامعة
      const universityActivities = activities.filter(a => a.category === 'university');
      universityActivities.forEach(activity => {
        if (activity.activityId === 'uni_lecture') stats.university.lectures++;
        else if (activity.activityId === 'uni_review') stats.university.review++;
        else if (activity.activityId === 'uni_assignment') stats.university.assignments++;
        
        if (activity.customTitle) {
          stats.university.subjects.add(activity.customTitle);
        }
      });

      // حساب إحصائيات الأداء
      if (activities.length > 0) {
        const totalDuration = activities.reduce((sum, a) => sum + (a.duration || 0), 0);
        stats.performance.averageSessionLength = Math.round(totalDuration / activities.length);

        // أكثر فئة نشاطاً
        const categoryCount = calculateCategoryBreakdown(activities);
        let maxCategory = 'other';
        let maxCount = categoryCount.other.count;
        
        if (categoryCount.english.count > maxCount) {
          maxCategory = 'english';
          maxCount = categoryCount.english.count;
        }
        if (categoryCount.university.count > maxCount) {
          maxCategory = 'university';
        }

        const categoryNames = {
          english: 'اللغة الإنجليزية',
          university: 'الجامعة',
          other: 'أخرى'
        };
        stats.performance.mostActiveCategory = categoryNames[maxCategory] || 'غير محدد';
      }

      return stats;
    } catch (err) {
      console.error('Error calculating detailed stats:', err);
      return {
        english: { listening: 0, reading: 0, grammar: 0, speaking: 0 },
        university: { lectures: 0, review: 0, assignments: 0, subjects: new Set() },
        performance: { mostActiveDay: 'غير محدد', mostActiveCategory: 'غير محدد', averageSessionLength: 0 }
      };
    }
  };

  const calculateProgressChart = (activities, range) => {
    try {
      const dailyData = {};
      
      // إنشاء آخر 7 أيام مرتبة من الأحد إلى السبت
      const today = new Date();
      const currentDay = today.getDay(); // 0 = الأحد، 1 = الاثنين، إلخ
      
      // إنشاء مصفوفة للأيام السبعة الماضية مرتبة من الأحد إلى السبت
      const weekDays = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        // حساب عدد الأيام للوصول للأحد الماضي
        const daysToSunday = currentDay;
        date.setDate(date.getDate() - daysToSunday + i);
        const dateKey = date.toISOString().split('T')[0];
        weekDays.push(dateKey);
        dailyData[dateKey] = { activities: 0, points: 0, time: 0 };
      }
      
      // ملء البيانات الفعلية
      activities.forEach(activity => {
        const dateKey = activity.date;
        if (dailyData[dateKey]) {
          dailyData[dateKey].activities += 1;
          dailyData[dateKey].points += activity.points || 0;
          dailyData[dateKey].time += activity.duration || 0;
        }
      });
      
      // ترتيب البيانات من الأحد إلى السبت (من اليمين إلى اليسار في العرض العربي)
      return weekDays.map(date => ({
        date,
        ...dailyData[date],
        consistency: dailyData[date].activities > 0 ? 100 : 0
      })).reverse(); // عكس الترتيب ليظهر الأحد على اليمين
    } catch (err) {
      console.error('Error calculating progress chart:', err);
      return [];
    }
  };

  const calculateStreakData = (activities) => {
    try {
      const dates = [...new Set(activities.map(a => a.date))].sort();
      let currentStreak = 0;
      let maxStreak = 0;
      let tempStreak = 0;
      
      const today = new Date().toISOString().split('T')[0];
      let lastDate = null;
      
      dates.forEach(date => {
        if (lastDate) {
          const dayDiff = (new Date(date) - new Date(lastDate)) / (1000 * 60 * 60 * 24);
          if (dayDiff === 1) {
            tempStreak++;
          } else {
            maxStreak = Math.max(maxStreak, tempStreak);
            tempStreak = 1;
          }
        } else {
          tempStreak = 1;
        }
        lastDate = date;
      });
      
      maxStreak = Math.max(maxStreak, tempStreak);
      
      // حساب الاستمرارية الحالية
      if (dates.length > 0) {
        const lastActivityDate = dates[dates.length - 1];
        const daysSinceLastActivity = (new Date(today) - new Date(lastActivityDate)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastActivity <= 1) {
          currentStreak = tempStreak;
        }
      }
      
      return {
        currentStreak,
        maxStreak,
        consistency: dates.length > 0 ? Math.round((dates.length / 7) * 100) : 0
      };
    } catch (err) {
      console.error('Error calculating streak data:', err);
      return { currentStreak: 0, maxStreak: 0, consistency: 0 };
    }
  };

  const handleManualRefresh = () => {
    calculateDashboardData();
    setLastUpdate(new Date());
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  const getTimeFilterLabel = () => {
    const labels = {
      day: 'اليوم',
      week: 'هذا الأسبوع',
      month: 'هذا الشهر',
      year: 'هذا العام'
    };
    return labels[timeFilter] || 'غير محدد';
  };

  const getCategoryFilterLabel = () => {
    const labels = {
      all: 'جميع الأنشطة',
      english: 'اللغة الإنجليزية',
      university: 'الجامعة'
    };
    return labels[categoryFilter] || 'غير محدد';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardContent className="p-8 text-center">
            <div className="text-lg">جاري تحميل البيانات...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-red-600">خطأ في تحميل البيانات</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-8 text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <Button onClick={() => window.location.reload()}>إعادة تحميل الصفحة</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[95vh] overflow-y-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <BarChart3 className="h-6 w-6" />
              </div>
              لوحة البيانات التفصيلية
              <div className="flex items-center gap-2 text-sm font-normal bg-white/20 px-3 py-1 rounded-full">
                <Activity className="h-4 w-4" />
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleManualRefresh}
                className="text-white hover:bg-white/20 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                تحديث
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`text-white hover:bg-white/20 flex items-center gap-2 ${autoRefresh ? 'bg-white/20' : ''}`}
              >
                <Zap className="h-4 w-4" />
                {autoRefresh ? 'تلقائي' : 'يدوي'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* فلاتر */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">الفترة الزمنية</label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">اليوم</SelectItem>
                  <SelectItem value="week">هذا الأسبوع</SelectItem>
                  <SelectItem value="month">هذا الشهر</SelectItem>
                  <SelectItem value="year">هذا العام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">نوع النشاط</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنشطة</SelectItem>
                  <SelectItem value="english">اللغة الإنجليزية</SelectItem>
                  <SelectItem value="university">الجامعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* الإحصائيات الرئيسية */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {dashboardData?.totalActivities || 0}
                </div>
                <div className="text-sm opacity-90">إجمالي الأنشطة</div>
                <Target className="h-6 w-6 mx-auto mt-2 opacity-80" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {dashboardData?.totalPoints || 0}
                </div>
                <div className="text-sm opacity-90">إجمالي النقاط</div>
                <Award className="h-6 w-6 mx-auto mt-2 opacity-80" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {formatTime(dashboardData?.totalTime || 0)}
                </div>
                <div className="text-sm opacity-90">إجمالي الوقت</div>
                <Clock className="h-6 w-6 mx-auto mt-2 opacity-80" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {dashboardData?.averageDaily || 0}
                </div>
                <div className="text-sm opacity-90">متوسط النقاط اليومية</div>
                <TrendingUp className="h-6 w-6 mx-auto mt-2 opacity-80" />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold mb-1">
                  {dashboardData?.streakData?.consistency || 0}%
                </div>
                <div className="text-sm opacity-90">نسبة الاستمرارية</div>
                <Flame className="h-6 w-6 mx-auto mt-2 opacity-80" />
              </CardContent>
            </Card>
          </div>

          {/* الرسم البياني للتطور */}
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-700">
                <TrendingUp className="h-5 w-5" />
                مخطط التطور والاستمرارية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-indigo-600 mb-1">
                    {dashboardData?.streakData?.currentStreak || 0}
                  </div>
                  <div className="text-sm text-gray-600">الاستمرارية الحالية (أيام)</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {dashboardData?.streakData?.maxStreak || 0}
                  </div>
                  <div className="text-sm text-gray-600">أطول فترة استمرارية</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {dashboardData?.progressChart?.filter(d => d.activities > 0).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">الأيام النشطة</div>
                </div>
              </div>
              
              {/* رسم بياني بسيط للاستمرارية */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="text-sm font-medium text-gray-700 mb-3">الأنشطة اليومية (آخر 7 أيام)</div>
                <div className="flex items-end justify-between h-32 gap-2">
                  {dashboardData?.progressChart?.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className={`w-full rounded-t transition-all duration-300 ${
                          day.activities > 0 
                            ? 'bg-gradient-to-t from-indigo-500 to-purple-500' 
                            : 'bg-gray-200'
                        }`}
                        style={{ 
                          height: `${Math.max(day.activities * 30, 8)}px`,
                          maxHeight: '100px'
                        }}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(day.date).toLocaleDateString('ar-SA', { weekday: 'short' })}
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {day.activities}
                      </div>
                    </div>
                  )) || (
                    // عرض رسالة في حالة عدم وجود بيانات
                    <div className="w-full text-center text-gray-500 py-8">
                      لا توجد بيانات للعرض
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* تفصيل الفئات */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">اللغة الإنجليزية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>الاستماع:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.english?.listening || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>القراءة:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.english?.reading || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>القواعد:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.english?.grammar || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المحادثة:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.english?.speaking || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المفردات:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.english?.vocabulary || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-blue-600">الجامعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المحاضرات:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.university?.lectures || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المراجعة:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.university?.review || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الواجبات:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.university?.assignments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المواد:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.university?.subjects?.size || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-purple-600">تحليل الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>الفئة الأكثر نشاطاً:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.performance?.mostActiveCategory || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>متوسط طول الجلسة:</span>
                    <span className="font-medium">{dashboardData?.detailedStats?.performance?.averageSessionLength || 0} دقيقة</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ملخص الفترة */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص الفترة: {getTimeFilterLabel()} - {getCategoryFilterLabel()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {dashboardData?.categoryBreakdown?.english?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600">أنشطة اللغة الإنجليزية</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {dashboardData?.categoryBreakdown?.university?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600">أنشطة الجامعة</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {dashboardData?.categoryBreakdown?.other?.count || 0}
                  </div>
                  <div className="text-sm text-gray-600">أنشطة أخرى</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDashboard;
