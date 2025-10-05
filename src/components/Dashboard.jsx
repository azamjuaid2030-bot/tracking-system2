import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Target, Trophy, Info } from 'lucide-react';
import activityManager from '../lib/storage';
import ActivityCard from './ActivityCard';
import ActivityModal from './ActivityModal';
import CalendarModal from './CalendarModal';
import Calendar from './Calendar';
import DailyReport from './DailyReport';
import DataDashboard from './DataDashboard';
import SystemInfo from './SystemInfo';

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [showDataDashboard, setShowDataDashboard] = useState(false);
  const [showSystemInfo, setShowSystemInfo] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [todayStats, setTodayStats] = useState(null);
  const [todayActivities, setTodayActivities] = useState([]);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  // تحميل البيانات عند بدء التطبيق
  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = () => {
    // جلب بيانات المستخدم
    const profile = activityManager.getUserProfile();
    setUserProfile(profile);

    // جلب إحصائيات اليوم
    const stats = activityManager.getTodayStats();
    setTodayStats(stats);

    // جلب أنشطة اليوم الحالي
    const dateString = currentDate.toISOString().split('T')[0];
    const activities = activityManager.getActivitiesForDate(dateString);
    setTodayActivities(activities);
  };

  // حساب إحصائيات كل فئة
  const getCategoryStats = (categoryId) => {
    const categoryActivities = todayActivities.filter(activity => activity.category === categoryId);
    const categoryPoints = categoryActivities.reduce((sum, activity) => sum + activity.points, 0);
    const categoryDuration = categoryActivities.reduce((sum, activity) => sum + activity.duration, 0);
    const activitiesCount = categoryActivities.length; // عدد الأنشطة المكتملة اليوم
    
    // التقدم بناءً على عدد الأنشطة (هدف 4 أنشطة لكل فئة)
    const targetActivities = 4;
    const categoryProgress = Math.min((activitiesCount / targetActivities) * 100, 100);
    
    return { points: categoryPoints, duration: categoryDuration, progress: categoryProgress, activitiesCount };
  };

  const categories = [
    {
      id: 'university',
      name: 'الجامعة',
      description: 'أنشطة الجامعة والدراسة',
      icon: '🎓',
      color: 'bg-blue-500',
      ...getCategoryStats('university')
    },
    {
      id: 'english',
      name: 'اللغة الإنجليزية',
      description: 'أنشطة تعلم اللغة الإنجليزية',
      icon: '📚',
      color: 'bg-green-500',
      ...getCategoryStats('english')
    },
    {
      id: 'other',
      name: 'أخرى',
      description: 'أنشطة عامة أو شخصية',
      icon: '⭐',
      color: 'bg-orange-500',
      ...getCategoryStats('other')
    }
  ];

  const formatDate = (date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatArabicDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      calendar: 'islamic-umalqura'
    };
    return date.toLocaleDateString('ar-SA-u-ca-islamic', options);
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const handleActivitySelect = (category) => {
    setSelectedCategory(category);
    setShowActivityModal(true);
  };

  const handleActivityAdd = (activityData) => {
    // إضافة النشاط إلى قاعدة البيانات مع التاريخ المحدد
    const newActivity = activityManager.addActivity(activityData, currentDate);
    
    // تحديث البيانات المحلية
    loadData();
    
    // تحديث trigger لإعادة تحميل لوحة البيانات
    setDataRefreshTrigger(prev => prev + 1);
    
    // إغلاق النافذة
    setShowActivityModal(false);
    setSelectedCategory(null);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    }
    return `${mins} د`;
  };

  if (!userProfile || !todayStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-arabic" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigateDate(-1)}
            className="h-10 w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <div 
            className="text-center cursor-pointer hover:bg-gray-100 rounded-lg p-2 transition-colors"
            onClick={() => setShowCalendar(true)}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {formatDate(currentDate)}
            </h2>
            <p className="text-sm text-gray-600">
              {formatArabicDate(currentDate)}
            </p>
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigateDate(1)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Main Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              نظام المتابعة اليومية
            </h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSystemInfo(true)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="دليل النظام"
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <span>ابدأ رائعاً! استمر في التقدم</span>
            <span>💪</span>
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(todayStats.completionPercentage)}%
              </div>
              <div className="text-sm text-gray-600">نسبة الإنجاز</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${todayStats.completionPercentage}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${todayStats.totalPoints >= 12 ? 'text-green-600' : 'text-gray-600'}`}>
                {todayStats.totalPoints}
              </div>
              <div className="text-sm text-gray-600">النقاط</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${todayStats.totalPoints >= 12 ? 'bg-green-600' : 'bg-orange-400'}`}
                  style={{ width: `${Math.min((todayStats.totalPoints / 12) * 100, 100)}%` }}
                ></div>
              </div>
              {todayStats.totalPoints >= 12 && (
                <Trophy className="h-6 w-6 text-yellow-500 mx-auto mt-2" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600 mb-1">
                {Math.floor(todayStats.totalDuration / 60)}:{(todayStats.totalDuration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-gray-600">إجمالي الوقت</div>
              <div className="text-xs text-gray-500 mt-1">ساعة:دقيقة</div>
              <Clock className="h-6 w-6 text-teal-500 mx-auto mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {userProfile.level}
              </div>
              <div className="text-sm text-gray-600">المستوى</div>
              <div className="text-xs text-gray-500 mt-1">مقدم</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {userProfile.consecutiveDays}
              </div>
              <div className="text-sm text-gray-600">أيام متتالية</div>
              <div className="text-xs text-gray-500 mt-1">12+ نقطة يومياً</div>
              <Target className="h-6 w-6 text-orange-500 mx-auto mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Activity Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <ActivityCard
              key={category.id}
              category={category}
              onSelect={() => handleActivitySelect(category)}
            />
          ))}
        </div>

        {/* Today's Activities */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              أنشطة اليوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayActivities.length > 0 ? (
              <div className="space-y-3">
                {todayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        activity.category === 'english' ? 'bg-green-500' :
                        activity.category === 'university' ? 'bg-blue-500' : 'bg-orange-500'
                      }`}></div>
                      <div>
                        <div className="font-medium">{activity.customTitle || activity.name}</div>
                        <div className="text-sm text-gray-600">
                          {activity.customDescription || activity.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{activity.points} نقطة</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(activity.duration)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لم يتم تسجيل أي أنشطة اليوم
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            variant="outline"
            className="px-8 py-3"
            onClick={() => setShowDailyReport(true)}
          >
            عرض تقرير اليوم
          </Button>
          <Button 
            variant="outline"
            className="px-8 py-3"
            onClick={() => setShowDataDashboard(true)}
          >
            لوحة البيانات
          </Button>
        </div>
      </div>

      {/* Modals */}
      {showCalendar && (
        <CalendarModal
          currentDate={currentDate}
          onClose={() => setShowCalendar(false)}
          onDateSelect={setCurrentDate}
        />
      )}

      {showActivityModal && (
        <ActivityModal
          category={selectedCategory}
          currentDate={currentDate}
          onClose={() => {
            setShowActivityModal(false);
            setSelectedCategory(null);
          }}
          onActivityAdd={handleActivityAdd}
        />
      )}

          {showDailyReport && (
            <DailyReport 
              onClose={() => setShowDailyReport(false)}
            />
          )}

          {showDataDashboard && (
            <DataDashboard 
              onClose={() => setShowDataDashboard(false)}
              refreshTrigger={dataRefreshTrigger}
            />
          )}

          {showSystemInfo && (
            <SystemInfo 
              onClose={() => setShowSystemInfo(false)}
            />
          )}

          {showCalendar && (
            <Calendar 
              onClose={() => setShowCalendar(false)}
              onDateSelect={(date) => {
                setCurrentDate(date);
                setShowCalendar(false);
              }}
              selectedDate={currentDate}
            />
          )}
    </div>
  );
};

export default Dashboard;
