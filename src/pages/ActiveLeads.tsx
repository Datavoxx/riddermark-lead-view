import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, ArrowUpIcon, Users, Calendar, Phone } from "lucide-react";
import { PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const statusDistribution = [
  { status: "Nya", count: 23, percentage: 25.8, color: "hsl(var(--primary))" },
  { status: "Kontaktade", count: 34, percentage: 38.2, color: "hsl(320, 35%, 55%)" },
  { status: "Kvalificerade", count: 18, percentage: 20.2, color: "hsl(320, 35%, 65%)" },
  { status: "Förhandling", count: 14, percentage: 15.7, color: "hsl(320, 35%, 75%)" }
];

const priorityData = [
  { priority: "Hög", count: 15, color: "hsl(var(--destructive))" },
  { priority: "Medium", count: 52, color: "hsl(var(--primary))" },
  { priority: "Låg", count: 22, color: "hsl(var(--muted-foreground))" }
];

const sourceBreakdown = [
  { source: "Website", count: 28, percentage: 31.5 },
  { source: "Email", count: 22, percentage: 24.7 },
  { source: "Telefon", count: 18, percentage: 20.2 },
  { source: "Social Media", count: 12, percentage: 13.5 },
  { source: "Referrals", count: 9, percentage: 10.1 }
];

const recentActivity = [
  { id: 1, company: "Tech Solutions AB", status: "Ny", time: "2 min sedan", priority: "Hög" },
  { id: 2, company: "Marketing Pro", status: "Kontaktad", time: "15 min sedan", priority: "Medium" },
  { id: 3, company: "Digital Focus", status: "Kvalificerad", time: "1 tim sedan", priority: "Hög" },
  { id: 4, company: "Creative Agency", status: "Förhandling", time: "2 tim sedan", priority: "Medium" },
  { id: 5, company: "Business Connect", status: "Kontaktad", time: "3 tim sedan", priority: "Låg" }
];

const chartConfig = {
  count: { label: "Antal", color: "hsl(var(--primary))" }
};

export default function ActiveLeads() {
  const navigate = useNavigate();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Hög": return "destructive";
      case "Medium": return "default";
      case "Låg": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Aktiva Leads" />
      
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-6 mb-3 md:mb-8">
          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <div className="flex items-center gap-1 md:gap-2">
                <div className="p-1 md:p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-3 w-3 md:h-5 md:w-5 text-primary" />
                </div>
                <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                  Totalt Aktiva
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="flex items-center gap-2">
                <div className="text-xl md:text-3xl font-bold text-foreground">89</div>
                <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-sm">
                  <ArrowUpIcon className="h-3 w-3 md:h-4 md:w-4 text-success" />
                  <span className="text-success">8.7%</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">vs förra veckan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Nya idag
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="text-xl md:text-3xl font-bold text-foreground">7</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">3 mer än igår</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Hög Prioritet
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="text-xl md:text-3xl font-bold text-destructive">15</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">kräver omedelbar åtgärd</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-1 px-2 pt-2 md:p-6 md:pb-2">
              <CardTitle className="text-[10px] md:text-sm font-medium text-muted-foreground">
                Genomsnittlig Ålder
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2 pb-2 md:p-6 md:pt-0">
              <div className="text-xl md:text-3xl font-bold text-foreground">3.2</div>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">dagar</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-6">
          {/* Status Distribution */}
          <Card>
            <CardHeader className="px-2 pt-2 md:p-6">
              <CardTitle className="text-sm md:text-lg">Fördelning per Status</CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-32 md:h-48">
                  <ChartContainer config={chartConfig} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          dataKey="count"
                          cx="50%"
                          cy="50%"
                          outerRadius={40}
                          innerRadius={15}
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {statusDistribution.map((item) => (
                    <div key={item.status} className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <div 
                          className="w-2 h-2 md:w-3 md:h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs md:text-base font-medium">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm md:text-base font-bold">{item.count}</p>
                        <p className="text-[9px] md:text-xs text-muted-foreground">{item.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Source Breakdown */}
          <Card>
            <CardHeader className="px-2 pt-2 md:p-6">
              <CardTitle className="text-sm md:text-lg">Leads per Källa</CardTitle>
            </CardHeader>
            <CardContent className="p-1 md:p-6">
              <ChartContainer config={chartConfig} className="h-40 md:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="source" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="px-2 pt-2 md:p-6">
            <CardTitle className="text-sm md:text-lg">Senaste Aktivitet</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="space-y-2 md:space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-2 md:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1 md:p-2 bg-primary/10 rounded-lg">
                      <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs md:text-base font-medium">{activity.company}</p>
                      <p className="text-[10px] md:text-sm text-muted-foreground">Status: {activity.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={getPriorityColor(activity.priority)}>
                      {activity.priority}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Actions */}
        <Card>
          <CardHeader className="px-2 pt-2 md:p-6">
            <CardTitle className="text-sm md:text-lg">Åtgärder Behövs</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            <div className="space-y-2 md:space-y-4">
              <div className="flex items-start gap-2 md:gap-3">
                <Phone className="h-4 w-4 md:h-5 md:w-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-xs md:text-base font-medium">15 leads med hög prioritet</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                    Kontakta inom 2 timmar för att behålla momentum
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs md:text-base font-medium">8 leads utan aktivitet i 3+ dagar</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                    Schemalägg uppföljning för att undvika att förlora intresse
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 md:gap-3">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success mt-0.5" />
                <div>
                  <p className="text-xs md:text-base font-medium">Website genererar flest aktiva leads</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">
                    28 aktiva leads från website - 31.5% av totalt
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