import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Activity, Network, HardDrive, Cpu, MemoryStick } from "lucide-react";
import { SystemEvent } from "@shared/schema";
import { formatTime } from "date-fns";
import { useEffect, useState } from "react";

export default function Monitoring() {
  const [performanceData, setPerformanceData] = useState({
    cpu: 34,
    memory: 67,
    disk: 23,
    network: 89
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  // Simulate real-time performance updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPerformanceData(prev => ({
        cpu: Math.max(10, Math.min(95, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(10, Math.min(95, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(10, Math.min(95, prev.disk + (Math.random() - 0.5) * 3)),
        network: Math.max(10, Math.min(95, prev.network + (Math.random() - 0.5) * 15))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getPerformanceColor = (value: number) => {
    if (value < 50) return "bg-success-green";
    if (value < 80) return "bg-warning-yellow";
    return "bg-alert-red";
  };

  const getPerformanceStatus = (value: number) => {
    if (value < 50) return "Óptimo";
    if (value < 80) return "Moderado";
    return "Alto";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-alert-red";
      case "medium":
        return "bg-warning-yellow";
      case "low":
        return "bg-success-green";
      default:
        return "bg-gray-400";
    }
  };

  const networkMetrics = {
    bytesIn: Math.floor(Math.random() * 1000000),
    bytesOut: Math.floor(Math.random() * 500000),
    packetsIn: Math.floor(Math.random() * 10000),
    packetsOut: Math.floor(Math.random() * 8000),
    connections: Math.floor(Math.random() * 100) + 50
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-blue"></div>
          <p className="mt-4 text-gray-600">Cargando monitorización...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Monitorización del Sistema" 
        description="Supervisión en tiempo real del rendimiento y actividad"
        systemStatus="active"
      />

      <div className="p-6 space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-security-blue" />
                  <span className="font-medium">CPU</span>
                </div>
                <span className="text-sm text-gray-500">{getPerformanceStatus(performanceData.cpu)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span>{Math.round(performanceData.cpu)}%</span>
                </div>
                <Progress value={performanceData.cpu} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MemoryStick className="h-5 w-5 text-security-blue" />
                  <span className="font-medium">Memoria</span>
                </div>
                <span className="text-sm text-gray-500">{getPerformanceStatus(performanceData.memory)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span>{Math.round(performanceData.memory)}%</span>
                </div>
                <Progress value={performanceData.memory} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HardDrive className="h-5 w-5 text-security-blue" />
                  <span className="font-medium">Disco</span>
                </div>
                <span className="text-sm text-gray-500">{getPerformanceStatus(performanceData.disk)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span>{Math.round(performanceData.disk)}%</span>
                </div>
                <Progress value={performanceData.disk} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Network className="h-5 w-5 text-security-blue" />
                  <span className="font-medium">Red</span>
                </div>
                <span className="text-sm text-gray-500">{getPerformanceStatus(performanceData.network)}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span>{Math.round(performanceData.network)}%</span>
                </div>
                <Progress value={performanceData.network} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Network Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-security-blue flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Actividad de Red</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Datos Entrantes</p>
                    <p className="text-lg font-bold text-security-blue">{formatBytes(networkMetrics.bytesIn)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Datos Salientes</p>
                    <p className="text-lg font-bold text-success-green">{formatBytes(networkMetrics.bytesOut)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Paquetes entrantes:</span>
                    <span className="text-sm font-medium">{networkMetrics.packetsIn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Paquetes salientes:</span>
                    <span className="text-sm font-medium">{networkMetrics.packetsOut.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Conexiones activas:</span>
                    <span className="text-sm font-medium">{networkMetrics.connections}</span>
                  </div>
                </div>
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Gráfico de actividad en tiempo real</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-security-blue">
                Eventos del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.slice(0, 10).map((event: SystemEvent) => (
                  <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 ${getSeverityColor(event.severity)} rounded-full`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{event.message}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatTime(new Date(event.timestamp), 'HH:mm:ss')}
                        </span>
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-security-blue">
              Estado General del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-green flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">98%</span>
                </div>
                <h4 className="font-semibold">Uptime</h4>
                <p className="text-sm text-gray-600">Sistema operativo</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warning-yellow flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {Math.round((performanceData.cpu + performanceData.memory + performanceData.disk + performanceData.network) / 4)}%
                  </span>
                </div>
                <h4 className="font-semibold">Carga Promedio</h4>
                <p className="text-sm text-gray-600">Rendimiento general</p>
              </div>
              
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-success-green flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {events.filter(e => e.severity === "low").length}
                  </span>
                </div>
                <h4 className="font-semibold">Eventos Normales</h4>
                <p className="text-sm text-gray-600">Sin problemas detectados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
