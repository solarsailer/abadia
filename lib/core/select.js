'use strict'

const prompt = require('prompt')
const chalk = require('chalk')
const is = require('@sindresorhus/is')
const {promisify} = require('util')

const {readJsonFile, writeJsonFile, isExistingFile} = require('../helpers/file')

prompt.get = promisify(prompt.get)
prompt.message = ''
prompt.delimiter = ''
prompt.colors = false

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const SELECT_VALUE = {
  properties: {
    action: {
      description:
        'Use original, new or custom value? ' +
        chalk.dim('(original/new/edit/ignore/stop)'),
      message: 'Non-available action.',
      type: 'string',
      pattern: /^(o|original|n|new|e|edit|i|ignore|s|stop)$/,
      required: true
    }
  }
}

const EDIT_VALUE = {
  properties: {
    value: {
      description: 'Custom value:',
      type: 'string',
      required: true
    }
  }
}

// -------------------------------------------------------------
// Module.
// -------------------------------------------------------------

async function runSelectCommand(inputFile, outputFile, {reset} = options) {
  select(inputFile, outputFile, {reset})
}

async function select(inputFile, outputFile, {reset} = options) {
  if (!inputFile) {
    console.error(chalk.red(`Error: cannot select values (no input provided).`))
    return
  }

  if (!outputFile) {
    console.error(chalk.red(`Error: no output path provided.`))
    return
  }

  const inputExist = await isExistingFile(inputFile)
  if (!inputExist) {
    console.error(chalk.red(`Error: cannot select values (non-existing file).`))
    return
  }

  const {data} = await readJsonFile(inputFile)

  // No reset flag? Try to find a previous valid result.
  // This allows us to do the process in multiple steps.
  const previous = await getPreviousResult(outputFile)
  const exportedData = reset ? {} : {...previous}

  prompt.start()

  // Iterate over each value of the original JSON file.
  for (const x of data) {
    if (exportedData[x.key]) continue

    showHeader(x)

    let result
    try {
      const promptValue = await prompt
        .get(SELECT_VALUE)
        .then(promptValue => promptValue.action[0])

      result = await handlePromptValue(x, promptValue)
    } catch (e) {
      if (e.message === 'STOPPED') {
        showEnd()
        console.log(chalk.dim('Was manually ended by user.'))

        writeJsonFile(outputFile, exportedData)
        return
      }

      // Add newline for correct formatting (stay on the prompt line otherwise).
      console.log('')
    }

    if (result) {
      exportedData[x.key] = cleanValue(result)

      console.log('')
      console.log(
        `  ❯ Used ${chalk.underline.blue(x.key)} → ${showValue(result)}.`
      )
    } else {
      ignoreValue(x.key)
    }
  }

  showEnd()
  writeJsonFile(outputFile, exportedData)
}

// Try to get some data from the outputFile.
async function getPreviousResult(outputFile) {
  const outputExist = await isExistingFile(outputFile)
  if (!outputExist) {
    return {}
  }

  try {
    return await readJsonFile(outputFile)
  } catch {
    console.warn(
      chalk.yellow(`Warning: couldn't reuse output file (non-valid JSON).`)
    )
    return {}
  }
}

async function handlePromptValue(x, action) {
  switch (action) {
    case 'o':
      return x.originalValue

    case 'n':
      return x.comparedValue

    case 'e':
      return await prompt
        .get(EDIT_VALUE)
        .then(x => x.value)
        .catch(err => {
          if (err) {
            console.log('')
            console.error(chalk.red(`Cannot edit value for ${x.key}.`))
          }
        })

    case 'i':
      return

    case 's':
      throw new Error('STOPPED')
  }
}

// -------------------------------------------------------------
// Helper.
// -------------------------------------------------------------

function cleanValue(value) {
  if (is.string(value)) return value

  return value.reduce((acc, x) => {
    acc.push(x.text)
    return acc
  }, [])
}

// -------------------------------------------------------------
// Message.
// -------------------------------------------------------------

function ignoreValue(text) {
  console.log('')
  console.error(`  ❯ Ignored ${chalk.underline.red(text)}.`)
}

function showValue(value) {
  if (is.string(value)) return chalk.bold.blue(value)

  return value.reduce((acc, x, i) => {
    if (i !== 0) acc += ', '

    acc += `${chalk.bold.blue(x.text)}`
    if (x.translation) acc += ` (${chalk.yellow(x.translation)})`

    return acc
  }, '')
}

function showHeader(x) {
  const referenceValue = x.referenceValue
    ? ': ' + x.referenceValue.map(x => x.text).join(', ')
    : ''

  console.log('')
  console.log('-------------------------------------------------------------')
  console.log('')
  console.log(chalk.underline.blue(x.key) + referenceValue)
  console.log('')
  console.log(chalk.red('Before') + ':', showValue(x.originalValue))
  console.log(chalk.green('After') + ': ', showValue(x.comparedValue))
  console.log('')
}

function showEnd() {
  console.log('')
  console.log('-------------------------------------------------------------')
  console.log('')
  console.log('All done.')
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = {
  runSelectCommand,
  select
}
