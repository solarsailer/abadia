'use strict'

const fs = require('fs')
const {promisify} = require('util')

const statPromised = promisify(fs.stat)
const writeFilePromised = promisify(fs.writeFile)
const readFilePromised = promisify(fs.readFile)

// -------------------------------------------------------------
// Constants.
// -------------------------------------------------------------

const ENCODING = {encoding: 'utf-8'}

// -------------------------------------------------------------
// Code.
// -------------------------------------------------------------

async function readFile(name) {
  return await readFilePromised(name, ENCODING)
}

async function readJsonFile(name) {
  return JSON.parse(await readFilePromised(name, ENCODING))
}

async function writeFile(name, data) {
  writeFilePromised(name, data, ENCODING)
}

async function writeJsonFile(name, object) {
  writeFilePromised(name, JSON.stringify(object, null, 2), ENCODING)
}

async function isExistingFile(path) {
  try {
    const stats = await statPromised(path)
    return stats.isFile()
  } catch {
    return false
  }
}

// -------------------------------------------------------------
// Exports.
// -------------------------------------------------------------

module.exports = {
  readFile,
  readJsonFile,
  writeFile,
  writeJsonFile,
  isExistingFile
}
