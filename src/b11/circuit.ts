import { getConnectedNets } from './graph';
import type { B11Question, Wire } from './types';
import type { MotorAction, MotorState } from './simulate';

type ContactState = Pick<MotorState, 'mcf' | 'mcr'>;

function inspectCircuit(question: B11Question, wires: Wire[], contact: ContactState, overloaded: boolean, pressedForward = false, pressedReverse = false, stopOpen = false) {
  const closed: [string, string][] = [
    ['nfb.L1', 'nfb.T1'], ['nfb.L2', 'nfb.T2'],
    ['pf-a.L', 'pf-a.T'], ['pf-b.L', 'pf-b.T'],
    ['thry.H1I', 'thry.H1O'], ['thry.H2I', 'thry.H2O'],
  ];
  if (!stopOpen) closed.push(['stop.1', 'stop.2']);
  if (pressedForward) closed.push(['forward.1', 'forward.2']);
  if (pressedReverse) closed.push(['reverse.1', 'reverse.2']);
  if (contact.mcf) closed.push(['mcf.13', 'mcf.14']);
  else closed.push(['mcf.21', 'mcf.22'], ['mcf.31', 'mcf.32']);
  if (contact.mcr) closed.push(['mcr.13', 'mcr.14']);
  else closed.push(['mcr.21', 'mcr.22'], ['mcr.31', 'mcr.32']);
  if (overloaded) closed.push(['thry.97', 'thry.98']);
  else closed.push(['thry.95', 'thry.96']);
  for (const id of ['mcf', 'mcr'] as const) {
    if (contact[id]) for (const pole of [1, 2, 3]) closed.push([`${id}.P${pole}L`, `${id}.P${pole}T`]);
  }
  const group = new Map<string, number>();
  getConnectedNets(question, wires, closed).forEach((net, index) => net.forEach((pin) => group.set(pin, index)));
  const joined = (a: string, b: string) => group.get(a) !== undefined && group.get(a) === group.get(b);
  const powered = (a: string, b: string) => joined('supply.A', a) && joined('supply.B', b) || joined('supply.B', a) && joined('supply.A', b);
  const mainReady = powered('motor.2', 'motor.4');
  const direction: MotorState['direction'] = mainReady && joined('supply.A', 'motor.3') ? 'forward' : mainReady && joined('supply.B', 'motor.3') ? 'reverse' : 'stopped';
  return {
    mcf: powered('mcf.A1', 'mcf.A2'),
    mcr: powered('mcr.A1', 'mcr.A2'),
    direction,
    lamps: { forward: powered('lamp-f.1', 'lamp-f.2'), reverse: powered('lamp-r.1', 'lamp-r.2'), stopped: powered('lamp-g.1', 'lamp-g.2') },
    buzzer: powered('buzzer.1', 'buzzer.2'),
  };
}

function settle(question: B11Question, wires: Wire[], start: ContactState, overloaded: boolean, forward: boolean, reverse: boolean, stopOpen: boolean) {
  let contact = start;
  for (let attempt = 0; attempt < 4; attempt++) {
    const next = inspectCircuit(question, wires, contact, overloaded, forward, reverse, stopOpen);
    if (next.mcf === contact.mcf && next.mcr === contact.mcr) return next;
    contact = { mcf: next.mcf, mcr: next.mcr };
  }
  return inspectCircuit(question, wires, contact, overloaded, forward, reverse, stopOpen);
}

export function nextWiredMotorState(state: MotorState, action: MotorAction, question: B11Question, wires: Wire[]): MotorState {
  const overloaded = action === 'trip' ? true : action === 'reset' ? false : state.overloaded;
  const forward = action === 'forward' || action === 'interlock' && state.direction === 'reverse';
  const reverse = action === 'reverse' || action === 'interlock' && state.direction === 'forward';
  const pressed = settle(question, wires, state, overloaded, forward, reverse, action === 'stop');
  const released = settle(question, wires, pressed, overloaded, false, false, false);
  const direction = released.mcf && released.mcr ? 'stopped' : released.direction;
  const observed = action === 'forward' && state.direction === 'stopped' && direction === 'forward'
    || action === 'reverse' && state.direction === 'stopped' && direction === 'reverse'
    || action === 'stop' && state.direction !== 'stopped' && direction === 'stopped'
    || action === 'trip' && state.direction !== 'stopped' && direction === 'stopped' && released.buzzer
    || action === 'interlock' && state.direction !== 'stopped' && direction === state.direction && !(released.mcf && released.mcr);
  return {
    direction, overloaded, mcf: released.mcf, mcr: released.mcr,
    lamps: released.lamps, buzzer: released.buzzer,
    tested: observed && !state.tested.includes(action) ? [...state.tested, action] : state.tested,
  };
}
