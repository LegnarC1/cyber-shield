import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CloudUpload, FileText, Archive, FileCode, Download, Trash2, Loader2, Search } from "lucide-react";
import { ScannedFile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function FileAnalysis() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: files = [], isLoading } = useQuery({
    queryKey: ["/api/files"],
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (fileData: { filename: string; fileSize: number }) => {
      return await apiRequest("POST", "/api/files", {
        ...fileData,
        scanStatus: "scanning",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Archivo enviado",
        description: "El archivo se está analizando. Los resultados aparecerán pronto.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo enviar el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return await apiRequest("PATCH", `/api/files/${fileId}`, {
        scanStatus: "deleted",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Archivo eliminado",
        description: "El archivo malicioso ha sido eliminado del sistema.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

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

  const handleFileUpload = () => {
    // Simulate file upload
    const mockFiles = [
      { filename: "nuevo_documento.pdf", fileSize: 3145728 },
      { filename: "aplicacion.exe", fileSize: 8388608 },
      { filename: "archivo_comprimido.zip", fileSize: 12582912 }
    ];
    
    const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    uploadFileMutation.mutate(randomFile);
  };

  const filteredFiles = files.filter((file: ScannedFile) =>
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const scanningCount = files.filter((file: ScannedFile) => file.scanStatus === "scanning").length;
  const infectedCount = files.filter((file: ScannedFile) => file.scanStatus === "infected").length;
  const cleanCount = files.filter((file: ScannedFile) => file.scanStatus === "clean").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-blue"></div>
          <p className="mt-4 text-gray-600">Cargando análisis de archivos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Análisis de Archivos" 
        description="Escaneo y análisis de malware en archivos"
        systemStatus={infectedCount > 0 ? "warning" : "active"}
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Archivos</p>
                <p className="text-2xl font-bold text-security-blue">{files.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Analizando</p>
                <p className="text-2xl font-bold text-warning-yellow">{scanningCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Limpios</p>
                <p className="text-2xl font-bold text-success-green">{cleanCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Infectados</p>
                <p className="text-2xl font-bold text-alert-red">{infectedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-security-blue">
              Subir Archivos para Análisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
              <p className="text-sm text-gray-500 mb-4">
                Soporta: .exe, .pdf, .doc, .zip (Máx. 50MB)
              </p>
              <Button 
                onClick={handleFileUpload}
                disabled={uploadFileMutation.isPending}
                className="bg-security-blue hover:bg-blue-700"
              >
                {uploadFileMutation.isPending ? "Subiendo..." : "Seleccionar Archivos"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Files List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-security-blue">
                Archivos Analizados
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar archivos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFiles.map((file: ScannedFile) => {
                const FileIcon = getFileIcon(file.filename);
                const statusConfig = getStatusConfig(file.scanStatus);
                
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileIcon className="h-6 w-6 text-gray-500" />
                      <div>
                        <p className="font-medium">{file.filename}</p>
                        <p className="text-sm text-gray-500">{formatFileSize(file.fileSize)}</p>
                        {file.threatFound && (
                          <p className="text-sm text-alert-red">Amenaza: {file.threatFound}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${statusConfig.color} text-white`}>
                        {statusConfig.text}
                      </Badge>
                      {file.scanStatus === "scanning" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-warning-yellow" />
                      ) : file.scanStatus === "infected" ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteFileMutation.mutate(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
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
      </div>
    </div>
  );
}
