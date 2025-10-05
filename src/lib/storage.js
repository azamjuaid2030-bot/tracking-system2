// نظام إدارة البيانات المحلية
class LocalStorage {
  constructor() {
    this.keys = {
      USER_PROFILE: 'daily_tracker_user',
      ACTIVITIES_CONFIG: 'daily_tracker_activities',
      ACTIVITY_LOGS: 'daily_tracker_logs',
      DAILY_STATS: 'daily_tracker_daily_stats',
      APP_SETTINGS: 'daily_tracker_settings'
    };
    
    this.initializeData();
  }

  // تهيئة البيانات الأساسية
  initializeData() {
    if (!this.getItem(this.keys.USER_PROFILE)) {
      this.setItem(this.keys.USER_PROFILE, {
        id: 'user_1',
        name: 'المستخدم',
        level: 0,
        totalPoints: 0,
        consecutiveDays: 0,
        createdAt: new Date().toISOString(),
        lastActiveDate: new Date().toISOString()
      });
    }

    if (!this.getItem(this.keys.ACTIVITIES_CONFIG)) {
      this.setItem(this.keys.ACTIVITIES_CONFIG, this.getDefaultActivities());
    }

    if (!this.getItem(this.keys.ACTIVITY_LOGS)) {
      this.setItem(this.keys.ACTIVITY_LOGS, []);
    }

    if (!this.getItem(this.keys.DAILY_STATS)) {
      this.setItem(this.keys.DAILY_STATS, []);
    }
  }

  // الحصول على الأنشطة الافتراضية
  getDefaultActivities() {
    return {
      english: [
        {
          id: 'eng_listening',
          name: 'استماع',
          description: 'الاستماع للمحتوى باللغة الإنجليزية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 30,
          category: 'english',
          icon: '🎧',
          color: '#10B981'
        },
        {
          id: 'eng_reading',
          name: 'قراءة',
          description: 'قراءة نصوص باللغة الإنجليزية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 30,
          category: 'english',
          icon: '📖',
          color: '#10B981'
        },
        {
          id: 'eng_grammar',
          name: 'قواعد',
          description: 'دراسة قواعد اللغة الإنجليزية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 45,
          category: 'english',
          icon: '📝',
          color: '#10B981'
        },
        {
          id: 'eng_speaking',
          name: 'محادثة',
          description: 'ممارسة المحادثة باللغة الإنجليزية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 30,
          category: 'english',
          icon: '🗣️',
          color: '#10B981'
        }
      ],
      university: [
        {
          id: 'uni_exam',
          name: 'اختبار',
          description: 'الاستعداد لأداء الاختبارات',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 60,
          category: 'university',
          icon: '📋',
          color: '#3B82F6'
        },
        {
          id: 'uni_lecture',
          name: 'محاضرة',
          description: 'حضور محاضرة جامعية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 50,
          category: 'university',
          icon: '🎓',
          color: '#3B82F6'
        },
        {
          id: 'uni_review',
          name: 'مراجعة',
          description: 'مراجعة المواد الدراسية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 45,
          category: 'university',
          icon: '📖',
          color: '#3B82F6'
        },
        {
          id: 'uni_homework',
          name: 'واجب',
          description: 'إنجاز واجبات جامعية',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 60,
          category: 'university',
          icon: '✏️',
          color: '#3B82F6'
        }
      ],
      other: [
        {
          id: 'other_general',
          name: 'نشاط عام',
          description: 'نشاط شخصي أو عام',
          defaultPoints: 1, // 1 نقطة لكل 30 دقيقة
          defaultDuration: 30,
          category: 'other',
          icon: '⭐',
          color: '#F59E0B'
        }
      ]
    };
  }

