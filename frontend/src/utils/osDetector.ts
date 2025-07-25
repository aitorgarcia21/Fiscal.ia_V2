export const detectOS = (): string => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const macosPlatforms = /(macintosh|macintel|macppc|mac68k|macos|mac os x)/i;
  const windowsPlatforms = /(win32|win64|windows|wince)/i;
  const linuxPlatforms = /(linux|ubuntu|debian|fedora|redhat|suse)/i;

  if (macosPlatforms.test(userAgent)) {
    return 'macos';
  } else if (windowsPlatforms.test(userAgent)) {
    return 'windows';
  } else if (linuxPlatforms.test(userAgent)) {
    return 'linux';
  }
  
  return 'unknown';
};

export const getDownloadLink = (os: string): string => {
  const baseUrl = 'https://fiscal-ia-v2-production.up.railway.app/downloads';
  
  switch (os.toLowerCase()) {
    case 'macos':
      return `${baseUrl}/Francis-1.0.0.dmg`;
    case 'windows':
      return `${baseUrl}/Francis-Setup-1.0.0.exe`;
    case 'linux':
      return `${baseUrl}/Francis-1.0.0.AppImage`;
    default:
      return '/telecharger';
  }
};
