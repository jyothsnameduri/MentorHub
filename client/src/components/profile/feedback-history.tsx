import { useQuery } from "@tanstack/react-query";
import { Feedback, User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

export default function FeedbackHistory() {
  const { user } = useAuth();
  
  // Following privacy requirements - users can only see feedback they received
  // Get feedback received by the user
  const { data: feedbackReceived, isLoading: isLoadingReceived } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user,
  });
  
  // Get user profiles for feedback givers
  const { data: userProfiles, isLoading: isLoadingProfiles } = useQuery<Record<number, User>>({
    queryKey: ["/api/users/profiles"],
    enabled: !!feedbackReceived && feedbackReceived.length > 0,
  });

  const isLoading = isLoadingReceived || isLoadingProfiles;

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
              value <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-neutral-200 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-10">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
        <div className="h-24 bg-neutral-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
        <div className="h-24 bg-neutral-100 dark:bg-gray-700/50 rounded-md animate-pulse" />
      </div>
    );
  }

  const hasNoFeedback = !feedbackReceived || feedbackReceived.length === 0;

  // Render individual feedback item
  const renderFeedbackItem = (feedback: Feedback) => {
    // Show profile of who gave the feedback
    const giverProfile = userProfiles?.[feedback.fromId];
    
    // Create initials for avatar fallback
    const initials = giverProfile ? 
      `${giverProfile.firstName[0]}${giverProfile.lastName[0]}` : 
      "??";

    return (
      <Card key={feedback.id} className="overflow-hidden bg-white/90 dark:bg-gray-800/90 border-indigo-100 dark:border-indigo-800/30 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-4">
          <div className="flex">
            <div className="mr-4">
              <Avatar className="h-10 w-10 ring-2 ring-indigo-100 dark:ring-indigo-800/30">
                <AvatarImage 
                  src={giverProfile?.profileImage || undefined} 
                  alt={`${giverProfile?.firstName} ${giverProfile?.lastName}`} 
                />
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {giverProfile?.firstName} {giverProfile?.lastName}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-gray-400">
                    {formatDate(feedback.created)}
                  </p>
                </div>
                <div>
                  {renderStars(feedback.rating)}
                </div>
              </div>
              
              {feedback.comment && (
                <div className="mt-3 text-sm bg-neutral-50 dark:bg-gray-700/50 p-3 rounded-md border border-neutral-100 dark:border-gray-700 text-gray-700 dark:text-gray-200">
                  {feedback.comment}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-center mb-4 text-gray-900 dark:text-white flex items-center justify-center">
        <span>Feedback From Others</span>
        <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
      </h3>
      
      {hasNoFeedback ? (
        <Card className="bg-neutral-50 dark:bg-gray-800/50 border-dashed border-neutral-200 dark:border-gray-700/50">
          <CardContent className="pt-6 text-center text-neutral-500 dark:text-gray-400">
            <p>You haven't received any feedback yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {feedbackReceived?.map(renderFeedbackItem)}
        </div>
      )}
    </div>
  );
}