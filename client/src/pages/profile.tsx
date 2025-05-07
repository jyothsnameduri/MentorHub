import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import ProfileForm from "@/components/profile/profile-form";
import AvailabilityCalendar from "@/components/profile/availability-calendar";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("details");
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName || !lastName) return "U";
    return (firstName[0] + lastName[0]).toUpperCase();
  };

  return (
    <>
      <Helmet>
        <title>My Profile | MentorMatch</title>
        <meta name="description" content="Manage your profile details and availability settings on MentorMatch." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-shrink-0 flex items-center justify-center md:justify-start">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profileImage || undefined} alt={`${user?.firstName} ${user?.lastName}`} />
                  <AvatarFallback className="text-xl">
                    {getInitials(user?.firstName, user?.lastName)}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-neutral-default text-center md:text-left">
                  {user?.firstName} {user?.lastName}
                </h1>
                <p className="text-neutral mt-1 text-center md:text-left">
                  {user?.title} {user?.organization ? `at ${user.organization}` : ''}
                </p>
                <p className="text-sm text-neutral-500 mt-2 text-center md:text-left">
                  {user?.role === "mentor" ? "Mentor" : "Mentee"} • {user?.email}
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="details">Profile Details</TabsTrigger>
                {user?.role === "mentor" && (
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal information and how others see you on the platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProfileForm />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {user?.role === "mentor" && (
                <TabsContent value="availability">
                  <Card>
                    <CardHeader>
                      <CardTitle>Manage Availability</CardTitle>
                      <CardDescription>
                        Set your weekly availability for mentorship sessions.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AvailabilityCalendar />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
