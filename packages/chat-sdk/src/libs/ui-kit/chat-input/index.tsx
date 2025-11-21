import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  ForwardedRef,
} from 'react';

import cls from 'classnames';
import { View } from '@tarojs/components';

import { isWeb, logger, nanoid } from '@/libs/utils';
import { ChooseFileInfo } from '@/libs/types';
import { Spacing } from '../atomic/spacing';
import { DisableContainer } from '../atomic/disable-container';
import { UploadBtn } from './upload-btn';
import { InputType, type IChatInputProps } from './type';
import { Textarea } from './textarea';
import { TaskMessage } from './task-message/index';
import { SendSwitchBtn } from './send-switch-btn';
import { useTextInputHandle } from './hooks/use-text-input-handle';
import { useMultiModeMessageHandle } from './hooks/use-multi-mode-message-handle';
import { useKeyboardHeightHandle } from './hooks/use-keyborader-height-handle';
import { useAudioMessageHandle } from './hooks/use-audio-message-handle';
import { AudioInput } from './audio-input';
import { AttachmentManager } from './attachment-manager';
import { useFileCacheStore } from '@/libs/provider/context/chat-store-context';

import styles from './index.module.less';
let inputNo = 1000;
export interface ChatInputRef {
  setInputValue: (val: string) => void;
}
export const ChatInput = forwardRef(
  (props: IChatInputProps, ref: ForwardedRef<ChatInputRef>) => {
    const {
      isNeedUpload,
      disabled = false,
      inputAdjustDefault = true,
      onSendFileMessage,
      onSendAudioMessage,
      isNeedAudio = false,
      placeholder = 'Send Message',
      frameEventTarget,
      isPcMode,
      defaultInputType = InputType.Text,
    } = props;
    
    const fileCacheStore = useFileCacheStore(store => store);
    const { cachedFiles: uploadedFiles, removeFile } = fileCacheStore; // 保持变量名向后兼容
    
    const handleAddFiles = (files: ChooseFileInfo[]) => {
      // 关键点：只调用onSendFileMessage，不再直接处理本地文件缓存
      // 假设onSendFileMessage内部会负责文件上传并调用addUploadedFiles添加成功上传的文件到store
      if (onSendFileMessage) {
        onSendFileMessage(files);
      }
    };
    
    const handleRemoveFile = (fileId: string) => {
      removeFile(fileId);
    };
    const inputId = useMemo(() => `chat-input-${nanoid()}-${inputNo++}`, []);
    const [inputType, setInputType] = useState<InputType>(defaultInputType);
    const { onRecording, isRecording, isRealAudioInputFocusing } =
      useAudioMessageHandle(props, {
        inputType,
      });
    const { taskMessage, isShowMultiModeMessage } = useMultiModeMessageHandle(
      props,
      {
        inputType,
        setInputType,
        isRecording,
      },
    );
    const {
      inputValue,
      setInputValue,
      focused,
      setFocused,
      toSendInputValue,
      onSendTextMessage,
    } = useTextInputHandle(props, { inputId, taskMessage });
    const { onKeyBoardHeightChange } = useKeyboardHeightHandle(props);

    useImperativeHandle(
      ref,
      () => ({
        setInputValue,
      }),
      [],
    );
    logger.debug('ChatInput focused', {
      focused,
      inputType,
    });

    return (
      <DisableContainer className={cls(styles.container, { [styles.focused]: focused || isRealAudioInputFocusing })}>
        {/* 附件管理区域 - 移到外部实现上下分离 */}
        {isNeedUpload && inputType === InputType.Text && !isShowMultiModeMessage && (
          <>
            <AttachmentManager
              uploadedFiles={uploadedFiles}
              onAddFiles={handleAddFiles}
              onRemoveFile={handleRemoveFile}
              disabled={disabled}
            />
            <View className={styles.dividerBetweenSections} />
          </>
        )}
        
        <View
          className={cls(styles['chat-input-container'], {
            [styles.focused]: focused || isRealAudioInputFocusing,
            [styles['audio-recording']]: isRecording,
            [styles['multi-mode-message']]: isShowMultiModeMessage,
          })}
        >
          {isShowMultiModeMessage ? (
            <>
              <TaskMessage taskMessage={taskMessage} />
            </>
          ) : null}

          <Spacing className={styles['chat-input-content']}>
            
            {inputType === InputType.Voice ? (
              <AudioInput
                onSendAudioMessage={onSendAudioMessage}
                type={isPcMode ? 'primary' : 'default'}
                frameEventTarget={frameEventTarget}
                isPcMode={isPcMode}
                disabled={disabled}
                focused={focused || isRealAudioInputFocusing}
                onAudioRecording={onRecording}
              />
            ) : (
              <Textarea
                id={inputId}
                focus={focused}
                placeholder={placeholder}
                adjustPosition={inputAdjustDefault}
                value={inputValue}
                onSendTextMessage={onSendTextMessage}
                onInputChange={value => {
                  setInputValue(value);
                }}
                onFocus={event => {
                  onKeyBoardHeightChange?.(event.detail.height);
                  setFocused(true);
                }}
                onBlur={() => {
                  onKeyBoardHeightChange?.(0);
                  logger.debug('ChatInput onBlur');
                  setFocused(false);
                }}
              />
            )}
            <Spacing
              verticalCenter
              horizontalCenter
              className={styles['op-container']}
            >
              {isNeedUpload ? (
                <>
                  <UploadBtn
                    onSendFileMessage={handleAddFiles}
                    frameEventTarget={frameEventTarget}
                    disabled={disabled}
                  />
                  <View className={styles.divider} />
                </>
              ) : null}
              <SendSwitchBtn
                inputDisabled={disabled}
                hasTextToSend={!!toSendInputValue}
                inputType={inputType}
                isNeedAudio={isNeedAudio}
                focused={focused}
                onSendBtnClick={() => {
                  onSendTextMessage();
                }}
                onKeyboardClick={() => {
                  setFocused(false);
                  setInputType(InputType.Text);
                  // 需要延迟才能 触发 focus效果
                  setTimeout(() => {
                    setFocused(true);
                    if (isWeb) {
                      // web下无法获取焦点，需要手动添加焦点
                      document
                        .getElementById(inputId)
                        ?.querySelector('textarea')
                        ?.focus();
                    }
                  }, 100);
                }}
                onMicrophoneClick={() => {
                  setInputType(InputType.Voice);
                  setFocused(false);
                }}
              />
            </Spacing>
          </Spacing>
        </View>
      </DisableContainer>
    );
  },
);
