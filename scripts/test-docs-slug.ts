import assert from 'node:assert/strict'
import { documentationHeadingSlug } from './lib/docs-slug.ts'
assert.equal(documentationHeadingSlug('Stage 1: Foundations — बुनियाद'),
  'stage-1-foundations-बुनियाद')
assert.equal(documentationHeadingSlug('Stage 2: Modules and numerical examples — मॉड्यूल और गणना'),
  'stage-2-modules-and-numerical-examples-मॉड्यूल-और-गणना')
assert.equal(documentationHeadingSlug('Stage 7: Source navigation and RMS — नवीनतम compiler tools'),
  'stage-7-source-navigation-and-rms-नवीनतम-compiler-tools')
assert.equal(documentationHeadingSlug('कक्षा में हिंदी ट्यूटोरियल'),
  'कक्षा-में-हिंदी-ट्यूटोरियल')
assert.equal(documentationHeadingSlug('Hello, **Scarp**!'), 'hello-scarp')
assert.notEqual(documentationHeadingSlug('हिन्दी'),documentationHeadingSlug('हनद'))
console.log('PASS: bilingual Markdown anchors preserve Hindi Unicode combining marks')
