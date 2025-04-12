
import React from "react";
import { 
  Star, Heart, CheckCircle, Award, Crown, Gift, 
  Sparkles, Zap, Smile, ThumbsUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  className?: string;
}

export const AnimatedIcons: React.FC<AnimatedIconProps> = ({ className }) => {
  const icons = [
    { Icon: Star, color: "text-yellow-400", size: 32, top: "5%", left: "10%", delay: 0 },
    { Icon: Heart, color: "text-red-400", size: 24, top: "20%", left: "80%", delay: 0.7 },
    { Icon: CheckCircle, color: "text-green-500", size: 28, top: "70%", left: "85%", delay: 1.3 },
    { Icon: Award, color: "text-purple-500", size: 36, top: "85%", left: "15%", delay: 2.1 },
    { Icon: Crown, color: "text-yellow-500", size: 30, top: "10%", left: "90%", delay: 1.5 },
    { Icon: Gift, color: "text-blue-500", size: 26, top: "50%", left: "5%", delay: 0.9 },
    { Icon: Sparkles, color: "text-amber-500", size: 22, top: "30%", left: "25%", delay: 1.2 },
    { Icon: Zap, color: "text-yellow-600", size: 28, top: "60%", left: "75%", delay: 0.4 },
    { Icon: Smile, color: "text-green-400", size: 30, top: "40%", left: "88%", delay: 1.8 },
    { Icon: ThumbsUp, color: "text-blue-400", size: 24, top: "75%", left: "40%", delay: 0.6 },
  ];

  return (
    <div className={cn("fixed inset-0 pointer-events-none overflow-hidden z-0", className)}>
      {icons.map((icon, index) => (
        <div
          key={index}
          className="floating-icon"
          style={{
            top: icon.top,
            left: icon.left,
            animationDelay: `${icon.delay}s`,
            opacity: 0.25
          }}
        >
          <icon.Icon size={icon.size} className={cn("float", icon.color)} />
        </div>
      ))}
    </div>
  );
};
