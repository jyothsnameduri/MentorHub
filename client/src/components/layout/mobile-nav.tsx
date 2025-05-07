import { Link, useLocation } from "wouter";
import { Home, Search, Calendar, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-lg z-50">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/' ? 'text-primary' : 'text-neutral'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </a>
        </Link>
        <Link href="/find-mentors">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/find-mentors' ? 'text-primary' : 'text-neutral'}`}>
            <Search className="h-6 w-6" />
            <span className="text-xs mt-1">Search</span>
          </a>
        </Link>
        <Link href="/my-sessions">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/my-sessions' ? 'text-primary' : 'text-neutral'}`}>
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">Sessions</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center py-2 px-3 ${location === '/profile' ? 'text-primary' : 'text-neutral'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
