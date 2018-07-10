const chalk = require('chalk')

const {ignoreLine} = require('../helpers/parser')
const {readFile, writeFile, isExistingFile} = require('../helpers/file')

// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

async function runCleanCommand(inputFile, {outputFile, ignoredKeys} = options) {
  if (!inputFile) {
    console.error(chalk.red('Error: cannot clean file (no input provided).'))
    return
  }

  const fileExist = await isExistingFile(inputFile)
  if (!fileExist) {
    console.error(chalk.red('Error: cannot clean file (non-existing file).'))
    return
  }

  const inputFileData = await readFile(inputFile)
  const data = clean(inputFileData, {ignoredKeys})

  if (outputFile) {
    writeFile(outputFile, data)
  } else {
    console.log(data)
  }
}

function clean(data, {ignoredKeys} = options) {
  const ignoreLinePartial = x => ignoreLine(x, ignoredKeys)

  const lines = data.split('\n')

  // Extract the header.
  // Invert filter to be sure it's not a key-value line.
  const header = lines.slice(0, 2).filter(x => !ignoreLinePartial(x))

  // And clean the rest.
  const keys = lines
    .filter(ignoreLinePartial)
    .map(contractLine)
    .sort()

  return [...header, '', ...keys].join('\n')
}

function contractLine(x) {
  const splitted = x.split('=')

  return `${splitted[0].trim()} = ${splitted[1].trim()}`
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = {runCleanCommand, clean}
