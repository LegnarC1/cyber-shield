import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldCheck, RefreshCw, UserCheck, Settings } from "lucide-react";
import { SecurityConfig } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Configuration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: config = [], isLoading } = useQuery({
    queryKey: ["/api/security-config"],
  });

  const updateConfigMutation = useMutation({
    mutationFn: async ({ service, status }: { service: string; status: string }) => {
      return await apiRequest("PATCH", `/api/security-config/${service}`, { status });
    },
    onSuccess: (_, { service }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/security-config"] });
      toast({
        title: "Configuración actualizada",
        description: `La configuración de ${service} ha sido actualizada exitosamente.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const getServiceConfig = (service: string) => {
    switch (service) {
      case "firewall":
        return { 
          icon: Shield, 
          name: "Firewall",
          description: "Protección de red y filtrado de tráfico"
        };
      case "antivirus":
        return { 
          icon: ShieldCheck, 
          name: "Antivirus",
          description: "Protección contra malware y virus"
        };
      case "updates":
        return { 
          icon: RefreshCw, 
          name: "Actualizaciones Automáticas",
          description: "Gestión de actualizaciones de seguridad"
        };
      case "access":
        return { 
          icon: UserCheck, 
          name: "Control de Acceso",
          description: "Gestión de permisos y autenticación"
        };
      default:
        return { 
          icon: Settings, 
          name: service,
          description: "Servicio de seguridad"
        };
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { 
          color: "bg-success-green", 
          text: "ACTIVO",
          textColor: "text-success-green",
          switchValue: true
        };
      case "inactive":
        return { 
          color: "bg-alert-red", 
          text: "INACTIVO",
          textColor: "text-alert-red",
          switchValue: false
        };
      case "scheduled":
        return { 
          color: "bg-warning-yellow", 
          text: "PROGRAMADO",
          textColor: "text-warning-yellow",
          switchValue: true
        };
      case "restricted":
        return { 
          color: "bg-alert-red", 
          text: "RESTRINGIDO",
          textColor: "text-alert-red",
          switchValue: true
        };
      case "error":
        return { 
          color: "bg-gray-500", 
          text: "ERROR",
          textColor: "text-gray-500",
          switchValue: false
        };
      default:
        return { 
          color: "bg-gray-500", 
          text: "DESCONOCIDO",
          textColor: "text-gray-500",
          switchValue: false
        };
    }
  };

  const handleToggleService = (service: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateConfigMutation.mutate({ service, status: newStatus });
  };

  const activeServices = config.filter((item: SecurityConfig) => 
    item.status === "active" || item.status === "scheduled" || item.status === "restricted"
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-blue"></div>
          <p className="mt-4 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Configuración de Seguridad" 
        description="Gestión de servicios y políticas de seguridad"
        systemStatus={activeServices === config.length ? "active" : "warning"}
      />

      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Servicios Activos</p>
                <p className="text-2xl font-bold text-success-green">{activeServices}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Servicios</p>
                <p className="text-2xl font-bold text-security-blue">{config.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Estado General</p>
                <p className={`text-2xl font-bold ${
                  activeServices === config.length ? "text-success-green" : "text-warning-yellow"
                }`}>
                  {activeServices === config.length ? "ÓPTIMO" : "ALERTA"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {config.map((item: SecurityConfig) => {
            const serviceConfig = getServiceConfig(item.service);
            const statusConfig = getStatusConfig(item.status);
            const Icon = serviceConfig.icon;
            
            return (
              <Card key={item.service}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`${statusConfig.color} text-white p-3 rounded-full`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{serviceConfig.name}</CardTitle>
                        <p className="text-sm text-gray-600">{serviceConfig.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={statusConfig.switchValue}
                      onCheckedChange={() => handleToggleService(item.service, item.status)}
                      disabled={updateConfigMutation.isPending}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estado:</span>
                      <Badge className={`${statusConfig.color} text-white`}>
                        {statusConfig.text}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Última actualización:</span>
                      <span className="text-sm text-gray-500">
                        {new Date(item.lastUpdated).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toast({
                          title: `Configuración avanzada de ${serviceConfig.name}`,
                          description: "Esta funcionalidad abrirá el panel de configuración avanzada.",
                        })}
                      >
                        Configurar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toast({
                          title: `Registro de ${serviceConfig.name}`,
                          description: "Mostrando el registro de actividad del servicio.",
                        })}
                      >
                        Ver Registro
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-security-blue">
              Políticas de Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Políticas de Red</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Bloquear puertos no autorizados</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Filtrado de contenido web</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Detección de intrusiones</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Políticas de Archivos</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Escaneo automático</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Cuarentena automática</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Análisis heurístico</span>
                    <Switch />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
