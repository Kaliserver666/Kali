import JSZip from 'jszip';
import { JAVA_ANDROID_PROJECT_FILES } from './javaProjectFiles';

export class JavaZipExporter {
  static async exportJavaProjectZip(): Promise<Blob> {
    const zip = new JSZip();
    const rootFolder = zip.folder('vladimir-ai-aide-java');

    if (!rootFolder) {
      throw new Error('Failed to create root folder in ZIP');
    }

    for (const file of JAVA_ANDROID_PROJECT_FILES) {
      rootFolder.file(file.path, file.content);
    }

    // Add gradle wrapper properties and scripts
    rootFolder.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.1.1-bin.zip
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

  static triggerDownload(blob: Blob, filename = 'vladimir-ai-aide-java-project.zip') {
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
