import { View } from 'react-native';
import { Colors } from '@/constants/theme';

interface ArcMotifProps {
  size?: number;
  opacity?: number;
}

const RINGS = [78, 66, 54, 42, 30];

export function ArcMotif({ size = 180, opacity = 1 }: ArcMotifProps) {
  const scale = size / 180;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, opacity, alignItems: 'center', justifyContent: 'center' }}>
      {RINGS.map((r, i) => {
        const scaled = r * scale;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              width: scaled * 2,
              height: scaled * 2,
              borderRadius: scaled,
              borderWidth: i === 0 ? 1 : 0.7,
              borderColor: Colors.gold,
              borderStyle: i % 2 === 0 ? 'solid' : 'dashed',
              opacity: 0.9 - i * 0.15,
            }}
          />
        );
      })}
      <View
        style={{
          width: 12 * scale,
          height: 12 * scale,
          borderRadius: 6 * scale,
          backgroundColor: Colors.gold,
          opacity: 0.7,
        }}
      />
    </View>
  );
}
