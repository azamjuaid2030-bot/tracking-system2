import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Trophy, Target, TrendingUp, X, ChevronLeft, ChevronRight, Download, Edit, Trash2 } from 'lucide-react';
import activityManager from '../lib/storage';
import pdfExporter from '../lib/pdfExport';
import ConfirmationModal from './ConfirmationModal';
import EditActivityModal from './EditActivityModal';

const DailyReport = ({ onClose }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState(null);
  
  // جلب البيانات للتاريخ المحدد
  const selectedActivities = activityManager.getActivitiesByDate(selectedDate) || [];
  const selectedStats = activityManager.getDailyStats(selectedDate) || {};

  const totalTime = selectedActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
  const totalPoints = selectedActivities.reduce((sum, activity) => sum + (activity.points || 0), 0);
  const activitiesCount = selectedActivities.length;
  const completionPercentage = Math.min((totalPoints / 100) * 100, 100);

  // التنقل بين الأيام
  const navigateDay = (direction) => {
    const currentDate = new Date(selectedDate);
    if (direction === 'next') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  // حذف نشاط
  const handleDeleteActivity = (activityId) => {
    setActivityToDelete(activityId);
    setShowConfirmation(true);
  };

  // تأكيد حذف النشاط
  const confirmDeleteActivity = () => {
    if (activityToDelete) {
      activityManager.deleteActivity(activityToDelete);
      // إعادة تحميل الصفحة لتحديث البيانات
      window.location.reload();
    }
  };

  // إلغاء حذف النشاط
  const cancelDeleteActivity = () => {
    setActivityToDelete(null);
    setShowConfirmation(false);
  };

  // تعديل نشاط
  const handleEditActivity = (activity) => {
    setActivityToEdit(activity);
    setShowEditModal(true);
  };

  // التحقق من إمكانية الانتقال للمستقبل
  const canGoNext = () => {
    const today = new Date().toISOString().split('T')[0];
    return selectedDate < today;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')} ساعة`;
    }
    return `${mins} دقيقة`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatArabicDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      calendar: 'islamic-umalqura'
    };
    return date.toLocaleDateString('ar-SA-u-ca-islamic', options);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'english': return 'bg-green-500';
      case 'university': return 'bg-blue-500';
      case 'other': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryName = (category) => {
    switch (category) {
      case 'english': return 'اللغة الإنجليزية';
      case 'university': return 'الجامعة';
      case 'other': return 'أخرى';
      default: return 'غير محدد';
    }
  };

  // تصدير التقرير كـ PDF
  const handleExportPDF = async () => {
    try {
      const reportData = {
        date: selectedDate,
        activities: selectedActivities,
        stats: {
          totalPoints,
          totalDuration: totalTime,
          activitiesCount,
          completionPercentage
        },
        arabicDate: formatArabicDate(selectedDate),
        gregorianDate: formatDate(selectedDate)
      };
      
      await pdfExporter.generateDailyReport(reportData);
    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      alert('حدث خطأ أثناء تصدير التقرير. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">تقرير اليوم</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateDay('prev')}
              className="h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm text-gray-600">
                {formatArabicDate(selectedDate)}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigateDay('next')}
              disabled={!canGoNext()}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {formatTime(totalTime)}
                </div>
                <div className="text-sm text-gray-600">إجمالي الوقت</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {totalPoints}
                </div>
                <div className="text-sm text-gray-600">النقاط</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {activitiesCount}
                </div>
                <div className="text-sm text-gray-600">الأنشطة</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {Math.round(completionPercentage)}%
                </div>
                <div className="text-sm text-gray-600">الإنجاز</div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Indicators */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">تقدم اليوم</span>
              <span className="text-sm text-gray-600">{Math.round(completionPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Activities Timeline */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              الخط الزمني لأنشطة اليوم
            </h3>
            
            {selectedActivities.length > 0 ? (
              <div className="space-y-4">
                {selectedActivities.map((activity, index) => (
                  <Card key={activity.id} className="border-r-4 border-r-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-2 ${getCategoryColor(activity.category)}`}></div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{activity.name}</h4>
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {getCategoryName(activity.category)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                            
                            {/* Activity Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">العنوان المخصص:</span>
                                <p className="text-gray-600">{activity.customTitle || activity.name || 'غير محدد'}</p>
                              </div>
                              <div>
                                <span className="font-medium">المدة (بالدقائق):</span>
                                <p className="text-gray-600">{activity.duration || 0} دقيقة</p>
                              </div>
                              <div>
                                <span className="font-medium">الوصف المخصص:</span>
                                <p className="text-gray-600">{activity.customDescription || activity.description || 'لا يوجد وصف'}</p>
                              </div>
                              <div>
                                <span className="font-medium">الملاحظات:</span>
                                <p className="text-gray-600">{activity.notes || 'لا توجد ملاحظات'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{activity.points || 0} نقطة</div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>
                              <span className="font-medium">البدء:</span> {activity.recordedTime ? new Date(activity.recordedTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}
                            </div>
                            <div>
                              <span className="font-medium">الانتهاء:</span> {activity.actualTime ? new Date(activity.actualTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}
                            </div>
                          </div>
                          
                          {/* أزرار التحكم */}
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditActivity(activity)}
                              className="h-8 w-8 p-0 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteActivity(activity.id)}
                              className="h-8 w-8 p-0 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لم يتم تسجيل أي أنشطة في هذا اليوم
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              إغلاق
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleExportPDF}
            >
              <Download className="h-4 w-4 ml-2" />
              تصدير التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={cancelDeleteActivity}
        onConfirm={confirmDeleteActivity}
        title="حذف النشاط"
        message="هل أنت متأكد من حذف هذا النشاط؟ لا يمكن التراجع عن هذا الإجراء."
        confirmText="حذف"
        cancelText="إلغاء"
        type="danger"
      />

      {/* Edit Activity Modal */}
      {showEditModal && activityToEdit && (
        <EditActivityModal
          activity={activityToEdit}
          onClose={() => {
            setShowEditModal(false);
            setActivityToEdit(null);
          }}
          onSave={(updatedActivity) => {
            // حفظ التعديلات
            activityManager.updateActivity(activityToEdit.id, updatedActivity);
            setShowEditModal(false);
            setActivityToEdit(null);
            // إعادة تحميل الصفحة لتحديث البيانات
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default DailyReport;
