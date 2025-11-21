import { FC, useEffect } from 'react';
import { View } from '@tarojs/components';
import { isWeb, getFileTypeByFile, logger } from '@/libs/utils';
import { ChooseFileInfo, ObjectStringItemMix } from '@/libs/types';
import { AttachmentList } from '../attachment-list';
import { FileDropArea } from '../file-drop-area';

interface AttachmentManagerProps {
  uploadedFiles: ObjectStringItemMix[];
  onAddFiles: (files: ChooseFileInfo[]) => void;
  onRemoveFile: (fileId: string) => void;
  disabled?: boolean;
}

export const AttachmentManager: FC<AttachmentManagerProps> = ({
  uploadedFiles,
  onAddFiles,
  onRemoveFile,
  disabled = false,
}) => {
  const handlePaste = (e: ClipboardEvent<Document>) => {
    if (disabled) return;
    
    // 检查剪贴板中是否有文件
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const pastedFiles: File[] = [];
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 处理图片
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
      // 处理其他文件类型
      else if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file) {
          pastedFiles.push(file);
        }
      }
    }
    
    if (pastedFiles.length > 0) {
      e.preventDefault();
      logger.debug('Files pasted from clipboard:', pastedFiles);
      
      const fileInfos: ChooseFileInfo[] = pastedFiles.map(file => ({
        from: 'H5_Clipboard',
        type: getFileTypeByFile(file),
        size: file.size,
        file,
        tempFilePath: URL.createObjectURL(file),
        name: file.name,
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      }));
      
      onAddFiles(fileInfos);
    }
  };

  // 监听整个文档的粘贴事件
  useEffect(() => {
    if (isWeb && !disabled) {
      document.addEventListener('paste', handlePaste);
      
      return () => {
        document.removeEventListener('paste', handlePaste);
      };
    }
  }, [disabled]);

  return (
    <View className="attachment-manager">
      {/* 拖放上传区域 */}
      <FileDropArea 
        onFilesAdded={onAddFiles} 
        disabled={disabled} 
      />
      
      {/* 附件列表 */}
      <AttachmentList
        uploadedFiles={uploadedFiles}
        onRemoveFile={onRemoveFile}
      />
    </View>
  );
};