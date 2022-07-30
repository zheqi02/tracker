export const createHistoryEvent = <T extends keyof History>(type: T) => {
  const origin = history[type]
  return function (this: any) {
    const res = origin.apply(this, arguments)
    const e = new Event(type)
    window.dispatchEvent(e)
    return res
  }
}
