import { useState, useEffect } from 'react';

interface DashboardMetrics {
  newLeadsToday: number;
  claimedLeads: number;
  averageResponseTime: string;
  newLeadsChange: string;
  claimedPercentage: number;
  responseTimeChange: string;
  conversionRate: number;
  totalLeadsThisWeek: number;
  activeUsers: number;
}

export const useDashboardSimulation = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    newLeadsToday: 0,
    claimedLeads: 0,
    averageResponseTime: "0h",
    newLeadsChange: "+0%",
    claimedPercentage: 0,
    responseTimeChange: "0 min",
    conversionRate: 0,
    totalLeadsThisWeek: 0,
    activeUsers: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Generate realistic base values that vary throughout the day
  const generateRealisticMetrics = (): DashboardMetrics => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    
    // Business hours influence (9-17 = higher activity)
    const businessHourMultiplier = hour >= 9 && hour <= 17 ? 1.5 : 0.7;
    // Weekend influence (less activity on weekends)
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.6 : 1;
    
    const baseActivity = businessHourMultiplier * weekendMultiplier;
    
    // Add some randomness for realism
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    
    const baseNewLeads = Math.floor(8 * baseActivity * randomFactor);
    const baseClaimed = Math.floor(baseNewLeads * (0.65 + Math.random() * 0.2)); // 65-85% claimed
    
    // Response time varies based on load
    const responseTimeHours = Math.max(0.5, 3.2 - (baseActivity * 1.5) + (Math.random() * 0.8 - 0.4));
    const responseTimeMinutes = Math.floor((responseTimeHours % 1) * 60);
    const responseTimeString = responseTimeHours >= 1 
      ? `${Math.floor(responseTimeHours)}.${Math.floor(responseTimeMinutes/6)}h`
      : `${Math.floor(responseTimeHours * 60)}min`;
    
    // Calculate changes (simulate comparing to "yesterday")
    const yesterdayLeads = Math.floor(baseNewLeads * (0.85 + Math.random() * 0.3));
    const change = ((baseNewLeads - yesterdayLeads) / yesterdayLeads * 100);
    const changeString = change > 0 ? `+${Math.abs(change).toFixed(0)}%` : `-${Math.abs(change).toFixed(0)}%`;
    
    // Response time change
    const yesterdayResponseTime = responseTimeHours + (Math.random() * 0.5 - 0.25);
    const timeChange = (yesterdayResponseTime - responseTimeHours) * 60; // in minutes
    const timeChangeString = timeChange > 0 
      ? `+${Math.abs(timeChange).toFixed(0)} min från igår`
      : `-${Math.abs(timeChange).toFixed(0)} min från igår`;
    
    return {
      newLeadsToday: Math.max(1, baseNewLeads),
      claimedLeads: Math.max(0, baseClaimed),
      averageResponseTime: responseTimeString,
      newLeadsChange: changeString,
      claimedPercentage: Math.round((baseClaimed / Math.max(1, baseNewLeads)) * 100),
      responseTimeChange: timeChangeString,
      conversionRate: Math.round(42 + Math.random() * 16), // 42-58%
      totalLeadsThisWeek: Math.floor(35 + Math.random() * 25), // 35-60
      activeUsers: Math.floor(3 + Math.random() * 5), // 3-8 users
    };
  };

  useEffect(() => {
    // Initial load with delay to simulate fetching
    const loadInitialData = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      setMetrics(generateRealisticMetrics());
      setIsLoading(false);
    };

    loadInitialData();

    // Update metrics every 30 seconds for dynamic feel
    const interval = setInterval(() => {
      setMetrics(generateRealisticMetrics());
    }, 30000);

    // Also update when the hour changes (more realistic business pattern)
    const hourlyUpdate = setInterval(() => {
      setMetrics(generateRealisticMetrics());
    }, 60000 * 15); // Every 15 minutes

    return () => {
      clearInterval(interval);
      clearInterval(hourlyUpdate);
    };
  }, []);

  return { metrics, isLoading };
};