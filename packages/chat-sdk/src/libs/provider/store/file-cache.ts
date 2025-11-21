import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { logger } from '@/libs/utils';
import { ObjectStringItemMix, ChooseFileInfo } from '@/libs/types';

interface FileCacheState {
  // 统一的已上传文件信息缓存
  uploadedFiles: ObjectStringItemMix[];
  // 上传中的文件信息
  uploadingFiles: ChooseFileInfo[];
  // 是否有未发送的文件
  hasPendingFiles: boolean;
}

interface FileCacheActions {
  // 添加已上传的文件
  addUploadedFiles: (files: ObjectStringItemMix[]) => void;
  // 设置上传中的文件
  setUploadingFiles: (files: ChooseFileInfo[]) => void;
  // 清除所有缓存
  clearAllCache: () => void;
  // 清除已上传的文件缓存
  clearUploadedFiles: () => void;
  // 移除所有缓存文件
  removeAllFiles: () => void;
  // 移除指定的文件
  removeFile: (fileId: string) => void;
  // 标记文件已发送
  markFilesAsSent: () => void;
}

export type FileCacheStore = FileCacheState & FileCacheActions;

const createFileCacheStore = () => {
  return create<FileCacheStore>()(
    persist(
      (set, get) => ({
        uploadedFiles: [],
        uploadingFiles: [],
        hasPendingFiles: false,
        
        addUploadedFiles: (files: ObjectStringItemMix[]) => {
          logger.debug('FileCacheStore addUploadedFiles', files);
          set(state => {
            // 添加去重逻辑，避免重复文件
            const existingFileIds = new Set(
              state.uploadedFiles.map(file => file.file_id)
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
              uploadedFiles: [...state.uploadedFiles, ...uniqueFiles],
              hasPendingFiles: true
            };
          });
        },
        
        setUploadingFiles: (files: ChooseFileInfo[]) => {
          logger.debug('FileCacheStore setUploadingFiles', files);
          set({ uploadingFiles: files });
        },
        
        clearAllCache: () => {
          logger.debug('FileCacheStore clearAllCache');
          set({
            uploadedFiles: [],
            uploadingFiles: [],
            hasPendingFiles: false
          });
        },
        
        clearUploadedFiles: () => {
          logger.debug('FileCacheStore clearUploadedFiles');
          set({ uploadedFiles: [] });
        },
        
        removeFile: (fileId: string) => {
          logger.debug('FileCacheStore removeFile', fileId);
          set(state => {
            const newUploadedFiles = state.uploadedFiles.filter(
              file => file.file_id !== fileId
            );
            return {
              uploadedFiles: newUploadedFiles,
              hasPendingFiles: newUploadedFiles.length > 0
            };
          });
        },
        
        markFilesAsSent: () => {
          logger.debug('FileCacheStore markFilesAsSent');
          set({ hasPendingFiles: false });
        },
        
        removeAllFiles: () => {
          logger.debug('FileCacheStore removeAllFiles');
          set({ 
            uploadedFiles: [], 
            hasPendingFiles: false
          });
        }
      }),
      {
        name: 'chat-sdk-file-cache',
        partialize: (state) => ({
          uploadedFiles: state.uploadedFiles,
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