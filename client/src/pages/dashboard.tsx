import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import MentorDashboard from "@/components/dashboard/mentor-dashboard";
import MenteeDashboard from "@/components/dashboard/mentee-dashboard";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-neutral">Loading your dashboard...</p>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Dashboard | MentorMatch</title>
        <meta 
          name="description" 
          content={user?.role === "mentor" 
            ? "Manage your mentorship sessions and track your impact as a mentor." 
            : "Track your progress and connect with mentors to achieve your goals."
          } 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {user?.role === "mentor" ? (
              <MentorDashboard />
            ) : (
              <MenteeDashboard />
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
