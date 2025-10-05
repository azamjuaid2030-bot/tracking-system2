import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Trophy } from 'lucide-react';

const ActivityCard = ({ category, onSelect }) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full ${category.color} flex items-center justify-center text-white text-xl`}>
            {category.icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>التقدم</span>
            <span className="font-medium">{category.progress}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                category.id === 'university' ? 'bg-blue-500' :
                category.id === 'english' ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${category.progress}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{category.activitiesCount} نشاط</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Trophy className="h-4 w-4" />
              <span>{category.points} نقطة</span>
            </div>
          </div>
        </div>

        <button
          onClick={onSelect}
          className={`w-full mt-4 py-2 px-4 rounded-lg text-white font-medium transition-colors ${
            category.id === 'university' ? 'bg-blue-500 hover:bg-blue-600' :
            category.id === 'english' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'
          }`}
        >
          ابدأ النشاط
        </button>
      </CardContent>
    </Card>
  );
};

export default ActivityCard;
