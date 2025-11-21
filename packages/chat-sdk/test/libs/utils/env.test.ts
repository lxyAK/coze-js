import { describe, expect, test } from 'vitest';

import { getRegionApi, Region } from '../../../src/libs/utils/env';

// 本地调试的url
describe('utils/env', () => {
  test('getRegionApi', () => {
    const url = getRegionApi(Region.OVERSEA);
    // expect(url).toBe('http://1.95.127.205:8888');
    expect(url).toBe('http://api.coze.cn');

    const url2 = getRegionApi(Region.CN);
    // expect(url2).toBe('http://1.95.127.205:8888');
    expect(url2).toBe('https://api.coze.cn');
  });
});
