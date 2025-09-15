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
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totala Leads
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-foreground">1,247</div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                  <span className="text-success">12.5%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">vs förra månaden</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Denna månad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">225</div>
              <p className="text-sm text-muted-foreground mt-1">65 leads över målet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Genomsnitt/månad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">142</div>
              <p className="text-sm text-muted-foreground mt-1">senaste 6 månaderna</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Leads per månad (12 månader)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
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
          <CardHeader>
            <CardTitle>Veckotrend (senaste 7 veckorna)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
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
          <CardHeader>
            <CardTitle>Insikter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Stark uppåtgående trend</p>
                  <p className="text-sm text-muted-foreground">
                    Leads har ökat med 85% jämfört med samma period förra året
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Bästa månaden hittills</p>
                  <p className="text-sm text-muted-foreground">
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