import { Link, useLocation } from "wouter";
import { Home, Search, Calendar, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isMentee = user?.role === "mentee";

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-lg z-50">
      <div className="flex justify-around">
        <Link href="/">
          <div className={`flex flex-col items-center py-2 px-3 ${location === '/' ? 'text-primary' : 'text-neutral'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        
        {isMentee && (
          <Link href="/find-mentors">
            <div className={`flex flex-col items-center py-2 px-3 ${location === '/find-mentors' ? 'text-primary' : 'text-neutral'}`}>
              <Search className="h-6 w-6" />
              <span className="text-xs mt-1">Find Mentors</span>
            </div>
          </Link>
        )}
        
        <Link href="/my-sessions">
          <div className={`flex flex-col items-center py-2 px-3 ${location === '/my-sessions' ? 'text-primary' : 'text-neutral'}`}>
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Sessions</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center py-2 px-3 ${location === '/profile' ? 'text-primary' : 'text-neutral'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>
        
        {!isMentee && (
          <Link href="/profile">
            <div className={`flex flex-col items-center py-2 px-3 ${location === '/settings' ? 'text-primary' : 'text-neutral'}`}>
              <Settings className="h-6 w-6" />
              <span className="text-xs mt-1">Settings</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
