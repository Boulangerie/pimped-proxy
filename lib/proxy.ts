export class Proxy {

  public constructor(target: any, fields?: Array<string>|any) {
    Proxy.lookup(this, target, fields)
  }

  public static lookup(src: any, target: any, fields?: Array<string>|any): any {
    let traps
    let fieldNames: Array<string>
    if ((typeof fields === 'object') && !Array.isArray(fields)) {
      traps = fields
      fieldNames = Object.keys(fields)
    } else {
      fieldNames = <Array<string>>fields
    }

    const properties: Array<string> = (typeof target === 'object') ? Object.keys(target) : []
    properties
      .concat(fieldNames)
      .forEach((property) => {
        if ((typeof fieldNames === 'undefined') || (fieldNames.indexOf(property) > -1)) {
          const trap: string|IHandler = Proxy.get(traps, property, {})
          Object.defineProperty(src, property, {
            configurable: true,
            enumerable: true,
            get: () => {
              let res: any
              if (typeof trap === 'string') {
                res = Proxy.get(target, trap)
              } else if (trap.get) {
                let val = Proxy.get(target, property)
                res = trap.get.call(src, val)
              } else {
                res = Proxy.get(target, property)
              }
              return res
            },
            set: (val) => {
              if (typeof trap === 'string') {
                Proxy.set(target, trap, val)
              } else if (trap.set) {
                const ret = trap.set.call(src, val)
                Proxy.set(target, property, ret)
              } else {
                Proxy.set(target, property, val)
              }
            }
          })
        }
      })
  }

  private static get(obj: any, path: string, defaultValue?: any): any {
    if (!obj || (typeof obj !== 'object')) {
      return defaultValue
    }

    const items = String(path)
      .replace(/\[(\w+)\]/g, '.$1')
      .replace(/^\./, '')
      .split('.')

    let res = false
    let curObj = obj
    for (let item of items) {
      if (curObj) {
        res = (typeof curObj[item] !== 'undefined')
        curObj = res ? curObj[item] : false
      }
    }
    return (res === false) ? defaultValue : curObj
  }

  private static set(obj: any, path: string, value: any): any {
    if (!obj || (typeof obj !== 'object')) {
      return
    }

    const element = String(path)
      .replace(/\[(\w+)\]/g, '.$1')
      .replace(/^\./, '')
      .split('.')

    let key
    for (let i = 0; element.length > 1; i++) {
      key = element.shift()
      let propertyObj = obj[key]
      if (!propertyObj) {
        propertyObj = {}
        obj[key] = propertyObj
      }
      obj = propertyObj
    }
    key = element.shift()
    obj[key] = value
    return value
  }

}

interface IHandler {
  get?: () => any
  set?: () => any
}
