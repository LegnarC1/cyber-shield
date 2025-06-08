import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp } from "lucide-react";
import { SystemEvent } from "@shared/schema";
import { formatTime } from "date-fns";

interface MonitoringChartsProps {
  events: SystemEvent[];
}

export default function MonitoringCharts({ events }: MonitoringChartsProps) {
  // Mock performance data
  const performanceData = {
    cpu: Math.floor(Math.random() * 50) + 20,
    memory: Math.floor(Math.random() * 30) + 50,
    disk: Math.floor(Math.random() * 40) + 10,
    network: Math.floor(Math.random() * 20) + 70
  };

  const getPerformanceColor = (value: number) => {
    if (value < 50) return "bg-success-green";
    if (value < 80) return "bg-warning-yellow";
    return "bg-alert-red";
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

  const recentEvents = events.slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Network Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-security-blue">
            Actividad de Red
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 mb-4">Gráfico de Actividad de Red</p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-success-green rounded mr-2"></div>
                  <span>Tráfico Normal</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-alert-red rounded mr-2"></div>
                  <span>Amenazas</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-security-blue">
            Rendimiento del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CPU</span>
                <span>{performanceData.cpu}%</span>
              </div>
              <Progress 
                value={performanceData.cpu} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memoria</span>
                <span>{performanceData.memory}%</span>
              </div>
              <Progress 
                value={performanceData.memory} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Disco</span>
                <span>{performanceData.disk}%</span>
              </div>
              <Progress 
                value={performanceData.disk} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Red</span>
                <span>{performanceData.network}%</span>
              </div>
              <Progress 
                value={performanceData.network} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-security-blue">
            Eventos de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-2 rounded">
                <div className={`w-2 h-2 ${getSeverityColor(event.severity)} rounded-full`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatTime(new Date(event.timestamp), 'HH:mm:ss')}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="mt-4 w-full text-security-blue text-sm font-medium">
            Ver registro completo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
