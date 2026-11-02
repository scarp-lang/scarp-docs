import assert from 'node:assert/strict'
import { extractCodeFences, firstMissingCodeBlock } from './lib/code-fences.ts'

const example = [
  '# Documentation',
  '~~~scarp',
  'bind answer = 42;',
  'print(answer);',
  '~~~',
  '',
  '````sh title=terminal',
  'scarp run hello.srp',
  '```',
  '````',
  '',
  '    ~~~text',
  '    42',
  '    ~~~',
  ''
].join('\r\n')
const fences = extractCodeFences(example)
assert.equal(fences.length, 3)
assert.deepEqual(fences.map(f => f.language), ['scarp', 'sh', 'text'])
assert.deepEqual(fences.map(f => f.line), [2, 7, 12])
assert.equal(fences[0].code, 'bind answer = 42;\nprint(answer);')
assert.equal(fences[1].code, 'scarp run hello.srp')
assert.equal(fences[2].code, '    42')

// Additional translated demonstrations are allowed, but not reordered examples.
const extra = extractCodeFences('~~~text\nअतिरिक्त व्याख्या\n~~~')
assert.equal(firstMissingCodeBlock(fences, [...extra, ...fences]), -1)
assert.equal(firstMissingCodeBlock(fences, [fences[1], fences[0], fences[2]]), 1)
assert.equal(firstMissingCodeBlock(fences, [fences[0], fences[2]]), 1)
assert.equal(firstMissingCodeBlock([], extra), -1)

// Duplicate English blocks must each be present, not just one matching snippet.
assert.equal(firstMissingCodeBlock([fences[0], fences[0]], [fences[0]]), 1)
assert.equal(firstMissingCodeBlock([fences[0], fences[0]], [fences[0], fences[0]]), -1)

// The closing marker must match the opening character and have enough length.
assert.throws(() => extractCodeFences('~~~~scarp\nprint(1);\n~~~'), /Unclosed code fence at line 1/)
assert.throws(() => extractCodeFences('```text\nhello\n~~~'), /Unclosed code fence at line 1/)
assert.deepEqual(extractCodeFences('    ```scarp\nprint(1);\n    ```'), [])
assert.deepEqual(extractCodeFences('```invalid`info\nhello'), [])

console.log('PASS: typed code-fence parser, marker validation, preserved order and duplicate matching')
