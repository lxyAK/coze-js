# 如何发布

## 前提条件

- [Rush](https://rushjs.io/pages/getting_started/setup_rush/)
- [Rush X](https://rushjs.io/pages/getting_started/setup_rush_x/)
- 您拥有向 [coze-dev/coze-js](https://github.com/coze-dev/coze-js) 仓库推送的权限
- 对于官方发布（补丁/小版本/大版本），必须从 `main` 分支发布

## 命令

### `rush pub`

用于发布软件包版本的命令，支持多种发布策略和版本升级方式。

bash
rush pub [选项]


#### 选项

- `-v, --version <版本号>`: 指定要发布的版本号
- `-b, --bump-type <类型>`: 版本升级类型，支持以下选项：
  - `alpha`: Alpha 预发布版本（例如，1.0.0-alpha.abc123）
  - `beta`: Beta 预发布版本（例如，1.0.0-beta.1）
  - `patch`: 用于修复 bug 的补丁版本（例如，1.0.0 -> 1.0.1）
  - `minor`: 用于新增功能的小版本（例如，1.0.0 -> 1.1.0）
  - `major`: 用于破坏性变更的大版本（例如，1.0.0 -> 2.0.0）
- `-t, --to <包...>`: 发布指定的包及其下游依赖
- `-f, --from <包...>`: 发布指定的包及其上游/下游依赖
- `-o, --only <包...>`: 仅发布指定的包
- `-d, --dry-run`: 测试运行模式，不实际执行
- `-s, --skip-commit`: 跳过 Git 提交步骤

### 发布流程

1. **选择发布范围**
   - 使用 `--to` 发布指定包及其下游依赖
   - 使用 `--from` 发布指定包及其上游/下游依赖
   - 使用 `--only` 仅发布指定包

2. **版本升级**
   - 指定版本：使用 `--version` 参数
   - 指定升级类型：使用 `--bump-type` 参数
   - 交互式选择：当两个参数都未指定时，会提示选择升级类型

3. **确认发布**
   - 显示将要发布的包及版本变更
   - 请求用户确认是否继续

4. **执行发布**
   - 更新 package.json 中的版本号
   - 生成更新日志
   - 创建发布分支
   - 将变更提交到 Git

#### 示例

bash
发布单个包

rush pub --only @scope/package-name

发布包及其下游依赖

rush pub --to @scope/package-name

发布指定版本

rush pub --only @scope/package-name --version 1.0.0

发布 beta 版本

rush pub --only @scope/package-name --bump-type beta

测试运行模式

rush pub --only @scope/package-name --dry-run


#### 注意事项

1. 确保该命令在 Rush monorepo 根目录下执行
2. 需要有创建分支和提交的相应 Git 权限
3. 预发布版本（alpha/beta）将跳过更新日志生成
4. 在发布前会自动验证包的发布配置（shouldPublish）
5. 该命令会修改文件并创建新分支，但 **您需要手动将分支推送到远程仓库，然后创建一个拉取请求**。


您可以将上述内容直接复制并保存为 PUBLISH_GUIDE.md 或其他您喜欢的文件名。文件格式和内容完全保留了原始 Markdown 格式，包括代码块、列表和标题等结构。
