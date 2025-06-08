import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, Check, Clock } from "lucide-react";
import { Threat } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Threats() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: threats = [], isLoading } = useQuery({
    queryKey: ["/api/threats"],
  });

  const resolveThreatMutation = useMutation({
    mutationFn: async (threatId: number) => {
      return await apiRequest("PATCH", `/api/threats/${threatId}`, {
        status: "resolved",
        resolvedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/threats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Amenaza resuelta",
        description: "La amenaza ha sido marcada como resuelta exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo resolver la amenaza. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

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
        return { bgColor: "bg-red-50", borderColor: "border-red-200", text: "ACTIVA" };
      case "investigating":
        return { bgColor: "bg-yellow-50", borderColor: "border-yellow-200", text: "INVESTIGANDO" };
      case "resolved":
        return { bgColor: "bg-green-50", borderColor: "border-green-200", text: "RESUELTA" };
      default:
        return { bgColor: "bg-gray-50", borderColor: "border-gray-200", text: "DESCONOCIDO" };
    }
  };

  const activeThreatCount = threats.filter((threat: Threat) => threat.status === "active").length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-blue"></div>
          <p className="mt-4 text-gray-600">Cargando amenazas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Alertas de Amenazas" 
        description="Gestión y monitoreo de amenazas de seguridad"
        systemStatus={activeThreatCount > 0 ? "warning" : "active"}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Amenazas Activas</p>
                  <p className="text-2xl font-bold text-alert-red">
                    {threats.filter((t: Threat) => t.status === "active").length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-alert-red" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Investigación</p>
                  <p className="text-2xl font-bold text-warning-yellow">
                    {threats.filter((t: Threat) => t.status === "investigating").length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-warning-yellow" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Resueltas</p>
                  <p className="text-2xl font-bold text-success-green">
                    {threats.filter((t: Threat) => t.status === "resolved").length}
                  </p>
                </div>
                <Check className="h-8 w-8 text-success-green" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-security-blue">
              Lista de Amenazas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {threats.map((threat: Threat) => {
                const severityConfig = getSeverityConfig(threat.severity);
                const statusConfig = getStatusConfig(threat.status);
                const Icon = severityConfig.icon;
                
                return (
                  <div
                    key={threat.id}
                    className={`flex items-center justify-between p-6 ${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`${severityConfig.color} text-white p-3 rounded-full`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{threat.name}</h3>
                        <p className="text-sm text-gray-600">{threat.location}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Detectada hace {formatDistanceToNow(new Date(threat.detectedAt), { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Badge className={`${severityConfig.color} text-white mb-2`}>
                          {severityConfig.text}
                        </Badge>
                        <p className="text-sm text-gray-600">{statusConfig.text}</p>
                      </div>
                      {threat.status !== "resolved" && (
                        <Button
                          onClick={() => resolveThreatMutation.mutate(threat.id)}
                          disabled={resolveThreatMutation.isPending}
                          size="sm"
                          className="bg-success-green hover:bg-green-700"
                        >
                          {resolveThreatMutation.isPending ? "Resolviendo..." : "Resolver"}
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
