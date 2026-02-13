import { radii, shadows, spacing, typography } from '@/constants/Themes';
import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps
} from 'react-native';
import { Text } from './Text';

// Define variant types
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'upload';
type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ThemeProps & TouchableOpacityProps & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
};

// Size configurations 
const sizeStyles = {
  sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    fontSize: typography.sizes.sm,
    borderRadius: radii.sm,
  },
  md: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    borderRadius: radii.md,
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: typography.sizes.lg,
    borderRadius: radii.lg,
  },
};

export function Button(props: ButtonProps) {
  const {
    lightColor,
    darkColor,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    style,
    children,
    ...otherProps
  } = props;

  //theme colors for each variant
  const primaryBg = useThemeColor({}, 'buttonBackground');
  const secondaryBg = useThemeColor({}, 'buttonBackgroundSecondary');
  const ghostBg = useThemeColor({}, 'buttonBackgroundGhost');
  const errorColor = useThemeColor({}, 'error');
  
  const uploadBg = useThemeColor({}, 'cardBackground');
  const cardBorderColor = useThemeColor({}, 'cardBorder')
  
  const primaryText = useThemeColor({}, 'textInverse');
  const secondaryText = useThemeColor({}, 'text');
  const ghostText = useThemeColor({}, 'tint');

  // Variant configurations
  const variantStyles = {
    primary: {
      backgroundColor: primaryBg,
      textColor: primaryText,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    secondary: {
      backgroundColor: secondaryBg,
      textColor: secondaryText,
      borderWidth: 1,
      borderColor: useThemeColor({}, 'border'),
    },
    ghost: {
      backgroundColor: ghostBg,
      textColor: ghostText,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    danger: {
      backgroundColor: errorColor,
      textColor: primaryText,
      borderWidth: 0,
      borderColor: 'transparent',
    },
    upload: {
      backgroundColor: uploadBg,
      textColor: primaryText,
      borderWidth: 2,
      borderColor: cardBorderColor
    }
  };

  const currentVariant = variantStyles[variant];
  const currentSize = sizeStyles[size];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        {
          backgroundColor: currentVariant.backgroundColor,
          borderWidth: currentVariant.borderWidth,
          borderColor: currentVariant.borderColor,
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: currentSize.borderRadius,
          opacity: disabled ? 0.5 : 1,
          width: fullWidth ? '100%' : undefined,
        },
        shadows.md,
        style,
      ]}
      disabled={disabled || loading}
      {...otherProps}
    >
      {loading ? (
        <ActivityIndicator color={currentVariant.textColor} />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: currentVariant.textColor,
              fontSize: currentSize.fontSize,
            },
          ]}
        >
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column-reverse',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.bold,
    textAlign: 'center',
  },
});
