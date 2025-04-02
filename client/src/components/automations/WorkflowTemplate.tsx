import { WorkflowTemplate as WorkflowTemplateType } from "@/lib/types";

interface WorkflowTemplateProps {
  template: WorkflowTemplateType;
}

export default function WorkflowTemplateComponent({ template }: WorkflowTemplateProps) {
  return (
    <div className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 cursor-pointer">
      <div className="flex items-center">
        <div className={`rounded-md ${template.iconBgColor} p-2 ${template.iconColor} flex-shrink-0 mr-3`}>
          <i className={template.icon}></i>
        </div>
        <div>
          <h5 className="font-medium text-gray-900">{template.name}</h5>
          <p className="text-xs text-gray-500">{template.description}</p>
        </div>
      </div>
    </div>
  );
}
