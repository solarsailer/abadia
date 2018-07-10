'use strict'

const chalk = require('chalk')
const translateGoogle = require('google-translate-api')

const {readJsonFile, writeJsonFile, isExistingFile} = require('../helpers/file')

// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

async function runTranslateCommand(
  inputFile,
  {outputFile, erase, from, to} = options
) {
  if (!inputFile) {
    console.error(
      chalk.red(`Error: cannot translate file (no input provided).`)
    )
    return
  }

  const inputExist = await isExistingFile(inputFile)
  if (!inputExist) {
    console.error(
      chalk.red(`Error: cannot translate file (non-existing file).`)
    )
    return
  }

  const fullData = await readJsonFile(inputFile)
  fullData.data = await translate(fullData.data, {from, to})

  if (outputFile) {
    writeJsonFile(outputFile, fullData)
  } else if (erase) {
    writeJsonFile(inputFile, fullData)
  } else {
    console.log(JSON.stringify(fullData, null, 2))
  }
}

async function translate(data, {from, to} = options) {
  return await Promise.all(data.map(x => addTranslations(x, {from, to})))
}

async function addTranslations(x, {from, to} = options) {
  const result = {...x}

  try {
    result.originalValue = await translateValues(result.originalValue, from, to)
    result.comparedValue = await translateValues(result.comparedValue, from, to)
  } catch (e) {
    console.error(`Couldn't use Google Translate for '${x.key}' (${e.code}).`)
  }

  console.info(chalk.green(`Translated ${x.key}!`))

  return result
}

async function translateValues(values, from = 'auto', to = 'en') {
  const config = {from, to}

  const translatedValues = values.map(x => {
    return translateGoogle(x.text, config)
      .then(result => ({
        ...x,
        translation: result.text
      }))
      .catch(e => ({...x}))
  })

  return Promise.all(translatedValues)
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = {
  runTranslateCommand,
  translate
}
