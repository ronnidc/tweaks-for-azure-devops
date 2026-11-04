import { describe, expect, it } from 'vitest';
import { addedSites, isCloudHost, siteOrigin, sitePattern } from './sites';

describe('siteOrigin', () => {
  it.each([
    ['azure.example.com', 'https://azure.example.com'],
    ['  https://azure.example.com/tfs/DefaultCollection/Project/_sprints/taskboard ', 'https://azure.example.com'],
    ['http://tfs:8080/tfs', 'http://tfs:8080'],
    ['HTTPS://Azure.Example.com', 'https://azure.example.com'],
  ])('%s → %s', (input, origin) => {
    expect(siteOrigin(input)).toBe(origin);
  });

  it.each(['', '   ', 'ftp://files.example.com', 'not a host', 'not%20a%20host', 'https://', '-bad-.example.com', 'host_name'])(
    'rejects %j',
    (input) => {
      expect(siteOrigin(input)).toBeNull();
    },
  );
});

describe('sitePattern', () => {
  it('asks for the whole site', () => {
    expect(sitePattern('https://azure.example.com')).toBe('https://azure.example.com/*');
    expect(sitePattern('http://tfs:8080')).toBe('http://tfs:8080/*');
  });
});

describe('addedSites', () => {
  it('lists what the browser granted, by host, and leaves the cloud out', () => {
    expect(
      addedSites([
        'https://dev.azure.com/*',
        'https://dev.azure.com/*/_sprints/*',
        'https://kudo.visualstudio.com/*',
        'https://azure.fiu.dk/*',
        'http://tfs:8080/*',
      ]),
    ).toEqual([
      { pattern: 'https://azure.fiu.dk/*', host: 'azure.fiu.dk' },
      { pattern: 'http://tfs:8080/*', host: 'tfs:8080' },
    ]);
  });

  it('knows the cloud by its hosts', () => {
    expect(isCloudHost('dev.azure.com')).toBe(true);
    expect(isCloudHost('kudo.visualstudio.com')).toBe(true);
    expect(isCloudHost('azure.fiu.dk')).toBe(false);
  });
});
