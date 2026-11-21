# B11 First Question Multi-Exercise Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the official B11 first-question manual/automatic liquid-level wiring exercise while preserving the existing second question and giving each question independent drafts, records, validation, and energized simulation.

**Architecture:** Keep one shared React/SVG wiring engine and introduce a discriminated practical-question registry. Each question supplies its own fixture, segments, schematic metadata, and simulator adapter; the practical page owns shared wire/session state and dispatches question-specific simulation panels.

**Tech Stack:** React 19, TypeScript, Vite, SVG, Vitest, Testing Library, browser `localStorage`

**Spec:** `docs/superpowers/specs/2026-11-22-b11-first-question-design.md`

## Global Constraints

- Preserve the current B11 second-question connections, fixed internal wireways, single-wire highlighting, validation, simulation, and existing saved records.
- First-question behavior must follow `C:/Users/User/Tool-Robot/007003B11.pdf`, printed pages 3-10; program-only terminal labels must be described as teaching labels.
- Do not control real electrical equipment or claim that virtual terminal IDs are safe real-world wiring instructions.
- Keep first-question and second-question drafts, timers, positions, checks, hints, simulation progress, and completion records independent.
- Use discrete water-source/tank states; do not model continuous water volume, current, voltage drop, or electrode resistance.
- Every production change follows red-green-refactor and each task ends with a focused commit.

## Review Focus

- A corrupt or unknown-question draft is ignored with a warning and never loaded into another exercise; test in Task 3.
- Switching questions repeatedly preserves both incomplete wire sets and elapsed-time origins; test in Task 6.
- PB3 silences the alarm but cannot clear a dry-source condition or start the motor; test in Task 4.
- Overload remains latched across question UI actions until explicit reset; test in Task 4.
- All first-question reference wires stay in internal ducts and never cross a component or cabinet frame; test in Task 2.

---

## File Structure

- `src/practical/types.ts`: shared practical-question, segment, simulator, terminal, wire, and diagnostic types.
- `src/practical/questions.ts`: registry and lookup for question 1 and question 2.
- `src/practical/session.ts`: per-question draft/record keys, migration, serialization, and validation.
- `src/practical/simulation.ts`: discriminated simulation state/action dispatch shared by the page.
- `src/practical/q1/question.ts`: official first-question parts, terminals, nets, layout, and danger pairs.
- `src/practical/q1/segments.ts`: first-question guided wiring stages.
- `src/practical/q1/simulate.ts`: pure liquid-level control state machine.
- `src/practical/q1/circuit.ts`: applies the user-wired graph to first-question control actions.
- `src/practical/q2/index.ts`: compatibility exports for the existing second question and simulator.
- `src/components/PracticalExercise.tsx`: shared exercise state, connection workflow, validation, and persistence.
- `src/components/PracticalQuestionNav.tsx`: first/second-question selector.
- `src/components/LiquidLevelTaskPanel.tsx`: first-question controls and state display.
- Existing `Workspace`, `PartsPanel`, and second-question `TaskPanel` remain shared/compatible.

### Task 1: Shared Practical Question Contract and Registry

**Files:**
- Create: `src/practical/types.ts`
- Create: `src/practical/graph.ts`
- Create: `src/practical/graph.test.ts`
- Create: `src/practical/questions.ts`
- Create: `src/practical/questions.test.ts`
- Create: `src/practical/q2/index.ts`
- Modify: `src/b11/types.ts`
- Modify: `src/b11/graph.ts`
- Modify: `src/b11/question.ts`
- Modify: `src/b11/segments.ts`

**Interfaces:**
- Produces: `PracticalQuestion`, `PracticalQuestionId`, `SimulatorKind`, `WiringSegment`, shared graph helpers, `practicalQuestions`, `getPracticalQuestion(id)`.
- Compatibility: `src/b11/types.ts` re-exports `WiringQuestion` as `B11Question` plus the shared terminal/part/wire/diagnostic types, and `src/b11/graph.ts` re-exports shared graph helpers, so current imports remain valid without a circular type dependency.

