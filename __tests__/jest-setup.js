// Prevent Expo winter runtime (SDK 54) from throwing in jest node environment
if (typeof global.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(global, '__ExpoImportMetaRegistry', {
    value: {},
    configurable: true,
    writable: true,
  });
}
