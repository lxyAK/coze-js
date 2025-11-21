export type NullableType<T> = {
  [P in keyof T]: T[P] | null;
};
export type NonNullableType<T> = {
  [P in keyof T]: Exclude<T[P], null>;
};

export interface ObjectStringItemMix {
  type?: string;
  name?: string;
  size?: number;
  file_url?: string;
  file_id?: string;
  url?: string;
  proxy_url?: string;
  file?: any;
}
