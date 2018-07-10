'use strict'

const chalk = require('chalk')
const program = require('commander')

const pkg = require('../package.json')

const {runSelectCommand} = require('../lib/core/select')

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const DESCRIPTION = chalk.blue(
  `Start an interactive shell session to select the correct value. Try to re-use the content of the output file if possible.`
)

// -------------------------------------------------------------
// Program.
// -------------------------------------------------------------

let inputFile, outputFile

program
  .version(pkg.version, '-v, --version')
  .description(DESCRIPTION)
  .option(
    '-r, --reset',
    'Start from scratch and ignore the output file existing content'
  )
  .arguments('<input> <output>')
  .action((i, j) => {
    inputFile = i
    outputFile = j
  })
  .parse(process.argv)

runSelectCommand(inputFile, outputFile, {reset: program.reset})
