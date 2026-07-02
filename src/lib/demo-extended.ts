// Seeded demo data for the Sales, AI Receptionist, Shopper, and Training layers.
// Deterministic and relative-dated so the app always feels "live".

function daysAgo(n: number, hour = 9, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}
function daysFromNow(n: number, hour = 9, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// AI Receptionist
// ---------------------------------------------------------------------------

export type CallOutcome = 'Job Booked' | 'Quote Requested' | 'Info Only' | 'Escalated' | 'Missed — Recovered' | 'Missed — Lost' | 'Spam'
export type CallUrgency = 'Emergency' | 'Same Day' | 'This Week' | 'Flexible'

export interface AICall {
  id: string
  caller_name: string
  caller_phone: string
  received_at: string
  duration_sec: number
  service_type: string
  vertical: 'Locksmith' | 'HVAC'
  urgency: CallUrgency
  address: string | null
  quoted_estimate: number | null
  outcome: CallOutcome
  job_created: boolean
  escalation_needed: boolean
  ai_confidence: number
  summary: string
  transcript_preview: string
}

const CALL_SEED: Array<[string, string, number, number, string, 'Locksmith' | 'HVAC', CallUrgency, string | null, number | null, CallOutcome, boolean, boolean, number, string]> = [
  ['Dana Whitfield', '(555) 410-2201', 0, 7, 'House Lockout', 'Locksmith', 'Emergency', '1420 Elm St, Houston, TX', 95, 'Job Booked', true, false, 0.96, 'Caller locked out of home with child inside car seat in driveway. Booked Marcus for immediate dispatch, confirmed $95 base rate.'],
  ['Rick Alvarez', '(555) 410-2202', 0, 4, 'Car Lockout', 'Locksmith', 'Emergency', 'HEB parking lot, Westheimer Rd', 75, 'Job Booked', true, false, 0.94, 'Keys locked in a 2019 Silverado at grocery store. Booked next available tech, quoted $75.'],
  ['Melissa Grant', '(555) 410-2203', 0, 11, 'AC Not Cooling', 'HVAC', 'Same Day', '8802 Braeswood Blvd, Houston, TX', 129, 'Job Booked', true, false, 0.91, 'AC blowing warm air since last night, unit is 8 years old. Booked same-day diagnostic at $129, waived if repaired.'],
  ['Unknown Caller', '(555) 410-2204', 0, 1, 'Unknown', 'Locksmith', 'Flexible', null, null, 'Spam', false, false, 0.99, 'Robocall detected and terminated. No action needed.'],
  ['Jorge Mendez', '(555) 410-2205', 1, 9, 'Rekey', 'Locksmith', 'This Week', '2210 Portsmouth St, Houston, TX', 140, 'Quote Requested', false, false, 0.88, 'New homeowner wants 6 locks rekeyed after closing Friday. Quoted $140 range, requested written quote by email.'],
  ['Tanya Brooks', '(555) 410-2206', 1, 6, 'Smart Lock Install', 'Locksmith', 'Flexible', '505 Studewood St, Houston, TX', 375, 'Job Booked', true, false, 0.92, 'Wants two Yale smart locks installed on rental property. Booked for Thursday morning.'],
  ['Walter Simms', '(555) 410-2207', 1, 13, 'Furnace Tune-Up', 'HVAC', 'This Week', '11 Pine Shadows, Houston, TX', 89, 'Job Booked', true, false, 0.9, 'Annual furnace maintenance before winter. Booked tune-up, mentioned interest in maintenance plan — flagged for CSR follow-up.'],
  ['Angela Park', '(555) 410-2208', 1, 8, 'Safe Opening', 'Locksmith', 'Same Day', '9200 Kirby Dr, Houston, TX', 300, 'Escalated', false, true, 0.61, 'Inherited safe with unknown combination and no proof-of-ownership documents on hand. Escalated to owner for verification protocol.'],
  ['Derrick Cole', '(555) 410-2209', 2, 5, 'House Lockout', 'Locksmith', 'Emergency', '4420 Almeda Rd, Houston, TX', 95, 'Job Booked', true, false, 0.95, 'Standard residential lockout, tenant with lease on phone. Booked and dispatched.'],
  ['Sofia Ramirez', '(555) 410-2210', 2, 10, 'Commercial Lock Repair', 'Locksmith', 'Same Day', 'Retail storefront, Montrose Blvd', 295, 'Job Booked', true, false, 0.89, 'Storefront deadbolt failing, business cannot lock up tonight. Priority booking made for 3 PM.'],
  ['Ken Osborne', '(555) 410-2211', 2, 3, 'Key Duplication', 'Locksmith', 'Flexible', null, 35, 'Info Only', false, false, 0.93, 'Asked about key duplication pricing and walk-in availability. Provided info, no booking needed.'],
  ['Brianna Wells', '(555) 410-2212', 3, 12, 'AC Emergency', 'HVAC', 'Emergency', '77 Memorial Dr, Houston, TX', 189, 'Job Booked', true, false, 0.87, 'Elderly resident, AC failure during heat advisory. Marked emergency priority, dispatched first available.'],
  ['Missed Call', '(555) 410-2213', 3, 0, 'Unknown', 'Locksmith', 'Same Day', null, null, 'Missed — Recovered', false, false, 0.8, 'Missed during peak hours. AI sent text-back within 2 minutes; caller replied and booked a rekey for Saturday.'],
  ['Missed Call', '(555) 410-2214', 3, 0, 'Unknown', 'Locksmith', 'Flexible', null, null, 'Missed — Lost', false, false, 0.0, 'Missed call, text-back sent, no response after 2 follow-ups.'],
  ['Pastor J. Adeyemi', '(555) 410-2215', 4, 14, 'Master Key System', 'Locksmith', 'This Week', 'Church campus, S Main St', 850, 'Escalated', false, true, 0.72, 'Church wants 14-door master key system. High-value commercial quote — escalated to owner for site visit scheduling.'],
  ['Lauren Chu', '(555) 410-2216', 4, 6, 'Ignition Repair', 'Locksmith', 'Same Day', '3131 Fannin St, Houston, TX', 200, 'Job Booked', true, false, 0.9, 'Key stuck in ignition of Honda Accord. Booked automotive tech with quoted $200.'],
  ['Greg Foster', '(555) 410-2217', 5, 9, 'Thermostat Install', 'HVAC', 'Flexible', '414 W 19th St, Houston, TX', 249, 'Quote Requested', false, false, 0.86, 'Wants Nest thermostat installed plus a second-floor airflow assessment. Quote sent for approval.'],
  ['Yvonne Battle', '(555) 410-2218', 5, 7, 'Lock Replacement', 'Locksmith', 'Same Day', '2500 Dunlavy St, Houston, TX', 220, 'Job Booked', true, false, 0.94, 'Break-in last night, needs front and back locks replaced today. Priority dispatch, police report on file.'],
  ['Omar Haddad', '(555) 410-2219', 6, 4, 'Car Key Replacement', 'Locksmith', 'Same Day', 'Office garage, Louisiana St', 180, 'Job Booked', true, false, 0.91, 'Lost only key to 2021 Camry. Booked mobile key-cutting visit.'],
  ['Cheryl Dunn', '(555) 410-2220', 6, 8, 'Duct Cleaning', 'HVAC', 'Flexible', '8100 Westglen Dr, Houston, TX', 380, 'Quote Requested', false, false, 0.84, 'Asked about duct cleaning for 2,400 sq ft home plus dryer vent. Quote emailed.'],
  ['Missed Call', '(555) 410-2221', 7, 0, 'Unknown', 'HVAC', 'Same Day', null, null, 'Missed — Recovered', false, false, 0.78, 'Missed weekend call. Text-back recovered it — booked Monday AC diagnostic.'],
  ['Frank Delgado', '(555) 410-2222', 7, 10, 'House Lockout', 'Locksmith', 'Emergency', '1818 Waugh Dr, Houston, TX', 95, 'Job Booked', true, false, 0.96, 'Lockout with stove on inside. Emergency dispatch, arrived in 22 minutes.'],
  ['Patricia Lyle', '(555) 410-2223', 8, 15, 'Rekey', 'Locksmith', 'This Week', 'Duplex, N Shepherd Dr', 160, 'Job Booked', true, false, 0.9, 'Landlord rekeying duplex between tenants. Booked for Wednesday.'],
  ['Sam Whitaker', '(555) 410-2224', 8, 5, 'AC Not Cooling', 'HVAC', 'Same Day', '9615 Windswept Ln, Houston, TX', 129, 'Job Booked', true, false, 0.9, 'Second-floor AC not keeping up. Same-day diagnostic booked.'],
  ['Nina Petrov', '(555) 410-2225', 9, 6, 'Safe Opening', 'Locksmith', 'Flexible', '660 Post Oak Ln, Houston, TX', 300, 'Job Booked', true, false, 0.85, 'Gun safe with dead keypad, ownership verified via serial registration. Booked safe specialist.'],
  ['Missed Call', '(555) 410-2226', 9, 0, 'Unknown', 'Locksmith', 'Flexible', null, null, 'Missed — Lost', false, false, 0.0, 'Missed call, no voicemail, text-back unanswered.'],
  ['Carlos Vega', '(555) 410-2227', 10, 11, 'Commercial Lock Repair', 'Locksmith', 'Same Day', 'Warehouse, Clinton Dr', 295, 'Job Booked', true, false, 0.89, 'Panic bar jammed on warehouse exit door — compliance issue. Same-day booking.'],
  ['Diane Kowalski', '(555) 410-2228', 10, 9, 'Heater Not Working', 'HVAC', 'Same Day', '4207 Bellaire Blvd, Houston, TX', 129, 'Job Booked', true, false, 0.92, 'Heat pump not switching modes. Diagnostic booked for afternoon window.'],
  ['Terrence Mills', '(555) 410-2229', 11, 7, 'Smart Lock Install', 'Locksmith', 'Flexible', 'Airbnb property, EaDo', 375, 'Quote Requested', false, false, 0.87, 'Short-term-rental host wants keypad locks on 3 doors with code rotation. Quote requested.'],
  ['Gloria Sanchez', '(555) 410-2230', 11, 8, 'House Lockout', 'Locksmith', 'Emergency', '212 Sul Ross St, Houston, TX', 95, 'Job Booked', true, false, 0.95, 'Standard lockout, ID verified against address. Booked and dispatched.'],
  ['Ben Ackerman', '(555) 410-2231', 12, 13, 'Maintenance Plan', 'HVAC', 'Flexible', null, 240, 'Quote Requested', false, false, 0.83, 'Asked about annual HVAC maintenance plan pricing for 2 systems. Plan brochure sent, CSR follow-up scheduled.'],
  ['Rita Nakamura', '(555) 410-2232', 12, 6, 'Lock Replacement', 'Locksmith', 'This Week', '5959 FM 1960, Houston, TX', 220, 'Job Booked', true, false, 0.91, 'HOA-required lock upgrade on townhouse. Booked Thursday.'],
  ['Missed Call', '(555) 410-2233', 13, 0, 'Unknown', 'Locksmith', 'Same Day', null, null, 'Missed — Recovered', false, false, 0.81, 'After-hours missed call recovered by text-back. Booked next-morning car key replacement.'],
  ['Hank Rossi', '(555) 410-2234', 13, 10, 'Ignition Repair', 'Locksmith', 'Same Day', 'Body shop, Airline Dr', 200, 'Job Booked', true, false, 0.88, 'Body shop partner referral — ignition cylinder swap on customer vehicle.'],
  ['Emily Trask', '(555) 410-2235', 14, 5, 'AC Tune-Up', 'HVAC', 'Flexible', '1010 Rosine St, Houston, TX', 89, 'Job Booked', true, false, 0.93, 'Pre-summer AC tune-up. Booked and offered maintenance plan; caller considering.'],
  ['Vic Toland', '(555) 410-2236', 14, 4, 'Key Duplication', 'Locksmith', 'Flexible', null, 35, 'Info Only', false, false, 0.94, 'Asked whether we duplicate restricted keys. Explained authorization requirements.'],
  ['Marlene Hobbs', '(555) 410-2237', 15, 8, 'House Lockout', 'Locksmith', 'Emergency', '7833 Park Place Blvd, Houston, TX', 95, 'Job Booked', true, false, 0.96, 'Lockout with pets inside. Emergency dispatch confirmed.'],
  ['A. Winslow', '(555) 410-2238', 15, 12, 'Access Control', 'Locksmith', 'This Week', 'Medical office, Fannin St', 1200, 'Escalated', false, true, 0.68, 'Medical office wants badge-reader access control on 4 doors. Large commercial scope — escalated for owner site visit.'],
  ['Missed Call', '(555) 410-2239', 16, 0, 'Unknown', 'HVAC', 'Flexible', null, null, 'Missed — Lost', false, false, 0.0, 'Missed call during job overlap. No response to recovery texts.'],
  ['Joy Pham', '(555) 410-2240', 16, 9, 'Rekey', 'Locksmith', 'This Week', '3838 Antoine Dr, Houston, TX', 120, 'Job Booked', true, false, 0.92, 'Post-roommate-moveout rekey, 3 locks. Booked Saturday morning.'],
]

export const DEMO_AI_CALLS: AICall[] = CALL_SEED.map(([caller_name, caller_phone, dAgo, durMin, service_type, vertical, urgency, address, quoted_estimate, outcome, job_created, escalation_needed, ai_confidence, summary], i) => ({
  id: `call-${String(i + 1).padStart(3, '0')}`,
  caller_name,
  caller_phone,
  received_at: daysAgo(dAgo, 7 + (i % 12), (i * 13) % 60),
  duration_sec: durMin * 60 + (i * 17) % 60,
  service_type,
  vertical,
  urgency,
  address,
  quoted_estimate,
  outcome,
  job_created,
  escalation_needed,
  ai_confidence,
  summary,
  transcript_preview: `AI: Thanks for calling Titan, this is Ava — how can I help?\nCaller: ${summary.split('.')[0]}.\nAI: I can help with that right away…`,
}))

// ---------------------------------------------------------------------------
// CRM: Leads & Quotes
// ---------------------------------------------------------------------------

export type LeadStage = 'New Lead' | 'Contacted' | 'Estimate Sent' | 'Scheduled' | 'Won' | 'Lost' | 'Follow-up Needed' | 'Repeat Customer'
export type LeadSource = 'AI Receptionist' | 'Phone' | 'Website' | 'Google Business Profile' | 'Yelp' | 'Referral' | 'Repeat' | 'Truck Signage'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: LeadSource
  stage: LeadStage
  vertical: 'Locksmith' | 'HVAC'
  service_need: string
  estimated_value: number
  assigned_to: string
  next_followup: string | null
  created_at: string
  notes: string
  lost_reason: string | null
}

