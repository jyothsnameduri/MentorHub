import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Settings, User } from "lucide-react";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-primary font-bold text-xl cursor-pointer">MentorMatch</span>
            </Link>
          </div>
          <nav className="hidden md:ml-10 md:flex space-x-8">
            <Link href="/">
              <div className={`text-neutral-default ${location === '/' ? 'border-b-2 border-primary' : 'hover:text-neutral-dark'} px-1 pt-1 font-medium cursor-pointer`}>
                Dashboard
              </div>
            </Link>
            {user?.role === "mentee" && (
              <Link href="/find-mentors">
                <div className={`text-neutral-default ${location === '/find-mentors' ? 'border-b-2 border-primary' : 'hover:text-neutral-dark'} px-1 pt-1 font-medium cursor-pointer`}>
                  Find Mentors
                </div>
              </Link>
            )}
            <Link href="/my-sessions">
              <div className={`text-neutral-default ${location === '/my-sessions' ? 'border-b-2 border-primary' : 'hover:text-neutral-dark'} px-1 pt-1 font-medium cursor-pointer`}>
                My Sessions
              </div>
            </Link>
            {user?.role === 'mentor' && (
              <Link href="/profile">
                <div className={`text-neutral-default ${location === '/profile' ? 'border-b-2 border-primary' : 'hover:text-neutral-dark'} px-1 pt-1 font-medium cursor-pointer`}>
                  My Profile
                </div>
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Button variant="ghost" className="rounded-full" size="icon">
              <Bell className="h-5 w-5 text-neutral" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </Button>
          </div>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage || undefined} alt={user?.firstName || 'User'} />
                    <AvatarFallback>{getInitials(`${user?.firstName} ${user?.lastName}`)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="ml-2 font-medium text-sm hidden md:block">
              {user?.firstName} {user?.lastName}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
