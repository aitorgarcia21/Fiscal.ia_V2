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
  // Liens temporaires vers les fichiers locaux (à remplacer par un serveur de fichiers)
  const localPath = '/Users/aitorgarcia/Fiscal.ia_V2/desktop-app/dist/mac';
  
  switch (os.toLowerCase()) {
    case 'macos':
      // Pour l'instant, rediriger vers la page de téléchargement avec instructions
      return '/telecharger?os=macos&info=local';
    case 'windows':
      return '/telecharger?os=windows&info=build-needed';
    case 'linux':
      return '/telecharger?os=linux&info=build-needed';
    default:
      return '/telecharger';
  }
};
