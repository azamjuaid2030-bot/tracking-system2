import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Save, Clock, FileText, Tag, MessageSquare } from 'lucide-react';

const EditActivityModal = ({ activity, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    customTitle: '',
    customDescription: '',
    duration: 0,
    notes: ''
  });

  // تحميل بيانات النشاط عند فتح النافذة
  useEffect(() => {
    if (activity) {
      setFormData({
        customTitle: activity.customTitle || activity.name || '',
        customDescription: activity.customDescription || activity.description || '',
        duration: activity.duration || 0,
        notes: activity.notes || ''
      });
    }
  }, [activity]);

  // تحديث قيم النموذج
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // حفظ التعديلات
  const handleSave = () => {
    // التحقق من صحة البيانات
    if (!formData.customTitle.trim()) {
      alert('يرجى إدخال عنوان النشاط');
      return;
    }

    if (formData.duration <= 0) {
      alert('يرجى إدخال مدة صحيحة للنشاط');
      return;
    }

    // حساب النقاط الجديدة بناءً على المدة المحدثة
    const newPoints = Math.round((formData.duration / 30) * activity.defaultPoints);

    const updatedActivity = {
      ...activity,
      customTitle: formData.customTitle.trim(),
      customDescription: formData.customDescription.trim(),
      duration: parseInt(formData.duration),
      notes: formData.notes.trim(),
      points: newPoints,
      // الحفاظ على الأوقات الأصلية دون تغيير
      actualTime: activity.actualTime,
      recordedTime: activity.recordedTime,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedActivity);
  };

  // إغلاق النافذة عند الضغط على الخلفية
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!activity) return null;

  return (
    <div 
      className="fixed inset-0 bg-white bg-opacity-30 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            تعديل النشاط
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* معلومات النشاط الأساسية */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              معلومات النشاط الأساسية
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">الفئة:</span>
                <p className="text-gray-600">{getCategoryName(activity.category)}</p>
              </div>
              <div>
                <span className="font-medium">النوع:</span>
                <p className="text-gray-600">{activity.name}</p>
              </div>
              <div>
                <span className="font-medium">التاريخ:</span>
                <p className="text-gray-600">{new Date(activity.date).toLocaleDateString('ar-SA')}</p>
              </div>
              <div>
                <span className="font-medium">الوقت:</span>
                <p className="text-gray-600">
                  {activity.actualTime ? new Date(activity.actualTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد'}
                </p>
              </div>
            </div>
          </div>

          {/* نموذج التعديل */}
          <div className="space-y-4">
            {/* العنوان المخصص */}
            <div>
              <Label htmlFor="customTitle" className="text-sm font-medium mb-2 block">
                العنوان المخصص *
              </Label>
              <Input
                id="customTitle"
                value={formData.customTitle}
                onChange={(e) => handleInputChange('customTitle', e.target.value)}
                placeholder="أدخل عنوان النشاط"
                className="w-full"
              />
            </div>

            {/* الوصف المخصص */}
            <div>
              <Label htmlFor="customDescription" className="text-sm font-medium mb-2 block">
                الوصف المخصص
              </Label>
              <Textarea
                id="customDescription"
                value={formData.customDescription}
                onChange={(e) => handleInputChange('customDescription', e.target.value)}
                placeholder="أدخل وصف النشاط"
                rows={3}
                className="w-full"
              />
            </div>

            {/* المدة */}
            <div>
              <Label htmlFor="duration" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Clock className="h-4 w-4" />
                المدة (بالدقائق) *
              </Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="480"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="أدخل المدة بالدقائق"
                className="w-full"
              />
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <div>
                  النقاط المحسوبة: {Math.round((formData.duration / 30) * (activity.defaultPoints || 1))} نقطة
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="font-medium text-yellow-800 mb-1">ملاحظة:</div>
                  <div className="text-xs">
                    الأوقات الأصلية للنشاط ستبقى كما هي ولن يتم تحديثها عند التعديل.
                    يمكنك تعديل المدة فقط وسيتم إعادة حساب النقاط.
                  </div>
                </div>
              </div>
            </div>

            {/* الملاحظات */}
            <div>
              <Label htmlFor="notes" className="text-sm font-medium mb-2 block flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                ملاحظات إضافية
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="أضف أي ملاحظات إضافية"
                rows={2}
                className="w-full"
              />
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={handleSave}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Save className="h-4 w-4 ml-2" />
              حفظ التعديلات
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// دالة مساعدة للحصول على اسم الفئة
const getCategoryName = (category) => {
  switch (category) {
    case 'english': return 'اللغة الإنجليزية';
    case 'university': return 'الجامعة';
    case 'other': return 'أخرى';
    default: return 'غير محدد';
  }
};

export default EditActivityModal;
