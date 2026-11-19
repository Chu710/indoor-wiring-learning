# B11 Motor Control Simulator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a laptop-first B11 second-question motor-control wiring exercise with connection checks, guided hints, energized simulation, and local practice records.

**Architecture:** A React and TypeScript single-page app renders components and wires in SVG. A separate B11 question fixture defines terminals and reference nets; pure functions validate an undirected connection graph and run the control-state simulation. Browser storage saves draft work and completed records.

**Tech Stack:** React, TypeScript, Vite, SVG, Vitest, Testing Library, browser `localStorage`.

**Spec:** `docs/superpowers/specs/2026-11-19-b11-motor-control-simulator-design.md`

## Global Constraints

- The first release covers only the motor-control-box portion of indoor-wiring certificate B11 question 2, on a laptop browser.
- The official B11 reference is `C:/Users/User/Tool-Robot/007003B11.pdf`, especially the second-question instructions and wiring diagrams. Transcribe terminal labels and topology from it before asserting an answer.
- No accounts, backend, cloud sync, academic question bank, camera, or real hardware control.
- Four selectable wire colors: red, white, black, green.
- The user can remove or reconnect a wire without resetting the exercise.
- Dangerous wiring blocks energizing; feedback proceeds from area to function to terminal direction, with full answer only on explicit request.
- Store draft and completed practice data in `localStorage`; a storage failure must not stop the session.
- Main operating text is at least 14 px and states have both text and color cues.

## File Map

- `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`: minimal app and test setup.
- `src/main.tsx`, `src/App.tsx`, `src/styles.css`: entry, screen composition, laptop layout.
- `src/b11/types.ts`, `src/b11/question.ts`: typed question and its official terminal/net reference.
- `src/b11/graph.ts`, `src/b11/validate.ts`: equivalent-node graph and ordered diagnostic results.
- `src/b11/simulate.ts`: motor-control state transition and test checklist.
- `src/b11/session.ts`: draft, counters, hints, and completed-record storage.
- `src/components/Workspace.tsx`, `src/components/PartsPanel.tsx`, `src/components/TaskPanel.tsx`: wiring interaction and side panels.
- `src/b11/*.test.ts`, `src/components/*.test.tsx`: focused unit and interaction tests.

## Review Focus

- An invalid or self-connected terminal pair does not create a wire (Task 2).
- An electrically equivalent branch connection passes even if wire order and direction differ (Task 2).
- A phase-to-phase short prevents energizing before other feedback (Task 2).
- Repeated clicks on forward and reverse cannot energize both contactors (Task 3).
- Corrupt or unavailable browser storage leaves the exercise usable with a visible warning (Task 5).

---

### Task 1: Official B11 Fixture and App Shell

