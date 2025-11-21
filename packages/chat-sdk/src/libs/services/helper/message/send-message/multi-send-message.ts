import { type EnterMessage, RoleType, type ObjectStringItem } from '@lxyak/api';

import {
  convertToMinChatError,
  logger,
  MiniChatError,
  MiniChatErrorCode,
} from '@/libs/utils';
import {
  RawMessageType,
  type RawMessage,
  ChooseFileInfo,
  FileTypeEnum,
  type AudioRaw,
} from '@/libs/types';
import { useFileCacheStore } from '@/libs/provider/context/chat-store-context';

import { RawSendMessage, type SendMessageOptions } from './raw-send-message';

export { RawMessageType, type RawMessage };
export interface ObjectStringItemMix {
  type: 'file' | 'image';
  name?: string;
  size?: string;
  file_url: string;
  file_id?: string;
  file_info?: ChooseFileInfo;
}

export class MultiSendMessage extends RawSendMessage {
  // 使用file-cache store来管理文件缓存
  private fileCacheStore: any;
  
  constructor(options: SendMessageOptions) {
    super(options);
    // 直接从构造函数参数中提取fileCacheStore
    this.fileCacheStore = options.fileCacheStore || {
      uploadedFiles: [] as any[],
      addUploadedFiles: (files: any[]) => { logger.debug('addUploadedFiles', files); },
      removeAllFiles: () => { logger.debug('removeAllFiles'); },
      removeFile: (fileId: string) => { logger.debug('removeFile', fileId); },
    };
  }
  
  // 设置file-cache store，供外部注入
  setFileCacheStore(store: any) {
    this.fileCacheStore = store;
  }
  
  sendTextMessage(content: string, historyMessages?: EnterMessage[]) {
    const message: EnterMessage = {
      role: RoleType.User,
      content,
      content_type: 'text',
    };
    this.sendStartMessage(message);
    this.sendMessage(message, historyMessages);
  }
  
  async sendFileMessage(
    files: ChooseFileInfo[],
    historyMessages?: EnterMessage[],
  ) {
    // 将文件信息缓存到store中
    // 上传文件并缓存结果
    const uploadedFiles = await this.uploadFile(files);
    if (uploadedFiles) {
      this.fileCacheStore.addUploadedFiles(uploadedFiles);
      logger.debug('sendFileMessage uploadedFiles', uploadedFiles);
    } else {
      // 上传失败
      this.sendErrorEvent(
        new MiniChatError(-1, this.i18n.t('sendMessageUploadFailed')),
      );
    }
    // 文件上传完成后关闭消息发送流程
  }
  
  async sendTextAndFileMessage(text: string,historyMessages?: EnterMessage[]) {
    if (text) {
      // 从store中获取缓存的文件
      const cachedFiles = this.fileCacheStore.uploadedFiles || [];
      logger.debug('sendTextAndFileMessage uploadedFiles', cachedFiles);
      const fileList = cachedFiles.map((item: any) => {
        return {
          type: item.type,
          // name: item.name,
          // file_url: item.file_url,
          file_id: item.file_id,
        };
      });
      const content = [
        {
          type: 'text',
          text: text,
        },
       ...fileList
      ]
      // 发送文件和文本内容
      const message: EnterMessage = {
        role: RoleType.User,
        content: JSON.stringify(content),
        content_type: 'object_string',
      };
      this.sendStartMessage(message);
      this.sendMessage(message, historyMessages);
      // 发送完成后清空缓存
      this.fileCacheStore.removeAllFiles();
    }
  }
  async sendAudioMessage(audio: AudioRaw, historyMessages?: EnterMessage[]) {
    logger.info('sendAudioMessage audio', audio);
    const message: EnterMessage = {
      role: RoleType.User,
      content: '',
      content_type: 'text',
    };
    this.sendStartMessage({
      ...message,
      content: '',
      isAudioTranslatingToText: true,
    });
    try {
      const content = await this.translateAudioToText(audio);
      logger.debug('sendAudioMessage content', content);

      message.content = content;
      this.sendStartMessage({
        ...message,
        isAudioTranslatingToText: false,
      });

      this.sendMessage(message, historyMessages);
    } catch (error) {
      logger.error('sendAudioMessage', { error });
      const miniChatError = convertToMinChatError(error);
      const content = miniChatError?.getErrorMessageByI18n?.(
        this.i18n,
        {},
        this.i18n.t('sendMessageTranslationAudioFailed'),
      );
      this.messageSended.isAudioTranslatingToText = false;
      this.messageSended.content = content;
      this.sendErrorEvent(miniChatError);
      return;
    }
  }

  private async translateAudioToText(audio: AudioRaw): Promise<string> {
    const res = await this.chatService.translation({
      file: {
        filePath: audio.tempFilePath,
        fileName: audio.fileName,
      },
    });
    if (!res.text) {
      throw new MiniChatError(
        MiniChatErrorCode.Audio_Translation_NoContent,
        this.i18n.t('sendMessageTranslationAudioNone'),
      );
    }
    return res.text;
  }

  private async uploadFile(
    file: ChooseFileInfo[],
  ): Promise<ObjectStringItemMix[] | null> {
    const fileList: ObjectStringItemMix[] = [];
    let hasError = false;
    try {
      await Promise.all(
        file.map(async item => {
          const packResult = this.packFileObject(item);
          if (packResult) {
            const res = await this.chatService.upload({
              file: item.file,
            });
            packResult.file_id = res.id;
            fileList.push(packResult);
          }
        }),
      );
    } catch (error) {
      hasError = true;
    }
    return hasError ? null : fileList;
  }
  private getObjectStringType(fileType: FileTypeEnum) {
    return fileType === FileTypeEnum.IMAGE ? 'image' : 'file';
  }
  private packFileObject(fileInfo: ChooseFileInfo): ObjectStringItemMix | null {
    const type = this.getObjectStringType(fileInfo.type);
    // 获取文件名，考虑不同来源的情况
    const fileName = 'name' in fileInfo ? fileInfo.name : 
                   'file' in fileInfo && fileInfo.file && 'name' in fileInfo.file ? fileInfo.file.name : 
                   '未知文件';
    
    switch (type) {
      case 'image': {
        return {
          type: 'image',
          file_url: fileInfo.tempFilePath,
          size: fileInfo.size, // 直接从fileInfo获取大小
          name: fileName,
          file_info: fileInfo,
        };
      }
      case 'file': {
        return {
          type: 'file',
          name: fileName,
          size: fileInfo.size, // 直接从fileInfo获取大小，而不是从fileInfo.file获取
          file_url: fileInfo.tempFilePath,
          file_info: fileInfo,
        };
      }
      default: {
        return null;
      }
    }
  }
  async sendRawMessage(
    rawMessage: RawMessage,
    historyMessages?: EnterMessage[],
  ) {
    this.messageSended.rawMessage = rawMessage;
    switch (rawMessage.type) {
      case RawMessageType.TEXT: {
        return await this.sendTextMessage(rawMessage.data, historyMessages);
      }
      case RawMessageType.FILE: {
        return await this.sendFileMessage(rawMessage.data, historyMessages);
      }
      case RawMessageType.AUDIO: {
        return await this.sendAudioMessage(rawMessage.data, historyMessages);
      }
      case RawMessageType.TEXT_AND_FILE: {
        return await this.sendTextAndFileMessage(rawMessage.data, historyMessages);
      }
      default: {
        throw new MiniChatError(-1, 'unknown message type');
      }
    }
  }
}
