import { validatePracticalWiring } from '../practical/validate';
import type { B11Question, Wire } from './types';

export function validateWiring(question: B11Question, wires: Wire[], referenceNets = question.referenceNets) {
  return validatePracticalWiring(question, wires, referenceNets);
}
