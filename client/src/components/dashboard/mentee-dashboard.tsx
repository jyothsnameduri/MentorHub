import { useAuth } from "@/hooks/use-auth";
import StatsOverview from "@/components/dashboard/stats-card";
import UpcomingSessions from "@/components/dashboard/upcoming-sessions";
import ActivityFeed from "@/components/dashboard/activity-feed";
import RecommendedMentors from "@/components/dashboard/recommended-mentors";
import SkillsProgress from "@/components/dashboard/skills-progress";
import SessionsChart from "@/components/dashboard/sessions-chart";
import { cn, getStaggeredDelay } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">


      <div className="container mx-auto px-4 py-8">
        <StatsOverview />
      
      <div 
        className="grid grid-cols-1 gap-6 mb-6"
        style={{ transitionDelay: getStaggeredDelay(1) }}
      >
        <div 
          className={cn(
            "transition-all duration-300 transform-gpu",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <SessionsChart />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(2) }}
          >
            <UpcomingSessions />
          </div>
          
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(3) }}
          >
            <ActivityFeed />
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(4) }}
          >
            <RecommendedMentors />
          </div>
          
          <div 
            className={cn(
              "transition-all duration-300 transform-gpu",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
            style={{ transitionDelay: getStaggeredDelay(5) }}
          >
            <SkillsProgress />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}