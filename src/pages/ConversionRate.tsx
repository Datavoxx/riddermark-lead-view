import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Target, ArrowDownIcon, TrendingDown, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const conversionData = [
  { month: "Jan", rate: 22.4, leads: 65, converted: 15 },
  { month: "Feb", rate: 25.9, leads: 85, converted: 22 },
  { month: "Mar", rate: 21.8, leads: 78, converted: 17 },
  { month: "Apr", rate: 28.4, leads: 95, converted: 27 },
  { month: "Maj", rate: 26.6, leads: 124, converted: 33 },
  { month: "Jun", rate: 24.8, leads: 142, converted: 35 }
];

const funnelData = [
  { stage: "Leads", count: 142, percentage: 100, color: "hsl(var(--primary))" },
  { stage: "Kontaktade", count: 89, percentage: 62.7, color: "hsl(320, 35%, 55%)" },
  { stage: "Kvalificerade", count: 56, percentage: 39.4, color: "hsl(320, 35%, 65%)" },
  { stage: "Konverterade", count: 35, percentage: 24.6, color: "hsl(320, 35%, 75%)" }
];

const sourceConversion = [
  { source: "Website", leads: 45, converted: 14, rate: 31.1 },
  { source: "Email", leads: 38, converted: 8, rate: 21.1 },
  { source: "Social Media", leads: 32, converted: 7, rate: 21.9 },
  { source: "Referrals", leads: 27, converted: 6, rate: 22.2 }
];

const chartConfig = {
  rate: { label: "Konverteringsgrad", color: "hsl(var(--primary))" },
  leads: { label: "Leads", color: "hsl(var(--muted-foreground))" }
};

export default function ConversionRate() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Konverteringsgrad" />
      
      <main className="p-6 space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/reports")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Tillbaka till Rapporter
          </Button>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nuvarande Konverteringsgrad
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-foreground">24.8%</div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowDownIcon className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">2.1%</span>
                </div>
              </div>
              <Progress value={24.8} className="mt-2 h-2" />
              <p className="text-sm text-muted-foreground mt-1">vs förra månaden</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Branschgenomsnitt
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">22.5%</div>
              <p className="text-sm text-success mt-1">+2.3% över genomsnitt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Bästa månaden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">28.4%</div>
              <p className="text-sm text-muted-foreground mt-1">April 2024</p>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Konverteringsgrad över tid</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={conversionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Konverteringstratt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, index) => (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{stage.stage}</span>
                      <span>{stage.count} ({stage.percentage.toFixed(1)}%)</span>
                    </div>
                    <Progress value={stage.percentage} className="h-3" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Source Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Konvertering per källa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sourceConversion.map((source) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">{source.source}</p>
                      <p className="text-sm text-muted-foreground">
                        {source.converted}/{source.leads} leads
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{source.rate}%</p>
                      <Progress value={source.rate} className="w-20 h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insikter & Rekommendationer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">Nedgång från april</p>
                  <p className="text-sm text-muted-foreground">
                    Konverteringsgraden har sjunkit 3.6 procentenheter från toppnoteringen i april
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Website presterar bäst</p>
                  <p className="text-sm text-muted-foreground">
                    Website-leads konverterar 31.1%, betydligt högre än andra kanaler
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Förbättra kvalificeringen</p>
                  <p className="text-sm text-muted-foreground">
                    37% av leads når kvalificeringsstadiet - fokusera på bättre lead-scoring
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}