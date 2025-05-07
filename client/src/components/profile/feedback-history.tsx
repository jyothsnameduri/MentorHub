import { useQuery } from "@tanstack/react-query";
import { Feedback, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function FeedbackHistory() {
  const { user } = useAuth();

  // Get feedback received by the user
  const { data: feedbackReceived, isLoading: isLoadingReceived } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user,
  });

  // Get feedback given by the user
  const { data: feedbackGiven, isLoading: isLoadingGiven } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback/given"],
    enabled: !!user,
  });

  // Get user profiles for the feedback givers
  const { data: userProfiles, isLoading: isLoadingProfiles } = useQuery<Record<number, User>>({
    queryKey: ["/api/users/profiles"],
    enabled: !!feedbackReceived && feedbackReceived.length > 0,
  });

  const isLoading = isLoadingReceived || isLoadingGiven || isLoadingProfiles;

  const formatDate = (created: string | Date | null) => {
    if (!created) return "";
    const date = typeof created === "string" ? parseISO(created) : created;
    return format(date, "MMMM d, yyyy");
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-4 w-4 ${
              value <= rating ? "fill-yellow-400 text-yellow-400" : "text-neutral-200"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-neutral-100 rounded-md animate-pulse" />
        <div className="h-24 bg-neutral-100 rounded-md animate-pulse" />
      </div>
    );
  }

  if (!feedbackReceived || feedbackReceived.length === 0) {
    return (
      <Card className="bg-neutral-50 border-dashed border-neutral-200">
        <CardContent className="pt-6 text-center text-neutral-500">
          <p>You haven't received any feedback yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {feedbackReceived?.map((feedback) => {
        const giverProfile = userProfiles?.[feedback.fromId];
        const initials = giverProfile ? 
          `${giverProfile.firstName[0]}${giverProfile.lastName[0]}` : 
          "??";

        return (
          <Card key={feedback.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex">
                <div className="mr-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={giverProfile?.profileImage || undefined} 
                      alt={`${giverProfile?.firstName} ${giverProfile?.lastName}`} 
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {giverProfile?.firstName} {giverProfile?.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {formatDate(feedback.created)}
                      </p>
                    </div>
                    <div>
                      {renderStars(feedback.rating)}
                    </div>
                  </div>
                  
                  {feedback.comment && (
                    <div className="mt-3 text-sm bg-neutral-50 p-3 rounded-md border border-neutral-100">
                      {feedback.comment}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}