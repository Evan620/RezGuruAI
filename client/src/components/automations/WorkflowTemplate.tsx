import { WorkflowTemplate as WorkflowTemplateType } from "@/lib/types";

interface WorkflowTemplateProps {
  template: WorkflowTemplateType;
}

export default function WorkflowTemplateComponent({ template }: WorkflowTemplateProps) {
  return (
    <div className="bg-[#1A1A2E] hover:bg-[#20223A] border border-[#2A2A3A] hover:border-[#6E56CF]/50 rounded p-3 cursor-pointer transition-all">
      <div className="flex items-center">
        <div className={`rounded ${template.iconBgColor} p-2 ${template.iconColor} flex-shrink-0 mr-3 border border-[#2A2A3A]`}>
          <i className={template.icon}></i>
        </div>
        <div>
          <h5 className="font-medium text-[#F8F9FA]">{template.name}</h5>
          <p className="text-xs text-[#CCCED0] monospace-text">{template.description}</p>
        </div>
      </div>
    </div>
  );
}
