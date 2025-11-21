import { FC, useMemo } from 'react';
import { View, Image } from '@tarojs/components';
import { SvgClose } from '@/libs/ui-kit/atomic/svg';
import { ChooseFileInfo, ObjectStringItemMix, FileTypeEnum } from '@/libs/types';

// // 文件大小格式化函数
// function getFileSizeStr(bytes: number): string {
//   if (bytes === 0) return '0 B';
//   const k = 1024;
//   const sizes = ['B', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }
import { IconButton } from '@/libs/ui-kit/atomic/icon-button';

// @ts-ignore - 忽略less模块导入类型错误
import styles from './index.module.less';

interface AttachmentItemProps {
  file: ChooseFileInfo | ObjectStringItemMix;
  onRemove: (fileId: string) => void;
}

const AttachmentItem: FC<AttachmentItemProps> = ({ file, onRemove }) => {
  // 改进类型安全的属性获取
  const fileId = 'file_id' in file ? file.file_id : (file as ChooseFileInfo).tempFilePath;
  
  // // 更健壮的文件名获取逻辑，避免显示"未知文件"
  // const fileName = 'name' in file ? file.name : 
  //                 'file' in file && file.file && 'name' in file.file ? file.file.name : 
  //                 'fileName' in file ? file.fileName : 
  //                 // 尝试从路径或URL中提取文件名
  //                 (fileId && typeof fileId === 'string' && fileId.lastIndexOf('/') > -1 
  //                   ? fileId.substring(fileId.lastIndexOf('/') + 1) 
  //                   : '文件');
  
  // const fileSize = 'size' in file ? file.size : 
  //                 'file' in file && file.file && 'size' in file.file ? file.file.size : 0;
  
  const fileUrl = 'file_url' in file ? file.file_url : 
                 'tempFilePath' in file ? file.tempFilePath : 
                 fileId;
  
  // 判断是否为图片类型
  const isImage = 'type' in file && 
                 (file.type === FileTypeEnum.IMAGE || 
                  file.type === 'image' ||
                  (typeof file.type === 'string' && file.type.startsWith('image/')));
  
  return (
    <View className={styles['attachment-item']}>
      {isImage && fileUrl && (
        <View className={styles['image-preview']}>
          <Image src={fileUrl} mode="aspectFill" className={styles['preview-img']} />
        </View>
      )}
      {/* 附件信息（名称、大小） */}
      {/* <View className={styles['file-info']}>
        <View className={styles['file-name']}>
          {fileName}
        </View>
        <View className={styles['file-size']}>
          {getFileSizeStr(fileSize)}
        </View>
      </View> */}
      <IconButton
        className={styles['delete-btn']}
        hoverTheme="none"
        onClick={() => {
          if (fileId) {
            onRemove(fileId);
          }
        }}
      >
        <SvgClose size={12} theme="dark" />
      </IconButton>
    </View>
  );
};

interface AttachmentListProps {
  uploadedFiles: ObjectStringItemMix[];
  onRemoveFile: (fileId: string) => void;
}

export const AttachmentList: FC<AttachmentListProps> = ({
  uploadedFiles,
  onRemoveFile,
}) => {
  // 直接使用已上传文件列表
  const allFiles = useMemo(() => {
    return uploadedFiles;
  }, [uploadedFiles]);
  
  if (allFiles.length === 0) {
    return null;
  }
  
  return (
    <View className={styles.container}>
      <View className={styles['preview-scroll']}>
        {allFiles.map((file) => {
          // 使用更可靠的唯一标识符作为key，不依赖index
          const fileId = 'file_id' in file ? file.file_id : (file as ChooseFileInfo).tempFilePath;
          return (
            <AttachmentItem
              key={fileId || `file-${Math.random().toString(36).substr(2, 9)}`}
              file={file}
              onRemove={onRemoveFile}
            />
          );
        })}
      </View>
    </View>
  );
};