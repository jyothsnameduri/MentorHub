import { useMutation, useQuery } from "@tanstack/react-query";
import { Session, User, Feedback, insertFeedbackSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Calendar, Video, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // Strictly verify session ownership based on user's role
  const isOwnSession = user?.role === "mentor" 
    ? session.mentorId === user?.id 
    : session.menteeId === user?.id;

  const isMentor = user?.role === "mentor";
  const participantId = isMentor ? session.menteeId : session.mentorId;
  
  const { data: participant } = useQuery<User>({
    queryKey: [`/api/profile/${participantId}`],
    enabled: !!participantId && isOwnSession,
  });
  
  // Check if the user has already provided feedback for this session
  const { data: userFeedback } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback/given"],
    enabled: session.status === "completed" && isOwnSession,
  });
  
  // Determine if the user has already left feedback for this session
  const hasLeftFeedback = userFeedback?.some(
    feedback => feedback.sessionId === session.id && feedback.fromId === user?.id
  ) || false;

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/sessions/${id}`, { status });
      return await res.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/upcoming"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Show appropriate toast messages based on the new status
      if (variables.status === "completed") {
        toast({
          title: "Session marked as completed",
          description: isMentor 
            ? "Mentee will now be able to leave feedback." 
            : "The mentor has ended this session. Please leave your feedback.",
        });
      } else if (variables.status === "canceled") {
        toast({
          title: "Session canceled",
          description: "The session has been canceled successfully.",
        });
      } else {
        toast({
          title: `Session ${variables.status}`,
          description: `The session has been ${variables.status} successfully.`,
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Failed to update session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: z.infer<typeof insertFeedbackSchema>) => {
      const res = await apiRequest("POST", "/api/feedback", feedbackData);
      return await res.json();
    },
    onSuccess: () => {
      setShowFeedbackModal(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback!",
      });
      
      // Invalidate all relevant feedback queries
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/feedback/given"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit feedback",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string, time: string) => {
    const dateObj = parseISO(`${date}T${time}`);
    // Format with the user's local timezone automatically included
    return format(dateObj, "EEEE, MMMM d, yyyy 'at' h:mm a (z)");
  };

  const handleJoinSession = () => {
    if (!session.meetingLink) {
      toast({
        title: "No meeting link available",
        description: "This session doesn't have a Google Meet link yet.",
        variant: "destructive"
      });
      return;
    }
    
    // Debug log for the meeting link
    console.log('Attempting to join meeting with link:', session.meetingLink);
    
    // Format the Google Meet URL correctly if needed
    let meetingUrl = session.meetingLink.trim();
    if (!meetingUrl.startsWith('http')) {
      if (meetingUrl.includes('meet.google.com')) {
        meetingUrl = `https://${meetingUrl}`;
      } else {
        meetingUrl = `https://meet.google.com/${meetingUrl}`;
      }
    }
    // Remove any trailing or leading whitespace
    meetingUrl = meetingUrl.replace(/\s+/g, '');
    // Open in a new tab
    window.open(meetingUrl, "_blank");
    toast({
      title: "Joining meeting",
      description: "Opening Google Meet in a new tab...",
    });
  };

  const handleCancel = () => {
    // Ensure the user is part of this session
    if (session.mentorId !== user?.id && session.menteeId !== user?.id) {
      toast({
        title: "Permission Denied",
        description: "You can only cancel sessions that you are a part of.",
        variant: "destructive"
      });
      return;
    }
    
    updateSessionMutation.mutate({ id: session.id, status: "canceled" });
  };

  const handleLeaveFeedback = () => {
    setShowFeedbackModal(true);
  };

  const submitFeedback = () => {
    const feedbackData = {
      sessionId: session.id,
      fromId: user!.id,
      toId: isMentor ? session.menteeId : session.mentorId,
      rating,
      comment,
    };
    submitFeedbackMutation.mutate(feedbackData);
  };

  // Session card status styling
  const getStatusBadgeStyle = () => {
    switch (session.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "canceled":
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // For privacy reasons, we only show the full name of the other participant if:
  // 1. We have completed the session already (post-session)
  // 2. The user is the owner of the session
  const shouldShowFullName = isOwnSession && session.status === "completed";
  
  const participantName = shouldShowFullName && participant 
    ? `${participant.firstName} ${participant.lastName}`
    : `${isMentor ? 'Mentee' : 'Mentor'}`;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex-grow mb-4 md:mb-0">
            <div className="flex items-center mb-3">
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeStyle()}`}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{session.topic}</h3>
            <div className="flex items-center text-neutral-500 mb-1">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm">{formatDate(session.date, session.time)}</span>
            </div>
            <div className="flex items-center text-neutral-500">
              <Video className="h-4 w-4 mr-2" />
              <span className="text-sm">Video meeting with {participantName}</span>
            </div>
            {session.notes && (
              <p className="mt-3 text-sm bg-neutral-50 p-3 rounded-md border border-neutral-200">
                <span className="font-medium">Session notes:</span> {session.notes}
              </p>
            )}
          </div>
          
          <div className="flex flex-col space-y-2 md:ml-4 md:w-36">
            {session.status === "approved" && (
              <>
                <Button 
                  onClick={handleJoinSession}
                  className="flex items-center justify-center"
                  disabled={!session.meetingLink}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
                {isMentor && session.mentorId === user?.id && (
                  <Button 
                    variant="secondary" 
                    onClick={() => updateSessionMutation.mutate({ id: session.id, status: "completed" })}
                  >
                    End Session
                  </Button>
                )}
                {(session.mentorId === user?.id || session.menteeId === user?.id) && (
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                )}
              </>
            )}
            {session.status === "pending" && (
              <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                Awaiting approval from {isMentor ? "you" : "mentor"}
              </div>
            )}
            {session.status === "rejected" && (
              <div className="text-sm text-red-700 bg-red-50 p-3 rounded-md border border-red-200">
                Request declined
              </div>
            )}
            {session.status === "completed" && !showFeedbackModal && (
              <>
                <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-200 mb-2">
                  Session completed
                </div>
                {hasLeftFeedback ? (
                  <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-md border border-blue-200">
                    Feedback provided
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={handleLeaveFeedback}
                    className="w-full"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Leave Feedback
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={showFeedbackModal} onOpenChange={setShowFeedbackModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Feedback</DialogTitle>
            <DialogDescription>
              Share your experience about the session with {participantName}
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4">
            <div className="flex items-center justify-center mb-2">
              {participant && (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={participant.profileImage || undefined} alt={participantName} />
                  <AvatarFallback>{participant.firstName?.[0]}{participant.lastName?.[0]}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <h3 className="text-center font-medium">{participantName}</h3>
            <p className="text-center text-sm text-neutral-500 mb-4">{session.topic}</p>
            
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      value <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <Textarea
              placeholder="Share your thoughts about the session..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="mb-4"
            />
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </Button>
              <Button onClick={submitFeedback} disabled={submitFeedbackMutation.isPending}>
                {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
