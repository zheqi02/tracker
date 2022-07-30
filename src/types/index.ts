export interface DefaultOptons {
  uuid: string | undefined
  requestUrl: string | undefined
  historyTracker: boolean
  hashTracker: boolean
  domTracker: boolean
  sdkVersion: string | number
  extra: Record<string, any> | undefined
  jsError: boolean
  isPageStay: boolean
}

//必传参数 requestUrl
export interface Options extends Partial<DefaultOptons> {
  requestUrl: string
}

//版本
export enum TrackerConfig {
  version = '1.0.0'
}

//上报必传参数
export type reportTrackerData = {
  [key: string]: any
  event: string
  targetKey: string
}
