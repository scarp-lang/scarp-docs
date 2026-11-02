import assert from 'node:assert/strict'
import { verifyTutorialExamples, type ExecutableExample } from './lib/tutorial-evidence.ts'

const examples: ExecutableExample[] = [
  { name: 'hello', source: 'print("Hello");\n', expected: 'Hello\n' },
  { name: 'math', source: 'print(1 + 2);\n', expected: '3\n' }
]
const sourceFence = (source: string): string => `~~~scarp\n${source.trimEnd()}\n~~~`
const outputFence = (output: string): string => `~~~text\n${output.trimEnd()}\n~~~`
const page = examples.map(item => [sourceFence(item.source), 'Explanation in Hindi is fine.', outputFence(item.expected)].join('\n\n')).join('\n\n')

assert.deepEqual(verifyTutorialExamples(page, examples), [])
assert.deepEqual(verifyTutorialExamples(`~~~sh\nscarp --version\n~~~\n\n${page}`, examples), [])
assert.deepEqual(verifyTutorialExamples(page.replaceAll('\n', '\r\n'), examples), [])
assert.deepEqual(verifyTutorialExamples(page, []), [])

const missingSource = page.replace(sourceFence(examples[0].source), sourceFence('print("Wrong");'))
assert.match(verifyTutorialExamples(missingSource, examples)[0] ?? '', /hello: missing, modified/)
const wrongOutput = page.replace(outputFence(examples[0].expected), outputFence('incorrect'))
assert.match(verifyTutorialExamples(wrongOutput, examples)[0] ?? '', /hello: missing, modified, or misplaced expected stdout/)
const missingOutput = page.replace(outputFence(examples[0].expected), '')
assert.match(verifyTutorialExamples(missingOutput, examples)[0] ?? '', /hello: missing, modified, or misplaced expected stdout/)
const outOfOrder = [...examples].reverse().map(item => `${sourceFence(item.source)}\n${outputFence(item.expected)}`).join('\n')
assert.notDeepEqual(verifyTutorialExamples(outOfOrder, examples), [])
assert.match(verifyTutorialExamples('~~~scarp\nno closing fence', examples)[0] ?? '', /Unclosed code fence/)

console.log('PASS: bilingual evidence checker accepts exact fixtures and rejects drift, missing output, reordered pairs and malformed Markdown')
