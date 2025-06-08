import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface HeaderProps {
  title: string;
  description: string;
  systemStatus?: "active" | "inactive" | "warning";
}

export default function Header({ title, description, systemStatus = "active" }: HeaderProps) {
  const statusConfig = {
    active: { color: "bg-success-green", text: "Sistema Activo" },
    inactive: { color: "bg-alert-red", text: "Sistema Inactivo" },
    warning: { color: "bg-warning-yellow", text: "Sistema en Alerta" }
  };

  const status = statusConfig[systemStatus];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-security-blue">{title}</h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 ${status.color} rounded-full animate-pulse`}></div>
            <span className="text-sm text-gray-600">{status.text}</span>
          </div>
          <Button className="bg-security-blue hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </div>
    </header>
  );
}
