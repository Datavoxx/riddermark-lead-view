import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff } from "lucide-react";
import Logo from "@/assets/Logo";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const {
    signIn,
    signUp,
    user
  } = useAuth();
  const location = useLocation();
  const {
    toast
  } = useToast();
  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast({
        title: "Inloggning misslyckades",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await signUp(email, password, firstName, lastName, phoneNumber);
    if (error) {
      toast({
        title: "Registrering misslyckades",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Bekräfta din e-post",
        description: "Vi har skickat en bekräftelselänk till din e-post. Vänligen kontrollera din inkorg och bekräfta din e-postadress innan du loggar in.",
        duration: 8000
      });
      setIsLoading(false);
    }
  };
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/`
    });
    if (error) {
      toast({
        title: "Fel",
        description: error.message,
        variant: "destructive"
      });
      setIsLoading(false);
    } else {
      toast({
        title: "E-post skickad",
        description: "Om kontot finns kommer du få en återställningslänk till din e-post.",
        duration: 8000
      });
      setIsLoading(false);
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };
  if (showForgotPassword) {
    return <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md animate-fade-in shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo h={96} />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold">Återställ lösenord</h2>
              <p className="text-sm text-muted-foreground">
                Ange din e-postadress så skickar vi en återställningslänk
              </p>
            </div>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">E-post</Label>
                <Input id="reset-email" type="email" placeholder="din@email.se" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10" />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                    Skickar...
                  </div> : "Skicka återställningslänk"}
              </Button>
              <button type="button" onClick={() => setShowForgotPassword(false)} className="text-sm text-primary hover:underline w-full text-center">
                Tillbaka till inloggning
              </button>
            </form>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo h={96} />
          </div>
        </CardHeader>
        
        <CardContent className="animate-fade-in" style={{
        animationDelay: "0.2s"
      }}>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Logga in</TabsTrigger>
              <TabsTrigger value="register">Registrera dig</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2 animate-slide-up" style={{
                animationDelay: "0.3s"
              }}>
                  <Label htmlFor="login-email">E-post</Label>
                  <Input id="login-email" type="email" placeholder="din@email.se" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10" />
                </div>
                
                <div className="space-y-2 animate-slide-up" style={{
                animationDelay: "0.4s"
              }}>
                  <Label htmlFor="login-password">Lösenord</Label>
                  <div className="relative">
                    <Input id="login-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full animate-slide-up" style={{
                animationDelay: "0.5s"
              }} disabled={isLoading}>
                  {isLoading ? <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      Loggar in...
                    </div> : "Fortsätt"}
                </Button>
                <button type="button" onClick={() => setShowForgotPassword(true)} style={{
                animationDelay: "0.6s"
              }} className="text-sm hover:underline w-full text-center animate-slide-up text-neutral-950">
                  Har du glömt ditt lösenord?
                </button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Förnamn</Label>
                    <Input id="firstName" type="text" placeholder="Johan" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Efternamn</Label>
                    <Input id="lastName" type="text" placeholder="Andersson" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">E-post</Label>
                  <Input id="register-email" type="email" placeholder="din@email.se" value={email} onChange={e => setEmail(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Telefonnummer</Label>
                  <Input id="phoneNumber" type="tel" placeholder="070-123 45 67" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">Lösenord</Label>
                  <div className="relative">
                    <Input id="register-password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required disabled={isLoading} className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10 pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      Registrerar...
                    </div> : "Skapa konto"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>;
}