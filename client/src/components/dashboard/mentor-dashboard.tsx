import { useAuth } from "@/hooks/use-auth";
import StatsOverview from "@/components/dashboard/stats-card";
import UpcomingSessions from "@/components/dashboard/upcoming-sessions";
import ActivityFeed from "@/components/dashboard/activity-feed";
import SessionRequests from "@/components/dashboard/session-requests";
import SessionsChart from "@/components/dashboard/sessions-chart";

export default function MentorDashboard() {
  const { user } = useAuth();

  return (
    <>
      <section className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-default">
          Welcome back, {user?.firstName}! 👋
        </h1>
        <p className="text-neutral mt-1">
          Manage your mentorship sessions and track your impact.
        </p>
      </section>

      <StatsOverview />
      
      <div className="grid grid-cols-1 gap-6 mb-6">
        <SessionsChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <SessionRequests />
          </div>
          {/* Exclude pending sessions from this component to avoid duplication with SessionRequests */}
          <UpcomingSessions excludePending={true} />
          <ActivityFeed />
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Mentor Resources</h2>
            <div className="space-y-4">
              <div className="p-4 border border-blue-100 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800 mb-2">Effective Mentoring Guide</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Learn best practices for guiding mentees toward their goals.
                </p>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Read guide →
                </a>
              </div>
              
              <div className="p-4 border border-purple-100 bg-purple-50 rounded-md">
                <h3 className="font-medium text-purple-800 mb-2">Communication Templates</h3>
                <p className="text-sm text-purple-700 mb-2">
                  Helpful templates for common mentorship situations.
                </p>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  View templates →
                </a>
              </div>
              
              <div className="p-4 border border-green-100 bg-green-50 rounded-md">
                <h3 className="font-medium text-green-800 mb-2">Success Stories</h3>
                <p className="text-sm text-green-700 mb-2">
                  See how other mentors have made an impact.
                </p>
                <a href="#" className="text-sm font-medium text-primary hover:underline">
                  Read stories →
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Your Availability</h2>
            <p className="text-sm text-neutral mb-4">
              Manage when you're available for mentorship sessions.
            </p>
            <a 
              href="/profile#availability" 
              className="block w-full py-2 px-4 bg-primary text-white rounded-md text-center font-medium hover:bg-primary-dark transition-colors"
            >
              Manage Availability
            </a>
          </div>
        </div>
      </div>
    </>
  );
}