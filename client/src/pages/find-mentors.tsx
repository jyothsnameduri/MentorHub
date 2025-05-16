import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@shared/schema";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import MentorCard from "@/components/mentors/mentor-card";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";

export default function FindMentors() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  const { data: mentors, isLoading } = useQuery<User[]>({
    queryKey: ["/api/mentors"],
  });

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredMentors = mentors?.filter(mentor => {
    if (mentor.role !== "mentor") return false;

    // Combine all searchable fields
    const fields = [
      mentor.firstName,
      mentor.lastName,
      mentor.title || "",
      mentor.organization || "",
      mentor.bio || "",
      ...(Array.isArray(mentor.specialties) ? mentor.specialties : [])
    ].join(" ").toLowerCase();

    return fields.includes(normalizedQuery);
  });

  // Sort mentors
  const sortedMentors = [...(filteredMentors || [])].sort((a, b) => {
    if (sortBy === "name") {
      return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
    } else if (sortBy === "organization") {
      return (a.organization || "").localeCompare(b.organization || "");
    }
    return 0;
  });

  if (user?.role !== "mentee") {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
            <p className="mb-8">This page is only accessible to mentees. As a mentor, you provide mentorship rather than seeking it.</p>
            <Button onClick={() => window.location.href = "/"}>Return to Dashboard</Button>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Find Mentors | MentorHub</title>
        <meta name="description" content="Browse and connect with professional mentors that match your career goals and interests." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow pt-6 pb-16 md:pb-6 bg-neutral-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-neutral-default">Find Mentors</h1>
                <p className="text-neutral mt-1">
                  Browse and connect with mentors that match your interests.
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 w-full md:w-auto flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search mentors..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Sort by Name</SelectItem>
                    <SelectItem value="organization">Sort by Organization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading mentors...</span>
              </div>
            ) : sortedMentors && sortedMentors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedMentors.map((mentor) => (
                  <MentorCard key={mentor.id} mentor={mentor} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium mb-2">No mentors found</h3>
                <p className="text-neutral mb-6">
                  {searchQuery
                    ? `No mentors match your search for "${searchQuery}"`
                    : "There are no mentors available at this time."}
                </p>
                {searchQuery && (
                  <Button onClick={() => setSearchQuery("")}>Clear Search</Button>
                )}
              </div>
            )}
          </div>
        </main>
        
        <MobileNav />
      </div>
    </>
  );
}
