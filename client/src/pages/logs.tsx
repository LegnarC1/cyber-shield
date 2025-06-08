import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Download, Trash2, AlertTriangle } from "lucide-react";
import { SystemEvent } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Logs() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "high":
        return { color: "bg-alert-red", text: "ALTO" };
      case "medium":
        return { color: "bg-warning-yellow", text: "MEDIO" };
      case "low":
        return { color: "bg-success-green", text: "BAJO" };
      default:
        return { color: "bg-gray-500", text: "DESCONOCIDO" };
    }
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "security":
        return { color: "bg-red-100 text-red-800", icon: "🔒" };
      case "firewall":
        return { color: "bg-blue-100 text-blue-800", icon: "🛡️" };
      case "threat":
        return { color: "bg-red-100 text-red-800", icon: "⚠️" };
      case "update":
        return { color: "bg-green-100 text-green-800", icon: "🔄" };
      case "scan":
        return { color: "bg-purple-100 text-purple-800", icon: "🔍" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: "📝" };
    }
  };

  const filteredEvents = events.filter((event: SystemEvent) => {
    const matchesSearch = event.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter;
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    
    return matchesSearch && matchesSeverity && matchesType;
  });

  const handleExportLogs = () => {
    toast({
      title: "Exportando registros",
      description: "Los registros se están preparando para descarga...",
    });
  };

  const handleClearLogs = () => {
    toast({
      title: "Limpiar registros",
      description: "Esta acción eliminará todos los registros históricos.",
      variant: "destructive",
    });
  };

  const uniqueTypes = [...new Set(events.map((event: SystemEvent) => event.type))];
  const severityCounts = {
    high: events.filter((e: SystemEvent) => e.severity === "high").length,
    medium: events.filter((e: SystemEvent) => e.severity === "medium").length,
    low: events.filter((e: SystemEvent) => e.severity === "low").length
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-security-blue"></div>
          <p className="mt-4 text-gray-600">Cargando registros...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header 
        title="Registros del Sistema" 
        description="Historial completo de eventos y actividades de seguridad"
        systemStatus="active"
      />

      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-2xl font-bold text-security-blue">{events.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Severidad Alta</p>
                <p className="text-2xl font-bold text-alert-red">{severityCounts.high}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Severidad Media</p>
                <p className="text-2xl font-bold text-warning-yellow">{severityCounts.medium}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">Severidad Baja</p>
                <p className="text-2xl font-bold text-success-green">{severityCounts.low}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-security-blue">
                Filtros y Búsqueda
              </CardTitle>
              <div className="flex space-x-2">
                <Button onClick={handleExportLogs} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button onClick={handleClearLogs} variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar en los registros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Severidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="low">Baja</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {uniqueTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-security-blue">
              Registro de Eventos ({filteredEvents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredEvents.map((event: SystemEvent) => {
                const severityConfig = getSeverityConfig(event.severity);
                const typeConfig = getTypeConfig(event.type);
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{typeConfig.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-gray-900">{event.message}</h4>
                          {event.severity === "high" && (
                            <AlertTriangle className="h-4 w-4 text-alert-red" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{format(new Date(event.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: es })}</span>
                          <span>•</span>
                          <Badge className={typeConfig.color}>
                            {event.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={`${severityConfig.color} text-white`}>
                        {severityConfig.text}
                      </Badge>
                    </div>
                  </div>
                );
              })}
              
              {filteredEvents.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron eventos con los filtros aplicados.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
