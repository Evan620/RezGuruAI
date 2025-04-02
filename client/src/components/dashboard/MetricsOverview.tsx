import { Card } from "@/components/ui/card";
import { Metric } from "@/lib/types";

export default function MetricsOverview() {
  const metrics: Metric[] = [
    {
      id: "total-leads",
      title: "Total Leads",
      value: 248,
      change: 12,
      isPositiveChange: true,
      icon: "fas fa-users",
      iconBgColor: "bg-primary-100",
      iconColor: "text-primary-600"
    },
    {
      id: "ai-scored",
      title: "AI Scored Leads",
      value: 197,
      change: 8,
      isPositiveChange: true,
      icon: "fas fa-brain",
      iconBgColor: "bg-secondary-100",
      iconColor: "text-secondary-600"
    },
    {
      id: "high-value",
      title: "High Value Leads",
      value: 42,
      change: 15,
      isPositiveChange: true,
      icon: "fas fa-fire",
      iconBgColor: "bg-accent-100",
      iconColor: "text-accent-600"
    },
    {
      id: "contacts-made",
      title: "Contacts Made",
      value: 86,
      change: 3,
      isPositiveChange: false,
      icon: "fas fa-phone-alt",
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      {metrics.map((metric) => (
        <Card key={metric.id} className="bg-white overflow-hidden shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${metric.iconBgColor} rounded-md p-3`}>
                <i className={`${metric.icon} ${metric.iconColor} text-xl`}></i>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{metric.title}</dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">{metric.value}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <div className={`text-sm ${metric.isPositiveChange ? 'text-green-600' : 'text-red-600'} font-medium flex items-center`}>
                  <i className={`fas fa-arrow-${metric.isPositiveChange ? 'up' : 'down'} text-xs mr-1`}></i>
                  {metric.change}% {metric.isPositiveChange ? 'increase' : 'decrease'}
                </div>
                <div className="text-sm text-gray-500">vs last month</div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
