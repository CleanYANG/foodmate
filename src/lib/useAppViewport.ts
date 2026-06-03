import { Platform, useWindowDimensions } from 'react-native';

const MOBILE_FRAME_WIDTH = 430;
const MOBILE_FRAME_HEIGHT = 920;
const WEB_FRAME_BREAKPOINT = MOBILE_FRAME_WIDTH + 120;
const WEB_FRAME_VERTICAL_MARGIN = 32;

export function useAppViewport() {
  const { width, height } = useWindowDimensions();
  const isWebDesktop = Platform.OS === 'web' && width >= WEB_FRAME_BREAKPOINT;

  return {
    width: isWebDesktop ? MOBILE_FRAME_WIDTH : width,
    height: isWebDesktop
      ? Math.min(Math.max(height - WEB_FRAME_VERTICAL_MARGIN, 0), MOBILE_FRAME_HEIGHT)
      : height,
    isWebDesktop,
  } as const;
}

export const appViewport = {
  mobileFrameWidth: MOBILE_FRAME_WIDTH,
  mobileFrameHeight: MOBILE_FRAME_HEIGHT,
} as const;
