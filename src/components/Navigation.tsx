import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Info, User, LogOut, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        email: data.email || "",
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsEditing(false);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        email: editForm.email,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "🦋 Profile updated!",
      description: "Your information has been saved",
    });

    fetchProfile(user.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out",
    });
    navigate("/");
  };

  return (
    <nav className="fixed top-0 right-0 p-6 z-50">
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-card/80 rounded-full backdrop-blur-sm"
        >
          <Info className="w-4 h-4 mr-2" />
          About
        </Button>
        
        {user ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground hover:bg-card/80 rounded-full backdrop-blur-sm"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-white/10">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  onClick={() => setIsProfileDialogOpen(true)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Edit Dialog */}
            <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
              <DialogContent className="bg-card/95 backdrop-blur-sm border-white/10 text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Your Profile</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Update your profile information
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name" className="text-foreground">Full Name</Label>
                    <Input
                      id="full_name"
                      value={isEditing ? editForm.full_name : (profile?.full_name || "")}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-foreground disabled:opacity-70"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={isEditing ? editForm.email : (profile?.email || user.email)}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      disabled={!isEditing}
                      className="bg-white/10 border-white/20 text-foreground disabled:opacity-70"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            full_name: profile?.full_name || "",
                            email: profile?.email || "",
                          });
                        }}
                        className="bg-transparent border-white/20 text-foreground hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </>
        ) : (
          <Button 
            size="sm"
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full shadow-soft transition-smooth"
          >
            <User className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navigation;