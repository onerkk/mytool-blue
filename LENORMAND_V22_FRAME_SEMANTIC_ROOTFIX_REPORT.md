# Lenormand v22 Frame-Semantic Root Fix Report

Date: 2026-09-25

## Objective

This release replaces the previous subject-centric / surface-pattern question parser with a reusable semantic-frame pipeline. The goal is not to add one-off phrases for supplier, romance, lottery, or any single test case. The engine now represents a question as typed semantic roles and relations, then routes the Lenormand method from that representation.

## Architecture change

The canonical pipeline is now:

1. Normalize the utterance without changing the user's intended proposition.
2. Parse each clause into a semantic frame.
3. Resolve evaluator / actor separately from the evaluated target.
4. Resolve relation, facet, horizon, modality, polarity, and quantitative requests.
5. Build a typed entity-relation-facet graph.
6. Resolve cross-clause coreference and conditional dependencies.
7. Group clauses into semantic components rather than splitting on punctuation alone.
8. Derive question topology and method capability from the graph.
9. Route the spread from topology; when the graph is genuinely underspecified, fail closed instead of guessing a target.

The design intentionally follows established semantic-representation ideas rather than a list of divination-specific keywords: Frame Semantics / FrameNet models a situation together with its participants; AMR represents concepts and labeled relations in a traversable graph; Universal Dependencies provides a useful syntactic distinction between subjects, objects, modifiers and relative clauses in Chinese. These are design references, not claims that the local engine embeds those external parsers.

References:
- https://framenet.icsi.berkeley.edu/
- https://github.com/amrisi/amr-guidelines/blob/master/amr.md
- https://universaldependencies.org/zh/

## Structural fixes

### Evaluator is no longer the target

Example:

`我現在進貨的廠商值得長期配合嗎？`

is represented as an evaluation frame where:
- evaluator = 我
- target = 廠商
- relation = 配合
- horizon = long_term
- evaluation = worth / suitability

The old failure mode `subjectRef = 我` as the only semantic subject can no longer erase the supplier target.

### Open-class targets

Target extraction is not limited to a closed list of people or business nouns. The same frame works for ordinary noun phrases such as:
- 這份工作值得長期做嗎？
- 這間房子適合長期住嗎？
- 這個方案值得持續投入嗎？
- 這台設備適合繼續使用嗎？

Demonstratives and classifiers are normalized without converting the target into a hard-coded domain label.

### Relation and facet separation

A relationship predicate is stored separately from evaluation facets. For example:

`這個廠商可靠嗎？交期穩定嗎？品質值得信任嗎？價格合理嗎？`

becomes one target with multiple facets rather than four unrelated people/questions:
- target = 廠商
- facets = 可靠性 / 交期 / 品質 / 價格
- graph edges = facet_of(target)

This permits a nine-card multi-facet evaluation without inventing independent subjects.

### Long-term / continuity semantics

Long-term intent is now a semantic property of the relation, not just a future-keyword flag. `長期`, `長久`, and `長遠` set a long-horizon evaluation, while generic continuation such as `繼續` is represented as continuity without falsely manufacturing a dated future prediction.

### Coreference and dependency graph

Existing hidden-state → future-action chains remain supported, but the same dependency machinery now works across non-person entities. Clauses are grouped by shared target and relation instead of punctuation alone. Explicitly introduced new entities remain separate.

### Fail closed

If an evaluative question has no resolvable target, the parser returns an unresolved semantic state (`UNRESOLVED_EVALUATION_TARGET`) instead of silently selecting the user, the previous entity, or a generic spread target.

## Lenormand routing

The Lenormand engine consumes semantic topology instead of re-parsing the raw question independently.

Current evaluation routing includes:
- simple single-target evaluation -> compact line appropriate to the amount of context;
- true long-horizon evaluation -> five-card line;
- one target with multiple explicit facets -> nine-card portrait;
- existing hidden-state dependency, comparison, quantity and other previously supported topologies remain available.

The spread recommendation is a routing result only; it is not treated as card evidence.

## Shared-reader consistency

`JS/shared/question-planner.js` remains the canonical implementation. The same generated planner is embedded into:
- Lenormand runtime
- Tarot foundation reader

The build check verifies that both embedded copies match the canonical source so they cannot silently drift.

## Testing strategy

This release adds architecture-level tests instead of only replaying the bug-triggering sentence.

The v22 suite uses property / metamorphic variants across arbitrary targets and facets. It changes punctuation, politeness wrappers, word order, demonstratives, target nouns, facet nouns and relation wording and checks semantic invariants. This follows the general software-testing principle of metamorphic testing: related inputs should preserve specified semantic properties even when no single exhaustive oracle exists.

Reference:
- https://aclanthology.org/2022.findings-acl.185/

Verified on this release:
- Lenormand compatibility regression: 84 checks PASS
- v21 property/metamorphic suite: 1,850 checks PASS
- v21 extended suite total: 2,633 checks PASS
- v22 frame-graph suite: 168 checks PASS
- Question routing: 13 groups PASS
- Professional regression: 14 groups PASS / 56 routing cases
- Method/engine regression: PASS
- Core engines: 10 groups PASS
- Reading workflow: 8 groups PASS
- Reading workflow integration: 5/5 groups PASS
- Tarot method-data prompt regression: 7 tests PASS

## Scope and guarantee

No finite local natural-language parser can truthfully guarantee that every future sentence in unrestricted Chinese will always have one correct interpretation. The root fix therefore changes the failure model:

- new wording is processed through composable semantic roles rather than requiring a new per-question regex;
- known semantic relations compose into a typed graph;
- ambiguous / underspecified evaluation fails closed rather than confidently guessing;
- metamorphic tests are used to detect regressions across unseen surface variants.

This is the architectural guarantee of v22. It is materially different from adding another keyword exception for the current user question.
