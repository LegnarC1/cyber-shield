import { Link, useLocation } from "wouter";
import { Shield, BarChart3, AlertTriangle, FileText, Settings, Activity, List } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Alertas de Amenazas", href: "/threats", icon: AlertTriangle },
  { name: "Análisis de Archivos", href: "/file-analysis", icon: FileText },
  { name: "Configuración", href: "/configuration", icon: Settings },
  { name: "Monitorización", href: "/monitoring", icon: Activity },
  { name: "Registros", href: "/logs", icon: List },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-security-blue text-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8" />
          <h1 className="text-xl font-bold">CyberGuard</h1>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-700 text-white"
                    : "text-blue-100 hover:bg-blue-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
