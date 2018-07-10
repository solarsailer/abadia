'use strict'

const chalk = require('chalk')

const {ignoreLine} = require('../helpers/parser')
const {readFile, writeJsonFile, isExistingFile} = require('../helpers/file')

// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

// Convert command.
// Check files and prepare for the actual processing.
async function runConvertCommand(
  originalFile,
  comparedFile,
  {referenceFile, outputFile, ignoredKeys} = options
) {
  if (!(await checkFile(originalFile))) return
  if (!(await checkFile(comparedFile))) return

  const originalRawData = await readFile(originalFile)
  const comparedRawData = await readFile(comparedFile)

  const referenceExist = await checkFile(referenceFile, false)
  if (!referenceExist) {
    console.warn(chalk.yellow('Warning: no reference file found.'))
  }
  const referenceRawData = referenceExist ? await readFile(referenceFile) : ''

  const result = convert(originalRawData, comparedRawData, {
    referenceRawData,
    ignoredKeys
  })

  if (outputFile) {
    writeJsonFile(outputFile, result)
  } else {
    console.log(JSON.stringify(result, null, 2))
  }
}

// Check if a file exists and log errors accordingly.
async function checkFile(file, log = true) {
  if (!file) {
    log &&
      console.error(chalk.red(`Error: cannot open file (no file provided).`))

    return false
  }

  const fileExist = await isExistingFile(file)
  if (!fileExist) {
    log &&
      console.error(
        chalk.red(`Error: cannot open file ${file} (non-existing file)`)
      )

    return false
  }

  return true
}

// Convert two key-value files into a JSON for future comparisons.
function convert(
  originalRawData,
  comparedRawData,
  {referenceRawData, ignoredKeys} = options
) {
  const processPartial = x => process(x, ignoredKeys)

  const originalData = processPartial(originalRawData)
  const comparedData = processPartial(comparedRawData)
  const referenceData = processPartial(referenceRawData)

  const data = Object.entries(originalData).reduce(
    (acc, [key, originalValue]) => {
      const comparedValue = comparedData[key]
      const referenceValue = referenceData[key]

      const o = {key, originalValue, comparedValue}
      if (referenceValue) o.referenceValue = referenceValue

      acc.push(o)
      return acc
    },
    []
  )

  // Results.
  const originalKeys = Object.values(originalData).length
  const comparedKeys = Object.values(comparedData).length
  const mismatchingKeys = data.length

  return {
    sizes: {old: originalKeys, new: comparedKeys, differences: mismatchingKeys},
    data
  }
}

// -------------------------------------------------------------
// Code.
// -------------------------------------------------------------

function process(data, ignoredKeys) {
  return data
    .split('\n')
    .filter(x => ignoreLine(x, ignoredKeys))
    .map(splitLine)
    .reduce(reduceLines, {})
}

// -------------------------------------------------------------
// Helpers.
// -------------------------------------------------------------

function splitLine(x) {
  return x.split('=')
}

function reduceLines(acc, x) {
  const key = x[0].trim()
  const value = x[1].trim()

  if (!acc[key]) {
    acc[key] = []
  }

  acc[key].push({text: value})
  return acc
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = {
  runConvertCommand,
  convert
}
