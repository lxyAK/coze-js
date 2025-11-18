# UniApp Coze API SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Coze](https://www.coze.com)（或[扣子](https://www.coze.cn)）API平台的官方[UniApp](https://uniapp.dcloud.net.cn/) SDK。

## 快速开始

### 1. 安装

```sh
npm install @coze/uniapp-api @lxyak/api axios reconnecting-websocket
# or
pnpm install @coze/uniapp-api @lxyak/api axios reconnecting-websocket
```

### 2. 基本用法

```javascript
import { COZE_COM_BASE_URL, RoleType, ChatStatus } from '@lxyak/api';
import { CozeAPI } from '@coze/uniapp-api';

// 使用个人访问令牌初始化客户端
const client = new CozeAPI({
  token: 'your_pat_token', // 从 https://www.coze.com/open/oauth/pats 获取你的PAT
  baseURL: COZE_COM_BASE_URL,
});

// 简单聊天示例
async function quickChat() {
  try {
    const v = await client.chat.createAndPoll({
      bot_id: 'your_bot_id',
      additional_messages: [
        {
          role: RoleType.User,
          content: '你好！',
          content_type: 'text',
        },
      ],
    });

    if (v.chat.status === ChatStatus.COMPLETED) {
      for (const item of v.messages) {
        console.log('[%s]:[%s]:%s', item.role, item.type, item.content);
      }
      console.log('usage', v.chat.usage);
    }
  } catch (error) {
    console.error('聊天错误:', error);
    throw error;
  }
}
```

## 主要特点

- 🌐 **一致性API**: 与[Coze-JS](../coze-js/README.md)保持一致的API
- 🔄 **流式支持**: 兼容字节跳动小程序/微信小程序/H5

## 高级用法

### 流式聊天

```javascript
import { ChatEventType } from '@lxyak/api';
import { CozeAPI } from '@coze/uniapp-api';

async function streamChat() {
  const stream = await client.chat.stream({
    bot_id: 'your_bot_id',
    additional_messages: [
      {
        role: RoleType.User,
        content: '你好！',
        content_type: 'text',
      },
    ],
  });

  for await (const part of stream) {
    if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
      console.log(part.data.content); // 实时响应
    }
  }
}
```

### 刷新令牌

```javascript
import { COZE_COM_BASE_URL } from '@lxyak/api';
import { CozeAPI } from '@coze/uniapp-api';

const client = new CozeAPI({
  token: 'your_pat_token', // https://www.coze.com/open/oauth/pats
  baseURL: COZE_COM_BASE_URL,
  onBeforeAPICall: () => {
    return { token: 'your_new_pat_token' };
  },
});
```

### 中止流式聊天

```javascript
import { ChatEventType } from '@lxyak/api';
import { CozeAPI, AbortController } from '@coze/uniapp-api';

async function streamChat() {
  const controller = new AbortController();
  setTimeout(() => {
    controller.abort();
  }, 10);

  const stream = await client.chat.stream({
    bot_id: 'your_bot_id',
    additional_messages: [
      {
        role: RoleType.User,
        content: '你好！',
        content_type: 'text',
      },
    ],
  }, {
    signal: controller.signal,
  });

  for await (const part of stream) {
    if (part.event === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
      console.log(part.data.content); // 实时响应
    }
  }
}
```

## 3. WebSocket 客户端

### 3.1 WsChatClient

`WsChatClient` 提供了实时语音聊天功能，支持双向语音交互。

```typescript
import type {
  ConversationMessageCompletedEvent,
  ConversationMessageDeltaEvent,
} from '@lxyak/api';
import { WsChatClient, WsChatEventNames } from '@coze/uniapp-api/ws-tools';

// 创建实例
const chatClient = new WsChatClient({
  token: 'your_api_key',
  botId: 'your_bot_id',
  // 可选：默认是否静音
  audioMutedDefault: false,
  // 可选：是否静音播放
  playbackMutedDefault: false,
  // 可选：语音 ID
  voiceId: 'voice_id',
});

// 监听事件
chatClient.on(WsChatEventNames.CONNECTED, event => {
  console.log('连接成功', event);
});

chatClient.on(WsChatEventNames.CONVERSATION_MESSAGE_DELTA, (_, data) => {
  const event = data as ConversationMessageDeltaEvent;
  console.log('收到delta消息', event.data.content);
});

chatClient.on(WsChatEventNames.CONVERSATION_MESSAGE_COMPLETED, (_, data) => {
  const event = data as ConversationMessageCompletedEvent;
  console.log('收到完成消息', event.data.content);
});

chatClient.on(WsChatEventNames.DISCONNECTED, () => {
  console.log('连接断开');
});

// 连接服务器
await chatClient.connect();

// 发送文本消息
chatClient.sendTextMessage('你好，Coze');

// 开启/关闭麦克风（仅适用于服务端判停模式）
await chatClient.setAudioEnable(true); // 开启麦克风
await chatClient.setAudioEnable(false); // 关闭麦克风

// 中断对话
chatClient.interrupt();

// 设置播放音量
chatClient.setPlaybackVolume(0.5);

// 获取播放音量
chatClient.getPlaybackVolume();

// 断开连接
await chatClient.disconnect();

```

