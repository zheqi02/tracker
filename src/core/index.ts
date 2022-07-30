import { DefaultOptons, TrackerConfig, Options } from '../types'
import { createHistoryEvent } from '../utils/pv'

const MouseEventList: string[] = [
  'click',
  'dblclick',
  'contextmenu',
  'mousedown',
  'mouseup',
  'mouseenter',
  'mouseout',
  'mouseover'
]
export default class Tracker {
  public data: Options
  public timeStr: number = 0
  constructor(options: Options) {
    this.data = { ...this.initDef(), ...options }
  }

  // 初始化默认配置
  private initDef(): DefaultOptons {
    window.history['pushState'] = createHistoryEvent('pushState')
    window.history['replaceState'] = createHistoryEvent('replaceState')
    return <DefaultOptons>{
      historyTracker: false,
      hashTracker: false,
      domTracker: false,
      jsError: false,
      isPageStay: false,
      sdkVersion: TrackerConfig.version
    }
  }

  public setUserId<T extends DefaultOptons['uuid']>(uuid: T) {
    this.data.uuid = uuid
  }

  public setExtra<T extends DefaultOptons['extra']>(extra: T) {
    this.data.extra = extra
  }

  // 手动上报
  public sendTracker<T>(data: T) {
    this.reportTracker(data)
  }

  private targetKeyReport() {
    MouseEventList.forEach(event => {
      window.addEventListener(event, e => {
        const target = e.target as HTMLElement
        const targetKey = target.getAttribute('target-key')
        if (targetKey) {
          this.reportTracker({
            event,
            targetKey
          })
        }
      })
    })
  }

  // 错误上报
  private errorEvent() {
    window.addEventListener('error', e => {
      this.reportTracker({
        event: 'error',
        targetKey: 'message',
        message: e.message
      })
    })
  }

  // promise 错误上报
  private promiseReject() {
    window.addEventListener('unhandledrejection', event => {
      event.promise.catch(error => {
        this.reportTracker({
          event: 'promise',
          targetKey: 'message',
          message: error
        })
      })
    })
  }

  private jsError() {
    this.errorEvent()
    this.promiseReject()
  }

  private captureEvents<T>(
    mouseEventList: string[],
    targetKey: string,
    data?: T
  ) {
    mouseEventList.forEach(event => {
      window.addEventListener(event, () => {
        // 自动上报
        this.reportTracker({
          event,
          targetKey,
          data
        })
      })
    })
  }
  // SPA页面停留时间监控
  public pageStay() {
    window.addEventListener('onload', () => {
      this.timeStr = new Date().getTime()
    })

    window.addEventListener('popstate', () => {
      let t = new Date().getTime() - this.timeStr
      this.timeStr = new Date().getTime()
      this.reportTracker({
        event: 'pageStay',
        targetKey: 'time',
        time: t,
        url: window.location.href
      })
    })

    window.addEventListener('pushstate', () => {
      let t = new Date().getTime() - this.timeStr
      this.timeStr = new Date().getTime()
      this.reportTracker({
        event: 'pageStay',
        targetKey: 'time',
        time: t,
        url: window.location.href
      })
    })

    window.addEventListener('replacestate', () => {
      let t = new Date().getTime() - this.timeStr
      this.timeStr = new Date().getTime()
      this.reportTracker({
        event: 'pageStay',
        targetKey: 'time',
        time: t,
        url: window.location.href
      })
    })

    window.addEventListener('hashchange', () => {
      let t = new Date().getTime() - this.timeStr
      this.timeStr = new Date().getTime()
      this.reportTracker({
        event: 'pageStay',
        targetKey: 'time',
        time: t,
        url: window.location.href
      })
    })
  }

  // 调用这个执行初始化
  private installTracker() {
    // PV行为监控
    if (this.data.historyTracker) {
      // 第二个参数自定义，后台传入
      this.captureEvents(
        ['pushState', 'replaceState', 'popstate'],
        'history-pv'
      )
    }
    // UV行为监控
    if (this.data.hashTracker) {
      this.captureEvents(['hashchange'], 'hash-pv')
    }
    // DOM行为监控
    if (this.data.domTracker) {
      this.targetKeyReport()
    }
    if (this.data.jsError) {
      this.jsError()
    }
    if (this.data.isPageStay) {
      this.pageStay()
    }
  }

  // 发送请求不是使用XMLHttpRequest，而是使用navigator.sendBeacon
  private reportTracker<T>(data: T) {
    const params = Object.assign(
      { time: new Date().getTime() },
      this.data,
      data
    )
    let header = {
      type: 'application/x-www-form-urlencoded'
    }
    let blob = new Blob([JSON.stringify(params)], header)
    navigator.sendBeacon(this.data.requestUrl, blob)
  }
}
