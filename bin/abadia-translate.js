'use strict'

const program = require('commander')
const chalk = require('chalk')

const pkg = require('../package.json')

const {runTranslateCommand} = require('../lib/core/translate')

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const DESCRIPTION = chalk.blue(
  `Add translations to an intermediate JSON representation.`
)

// -------------------------------------------------------------
// Program.
// -------------------------------------------------------------

let inputFile

program
  .version(pkg.version, '-v, --version')
  .description(DESCRIPTION)
  .option('-i, --in-place', 'Add to input file directly')
  .option('-o, --output <file>', 'Output file name')
  .option('-f, --from <lang>', 'Translate from language (default: auto)')
  .option('-t, --to <lang>', 'Translate to language (default: en)')
  .arguments('<input>')
  .action(i => {
    inputFile = i
  })
  .parse(process.argv)

runTranslateCommand(inputFile, {
  outputFile: program.output,
  erase: program.inPlace,
  from: program.from,
  to: program.to
})
