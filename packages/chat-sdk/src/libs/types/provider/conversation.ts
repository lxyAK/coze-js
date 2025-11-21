import { type IMiniChatError } from '../utils/error';
import { type ISendMessage } from '../services/send-message';
import {
  type ObjectStringItemMix,
} from '../../services/helper/message/send-message/multi-send-message';
import {
  IMessageCallback,
  type ChatMessage,
  type ChatMessageGroup,
} from '../base';
// 声明：messageList是顺序的结构，最新的数据在数组的最下边。
export interface ConversationState {
  id?: string;
  sectionId?: string;
  prevCursorId?: string; //向上翻页,获取历史消息的cursor
  prevHasMore?: boolean;
  prevError?: IMiniChatError;

  nextCursorId?: string; //向下翻页,获取历史消息的cursor
  nextHasMore?: boolean;
  nextError?: IMiniChatError;

  chatMessageGroups: ChatMessageGroup[];

  inProcessChatMessageGroup?: ChatMessageGroup; // 正在交互的消息
  sendMessageService?: ISendMessage;

  isUnshiftingMessageFlag: boolean; // 是否正在加载新数据
  scrollTop?: number;
  cachedFiles: ObjectStringItemMix[]; // 缓存的文件信息
  cachedLocalFiles: File[]; // 缓存的本地文件
}

interface ConversationAction {
  setConversationDetail: (
    detail: Omit<
      ConversationState,
      'chatMessageGroups' | 'isUnshiftingMessageFlag'
    >,
    messageList: ChatMessage[],
  ) => void;
  pushMessageList: (list: ChatMessage[], groupLocalId?: string) => void; // 数组尾部添加消息
  unshiftMessageList: (conversationId: string, list: ChatMessage[]) => void; // 数组头部添加消息

  popLastErrorChatGroup: () => ChatMessageGroup | null;
  setNewConversationId: (id: string) => void;
  setSectionId: (id: string) => void;
  isShowOnBoarding: () => boolean;

  setPrevInfo: (prevHasMore: boolean, prevCursorId: string) => void;
  setNextInfo: (nextHasMore: boolean, nextCursorId: string) => void;
  setPrevError: (error: IMiniChatError) => void;
  setNextError: (error: IMiniChatError) => void;
  clearUnshiftingMessageFlg: (scrollTop?: number) => void;
  // 缓存文件相关操作
  setCachedFiles: (files: ObjectStringItemMix[]) => void;
  setCachedLocalFiles: (files: File[]) => void;
  clearCachedFiles: () => void;

  setSendMessageService: (service: ISendMessage) => void;
  setEventCallbacksAboutMessage: (eventCallbacks?: IMessageCallback) => void;
  closeSendMessage: () => void;
}

export type ConversationStore = ConversationAction & ConversationState;