const LEAD_SEED: Array<[string, LeadSource, LeadStage, 'Locksmith' | 'HVAC', string, number, string, number | null, number, string, string | null]> = [
  ['Dana Whitfield', 'AI Receptionist', 'Won', 'Locksmith', 'House Lockout', 95, 'Ava (AI)', null, 0, 'Emergency lockout booked and completed same day.', null],
  ['Jorge Mendez', 'AI Receptionist', 'Estimate Sent', 'Locksmith', 'Rekey — 6 locks', 140, 'Front Desk', 1, 1, 'New homeowner, closes Friday. Wants written quote.', null],
  ['Pastor J. Adeyemi', 'AI Receptionist', 'Follow-up Needed', 'Locksmith', 'Master key system — 14 doors', 850, 'Owner', 0, 4, 'Needs site visit. High-value commercial.', null],
  ['Terrence Mills', 'AI Receptionist', 'Estimate Sent', 'Locksmith', 'Smart locks — 3 doors, Airbnb', 1125, 'Front Desk', 2, 11, 'STR host, wants code rotation feature explained.', null],
  ['A. Winslow', 'AI Receptionist', 'Follow-up Needed', 'Locksmith', 'Access control — 4 doors', 4800, 'Owner', 1, 15, 'Medical office. Requires badge readers + audit trail. Site visit pending.', null],
  ['Greg Foster', 'AI Receptionist', 'Estimate Sent', 'HVAC', 'Thermostat install + airflow', 349, 'Front Desk', 3, 5, 'Nest install plus 2nd floor airflow check.', null],
  ['Ben Ackerman', 'AI Receptionist', 'Contacted', 'HVAC', 'Maintenance plan — 2 systems', 480, 'Sales', 2, 12, 'Considering annual plan. Sent brochure.', null],
  ['Cheryl Dunn', 'AI Receptionist', 'Estimate Sent', 'HVAC', 'Duct cleaning + dryer vent', 380, 'Front Desk', 4, 6, 'Waiting on spouse approval.', null],
  ['Harborview Property Mgmt', 'Referral', 'Contacted', 'Locksmith', 'Portfolio rekey contract — 40 units/yr', 6000, 'Owner', 2, 8, 'Referred by James Okafor. Wants per-unit contract pricing.', null],
  ['Lone Star Realty', 'Google Business Profile', 'New Lead', 'Locksmith', 'REO lock swaps — recurring', 2400, 'Sales', 1, 2, 'Found us on GBP. Handles ~10 REO properties/month.', null],
  ['Maria Delgado', 'Website', 'Scheduled', 'Locksmith', 'Lock replacement after break-in', 220, 'Front Desk', null, 3, 'Scheduled Thursday. Insurance claim paperwork requested.', null],
  ['Kevin Barnes', 'Yelp', 'Lost', 'Locksmith', 'Car key replacement', 180, 'Front Desk', null, 9, 'Went with cheaper mobile competitor.', 'Price'],
  ['Sunrise Dental', 'Referral', 'Estimate Sent', 'Locksmith', 'Office rekey + restricted keys', 520, 'Sales', 2, 7, 'Wants restricted keyway so staff keys cannot be copied.', null],
  ['Tom Nguyen', 'Phone', 'Won', 'HVAC', 'AC compressor replacement', 2150, 'Sales', null, 14, 'Approved quote after financing options discussed.', null],
  ['Olivia Reyes', 'Website', 'Contacted', 'HVAC', 'Mini-split install — garage gym', 3200, 'Sales', 3, 4, 'Comparing 2 other bids. Emphasize warranty.', null],
  ['Bayou Brewing Co.', 'Referral', 'Follow-up Needed', 'Locksmith', 'Taproom panic hardware + keying', 1400, 'Owner', 0, 10, 'Code compliance deadline end of month. HOT.', null],
  ['Janet Kim', 'Repeat', 'Repeat Customer', 'Locksmith', 'Rekey rental turnover', 160, 'Front Desk', 5, 13, '3rd rekey this year. Candidate for landlord plan.', null],
  ['Frank Delgado', 'AI Receptionist', 'Won', 'Locksmith', 'Emergency lockout', 95, 'Ava (AI)', null, 7, 'Booked by AI, completed same day.', null],
  ['Ashford HOA', 'Phone', 'Estimate Sent', 'Locksmith', 'Pool gate + clubhouse locks', 780, 'Sales', 4, 16, 'Board votes next Tuesday.', null],
  ['Ray Simmons', 'Truck Signage', 'New Lead', 'HVAC', 'Furnace replacement estimate', 4500, 'Sales', 1, 1, 'Saw truck at neighbor install. 20-yr-old furnace.', null],
  ['Priya Sharma', 'Repeat', 'Won', 'Locksmith', 'Smart lock upgrade', 375, 'Front Desk', null, 18, 'Existing customer upgrade. Completed.', null],
  ['Casa Verde Apartments', 'Google Business Profile', 'Contacted', 'Locksmith', 'Turnover rekeys — 120 units', 9000, 'Owner', 1, 5, 'Property manager evaluating vendors. Wants SLA terms.', null],
  ['Duane Porter', 'Yelp', 'Lost', 'HVAC', 'AC diagnostic', 129, 'Front Desk', null, 12, 'No-showed twice, stopped responding.', 'Unresponsive'],
  ['Elm Street Cafe', 'Referral', 'Scheduled', 'Locksmith', 'Back door lock + camera-ready strike', 340, 'Front Desk', null, 2, 'Scheduled Monday before opening hours.', null],
  ['Sandra Okafor', 'Website', 'New Lead', 'HVAC', 'Whole-home duct assessment', 250, 'Sales', 2, 0, 'Form submitted overnight — AI sent acknowledgment.', null],
  ['Mike Trammell', 'Phone', 'Contacted', 'Locksmith', 'Safe combination change', 150, 'Front Desk', 3, 6, 'Inherited business safe. Verification docs requested.', null],
  ['Northside Storage', 'Referral', 'Estimate Sent', 'Locksmith', 'Gate lock standardization — 3 sites', 2700, 'Sales', 5, 9, 'Multi-site deal. Decision maker travels — follow up next week.', null],
  ['Alicia Fuentes', 'AI Receptionist', 'Scheduled', 'HVAC', 'Heater diagnostic', 129, 'Ava (AI)', null, 1, 'Booked by AI overnight for tomorrow 10 AM window.', null],
  ['Bill Hodges', 'Phone', 'Lost', 'Locksmith', 'Antique lock restoration', 400, 'Front Desk', null, 20, 'Outside our service scope — referred to specialty shop.', 'Out of scope'],
  ['Vantage Office Park', 'Google Business Profile', 'Follow-up Needed', 'Locksmith', 'Master key audit + rekey', 1900, 'Owner', 0, 11, 'Lost master key incident. Security-sensitive, needs proposal this week.', null],
]

