import { FocusSession, StudioNote, Task } from '../types';

export const TODAY_ISO = '2026-11-24';

export const INITIAL_DAILY_INTENTION =
  'Protect the morning block for deep structural editing before opening studio correspondence.';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Revise Chapter IV introduction on vernacular timber joinery',
    completed: false,
    priority: 'high',
    category: 'Editorial',
    durationMinutes: 90,
    scheduledDate: '2026-11-24',
    timeBlock: 'Morning',
    notes:
      'Focus on the transition between Kyoto cedar framing and contemporary passive-solar detailing. Keep sentences crisp and avoid technical jargon without visual reference.',
    subtasks: [
      { id: 'sub-1', title: 'Audit opening paragraph cadence', completed: true },
      { id: 'sub-2', title: 'Verify structural span figures in section 4.2', completed: false },
      { id: 'sub-3', title: 'Export clean PDF proof for editorial review', completed: false },
    ],
    createdAt: '2026-11-23T18:10:00Z',
  },
  {
    id: 'task-2',
    title: 'Prepare courtyard daylighting study for North Pavilion',
    completed: false,
    priority: 'high',
    category: 'Architecture',
    durationMinutes: 60,
    scheduledDate: '2026-11-24',
    timeBlock: 'Morning',
    notes:
      'Compare winter solstice sun angles (11:00 and 14:30) across the east clerestory louver pitch.',
    subtasks: [
      { id: 'sub-4', title: 'Confirm 28-degree louver section angle', completed: true },
      { id: 'sub-5', title: 'Annotate glare threshold notes on plate 07', completed: false },
    ],
    createdAt: '2026-11-23T19:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Synthesize field notes from Lisbon ceramic tile archive',
    completed: false,
    priority: 'normal',
    category: 'Research',
    durationMinutes: 45,
    scheduledDate: '2026-11-24',
    timeBlock: 'Afternoon',
    notes:
      'Group glaze pigment recipes by firing temperature and record provenance dates for the December monograph.',
    subtasks: [],
    createdAt: '2026-11-24T07:45:00Z',
  },
  {
    id: 'task-4',
    title: 'Review quarterly print vendor paper stock samples',
    completed: true,
    priority: 'normal',
    category: 'Studio Admin',
    durationMinutes: 30,
    scheduledDate: '2026-11-24',
    timeBlock: 'Afternoon',
    notes:
      'Selected 120gsm uncoated Munken Lynx Cream for interior spreads; request binding dummy by Friday.',
    subtasks: [
      { id: 'sub-6', title: 'Compare opacity under natural north light', completed: true },
      { id: 'sub-7', title: 'Send signed swatch approval to press', completed: true },
    ],
    createdAt: '2026-11-23T15:30:00Z',
    completedAt: '2026-11-24T09:15:00Z',
  },
  {
    id: 'task-5',
    title: 'Read Zumthor essay on material atmosphere & acoustic silence',
    completed: false,
    priority: 'low',
    category: 'Reading',
    durationMinutes: 40,
    scheduledDate: '2026-11-24',
    timeBlock: 'Evening',
    notes: 'Annotate passages on thermal mass and oak threshold acoustics.',
    subtasks: [],
    createdAt: '2026-11-24T08:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Draft acoustic baffle specification sheet for studio library',
    completed: false,
    priority: 'normal',
    category: 'Architecture',
    durationMinutes: 60,
    scheduledDate: '2026-11-25',
    timeBlock: 'Morning',
    notes: 'Specify wool felt density and concealed brass ceiling clips.',
    subtasks: [],
    createdAt: '2026-11-23T14:20:00Z',
  },
  {
    id: 'task-7',
    title: 'Curate 18 archival plates for Winter Issue visual index',
    completed: false,
    priority: 'high',
    category: 'Editorial',
    durationMinutes: 75,
    scheduledDate: '2026-11-25',
    timeBlock: 'Afternoon',
    notes: 'Balance high-contrast interior studies with wide exterior landscape plates.',
    subtasks: [],
    createdAt: '2026-11-23T14:25:00Z',
  },
  {
    id: 'task-8',
    title: 'Finalize studio exhibition loan agreement & crating checklist',
    completed: false,
    priority: 'normal',
    category: 'Studio Admin',
    durationMinutes: 45,
    scheduledDate: '2026-11-26',
    timeBlock: 'Morning',
    notes: 'Verify climate-control transit requirements with registrar.',
    subtasks: [],
    createdAt: '2026-11-22T11:00:00Z',
  },
  {
    id: 'task-9',
    title: 'Outline spring lecture series on quiet digital tools',
    completed: false,
    priority: 'low',
    category: 'Editorial',
    durationMinutes: 60,
    scheduledDate: '',
    timeBlock: 'Unscheduled',
    notes: 'Three-part talk covering typography, attention hygiene, and durable personal archives.',
    subtasks: [],
    createdAt: '2026-11-21T16:10:00Z',
  },
];

