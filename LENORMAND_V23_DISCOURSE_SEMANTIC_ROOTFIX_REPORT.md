# Lenormand v23 Discourse-Semantic Root Fix

Date: 2026-09-26

## Goal

This rebuild targets the failure mode where every new natural-language question required another local regex/keyword patch. The fix moves question understanding ahead of spread routing and separates discourse structure from logical dependency.

The pipeline is now:

`raw text -> discourse units -> illocution -> semantic frames -> entity/proposition coreference -> question graph -> logical dependency graph -> spread routing -> Lenormand geometry`

The design follows the same separation used in linguistic parsing/semantic representation: Universal Dependencies distinguishes clausal arguments and reported speech, while AMR-style semantics represents relations such as “who does what to whom” as a graph instead of a list of keyword hits.

References used for the architecture review:
- Universal Dependencies, Mandarin Chinese relations: https://universaldependencies.org/zh/dep/index.html
- Universal Dependencies, reported speech / ccomp: https://universaldependencies.org/u/dep/ccomp.html
- AMR specification: https://github.com/amrisi/amr-guidelines/blob/master/amr.md

## What changed structurally

### 1. Discourse units have explicit types

The planner now separates:
- `question`
- `context / observed event`
- `example`
- `reported speech`

An embedded question spoken by another person is not automatically treated as the user's own reading question.

Example:

`女友跟我愛愛時，問我可以叫我其他稱號嗎？`

is parsed as an observed/reported-speech context, not as a branch to be divined.

### 2. Entity coreference and proposition coreference are different graphs

`她` can point to a person.

`這是因為……嗎？` can point to a previously described event/proposition.

The engine now stores these separately as actor/entity links and `propositionRef` links. This prevents `這` from becoming an artificial person/route label.

### 3. Discourse continuity is not logical dependency

The previous engine could treat “same person mentioned next” as a dependency. v23 separates:
- `discourseLinks`: same actor, continuation, example, proposition reference
- `dependencies`: only true logical/conditional dependencies

Thus two questions about the same person can remain independent if their predicates/objects differ.

### 4. Required arguments are validated; arbitrary semantic caps are removed

Removed:
- the arbitrary six-branch semantic ceiling
- the six-member coordinated-actor parser ceiling
- sentence-specific routing patches used only to handle previous examples

Retained as structural invariants:
- a multi-option reading with no actual options is incomplete rather than fabricated
- independent Lenormand lines use 3 cards each, so the physical 36-card deck supports at most 12 such lines in one draw; question semantics are not truncated if there are more, but the draw reports `DECK_CAPACITY` and asks for separate casts

This is not a prompt restriction. It is a method/data invariant.

### 5. Predicate heads no longer confuse adverbs/modifiers with actions

`主動追求` now resolves to predicate `追求` with `主動` as a modifier, rather than creating a false subject such as `會主動`.

### 6. Speech verbs can be ordinary actions

`他會回覆嗎？` is now a normal top-level question.

It is no longer misclassified as reported speech merely because `回覆` is also in the speech-verb lexicon. Reported speech requires actual embedded content after the speech predicate.

### 7. Shared parser remains canonical

`JS/shared/question-planner.js` is the canonical planner and is generated into both:
- `JS/lenormand.js`
- `JS/tarot-foundation.js`

`node scripts/build-question-planner.cjs --check` passes, so the two readers are not carrying divergent copies of the semantic parser.

## Exact regression for the latest user question

Input:

`女友跟我愛愛時，問我可以叫我其他稱號嗎？例如大哥 大叔。這是因為她需要性幻想嗎？那未來是否會同意一起3p，兩女一男。`

v23 resolves:

1. Context / reported speech
   - speaker: `女友`
   - addressee: `我`
   - content: `可以叫我其他稱號嗎`

2. Example
   - `大哥 大叔`
   - linked to the context; consumes no reading branch

3. Real question 1
   - `這是因為她需要性幻想嗎`
   - subject resolves to `女友`
   - `這` resolves to the first context proposition
   - object: `性幻想`

4. Real question 2
   - `那未來是否會同意一起3p,兩女一男`
   - subject inherits `女友`
   - object: `3p,兩女一男`

Result:
- question count: 2
- context count: 1
- example count: 1
- logical dependencies between the two real questions: 0
- mode: `multi_question`
- auto spread: independent branches
- cards required: 6

The former incorrect 3-route / 9-card binding is eliminated.

## Regression coverage actually executed

All of the following were run against this working tree after the final changes.

### Lenormand-specific
- legacy compatibility: **84 checks PASS**
- v23 discourse-semantic suite: **407 checks PASS**
- combined `npm run test:lenormand`: **PASS**

The v23 suite covers:
- reported questions vs top-level questions
- examples/appositions
- proposition anaphora
- entity/pronoun coreference
- same-actor independent questions
- true hidden-state -> later-action dependency
- external/deictic pronouns
- observed context vs question branches
- long-term/evaluation frames
- missing option arguments
- >6 branches without truncation
- 12 independent Lenormand branches = 36 cards
- 13 branches preserved semantically but rejected only by physical deck capacity
- punctuation/full-width/polite-wrapper metamorphic invariance
- cross-actor/property generated corpus
- exact amount/count regressions
- direct speech-predicate regression such as `他會回覆嗎？`
- shared-source/version integrity

### Shared/system regressions
- `test:question-routing`: **13 groups PASS**
- `test:professional`: **14 groups PASS**, including 56 routing cases plus draw/export/geometry checks
- `test:core-engines`: **10 groups PASS**
- `test:reading-workflow`: **8 groups PASS** + integration **5/5 PASS**
- `test:methods`: **6 engine groups PASS**, with downstream audit/prompt groups also passing

### Full `npm test`

The full suite was also started. It passed through the Lenormand, routing-related, professional, API, interaction, display, audit, ritual, and other earlier suites until `test:cinematic` reached tests that import the external `three` package.

The full suite then stopped with:

`ERR_MODULE_NOT_FOUND: Cannot find package 'three'`

This is an existing test-environment dependency issue in the cinematic/Three.js suite, not a Lenormand semantic failure. No claim is made that the entire repository is green.

## Version / cache

- Lenormand public API: `23.0.0`
- cache token: `JS/lenormand.js?v=20260926ln23`

## Files changed for this rebuild

- `index.html`
- `lenormand.js`
- `JS/lenormand.js`
- `JS/tarot-foundation.js`
- `JS/shared/question-planner.js`
- `package.json`
- `tests/lenormand-v19-engine-rootfix-20260925.cjs`
- `tests/question-routing-20260922.cjs`
- `tests/lenormand-semantic-v23-discourse-20260926.cjs`
- `LENORMAND_V23_DISCOURSE_SEMANTIC_ROOTFIX_REPORT.md`

## Scope statement

This rebuild does not claim that a finite browser-side parser can understand every possible Chinese utterance with perfect human-level semantics. What changed is the failure model: new phrasing is no longer supposed to be solved by adding a dedicated rule for the entire sentence. The engine first represents discourse acts, events, entities, references and dependencies as typed structure, and only then chooses a spread.

No new prompt restriction was added to repair these cases.
