import { createReadStream, createWriteStream } from 'fs'
import { createInterface } from 'readline'
import { compose, curry } from './fp'

const input = process.argv[2]

if (!input) {
  console.error('Specify a file first')
}

let lineCnt = 0

const isBlankLine = (input: string) => (/^\s*$/.test(input) ? null : input)

const processKeyValuePair = (input: string | null) => {
  if (!input) return null
  const [key, values] = input.split(':')
  return `${processKey(key)}: ${processValues(values.trim())}`
}

const processKey = (key: string) => {
  const regex = /^(\s*)([a-zA-Z]+)$/
  if (!regex.test(key)) {
    throw Error(`Key ${key} is invalid. It can only be [a-zA-Z]`)
  }
  return key.replace(regex, '\t$1"$2"')
}

const processValues = (values: string) => {
  if (!values.length) {
    return '{'
  }

  if (/^\d+$/.test(values)) {
    return values
  }

  return `"${values}"`
}

const addNewline = (input: string | null) => `${input?.trimEnd() || ''}\n`

const processLine = compose(isBlankLine, processKeyValuePair, addNewline)

// @ts-ignore TS doesn't know `output` exists
const writeLineToInterface = (rl: Interface, line: string) =>
  rl.output.write(line)

const main = () => {
  const rl = createInterface({
    input: createReadStream(input),
    output: createWriteStream(input.replace('.sson', '.json')),
  })

  const write = curry(writeLineToInterface, rl)

  rl.on('line', (input: string) => {
    if (!lineCnt) {
      write('{\n')
      write(processLine(input))
    } else {
      write(processLine(input))
    }
    lineCnt++
  })

  rl.on('close', () => {
    write('\n}')
    console.log("We're done.")
  })
}

main()
