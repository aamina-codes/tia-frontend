import { Button } from "@/components/ui/button";
import { MessageCircle, Info, LogIn } from "lucide-react";

const Navigation = () => {
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
        
        <Button 
          variant="ghost" 
          size="sm"
          className="text-muted-foreground hover:text-foreground hover:bg-card/80 rounded-full backdrop-blur-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat
        </Button>
        
        <Button 
          size="sm"
          className="bg-primary hover:bg-primary-hover text-primary-foreground rounded-full shadow-soft transition-smooth"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Sign In
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;