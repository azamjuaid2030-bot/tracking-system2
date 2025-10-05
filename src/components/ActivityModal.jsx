import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, ArrowRight } from 'lucide-react';
import activityManager from '../lib/storage';

const ActivityModal = ({ category, currentDate, onClose, onActivityAdd }) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [formData, setFormData] = useState({
    duration: 30,
    notes: '',
    customTitle: '',
    customDescription: '',
    readingContent: '',
    newWordsCount: 0
  });

  // جلب الأنشطة المتاحة من قاعدة البيانات
  const availableActivities = activityManager.getAvailableActivities();
  const currentActivities = category ? availableActivities[category.id] || [] : [];

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
    setFormData(prev => ({
      ...prev,
      duration: activity.defaultDuration,
      customTitle: activity.name,
      customDescription: '',
      readingContent: '',
      newWordsCount: 0
    }));
    setShowActivityForm(true);
  };

  const handleSubmit = () => {
    if (!selectedActivity) return;

    const activityData = {
      activityId: selectedActivity.id,
      name: selectedActivity.name,
      description: selectedActivity.description,
      category: selectedActivity.category,
      points: selectedActivity.defaultPoints,
      duration: parseInt(formData.duration) || selectedActivity.defaultDuration,
      notes: formData.notes,
      customTitle: formData.customTitle,
      newWord: formData.customDescription,
      readingContent: formData.readingContent,
      newWordsCount: parseInt(formData.newWordsCount) || 0,
      customDescription: formData.customDescription
    };

    // استدعاء callback للتحديث
    if (onActivityAdd) {
      onActivityAdd(activityData);
    }
    
    // إغلاق النافذة
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!showActivityForm) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {category ? category.name : 'اختر القسم'}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6">
              {category ? 'اختر نوع النشاط' : 'اختر النشاط الذي تريد تسجيله'}
            </p>

            {!category && (
              <div className="text-center py-8 text-gray-500">
                يرجى اختيار قسم من الصفحة الرئيسية أولاً
              </div>
            )}

            {category && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentActivities.map((activity) => (
                  <Card 
                    key={activity.id}
                    className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                    onClick={() => handleActivitySelect(activity)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{activity.icon}</div>
                        <div>
                          <h3 className="font-semibold">{activity.name}</h3>
                          <p className="text-sm text-gray-600">{activity.description}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{activity.defaultDuration} دقيقة</span>
                        <span>{activity.defaultPoints} نقطة</span>
                      </div>
                      <Button 
                        className="w-full mt-3 bg-black text-white hover:bg-gray-800"
                        size="sm"
                      >
                        ابدأ النشاط
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {category && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-4">نصيحة اليوم</p>
                <p className="text-sm text-gray-500 italic">
                  "النجاح ليس نهاية الرحلة، بل هو الخطوة الأولى في رحلة جديدة من الإنجازات"
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowActivityForm(false)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <CardTitle>{selectedActivity?.name}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl mb-2">{selectedActivity?.icon}</div>
            <p className="text-sm text-gray-600">{selectedActivity?.description}</p>
            {currentDate && (
              <div className="mt-2 text-xs text-blue-600 font-medium">
                سيتم حفظ النشاط في: {currentDate.toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">تفاصيل النشاط</h3>
            
            <div className="text-sm text-gray-600">
              يرجى ملء جميع الحقول المطلوبة لتسجيل النشاط بدقة
            </div>

            {/* حقول مختلفة حسب نوع النشاط */}
            {selectedActivity?.id === 'eng_reading' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ما قرأته *
                  </label>
                  <Input
                    type="text"
                    value={formData.readingContent}
                    onChange={(e) => handleInputChange('readingContent', e.target.value)}
                    placeholder="مثال: مقال عن التكنولوجيا، فصل من كتاب..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    مدة القراءة (بالدقائق) *
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    min="5"
                    max="300"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    عدد الكلمات الجديدة المتعلمة
                  </label>
                  <Input
                    type="number"
                    value={formData.newWordsCount}
                    onChange={(e) => handleInputChange('newWordsCount', e.target.value)}
                    min="0"
                    max="50"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    كلمة جديدة مهمة تعلمتها
                  </label>
                  <Input
                    type="text"
                    value={formData.customDescription}
                    onChange={(e) => handleInputChange('customDescription', e.target.value)}
                    placeholder="مثال: Technology"
                  />
                </div>
              </>
            ) : selectedActivity?.id === 'eng_listening' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    ما استمعت إليه *
                  </label>
                  <Input
                    type="text"
                    value={formData.readingContent}
                    onChange={(e) => handleInputChange('readingContent', e.target.value)}
                    placeholder="مثال: بودكاست، فيديو تعليمي، محاضرة..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    مدة الاستماع (بالدقائق) *
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    min="5"
                    max="180"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    عدد الكلمات الجديدة المسموعة
                  </label>
                  <Input
                    type="number"
                    value={formData.newWordsCount}
                    onChange={(e) => handleInputChange('newWordsCount', e.target.value)}
                    min="0"
                    max="30"
                    placeholder="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    كلمة جديدة مهمة سمعتها
                  </label>
                  <Input
                    type="text"
                    value={formData.customDescription}
                    onChange={(e) => handleInputChange('customDescription', e.target.value)}
                    placeholder="مثال: Pronunciation"
                  />
                </div>
              </>
            ) : selectedActivity?.id === 'eng_grammar' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    القاعدة المدروسة *
                  </label>
                  <Input
                    type="text"
                    value={formData.readingContent}
                    onChange={(e) => handleInputChange('readingContent', e.target.value)}
                    placeholder="مثال: Present Perfect، Past Simple، Conditionals..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    مدة الدراسة (بالدقائق) *
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    min="10"
                    max="120"
                    placeholder="45"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    عدد التمارين المحلولة
                  </label>
                  <Input
                    type="number"
                    value={formData.newWordsCount}
                    onChange={(e) => handleInputChange('newWordsCount', e.target.value)}
                    min="0"
                    max="100"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    نقطة مهمة تعلمتها
                  </label>
                  <Input
                    type="text"
                    value={formData.customDescription}
                    onChange={(e) => handleInputChange('customDescription', e.target.value)}
                    placeholder="مثال: استخدام have/has مع الأفعال الماضية"
                  />
                </div>
              </>
            ) : selectedActivity?.id === 'eng_speaking' ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    موضوع المحادثة *
                  </label>
                  <Input
                    type="text"
                    value={formData.readingContent}
                    onChange={(e) => handleInputChange('readingContent', e.target.value)}
                    placeholder="مثال: التعريف بالنفس، الحديث عن الهوايات..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    مدة المحادثة (بالدقائق) *
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    min="5"
                    max="60"
                    placeholder="20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    عدد الجمل الجديدة المتعلمة
                  </label>
                  <Input
                    type="number"
                    value={formData.newWordsCount}
                    onChange={(e) => handleInputChange('newWordsCount', e.target.value)}
                    min="0"
                    max="20"
                    placeholder="5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    تعبير أو جملة مفيدة تعلمتها
                  </label>
                  <Input
                    type="text"
                    value={formData.customDescription}
                    onChange={(e) => handleInputChange('customDescription', e.target.value)}
                    placeholder="مثال: How do you feel about...?"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    وصف النشاط *
                  </label>
                  <Input
                    type="text"
                    value={formData.readingContent}
                    onChange={(e) => handleInputChange('readingContent', e.target.value)}
                    placeholder="وصف مختصر للنشاط..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    المدة (بالدقائق) *
                  </label>
                  <Input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    min="5"
                    max="300"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    كلمة أو مفهوم جديد
                  </label>
                  <Input
                    type="text"
                    value={formData.customDescription}
                    onChange={(e) => handleInputChange('customDescription', e.target.value)}
                    placeholder="كلمة أو مفهوم تعلمته..."
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                ملخص الكلمة الجديدة
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="اكتب ملاحظاتك هنا..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={!formData.readingContent || !formData.duration}
            >
              حفظ النشاط
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityModal;
