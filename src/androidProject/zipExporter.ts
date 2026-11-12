import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from './projectFiles';

export class ZipExporter {
  static async exportProjectZip(): Promise<Blob> {
    const zip = new JSZip();
    const rootFolder = zip.folder('vladimir-ai-android');

    if (!rootFolder) {
      throw new Error('Failed to create root folder in ZIP');
    }

    // Add each project file into the ZIP archive preserving relative directory paths
    for (const file of ANDROID_PROJECT_FILES) {
      rootFolder.file(file.path, file.content);
    }

    // Also add gradlew mock and wrapper properties
    rootFolder.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.11.1-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

    rootFolder.file('gradlew', `#!/usr/bin/env sh
exec gradle "$@"
`);

    rootFolder.file('gradlew.bat', `@rem Gradle wrapper batch script
@gradle %*
`);

    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    return blob;
  }

  static triggerDownload(blob: Blob, filename = 'vladimir-ai-android-project.zip') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}