export const INITIAL_NOTES: StudioNote[] = [
  {
    id: 'note-1',
    title: 'On Sunlit Rooms and Unhurried Software',
    category: 'Editorial',
    pinned: true,
    updatedAt: '2026-11-24T08:40:00Z',
    content: `Most modern productivity tools mistake speed for clarity. They surround a single piece of writing or a quiet daily intention with flashing counters, saturated alerts, and endless columns of competing metadata.

When designing a personal studio for thought, the screen should behave more like heavy cotton paper resting on an oak drafting table. Divisions come from deliberate proportion and hairline rules rather than heavy shadows.

Key principles for the Winter Monograph:
1. Lead with clear typographic hierarchy rather than decorative containers.
2. Reserve burnt ochre strictly for commitments that demand immediate attention.
3. Keep daily plans bounded—three meaningful blocks outweigh twelve scattered fragments.`,
  },
  {
    id: 'note-2',
    title: 'North Pavilion — Louver & Clerestory Proportions',
    category: 'Architecture',
    pinned: false,
    updatedAt: '2026-11-23T17:15:00Z',
    content: `Observation from site visit at 10:45 AM:
Direct eastern light enters the reading alcove cleanly until 11:20 AM, after which the deep cedar overhang softens glare across the lime plaster wall.

Next adjustments before issuing drawings:
- Increase sill depth by 45mm to accommodate recessed bronze radiator grille.
- Confirm acoustic absorption target (RT60 <= 0.45s) for main reading table zone.
- Pair warm oiled ash shelving with raw travertine plinths.`,
  },
  {
    id: 'note-3',
    title: 'Lisbon Archive — Tin-Glaze Pigment Notes',
    category: 'Research',
    pinned: false,
    updatedAt: '2026-11-22T14:50:00Z',
    content: `Catalogued 14 seventeenth-century facade fragments in Alfama. Iron oxide and burnt umber washes show remarkable warmth when fired over high-tin white majolica ground at 980°C.

Cross-reference with ceramicist notes from Caldas da Rainha before drafting section 2 of the monograph.`,
  },
];

export const INITIAL_SESSIONS: FocusSession[] = [
  {
    id: 'sess-1',
    taskId: 'task-4',
    taskTitle: 'Review quarterly print vendor paper stock samples',
    category: 'Studio Admin',
    durationMinutes: 30,
    intention: 'Evaluate paper grain, ink holdout, and spine stiffness under north daylight.',
    reflection: 'Selected 120gsm Munken Lynx Cream; clean contrast without specular glare.',
    completedAt: '2026-11-24T09:15:00Z',
  },
  {
    id: 'sess-2',
    taskTitle: 'Draft structural outline for Monograph Chapter IV',
    category: 'Editorial',
    durationMinutes: 50,
    intention: 'Establish section sequence from foundation stonework to roof joinery.',
    reflection: 'Completed 4-part skeleton and identified two missing measured drawings.',
    completedAt: '2026-11-23T16:40:00Z',
  },
  {
    id: 'sess-3',
    taskTitle: 'Site section elevation check — North Pavilion',
    category: 'Architecture',
    durationMinutes: 60,
    intention: 'Verify ridge beam clearance above mezzanine stair.',
    reflection: 'Resolved 60mm clearance discrepancy at grid line C.',
    completedAt: '2026-11-23T10:30:00Z',
  },
];
