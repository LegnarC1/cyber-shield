import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Lock, Monitor, AlertTriangle } from "lucide-react";
import { Redirect } from "wouter";

export default function AuthPage() {
  const { user, loginMutation, registerMutation, verifyIpMutation } = useAuth();
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerUsername, setRegisterUsername] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Verification form state
  const [verificationCode, setVerificationCode] = useState("");

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });
    } catch (error: any) {
      try {
        const errorData = JSON.parse(error.message);
        if (errorData.type === "verification_required") {
          setVerificationEmail(loginEmail);
          setShowVerification(true);
        }
      } catch {
        // Error handled by mutation
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerPassword !== confirmPassword) {
      return;
    }
    
    await registerMutation.mutateAsync({
      username: registerUsername,
      email: registerEmail,
      password: registerPassword,
    });
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyIpMutation.mutateAsync({
      email: verificationEmail,
      code: verificationCode,
    });
    setShowVerification(false);
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>Verificación de Ubicación</CardTitle>
            <CardDescription>
              Se ha detectado un acceso desde una nueva ubicación. Ingresa el código enviado a tu email.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleVerification}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Código de Verificación</Label>
                <Input
                  id="verification-code"
                  type="text"
                  placeholder="Ingresa el código de 6 dígitos"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button 
                type="submit" 
                className="w-full"
                disabled={verifyIpMutation.isPending}
              >
                {verifyIpMutation.isPending ? "Verificando..." : "Verificar"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setShowVerification(false)}
              >
                Cancelar
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {/* Left side - Authentication forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SecureWatch</h1>
            <p className="text-slate-300">Sistema de Gestión de Ciberseguridad</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Iniciar Sesión</CardTitle>
                  <CardDescription>
                    Ingresa tus credenciales para acceder al sistema
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="tu@empresa.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Contraseña</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Iniciando..." : "Iniciar Sesión"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Crear Cuenta</CardTitle>
                  <CardDescription>
                    Registra una nueva cuenta en el sistema
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Nombre de Usuario</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="usuario"
                        value={registerUsername}
                        onChange={(e) => setRegisterUsername(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="tu@empresa.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={registerMutation.isPending || registerPassword !== confirmPassword}
                    >
                      {registerMutation.isPending ? "Registrando..." : "Crear Cuenta"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-center">
        <div className="text-white space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">Protección Avanzada</h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              Monitoreo en tiempo real, detección de amenazas y gestión 
              centralizada de la seguridad empresarial.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Monitoreo 24/7</h3>
                <p className="text-blue-100">Vigilancia continua de todos los sistemas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Detección Inteligente</h3>
                <p className="text-blue-100">IA avanzada para identificar amenazas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Respuesta Automática</h3>
                <p className="text-blue-100">Contención inmediata de incidentes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}