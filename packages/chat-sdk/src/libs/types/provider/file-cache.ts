import { ObjectStringItemMix, ChooseFileInfo } from '../base';

/**
 * 文件缓存状态接口
 */
export interface FileCacheState {
  // 已上传的文件信息缓存
  cachedFiles: ObjectStringItemMix[];
  // 本地选择的文件信息缓存
  cachedLocalFiles: ChooseFileInfo[];
  // 上传中的文件信息
  uploadingFiles: ChooseFileInfo[];
  // 是否有未发送的文件
  hasPendingFiles: boolean;
}

/**
 * 文件缓存操作接口
 */
export interface FileCacheActions {
  // 添加已上传的文件
  addCachedFiles: (files: ObjectStringItemMix[]) => void;
  // 添加本地选择的文件
  addCachedLocalFiles: (files: ChooseFileInfo[]) => void;
  // 设置上传中的文件
  setUploadingFiles: (files: ChooseFileInfo[]) => void;
  // 清除所有缓存
  clearAllCache: () => void;
  // 清除已上传的文件缓存
  clearCachedFiles: () => void;
  // 清除本地文件缓存
  clearCachedLocalFiles: () => void;
  // 移除指定的文件
  removeFile: (fileId: string) => void;
  // 标记文件已发送
  markFilesAsSent: () => void;
}

/**
 * 文件缓存Store接口
 */
export type FileCacheStore = FileCacheState & FileCacheActions;