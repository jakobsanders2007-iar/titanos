// Per-service operating playbooks. These drive the guided job cockpit:
// what to ask, what to bring, what to do on site, and how to close out.
// Locksmith-first, with an HVAC-ready fallback so the same engine works
// across verticals.

export interface Playbook {
  vertical: 'Locksmith' | 'HVAC'
  laborMinutes: number
  // Questions the dispatcher / AI receptionist should confirm before dispatch
  diagnosis: string[]
  // Tools the tech must have on the truck for this job
  tools: string[]
  // Parts likely consumed, with typical cost — feeds parts_cost + restock signal
  parts: { name: string; typicalCost: number; likely: boolean }[]
  // On-site work steps
  checklist: string[]
  // What must be true before the tech leaves the driveway
  closeout: string[]
  // Follow-up cadence after closeout
  followUpDays: number
  followUpAction: string
  // Upsell the tech should offer to lift ticket + margin
  upsell?: string
}

const LOCKSMITH_DEFAULT: Playbook = {
  vertical: 'Locksmith',
  laborMinutes: 45,
  diagnosis: [
    'Confirm exact address and gate/callbox access',
    'Verify proof of residence / ownership on arrival',
    'Confirm lock type and whether damage is involved',
  ],
  tools: ['Pick set', 'Tension wrenches', 'Plug spinner', 'Flashlight'],
  parts: [{ name: 'Misc pins / lube', typicalCost: 5, likely: false }],
  checklist: [
    'Verify customer identity and authorization',
    'Photograph lock/door condition before work',
    'Perform service with no collateral damage',
    'Test operation with customer present',
  ],
  closeout: [
    'Collect payment before leaving',
    'Take after photo of completed work',
    'Confirm customer satisfaction',
    'Ask for a Google review',
  ],
  followUpDays: 3,
  followUpAction: 'Thank-you text + review link',
}