- [ ] **Step 1: Write the failing registry tests**

Assert that the registry contains IDs `b11-q1-liquid-level` and `b11-q2-internal-wireway-v5`, that IDs are unique, `getPracticalQuestion` rejects an unknown ID, and question 2 retains `simulatorKind: 'reverse-motor'` plus its five existing segments. Add focused graph-compatibility assertions proving the old and new import paths produce identical connectivity results.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm.cmd vitest run src/practical/questions.test.ts`

Expected: FAIL because the registry and shared types do not exist.

- [ ] **Step 3: Implement the shared contract and question-2 adapter**

Define:

```ts
export type PracticalQuestionId = 'b11-q1-liquid-level' | 'b11-q2-internal-wireway-v5';
export type SimulatorKind = 'liquid-level' | 'reverse-motor';
export interface WiringQuestion {
  id: string;
  title: string;
  source: string;
  parts: Part[];
  referenceNets: string[][];
  fixedConnections: [string, string][];
  dangerPairs: [string, string][];
}
export interface PracticalQuestion extends WiringQuestion {
  id: PracticalQuestionId;
  number: 1 | 2;
  available: boolean;
  simulatorKind: SimulatorKind;
  schematic: { src: string; alt: string; sourceLabel: string };
  segments: WiringSegment[];
}
export function getPracticalQuestion(id: string): PracticalQuestion | null;
```

Use a minimal non-renderable first-question metadata stub in the production registry so the registry is complete, mark it `available: false`, and replace it atomically with the real fixture in Task 2. The app must not expose unavailable entries.

- [ ] **Step 4: Run registry tests and the complete existing suite**

Run: `pnpm.cmd vitest run src/practical/questions.test.ts src/b11`

Expected: PASS, with all existing second-question tests unchanged.

- [ ] **Step 5: Commit**

```powershell
git add src/practical/types.ts src/practical/graph.ts src/practical/graph.test.ts src/practical/questions.ts src/practical/questions.test.ts src/practical/q2/index.ts src/b11/types.ts src/b11/graph.ts src/b11/question.ts src/b11/segments.ts
git commit -m "refactor: define shared practical question registry"
```

### Task 2: Official First-Question Fixture, Components, and Wireway Layout

**Files:**
- Create: `src/practical/q1/question.ts`
- Create: `src/practical/q1/question.test.ts`
- Create: `src/practical/q1/segments.ts`
- Modify: `src/practical/questions.ts`
- Modify: `src/practical/types.ts`
- Modify: `src/components/DeviceGraphic.tsx`
- Modify: `src/components/Workspace.tsx`
- Add: `public/b11-q1-official-schematic.png`

**Interfaces:**
- Produces: `b11Question1: PracticalQuestion`, `q1WiringSegments: WiringSegment[]`; the registry replaces the unavailable stub with this fixture and sets `available: true`.
- Adds part kinds: `level-controller`, `selector`, `water-system` as required by the fixture.

- [ ] **Step 1: Write failing fixture tests**

Assert unique terminal IDs; all referenced terminals exist; required parts include `mc`, `thry`, `level`, `cos`, `pb1`, `pb2`, `pb3`, `lamp-g`, `lamp-r`, `lamp-y`, `buzzer`, tank/source electrodes, terminal blocks, motor, and earth; the earth net reaches the motor; and the registry returns the real fixture.

- [ ] **Step 2: Write the failing layout safety test**

For every part, assert its rectangle does not overlap fixed wireway rectangles. Generate every adjacent reference connection with `routeThroughWireway` and assert no non-terminal segment intersects a part or uses a cabinet-frame coordinate.

- [ ] **Step 3: Run tests and verify RED**

Run: `pnpm.cmd vitest run src/practical/q1/question.test.ts`

Expected: FAIL because the official fixture is missing.

- [ ] **Step 4: Transcribe the official first-question topology and segments**

Use printed page 9 for electrical nodes and printed page 10 for placement. Segment names and order: power/protection, manual control, automatic level control, alarm/indicators, motor/terminal blocks/earth. Keep uncertain manufacturer terminals as explicit teaching labels in `source` comments.

- [ ] **Step 5: Add illustrated graphics and the official schematic asset**

Render the official page at readable resolution, crop only the control diagram, and use a source label in the UI. Extend `DeviceGraphic` with recognizable symbols for the selector, level controller, and water system without adding third-party photographs.

- [ ] **Step 6: Run fixture, workspace, and question registry tests**

Run: `pnpm.cmd vitest run src/practical/q1/question.test.ts src/practical/questions.test.ts src/components/Workspace.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/practical/q1 src/practical/questions.ts src/practical/types.ts src/components/DeviceGraphic.tsx src/components/Workspace.tsx public/b11-q1-official-schematic.png
git commit -m "feat: define B11 first-question wiring fixture"
```

### Task 3: Per-Question Drafts, Records, and Legacy Migration

**Files:**
- Create: `src/practical/session.ts`
- Create: `src/practical/session.test.ts`
- Modify: `src/b11/session.ts`

**Interfaces:**
- Consumes: `PracticalQuestionId`, `Wire`, part positions, counters, timestamps.
- Produces:

```ts
export function draftKey(id: PracticalQuestionId): string;
export function loadQuestionDraft(storage: Storage, id: PracticalQuestionId): Draft | null;
export function saveQuestionDraft(storage: Storage, draft: Draft): boolean;
export function clearQuestionDraft(storage: Storage, id: PracticalQuestionId): void;
export function loadQuestionRecords(storage: Storage, id: PracticalQuestionId): PracticeRecord[];
export function appendQuestionRecord(storage: Storage, record: PracticeRecord): boolean;
```

- [ ] **Step 1: Write failing isolation and migration tests**

Test two simultaneous drafts, clearing only one question, record filtering, legacy `b11-draft-v1` migration into question 2, malformed JSON, unknown question IDs, and a corrupt question-1 draft that must not load into question 2.

- [ ] **Step 2: Run tests and verify RED**

Run: `pnpm.cmd vitest run src/practical/session.test.ts`

Expected: FAIL because per-question storage does not exist.

- [ ] **Step 3: Implement namespaced storage and compatibility exports**

Use keys `practical-draft-v2:<questionId>` and `practical-records-v2`. Read the legacy key only for question 2, accept the historical aliases covered by the existing session tests, validate it, normalize it to `b11-q2-internal-wireway-v5`, save it under the new key, then leave legacy data untouched for recoverability. Migrate valid `b11-records-v1` entries the same way without duplicating them.

- [ ] **Step 4: Run new and legacy session tests**

Run: `pnpm.cmd vitest run src/practical/session.test.ts src/b11/session.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/practical/session.ts src/practical/session.test.ts src/b11/session.ts
git commit -m "feat: isolate practical exercise storage by question"
```

### Task 4: First-Question Liquid-Level Circuit Simulation

**Files:**
- Create: `src/practical/q1/simulate.ts`
- Create: `src/practical/q1/simulate.test.ts`
- Create: `src/practical/q1/circuit.ts`
- Create: `src/practical/q1/circuit.test.ts`
- Create: `src/practical/simulation.ts`
- Create: `src/practical/simulation.test.ts`

**Interfaces:**
- Produces:

```ts
export type WaterLevel = 'low' | 'middle' | 'high';
export type SourceLevel = 'dry' | 'allowed' | 'full';
export type LiquidLevelAction =
  | 'manual' | 'automatic' | 'start' | 'stop' | 'silence'
  | 'tank-low' | 'tank-middle' | 'tank-high'
  | 'source-dry' | 'source-allowed' | 'source-full'
  | 'trip' | 'reset' | 'release';
