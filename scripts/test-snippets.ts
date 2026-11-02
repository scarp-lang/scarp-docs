import assert from 'node:assert/strict'
import { checkSnippetPolicy } from './lib/snippet-policy.ts'

assert.deepEqual(checkSnippetPolicy('# Empty page\n'), [])
assert.deepEqual(checkSnippetPolicy('~~~text\nscarp build app.srp\n~~~'), [])
assert.deepEqual(checkSnippetPolicy('The old `let` syntax was replaced.\n'), [])
assert.deepEqual(checkSnippetPolicy('~~~scarp\n// let count = 1;\nprint("let count = 1;");\nbind count = 1;\nvar total = 2;\n~~~'), [])
assert.deepEqual(checkSnippetPolicy('~~~sh\nscarp check main.srp\nscarp run main.srp\ncargo build --locked\n~~~'), [])

const oldBinding = checkSnippetPolicy('Intro\n~~~scarp\nlet count = 1;\nlet mut total = 0;\n~~~')
assert.equal(oldBinding.length, 2)
assert.deepEqual(oldBinding.map(issue => issue.line), [3, 4])
assert.match(oldBinding[0].message, /legacy let/)
assert.equal(checkSnippetPolicy('~~~scarp\nfn add(a: integer) {\n}\n~~~').length, 1)
assert.equal(checkSnippetPolicy('~~~scarp\nfunction test() {}\n~~~').length, 1)

const unsupported = checkSnippetPolicy('~~~sh\nscarp build main.srp\n$ scarp compile main.srp\nscarp exec main.srp\nscarp inspect main.srp\n~~~')
assert.equal(unsupported.length, 4)
assert.deepEqual(unsupported.map(issue => issue.line), [2, 3, 4, 5])
assert.deepEqual(checkSnippetPolicy('~~~scarp\nprint("scarp build foo");\n~~~'), [])
assert.deepEqual(checkSnippetPolicy('~~~bash\n# scarp build is unavailable\nscarp --version\n~~~'), [])

console.log('PASS: executable Scarp and shell examples reject deprecated syntax without flagging prose, quotes or comments')
