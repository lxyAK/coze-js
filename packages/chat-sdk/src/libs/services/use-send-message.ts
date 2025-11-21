import { useCallback } from 'react';

import { type EnterMessage } from '@lxyak/api';

import { showToast } from '@/libs/utils';
import { useApiClientStore, useUserInfoStore } from '@/libs/provider';

import { AudioRaw, ChooseFileInfo, SendMessageEvent } from '../types';
import {
  useConversationStore,
  useChatStatusStore,
  useChatInfoStore,
  useI18n,
  useUiEventStore,
  useChatInputStore,
  useChatPropsStore,
  useFileCacheStore,
} from '../provider/context/chat-store-context';
import {
  getSendMessageHandler,
  type RawMessage,
  RawMessageType,
} from './helper/message';
import { usePersistCallback } from '../hooks';
// eslint-disable-next-line max-lines-per-function
export const useSendMessage = () => {
  const {
    setSendMessageService,
    conversationId,
    sectionId,
    popLastErrorChatGroup,
  } = useConversationStore(store => ({
    setSendMessageService: store.setSendMessageService,
    conversationId: store.id,
    sectionId: store.sectionId,
    popLastErrorChatGroup: store.popLastErrorChatGroup,
  }));
  const fileCacheStore = useFileCacheStore(store => store);
  const i18n = useI18n();
  const userInfo = useUserInfoStore(store => store.info);
  const botId = useChatInfoStore(store => store.id);
  const { getOpDisabledState, setIsDeleting } = useChatStatusStore(store => ({
    setIsDeleting: store.setIsDeleting,
    getOpDisabledState: store.getOpDisabledState,
  }));
  const chatInfo = useChatInfoStore(store => store.info);
  const setTaskList = useChatInputStore(store => store.setTaskList);
  const { connectorId, chatService } = useApiClientStore(store => ({
    connectorId: store.connectorId,
    chatService: store.chatService,
  }));
  const targetEventCenter = useUiEventStore(store => store.event);
  const onRequiresAction = useChatPropsStore(
    store => store.eventCallbacks?.message?.onRequiresAction,
  );
  const checkCanSendMessage = useChatPropsStore(
    store => store.ui?.chatSlot?.input?.checkCanSendMessage,
  );
  const sendMessage = usePersistCallback(
    async (rawMessage: RawMessage, historyMessages?: EnterMessage[]) => {
      
      const { clearMessage: disableState } = getOpDisabledState();
      if (disableState) {
        return;
      }
      if (!botId || !conversationId) {
        return;
      }
      if (checkCanSendMessage) {
        if ((await checkCanSendMessage(rawMessage)) === false) {
          return false;
        }
      }
      if (rawMessage.type === RawMessageType.FILE) {
         const sendMessageHandler = getSendMessageHandler({
          botId,
          chatService,
          conversationId,
          userId: userInfo?.id || '',
          connectorId,
          sectionId,
          chatInfo: chatInfo || undefined,
          i18n,
          fileCacheStore,
        });
        sendMessageHandler.sendRawMessage(rawMessage, historyMessages);
        return;
      }
      // Clear task message after message sended
      setTaskList({ taskList: [] });
      setIsDeleting(true);
      const sendMessageHandler = getSendMessageHandler({
        botId,
        chatService,
        conversationId,
        userId: userInfo?.id || '',
        connectorId,
        sectionId,
        chatInfo: chatInfo || undefined,
        i18n,
        fileCacheStore,
      });

      sendMessageHandler.on(SendMessageEvent.RequireAction, event => {
        onRequiresAction?.({
          extra: {
            requireAction: event.event,
          },
        });
      });
      sendMessageHandler.on(SendMessageEvent.Close, () => {
        setIsDeleting(false);
      });
      sendMessageHandler.on(SendMessageEvent.ReceiveComplete, event => {
        if (event.error) {
          showToast(
            {
              content:
                event.error?.getErrorMessageByI18n(i18n, {}) ||
                i18n.t('sendFailed'),
              icon: 'error',
              duration: 2000,
            },
            targetEventCenter,
          );
        }
      });
      setSendMessageService(sendMessageHandler);
      sendMessageHandler.sendRawMessage(rawMessage, historyMessages);
    },
  );
  // ! 发送文本消息
  const sendTextMessage = useCallback(
    async (content: string) =>
      await sendMessage({
        type: RawMessageType.TEXT_AND_FILE ,
        data: content,
      }),
    [sendMessage],
  );
  /**
   * !发送文件消息
   * 问题: 附件直接发送了没有携带文本，所以需要发送一个文本消息
   * 后期优化: 上传附件后不直接调用 sendMessage
   */
  const sendFileMessage = useCallback(
    async (files: ChooseFileInfo[]) => {
      // await sendMessage({
      //   type: RawMessageType.TEXT,
      //   data: '帮我分析这个图片的内容',
      // });
      await sendMessage({
        type: RawMessageType.FILE,
        data: files,
      });
    },
    [sendMessage],
  );

  const sendAudioMessage = useCallback(
    async (audio: AudioRaw) =>
      await sendMessage({
        type: RawMessageType.AUDIO,
        data: audio,
      }),
    [sendMessage],
  );

  const reSendLastErrorMessage = useCallback(async () => {
    const chatMessageGroup = popLastErrorChatGroup();
    if (chatMessageGroup?.query?.rawMessage) {
      return await sendMessage(chatMessageGroup?.query?.rawMessage);
    }
  }, [sendMessage]);

  return {
    sendMessage,
    sendTextMessage,
    sendFileMessage,
    sendAudioMessage,
    reSendLastErrorMessage,
  };
};