export interface LiquidLevelState {
  mode: 'manual' | 'automatic';
  tank: WaterLevel;
  source: SourceLevel;
  contactor: boolean;
  motor: boolean;
  alarm: boolean;
  alarmSilenced: boolean;
  overloaded: boolean;
  lamps: { green: boolean; red: boolean; yellow: boolean };
  tested: LiquidLevelAction[];
}
export const initialLiquidLevelState: LiquidLevelState;
export function nextLiquidLevelState(state: LiquidLevelState, action: LiquidLevelAction): LiquidLevelState;
export function nextWiredLiquidLevelState(state: LiquidLevelState, action: LiquidLevelAction, question: PracticalQuestion, wires: Wire[]): LiquidLevelState;
```

- [ ] **Step 1: Write failing pure-state tests**

Cover manual start/stop, automatic low-tank start and high-tank stop, dry-source start blocking, running-to-dry immediate stop/alarm, PB3 silence without clearing dry source, overload latch, reset, and official red/green/yellow lamp states.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm.cmd vitest run src/practical/q1/simulate.test.ts`

Expected: FAIL because the state machine is missing.

- [ ] **Step 3: Implement the minimal pure reducer**

Derive contactor, motor, alarm, and lamps from mode, source, tank, overload, and the pressed action. Do not add time-based water movement.

