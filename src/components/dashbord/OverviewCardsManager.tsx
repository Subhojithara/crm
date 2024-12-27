import React from "react";
import OverviewCard from "./OverviewCard";
import { TrendingUpIcon, AlertCircleIcon } from "lucide-react";

interface OverviewCardsManagerProps {
  totalRevenue: number;
  receivedAmount: number;
  unpaidAmount: number;
}

const OverviewCardsManager: React.FC<OverviewCardsManagerProps> = ({
  totalRevenue,
  receivedAmount,
  unpaidAmount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <OverviewCard
        title="Total Revenue"
        description="Last 30 days"
        value={`₹${totalRevenue.toLocaleString()}`}
        icon={<TrendingUpIcon className="h-4 w-4" />}
        iconClass="text-green-600"
        extraInfo="+12.5% from last month"
      />

      <OverviewCard
        title="Received Amount"
        description={`Total: ₹${receivedAmount.toLocaleString()}`}
        value={`₹${receivedAmount.toLocaleString()}`}
        icon={<TrendingUpIcon className="h-4 w-4" />}
        iconClass="text-green-600"
        extraInfo="Received amount analysis"
      />

      <OverviewCard
        title="Unpaid Amount"
        description="Outstanding balance"
        value={`₹${unpaidAmount.toLocaleString()}`}
        icon={<AlertCircleIcon className="h-4 w-4" />}
        iconClass="text-red-600"
        extraInfo="Critical attention needed"
      />
    </div>
  );
};

export default OverviewCardsManager;