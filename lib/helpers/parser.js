// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

function ignoreLine(x, ignoredKeys = []) {
  if (x.trim() === '') return false
  if (x.startsWith('#')) return false

  // Stop if no '=' (not a key-value).
  const split = x.split('=')
  if (split.length !== 2) return false

  // Check if key matches one of the ignored keys.
  const key = split[0].trim()
  if (ignoredKeys.some(x => x === key)) return false

  return true
}

module.exports = {ignoreLine}
