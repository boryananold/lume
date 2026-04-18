import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { Scale } from '@/components/ui/Scale';
import { Card } from '@/components/ui/Card';
import { Colors, Fonts, FontSizes, Radius, Spacing, TextStyles } from '@/constants/theme';
import type { MoodLevel, EnergyLevel, StressLevel } from '@/types/api';

// Acceptance criteria: __tests__/acceptance/daily-check-in.test.ts
// - Mood / energy / stress all show a 1-5 scale
// - Sleep hours accepts 0-12 numeric input
// - "Generate my ritual" disabled until mood + energy + stress + sleep all set
// - On submit, routes to /ritual with the check-in data

export default function CheckInScreen() {
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [stress, setStress] = useState<StressLevel | null>(null);
  const [sleepHours, setSleepHours] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  const sleepNum = Number(sleepHours);
  const sleepValid = sleepHours !== '' && sleepNum >= 0 && sleepNum <= 12;
  const canSubmit = mood !== null && energy !== null && stress !== null && sleepValid;

  async function handleCameraPress() {
    setCameraError(null);
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        setCameraError('Camera access is needed to capture your skin photo.');
        return;
      }
    }
    setShowCamera(true);
  }

  async function handleCapture() {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
      if (photo?.uri) {
        setPhotoUri(photo.uri);
        setShowCamera(false);
        setCameraError(null);
      }
    } catch {
      setCameraError('Could not capture photo. Please try again.');
    }
  }

  function handleSubmit() {
    if (!canSubmit || mood === null || energy === null || stress === null) return;
    router.push({
      pathname: '/ritual',
      params: {
        mood: String(mood),
        energy: String(energy),
        stress: String(stress),
        sleepHours,
        notes,
        photoUri: photoUri ?? '',
      },
    });
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.cameraControls}>
            <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraBtn}>
              <Text style={styles.cameraBtnText}>✕ Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCapture} style={styles.captureBtn}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setFacing((f) => f === 'front' ? 'back' : 'front')} style={styles.cameraBtn}>
              <Text style={styles.cameraBtnText}>⟳ Flip</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={[TextStyles.display2, styles.title]}>Good morning.</Text>
        <Text style={[TextStyles.body, styles.subtitle]}>Let's tune today's ritual to you.</Text>
      </View>

      <Card style={styles.section}>
        <Scale
          label="How's your mood?"
          value={mood}
          onChange={(n) => setMood(n as MoodLevel)}
          lowLabel="Flat"
          highLabel="Lit up"
        />
        <Scale
          label="Energy"
          value={energy}
          onChange={(n) => setEnergy(n as EnergyLevel)}
          lowLabel="Depleted"
          highLabel="Bright"
        />
        <Scale
          label="Stress"
          value={stress}
          onChange={(n) => setStress(n as StressLevel)}
          lowLabel="Calm"
          highLabel="Stretched"
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.inputLabel}>Hours of sleep</Text>
        <TextInput
          style={styles.input}
          value={sleepHours}
          onChangeText={setSleepHours}
          keyboardType="number-pad"
          placeholder="e.g. 7.5"
          placeholderTextColor={Colors.textMuted}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.inputLabel}>Skin photo (optional)</Text>
        {photoUri ? (
          <View style={styles.photoPreview}>
            <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="cover" />
            <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removePhoto}>
              <Text style={styles.removePhotoText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={handleCameraPress} style={styles.cameraTrigger}>
            <Text style={styles.cameraTriggerText}>📷  Capture today's skin</Text>
          </TouchableOpacity>
        )}
      </Card>

      {cameraError ? (
        <Text style={styles.cameraError}>{cameraError}</Text>
      ) : null}

      <Card style={styles.section}>
        <Text style={styles.inputLabel}>Anything else on your mind? (optional)</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="A word, a feeling, a thought..."
          placeholderTextColor={Colors.textMuted}
        />
      </Card>

      <Button
        label="Generate my ritual"
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={styles.cta}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  cta: {
    marginTop: Spacing.md,
  },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cameraBtn: { padding: Spacing.md },
  cameraBtnText: { color: '#fff', fontFamily: Fonts.bodySemiBold, fontSize: FontSizes.md },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  photoPreview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  previewImage: { width: 80, height: 80, borderRadius: Radius.md },
  removePhoto: { paddingHorizontal: Spacing.sm },
  removePhotoText: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.sm, color: Colors.textSecondary },
  cameraTrigger: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  cameraTriggerText: { fontFamily: Fonts.bodyRegular, fontSize: FontSizes.md, color: Colors.textSecondary },
  cameraError: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.error,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.xs,
  },
});
