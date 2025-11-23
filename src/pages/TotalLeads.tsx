import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Users, ArrowUpIcon, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const monthlyLeadsData = [
  { month: "Jan", leads: 65, target: 80 },
  { month: "Feb", leads: 85, target: 80 },
  { month: "Mar", leads: 78, target: 85 },
  { month: "Apr", leads: 95, target: 90 },
  { month: "Maj", leads: 124, target: 95 },
  { month: "Jun", leads: 142, target: 100 },
  { month: "Jul", leads: 156, target: 110 },
  { month: "Aug", leads: 143, target: 120 },
  { month: "Sep", leads: 178, target: 130 },
  { month: "Okt", leads: 189, target: 140 },
  { month: "Nov", leads: 203, target: 150 },
  { month: "Dec", leads: 225, target: 160 }
];

const weeklyData = [
  { week: "V1", leads: 45 },
  { week: "V2", leads: 52 },
  { week: "V3", leads: 38 },
  { week: "V4", leads: 67 },
  { week: "V5", leads: 72 },
  { week: "V6", leads: 59 },
  { week: "V7", leads: 84 }
];

const chartConfig = {
  leads: { label: "Leads", color: "hsl(var(--primary))" },
  target: { label: "Mål", color: "hsl(var(--muted-foreground))" }
};

export default function TotalLeads() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Totala Leads" />
      
      <main className="p-2 md:p-6 space-y-2 md:space-y-6">
        <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/reports")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
            <span className="text-xs md:text-sm">Tillbaka till Rapporter</span>
          </Button>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 mb-3 md:mb-8">
          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="p-1 md:p-2 bg-primary/10 rounded-lg">
                  <Users className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                </div>
                <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                  Totala Leads
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="flex items-center gap-2">
                <div className="text-xl md:text-3xl font-bold text-foreground">1,247</div>
                <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-sm">
                  <ArrowUpIcon className="h-3 w-3 md:h-4 md:w-4 text-success" />
                  <span className="text-success">12.5%</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">vs förra månaden</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Denna månad
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="text-xl md:text-3xl font-bold text-foreground">225</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">65 leads över målet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Genomsnitt/månad
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="text-xl md:text-3xl font-bold text-foreground">142</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">senaste 6 månaderna</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader className="px-2 pt-2 md:p-6">
            <CardTitle className="text-sm md:text-lg">Leads per månad (12 månader)</CardTitle>
          </CardHeader>
          <CardContent className="p-1 md:p-6">
            <ChartContainer config={chartConfig} className="h-48 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyLeadsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        <Card>
          <CardHeader className="px-2 pt-2 md:p-6">
            <CardTitle className="text-sm md:text-lg">Veckotrend (senaste 7 veckorna)</CardTitle>
          </CardHeader>
          <CardContent className="p-1 md:p-6">
            <ChartContainer config={chartConfig} className="h-40 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader className="px-2 pt-2 md:p-6">
            <CardTitle className="text-sm md:text-lg">Insikter</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-start gap-2 md:gap-3">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success mt-0.5" />
                <div>
                  <p className="text-xs md:text-base font-medium">Stark uppåtgående trend</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                    Leads har ökat med 85% jämfört med samma period förra året
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs md:text-base font-medium">Bästa månaden hittills</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                    December blev den bästa månaden med 225 leads
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