import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, FileText, Archive, FileCode, Download, Trash2, Loader2 } from "lucide-react";
import { ScannedFile } from "@shared/schema";

interface FileAnalysisPanelProps {
  files: ScannedFile[];
  onFileUpload: () => void;
}

export default function FileAnalysisPanel({ files, onFileUpload }: FileAnalysisPanelProps) {
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
        return FileText;
      case 'zip':
      case 'rar':
      case '7z':
        return Archive;
      case 'exe':
      case 'bat':
      case 'cmd':
        return FileCode;
      default:
        return FileText;
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "clean":
        return { color: "bg-success-green", text: "LIMPIO" };
      case "infected":
        return { color: "bg-alert-red", text: "MALWARE" };
      case "scanning":
        return { color: "bg-warning-yellow", text: "ANALIZANDO" };
      case "error":
        return { color: "bg-gray-500", text: "ERROR" };
      default:
        return { color: "bg-gray-500", text: "DESCONOCIDO" };
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const recentFiles = files.slice(0, 3);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold text-security-blue">
          Análisis de Archivos
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
          <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
          <p className="text-sm text-gray-500 mb-4">
            Soporta: .exe, .pdf, .doc, .zip (Máx. 50MB)
          </p>
          <Button onClick={onFileUpload} className="bg-security-blue hover:bg-blue-700">
            Seleccionar Archivos
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Análisis Recientes</h4>
          
          {recentFiles.map((file) => {
            const FileIcon = getFileIcon(file.filename);
            const statusConfig = getStatusConfig(file.scanStatus);
            
            return (
              <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-sm">{file.filename}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={`${statusConfig.color} text-white text-xs`}>
                    {statusConfig.text}
                  </Badge>
                  {file.scanStatus === "scanning" ? (
                    <Loader2 className="h-4 w-4 animate-spin text-warning-yellow" />
                  ) : file.scanStatus === "infected" ? (
                    <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="text-gray-500 hover:text-gray-700">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
