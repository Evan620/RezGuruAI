import { Card } from "@/components/ui/card";
import { Metric } from "@/lib/types";
import { Target, Crosshair, Zap, Radio, Flag } from "lucide-react";

export default function MetricsOverview() {
  const metrics: Metric[] = [
    {
      id: "total-leads",
      title: "TOTAL TARGETS",
      value: 248,
      change: 12,
      isPositiveChange: true,
      icon: <Crosshair className="h-5 w-5" />,
      iconBgColor: "bg-[#18251d]",
      iconColor: "text-[#7fb485]"
    },
    {
      id: "ai-scored",
      title: "AI ANALYZED",
      value: 197,
      change: 8,
      isPositiveChange: true,
      icon: <Zap className="h-5 w-5" />,
      iconBgColor: "bg-[#18251d]",
      iconColor: "text-[#7fb485]"
    },
    {
      id: "high-value",
      title: "HIGH-VALUE ASSETS",
      value: 42,
      change: 15,
      isPositiveChange: true,
      icon: <Target className="h-5 w-5" />,
      iconBgColor: "bg-[#18251d]",
      iconColor: "text-[#7fb485]"
    },
    {
      id: "contacts-made",
      title: "ENGAGEMENTS",
      value: 86,
      change: 3,
      isPositiveChange: false,
      icon: <Radio className="h-5 w-5" />,
      iconBgColor: "bg-[#18251d]",
      iconColor: "text-[#7fb485]"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.id} className="bg-[#18251d] border border-[#2a3c2f] overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${metric.iconBgColor} border border-[#304d36] rounded-md p-3`}>
                {metric.icon}
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-[#8fb096] truncate font-mono">{metric.title}</dt>
                  <dd>
                    <div className="text-2xl font-bold text-[#e0e7e3]">{metric.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className={`text-sm ${metric.isPositiveChange ? 'text-[#7fb485]' : 'text-[#e57373]'} font-medium flex items-center`}>
                  <Flag className="h-3 w-3 mr-1" />
                  {metric.change}% {metric.isPositiveChange ? 'INCREASE' : 'DECREASE'}
                </div>
                <div className="text-xs text-[#8fb096] font-mono">VS LAST MONTH</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