export const PLAYBOOKS: Record<string, Playbook> = {
  'House Lockout': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 30,
    diagnosis: [
      'Confirm it is the caller’s residence (ID required on site)',
      'Ask lock brand/type and whether key is broken inside',
      'Confirm anyone/anything vulnerable inside (child, pet, stove on) → emergency priority',
    ],
    tools: ['Pick set', 'Tension wrenches', 'Bump keys', 'Under-door tool', 'Flashlight'],
    parts: [{ name: 'Replacement pins', typicalCost: 5, likely: false }],
    upsell: 'Offer rekey or a spare key while on site',
  },
  'Car Lockout': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 25,
    diagnosis: [
      'Get year / make / model — determines tool set',
      'Confirm vehicle ownership (registration/ID)',
      'Ask if key is lost vs locked inside (changes to key-cut job if lost)',
    ],
    tools: ['Long-reach tools', 'Wedge / air bag', 'Slim jim', 'Lishi picks'],
    parts: [],
    upsell: 'Offer a spare key cut on site if only one key exists',
  },
  'Rekey': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 45,
    diagnosis: [
      'Count doors/locks to rekey and confirm they are same keyway',
      'Confirm how many working keys are needed',
      'New homeowner? → upsell smart lock / security review',
    ],
    tools: ['Rekey kit', 'Pinning mat', 'Follower set', 'Key machine'],
    parts: [
      { name: 'Pin kit charges', typicalCost: 8, likely: true },
      { name: 'Key blanks', typicalCost: 3, likely: true },
    ],
    upsell: 'Offer smart lock upgrade or extra keys',
  },
  'Lock Replacement': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 60,
    diagnosis: [
      'Confirm hardware grade and finish the customer wants',
      'Measure backset / door prep before quoting',
      'Match keyed-alike across doors?',
    ],
    tools: ['Drill + bits', 'Chisel set', 'Screwdrivers', 'Installation jig'],
    parts: [
      { name: 'Deadbolt', typicalCost: 35, likely: true },
      { name: 'Knob / lever set', typicalCost: 40, likely: true },
    ],
    upsell: 'Offer Grade 1 hardware or keyed-alike set',
  },
  'Smart Lock Install': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 75,
    diagnosis: [
      'Confirm lock model and whether customer supplies it',
      'Confirm door thickness / bore compatibility',
      'Confirm Wi-Fi / hub availability for app setup',
    ],
    tools: ['Drill + bits', 'Screwdrivers', 'Phone for app setup', 'Multimeter'],
    parts: [
      { name: 'Smart lock unit', typicalCost: 120, likely: false },
      { name: 'Batteries / adapter plate', typicalCost: 15, likely: true },
    ],
    upsell: 'Offer keypad + app onboarding and a second unit',
  },
  'Safe Opening': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 90,
    diagnosis: [
      'REQUIRE proof of ownership before any work',
      'Safe make/model and lock type (dial vs electronic)',
      'Is destructive entry authorized if manipulation fails?',
    ],
    tools: ['Manipulation kit', 'Borescope', 'Drill rig', 'Diagram references'],
    parts: [{ name: 'Replacement lock / relocker', typicalCost: 60, likely: false }],
    followUpDays: 2,
    followUpAction: 'Confirm safe operation + offer new combo service',
    upsell: 'Offer lock replacement / new combination setup',
  },
  'Emergency Locksmith': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 45,
    diagnosis: [
      'Confirm nature of emergency and safety risk',
      'Confirm after-hours premium accepted before dispatch',
      'Confirm access and payment method up front',
    ],
    tools: ['Full pick set', 'Drill + bits', 'Extraction set', 'Flashlight'],
    parts: [{ name: 'Emergency hardware', typicalCost: 15, likely: true }],
    followUpDays: 1,
    followUpAction: 'Next-day check-in — high emotion, high review value',
    upsell: 'Offer permanent lock replacement after emergency entry',
  },
  'Commercial Lock Repair': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 90,
    diagnosis: [
      'Confirm decision-maker and PO / billing terms (Net-30?)',
      'Door hardware type: closer, panic bar, mag lock, master system',
      'Life-safety / code compliance requirements',
    ],
    tools: ['Commercial hardware kit', 'Drill + bits', 'Closer adjustment tools'],
    parts: [
      { name: 'Panic bar / closer parts', typicalCost: 85, likely: true },
      { name: 'Commercial cylinder', typicalCost: 45, likely: false },
    ],
    followUpDays: 5,
    followUpAction: 'Offer service contract / master key audit',
    upsell: 'Offer master key system or recurring maintenance contract',
  },
  'Key Duplication': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 15,
    diagnosis: [
      'Confirm key type (standard, high-security, restricted, transponder)',
      'Restricted keys require authorization on file',
      'How many copies?',
    ],
    tools: ['Key machine', 'Transponder programmer', 'Blank assortment'],
    parts: [
      { name: 'Key blank', typicalCost: 3, likely: true },
      { name: 'Transponder chip', typicalCost: 20, likely: false },
    ],
    followUpDays: 7,
    followUpAction: 'Reminder for spare keys / rekey',
    upsell: 'Offer an extra spare or key fob',
  },
  'Ignition Repair': {
    ...LOCKSMITH_DEFAULT,
    laborMinutes: 90,
    diagnosis: [
      'Year / make / model and key type (transponder?)',
      'Symptom: key stuck, won’t turn, or ignition worn',
      'Confirm ownership and that vehicle is on site',
    ],
    tools: ['Automotive pick set', 'Ignition removal tools', 'Key programmer'],
    parts: [
      { name: 'Ignition cylinder', typicalCost: 45, likely: true },
      { name: 'Programmed key', typicalCost: 25, likely: true },
    ],
    upsell: 'Offer a spare programmed key',
  },
}

// HVAC-ready fallback so the engine works when vertical mode expands.
export const HVAC_DEFAULT: Playbook = {
  vertical: 'HVAC',
  laborMinutes: 60,
  diagnosis: [
    'Confirm symptom (no cool / no heat / noise / maintenance)',
    'System age, brand, and last service date',
    'Confirm whether under warranty or maintenance plan',
  ],
  tools: ['Gauges', 'Multimeter', 'Refrigerant', 'Filters', 'Vacuum pump'],
  parts: [
    { name: 'Capacitor', typicalCost: 20, likely: true },
    { name: 'Filter', typicalCost: 12, likely: true },
  ],
  checklist: [
    'Diagnose and confirm root cause with customer',
    'Photograph readings / nameplate before repair',
    'Complete repair and verify system operation',
    'Log equipment info for maintenance history',
  ],
  closeout: [
    'Collect payment or confirm plan coverage',
    'Record parts used against the job',
    'Offer / confirm maintenance plan enrollment',
    'Ask for a Google review',
  ],
  followUpDays: 14,
  followUpAction: 'Maintenance plan check-in',
  upsell: 'Offer annual maintenance plan',
}