- [ ] **Step 4: Write failing wired-circuit and dispatch tests**

Assert actions work only with required reference nets, a missing stop/overload/level-control path prevents expected behavior, an unsafe graph never energizes, and overload remains latched until `reset` even after unrelated actions.

- [ ] **Step 5: Run and verify RED, then implement graph-backed simulation dispatch**

Run: `pnpm.cmd vitest run src/practical/q1/circuit.test.ts src/practical/simulation.test.ts`

Expected before implementation: FAIL; expected after implementation: PASS.

- [ ] **Step 6: Run all simulation tests**

Run: `pnpm.cmd vitest run src/practical/q1 src/practical/simulation.test.ts src/b11/circuit.test.ts`

Expected: PASS with second-question simulation unchanged.

- [ ] **Step 7: Commit**

```powershell
git add src/practical/q1/simulate.ts src/practical/q1/simulate.test.ts src/practical/q1/circuit.ts src/practical/q1/circuit.test.ts src/practical/simulation.ts src/practical/simulation.test.ts
git commit -m "feat: simulate B11 liquid-level controls"
```

### Task 5: First-Question Validation and Diagnostic Guidance

**Files:**
- Create: `src/practical/validate.ts`
- Create: `src/practical/validate.test.ts`
- Modify: `src/b11/validate.ts`
- Modify: `src/practical/q1/question.ts`

**Interfaces:**
- Produces: `validatePracticalWiring(question, wires, referenceNets?) => Diagnostic[]`.
- Compatibility: current `validateWiring` delegates to the shared function.

- [ ] **Step 1: Write failing first-question diagnostic tests**

Test complete reference wiring, missing MC control path, bypassed overload, missing source-level electrode path, missing PB3 alarm path, live-to-earth connection, and direct source short. Assert danger diagnostics precede structure and function diagnostics.

- [ ] **Step 2: Run and verify RED**

Run: `pnpm.cmd vitest run src/practical/validate.test.ts`

Expected: FAIL because shared question-aware validation is missing.

- [ ] **Step 3: Implement generic graph checks plus question-specific functional checks**

Keep reference-net equivalence generic. Add functional rule descriptors to the first-question fixture rather than hard-coding terminal IDs in React components.

- [ ] **Step 4: Run first- and second-question validation tests**

Run: `pnpm.cmd vitest run src/practical/validate.test.ts src/b11/validate.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/practical/validate.ts src/practical/validate.test.ts src/b11/validate.ts src/practical/q1/question.ts
git commit -m "feat: validate B11 first-question wiring"
```

### Task 6: Multi-Question Practical UI and Independent Resume

