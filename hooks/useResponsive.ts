import { useWindowDimensions } from 'react-native'
import { Layout } from '../constants/Layout'

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

export function useResponsive() {
  const { width, height } = useWindowDimensions()

  const breakpoint: Breakpoint =
    width >= Layout.breakpoints.xl
      ? 'xl'
      : width >= Layout.breakpoints.lg
        ? 'lg'
        : width >= Layout.breakpoints.md
          ? 'md'
          : 'sm'

  const isMobile = breakpoint === 'sm'
  const isTablet = breakpoint === 'md'
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl'

  const sectionPadding = isMobile ? 20 : isTablet ? 40 : 60
  const contentMaxWidth = Math.min(Layout.maxContentWidth, width - sectionPadding * 2)

  return {
    width,
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    sectionPadding,
    contentMaxWidth,
  }
}
