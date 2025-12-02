import { TopBar } from "@/components/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Users, 
  TrendingUp, 
  Target, 
  Clock,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRight
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Sample data - easily replaceable
const kpiData = {
  totalLeads: { value: 1247, change: 12.5, trend: "up" },
  conversionRate: { value: 24.8, change: -2.1, trend: "down" },
  avgResponseTime: { value: 45, change: -18.3, trend: "up" },
  activeLeads: { value: 89, change: 8.7, trend: "up" }
};

// Chart data - easily replaceable
const monthlyData = [
  { month: "Jan", leads: 65 },
  { month: "Feb", leads: 85 },
  { month: "Mar", leads: 78 },
  { month: "Apr", leads: 95 },
  { month: "May", leads: 124 },
  { month: "Jun", leads: 142 }
];

const statusData = [
  { name: "Aktiva", value: 89, color: "hsl(var(--primary))" },
  { name: "Avslutade", value: 156, color: "hsl(var(--muted))" },
  { name: "Väntande", value: 34, color: "hsl(var(--secondary))" }
];

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(var(--primary))",
  },
};

export default function Reports() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Mobile KPI Dashboard
  const MobileKPIDashboard = () => (
    <div className="space-y-4">
      {/* Hero Card - Total Leads */}
      <Card 
        className="relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all rounded-2xl border-border/50 bg-gradient-to-br from-primary/10 via-card to-card shadow-lg"
        onClick={() => navigate("/reports/total-leads")}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Totala Leads</p>
                <p className="text-xs text-muted-foreground/70">denna månad</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10">
              <ArrowUpIcon className="h-3.5 w-3.5 text-success" />
              <span className="text-sm font-semibold text-success">
                {Math.abs(kpiData.totalLeads.change)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div className="text-4xl font-bold text-foreground tracking-tight">
              {kpiData.totalLeads.value.toLocaleString()}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
          
          {/* Sparkline */}
          <div className="mt-4 h-12">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary KPIs - 2x2 Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Conversion Rate */}
        <Card 
          className="relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all rounded-2xl border-border/50 shadow-sm"
          onClick={() => navigate("/reports/conversion-rate")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Target className="h-4 w-4 text-destructive" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Konvertering</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-foreground">
                {kpiData.conversionRate.value}%
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownIcon className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-destructive">
                  {Math.abs(kpiData.conversionRate.change)}%
                </span>
              </div>
            </div>
            
            <Progress value={kpiData.conversionRate.value} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        {/* Response Time */}
        <Card 
          className="relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all rounded-2xl border-border/50 shadow-sm"
          onClick={() => navigate("/reports/response-time")}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Svarstid</span>
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <span className="text-2xl font-bold text-foreground">{kpiData.avgResponseTime.value}</span>
                <span className="text-sm text-muted-foreground ml-1">min</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowUpIcon className="h-3.5 w-3.5 text-success" />
                <span className="text-xs font-semibold text-success">
                  {Math.abs(kpiData.avgResponseTime.change)}%
                </span>
              </div>
            </div>
            
            {/* Mini line chart */}
            <div className="h-8 mt-2">
              <ChartContainer config={chartConfig} className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData.slice(-4).map((d, i) => ({
                    ...d,
                    responseTime: 65 - (i * 5)
                  }))}>
                    <Line 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="hsl(var(--amber-500, 38 92% 50%))" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Leads - Full Width */}
      <Card 
        className="relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all rounded-2xl border-border/50 shadow-sm"
        onClick={() => navigate("/reports/active-leads")}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Aktiva Leads</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10">
              <ArrowUpIcon className="h-3 w-3 text-success" />
              <span className="text-xs font-semibold text-success">
                {Math.abs(kpiData.activeLeads.change)}%
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{kpiData.activeLeads.value}</span>
              <span className="text-sm text-muted-foreground">av 279</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
          </div>
          
          <Progress value={(kpiData.activeLeads.value / 279) * 100} className="h-2 mt-3" />
          
          {/* Status breakdown */}
          <div className="flex items-center gap-4 mt-3 text-xs">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Chart */}
      <Card className="rounded-2xl border-border/50 shadow-sm">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle className="text-base font-semibold">Leads per månad</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="h-44">
            <ChartContainer config={chartConfig} className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData.slice(-4)} barCategoryGap="20%">
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="leads" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Desktop Layout (original)
  const DesktopKPIDashboard = () => (
    <>
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Leads */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/reports/total-leads")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Totala Leads
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {kpiData.totalLeads.trend === "up" ? (
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className={kpiData.totalLeads.trend === "up" ? "text-success" : "text-destructive"}>
                  {Math.abs(kpiData.totalLeads.change)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-foreground">
                {kpiData.totalLeads.value.toLocaleString()}
              </div>
              <div className="w-24 h-12">
                <ChartContainer config={chartConfig} className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData.slice(-4)}>
                      <Bar dataKey="leads" fill="hsl(var(--primary))" radius={2} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/reports/conversion-rate")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Konverteringsgrad
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {kpiData.conversionRate.trend === "up" ? (
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className={kpiData.conversionRate.trend === "up" ? "text-success" : "text-destructive"}>
                  {Math.abs(kpiData.conversionRate.change)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-foreground">
                {kpiData.conversionRate.value}%
              </div>
              <div className="space-y-2">
                <Progress value={kpiData.conversionRate.value} className="h-3" />
                <div className="w-16 h-8">
                  <ChartContainer config={chartConfig} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { value: kpiData.conversionRate.value },
                            { value: 100 - kpiData.conversionRate.value }
                          ]}
                          dataKey="value"
                          cx="50%"
                          cy="50%"
                          innerRadius={8}
                          outerRadius={16}
                          startAngle={90}
                          endAngle={450}
                        >
                          <Cell fill="hsl(var(--primary))" />
                          <Cell fill="hsl(var(--muted))" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Response Time */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/reports/response-time")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg. Svarstid
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {kpiData.avgResponseTime.trend === "up" ? (
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className="text-success">
                  {Math.abs(kpiData.avgResponseTime.change)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <div className="text-3xl font-bold text-foreground">
                  {kpiData.avgResponseTime.value}
                </div>
                <div className="text-sm text-muted-foreground">minuter</div>
              </div>
              <div className="w-24 h-12">
                <ChartContainer config={chartConfig} className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData.slice(-6).map((d, i) => ({
                      ...d,
                      responseTime: 65 - (i * 3) + Math.random() * 10
                    }))}>
                      <Line 
                        type="monotone" 
                        dataKey="responseTime" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Leads */}
        <Card 
          className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/reports/active-leads")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Aktiva Leads
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-sm">
                {kpiData.activeLeads.trend === "up" ? (
                  <ArrowUpIcon className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-destructive" />
                )}
                <span className="text-success">
                  {Math.abs(kpiData.activeLeads.change)}%
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-foreground">
                {kpiData.activeLeads.value}
              </div>
              <div className="w-20 h-12">
                <ChartContainer config={chartConfig} className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={20}
                        innerRadius={10}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Leads per månad</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="leads" 
                  fill="hsl(var(--primary))" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Rapporter" />
      
      <main className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="mb-2 md:mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">KPI Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Översikt över dina viktigaste nyckeltal</p>
        </div>

        {isMobile ? <MobileKPIDashboard /> : <DesktopKPIDashboard />}
      </main>
    </div>
  );
}
