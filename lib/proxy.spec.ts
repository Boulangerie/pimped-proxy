import {Proxy} from './proxy'
import { expect } from 'chai'

describe('Proxy', () => {

  describe('using no parameter', () => {
    it('should retrieve all the properties from the parent object', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      let carProxy: ICar = <ICar> new Proxy(car)
      expect(carProxy.brand).to.equal('Peugeot')
      expect(carProxy.model).to.equal('308')
      expect(carProxy.power).to.equal('112hp')
    })
  })

  describe('using an array of properties', () => {
    it('should retrieve the given properties from the parent object', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      let carProxy: ICar = <ICar> new Proxy(car, ['brand', 'model', 'power'])
      expect(carProxy.brand).to.equal('Peugeot')
      expect(carProxy.model).to.equal('308')
      expect(carProxy.power).to.equal('112hp')
    })

    it('should not retrieve the missing properties from the parent object', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      const carProxy: ICar = <ICar> new Proxy(car, ['brand', 'model'])
      expect(carProxy.brand).to.equal('Peugeot')
      expect(carProxy.model).to.equal('308')
      expect(carProxy.power).to.be.undefined
    })

    it('should equal the parent object properties if they change', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      const carProxy: ICar = <ICar> new Proxy(car, ['brand', 'model'])
      expect(carProxy.model).to.equal('308')
      car.model = '207'
      expect(carProxy.model).to.equal('207')
    })

    it('should override the given properties onto the parent object', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      const carProxy: ICar = <ICar> new Proxy(car, ['brand', 'model', 'power'])
      carProxy.brand = 'Renault'
      carProxy.model = 'Clio'
      carProxy.power = '75hp'
      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.power).to.equal('75hp')
    })

    it('should not override the missing properties onto the parent object', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      const carProxy: ICar = <ICar> new Proxy(car, ['brand', 'model'])
      carProxy.brand = 'Renault'
      carProxy.model = 'Clio'
      carProxy.power = '75hp'
      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.power).not.to.equal('75hp')
    })
  })

  describe('using on object of property formatters', () => {

    it('should retrieve and override the given properties from the parent object', () => {
      const car: IEngineCar = {
        brand: 'Peugeot',
        model: '308',
        engine: {
          power: '112hp'
        }
      }
      const carProxy: ICar = <ICar> new Proxy(car, {
        brand: 'model',
        model: 'brand',
        power: 'engine.power'
      })

      expect(carProxy.brand).to.equal('308')
      expect(carProxy.model).to.equal('Peugeot')
      expect(carProxy.power).to.equal('112hp')

      // As setters are not specified, the default setters are used (the same as for the array of properties)
      carProxy.brand = 'Clio'
      carProxy.model = 'Renault'
      carProxy.power = '75hp'

      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.engine.power).to.equal('75hp')
      expect(carProxy.brand).to.equal('Clio')
      expect(carProxy.model).to.equal('Renault')
      expect(carProxy.power).to.equal('75hp')
    })

    it('should retrieve and override properties even it they do not exist on parent object yet', () => {
      const car: IEngineCar = <IEngineCar> {
        brand: 'Peugeot'
      }
      const carProxy: ICar = <ICar> new Proxy(car, {
        brand: 'brand',
        model: 'model',
        power: 'engine.power'
      })

      expect(carProxy.brand).to.equal('Peugeot')
      expect(carProxy.model).to.be.undefined
      expect(carProxy.power).to.be.undefined

      // As setters are not specified, the default setters are used (the same as for the array of properties)
      carProxy.brand = 'Renault'
      carProxy.model = 'Clio'
      carProxy.power = '75hp'

      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.engine.power).to.equal('75hp')
    })

    it('should not proxy properties if the target is not an object', () => {

      let car: string = ''
      const carProxy: ICar = <ICar> new Proxy(car, ['brand'])

      expect(carProxy.brand).to.be.undefined

      carProxy.brand = 'Renault'

      expect(car).not.to.have.ownProperty('brand')
      expect(carProxy.brand).to.be.undefined
    })

    it('should retrieve the given properties from the parent object through accessors', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      const carProxy: ICar = <ICar> new Proxy(car, {
        brand: {
          get: (value) => {
            return value + ' 2015'
          }
        },
        model: {
          get: (value) => {
            return value + ' GTI'
          }
        },
        power: {
          get: () => {
            return '270hp'
          }
        }
      })

      expect(carProxy.brand).to.equal('Peugeot 2015')
      expect(carProxy.model).to.equal('308 GTI')
      expect(carProxy.power).to.equal('270hp')

      // As setters are not specified, the default setters are used (the same as for the array of properties)
      carProxy.brand = 'Renault'
      carProxy.model = 'Clio'
      carProxy.power = '75hp'
      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.power).to.equal('75hp')
      expect(carProxy.brand).to.equal('Renault 2015')
      expect(carProxy.model).to.equal('Clio GTI')
      expect(carProxy.power).to.equal('270hp')
    })

    it('should override the given properties onto the parent object through accessors', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }
      const carProxy: ICar = <ICar> new Proxy(car, {
        brand: {
          set: (value) => {
            return value
          }
        },
        model: {
          set: (value) => {
            return value
          }
        },
        power: {
          set: (value) => {
            return value
          }
        }
      })

      // As getters are not specified, the default getters are used (the same as for the array of properties)
      expect(carProxy.brand).to.equal('Peugeot')
      expect(carProxy.model).to.equal('308')
      expect(carProxy.power).to.equal('112hp')

      carProxy.brand = 'Renault'
      carProxy.model = 'Clio'
      carProxy.power = '75hp'
      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.power).to.equal('75hp')
    })
  })

  describe('as a function', () => {

    it('should retrieve the given properties from the parent object', () => {
      const car: ICar = {
        brand: 'Peugeot',
        model: '308',
        power: '112hp'
      }

      const carProxy: ICar = {
        brand: '',
        model: '',
        power: ''
      }
      Proxy.lookup(carProxy, car, ['brand', 'model', 'power'])

      expect(carProxy.brand).to.equal('Peugeot')
      expect(carProxy.model).to.equal('308')
      expect(carProxy.power).to.equal('112hp')

      carProxy.brand = 'Renault'
      carProxy.model = 'Clio'
      carProxy.power = '75hp'

      expect(car.brand).to.equal('Renault')
      expect(car.model).to.equal('Clio')
      expect(car.power).to.equal('75hp')
    })
  })
})

interface ICar {
  brand: string
  model: string
  power: string
}

interface IEngineCar {
  brand: string
  model: string
  engine: IEngine
}

interface IEngine {
  power: string
}
