import { useQuery } from "@tanstack/react-query";
import { Session, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Calendar, Loader2 } from "lucide-react";
import { useState } from "react";
import { format, isTomorrow, isToday, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export default function UpcomingSessions() {
  const { user } = useAuth();
  const [meetingId, setMeetingId] = useState<number | null>(null);
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/upcoming"],
  });
  
  const { data: mentors, isLoading: mentorsLoading } = useQuery<User[]>({
    queryKey: ["/api/mentors"],
    enabled: user?.role === "mentee",
  });

  const formatSessionDate = (date: string, time: string) => {
    const fullDate = parseISO(`${date}T${time}`);
    
    if (isToday(fullDate)) {
      return `Today, ${format(fullDate, "h:mm a")}`;
    }
    if (isTomorrow(fullDate)) {
      return `Tomorrow, ${format(fullDate, "h:mm a")}`;
    }
    return format(fullDate, "EEE, MMM d, h:mm a");
  };

  const handleJoinSession = (sessionId: number) => {
    setMeetingId(sessionId);
    // In a real application, this would redirect to the video meeting
    // For now, we'll simulate joining with a loading state
    setTimeout(() => {
      setMeetingId(null);
    }, 2000);
  };

  // Get participant details based on user role
  const getParticipantDetails = (session: Session) => {
    if (user?.role === "mentee") {
      const mentor = mentors?.find(m => m.id === session.mentorId);
      return {
        id: mentor?.id || 0,
        name: mentor ? `${mentor.firstName} ${mentor.lastName}` : "Unknown Mentor",
        initials: mentor ? `${mentor.firstName[0]}${mentor.lastName[0]}` : "UM",
        profileImage: mentor?.profileImage,
        color: "bg-primary-light",
      };
    } else {
      // If user is a mentor, we would need to fetch mentee details
      // For simplicity, let's return placeholder data
      return {
        id: session.menteeId,
        name: "Mentee", // In a real app, you'd fetch the mentee's name
        initials: "ME",
        profileImage: null,
        color: "bg-purple-500",
      };
    }
  };

  if (isLoading || mentorsLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-16" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex flex-col sm:flex-row border-b border-gray-200 py-4 last:border-0 last:pb-0 first:pt-0 items-start sm:items-center">
            <Skeleton className="h-12 w-12 rounded-full mb-3 sm:mb-0" />
            <div className="sm:ml-4 flex-grow">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-9 w-16 mt-3 sm:mt-0" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Upcoming Sessions</h2>
        <a href="#" className="text-sm text-primary hover:text-primary-dark">View all</a>
      </div>
      
      {sessions && sessions.length > 0 ? (
        sessions.map(session => {
          const participant = getParticipantDetails(session);
          return (
            <div key={session.id} className="flex flex-col sm:flex-row border-b border-gray-200 py-4 last:border-0 last:pb-0 first:pt-0 items-start sm:items-center">
              <div className="sm:flex-shrink-0 mb-3 sm:mb-0">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={participant.profileImage || undefined} alt={participant.name} />
                  <AvatarFallback className={participant.color}>{participant.initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="sm:ml-4 flex-grow">
                <p className="font-medium">{participant.name}</p>
                <p className="text-sm text-neutral">{session.topic}</p>
                <div className="flex items-center mt-1 text-xs text-neutral">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatSessionDate(session.date, session.time)}</span>
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                <Button 
                  onClick={() => handleJoinSession(session.id)}
                  disabled={meetingId === session.id}
                >
                  {meetingId === session.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join"
                  )}
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-8 text-center">
          <p className="text-neutral">No upcoming sessions scheduled.</p>
          <Button className="mt-4" asChild>
            <a href="/find-mentors">Find a mentor</a>
          </Button>
        </div>
      )}
    </div>
  );
}
