import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { startOfWeek, addWeeks, format, parseISO, isWithinInterval } from "date-fns";

export default function SessionsChart() {
  const { user } = useAuth();
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });
  
  // Generate data for the last 6 weeks
  const generateWeeklyData = () => {
    if (!sessions || sessions.length === 0) {
      return getEmptyData();
    }
    
    const currentDate = new Date();
    const weeksToShow = 6;
    
    // Calculate the start of the oldest week we want to show
    const oldestWeekStart = startOfWeek(addWeeks(currentDate, -(weeksToShow - 1)));
    
    // Initialize weeks data
    const weeksData = Array.from({ length: weeksToShow }, (_, i) => {
      const weekStart = startOfWeek(addWeeks(oldestWeekStart, i));
      const weekEnd = addWeeks(weekStart, 1);
      
      return {
        name: format(weekStart, "MMM d"),
        sessions: 0,
        interval: { start: weekStart, end: weekEnd }
      };
    });
    
    // Count sessions for each week
    sessions.forEach(session => {
      const sessionDate = parseISO(`${session.date}T${session.time}`);
      
      // Find which week this session belongs to
      const weekIndex = weeksData.findIndex(weekData => 
        isWithinInterval(sessionDate, { 
          start: weekData.interval.start, 
          end: weekData.interval.end 
        })
      );
      
      if (weekIndex >= 0) {
        weeksData[weekIndex].sessions += 1;
      }
    });
    
    // Remove the interval property before returning (not needed for the chart)
    return weeksData.map(({ name, sessions }) => ({ name, sessions }));
  };
  
  const getEmptyData = () => {
    const currentDate = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const weekStart = startOfWeek(addWeeks(currentDate, -(5 - i)));
      return {
        name: format(weekStart, "MMM d"),
        sessions: 0
      };
    });
  };

  const data = generateWeeklyData();
  
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Sessions Per Week</CardTitle>
        <CardDescription>
          View your mentorship session activity over the past 6 weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [`${value} sessions`, 'Sessions']}
                  labelFormatter={(label) => `Week of ${label}`}
                />
                <Bar 
                  dataKey="sessions" 
                  fill="#8884d8" 
                  radius={[4, 4, 0, 0]}
                  name="Sessions"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}