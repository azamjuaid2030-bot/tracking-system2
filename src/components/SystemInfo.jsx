import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, X, Target, Trophy, Calendar, TrendingUp } from 'lucide-react';

const SystemInfo = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('consecutive');

  const tabs = [
    { id: 'consecutive', label: 'الأيام المتتالية', icon: Target },
    { id: 'points', label: 'نظام النقاط', icon: Trophy },
    { id: 'progress', label: 'نسبة الإنجاز', icon: TrendingUp },
    { id: 'levels', label: 'المستويات', icon: Calendar }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'consecutive':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">🔥 نظام الأيام المتتالية</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">الشرط الأساسي:</h4>
              <p className="text-sm text-gray-700">
                تحقيق <strong>12+ نقطة يومياً</strong> من أي مجموعة أنشطة
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                <div>
                  <p className="font-medium">إذا حققت 12+ نقطة:</p>
                  <p className="text-sm text-gray-600">يستمر العداد ويُضاف يوم جديد</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">✗</div>
                <div>
                  <p className="font-medium">إذا حققت أقل من 12 نقطة:</p>
                  <p className="text-sm text-gray-600">يرجع العداد إلى الصفر</p>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>ملاحظة:</strong> لا تحتاج لإكمال جميع الأقسام، يكفي تحقيق 12 نقطة من أي قسم أو مجموعة أقسام.
              </p>
            </div>
          </div>
        );

      case 'points':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">⭐ نظام النقاط</h3>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">صيغة الحساب:</h4>
              <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded">
                النقاط = النقاط الأساسية × (المدة الفعلية ÷ 30 دقيقة)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border rounded-lg p-3">
                <h5 className="font-semibold text-blue-600">📖 قراءة</h5>
                <p className="text-sm text-gray-600">1 نقطة / 30 دقيقة</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <h5 className="font-semibold text-green-600">🎧 استماع</h5>
                <p className="text-sm text-gray-600">1 نقطة / 30 دقيقة</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <h5 className="font-semibold text-purple-600">📝 مراجعة</h5>
                <p className="text-sm text-gray-600">2 نقطة / 30 دقيقة</p>
              </div>
              <div className="bg-white border rounded-lg p-3">
                <h5 className="font-semibold text-orange-600">📋 اختبار</h5>
                <p className="text-sm text-gray-600">3 نقطة / 30 دقيقة</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">أمثلة صحيحة:</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <p>• قراءة 60 دقيقة = 1 × (60 ÷ 30) = <strong>2 نقطة</strong></p>
                <p>• مراجعة 60 دقيقة = 2 × (60 ÷ 30) = <strong>4 نقاط</strong></p>
                <p>• اختبار 40 دقيقة = 3 × (40 ÷ 30) = <strong>4 نقاط</strong></p>
              </div>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-600">📊 نسبة الإنجاز</h3>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">الصيغة الواضحة:</h4>
              <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded">
                نسبة الإنجاز = (إجمالي النقاط ÷ 12) × 100%
              </p>
              <p className="text-xs text-gray-600 mt-2">
                مثال: 6 نقاط ÷ 12 × 100% = 50% إنجاز
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                <span className="text-sm">0-3 نقاط</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/4 h-2 bg-red-400 rounded-full"></div>
                  </div>
                  <span className="text-xs text-red-600">25%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                <span className="text-sm">4-8 نقاط</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-2/3 h-2 bg-yellow-400 rounded-full"></div>
                  </div>
                  <span className="text-xs text-yellow-600">67%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-white border rounded-lg">
                <span className="text-sm">12+ نقاط</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full">
                    <div className="w-full h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-xs text-green-600">100%</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'levels':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-600">🏆 نظام المستويات</h3>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">معايير الترقية:</h4>
              <p className="text-sm text-gray-700 font-mono bg-white p-2 rounded">
                المستوى = Math.floor(إجمالي النقاط ÷ 100)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">0</div>
                <div>
                  <p className="font-medium">مبتدئ</p>
                  <p className="text-sm text-gray-600">0 - 99 نقطة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <div>
                  <p className="font-medium">متوسط</p>
                  <p className="text-sm text-gray-600">100 - 199 نقطة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <div>
                  <p className="font-medium">متقدم</p>
                  <p className="text-sm text-gray-600">200 - 299 نقطة</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-white border rounded-lg">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3+</div>
                <div>
                  <p className="font-medium">خبير</p>
                  <p className="text-sm text-gray-600">300+ نقطة</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">وقت القطع اليومي:</h4>
              <p className="text-sm text-gray-700">
                كل يوم يبدأ من <strong>00:00</strong> وينتهي في <strong>23:59</strong> حسب التوقيت المحلي
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            دليل النظام
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {renderTabContent()}
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center">
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
              فهمت، شكراً!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemInfo;
