export enum Region {
  OVERSEA = 'oversea',
  CN = 'cn',
}

export const getRegionApi = (region?: Region) => {
  switch (region) {
    case 'oversea':
      return 'http://1.95.127.205:8888';
    default: {
      // return 'http://1.95.127.205:8888';
      return 'https://ai.cs4pl.com';
    }
  }
};
