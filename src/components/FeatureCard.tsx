import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  gradientClass?: string;
}

const FeatureCard = ({ title, description, icon: Icon, gradientClass = "bg-gradient-card" }: FeatureCardProps) => {
  return (
    <Card className={`${gradientClass} border-0 shadow-card hover:shadow-soft transition-smooth hover:scale-105 cursor-pointer group`}>
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">
          <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
            <Icon className="w-8 h-8 text-primary" />
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-card-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;