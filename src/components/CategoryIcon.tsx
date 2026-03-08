import { CategoryId } from "@/types";
import {
  CircleHelp, CircleCheck, Shield, Smile, GraduationCap, Heart,
} from "lucide-react";

const iconMap: Record<CategoryId, typeof CircleHelp> = {
  0: CircleHelp,
  1: CircleCheck,
  2: Shield,
  3: Smile,
  4: GraduationCap,
  5: Heart,
};

const colorMap: Record<CategoryId, string> = {
  0: "text-cat-0",
  1: "text-cat-1",
  2: "text-cat-2",
  3: "text-cat-3",
  4: "text-cat-4",
  5: "text-cat-5",
};

interface Props {
  category: CategoryId;
  size?: number;
}

export function CategoryIcon({ category, size = 16 }: Props) {
  const Icon = iconMap[category] ?? CircleHelp;
  return <Icon size={size} className={colorMap[category]} />;
}
