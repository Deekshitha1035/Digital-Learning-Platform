import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Language } from '@/app/types';
import { getTranslation } from '@/app/utils/localization';
import { Award, Download, Printer } from 'lucide-react';

interface CertificateViewerProps {
  open: boolean;
  onClose: () => void;
  studentName: string;
  achievement: string;
  date: string;
  language: Language;
}

export function CertificateViewer({ 
  open, 
  onClose, 
  studentName, 
  achievement, 
  date, 
  language 
}: CertificateViewerProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('Certificate download functionality would be implemented here');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{getTranslation('certificate', language)}</DialogTitle>
          <DialogDescription>
            {getTranslation('achievementCertificate', language)}
          </DialogDescription>
        </DialogHeader>

        {/* Certificate Design */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8 border-4 border-blue-600 rounded-lg shadow-lg">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3">
              <Award className="size-12 text-blue-600" />
              <div>
                <h2 className="text-3xl font-bold text-blue-900">
                  {getTranslation('certificateOfAchievement', language)}
                </h2>
                <p className="text-sm text-gray-600">
                  {getTranslation('digitalIndia', language)} - {getTranslation('ruralEducation', language)}
                </p>
              </div>
            </div>

            {/* Decorative Line */}
            <div className="flex items-center gap-2 justify-center">
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent flex-1" />
              <Award className="size-4 text-blue-400" />
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent flex-1" />
            </div>

            {/* Content */}
            <div className="space-y-4 py-6">
              <p className="text-lg text-gray-700">
                {getTranslation('presentedTo', language)}
              </p>
              <h3 className="text-4xl font-bold text-blue-900 font-serif">
                {studentName}
              </h3>
              <p className="text-lg text-gray-700 max-w-xl mx-auto">
                {getTranslation('forSuccessfully', language)} <span className="font-semibold">{achievement}</span>
              </p>
              <p className="text-sm text-gray-600">
                {getTranslation('dateIssued', language)}: {new Date(date).toLocaleDateString()}
              </p>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-300 mt-8">
              <div className="flex justify-between items-end max-w-lg mx-auto">
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 pt-2 px-8">
                    <p className="text-sm font-semibold">{getTranslation('teacherSignature', language)}</p>
                  </div>
                </div>
                <div className="size-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="size-8 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-400 pt-2 px-8">
                    <p className="text-sm font-semibold">{getTranslation('principalSignature', language)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="size-4 mr-2" />
            {getTranslation('print', language)}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="size-4 mr-2" />
            {getTranslation('download', language)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
