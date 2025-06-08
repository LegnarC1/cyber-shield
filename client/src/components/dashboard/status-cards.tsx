import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Search, TrendingUp, ArrowUp, Clock, Check } from "lucide-react";

interface StatusCardsProps {
  stats: {
    protectedSystems: number;
    threatsDetected: number;
    scansCompleted: number;
    securityLevel: number;
  };
}

export default function StatusCards({ stats }: StatusCardsProps) {
  const cards = [
    {
      title: "Sistemas Protegidos",
      value: stats.protectedSystems,
      icon: Shield,
      color: "border-success-green",
      bgColor: "bg-green-100",
      iconColor: "text-success-green",
      textColor: "text-success-green",
      trend: "+12% vs mes anterior",
      trendIcon: ArrowUp
    },
    {
      title: "Amenazas Detectadas",
      value: stats.threatsDetected,
      icon: AlertTriangle,
      color: "border-alert-red",
      bgColor: "bg-red-100",
      iconColor: "text-alert-red",
      textColor: "text-alert-red",
      trend: `${Math.max(1, Math.floor(stats.threatsDetected / 5))} críticas`,
      trendIcon: ArrowUp
    },
    {
      title: "Escaneos Realizados",
      value: stats.scansCompleted,
      icon: Search,
      color: "border-warning-yellow",
      bgColor: "bg-yellow-100",
      iconColor: "text-warning-yellow",
      textColor: "text-warning-yellow",
      trend: "24h activo",
      trendIcon: Clock
    },
    {
      title: "Nivel de Seguridad",
      value: `${stats.securityLevel}%`,
      icon: TrendingUp,
      color: "border-security-blue",
      bgColor: "bg-blue-100",
      iconColor: "text-security-blue",
      textColor: "text-security-blue",
      trend: "Excelente",
      trendIcon: Check
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        const TrendIcon = card.trendIcon;
        
        return (
          <Card key={index} className={`border-l-4 ${card.color}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-full`}>
                  <Icon className={`${card.iconColor} h-6 w-6`} />
                </div>
              </div>
              <div className={`mt-4 flex items-center text-sm ${card.textColor}`}>
                <TrendIcon className="h-4 w-4 mr-1" />
                <span>{card.trend}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
