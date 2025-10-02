/**
 * Icon Mapping Utility
 *
 * Maps icon string names to Lucide React icon components.
 * This allows icons to be specified in configuration as strings.
 */

import {
  Users,
  Calendar,
  DollarSign,
  Globe,
  Flame,
  Heart,
  Palette,
  Star,
  Coffee,
  Tent,
  ArrowRight,
  Mountain,
  Award,
  Sparkles,
  MapPin,
  Eye,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  calendar: Calendar,
  'dollar-sign': DollarSign,
  globe: Globe,
  flame: Flame,
  heart: Heart,
  palette: Palette,
  star: Star,
  coffee: Coffee,
  tent: Tent,
  'arrow-right': ArrowRight,
  mountain: Mountain,
  award: Award,
  sparkles: Sparkles,
  'map-pin': MapPin,
  eye: Eye,
};

/**
 * Get a Lucide icon component from a string name
 * @param iconName - The string name of the icon
 * @returns The Lucide icon component, or a default icon if not found
 */
export function getIcon(iconName: string): LucideIcon {
  return iconMap[iconName.toLowerCase()] || Star; // Default to Star if not found
}
