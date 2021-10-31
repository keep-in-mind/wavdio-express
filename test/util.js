module.exports.deepFreeze = function deepFreeze (object) {

  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object)

  // Freeze properties before freezing self

  for (let name of propNames) {
    let value = object[name]

    object[name] = value && typeof value === 'object' ?
      deepFreeze(value) : value
  }

  return Object.freeze(object)
}

module.exports.copy = (object) => {
  return JSON.parse(JSON.stringify(object))
}
