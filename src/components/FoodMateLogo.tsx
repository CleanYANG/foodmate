import { Platform } from 'react-native';
import Svg, { Ellipse, Line, Path, Text as SvgText } from 'react-native-svg';

type FoodMateLogoProps = {
  width?: number | string;
  height?: number | string;
  showText?: boolean;
  color?: string;
  accentColor?: string;
};

const DEFAULT_COLOR = '#4A2E22';
const DEFAULT_ACCENT = '#E2B441';

const chineseFontFamily = Platform.select({
  ios: 'PingFang SC',
  android: 'sans-serif-medium',
  default: 'system-ui',
});

const englishFontFamily = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'system-ui',
});

export function FoodMateLogo({
  width = 240,
  height = 260,
  showText = true,
  color = DEFAULT_COLOR,
  accentColor = DEFAULT_ACCENT,
}: FoodMateLogoProps) {
  const viewBoxHeight = showText ? 300 : 150;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 320 ${viewBoxHeight}`}
      fill="none"
      accessibilityRole="image"
    >
      <Line
        x1="82"
        y1="32"
        x2="152"
        y2="98"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="7"
      />
      <Line
        x1="66"
        y1="46"
        x2="141"
        y2="109"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="7"
      />

      <Path
        d="M237 33L197 74"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="7"
      />
      <Path
        d="M194 77L174 99"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <Path
        d="M203 84L183 106"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <Path
        d="M212 91L192 112"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <Path
        d="M173 99C180 91 188 89 195 94C201 98 201 106 195 113L187 122"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />

      <Path
        d="M108 118C143 138 180 138 214 118"
        stroke={color}
        strokeLinecap="round"
        strokeWidth="7"
      />

      <Ellipse cx="160" cy="97" rx="6.5" ry="5.5" fill={accentColor} />

      {showText ? (
        <>
          <SvgText
            x="160"
            y="204"
            fill={color}
            fontFamily={chineseFontFamily}
            fontSize="46"
            fontWeight="600"
            letterSpacing="1.2"
            textAnchor="middle"
          >
            饭搭子
          </SvgText>
          <SvgText
            x="160"
            y="252"
            fill={color}
            fillOpacity="0.8"
            fontFamily={englishFontFamily}
            fontSize="18"
            fontWeight="400"
            letterSpacing="4.5"
            textAnchor="middle"
          >
            fooMate
          </SvgText>
        </>
      ) : null}
    </Svg>
  );
}