  // حفظ عنصر
  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  }

  // جلب عنصر
  getItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  // حذف عنصر
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }

  // مسح جميع البيانات
  clear() {
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      this.initializeData();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

// نظام إدارة الأنشطة
class ActivityManager {
  constructor() {
    this.storage = new LocalStorage();
  }

  // إضافة نشاط جديد
  addActivity(activityData, targetDate = null) {
    const logs = this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
    const now = new Date();
    
    // استخدام التاريخ المحدد أو التاريخ الحالي
    const activityDate = targetDate ? new Date(targetDate) : now;
    const dateString = activityDate.toISOString().split('T')[0];
    
    // حساب الوقت المسجل (الوقت الحالي - مدة النشاط بالدقائق)
    const recordedTime = new Date(now.getTime() - (activityData.duration * 60000));
    
    // تعديل النقاط بناءً على المدة الفعلية
    const adjustedPoints = Math.round(activityData.points * (activityData.duration / 30)); // تعديل النقاط بناءً على المدة المعيارية 30 دقيقة
    
    const newActivity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      activityId: activityData.activityId,
      userId: 'user_1',
      date: dateString, // استخدام التاريخ المحدد
      actualTime: now.toISOString(),
      recordedTime: recordedTime.toISOString(),
      duration: activityData.duration,
      points: adjustedPoints,
      originalPoints: activityData.points,
      notes: activityData.notes || '',
      customTitle: activityData.customTitle || '',
      customDescription: activityData.customDescription || '',
      category: activityData.category,
      name: activityData.name,
      description: activityData.description,
      createdAt: now.toISOString()
    };

    logs.push(newActivity);
    this.storage.setItem(this.storage.keys.ACTIVITY_LOGS, logs);
    
    // تحديث إحصائيات اليوم المحدد
    this.updateDailyStats(dateString);
    
    // تحديث بيانات المستخدم
    this.updateUserStats();
    
    return newActivity;
  }

  // جلب أنشطة يوم معين
  getActivitiesForDate(date) {
    const logs = this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    return logs.filter(activity => activity.date === dateString);
  }

  // تحديث إحصائيات اليوم
  updateDailyStats(date) {
    const activities = this.getActivitiesForDate(date);
    const dailyStats = this.storage.getItem(this.storage.keys.DAILY_STATS) || [];
    
    const totalPoints = activities.reduce((sum, activity) => sum + activity.points, 0);
    const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
    const activitiesCount = activities.length;
    const isCompleted = totalPoints >= 12; // اليوم مكتمل إذا تجاوز 12 نقطة
    const completionPercentage = Math.min((totalPoints / 12) * 100, 100); // نسبة الإنجاز بناءً على هدف 12 نقطة
    
    // البحث عن إحصائيات اليوم الحالي
    const existingStatIndex = dailyStats.findIndex(stat => stat.date === date);
    
    const dayStats = {
      id: existingStatIndex >= 0 ? dailyStats[existingStatIndex].id : `day_${Date.now()}`,
      userId: 'user_1',
      date,
      totalPoints,
      totalDuration,
      activitiesCount,
      isCompleted,
      completionPercentage,
      updatedAt: new Date().toISOString()
    };
    
    if (existingStatIndex >= 0) {
      dailyStats[existingStatIndex] = dayStats;
    } else {
      dailyStats.push(dayStats);
    }
    
    this.storage.setItem(this.storage.keys.DAILY_STATS, dailyStats);
    
    // تحديث الأيام المتتالية في كل مرة لإعادة حساب السلسلة
    this.updateConsecutiveDays();
    
    return dayStats;
  }

  // تحديث بيانات المستخدم
  updateUserStats() {
    const user = this.storage.getItem(this.storage.keys.USER_PROFILE);
    const logs = this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
    
    const totalPoints = logs.reduce((sum, activity) => sum + activity.points, 0);
    const newLevel = Math.floor(totalPoints / 100); // كل 100 نقطة = مستوى واحد (محدث للنظام الجديد)
    
    const updatedUser = {
      ...user,
      totalPoints,
      level: newLevel,
      lastActiveDate: new Date().toISOString()
    };
    
    this.storage.setItem(this.storage.keys.USER_PROFILE, updatedUser);
    
    return updatedUser;
  }

  // حساب الأيام المتتالية بناءً على تحقيق 12+ نقطة
  updateConsecutiveDays() {
    const dailyStats = this.storage.getItem(this.storage.keys.DAILY_STATS) || [];
    
    let consecutiveDays = 0;
    const today = new Date();
    
    // البحث عن آخر سلسلة متتالية من الأيام التي حققت 12+ نقطة
    for (let i = 0; i < 365; i++) { // فحص آخر سنة
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const checkDateString = checkDate.toISOString().split('T')[0];
      
      const dayStats = dailyStats.find(day => day.date === checkDateString);
      
      // التحقق من تحقيق 12+ نقطة في هذا اليوم
      if (dayStats && dayStats.totalPoints >= 12) {
        consecutiveDays++;
      } else {
        // إذا لم يحقق الشرط، توقف العد
        break;
      }
    }
    
    // تحديث بيانات المستخدم
    const user = this.storage.getItem(this.storage.keys.USER_PROFILE);
    const updatedUser = {
      ...user,
      consecutiveDays
    };
    
    this.storage.setItem(this.storage.keys.USER_PROFILE, updatedUser);
    
    return consecutiveDays;
  }

  // جلب إحصائيات اليوم الحالي
  getTodayStats() {
    const today = new Date().toISOString().split('T')[0];
    const dailyStats = this.storage.getItem(this.storage.keys.DAILY_STATS) || [];
    
    let todayStats = dailyStats.find(stat => stat.date === today);
    
    if (!todayStats) {
      // إنشاء إحصائيات فارغة لليوم الحالي
      todayStats = this.updateDailyStats(today);
    }
    
    return todayStats;
  }

  // جلب بيانات المستخدم
  getUserProfile() {
    return this.storage.getItem(this.storage.keys.USER_PROFILE);
  }

  // جلب الأنشطة المتاحة
  getAvailableActivities() {
    return this.storage.getItem(this.storage.keys.ACTIVITIES_CONFIG);
  }

  // جلب أنشطة يوم معين (alias method)
  getActivitiesByDate(date) {
    return this.getActivitiesForDate(date);
  }

  // جلب جميع الأنشطة
  getAllActivities() {
    return this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
  }

  // جلب إحصائيات يوم معين
  getDailyStats(date) {
    const dailyStats = this.storage.getItem(this.storage.keys.DAILY_STATS) || [];
    const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
    
    let dayStats = dailyStats.find(stat => stat.date === dateString);
    
    if (!dayStats) {
      // إنشاء إحصائيات فارغة لليوم المحدد
      dayStats = this.updateDailyStats(dateString);
    }
    
    return dayStats;
  }

  // تحديث نشاط
  updateActivity(activityId, updatedData) {
    const logs = this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
    const activityIndex = logs.findIndex(activity => activity.id === activityId);
    
    if (activityIndex === -1) {
      return false; // النشاط غير موجود
    }
    
    // تحديث النشاط
    logs[activityIndex] = {
      ...logs[activityIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    this.storage.setItem(this.storage.keys.ACTIVITY_LOGS, logs);
    
    // إعادة حساب الإحصائيات لليوم المتأثر
    this.updateDailyStats(logs[activityIndex].date);
    
    // تحديث بيانات المستخدم
    this.updateUserStats();
    
    return true;
  }

  // حذف نشاط
  deleteActivity(activityId) {
    const logs = this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
    const updatedLogs = logs.filter(activity => activity.id !== activityId);
    
    this.storage.setItem(this.storage.keys.ACTIVITY_LOGS, updatedLogs);
    
    // إعادة حساب الإحصائيات لجميع الأيام المتأثرة
    this.recalculateAllStats();
    
    return true;
  }

  // إعادة حساب جميع الإحصائيات
  recalculateAllStats() {
    const logs = this.storage.getItem(this.storage.keys.ACTIVITY_LOGS) || [];
    const dailyStats = [];
    
    // تجميع الأنشطة حسب التاريخ
    const activitiesByDate = {};
    logs.forEach(activity => {
      const date = activity.date;
      if (!activitiesByDate[date]) {
        activitiesByDate[date] = [];
      }
      activitiesByDate[date].push(activity);
    });
    
    // إعادة حساب الإحصائيات لكل يوم
    Object.keys(activitiesByDate).forEach(date => {
      this.updateDailyStats(date);
    });
    
    // تحديث المستوى والأيام المتتالية
    this.updateUserStats();
    this.updateConsecutiveDays();
  }

  // تصدير البيانات
  exportData() {
    const data = {
      user: this.storage.getItem(this.storage.keys.USER_PROFILE),
      activities: this.storage.getItem(this.storage.keys.ACTIVITIES_CONFIG),
      logs: this.storage.getItem(this.storage.keys.ACTIVITY_LOGS),
      dailyStats: this.storage.getItem(this.storage.keys.DAILY_STATS),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  // استيراد البيانات
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.user) this.storage.setItem(this.storage.keys.USER_PROFILE, data.user);
      if (data.activities) this.storage.setItem(this.storage.keys.ACTIVITIES_CONFIG, data.activities);
      if (data.logs) this.storage.setItem(this.storage.keys.ACTIVITY_LOGS, data.logs);
      if (data.dailyStats) this.storage.setItem(this.storage.keys.DAILY_STATS, data.dailyStats);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// إنشاء مثيل عام
const activityManager = new ActivityManager();

export default activityManager;
