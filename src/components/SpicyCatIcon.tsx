import Svg, { Circle, Path } from 'react-native-svg';

type TasteCatIconProps = {
  size?: number;
  color?: string;
};

export const tasteCatColors = {
  coffee: '#6E4B3A',
  spicy: '#D84C3F',
  sweets: '#F3D7C3',
  matcha: '#7C9A74',
  beer: '#D9B46A',
  seafood: '#6E8FA8',
  vegetable: '#6B7D3D',
} as const;

const DEFAULT_COLOR = tasteCatColors.spicy;

export function TasteCatIcon({ size = 64, color = DEFAULT_COLOR }: TasteCatIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      accessibilityRole="image"
    >
      <Path
        d="M22 22L16 16.5L18.5 27"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <Path
        d="M42 22L48 16.5L45.5 27"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <Path
        d="M20 31.5C20 39.5 25.2 45 32 45C38.8 45 44 39.5 44 31.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <Circle cx="26" cy="30.5" r="1.8" fill={color} />
      <Circle cx="38" cy="30.5" r="1.8" fill={color} />
      <Path
        d="M31 33.5H33"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Path
        d="M17 30.5H22"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Path
        d="M16.5 35H22"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Path
        d="M42 30.5H47"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Path
        d="M42 35H47.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
    </Svg>
  );
}

export function SpicyCatIcon(props: TasteCatIconProps) {
  return <TasteCatIcon {...props} color={props.color ?? tasteCatColors.spicy} />;
}

export function TasteBearIcon({ size = 64, color = DEFAULT_COLOR }: TasteCatIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      accessibilityRole="image"
    >
      <Circle
        cx="22"
        cy="21.5"
        r="5"
        stroke={color}
        strokeWidth="3.5"
      />
      <Circle
        cx="42"
        cy="21.5"
        r="5"
        stroke={color}
        strokeWidth="3.5"
      />
      <Path
        d="M18.5 30.5C18.5 40 24.2 46 32 46C39.8 46 45.5 40 45.5 30.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <Circle cx="27.5" cy="30.5" r="1.8" fill={color} />
      <Circle cx="36.5" cy="30.5" r="1.8" fill={color} />
      <Path
        d="M26.5 35.5C28.2 33.3 30.1 32.2 32 32.2C33.9 32.2 35.8 33.3 37.5 35.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Circle
        cx="32"
        cy="35"
        r="2.6"
        stroke={color}
        strokeWidth="3"
      />
      <Path
        d="M30 39.2L32 41L34 39.2"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
    </Svg>
  );
}

export function TasteDogIcon({ size = 64, color = DEFAULT_COLOR }: TasteCatIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      accessibilityRole="image"
    >
      <Path
        d="M23.5 25C19.5 22.5 17.8 18.8 18.6 15C22.2 17.2 24.6 20.8 25.2 24.8"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <Path
        d="M40.5 25C44.5 22.5 46.2 18.8 45.4 15C41.8 17.2 39.4 20.8 38.8 24.8"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <Path
        d="M20.5 30.5C20.5 39.8 25 46 32 46C39 46 43.5 39.8 43.5 30.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <Circle cx="27.5" cy="30.5" r="1.8" fill={color} />
      <Circle cx="36.5" cy="30.5" r="1.8" fill={color} />
      <Path
        d="M27.6 34.8C28.8 33.3 30.3 32.4 32 32.4C33.7 32.4 35.2 33.3 36.4 34.8"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Path
        d="M29.8 36.3C30.2 39.6 30.9 41.2 32 41.2C33.1 41.2 33.8 39.6 34.2 36.3"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3"
      />
      <Circle cx="32" cy="35.3" r="2.4" fill={color} />
      <Path
        d="M30 42.1C30.6 42.7 31.3 43 32 43C32.7 43 33.4 42.7 34 42.1"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.8"
      />
    </Svg>
  );
}

export function TasteRaccoonIcon({ size = 64, color = DEFAULT_COLOR }: TasteCatIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      accessibilityRole="image"
    >
      <Path
        d="M23 22L18.5 17L20 26"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <Path
        d="M41 22L45.5 17L44 26"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3.5"
      />
      <Path
        d="M22.5 30.5C25 28.5 28.1 27.5 32 27.5C35.9 27.5 39 28.5 41.5 30.5"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <Path
        d="M20 32C20 40 25 45 32 45C39 45 44 40 44 32"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="3.5"
      />
      <Circle cx="27" cy="31.5" r="1.8" fill={color} />
      <Circle cx="37" cy="31.5" r="1.8" fill={color} />
      <Circle cx="32" cy="35.5" r="2.5" fill={color} />
      <Path
        d="M29.5 39C30.2 40 31 40.6 32 40.6C33 40.6 33.8 40 34.5 39"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2.8"
      />
    </Svg>
  );
}
