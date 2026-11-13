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

assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.3 -->\n~~~sh\nscarp exec hello.srp\nscarp verify hello.srp\nscarp inspect ast hello.srp\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.3 -->\n~~~sh\nscarp build hello.srp\nscarp compile hello.srp\n~~~').length, 2)
assert.equal(checkSnippetPolicy('~~~sh\nscarp exec hello.srp\nscarp verify hello.srp\nscarp inspect ast hello.srp\n~~~').length, 3)

assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.4 -->\n~~~sh\nscarp create hello-world\nscarp verify hello-world\nscarp launch hello-world\nscarp exec hello-world/src/main.srp\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.3 -->\n~~~sh\nscarp launch hello-world\nscarp create hello-world\n~~~').length, 2)
assert.equal(checkSnippetPolicy('~~~sh\nscarp create hello-world\nscarp launch hello-world\n~~~').length, 2)
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.4 -->\n~~~sh\nscarp build hello-world\n~~~').length, 1)

assert.deepEqual(checkSnippetPolicy('<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.4 -->\n~~~sh\nscarp exec app.srp\nscarp verify app.srp\nscarp create hello-world\nscarp verify hello-world\nscarp launch hello-world\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.4 -->\n~~~sh\nscarp build hello-world\nscarp compile hello-world\n~~~').length, 2)
assert.equal(checkSnippetPolicy('<!-- scarp-migration: v0.0.5-alpha.3 -> v0.0.5-alpha.5 -->\n~~~sh\nscarp create hello-world\n~~~').length, 1)

assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.5 -->\n~~~sh\nscarp create hello-scarp\nscarp inspect modules --json hello-scarp\nscarp launch hello-scarp\n~~~'), [])
assert.ok(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.4 -->\n~~~sh\nscarp inspect modules --json hello-scarp\n~~~')
  .some(issue => issue.message.includes('requires published alpha.5')))
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.5 -->\n~~~sh\nscarp compile file.srp\n~~~').length, 1)

assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.1 -->\\n~~~sh\\nscarp inspect symbols --json demo.srp\\nscarp inspect references --json demo.srp\\nscarp create sample\\nscarp exec demo.srp\\n~~~'.replaceAll('\\n','\n')), [])
assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.2 -->\\n~~~sh\\nscarp verify examples/hello.srp\\nscarp exec examples/hello.srp\\n~~~'.replaceAll('\\n','\n')), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.2 -->\\n~~~sh\\nscarp compile demo.srp\\n~~~'.replaceAll('\\n','\n')).length, 1)
assert.ok(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.5-alpha.5 -->\\n~~~sh\\nscarp inspect symbols --json demo.srp\\n~~~'.replaceAll('\\n','\n'))
  .some(x => x.message.includes('requires published alpha.6')))

assert.deepEqual(checkSnippetPolicy("<!-- scarp-cli-release: v0.0.6-alpha.5 -->\n~~~sh\nscarp exec demo.srp\nscarp inspect symbols --json demo.srp\nscarp verify demo.srp\n~~~"), [])
assert.equal(checkSnippetPolicy("<!-- scarp-cli-release: v0.0.6-alpha.5 -->\n~~~sh\nscarp compile demo.srp\n~~~").length, 1)

assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.6 -->\n~~~sh\nscarp exec demo.srp\nscarp verify demo.srp\nscarp inspect symbols --json demo.srp\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.6 -->\n~~~sh\nscarp compile demo.srp\n~~~').length,1)


assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.7 -->\n~~~sh\nscarp exec examples/conditional_unicode.srp\nscarp verify examples/conditional_unicode.srp\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.7 -->\n~~~sh\nscarp compile examples/conditional_unicode.srp\n~~~').length, 1)
assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.8 -->\n~~~sh\nscarp init demo\nscarp verify demo\nscarp run demo\nscarp project info --json demo\nscarp test --list demo\nscarp test --require-tests demo\nscarp exec demo.srp\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.7 -->\n~~~sh\nscarp init demo\nscarp test demo\nscarp project info demo\n~~~').length, 3)
assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.8 -->\n~~~scarp\nassert(true, "works");\n~~~'), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.7 -->\n~~~scarp\nassert(true);\n~~~').length, 1)
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.8 -->\n~~~sh\nscarp compile demo.srp\n~~~').length, 1)

assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.9 -->\\n~~~sh\\nscarp exec examples/bigint_arithmetic.srp\\nscarp verify examples/bigint_arithmetic.srp\\nscarp test --json=v2 calculator\\n~~~'.replaceAll('\\n','\\n')), [])
assert.ok(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.8 -->\\n~~~sh\\nscarp test --json=v2 calculator\\n~~~'.replaceAll('\\n','\\n'))
  .some(x => x.message.includes('requires published alpha.9')))
assert.deepEqual(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.8 -->\\n~~~sh\\nscarp test --json calculator\\n~~~'.replaceAll('\\n','\\n')), [])
assert.equal(checkSnippetPolicy('<!-- scarp-cli-release: v0.0.6-alpha.9 -->\\n~~~sh\\nscarp compile demo.srp\\n~~~'.replaceAll('\\n','\\n')).length,1)

console.log('PASS: executable Scarp and shell examples reject deprecated syntax without flagging prose, quotes or comments')
