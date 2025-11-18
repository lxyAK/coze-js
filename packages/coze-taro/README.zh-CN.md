# Taro Coze API SDK

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | 简体中文

[Coze](https://www.coze.com)（或[扣子](https://www.coze.cn)）API 平台的官方 [Taro](https://docs.taro.zone/docs/) SDK。

## 快速开始

### 1. 安装

```sh
npm install @coze/taro-api @lxyak/api
# 或
pnpm install @coze/taro-api @lxyak/api
```

### 2. 基本用法

```javascript
import { COZE_COM_BASE_URL, RoleType, ChatStatus } from '@lxyak/api';
import { CozeAPI } from '@coze/taro-api';

// 使用个人访问令牌初始化客户端
const client = new CozeAPI({
  token: 'your_pat_token', // 从 https://www.coze.com/open/oauth/pats 获取你的 PAT
  baseURL: COZE_COM_BASE_URL,
});

// 简单对话示例
async function quickChat() {
  try {
    const v = await client.chat.createAndPoll({
      bot_id: 'your_bot_id',
      additional_messages: [
        {
          role: RoleType.User,
          content: 'Hello!',
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
    console.error('对话错误:', error);
    throw error;
  }
}
```

## 主要特性

- 🌐 **一致的 API**：与 [Coze-JS](../coze-js/README.md) 保持一致的 API
- 🔄 **流式响应支持**：兼容字节小程序/微信小程序/H5

## 高级用法

### 流式对话

```javascript
import { ChatEventType } from '@lxyak/api';
import { CozeAPI } from '@coze/taro-api';

async function streamChat() {
  const stream = await client.chat.stream({
    bot_id: 'your_bot_id',
    additional_messages: [
      {
        role: RoleType.User,
        content: 'Hello!',
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
import { CozeAPI } from '@coze/taro-api';

const client = new CozeAPI({
  token: 'your_pat_token', // https://www.coze.com/open/oauth/pats
  baseURL: COZE_COM_BASE_URL,
  onBeforeAPICall: () => {
    return { token: 'your_new_pat_token' };
  },
});
```

### 中断流式对话

```javascript
import { ChatEventType } from '@lxyak/api';
import { CozeAPI, AbortController } from '@coze/taro-api';

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
        content: 'Hello!',
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

## 尝试示例

```bash
cd examples/coze-js-taro
cp .env.development .env.local # 编辑 .env.local 填入你的凭证
npm run dev:weapp
```

## 注意事项
### Taro@3 + React
需要以下配置：

```javascript
export default defineConfig(() => {
  compiler: {
    type: 'webpack5',
    prebundle: {
      // 1. 不要预打包 '@coze/taro-api'
      exclude: ['@coze/taro-api'],
    },
  },

  mini: {
    webpackChain(chain) {
      // 2. 为 '@coze/taro-api' 启用多平台支持
      chain.resolve.plugin('MultiPlatformPlugin').tap(args => {
        args[2]['include'] = ['@coze/taro-api'];
        return args;
      });
    },
  },

  h5: {
    webpackChain(chain) {
      // 2. 为 '@coze/taro-api' 启用多平台支持
      chain.resolve.plugin('MultiPlatformPlugin').tap(args => {
        args[2]['include'] = ['@coze/taro-api'];
        return args;
      });
    },
  }
});
```

## 文档

详细的 API 文档和指南，请访问：

- [API 概览](https://www.coze.com/docs/developer_guides/api_overview)
- [认证指南](https://www.coze.com/docs/developer_guides/authentication)
