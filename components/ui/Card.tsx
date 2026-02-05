import { radii, shadows, spacing, typography } from '@/constants/Themes';
import { ThemeProps, useThemeColor } from '@/hooks/useThemeColor';
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';
import { Text } from './Text';

export type CardProps = ThemeProps & Omit<TouchableOpacityProps, 'children'> & {
  title: string;
  subtitle?: string;
  rating?: number | string;
  body?: string;
};

export function Card(props: CardProps) {
  const {
    lightColor,
    darkColor,
    title,
    subtitle,
    rating,
    body,
    style,
    ...otherProps
  } = props;

  const cardBackground = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');
  const errorColor = useThemeColor({}, 'error');

  // Determine rating color based on difficulty value
  const getRatingColor = () => {
    const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    if (numericRating === undefined || isNaN(numericRating)) return textColor;

    if (numericRating >= 0 && numericRating < 100) {
      return successColor; // Green for easy (0-100)
    } else if (numericRating >= 100 && numericRating < 200) {
      return warningColor; // Yellow for medium (100-200)
    } else if (numericRating >= 200 && numericRating <= 300) {
      return errorColor; // Red for hard (200-300)
    }
    return textColor; // Default for out of range
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: cardBackground,
          borderColor: cardBorder,
        },
        shadows.md,
        style,
      ]}
      activeOpacity={0.7}
      {...otherProps}
    >
      {/* Header Row: Title + Rating */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text 
            style={[styles.title, { color: textColor }]}
            numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rating !== undefined && (
          <Text style={[styles.rating, { color: getRatingColor() }]}>
            {rating}
          </Text>
        )}
      </View>

      {/* Body */}
      {body && (
        <Text
          style={[styles.body, { color: textSecondary }]}
          numberOfLines={3}
        >
          {body}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.md,
    margin: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginTop: spacing.xs,
  },
  rating: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
  },
  body: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.md,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
});
