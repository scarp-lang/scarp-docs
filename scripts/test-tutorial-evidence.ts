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
assert.throws(() => verifyTutorialExamples('~~~scarp\nno closing fence', examples), /Unclosed code fence/)

// Multi-file programs require the full module sources before the entry point.
const modules: ExecutableExample[] = [{
  name: 'modules',
  source: 'import "modules/linear.srp" as linear;\nprint(linear.predict([2.0, 1.0]));',
  expected: '[4.0, 1.0]\n',
  supportingSources: [
    { name: 'modules/settings.srp', source: 'pub bind gain = 1.0;\n' },
    { name: 'modules/linear.srp', source: 'import "settings.srp" as settings;\n' }
  ]
}]
const modulePage = [
  sourceFence(modules[0].supportingSources![0].source),
  sourceFence(modules[0].supportingSources![1].source),
  sourceFence(modules[0].source),
  '~~~sh\nscarp check main.srp\nscarp run main.srp\n~~~',
  outputFence(modules[0].expected)
].join('\n\n')
assert.deepEqual(verifyTutorialExamples(modulePage, modules), [])
assert.deepEqual(verifyTutorialExamples(modulePage.replaceAll('\n', '\r\n'), modules), [])
const changedModule = modulePage.replace('pub bind gain = 1.0;', 'pub bind gain = 2.0;')
assert.match(verifyTutorialExamples(changedModule, modules)[0] ?? '', /supporting source modules\/settings.srp/)
const missingModule = modulePage.replace(sourceFence(modules[0].supportingSources![1].source), '')
assert.match(verifyTutorialExamples(missingModule, modules)[0] ?? '', /supporting source modules\/linear.srp/)
const reorderedModules = modulePage.replace(
  sourceFence(modules[0].supportingSources![0].source) + '\n\n' + sourceFence(modules[0].supportingSources![1].source),
  sourceFence(modules[0].supportingSources![1].source) + '\n\n' + sourceFence(modules[0].supportingSources![0].source)
)
assert.notDeepEqual(verifyTutorialExamples(reorderedModules, modules), [])
const wrongModuleOutput = modulePage.replace('[4.0, 1.0]', '[0.0, 0.0]')
assert.match(verifyTutorialExamples(wrongModuleOutput, modules)[0] ?? '', /expected stdout/)
const wrongIntermediateFence = modulePage.replace(
  '~~~sh\nscarp check main.srp\nscarp run main.srp\n~~~',
  sourceFence('print("unrelated");')
)
assert.match(verifyTutorialExamples(wrongIntermediateFence, modules)[0] ?? '', /expected stdout/)

console.log('PASS: bilingual evidence checker accepts exact fixtures and rejects drift, missing output, reordered pairs and malformed Markdown')
