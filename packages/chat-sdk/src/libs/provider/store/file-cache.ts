import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logger } from '@/libs/utils';
import { ObjectStringItemMix, ChooseFileInfo } from '@/libs/types';

interface FileCacheState {
  // 已上传的文件信息缓存
  cachedFiles: ObjectStringItemMix[];
  // 本地选择的文件信息缓存
  cachedLocalFiles: ChooseFileInfo[];
  // 上传中的文件信息
  uploadingFiles: ChooseFileInfo[];
  // 是否有未发送的文件
  hasPendingFiles: boolean;
}

interface FileCacheActions {
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

export type FileCacheStore = FileCacheState & FileCacheActions;

const createFileCacheStore = () => {
  return create<FileCacheStore>()(
    persist(
      (set) => ({
        cachedFiles: [],
        cachedLocalFiles: [],
        uploadingFiles: [],
        hasPendingFiles: false,
        
        addCachedFiles: (files: ObjectStringItemMix[]) => {
          logger.debug('FileCacheStore addCachedFiles', files);
          set(state => {
            // 添加去重逻辑，避免重复文件
            const existingFileIds = new Set(
              state.cachedFiles.map(file => file.file_id)
            );
            
            // 过滤掉已存在的文件
            const uniqueFiles = files.filter(
              file => !existingFileIds.has(file.file_id)
            );
            
            if (uniqueFiles.length === 0) {
              // 没有新文件需要添加
              return state;
            }
            
            return {
              cachedFiles: [...state.cachedFiles, ...uniqueFiles],
              hasPendingFiles: true
            };
          });
        },
        
        addCachedLocalFiles: (files: ChooseFileInfo[]) => {
          logger.debug('FileCacheStore addCachedLocalFiles', files);
          set(state => ({
            cachedLocalFiles: [...state.cachedLocalFiles, ...files],
            hasPendingFiles: true
          }));
        },
        
        setUploadingFiles: (files: ChooseFileInfo[]) => {
          logger.debug('FileCacheStore setUploadingFiles', files);
          set({ uploadingFiles: files });
        },
        
        clearAllCache: () => {
          logger.debug('FileCacheStore clearAllCache');
          set({
            cachedFiles: [],
            cachedLocalFiles: [],
            uploadingFiles: [],
            hasPendingFiles: false
          });
        },
        
        clearCachedFiles: () => {
          logger.debug('FileCacheStore clearCachedFiles');
          set({ cachedFiles: [] });
        },
        
        clearCachedLocalFiles: () => {
          logger.debug('FileCacheStore clearCachedLocalFiles');
          set({ cachedLocalFiles: [] });
        },
        
        removeFile: (fileId: string) => {
          logger.debug('FileCacheStore removeFile', fileId);
          set(state => {
            const newCachedFiles = state.cachedFiles.filter(
              file => file.file_id !== fileId
            );
            return {
              cachedFiles: newCachedFiles,
              hasPendingFiles: newCachedFiles.length > 0 || state.cachedLocalFiles.length > 0
            };
          });
        },
        
        markFilesAsSent: () => {
          logger.debug('FileCacheStore markFilesAsSent');
          set({ hasPendingFiles: false });
        }
      }),
      {
        name: 'chat-sdk-file-cache',
        partialize: (state) => ({
          cachedFiles: state.cachedFiles,
          hasPendingFiles: state.hasPendingFiles
        })
      }
    )
  );
};

export type CreateFileCacheStore = ReturnType<typeof createFileCacheStore>;

export const useCreateFileCacheStore = () => {
  return createFileCacheStore();
};