// Named HVAC playbooks — the same engine drives both verticals.
export const HVAC_PLAYBOOKS: Record<string, Playbook> = {
  'AC Not Cooling': {
    ...HVAC_DEFAULT,
    laborMinutes: 75,
    diagnosis: [
      'Check thermostat settings and batteries first — ask the customer over the phone',
      'Confirm breaker has not tripped and filter is not clogged',
      'System age and brand — units 8+ years old get a maintenance-plan pitch',
    ],
    tools: ['Gauges', 'Multimeter', 'Capacitor assortment', 'Contactor spares', 'Filters', 'Leak detector'],
    parts: [
      { name: 'Run capacitor', typicalCost: 20, likely: true },
      { name: 'Contactor', typicalCost: 17, likely: false },
      { name: 'Refrigerant charge', typicalCost: 60, likely: false },
    ],
    checklist: [
      'Verify symptom and thermostat operation with customer present',
      'Capture model/serial nameplate photo before touching the unit',
      'Test capacitor, contactor, and refrigerant pressures in order',
      'Confirm cooling restored and log temperature split',
    ],
    upsell: 'Units 8+ years old: pitch the annual maintenance plan before leaving',
  },
  'AC Emergency': {
    ...HVAC_DEFAULT,
    laborMinutes: 90,
    diagnosis: [
      'Heat-advisory or vulnerable occupant? → priority dispatch',
      'Confirm after-hours rate accepted before rolling the truck',
      'System age, brand, and last service date',
    ],
    tools: ['Gauges', 'Multimeter', 'Capacitor assortment', 'Portable fan (customer comfort)', 'Refrigerant'],
    parts: [
      { name: 'Run capacitor', typicalCost: 20, likely: true },
      { name: 'Emergency repair parts', typicalCost: 45, likely: true },
    ],
    followUpDays: 2,
    followUpAction: 'Post-emergency check-in + maintenance plan offer',
    upsell: 'Convert the emergency into a maintenance plan — highest-conversion moment',
  },
  'Furnace Tune-Up': {
    ...HVAC_DEFAULT,
    laborMinutes: 60,
    diagnosis: [
      'Confirm furnace type (gas/electric/heat pump) and access location',
      'Any symptoms beyond routine maintenance?',
      'On a maintenance plan already, or a candidate for one?',
    ],
    tools: ['Combustion analyzer', 'Multimeter', 'Filters', 'Brush kit', 'CO detector'],
    parts: [
      { name: 'Filter', typicalCost: 12, likely: true },
      { name: 'Igniter / flame sensor', typicalCost: 28, likely: false },
    ],
    upsell: 'Enroll in the maintenance plan — tune-up fee credits toward it',
  },
  'Thermostat Install': {
    ...HVAC_DEFAULT,
    laborMinutes: 60,
    diagnosis: [
      'Confirm thermostat model and whether customer supplies it',
      'C-wire present? Verify system compatibility before dispatch',
      'Wi-Fi credentials available for smart-stat setup',
    ],
    tools: ['Multimeter', 'Wire labels', 'Drill', 'Phone for app setup'],
    parts: [
      { name: 'Smart thermostat', typicalCost: 219, likely: false },
      { name: 'C-wire adapter', typicalCost: 25, likely: true },
    ],
    upsell: 'Offer a whole-home airflow assessment while on site',
  },
  'Heater Not Working': {
    ...HVAC_DEFAULT,
    laborMinutes: 75,
    diagnosis: [
      'Gas smell? → safety escalation, advise customer immediately',
      'Check thermostat mode and breaker over the phone first',
      'Capture system age — heat exchangers 15+ years get inspection',
    ],
    tools: ['Combustion analyzer', 'Multimeter', 'Igniter spares', 'CO detector'],
    parts: [
      { name: 'Hot surface igniter', typicalCost: 28, likely: true },
      { name: 'Flame sensor', typicalCost: 15, likely: true },
    ],
    upsell: 'Old heat exchanger: quote replacement with financing placeholder',
  },
  'Maintenance Visit': {
    ...HVAC_DEFAULT,
    laborMinutes: 45,
    diagnosis: [
      'Pull equipment history and last visit notes before arrival',
      'Confirm plan coverage — no payment collection needed if covered',
      'Check for open recommendations from previous visits',
    ],
    tools: ['Gauges', 'Filters (customer sizes from equipment record)', 'Coil cleaner', 'Multimeter'],
    parts: [
      { name: 'Filter', typicalCost: 12, likely: true },
      { name: 'Condensate tabs', typicalCost: 6, likely: true },
    ],
    followUpDays: 180,
    followUpAction: 'Schedule next seasonal visit automatically',
    upsell: 'Log aging components now — plan the replacement conversation early',
  },
}

export function getPlaybook(serviceType: string): Playbook {
  return PLAYBOOKS[serviceType] || HVAC_PLAYBOOKS[serviceType] || LOCKSMITH_DEFAULT
}
