import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Car, Sparkles } from "lucide-react";

const DEFAULT_STANDARD_INFO = `*Bilfinansiering via LF Finans, Santander och DNB
*OKR Kontantinsats via MyMoney och Svea
*Upp till 36 månader garanti kan köpas till
*Carfax rapporter erbjuds till samtliga fordon
*Helförsäkring ingår alltid på våra fordon

*Vi erbjuder eftermontering av dragkrok m.m
*Vi hämtar er gärna på tåg/buss samt flygplats
*Vi tar emot inbyten i samband med försäljning
*Vi erbjuder förmedling av er bil, kontakta en av våra säljare för info

*Registreringsavgift 495kr tillkommer
*Läs gärna våra kunders omdömen på RECO

*All our cars are available for export

*Välkomna till oss på Gothia Bil!`;

export default function BilAnnonsgenerator() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAd, setGeneratedAd] = useState("");

  const [formData, setFormData] = useState({
    markeModell: "",
    arsmodell: "",
    funktioner: "",
    ytterligareInfo: "",
    finansiering: "",
    standardInfo: DEFAULT_STANDARD_INFO,
  });

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1974 }, (_, i) => currentYear + 1 - i);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.markeModell || !formData.arsmodell) {
      toast({
        title: "Obligatoriska fält saknas",
        description: "Vänligen fyll i märke & modell och årsmodell",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Skapa en professionell och engagerande bilannons baserat på följande information:

Märke & Modell: ${formData.markeModell}
Årsmodell: ${formData.arsmodell}
${formData.funktioner ? `Funktioner och utrustning: ${formData.funktioner}` : ""}
${formData.ytterligareInfo ? `Ytterligare information: ${formData.ytterligareInfo}` : ""}
${formData.finansiering ? `Finansiering: ${formData.finansiering}` : ""}

Standard info:
${formData.standardInfo}

Skapa en lockande och professionell annonstext som betonar bilens styrkor och inkluderar all relevant information. Texten ska vara välskriven på svenska och lämplig för en bilförsäljningsplattform.`;

      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: [{ role: "user", content: prompt }] },
      });

      if (error) throw error;

      setGeneratedAd(data.generatedText);
      toast({
        title: "Annons skapad!",
        description: "Din bilannons har genererats framgångsrikt",
      });
    } catch (error) {
      console.error("Error generating ad:", error);
      toast({
        title: "Fel",
        description: "Kunde inte generera annons. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Car className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Bilannons Generator</h1>
            <p className="text-muted-foreground">AI-driven bilannonssering i toppklass</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Bildetaljer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="markeModell">
                    Märke & Modell <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="markeModell"
                    placeholder="t.ex. Toyota Camry, Volvo"
                    value={formData.markeModell}
                    onChange={(e) => setFormData({ ...formData, markeModell: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="arsmodell">
                    Årsmodell <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.arsmodell}
                    onValueChange={(value) => setFormData({ ...formData, arsmodell: value })}
                    required
                  >
                    <SelectTrigger id="arsmodell">
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

                <div className="space-y-2">
                  <Label htmlFor="funktioner">Funktioner och utrustning</Label>
                  <Textarea
                    id="funktioner"
                    placeholder="Lista viktiga funktioner (t.ex. skinnklädsel, navigationssystem, panoramatak)"
                    value={formData.funktioner}
                    onChange={(e) => setFormData({ ...formData, funktioner: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ytterligareInfo">Ytterligare information</Label>
                  <Textarea
                    id="ytterligareInfo"
                    placeholder="Andra detaljer om bilen som du vill inkludera"
                    value={formData.ytterligareInfo}
                    onChange={(e) => setFormData({ ...formData, ytterligareInfo: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="finansiering">Finansiering</Label>
                  <Textarea
                    id="finansiering"
                    placeholder="Information om finansieringsalternativ (t.ex. månadsbetalning, ränta, avtalsvillkor)"
                    value={formData.finansiering}
                    onChange={(e) => setFormData({ ...formData, finansiering: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="standardInfo">Standard info</Label>
                  <Textarea
                    id="standardInfo"
                    value={formData.standardInfo}
                    onChange={(e) => setFormData({ ...formData, standardInfo: e.target.value })}
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>Genererar...</>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Skapa annons
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Genererad annons
              </CardTitle>
            </CardHeader>
            <CardContent>
              {generatedAd ? (
                <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                  {generatedAd}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-12">
                  Fyll i formuläret och klicka på "Skapa annons" för att skapa en professionell bilannons.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
