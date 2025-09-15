import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Clock, ArrowUpIcon, Timer, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

const responseTimeData = [
  { week: "V1", avgTime: 68, target: 60 },
  { week: "V2", avgTime: 62, target: 60 },
  { week: "V3", avgTime: 58, target: 60 },
  { week: "V4", avgTime: 52, target: 60 },
  { week: "V5", avgTime: 48, target: 60 },
  { week: "V6", avgTime: 45, target: 60 },
  { week: "V7", avgTime: 43, target: 60 },
  { week: "V8", avgTime: 45, target: 60 }
];

const hourlyDistribution = [
  { hour: "09", responses: 12, avgTime: 32 },
  { hour: "10", responses: 18, avgTime: 28 },
  { hour: "11", responses: 24, avgTime: 42 },
  { hour: "12", responses: 15, avgTime: 65 },
  { hour: "13", responses: 8, avgTime: 72 },
  { hour: "14", responses: 22, avgTime: 38 },
  { hour: "15", responses: 28, avgTime: 35 },
  { hour: "16", responses: 25, avgTime: 41 },
  { hour: "17", responses: 14, avgTime: 58 }
];

const teamPerformance = [
  { member: "Anna", avgTime: 32, responses: 45, score: 95 },
  { member: "Erik", avgTime: 38, responses: 52, score: 92 },
  { member: "Sara", avgTime: 42, responses: 38, score: 88 },
  { member: "Johan", avgTime: 55, responses: 34, score: 78 }
];

const chartConfig = {
  avgTime: { label: "Genomsnittlig tid", color: "hsl(var(--primary))" },
  target: { label: "Mål", color: "hsl(var(--muted-foreground))" }
};

export default function ResponseTime() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Svarstid" />
      
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Genomsnittlig Svarstid
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-foreground">45</div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                  <span className="text-success">18.3%</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">minuter (förbättring)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Snabbaste Svar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">3</div>
              <p className="text-sm text-muted-foreground mt-1">minuter</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Under Målsättning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">78%</div>
              <p className="text-sm text-muted-foreground mt-1">av svar under 60 min</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Totala Svar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">234</div>
              <p className="text-sm text-muted-foreground mt-1">denna månad</p>
            </CardContent>
          </Card>
        </div>

        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Svarstid över tid (8 veckor)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={responseTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey="avgTime" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                    strokeWidth={3}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Prestanda per timme</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="avgTime" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Teamprestanda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamPerformance.map((member) => (
                  <div key={member.member} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{member.member}</p>
                        <p className="text-sm text-muted-foreground">
                          {member.responses} svar • {member.avgTime} min snitt
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{member.score}%</p>
                        <p className="text-xs text-muted-foreground">poäng</p>
                      </div>
                    </div>
                    <Progress value={member.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insikter & Förbättringar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <p className="font-medium">Stor förbättring</p>
                  <p className="text-sm text-muted-foreground">
                    Svarstiden har förbättrats med 18% de senaste 8 veckorna
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Timer className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Lunchpausen påverkar</p>
                  <p className="text-sm text-muted-foreground">
                    Svarstiden ökar markant mellan 12-13, överväg roterande luncher
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium">Stöd för Johan</p>
                  <p className="text-sm text-muted-foreground">
                    Johan har längst svarstid (55 min) - erbjud träning eller mentoring
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