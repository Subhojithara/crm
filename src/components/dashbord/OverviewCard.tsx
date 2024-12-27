import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { ReactNode } from "react";
  
  interface OverviewCardProps {
    title: string;
    description: string;
    value: string | number;
    icon?: ReactNode;
    iconClass?: string;
    extraInfo?: string;
  }
  
  const OverviewCard: React.FC<OverviewCardProps> = ({
    title,
    description,
    value,
    icon,
    iconClass,
    extraInfo,
  }) => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {icon && extraInfo && (
            <div className={`flex items-center mt-2 ${iconClass}`}>
              {icon}
              <span className="ml-1">{extraInfo}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  export default OverviewCard;