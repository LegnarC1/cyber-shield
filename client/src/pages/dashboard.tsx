import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import StatusCards from "@/components/dashboard/status-cards";
import ThreatDetectionPanel from "@/components/dashboard/threat-detection-panel";
import FileAnalysisPanel from "@/components/dashboard/file-analysis-panel";
import MonitoringCharts from "@/components/dashboard/monitoring-charts";
import ConfigurationPanel from "@/components/dashboard/configuration-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: threats = [], isLoading: threatsLoading } = useQuery({
    queryKey: ["/api/threats"],
  });

  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["/api/files"],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: config = [], isLoading: configLoading } = useQuery({
    queryKey: ["/api/security-config"],
  });

  const handleFileUpload = () => {
    toast({
      title: "Función de carga de archivos",
      description: "Esta funcionalidad se integrará con el componente de carga de archivos.",
    });
  };

  const handleConfigUpdate = (service: string, currentStatus: string) => {
    toast({
      title: `Configuración de ${service}`,
      description: `Estado actual: ${currentStatus}. Abriendo panel de configuración...`,
    });
  };

  const criticalThreats = threats.filter(
    (threat: any) => threat.severity === "critical" && threat.status === "active"
  );

  if (statsLoading || threatsLoading || filesLoading || eventsLoading || configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-blue"></div>
          <p className="mt-4 text-gray-600">Cargando panel de seguridad...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Panel de Seguridad" 
        description="Monitor en tiempo real del estado de seguridad"
        systemStatus="active"
      />

      {criticalThreats.length > 0 && (
        <Alert className="bg-alert-red text-white mx-6 mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-semibold">{criticalThreats.length} Amenazas Críticas Detectadas</span>
              <span className="text-sm opacity-90">Última actualización: hace 2 minutos</span>
            </div>
            <Button size="sm" variant="secondary" className="bg-red-700 hover:bg-red-800">
              Ver Detalles
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="p-6 space-y-6">
        <StatusCards stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThreatDetectionPanel threats={threats} />
          <FileAnalysisPanel files={files} onFileUpload={handleFileUpload} />
        </div>

        <MonitoringCharts events={events} />

        <ConfigurationPanel config={config} onConfigUpdate={handleConfigUpdate} />
      </div>
    </div>
  );
}
