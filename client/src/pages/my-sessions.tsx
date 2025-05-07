import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Session } from "@shared/schema";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import SessionCard from "@/components/sessions/session-card";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Loader2, CalendarRange } from "lucide-react";

export default function MySessions() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
  });

  if (!sessions && !isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Error</h1>
            <p className="mb-8">Failed to load your sessions. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Refresh</Button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Filter sessions based on their status
  const upcomingSessions = sessions?.filter(
    (session) => session.status === "scheduled"
  ) || [];
  
  const completedSessions = sessions?.filter(
    (session) => session.status === "completed"
  ) || [];
  
  const canceledSessions = sessions?.filter(
    (session) => session.status === "canceled"
  ) || [];

  // Sort sessions by date (most recent first for upcoming, most recent last for completed)
  const sortedUpcoming = [...upcomingSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });
  
  const sortedCompleted = [...completedSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });
  
  const sortedCanceled = [...canceledSessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <>
      <Helmet>
        <title>My Sessions | MentorMatch</title>
        <meta name="description" content="View and manage your upcoming, completed, and canceled mentorship sessions." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-neutral-default">My Sessions</h1>
                <p className="text-neutral mt-1">
                  Manage your scheduled, completed, and canceled sessions.
                </p>
              </div>
              
              {user?.role === "mentee" && (
                <div className="mt-4 sm:mt-0">
                  <Button onClick={() => navigate("/find-mentors")}>
                    Find New Mentor
                  </Button>
                </div>
              )}
            </div>

            <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingSessions.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedSessions.length})
                </TabsTrigger>
                <TabsTrigger value="canceled">
                  Canceled ({canceledSessions.length})
                </TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading sessions...</span>
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming">
                    {sortedUpcoming.length > 0 ? (
                      sortedUpcoming.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <CalendarRange className="h-12 w-12 mx-auto text-neutral opacity-20 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No upcoming sessions</h3>
                        <p className="text-neutral mb-6">
                          You don't have any scheduled sessions at the moment.
                        </p>
                        {user?.role === "mentee" && (
                          <Button onClick={() => navigate("/find-mentors")}>
                            Find a Mentor
                          </Button>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="completed">
                    {sortedCompleted.length > 0 ? (
                      sortedCompleted.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium mb-2">No completed sessions</h3>
                        <p className="text-neutral">
                          You haven't completed any sessions yet.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="canceled">
                    {sortedCanceled.length > 0 ? (
                      sortedCanceled.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium mb-2">No canceled sessions</h3>
                        <p className="text-neutral">
                          You don't have any canceled sessions.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </>
              )}
            </Tabs>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
