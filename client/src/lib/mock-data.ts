// This file contains utility functions for generating mock data
// Used for demonstration purposes only

export const generateMockThreat = () => {
  const threats = [
    "Malware Trojan.Win32.Agent",
    "Actividad de Red Sospechosa", 
    "Phishing Email Detectado",
    "Ransomware Attempt Blocked",
    "Unauthorized Access Attempt"
  ];
  
  const locations = [
    "/home/user/downloads/suspicious.exe",
    "IP: 192.168.1.105",
    "email@suspicious-domain.com",
    "/tmp/encrypted_files",
    "Remote IP: 10.0.0.1"
  ];
  
  const severities = ["critical", "high", "medium", "low"];
  const types = ["malware", "network", "phishing", "ransomware", "access"];
  
  return {
    name: threats[Math.floor(Math.random() * threats.length)],
    type: types[Math.floor(Math.random() * types.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    status: "active",
    location: locations[Math.floor(Math.random() * locations.length)]
  };
};

export const generateMockFile = () => {
  const filenames = [
    "document.pdf", "archive.zip", "script.exe", "image.jpg", 
    "spreadsheet.xlsx", "presentation.pptx", "video.mp4"
  ];
  
  const statuses = ["clean", "infected", "scanning"];
  
  return {
    filename: filenames[Math.floor(Math.random() * filenames.length)],
    fileSize: Math.floor(Math.random() * 50000000) + 1000000, // 1MB to 50MB
    scanStatus: statuses[Math.floor(Math.random() * statuses.length)]
  };
};

export const generateMockEvent = () => {
  const messages = [
    "Intento de acceso no autorizado",
    "Firewall bloqueó conexión",
    "Actualización de seguridad aplicada",
    "Malware detectado y eliminado", 
    "Escaneo programado completado"
  ];
  
  const types = ["security", "firewall", "update", "threat", "scan"];
  const severities = ["high", "medium", "low"];
  
  return {
    type: types[Math.floor(Math.random() * types.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    severity: severities[Math.floor(Math.random() * severities.length)]
  };
};
