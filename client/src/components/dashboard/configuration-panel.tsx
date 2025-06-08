import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ShieldCheck, RefreshCw, UserCheck } from "lucide-react";
import { SecurityConfig } from "@shared/schema";

interface ConfigurationPanelProps {
  config: SecurityConfig[];
  onConfigUpdate: (service: string, status: string) => void;
}

export default function ConfigurationPanel({ config, onConfigUpdate }: ConfigurationPanelProps) {
  const getServiceConfig = (service: string) => {
    switch (service) {
      case "firewall":
        return { 
          icon: Shield, 
          name: "Firewall",
          description: "Protección de red"
        };
      case "antivirus":
        return { 
          icon: ShieldCheck, 
          name: "Antivirus",
          description: "Protección contra malware"
        };
      case "updates":
        return { 
          icon: RefreshCw, 
          name: "Auto-Update",
          description: "Actualizaciones automáticas"
        };
      case "access":
        return { 
          icon: UserCheck, 
          name: "Acceso",
          description: "Control de acceso"
        };
      default:
        return { 
          icon: Shield, 
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
          textColor: "text-success-green"
        };
      case "inactive":
        return { 
          color: "bg-alert-red", 
          text: "INACTIVO",
          textColor: "text-alert-red"
        };
      case "scheduled":
        return { 
          color: "bg-warning-yellow", 
          text: "PROGRAMADO",
          textColor: "text-warning-yellow"
        };
      case "restricted":
        return { 
          color: "bg-alert-red", 
          text: "RESTRINGIDO",
          textColor: "text-alert-red"
        };
      case "error":
        return { 
          color: "bg-gray-500", 
          text: "ERROR",
          textColor: "text-gray-500"
        };
      default:
        return { 
          color: "bg-gray-500", 
          text: "DESCONOCIDO",
          textColor: "text-gray-500"
        };
    }
  };

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold text-security-blue">
          Configuración de Seguridad
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {config.map((item) => {
            const serviceConfig = getServiceConfig(item.service);
            const statusConfig = getStatusConfig(item.status);
            const Icon = serviceConfig.icon;
            
            return (
              <div key={item.service} className="text-center">
                <div className={`${statusConfig.color} text-white p-4 rounded-full mx-auto w-16 h-16 flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-gray-900">{serviceConfig.name}</h4>
                <p className={`text-sm font-medium ${statusConfig.textColor}`}>
                  {statusConfig.text}
                </p>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-security-blue hover:underline"
                  onClick={() => onConfigUpdate(item.service, item.status)}
                >
                  Configurar
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
