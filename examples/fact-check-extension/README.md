# 事实核查扩展

一个用于新闻和信息事实核查的浏览器扩展。该扩展允许用户直接在浏览器中快速验证新闻或陈述的真实性，无论是通过在网页上选中文本，还是在扩展弹窗中输入/粘贴文本。

## 功能

- **核查任意文本**：在任意网页上选中文本，右键点击并选择"事实核查"即可验证其真实性。
- **弹窗输入**：可在扩展弹窗中直接粘贴或输入文本，立即进行事实核查。
- **Markdown 渲染**：结果以基础 markdown 格式展示。
- **设置面板**：可在弹窗中配置扩展选项。
- **支持所有网站**：通过内容脚本可在任意页面使用。

## 快速下载

你可以直接下载最新打包的扩展（用于手动安装）：

👉 [下载 fact-check-extension.zip](./fact-check-extension.zip)

> 解压后，按照下方"安装方法"手动加载到浏览器。

## 安装方法

### 1. 从 ZIP 安装（手动）

1. [下载 ZIP 文件](./fact-check-extension.zip) 或在本目录中找到它。
2. 将文件解压到本地文件夹。
3. 打开浏览器的扩展页面（如 `chrome://extensions/`）。
4. 启用"开发者模式"。
5. 点击"加载已解压的扩展程序"，选择解压后的文件夹。
6. 事实核查扩展将出现在你的浏览器中。

### 2. 源码构建

1. 克隆本仓库并进入 `examples/fact-check-extension` 目录。
2. 安装依赖：
   ```bash
   npm run run-preinstall
   npm install
   npm run start
   ```
3. 构建扩展：
   ```bash
   npm run build
   ```
4. 构建输出在 `dist/` 文件夹。你可以将其压缩用于分发：
   ```bash
   npm run zip
   ```
5. 在浏览器中以未打包扩展的方式加载 `dist/` 文件夹。

## 开发

- 启动开发服务器（用于弹窗 UI 热重载）：
  ```bash
  npm run start
  ```
- 代码检查（Lint）：
  ```bash
  npm run lint
  ```

## 项目结构

- `src/popup/` — 弹窗 UI（React, Ant Design）
- `src/background/` — 后台服务 worker
- `src/content/` — 注入网页的内容脚本
- `public/manifest.json` — Chrome 扩展清单
- `public/icons/` — 扩展图标

## 权限

该扩展请求以下权限：
- `activeTab`、`storage`、`contextMenus`、`identity`
- 内容脚本在所有网址上运行（`<all_urls>`）
- 主机权限：`https://*/*`、`http://*/*`

## 依赖

- React, ReactDOM
- Ant Design
- @ant-design/icons
- @lxyak/api
- Vite（构建工具）
- TypeScript

