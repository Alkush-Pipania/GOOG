import { Button } from "@/components/ui/button"
import { FileText, Zap, BarChart2, Image, Code } from "lucide-react"

interface ActionButtonsProps {
  isMobile: boolean
}

export default function ActionButtons({ isMobile }: ActionButtonsProps) {
  const buttons = [
    { icon: <FileText size={16} />, label: "Research" },
    { icon: <Zap size={16} />, label: "Brainstorm" },
    { icon: <BarChart2 size={16} />, label: "Analyze Data" },
    { icon: <Image size={16} />, label: "Create images" },
    { icon: <Code size={16} />, label: "Code" },
  ]

  if (isMobile) {
    return (
      <div className="w-full flex flex-col items-center gap-2 mt-4">
        <div className="grid grid-cols-2 gap-2 w-full max-w-xs">
          {buttons.map((button, index) => (
            <Button
              key={index}
              variant="ghost"
              className="flex items-center justify-start gap-2 text-gray-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] h-10"
            >
              {button.icon}
              <span>{button.label}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      {buttons.map((button, index) => (
        <Button key={index} variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-white">
          {button.icon}
          <span>{button.label}</span>
        </Button>
      ))}
    </div>
  )
}

