# pimped-proxy
[![Build Status](https://img.shields.io/travis/Boulangerie/pimped-proxy.svg?style=flat-square)](https://travis-ci.org/Boulangerie/pimped-proxy)
[![Coveralls](https://img.shields.io/coveralls/Boulangerie/pimped-proxy.svg?branch=master)](https://coveralls.io/github/Boulangerie/pimped-proxy)
[![npm version](https://img.shields.io/npm/v/pimped-proxy.svg?style=flat-square)](https://www.npmjs.org/package/pimped-proxy)
[![npm downloads](https://img.shields.io/npm/dm/pimped-proxy.svg?style=flat-square)](http://npm-stat.com/charts.html?package=pimped-proxy&from=2016-12-01)
[![npm dependencies](https://img.shields.io/david/Boulangerie/pimped-proxy.svg)](https://david-dm.org/Boulangerie/pimped-proxy)
[![npm devDependencies](https://img.shields.io/david/dev/Boulangerie/pimped-proxy.svg)](https://david-dm.org/Boulangerie/pimped-proxy)
[![npm license](https://img.shields.io/npm/l/pimped-proxy.svg)](https://www.npmjs.org/package/pimped-proxy)

Pimped Proxy is a comprehensive and simple implementation of Proxy for JavaScript and TypeScript. It is not a replacement of
the [ES2015 Proxy object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) but it gives a simplest way to:
- lookup both simple properties and more complex paths
- transform data on the fly without altering objects
- flatten complex nested objects to a single level
- make aggregations (like arithmetical operations) on the fly
- create new full-proxy objects
- give an existing object the capability to proxy some properties 

## Install
The easiest way is to install `pimped-proxy` as `dependency`:
```sh
npm install pimped-proxy lodash --save
```

## Usage
### Proxy a list of properties
##### Creating a proxy will forward the source object properties
```js
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
var carProxy = new Proxy(car, ['brand', 'model', 'power']);
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power}`); // displays "I bought a Peugeot 308 of 112hp"
```

##### Updating a property on the source object will update it on the proxy
```js
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
var carProxy = new Proxy(car, ['brand', 'model', 'power']);
car.power = '250hp'
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power}`); // displays "I bought a Peugeot 308 of 250hp"
```

##### Property proxying is two-way binding, then updating the proxy will update the source object
```js
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
var carProxy = new Proxy(car, ['brand', 'model', 'power']);
carProxy.brand = 'Renault';
carProxy.model = 'Clio';
console.log(`I bought a ${car.brand} ${car.model} of ${car.power}`); // displays "I bought a Renault Clio of 112hp"
```

##### If some properties are not specified, then they won't be overridden
```js
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
var carProxy = new Proxy(car, ['brand', 'model']);
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power||'??'}`); // displays "I bought a Peugeot 308 of ??"
```

### Proxy a list of paths
##### Proxying with a path will just retrieve the value from the source object after evaluation of the path
```js
var car = { brand: 'Peugeot', model: '308',  engine: { power: '112hp' }};
var carProxy = new Proxy(car, {
    'brand': 'brand',
    'model': 'model',
    'power': 'engine.power'
);
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power}`); // displays "I bought a Peugeot 308 of 112hp"
```
*Path resolution uses the [_.get](https://lodash.com/docs/4.17.2#get) and  [_.set](https://lodash.com/docs/4.17.2#set) method from Lo-Dash.* 

### Proxy a list of accessors

##### Defining getters are useful to tranform the data on the fly
```js
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
var carProxy = new Proxy(car, {
  brand: {
    get: function (value) {
      return value
    }
  },
  model: {
    get: function (value) {
      return value + ' GTI'
    }
  },
  power: {
    get: function (value) {
      return '270hp'
    }
  }
});
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power}`); // displays "I bought a Peugeot 308 GTI of 270hp"
```

##### Creating setters give the possibility to dynamically alter the source object
```js
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
var carProxy = new Proxy(car, {
  brand: {
    set: (value) => {
      return String(value).toUpperCase()
    }
  },
  model: {
    set: (value) => {
      return value + ' GTI'
    }
  },
  power: {
    set: (value) => {
      return '270hp'
    }
  }
});
carProxy.brand = 'Renault';
carProxy.model = 'Clio';
carProxy.power = '140hp';
console.log(`I bought a ${car.brand} ${car.model} of ${car.power}`); // displays "I bought a RENAULT Clio GTI of 270hp"
```

### Mix the ways to proxy

```js
var car = { brand: 'Peugeot', model: '308',  engine: { power: '270hp' }};
var carProxy = new Proxy(car, {
  brand: 'brand',
  model: {
    get: function (value) {
      return value + ' GTI'
    }
  },
  power: 'engine.power'
});
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power}`); // displays "I bought a Peugeot 308 GTI of 270hp"
```

### Transform an existing object into a Proxy
```js
var existingCar = { name: 'MyCar', power: '250hp' };
var car = { brand: 'Peugeot', model: '308',  power: '112hp' };
Proxy.lookup(existingCar, car, ['brand', 'model']);
console.log(`I bought a ${carProxy.brand} ${carProxy.model} of ${carProxy.power} and I called it ${carProxy.name}`); // displays "I bought a Peugeot 308 of 250hp and I called it MyCar"
```

## License
Code licensed under [MIT License](LICENSE).
