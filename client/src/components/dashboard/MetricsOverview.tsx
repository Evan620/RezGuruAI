import { Card } from "@/components/ui/card";
import { Metric } from "@/lib/types";
import { Target, Crosshair, Zap, Radio, Flag, TrendingUp, TrendingDown } from "lucide-react";

export default function MetricsOverview() {
  const metrics: Metric[] = [
    {
      id: "total-leads",
      title: "TOTAL TARGETS",
      value: 248,
      change: 12,
      isPositiveChange: true,
      icon: <Crosshair className="h-5 w-5" />,
      iconBgColor: "bg-[#6E56CF]/20",
      iconColor: "text-[#6E56CF]"
    },
    {
      id: "ai-scored",
      title: "AI ANALYZED",
      value: 197,
      change: 8,
      isPositiveChange: true,
      icon: <Zap className="h-5 w-5" />,
      iconBgColor: "bg-[#6E56CF]/20",
      iconColor: "text-[#6E56CF]"
    },
    {
      id: "high-value",
      title: "HIGH-VALUE ASSETS",
      value: 42,
      change: 15,
      isPositiveChange: true,
      icon: <Target className="h-5 w-5" />,
      iconBgColor: "bg-[#6E56CF]/20",
      iconColor: "text-[#6E56CF]"
    },
    {
      id: "contacts-made",
      title: "ENGAGEMENTS",
      value: 86,
      change: 3,
      isPositiveChange: false,
      icon: <Radio className="h-5 w-5" />,
      iconBgColor: "bg-[#6E56CF]/20",
      iconColor: "text-[#6E56CF]"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.id} className="card-base card-hover">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${metric.iconBgColor} border border-[#6E56CF]/30 rounded p-3`}>
                <div className={metric.iconColor}>
                  {metric.icon}
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#CCCED0] truncate monospace-text">{metric.title}</dt>
                  <dd>
                    <div className="text-2xl font-bold text-[#F8F9FA]">{metric.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className={`text-sm ${metric.isPositiveChange ? 'text-[#00F5D4]' : 'text-[#FF6B6B]'} font-medium flex items-center`}>
                  {metric.isPositiveChange ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {metric.change}% {metric.isPositiveChange ? 'INCREASE' : 'DECREASE'}
                </div>
                <div className="text-xs text-[#CCCED0] monospace-text">VS LAST MONTH</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
