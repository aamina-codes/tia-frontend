import { useNavigate, useLocation, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  FileText,
  BarChart3,
  MessageCircle,
  User,
  Menu,
  CalendarCheck,
  Stethoscope,
  Settings,
  Info,
  LifeBuoy,
  LogOut,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import tiaLogo from "@/assets/tia-butterfly-logo.png";
import { cn } from "@/lib/utils";

const primaryItems = [
  { label: "Home", to: "/home", icon: Home, match: ["/home", "/explore"] },
  { label: "Reports", to: "/reports", icon: FileText, match: ["/reports", "/lab-report"] },
  { label: "Progress", to: "/progress", icon: BarChart3, match: ["/progress"] },
  { label: "Ask TIA", to: "/assistant", icon: MessageCircle, match: ["/assistant", "/chatbot"] },
  { label: "Profile", to: "/profile", icon: User, match: ["/profile"] },
];

const secondaryItems = [
  { label: "My Care Plan", to: "/care-plan", icon: CalendarCheck },
  { label: "Health Tracker", to: "/health-tracker", icon: Activity },
  { label: "Doctor Connect", to: "/doctor-connect", icon: Stethoscope },
  { label: "Settings", to: "/settings", icon: Settings },
  { label: "About TIA", to: "/about", icon: Info },
  { label: "Help & Safety", to: "/help", icon: LifeBuoy },
];

const Navigation = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const isActive = (match: string[]) => match.some((m) => pathname.startsWith(m));

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You've been successfully signed out" });
    navigate("/auth");
  };

  return (
    <>
      {/* Top bar */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-[#1E003D]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(user ? "/home" : "/")}
            className="flex items-center gap-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400"
            aria-label="TIA home"
          >
            <img src={tiaLogo} alt="TIA butterfly logo" className="w-8 h-8" />
            <span className="text-white font-semibold tracking-wide hidden sm:inline">TIA</span>
          </button>

          {user && (
            <div className="hidden md:flex items-center gap-1">
              {primaryItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  aria-current={isActive(item.match) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400",
                    isActive(item.match)
                      ? "bg-white/15 text-white font-medium"
                      : "text-white/65 hover:text-white hover:bg-white/10"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Open menu"
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-full"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-60 bg-[#2A0A52] border-white/10 text-white"
                >
                  <DropdownMenuLabel>
                    <p className="text-sm font-medium">{profile?.full_name || "Your account"}</p>
                    <p className="text-xs text-white/60 truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {secondaryItems.map((item) => (
                    <DropdownMenuItem
                      key={item.to}
                      onClick={() => navigate(item.to)}
                      className="cursor-pointer focus:bg-white/10 focus:text-white"
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer focus:bg-white/10 focus:text-white"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/about")}
                  className="text-white/70 hover:text-white hover:bg-white/10 rounded-full"
                >
                  About
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate("/auth")}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                >
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom bar */}
      {user && (
        <nav
          aria-label="Primary"
          className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/10 bg-[#1E003D]/95 backdrop-blur-xl"
        >
          <div className="grid grid-cols-5">
            {primaryItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                aria-current={isActive(item.match) ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] transition-colors",
                  isActive(item.match) ? "text-pink-300" : "text-white/55"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  );
};

export default Navigation;