#### 客户端判停模式

在客户端判停模式下，需要手动控制录音的开始和结束：

```typescript
// 开始录音
chatClient.startRecord();

// 结束录音
chatClient.stopRecord();
```

### 3.2 WsSpeechClient

`WsSpeechClient` 提供文本转语音功能，支持实时流式播放。

```typescript
import { WsSpeechClient } from '@coze/uniapp-api/ws-tools';

// 创建实例
const speechClient = new WsSpeechClient({
  token: 'your_api_key',
});

// 监听所有事件
speechClient.on('data', data => {
  console.log('收到数据', data);
});
speechClient.on('completed', () => {
  console.log('语音播放完成');
});
speechClient.on('error', error => {
  console.log('语音播放错误', error);
});

// 连接服务器并配置语音参数
await speechClient.connect({
  voiceId: 'voice_id_here', // 可选：指定语音 ID
  speechRate: 0, // 可选：语音速率，范围 -50 到 100，默认 0
});

// 添加文本并立即开始转换和播放
speechClient.appendAndComplete('你好，这是一段测试语音');

// 或者分步操作
speechClient.append('你好，');
speechClient.append('这是分段添加的文本。');
speechClient.complete(); // 完成添加并开始处理

// 控制播放
await speechClient.pause(); // 暂停
await speechClient.resume(); // 继续
await speechClient.togglePlay(); // 切换播放/暂停状态

// 检查播放状态
const isPlaying = speechClient.isPlaying();

// 中断当前播放
await speechClient.interrupt();

// 断开连接
await speechClient.disconnect();

```

### 3.3 WsTranscriptionClient

`WsTranscriptionClient` 提供语音转文本功能，支持实时转写。

```typescript
import {
  WebsocketsEventType,
  type CommonErrorEvent,
  type TranscriptionsMessageCompletedEvent,
  type TranscriptionsMessageUpdateEvent,
} from '@lxyak/api';
import { WsTranscriptionClient } from '@coze/uniapp-api/ws-tools';

// 创建实例
const transcriptionClient = new WsTranscriptionClient({
  token: 'your_api_key',
});

// 监听事件
transcriptionClient.on(
  WebsocketsEventType.TRANSCRIPTIONS_MESSAGE_UPDATE,
  data => {
    const event = data as TranscriptionsMessageUpdateEvent;
    console.log('实时转写结果', event.data.content);
  },
);
// 监听转写结束事件
transcriptionClient.on(
  WebsocketsEventType.TRANSCRIPTIONS_MESSAGE_COMPLETED,
  data => {
    const event = data as TranscriptionsMessageCompletedEvent;
    console.log('实时转写结束', event.data.content);
  },
);

// 监听错误事件
transcriptionClient.on(WebsocketsEventType.ERROR, data => {
  const event = data as CommonErrorEvent;
  console.log('转写错误', event.data.msg);
});

// 开始录音和转写
await transcriptionClient.start();

// 获取当前状态 ('recording', 'paused', 或 'ended')
const status = transcriptionClient.getStatus();

// 暂停录音（保持上下文）
transcriptionClient.pause();

// 恢复录音
transcriptionClient.resume();

// 停止录音并完成转写
transcriptionClient.stop();

// 清理资源并关闭连接
transcriptionClient.destroy();

```

## 尝试示例

```bash
cd examples/coze-js-uniapp
cp .env.development .env.local # 编辑 .env.local 填入你的凭证
npm run run-preinstall # 务必先执行
npm install
npm run dev:h5
npm run dev:mp-weixin # 微信小程序
```

## 文档

访问以下链接获取详细的API文档和指南：

- [API 概述](https://www.coze.com/docs/developer_guides/api_overview)
- [认证指南](https://www.coze.com/docs/developer_guides/authentication)
