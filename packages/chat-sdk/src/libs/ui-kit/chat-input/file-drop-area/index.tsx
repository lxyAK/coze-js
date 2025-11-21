import { FC, useState, useEffect } from 'react';
import cls from 'classnames';
import { View } from '@tarojs/components';
import { isWeb, getFileTypeByFile, logger } from '@/libs/utils';
import { ChooseFileInfo } from '@/libs/types';

// @ts-ignore - 忽略less模块导入类型错误
import styles from './index.module.less';

interface FileDropAreaProps {
  onFilesAdded: (files: ChooseFileInfo[]) => void;
  disabled?: boolean;
}

export const FileDropArea: FC<FileDropAreaProps> = ({
  onFilesAdded,
  disabled = false,
}) => {
  // 条件判断必须在所有hooks之前
  if (!isWeb || disabled) {
    return null;
  }
  
  const [isDragging, setIsDragging] = useState(false);

  // 处理全局拖拽事件
  const handleDragOver = (e: DragEvent) => {
    try {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      
      // 检查是否有文件
      if (e.dataTransfer && e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        try {
          const hasFiles = Array.from(e.dataTransfer.items).some(item => item?.kind === 'file');
          if (hasFiles) {
            setIsDragging(true);
          }
        } catch (error) {
          logger.debug('Error checking drag items:', error);
        }
      }
    } catch (error) {
      logger.error('Error in handleDragOver:', error);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    try {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      // 延迟设置，避免在快速移动时闪烁
      setTimeout(() => {
        setIsDragging(false);
      }, 100);
    } catch (error) {
      logger.error('Error in handleDragLeave:', error);
    }
  };

  const handleDrop = (e: DragEvent) => {
    try {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer?.files || []);
      
      if (droppedFiles.length > 0) {
        logger.debug('Files dropped:', droppedFiles);
        
        const fileInfos: ChooseFileInfo[] = droppedFiles.map(file => {
          const fileType = getFileTypeByFile(file);
          return {
            from: 'H5_Input_Chooser', // 修复类型错误，使用正确的from值
            type: fileType,
            size: file?.size || 0,
            file,
            tempFilePath: URL.createObjectURL(file),
          };
        });
        
        onFilesAdded(fileInfos);
      }
    } catch (error) {
      logger.error('Error in handleDrop:', error);
    }
  };

  // 添加和移除全局事件监听器
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('dragover', handleDragOver);
      document.addEventListener('dragleave', handleDragLeave);
      document.addEventListener('drop', handleDrop);

      return () => {
        document.removeEventListener('dragover', handleDragOver);
        document.removeEventListener('dragleave', handleDragLeave);
        document.removeEventListener('drop', handleDrop);
      };
    }
  }, []);

  // 不显示红色区域，只在拖拽时显示全局提示
  return isDragging ? (
    <View className={styles.globalOverlay}>
      <View className={styles.dropPrompt}>
        <View className={styles.icon}>📁</View>
        <View className={styles.text}>Drop files here to add to the conversation</View>
        <View className={styles.subText}>松开以上传文件</View>
      </View>
    </View>
  ) : null;
};