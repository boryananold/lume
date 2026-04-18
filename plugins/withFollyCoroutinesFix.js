const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const FOLLY_FIX = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |build_config|
        settings = build_config.build_settings
        settings['GCC_PREPROCESSOR_DEFINITIONS'] ||= ['$(inherited)']
        unless settings['GCC_PREPROCESSOR_DEFINITIONS'].include?('FOLLY_CFG_NO_COROUTINES=1')
          settings['GCC_PREPROCESSOR_DEFINITIONS'] << 'FOLLY_CFG_NO_COROUTINES=1'
        end
        settings['SWIFT_STRICT_CONCURRENCY'] = 'minimal'
        settings['SWIFT_VERSION'] = '5'
      end
    end`;

module.exports = function withFollyCoroutinesFix(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let podfile = fs.readFileSync(podfilePath, 'utf8');

      // Disable gamma (new arch Fabric) mode in react-native-screens — not compatible with old arch
      podfile = podfile.replace(
        "ENV['RNS_GAMMA_ENABLED'] ||= '1'",
        "ENV['RNS_GAMMA_ENABLED'] ||= '0'"
      );

      if (!podfile.includes('FOLLY_CFG_NO_COROUTINES') || !podfile.includes('SWIFT_STRICT_CONCURRENCY')) {
        podfile = podfile.replace(
          '  post_install do |installer|',
          `  post_install do |installer|\n${FOLLY_FIX}`
        );
      }

      fs.writeFileSync(podfilePath, podfile);

      return config;
    },
  ]);
};
