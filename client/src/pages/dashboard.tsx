import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import StatsOverview from "@/components/dashboard/stats-card";
import UpcomingSessions from "@/components/dashboard/upcoming-sessions";
import ActivityFeed from "@/components/dashboard/activity-feed";
import RecommendedMentors from "@/components/dashboard/recommended-mentors";
import SkillsProgress from "@/components/dashboard/skills-progress";
import { Helmet } from "react-helmet";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard | MentorMatch</title>
        <meta name="description" content="View your mentorship statistics, upcoming sessions, and recommended mentors." />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section className="mb-8">
              <h1 className="text-2xl font-bold text-neutral-default">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-neutral mt-1">
                Here's what's happening with your mentorship journey.
              </p>
            </section>

            <StatsOverview />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UpcomingSessions />
                <ActivityFeed />
              </div>
              
              <div className="lg:col-span-1">
                {user?.role === "mentee" && <RecommendedMentors />}
                <SkillsProgress />
              </div>
            </div>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
