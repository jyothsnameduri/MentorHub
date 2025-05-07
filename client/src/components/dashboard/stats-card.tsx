import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Link } from "wouter";
import { CalendarDays, Clock, Users, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  footer: React.ReactNode;
  color: string;
}

function StatsCard({ icon, title, value, footer, color }: StatsCardProps) {
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral text-sm">{title}</p>
          <p className="text-2xl font-semibold mt-1">{value}</p>
        </div>
        <div className={`p-3 ${color} rounded-md flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        {footer}
      </div>
    </div>
  );
}

export default function StatsOverview() {
  const { user } = useAuth();

  const { data: upcomingSessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/upcoming"],
  });

  const { data: sessions, isLoading: allSessionsLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  const { data: feedback, isLoading: feedbackLoading } = useQuery<any[]>({
    queryKey: ["/api/feedback"],
  });

  const { data: mentors, isLoading: mentorsLoading } = useQuery({
    queryKey: ["/api/mentors"],
    enabled: user?.role === "mentee",
  });

  // Calculate stats
  const upcomingSessionsCount = upcomingSessions?.length || 0;
  const totalHours = (sessions && Array.isArray(sessions) ? sessions.length : 0) * 1; // Assuming 1 hour per session
  const activeMentorsCount = user?.role === "mentee" ? (mentors && Array.isArray(mentors) ? mentors.length : 0) : 0;
  
  // Calculate average rating
  let avgRating = 0;
  if (feedback && Array.isArray(feedback) && feedback.length > 0) {
    const totalRating = feedback.reduce((sum, item) => sum + item.rating, 0);
    avgRating = Math.round((totalRating / feedback.length) * 10) / 10;
  }

  if (sessionsLoading || allSessionsLoading || feedbackLoading || (user?.role === "mentee" && mentorsLoading)) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-10" />
              </div>
              <Skeleton className="h-12 w-12 rounded-md" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatsCard
        icon={<CalendarDays className="h-6 w-6 text-blue-600" />}
        title="Upcoming Sessions"
        value={upcomingSessionsCount}
        footer={<Link href="/my-sessions"><a className="text-sm text-primary">View schedule →</a></Link>}
        color="bg-blue-100"
      />
      <StatsCard
        icon={<Clock className="h-6 w-6 text-green-600" />}
        title="Total Hours"
        value={totalHours}
        footer={<p className="text-sm text-neutral">{Math.floor(totalHours / 2)} hours this month</p>}
        color="bg-green-100"
      />
      {user?.role === "mentee" ? (
        <StatsCard
          icon={<Users className="h-6 w-6 text-purple-600" />}
          title="Active Mentors"
          value={activeMentorsCount}
          footer={<Link href="/find-mentors"><a className="text-sm text-primary">Manage connections →</a></Link>}
          color="bg-purple-100"
        />
      ) : (
        <StatsCard
          icon={<Users className="h-6 w-6 text-purple-600" />}
          title="Active Mentees"
          value={upcomingSessionsCount > 0 ? upcomingSessionsCount : 0}
          footer={<p className="text-sm text-neutral">Mentees you're guiding</p>}
          color="bg-purple-100"
        />
      )}
      <StatsCard
        icon={<Star className="h-6 w-6 text-amber-500" />}
        title="Feedback Score"
        value={avgRating ? `${avgRating}/5` : "No ratings"}
        footer={<p className="text-sm text-neutral">Based on {feedback && Array.isArray(feedback) ? feedback.length : 0} sessions</p>}
        color="bg-amber-100"
      />
    </section>
  );
}
