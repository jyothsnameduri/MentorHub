import { useAuth } from "@/hooks/use-auth";
import StatsOverview from "@/components/dashboard/stats-card";
import UpcomingSessions from "@/components/dashboard/upcoming-sessions";
import ActivityFeed from "@/components/dashboard/activity-feed";
import RecommendedMentors from "@/components/dashboard/recommended-mentors";
import SkillsProgress from "@/components/dashboard/skills-progress";

export default function MenteeDashboard() {
  const { user } = useAuth();

  return (
    <>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-default">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-neutral mt-1">
          Track your progress and connect with mentors to achieve your goals.
        </p>
      </section>

      <StatsOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UpcomingSessions />
          <ActivityFeed />
        </div>
        
        <div className="lg:col-span-1">
          <RecommendedMentors />
          <SkillsProgress />
        </div>
      </div>
    </>
  );
}