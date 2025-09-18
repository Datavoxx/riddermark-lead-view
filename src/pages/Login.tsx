import { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Logo from "@/assets/Logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user } = useAuth();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);
    
    if (!error) {
      // Navigation will happen automatically via AuthContext
      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo h={48} />
          </div>
          <CardTitle className="text-2xl font-bold animate-slide-up">Riddermark</CardTitle>
          <CardDescription className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Logga in för att fortsätta
          </CardDescription>
        </CardHeader>
        
        <CardContent className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@email.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
              />
            </div>
            
            <div className="space-y-2 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="transition-all duration-200 focus:shadow-lg focus:shadow-primary/10"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full animate-slide-up" 
              style={{ animationDelay: "0.5s" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                  Loggar in...
                </div>
              ) : (
                "Fortsätt"
              )}
            </Button>
            
            <div className="text-center">
              <button 
                type="button" 
                className="text-sm text-muted-foreground hover:text-foreground disabled:cursor-not-allowed"
                disabled
              >
                Glömt lösenord?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}