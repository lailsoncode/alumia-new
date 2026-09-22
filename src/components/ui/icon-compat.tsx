import { forwardRef } from "react";
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  CircleIcon,
  DragDropVerticalIcon,
  MinusSignIcon,
  MoreHorizontalIcon,
  Search01Icon,
  SidebarLeftIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type HugeiconsIconProps, type IconSvgElement } from "@hugeicons/react";

type CompatIconProps = Omit<HugeiconsIconProps, "icon">;

function createCompatIcon(icon: IconSvgElement, displayName: string) {
  const Component = forwardRef<SVGSVGElement, CompatIconProps>((props, ref) => (
    <HugeiconsIcon ref={ref} icon={icon} strokeWidth={1.7} {...props} />
  ));
  Component.displayName = displayName;
  return Component;
}

export const Check = createCompatIcon(Tick01Icon, "Check");
export const ChevronRight = createCompatIcon(ArrowRight01Icon, "ChevronRight");
export const ChevronLeft = createCompatIcon(ArrowLeft01Icon, "ChevronLeft");
export const ChevronDown = createCompatIcon(ArrowDown01Icon, "ChevronDown");
export const ChevronUp = createCompatIcon(ArrowUp01Icon, "ChevronUp");
export const Circle = createCompatIcon(CircleIcon, "Circle");
export const Minus = createCompatIcon(MinusSignIcon, "Minus");
export const ArrowLeft = createCompatIcon(ArrowLeft01Icon, "ArrowLeft");
export const ArrowRight = createCompatIcon(ArrowRight01Icon, "ArrowRight");
export const X = createCompatIcon(Cancel01Icon, "X");
export const MoreHorizontal = createCompatIcon(MoreHorizontalIcon, "MoreHorizontal");
export const GripVertical = createCompatIcon(DragDropVerticalIcon, "GripVertical");
export const PanelLeft = createCompatIcon(SidebarLeftIcon, "PanelLeft");
export const Search = createCompatIcon(Search01Icon, "Search");

export const ChevronDownIcon = ChevronDown;
export const ChevronLeftIcon = ChevronLeft;
export const ChevronRightIcon = ChevronRight;
