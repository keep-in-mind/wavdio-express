module.exports.deepFreeze = function deepFreeze (object) {
  const propNames = Object.getOwnPropertyNames(object)

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name]
    object[name] = value && typeof value === 'object' ? deepFreeze(value) : value
  }

  return Object.freeze(object)
}
