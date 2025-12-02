import { useState, useEffect } from "react";
import { Car, Sparkles, Settings, Key, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

const defaultStandardInfo = `*Bilfinansiering via LF Finans, Santander och DNB
*OKR Kontantinsats via MyMoney och Svea
*Upp till 36 månader garanti kan köpas till
*Carfax rapporter erbjuds till samtliga fordon
*Helförsäkring ingår alltid på våra fordon
*Fordonshistorik finns att ta del av`;

const defaultSystemPrompt = `Du är en expert på att skriva engagerande och professionella bilannonser. 
Skapa en säljande annons baserat på informationen som ges. 
Använd emojis sparsamt men effektivt.
Håll en professionell men tillgänglig ton.
Strukturera annonsen tydligt med sektioner.`;

const llmModels = [
  { value: "gpt-4o", label: "GPT-4o (Rekommenderad)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (Snabbare)" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Billigast)" },
];

export default function Bilannonsgenerator() {
  const [markeModell, setMarkeModell] = useState("");
  const [arsmodell, setArsmodell] = useState<string>("");
  const [funktioner, setFunktioner] = useState("");
  const [ytterligareInfo, setYtterligareInfo] = useState("");
  const [finansiering, setFinansiering] = useState("");
  const [standardInfo, setStandardInfo] = useState(defaultStandardInfo);
  const [generatedAd, setGeneratedAd] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt);

  // Load settings from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem("bilannonsgenerator_apiKey");
    const savedModel = localStorage.getItem("bilannonsgenerator_model");
    const savedPrompt = localStorage.getItem("bilannonsgenerator_prompt");
    
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setSelectedModel(savedModel);
    if (savedPrompt) setSystemPrompt(savedPrompt);
  }, []);

  const saveSettings = () => {
    localStorage.setItem("bilannonsgenerator_apiKey", apiKey);
    localStorage.setItem("bilannonsgenerator_model", selectedModel);
    localStorage.setItem("bilannonsgenerator_prompt", systemPrompt);
    toast.success("Inställningar sparade");
    setShowSettings(false);
  };

  const handleGenerateAd = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation - replace with actual API call
    setTimeout(() => {
      const ad = `🚗 ${markeModell} ${arsmodell}

${funktioner ? `✨ Utrustning & funktioner:\n${funktioner}\n\n` : ""}${ytterligareInfo ? `📋 Information:\n${ytterligareInfo}\n\n` : ""}${finansiering ? `💰 Finansiering:\n${finansiering}\n\n` : ""}${standardInfo}`;
      
      setGeneratedAd(ad);
      setIsGenerating(false);
    }, 1500);
  };

  const isFormValid = markeModell.trim() !== "" && arsmodell !== "";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50">
        <div className="px-4 md:px-8 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Bilannons Generator</h1>
                <p className="text-sm text-muted-foreground">AI-driven bilannonsering i toppklass</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Redo att skapa
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4" />
                <span className="hidden md:inline">Inställningar</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Left Panel - Form */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Car className="h-5 w-5 text-primary" />
                Bildetaljer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Märke & Modell + Årsmodell */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Märke & Modell <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="t.ex. Toyota Camry, Volvo V90"
                    value={markeModell}
                    onChange={(e) => setMarkeModell(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Årsmodell <span className="text-destructive">*</span>
                  </label>
                  <Select value={arsmodell} onValueChange={setArsmodell}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Välj årsmodell" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Funktioner och utrustning */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Funktioner och utrustning
                </label>
                <Textarea
                  placeholder="Lista viktiga funktioner (t.ex. skinnklädsel, navigationssystem, panoramatak)"
                  value={funktioner}
                  onChange={(e) => setFunktioner(e.target.value)}
                  className="min-h-[100px] bg-background/50 resize-none"
                />
              </div>

              {/* Ytterligare information */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Ytterligare information
                </label>
                <Textarea
                  placeholder="Andra detaljer om bilen som du vill inkludera"
                  value={ytterligareInfo}
                  onChange={(e) => setYtterligareInfo(e.target.value)}
                  className="min-h-[100px] bg-background/50 resize-none"
                />
              </div>

              {/* Finansiering */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Finansiering
                </label>
                <Textarea
                  placeholder="Information om finansieringsalternativ (t.ex. månadsbetalning, ränta, avtalsvillkor)"
                  value={finansiering}
                  onChange={(e) => setFinansiering(e.target.value)}
                  className="min-h-[100px] bg-background/50 resize-none"
                />
              </div>

              {/* Standard info */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Standard info
                </label>
                <Textarea
                  value={standardInfo}
                  onChange={(e) => setStandardInfo(e.target.value)}
                  className="min-h-[150px] bg-background/50 resize-none text-sm"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateAd}
                disabled={!isFormValid || isGenerating}
                className="w-full gap-2"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Genererar annons...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Skapa annons
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Right Panel - Generated Ad */}
          <Card className="border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Genererad annons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedAd ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-background/50 border border-border/50 min-h-[400px]">
                    <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                      {generatedAd}
                    </pre>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2">
                      Kopiera
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2">
                      Redigera
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
                  <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground max-w-xs">
                    Fyll i formuläret och klicka på "Skapa annons" för att skapa en professionell bilannons.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Inställningar
            </SheetTitle>
            <SheetDescription>
              Konfigurera AI-modell och anpassa prompten
            </SheetDescription>
          </SheetHeader>
          
          <div className="space-y-6 py-6">
            {/* System Prompt */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                System Prompt
              </Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Skriv instruktioner för hur AI:n ska generera annonser..."
                className="min-h-[150px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Denna prompt styr hur AI:n genererar annonser
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4 text-muted-foreground" />
                OpenAI API Key
              </Label>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Din API-nyckel sparas lokalt i webbläsaren
              </p>
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <Label>Välj AI-modell</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj modell" />
                </SelectTrigger>
                <SelectContent>
                  {llmModels.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                GPT-4o är mest kapabel, GPT-3.5 är snabbast och billigast
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" className="flex-1" onClick={() => setShowSettings(false)}>
              Avbryt
            </Button>
            <Button className="flex-1" onClick={saveSettings}>
              Spara inställningar
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
