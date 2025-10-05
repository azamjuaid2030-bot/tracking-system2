// مكتبة تصدير PDF للتقارير اليومية
class PDFExporter {
  constructor() {
    this.canvas = null;
    this.ctx = null;
  }

  // إنشاء PDF للتقرير اليومي
  async generateDailyReport(reportData) {
    const { date, activities, stats, arabicDate, gregorianDate } = reportData;
    
    // إنشاء Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 794; // A4 width in pixels (72 DPI)
    canvas.height = 1123; // A4 height in pixels (72 DPI)
    const ctx = canvas.getContext('2d');
    
    // خلفية بيضاء
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // إعداد الخط العربي
    ctx.textAlign = 'right';
    ctx.direction = 'rtl';
    
    let yPosition = 60;
    
    // رأس التقرير
    await this.drawHeader(ctx, canvas.width, yPosition, arabicDate, gregorianDate);
    yPosition += 120;
    
    // الإحصائيات الرئيسية
    yPosition = await this.drawMainStats(ctx, canvas.width, yPosition, stats);
    yPosition += 80;
    
    // قائمة الأنشطة
    yPosition = await this.drawActivitiesList(ctx, canvas.width, yPosition, activities);
    
    // تذييل التقرير
    await this.drawFooter(ctx, canvas.width, canvas.height);
    
    // تحويل إلى PDF وتحميل
    this.downloadCanvasAsPDF(canvas, `تقرير_يومي_${date}.pdf`);
  }
  
  // رسم رأس التقرير
  async drawHeader(ctx, width, y, arabicDate, gregorianDate) {
    // خلفية ملونة للرأس
    const gradient = ctx.createLinearGradient(0, y, width, y + 100);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#1E40AF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, y, width, 100);
    
    // عنوان التقرير
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تقرير المتابعة اليومية', width / 2, y + 35);
    
    // التاريخ الهجري
    ctx.font = 'bold 18px Arial, sans-serif';
    ctx.fillText(arabicDate, width / 2, y + 60);
    
    // التاريخ الميلادي
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#E5E7EB';
    ctx.fillText(gregorianDate, width / 2, y + 80);
  }
  
  // رسم الإحصائيات الرئيسية
  async drawMainStats(ctx, width, y, stats) {
    const { totalPoints, totalDuration, activitiesCount, completionPercentage } = stats;
    
    // عنوان القسم
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('الإحصائيات اليومية', width - 40, y);
    
    y += 40;
    
    // رسم البطاقات الإحصائية
    const cardWidth = 160;
    const cardHeight = 100;
    const cardSpacing = 20;
    const startX = width - 40 - cardWidth;
    
    const statsData = [
      { label: 'إجمالي الوقت', value: this.formatTime(totalDuration), color: '#3B82F6' },
      { label: 'الأنشطة', value: activitiesCount.toString(), color: '#8B5CF6' },
      { label: 'النقاط', value: totalPoints.toString(), color: '#10B981' },
      { label: 'نسبة الإنجاز', value: `${completionPercentage}%`, color: '#F59E0B' }
    ];
    
    for (let i = 0; i < statsData.length; i++) {
      const stat = statsData[i];
      const cardX = startX - (i * (cardWidth + cardSpacing));
      
      // خلفية البطاقة
      ctx.fillStyle = '#F9FAFB';
      ctx.fillRect(cardX, y, cardWidth, cardHeight);
      
      // حدود البطاقة
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX, y, cardWidth, cardHeight);
      
      // القيمة
      ctx.fillStyle = stat.color;
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, cardX + cardWidth / 2, y + 40);
      
      // التسمية
      ctx.fillStyle = '#6B7280';
      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(stat.label, cardX + cardWidth / 2, y + 65);
    }
    
    return y + cardHeight + 20;
  }
  
  // رسم قائمة الأنشطة
  async drawActivitiesList(ctx, width, y, activities) {
    // عنوان القسم
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('تفاصيل الأنشطة', width - 40, y);
    
    y += 40;
    
    if (activities.length === 0) {
      ctx.fillStyle = '#6B7280';
      ctx.font = '16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('لم يتم تسجيل أي أنشطة في هذا اليوم', width / 2, y + 40);
      return y + 80;
    }
    
    // رسم كل نشاط
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      y = await this.drawActivity(ctx, width, y, activity, i + 1);
      y += 20; // مسافة بين الأنشطة
    }
    
    return y;
  }
  
  // رسم نشاط واحد
  async drawActivity(ctx, width, y, activity, index) {
    const activityHeight = 80;
    const margin = 40;
    const activityWidth = width - (margin * 2);
    
    // خلفية النشاط
    ctx.fillStyle = index % 2 === 0 ? '#F9FAFB' : '#FFFFFF';
    ctx.fillRect(margin, y, activityWidth, activityHeight);
    
    // حدود النشاط
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.strokeRect(margin, y, activityWidth, activityHeight);
    
    // رقم النشاط
    ctx.fillStyle = this.getCategoryColor(activity.category);
    ctx.fillRect(margin, y, 5, activityHeight);
    
    // اسم النشاط
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 16px Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(activity.customTitle || activity.name, width - margin - 20, y + 25);
    
    // تفاصيل النشاط
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial, sans-serif';
    const details = `${activity.duration} دقيقة • ${activity.points} نقطة • ${this.getCategoryName(activity.category)}`;
    ctx.fillText(details, width - margin - 20, y + 45);
    
    // الوقت
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '11px Arial, sans-serif';
    const time = activity.actualTime ? new Date(activity.actualTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : 'غير محدد';
    ctx.fillText(time, width - margin - 20, y + 65);
    
    return y + activityHeight;
  }
  
  // رسم تذييل التقرير
  async drawFooter(ctx, width, height) {
    const footerY = height - 60;
    
    // خط فاصل
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, footerY);
    ctx.lineTo(width - 40, footerY);
    ctx.stroke();
    
    // نص التذييل
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('تم إنشاء هذا التقرير بواسطة نظام المتابعة اليومية', width / 2, footerY + 25);
    
    // التاريخ والوقت
    const now = new Date();
    const timestamp = now.toLocaleString('ar-SA');
    ctx.fillText(`تاريخ الإنشاء: ${timestamp}`, width / 2, footerY + 40);
  }
  
  // تحويل Canvas إلى PDF وتحميل
  downloadCanvasAsPDF(canvas, filename) {
    // تحويل Canvas إلى صورة
    const imgData = canvas.toDataURL('image/png');
    
    // إنشاء نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${filename}</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
          img { max-width: 100%; height: auto; }
          .print-button { 
            background: #3B82F6; 
            color: white; 
            border: none; 
            padding: 10px 20px; 
            border-radius: 5px; 
            cursor: pointer; 
            margin-bottom: 20px;
            font-size: 16px;
          }
          .print-button:hover { background: #2563EB; }
          @media print {
            .print-button { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">طباعة / حفظ كـ PDF</button>
        <img src="${imgData}" alt="تقرير يومي" />
      </body>
      </html>
    `);
    printWindow.document.close();
  }
  
  // دوال مساعدة
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')} ساعة`;
    }
    return `${mins} دقيقة`;
  }
  
  getCategoryColor(category) {
    switch (category) {
      case 'english': return '#10B981';
      case 'university': return '#3B82F6';
      case 'other': return '#F59E0B';
      default: return '#6B7280';
    }
  }
  
  getCategoryName(category) {
    switch (category) {
      case 'english': return 'اللغة الإنجليزية';
      case 'university': return 'الجامعة';
      case 'other': return 'أخرى';
      default: return 'غير محدد';
    }
  }
}

export default new PDFExporter();
