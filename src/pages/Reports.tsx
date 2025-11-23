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
  ArrowDownIcon
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className="min-h-screen bg-background">
      <TopBar title="Rapporter" />
      
      <main className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">KPI Dashboard</h1>
          <p className="text-muted-foreground">Översikt över dina viktigaste nyckeltal</p>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
          {/* Total Leads */}
          <Card 
            className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate("/reports/total-leads")}
          >
            <CardHeader className="pb-2 px-3 pt-3 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Totala Leads
                  </CardTitle>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm">
                  {kpiData.totalLeads.trend === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 md:h-4 md:w-4 text-success" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  )}
                  <span className={kpiData.totalLeads.trend === "up" ? "text-success" : "text-destructive"}>
                    {Math.abs(kpiData.totalLeads.change)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 md:p-6 md:pt-0">
              <div className="flex items-end justify-between">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {kpiData.totalLeads.value.toLocaleString()}
                </div>
                <div className="w-16 h-8 md:w-24 md:h-12">
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
            <CardHeader className="pb-2 px-3 pt-3 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <Target className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Konverteringsgrad
                  </CardTitle>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm">
                  {kpiData.conversionRate.trend === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 md:h-4 md:w-4 text-success" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  )}
                  <span className={kpiData.conversionRate.trend === "up" ? "text-success" : "text-destructive"}>
                    {Math.abs(kpiData.conversionRate.change)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 md:p-6 md:pt-0">
              <div className="space-y-3 md:space-y-4">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {kpiData.conversionRate.value}%
                </div>
                <div className="space-y-2">
                  <Progress value={kpiData.conversionRate.value} className="h-2 md:h-3" />
                  <div className="w-12 h-6 md:w-16 md:h-8">
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
            <CardHeader className="pb-2 px-3 pt-3 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Avg. Svarstid
                  </CardTitle>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm">
                  {kpiData.avgResponseTime.trend === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 md:h-4 md:w-4 text-success" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  )}
                  <span className="text-success">
                    {Math.abs(kpiData.avgResponseTime.change)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 md:p-6 md:pt-0">
              <div className="flex items-end justify-between">
                <div className="space-y-0.5 md:space-y-1">
                  <div className="text-2xl md:text-3xl font-bold text-foreground">
                    {kpiData.avgResponseTime.value}
                  </div>
                  <div className="text-xs md:text-sm text-muted-foreground">minuter</div>
                </div>
                <div className="w-16 h-8 md:w-24 md:h-12">
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
            <CardHeader className="pb-2 px-3 pt-3 md:p-6 md:pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Aktiva Leads
                  </CardTitle>
                </div>
                <div className="flex items-center gap-0.5 md:gap-1 text-xs md:text-sm">
                  {kpiData.activeLeads.trend === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 md:h-4 md:w-4 text-success" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  )}
                  <span className="text-success">
                    {Math.abs(kpiData.activeLeads.change)}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 pb-3 md:p-6 md:pt-0">
              <div className="flex items-end justify-between">
                <div className="text-2xl md:text-3xl font-bold text-foreground">
                  {kpiData.activeLeads.value}
                </div>
                <div className="w-16 h-8 md:w-20 md:h-12">
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
          <CardHeader className="px-3 pt-3 md:p-6">
            <CardTitle className="text-base md:text-lg">Leads per månad</CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            {/* Mobil: horisontell scrolling */}
            <div className="md:hidden">
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="min-w-[500px] p-4">
                  <ChartContainer config={chartConfig} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar 
                          dataKey="leads" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </ScrollArea>
            </div>
            
            {/* Desktop: normal display */}
            <div className="hidden md:block">
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
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}