**Files:** Create `index.html`, `package.json`, `tsconfig.json`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/b11/types.ts`, `src/b11/question.ts`, `src/b11/question.test.ts`.

**Interfaces:** Produce `type Terminal`, `type Part`, `type Wire`, `type B11Question`, and `const b11Question: B11Question`; every terminal ID is unique and each reference net names existing terminals. `App` renders the three-column shell.

- [ ] **Step 1: Record the official circuit** — inspect the B11 second-question motor-control drawing in `007003B11.pdf`; enter its printed component and terminal labels, reference electrical nets, control contacts, and expected indicators into `question.ts`. Keep a short source-page note next to the fixture. If the figure is unreadable or ambiguous, stop this task and resolve it before coding validation.
- [ ] **Step 2: Write `question.test.ts`** — assert unique IDs, no dangling terminal references, all required motor-control parts, and no conflicting reference nets.
- [ ] **Step 3: Run `npm test -- question.test.ts`** — expect failure before the fixture and validator exist.
- [ ] **Step 4: Add the Vite/React setup and smallest typed fixture** — implement `validateQuestion(question: B11Question): string[]` in `question.ts` and render heading, parts panel placeholder, workspace placeholder, task panel placeholder.
- [ ] **Step 5: Run `npm test -- question.test.ts` and `npm run build`** — expect both to pass; compare terminal labels once more against the official drawing.
- [ ] **Step 6: Commit** — `git add index.html package.json tsconfig.json vite.config.ts src` and `git commit -m "feat: define B11 question and app shell"`.

### Task 2: Connection Graph, Diagnostics, and Wiring Surface

**Files:** Create `src/b11/graph.ts`, `src/b11/validate.ts`, `src/b11/graph.test.ts`, `src/b11/validate.test.ts`, `src/components/Workspace.tsx`, `src/components/Workspace.test.tsx`; modify `src/App.tsx`, `src/styles.css`.

**Interfaces:** Consume `B11Question`, `Wire`; produce `getConnectedNets(question: B11Question, wires: Wire[]): ReadonlyArray<ReadonlySet<string>>`, `validateWiring(question: B11Question, wires: Wire[]): Diagnostic[]`, and `Workspace` props `{ question, wires, color, onAddWire, onRemoveWire, onMovePart }`. `Diagnostic` has `kind: 'danger' | 'structure' | 'function'`, affected terminal IDs, and message/hint fields.

- [ ] **Step 1: Write failing graph and validation tests** — reference wiring passes regardless of wire direction/order; equivalent branching passes; missing wire and wrong terminal fail; phase-to-phase short is first and dangerous; absent interlock and bypassed overload are functional errors.
- [ ] **Step 2: Run `npm test -- graph.test.ts validate.test.ts`** — expect failures from missing functions.
- [ ] **Step 3: Implement graph and validation** — union terminals joined by user wires and fixed internal connections; evaluate dangerous conditions first, then structural, then functional conditions. Do not infer correctness from SVG positions.
- [ ] **Step 4: Run focused tests** — expect pass, including invalid/self-pair and electrically equivalent branch cases.
- [ ] **Step 5: Write `Workspace.test.tsx`** — dragging from one terminal to another adds one wire with selected color, selecting/removing wire works, invalid/self/duplicate connections do not add wires, moving a part preserves connections.
- [ ] **Step 6: Implement SVG wiring and parts layout** — pointer interactions, visible terminal labels, wire selection, keyboard-accessible deletion, and a clear error message for rejected connections. Include zoom controls for the center workspace.
- [ ] **Step 7: Run `npm test -- Workspace.test.tsx` and `npm run build`** — expect pass.
- [ ] **Step 8: Commit** — `git add src` and `git commit -m "feat: wire B11 components and validate circuits"`.

### Task 3: Energized Control Simulation

**Files:** Create `src/b11/simulate.ts`, `src/b11/simulate.test.ts`, `src/components/TaskPanel.tsx`; modify `src/App.tsx`, `src/styles.css`.

**Interfaces:** Consume a wiring validation result and `MotorState`; produce `nextMotorState(state: MotorState, action: MotorAction): MotorState` and `canEnergize(diagnostics: Diagnostic[]): boolean`. State includes direction, overload-trip flag, contactor and indicator states, and completed test actions.

- [ ] **Step 1: Write failing simulation tests** — forward start and self-hold, stop, reverse start, forward/reverse mutual exclusion even on repeated rapid inputs, overload trip/lockout and reset, indicator consistency; any diagnostic prevents energizing.
- [ ] **Step 2: Run `npm test -- simulate.test.ts`** — expect failure.
- [ ] **Step 3: Implement the pure state transitions** — derive motor and lamp states from contactors and overload; expose actions for forward, reverse, stop, trip, reset, and release of start buttons.
- [ ] **Step 4: Run focused tests** — expect pass.
- [ ] **Step 5: Connect simulation controls to `TaskPanel`** — energizing remains disabled until validation passes; show motor direction, both contactors, lamps, fault state, and five required test outcomes in text and color.
- [ ] **Step 6: Run `npm test` and `npm run build`** — expect pass.
- [ ] **Step 7: Commit** — `git add src` and `git commit -m "feat: simulate B11 motor controls"`.

### Task 4: Guided Feedback and Task Flow

**Files:** Create `src/components/TaskPanel.test.tsx`, `src/components/PartsPanel.tsx`; modify `src/components/TaskPanel.tsx`, `src/App.tsx`, `src/styles.css`.

**Interfaces:** Consume `Diagnostic[]` and session counters; `TaskPanel` calls `onCheck`, `onHint`, `onShowAnswer`, `onReset`, and simulation action callbacks. Expose hint levels 1–3 and then explicit reference-answer reveal.

- [ ] **Step 1: Write failing panel tests** — check displays danger before other issues, successive hints reveal area/function/terminal direction, full answer requires its own action, counts update, clear selected wire and reset request are distinct, simulation controls stay unavailable for faulty wiring.
- [ ] **Step 2: Run `npm test -- TaskPanel.test.tsx`** — expect failure.
- [ ] **Step 3: Implement parts library, task progress, hints, checks, color selector, clear-wire action, and a confirmed restart** — keep instructional copy in Traditional Chinese and do not expose the full answer during ordinary checking.
- [ ] **Step 4: Run focused tests and `npm run build`** — expect pass.
- [ ] **Step 5: Commit** — `git add src` and `git commit -m "feat: guide B11 wiring practice"`.

### Task 5: Local Records and End-to-End Verification

**Files:** Create `src/b11/session.ts`, `src/b11/session.test.ts`, `src/App.test.tsx`, `README.md`; modify `src/App.tsx`, `src/styles.css`, `package.json` if browser test runner is added.

**Interfaces:** Produce `loadDraft(storage: Storage): Draft | null`, `saveDraft(storage: Storage, draft: Draft): boolean`, `appendRecord(storage: Storage, record: PracticeRecord): boolean`; a record includes B11 question ID, times, completion, check and error counts, hint counts, and simulation results.

- [ ] **Step 1: Write failing storage tests** — valid draft round trip; malformed JSON falls back safely; storage throwing on read/write does not crash; completed history survives a confirmed draft reset.
- [ ] **Step 2: Run `npm test -- session.test.ts`** — expect failure.
- [ ] **Step 3: Implement versioned browser storage and app integration** — restore draft on load, update after meaningful edits, save completion only once, show storage warning on failure, display time/error/hint summary.
- [ ] **Step 4: Run focused tests** — expect pass.
- [ ] **Step 5: Write and run user-flow tests** — complete reference wiring and five simulation checks; dangerous wiring blocks power; reload restores draft; completion yields one record. Use component integration tests and a browser smoke test if the local browser runner is available.
- [ ] **Step 6: Verify laptop layout and usability** — inspect at 1366×768 and 1920×1080; confirm three columns, readable labels, wire selection, zoom, hints, keyboard deletion, and reset confirmation. Fix concrete issues found.
- [ ] **Step 7: Run `npm test` and `npm run build`** — expect pass; document `npm install`, `npm run dev`, and local-only data behavior in `README.md`.
- [ ] **Step 8: Commit** — `git add src package.json README.md` and `git commit -m "feat: save practice records and finish B11 flow"`.
