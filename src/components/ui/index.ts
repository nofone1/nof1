/**
 * UI component exports.
 * Import from '@/components/ui' for reusable UI primitives.
 */

// Core interactive components
export {
  AnimatedPressable,
  type AnimatedPressableProps,
  type HapticType,
} from "./animated-pressable";

export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./button";

// Form components
export { Input, type InputProps } from "./input";

// Layout components
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  type CardProps,
  type CardVariant,
} from "./card";

// Feedback components
export { Loading, type LoadingProps } from "./loading";
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from "./badge";

// Icon component
export { Icon, type IconProps, type IconName, iconSizes } from "./icon";

// Peptide picker component
export { PeptidePicker, type PeptidePickerProps } from "./peptide-picker";

// Body map component
export { BodyMap } from "./body-map";