**Files:**
- Create: `src/components/PracticalExercise.tsx`
- Create: `src/components/PracticalExercise.test.tsx`
- Create: `src/components/PracticalQuestionNav.tsx`
- Create: `src/components/LiquidLevelTaskPanel.tsx`
- Create: `src/components/LiquidLevelTaskPanel.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/components/TaskPanel.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- `PracticalExercise({ questionId }: { questionId: PracticalQuestionId })` owns shared wires, positions, counters, timer, diagnostics, reference visibility, and the discriminated simulation state.
- `PracticalQuestionNav({ value, onChange })` exposes accessible buttons named `第一題｜液位控制` and `第二題｜馬達正反轉`.
- `LiquidLevelTaskPanel` consumes `LiquidLevelState` and emits `LiquidLevelAction`.

- [ ] **Step 1: Write failing task-panel tests**

Assert all first-question controls and state labels render, buttons remain disabled until wiring passes, PB3 does not claim to clear dry source, and overload reset is distinct from alarm silence.

- [ ] **Step 2: Run and verify RED, then implement the first-question panel**

Run: `pnpm.cmd vitest run src/components/LiquidLevelTaskPanel.test.tsx`

Expected before implementation: FAIL; expected after implementation: PASS.

- [ ] **Step 3: Write failing practical-page switching tests**

Connect one wire in question 1, switch to question 2 and connect a different wire, switch both directions, and assert each wire set and its timer origin remain independent. Repeat switching three times. Assert a malformed/unknown draft displays a storage warning and starts clean.

- [ ] **Step 4: Run and verify RED**

Run: `pnpm.cmd vitest run src/components/PracticalExercise.test.tsx src/App.test.tsx`

Expected: FAIL because the multi-question page does not exist.

- [ ] **Step 5: Extract the shared practical controller and add question navigation**

Move practical-only state from `App` into `PracticalExercise`; keep theory/exam navigation in `App`. Dispatch task panels and simulation actions by `question.simulatorKind`. Save the outgoing question before changing the selected ID.

- [ ] **Step 6: Run component and application tests**

Run: `pnpm.cmd vitest run src/components src/App.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add src/components/PracticalExercise.tsx src/components/PracticalExercise.test.tsx src/components/PracticalQuestionNav.tsx src/components/LiquidLevelTaskPanel.tsx src/components/LiquidLevelTaskPanel.test.tsx src/App.tsx src/App.test.tsx src/components/TaskPanel.tsx src/styles.css
git commit -m "feat: add multi-question practical exercise UI"
```

### Task 7: End-to-End Completion, Documentation, and Visual Verification

**Files:**
- Modify: `README.md`
- Modify: tests discovered during full verification only when they encode obsolete single-question assumptions.

**Interfaces:**
- No new production API; this task verifies the shipped behavior.

- [ ] **Step 1: Add the complete first-question UI flow test**

Load the first-question reference wiring through the UI, check wiring, execute manual start/stop, automatic low/high transitions, dry-source alarm, PB3 silence, overload, and reset; assert one first-question completion record and no new second-question record.

- [ ] **Step 2: Run the complete test suite**

Run: `pnpm.cmd test`

Expected: every test file and test passes with zero failures.

- [ ] **Step 3: Build the production bundle**

Run: `pnpm.cmd build`

Expected: TypeScript and Vite exit 0.

- [ ] **Step 4: Perform browser verification at laptop width**

Verify: question navigation; clear first-question layout; fixed internal wireways; single-wire tracing; correct schematic; independent resume after switching; correct manual/automatic/dry-source/alarm/overload UI states; second-question regression flow.

- [ ] **Step 5: Update README scope and safety text**

Document both practical questions, first-question discrete simulation limits, per-question local records, and the requirement to verify real equipment against official drawings and an instructor.

- [ ] **Step 6: Run final verification**

Run: `pnpm.cmd test; pnpm.cmd build; git diff --check`

Expected: tests pass, build exits 0, and diff check reports no whitespace errors.

- [ ] **Step 7: Commit**

```powershell
git add README.md <only-the-specific-test-files-changed-in-this-task>
git commit -m "test: verify B11 first-question learning flow"
```
