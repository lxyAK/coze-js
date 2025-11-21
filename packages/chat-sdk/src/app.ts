import { PropsWithChildren } from 'react';

import { useLaunch } from '@tarojs/taro';
import { logger } from '@/libs/utils';
import './app.less';

function App({ children }: PropsWithChildren<never>) {
  useLaunch(() => {
    console.log('App launched.');
    
    // 页面刷新后清除文件缓存
    try {
      // 清除名为'chat-sdk-file-cache'的localStorage项
      // 这是file-cache.ts中persist配置的name
      localStorage.removeItem('chat-sdk-file-cache');
      logger.debug('File cache cleared on app launch');
    } catch (error) {
      logger.error('Failed to clear file cache', error);
    }
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;
