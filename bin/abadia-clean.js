const program = require('commander')
const chalk = require('chalk')

const pkg = require('../package.json')

const {runCleanCommand} = require('../lib/core/clean')

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const DESCRIPTION = chalk.blue(
  `Remove comments and fluffs from the original file and sort lines alphabetically.`
)

// -------------------------------------------------------------
// Program.
// -------------------------------------------------------------

let inputFile

program
  .version(pkg.version, '-v, --version')
  .description(DESCRIPTION)
  .option('-o, --output <file>', 'Output file name')
  .option(
    '-i, --ignore-key [key]',
    'Keys to ignore',
    (x, acc) => [...acc, x],
    []
  )
  .arguments('<input>')
  .action(i => {
    inputFile = i
  })
  .parse(process.argv)

runCleanCommand(inputFile, {
  outputFile: program.output,
  ignoredKeys: program.ignoreKey
})
