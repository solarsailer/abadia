'use strict'

const program = require('commander')
const chalk = require('chalk')

const pkg = require('../package.json')

const {runConvertCommand} = require('../lib/core/convert')

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const DESCRIPTION = chalk.blue(
  `Convert two files to an intermediate representation for future comparisons`
)

// -------------------------------------------------------------
// Program.
// -------------------------------------------------------------

let originalFile, comparedFile

program
  .version(pkg.version, '-v, --version')
  .description(DESCRIPTION)
  .option('-r, --reference <file>', 'Reference file')
  .option('-o, --output <file>', 'Output file name')
  .option(
    '-i, --ignore-key [key]',
    'Keys to ignore',
    (x, acc) => [...acc, x],
    []
  )
  .arguments('<original> <compared>')
  .action((i, j) => {
    originalFile = i
    comparedFile = j
  })
  .parse(process.argv)

runConvertCommand(originalFile, comparedFile, {
  ignoredKeys: program.ignoreKey,
  outputFile: program.output,
  referenceFile: program.reference
})
