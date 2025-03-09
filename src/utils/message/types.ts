import type { ResponseType } from '../request'
import type { CookieInfo } from './cookie'

export interface ProtocolCommonMap {
  'cookie:info': () => Record<string, CookieInfo>
  'cookie:switch': (data: { uid: string }) => boolean
  'cookie:save': (data: { info: CookieInfo }) => boolean
  'cookie:delete': (data: { uid: string }) => boolean
  'cookie:clear': () => boolean
  'request': (data: { url: string, data: RequestInit, timeout: number, responseType: ResponseType }) => any
  'notify': (data: { title: string, message: string, type: 'basic' | 'image' | 'list' | 'progress', iconUrl: string }) => boolean

  'background:test': (data: { type: 'success' | 'error' }) => number
}

export interface ProtocolMap extends ProtocolCommonMap {
  'storage:get': (data: { key: string }) => any
  'storage:set': (data: { key: string, value: any }) => boolean

  'contentScript:test': (data: { type: 'success' | 'error' }) => number
}

export type MaybePromise<T> = Promise<T> | T
