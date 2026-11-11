import { PERSON_ID } from './metadata';

/**
 * Software as a thing, not only a page: schema.org nodes for the case studies
 * that are products. Public code gets codeRepository; private work is a
 * SoftwareApplication with no download or code link.
 *
 * KeepMeAwake's version is the released one on the day of the issue. Check
 * https://github.com/ax5hay/KeepMeAwake/releases and update it on each issue.
 */
type Thing = Record<string, unknown>;

const KEEPMEAWAKE_VERSION = '0.5.0';

export const SOFTWARE: Record<string, Thing[]> = {
  'keepmeawake-tray-app': [
    {
      '@type': 'SoftwareApplication',
      name: 'KeepMeAwake',
      description:
        'A Windows and macOS tray app that keeps a laptop awake through a Windows power request or an IOKit power assertion, instead of faking keystrokes.',
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Windows 10, Windows 11, macOS 12 or later',
      softwareVersion: KEEPMEAWAKE_VERSION,
      downloadUrl: 'https://github.com/ax5hay/KeepMeAwake/releases',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      author: { '@id': PERSON_ID },
    },
    {
      '@type': 'SoftwareSourceCode',
      name: 'KeepMeAwake',
      codeRepository: 'https://github.com/ax5hay/KeepMeAwake',
      programmingLanguage: ['Rust', 'TypeScript', 'Svelte'],
      runtimePlatform: 'Tauri 2',
      author: { '@id': PERSON_ID },
    },
  ],
  'rebo-reports-in-plain-words': [
    {
      '@type': 'SoftwareApplication',
      name: 'ReBo',
      description:
        'A self-learning reports bot for any SQL database: one read-only query per question, behind five independent walls against a write.',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Linux container',
      author: { '@id': PERSON_ID },
    },
  ],
  'flowstate-offline-video-analytics': [
    {
      '@type': 'SoftwareApplication',
      name: 'FlowState',
      description:
        'Offline video analytics: fifteen detectors over files, webcams or RTSP cameras, fused into one 0 to 100 threat index, shipped air-gapped.',
      applicationCategory: 'SecurityApplication',
      operatingSystem: 'Windows, Linux',
      author: { '@id': PERSON_ID },
    },
  ],
};
