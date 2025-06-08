import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bug, AlertTriangle, Check } from "lucide-react";
import { Threat } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ThreatDetectionPanelProps {
  threats: Threat[];
}

export default function ThreatDetectionPanel({ threats }: ThreatDetectionPanelProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "critical":
        return { color: "bg-alert-red", text: "CRÍTICO", icon: Bug };
      case "high":
        return { color: "bg-alert-red", text: "ALTO", icon: Bug };
      case "medium":
        return { color: "bg-warning-yellow", text: "MEDIO", icon: AlertTriangle };
      case "low":
        return { color: "bg-success-green", text: "BAJO", icon: Check };
      default:
        return { color: "bg-gray-500", text: "DESCONOCIDO", icon: AlertTriangle };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { bgColor: "bg-red-50", borderColor: "border-red-200" };
      case "investigating":
        return { bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
      case "resolved":
        return { bgColor: "bg-green-50", borderColor: "border-green-200" };
      default:
        return { bgColor: "bg-gray-50", borderColor: "border-gray-200" };
    }
  };

  const latestThreats = threats.slice(0, 3);

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-security-blue">
            Detección de Amenazas en Tiempo Real
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Activo</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {latestThreats.map((threat) => {
            const severityConfig = getSeverityConfig(threat.severity);
            const statusConfig = getStatusConfig(threat.status);
            const Icon = severityConfig.icon;
            
            return (
              <div
                key={threat.id}
                className={`flex items-center justify-between p-4 ${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${severityConfig.color} text-white p-2 rounded-full`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{threat.name}</p>
                    <p className="text-sm text-gray-600">{threat.location}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={`${severityConfig.color} text-white text-xs font-medium`}>
                    {threat.status === "resolved" ? "RESUELTO" : severityConfig.text}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    hace {formatDistanceToNow(new Date(threat.detectedAt), { locale: es })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <Button className="w-full bg-security-blue hover:bg-blue-700">
            Ver Todas las Amenazas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
