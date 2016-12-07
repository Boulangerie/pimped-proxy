import * as _ from 'lodash'

export class Proxy {

  public constructor(target: Object, fields?: Array<string>|Object) {
    Proxy.lookup(this, target, fields)
  }

  public static lookup(src: Object, target: Object, fields?: Array<string>|Object) {
    let traps
    let fieldNames: Array<string>
    if (_.isObject(fields) && !_.isArray(fields)) {
      traps = _.clone(fields)
      fieldNames = _.keys(fields)
    } else {
      fieldNames = <Array<string>>fields
    }

    const properties: Array<string> = _.keys(target)
    _(properties)
      .union(fieldNames)
      .forEach((property) => {
        if (_.isUndefined(fieldNames) || _.includes(fieldNames, property)) {
          const trap: string|IHandler = _.get(traps, property, {})
          Object.defineProperty(src, property, {
            configurable: true,
            enumerable: true,
            get: () => {
              let res: any
              if (_.isString(trap)) {
                res = _.get(target, trap)
              } else if (trap.get) {
                res = trap.get.call(src)
              } else {
                res = _.get(target, property)
              }
              return res
            },
            set: (val) => {
              if (_.isString(trap)) {
                _.set(target, trap, val)
              } else if (trap.set) {
                const ret = trap.set.call(src, val)
                _.set(target, property, ret)
              } else {
                _.set(target, property, val)
              }
            }
          })
        }
      })
  }
}

interface IHandler {
  get?: () => any
  set?: () => any
}
