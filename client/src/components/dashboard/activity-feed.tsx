import { useQuery } from "@tanstack/react-query";
import { Activity } from "@shared/schema";
import { MessageSquare, Calendar, Eye, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const ActivityIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "feedback_given":
    case "feedback_received":
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-primary" />
        </div>
      );
    case "session_confirmed":
    case "session_created":
    case "session_requested":
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Calendar className="h-4 w-4 text-secondary" />
        </div>
      );
    case "profile_viewed":
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
          <Eye className="h-4 w-4 text-purple-600" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <Shield className="h-4 w-4 text-accent" />
        </div>
      );
  }
};

export default function ActivityFeed() {
  const { data: activities, isLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
  });

  const formatTime = (date: Date | string) => {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return formatDistanceToNow(dateObj, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Skeleton className="h-6 w-36 mb-6" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="ml-4">
                <Skeleton className="h-4 w-full max-w-[250px] mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
      
      {activities && activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex">
              <div className="flex-shrink-0">
                <ActivityIcon type={activity.type} />
              </div>
              <div className="ml-4">
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: activity.content }} />
                <p className="text-xs text-neutral">{formatTime(activity.created)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral py-4">No recent activity to display.</p>
      )}
    </div>
  );
}