export const DEMO_LEADS: Lead[] = LEAD_SEED.map(([name, source, stage, vertical, service_need, estimated_value, assigned_to, followupDays, createdDaysAgo, notes, lost_reason], i) => ({
  id: `lead-${String(i + 1).padStart(3, '0')}`,
  name,
  phone: `(555) 6${String(10 + i)}-${String(1000 + i * 37).slice(0, 4)}`,
  email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@email.com`,
  source,
  stage,
  vertical,
  service_need,
  estimated_value,
  assigned_to,
  next_followup: followupDays === null ? null : daysFromNow(followupDays, 10),
  created_at: daysAgo(createdDaysAgo, 8 + (i % 9)),
  notes,
  lost_reason,
}))

export type QuoteStatus = 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined' | 'Expired'

export interface Quote {
  id: string
  lead_name: string
  service: string
  vertical: 'Locksmith' | 'HVAC'
  amount: number
  status: QuoteStatus
  sent_at: string | null
  decided_at: string | null
  notes: string
}

const QUOTE_SEED: Array<[string, string, 'Locksmith' | 'HVAC', number, QuoteStatus, number | null, number | null, string]> = [
  ['Jorge Mendez', 'Rekey — 6 locks, 2 keys each', 'Locksmith', 148, 'Sent', 1, null, 'Includes trip fee waiver for booking this week.'],
  ['Terrence Mills', 'Smart locks ×3 with code rotation setup', 'Locksmith', 1125, 'Viewed', 2, null, 'Viewed twice — send follow-up with STR case study.'],
  ['A. Winslow', 'Access control — 4 doors, badge readers', 'Locksmith', 4800, 'Draft', null, null, 'Pending site visit measurements.'],
  ['Greg Foster', 'Nest install + airflow assessment', 'HVAC', 349, 'Sent', 3, null, 'Offered bundle discount vs separate visits.'],
  ['Cheryl Dunn', 'Duct cleaning 2,400 sqft + dryer vent', 'HVAC', 380, 'Viewed', 4, null, 'Spouse approval pending.'],
  ['Sunrise Dental', 'Office rekey + restricted keyway', 'Locksmith', 520, 'Sent', 2, null, 'Explained key-control agreement.'],
  ['Tom Nguyen', 'AC compressor replacement, 3-ton', 'HVAC', 2150, 'Accepted', 6, 4, 'Won after financing options presented.'],
  ['Olivia Reyes', 'Mini-split 12k BTU garage install', 'HVAC', 3200, 'Sent', 3, null, 'Competing against 2 bids — emphasize 10-yr warranty.'],
  ['Bayou Brewing Co.', 'Panic hardware ×2 + master keying', 'Locksmith', 1400, 'Viewed', 5, null, 'Compliance deadline end of month.'],
  ['Ashford HOA', 'Pool gate + clubhouse lock package', 'Locksmith', 780, 'Sent', 4, null, 'Board vote Tuesday.'],
  ['Northside Storage', 'Gate lock standardization — 3 sites', 'Locksmith', 2700, 'Sent', 5, null, 'Volume pricing shown per site.'],
  ['Casa Verde Apartments', 'Turnover rekey contract — annual', 'Locksmith', 9000, 'Draft', null, null, 'Drafting SLA terms before sending.'],
  ['Priya Sharma', 'Smart lock upgrade — front entry', 'Locksmith', 375, 'Accepted', 18, 17, 'Repeat customer, accepted same day.'],
  ['Kevin Barnes', 'Car key replacement — proximity fob', 'Locksmith', 180, 'Declined', 9, 8, 'Lost on price to mobile competitor.'],
  ['Maria Delgado', 'Lock replacement ×2 after break-in', 'Locksmith', 220, 'Accepted', 3, 3, 'Accepted immediately, insurance docs provided.'],
  ['Vantage Office Park', 'Master key audit + rekey proposal', 'Locksmith', 1900, 'Draft', null, null, 'Security incident — expedite.'],
  ['Elm Street Cafe', 'Back door lock + electric strike prep', 'Locksmith', 340, 'Accepted', 2, 1, 'Scheduled for Monday pre-open.'],
  ['Ray Simmons', 'Furnace replacement — 80k BTU', 'HVAC', 4500, 'Sent', 1, null, 'Included rebate paperwork estimate.'],
  ['Harborview Property Mgmt', 'Per-unit rekey contract pricing', 'Locksmith', 6000, 'Viewed', 7, null, 'Annualized estimate — 40 units.'],
  ['Duane Porter', 'AC diagnostic visit', 'HVAC', 129, 'Expired', 12, null, 'No response after 2 follow-ups. Auto-expired.'],
]

export const DEMO_QUOTES: Quote[] = QUOTE_SEED.map(([lead_name, service, vertical, amount, status, sentDaysAgo, decidedDaysAgo, notes], i) => ({
  id: `quote-${String(i + 1).padStart(3, '0')}`,
  lead_name,
  service,
  vertical,
  amount,
  status,
  sent_at: sentDaysAgo === null ? null : daysAgo(sentDaysAgo, 11),
  decided_at: decidedDaysAgo === null ? null : daysAgo(decidedDaysAgo, 15),
  notes,
}))

// ---------------------------------------------------------------------------
// AI Shopper / Universal Cart
// ---------------------------------------------------------------------------

export type ShopperCategory = 'Locksmith Supplies' | 'HVAC Supplies' | 'Tools' | 'Van & Fleet' | 'Payments & Office' | 'Marketing' | 'Safety & PPE'
export type ShopperUrgency = 'Restock Now' | 'This Month' | 'Plan Ahead'

export interface ShopperItem {
  id: string
  name: string
  category: ShopperCategory
  vendor: string
  price: number
  unit: string
  urgency: ShopperUrgency
  reason: string
  in_cart: boolean
  qty: number
}

const SHOPPER_SEED: Array<[string, ShopperCategory, string, number, string, ShopperUrgency, string, boolean, number]> = [
  ['Kwikset rekey kit (universal, 200-pin)', 'Locksmith Supplies', 'Locksmith Distributor Co.', 89, 'kit', 'Restock Now', 'Rekey jobs up 34% over 30 days — current kit pin stock below reorder point.', true, 2],
  ['Schlage SC1 key blanks (250 pack)', 'Locksmith Supplies', 'Locksmith Distributor Co.', 62, 'pack', 'Restock Now', 'SC1 is your highest-cut blank. Van stock estimated <40 remaining.', true, 3],
  ['Kwikset KW1 key blanks (250 pack)', 'Locksmith Supplies', 'Locksmith Distributor Co.', 58, 'pack', 'This Month', 'Second-highest volume blank across completed jobs.', false, 1],
  ['Yale Assure smart lock (2-pack)', 'Locksmith Supplies', 'Amazon Business', 348, '2-pack', 'Restock Now', 'Smart lock installs are your #2 revenue service — 3 installs booked, 1 unit on shelf.', true, 2],
  ['August Wi-Fi smart lock', 'Locksmith Supplies', 'Amazon Business', 229, 'unit', 'This Month', 'Requested twice in AI receptionist calls this month.', false, 2],
  ['Grade 1 commercial deadbolts (6)', 'Locksmith Supplies', 'Grainger', 414, 'case', 'This Month', 'Commercial repair volume trending up; carry Grade 1 stock for same-day close.', false, 1],
  ['Panic bar exit device', 'Locksmith Supplies', 'Grainger', 189, 'unit', 'Restock Now', 'Two open commercial quotes include panic hardware (Bayou Brewing, warehouse).', true, 2],
  ['Restricted keyway cylinder set', 'Locksmith Supplies', 'Locksmith Distributor Co.', 260, 'set', 'Plan Ahead', 'Sunrise Dental quote requires restricted keys — order on acceptance.', false, 1],
  ['Lishi 2-in-1 pick set (automotive)', 'Tools', 'Locksmith Distributor Co.', 320, 'set', 'This Month', 'Automotive jobs are 22% of revenue; tech notes mention worn picks.', false, 1],
  ['Key cutting machine calibration kit', 'Tools', 'Locksmith Distributor Co.', 75, 'kit', 'Plan Ahead', 'Duplication error rate slightly elevated in tech notes.', false, 1],
  ['Plug spinner', 'Tools', 'Locksmith Distributor Co.', 45, 'unit', 'Plan Ahead', 'Elena requested a backup in job notes 2 weeks ago.', false, 1],
  ['Cordless drill + bit set (M18)', 'Tools', 'Home Depot Pro', 279, 'kit', 'This Month', 'Victor reported battery degradation on primary drill.', false, 1],
  ['Broken key extractor set', 'Tools', 'Amazon Business', 28, 'set', 'Restock Now', 'Consumable — 4 extractions logged this month.', true, 2],
  ['MERV-11 filters 16x25x1 (12 pack)', 'HVAC Supplies', 'SupplyHouse', 96, 'case', 'Restock Now', 'HVAC tune-up bookings growing — filters are your #1 HVAC consumable.', true, 2],
  ['Run capacitors assorted (45/5, 40/5, 35/5)', 'HVAC Supplies', 'HVAC Supply House', 118, 'kit', 'Restock Now', 'Capacitor swaps appear in 3 of last 8 HVAC diagnostics.', true, 1],
  ['Contactor 2-pole 30A (5 pack)', 'HVAC Supplies', 'HVAC Supply House', 85, 'pack', 'This Month', 'Standard failure part for aging condensers in your service area.', false, 1],
  ['Ecobee smart thermostat (2)', 'HVAC Supplies', 'Amazon Business', 438, '2-pack', 'This Month', 'Thermostat install quote open (Greg Foster) — stock for same-week install.', false, 1],
  ['Refrigerant gauge manifold set', 'HVAC Supplies', 'HVAC Supply House', 165, 'set', 'Plan Ahead', 'Backup set for second HVAC tech onboarding.', false, 1],
  ['Condensate drain treatment tabs', 'HVAC Supplies', 'SupplyHouse', 34, 'jar', 'This Month', 'Include with every maintenance plan visit.', false, 3],
  ['Maintenance plan welcome kits (25)', 'HVAC Supplies', 'ULINE', 145, 'box', 'Plan Ahead', 'Maintenance plan interest rising in call logs — prep onboarding kits.', false, 1],
  ['Van shelving upgrade — mid-roof', 'Van & Fleet', 'ULINE', 890, 'system', 'Plan Ahead', 'Marcus\'s van inventory audit shows 15 min/job lost to disorganization.', false, 1],
  ['Fuel cards program enrollment', 'Van & Fleet', 'WEX', 0, 'program', 'Plan Ahead', 'Fleet fuel spend untracked per-vehicle — enables per-tech cost visibility.', false, 1],
  ['Backup van battery jump pack', 'Van & Fleet', 'Home Depot Pro', 129, 'unit', 'This Month', 'One dead-battery delay logged this month.', false, 2],
  ['Tap-to-pay card readers (2)', 'Payments & Office', 'Stripe', 118, '2-pack', 'Restock Now', 'Cash pending verification is elevated — card readers reduce cash handling risk.', true, 2],
  ['Payment link QR cards for vans (500)', 'Payments & Office', 'VistaPrint', 65, 'box', 'This Month', 'Payment link conversion below target — QR at point of service lifts adoption.', false, 1],
  ['Receipt printer + paper bundle', 'Payments & Office', 'Amazon Business', 210, 'bundle', 'Plan Ahead', 'Requested by accountant for cash job paper trail.', false, 1],
  ['Branded uniforms — polos (12)', 'Marketing', 'ULINE', 240, 'dozen', 'Plan Ahead', 'New hire Sam Carter needs uniforms; refresh for team photo.', false, 1],
  ['Google LSA budget top-up', 'Marketing', 'Google', 500, 'month', 'This Month', 'GBP leads produced 2 commercial opportunities this month — highest close rate source.', false, 1],
  ['Review request SMS credits', 'Marketing', 'Twilio', 50, 'block', 'This Month', 'Review velocity flat; reviews drive GBP ranking.', false, 2],
  ['Yard signs for install jobs (25)', 'Marketing', 'VistaPrint', 175, 'box', 'Plan Ahead', 'Truck signage generated a $4,500 furnace lead — extend to yard signs.', false, 1],
  ['Cut-resistant gloves (6 pair)', 'Safety & PPE', 'Grainger', 54, 'pack', 'This Month', 'Standard PPE refresh cycle.', false, 1],
  ['Safety glasses (12)', 'Safety & PPE', 'Grainger', 36, 'box', 'This Month', 'PPE refresh with new hire.', false, 1],
  ['Knee pads — gel (4 pair)', 'Safety & PPE', 'Home Depot Pro', 88, 'pack', 'Plan Ahead', 'Install-heavy weeks ahead per calendar.', false, 1],
  ['First aid van kits (5)', 'Safety & PPE', 'ULINE', 95, 'pack', 'Plan Ahead', 'Annual replacement due.', false, 1],
  ['Lock lubricant PTFE (24 cans)', 'Locksmith Supplies', 'Locksmith Distributor Co.', 96, 'case', 'This Month', 'Every-job consumable, below reorder point.', false, 1],
  ['Door reinforcement plates (10)', 'Locksmith Supplies', 'Amazon Business', 180, 'box', 'Plan Ahead', 'Upsell on break-in repair jobs — 2 break-in jobs this month.', false, 1],
  ['Hinge pin door closers (8)', 'Locksmith Supplies', 'Grainger', 104, 'box', 'Plan Ahead', 'Commercial add-on inventory.', false, 1],
  ['UV leak detection dye kit', 'HVAC Supplies', 'HVAC Supply House', 42, 'kit', 'Plan Ahead', 'Leak-detection upsell on AC diagnostics.', false, 1],
  ['Vacuum pump oil (case)', 'HVAC Supplies', 'SupplyHouse', 58, 'case', 'Plan Ahead', 'Consumable for evacuation jobs.', false, 1],
  ['Nest Learning Thermostat (2)', 'HVAC Supplies', 'Home Depot Pro', 476, '2-pack', 'This Month', 'Alternate SKU for thermostat installs — customer requested brand.', false, 1],
]

export const DEMO_SHOPPER_ITEMS: ShopperItem[] = SHOPPER_SEED.map(([name, category, vendor, price, unit, urgency, reason, in_cart, qty], i) => ({
  id: `shop-${String(i + 1).padStart(3, '0')}`,
  name, category, vendor, price, unit, urgency, reason, in_cart, qty,
}))

// ---------------------------------------------------------------------------
// Training Academy
// ---------------------------------------------------------------------------

export interface TrainingLesson {
  id: string
  title: string
  description: string
  duration_min: number
  audience: string
  checklist: string[]
  completed: boolean
}

export const DEMO_TRAINING: TrainingLesson[] = [
  { id: 'tr-01', title: 'Getting Started with Titan', description: 'Tour the dashboard, sidebar, and the core idea: every job is a financial event.', duration_min: 8, audience: 'Everyone', completed: true, checklist: ['Log in and set your profile', 'Tour the dashboard', 'Understand job → money flow'] },
  { id: 'tr-02', title: 'Dispatch Fundamentals', description: 'Create jobs, assign technicians, and move jobs through the status pipeline.', duration_min: 12, audience: 'Dispatchers', completed: true, checklist: ['Create a job', 'Assign a technician', 'Update status through completion'] },
  { id: 'tr-03', title: 'Technician Mobile Workflow', description: 'Status updates, notes, photos, parts used, and collecting payment in the field.', duration_min: 15, audience: 'Technicians', completed: true, checklist: ['Mark En Route / Arrived', 'Add job notes and photos', 'Record amount collected and method'] },
  { id: 'tr-04', title: 'Cash Verification Protocol', description: 'Why cash control matters and how the owner verifies every cash collection.', duration_min: 10, audience: 'Owners & Accountants', completed: false, checklist: ['Review pending cash queue', 'Verify a cash job', 'Flag a discrepancy with a note'] },
  { id: 'tr-05', title: 'Payments & Payment Links', description: 'Send payment links, track conversion, and reduce unpaid balances.', duration_min: 9, audience: 'Dispatchers & CSRs', completed: false, checklist: ['Send a payment link', 'Track link conversion', 'Chase unpaid jobs'] },
  { id: 'tr-06', title: 'Reading Your Financials', description: 'Revenue, gross profit, EBITDA estimate, and job-level profitability.', duration_min: 14, audience: 'Owners', completed: false, checklist: ['Read the P&L summary', 'Add monthly expenses', 'Review profit by technician'] },
  { id: 'tr-07', title: 'The CEO Packet', description: 'Your monthly operating report — how to read it like a private-equity operator.', duration_min: 11, audience: 'Owners', completed: false, checklist: ['Generate the packet', 'Review issues found', 'Commit to 3 actions'] },
  { id: 'tr-08', title: 'Business Valuation Basics', description: 'What drives your multiple: clean books, dependency, leakage, and recurring revenue.', duration_min: 13, audience: 'Owners', completed: false, checklist: ['Run the valuation sliders', 'Understand sellability score', 'Start the 90-day plan'] },
  { id: 'tr-09', title: 'AI Receptionist Setup', description: 'Scripts, escalation rules, and reviewing overnight bookings.', duration_min: 10, audience: 'Owners & CSRs', completed: false, checklist: ['Review call scripts', 'Set escalation rules', 'Audit AI-booked jobs'] },
  { id: 'tr-10', title: 'CRM & Follow-ups', description: 'Work the pipeline: leads, quotes, and never letting a follow-up slip.', duration_min: 12, audience: 'Sales & CSRs', completed: false, checklist: ['Move a lead through stages', 'Send a quote', 'Clear overdue follow-ups'] },
  { id: 'tr-11', title: 'AI Shopper & Universal Cart', description: 'How Titan detects what you need and builds one cart across vendors.', duration_min: 7, audience: 'Owners & Managers', completed: false, checklist: ['Review recommendations', 'Approve cart items', 'Check purchase history'] },
  { id: 'tr-12', title: 'HVAC Mode Overview', description: 'Maintenance plans, tune-ups, equipment records, and seasonal demand.', duration_min: 12, audience: 'Everyone', completed: false, checklist: ['Switch vertical mode', 'Create a maintenance visit', 'Record equipment info'] },
]

// ---------------------------------------------------------------------------
// AI Recommendations (deterministic, referenced by dashboard + consultant)
// ---------------------------------------------------------------------------

export interface AIRecommendation {
  id: string
  severity: 'critical' | 'warning' | 'opportunity' | 'positive'
  title: string
  body: string
  module: string
  href: string
}

export const DEMO_RECOMMENDATIONS: AIRecommendation[] = [
  { id: 'rec-01', severity: 'critical', title: 'Unverified cash needs review', body: 'Cash collections are awaiting owner verification. Verify or flag them before month close — this is your top leakage risk.', module: 'Cash Verification', href: '/cash-verification' },
  { id: 'rec-02', severity: 'warning', title: '2 high-value follow-ups overdue', body: 'Bayou Brewing ($1,400, compliance deadline) and Vantage Office Park ($1,900, security incident) both have follow-ups due today.', module: 'CRM', href: '/crm' },
  { id: 'rec-03', severity: 'warning', title: 'Payment link conversion below target', body: 'Link conversion is under the 85% target. Send links at booking time and add QR cards at point of service.', module: 'Payments', href: '/payments' },
  { id: 'rec-04', severity: 'opportunity', title: 'Rekey supplies below reorder point', body: 'Rekey volume is up 34% and pin stock is low. The AI Shopper has a restock cart ready for approval.', module: 'AI Shopper', href: '/ai-shopper' },
  { id: 'rec-05', severity: 'opportunity', title: '$26k in open commercial quotes', body: 'Casa Verde, Harborview, Northside Storage, and A. Winslow together represent ~$26,500 in annualized commercial revenue. Prioritize site visits.', module: 'Quotes', href: '/quotes' },
  { id: 'rec-06', severity: 'positive', title: 'AI receptionist booked revenue overnight', body: 'Ava answered every after-hours call this week and recovered 3 missed calls into booked jobs.', module: 'AI Receptionist', href: '/ai-receptionist' },
]
