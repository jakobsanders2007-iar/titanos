-- ============================================================
-- Titan Locksmith OS — Demo Seed Data
-- ============================================================
-- Run AFTER schema.sql.
-- Usage: execute in Supabase SQL editor, or via the /api/seed route
-- (service role key required — never expose to client).
-- ============================================================

-- Wipe existing demo data
delete from activity_log    where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from ceo_packets     where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from cash_verifications where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from payments        where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from expenses        where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from jobs            where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from service_types   where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from technicians     where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from customers       where company_id = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;
delete from companies       where id          = 'a1b2c3d4-0000-0000-0000-000000000001'::uuid;

-- ============================================================
-- COMPANY
-- ============================================================

insert into companies (id, name, phone, email, website, address, timezone) values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Titan Locksmith Demo',
  '(555) 800-1234',
  'ops@titanlocksmith.com',
  'https://titanlocksmith.com',
  '4521 Commerce Dr, Houston, TX 77002',
  'America/Chicago'
);

-- ============================================================
-- SERVICE TYPES
-- ============================================================

insert into service_types (id, company_id, name, default_price) values
  ('st-0001-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'House Lockout',       95),
  ('st-0002-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Car Lockout',         75),
  ('st-0003-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Rekey',              120),
  ('st-0004-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Lock Replacement',   220),
  ('st-0005-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Smart Lock Install', 375),
  ('st-0006-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Safe Opening',       300),
  ('st-0007-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Emergency Locksmith',175),
  ('st-0008-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Commercial Lock Repair', 295),
  ('st-0009-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Key Duplication',    35),
  ('st-0010-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Ignition Repair',   200);

-- ============================================================
-- TECHNICIANS
-- ============================================================

insert into technicians (id, company_id, name, phone, email, active) values
  ('tc-0001-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Marcus Reed',     '(555) 201-0001', 'marcus@titanlocksmith.com',  true),
  ('tc-0002-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Elena Cruz',      '(555) 201-0002', 'elena@titanlocksmith.com',   true),
  ('tc-0003-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Andre Thompson',  '(555) 201-0003', 'andre@titanlocksmith.com',   true),
  ('tc-0004-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Victor Nguyen',   '(555) 201-0004', 'victor@titanlocksmith.com',  true);

-- ============================================================
-- CUSTOMERS
-- ============================================================

insert into customers (id, company_id, name, phone, email, address) values
  ('cu-0001-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Sarah Mitchell',   '(555) 300-1001', 'sarah.mitchell@email.com',  '1204 Oak Lane, Houston, TX 77001'),
  ('cu-0002-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'James Okafor',     '(555) 300-1002', 'james.okafor@email.com',    '8820 Westheimer Rd, Houston, TX 77063'),
  ('cu-0003-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Priya Sharma',     '(555) 300-1003', 'priya.sharma@email.com',    '3301 Kirby Dr, Houston, TX 77098'),
  ('cu-0004-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'David Hernandez',  '(555) 300-1004', 'david.h@email.com',          '5502 Main St, Houston, TX 77002'),
  ('cu-0005-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Lisa Nguyen',      '(555) 300-1005', 'lisa.nguyen@email.com',     '714 Heights Blvd, Houston, TX 77007'),
  ('cu-0006-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Robert Chen',      '(555) 300-1006', 'r.chen@email.com',           '2200 Montrose Blvd, Houston, TX 77006'),
  ('cu-0007-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Angela Williams',  '(555) 300-1007', 'angela.w@email.com',         '9900 Bellaire Blvd, Bellaire, TX 77401'),
  ('cu-0008-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Kevin Patel',      '(555) 300-1008', 'kpatel@email.com',           '330 W Alabama St, Houston, TX 77006'),
  ('cu-0009-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Monica Torres',    '(555) 300-1009', 'monica.t@email.com',         '6400 Richmond Ave, Houston, TX 77057'),
  ('cu-0010-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Brian Jackson',    '(555) 300-1010', 'bjackson@email.com',         '1100 Louisiana St, Houston, TX 77002'),
  ('cu-0011-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Rachel Kim',       '(555) 300-1011', 'rachel.kim@email.com',       '4455 Shepherd Dr, Houston, TX 77019'),
  ('cu-0012-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Thomas Brown',     '(555) 300-1012', 'tbrown@email.com',           '7801 Westpark Dr, Houston, TX 77063'),
  ('cu-0013-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Natasha Foster',   '(555) 300-1013', 'nfoster@email.com',          '2910 Buffalo Speedway, Houston, TX 77098'),
  ('cu-0014-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Carlos Rivera',    '(555) 300-1014', 'c.rivera@email.com',         '500 Crawford St, Houston, TX 77002'),
  ('cu-0015-0000-0000-0000-000000000001', 'a1b2c3d4-0000-0000-0000-000000000001', 'Jennifer Walsh',   '(555) 300-1015', 'j.walsh@email.com',          '3800 Greenbriar Dr, Houston, TX 77098');

-- ============================================================
-- JOBS  (using relative dates via now() - interval)
-- ============================================================

insert into jobs (
  id, company_id, customer_id, technician_id,
  service_type, source, status, address,
  scheduled_start, estimated_price, final_price, amount_collected,
  payment_method, payment_status,
  payment_link_sent, payment_link_url,
  cash_verification_status,
  parts_cost, technician_notes, notes, created_by
) values

-- ── COMPLETED PAST JOBS ──────────────────────────────────────

('jb-0001-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0001-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'House Lockout','Phone','Completed','1204 Oak Lane, Houston, TX 77001',
 now()-interval'28 days'+interval'9 hours', 95, 95, 95,
 'Cash','Cash Pending Verification',false,null,'pending',
 0,'Standard house lockout, no damage to lock.','',null),

('jb-0002-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0002-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Car Lockout','Google Business Profile','Completed','8820 Westheimer Rd, Houston, TX 77063',
 now()-interval'27 days'+interval'11 hours', 75, 85, 85,
 'Payment Link','Paid',true,'https://pay.titan.com/link/abc123',null,
 0,'Slim jim method worked.','',null),

('jb-0003-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0003-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Rekey','Referral','Completed','3301 Kirby Dr, Houston, TX 77098',
 now()-interval'26 days'+interval'10 hours', 150, 175, 175,
 'Card','Paid',false,null,null,
 25,'Rekeyed 3 locks, front door, back door, garage.','New homeowner.',null),

('jb-0004-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0004-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Lock Replacement','Website','Completed','5502 Main St, Houston, TX 77002',
 now()-interval'25 days'+interval'14 hours', 200, 245, 245,
 'Zelle','Paid',true,'https://pay.titan.com/link/def456',null,
 75,'Replaced deadbolt and knob set.','',null),

('jb-0005-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0005-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Smart Lock Install','Google Business Profile','Completed','714 Heights Blvd, Houston, TX 77007',
 now()-interval'24 days'+interval'13 hours', 350, 385, 385,
 'Card','Paid',false,null,null,
 120,'Schlage Encode installed. Customer walked through app setup.','Customer had the lock, install only.',null),

('jb-0006-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0006-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Safe Opening','Phone','Completed','2200 Montrose Blvd, Houston, TX 77006',
 now()-interval'23 days'+interval'15 hours', 300, 350, 350,
 'Cash','Cash Pending Verification',false,null,'pending',
 0,'Combination safe, manipulation method used.','',null),

('jb-0007-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0007-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Emergency Locksmith','Phone','Completed','9900 Bellaire Blvd, Bellaire, TX 77401',
 now()-interval'22 days'+interval'23 hours', 125, 150, 150,
 'Payment Link','Paid',true,'https://pay.titan.com/link/ghi789',null,
 10,'Emergency call 11pm. Lock was damaged.','After hours rate applied.',null),

('jb-0008-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0008-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Commercial Lock Repair','Referral','Completed','330 W Alabama St, Houston, TX 77006',
 now()-interval'21 days'+interval'9 hours', 275, 310, 310,
 'Check','Paid',false,null,null,
 85,'Commercial door closer and panic bar repaired.','Net-30 terms discussed.',null),

('jb-0009-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0009-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Key Duplication','Phone','Completed','6400 Richmond Ave, Houston, TX 77057',
 now()-interval'20 days'+interval'11 hours', 35, 45, 45,
 'Cash','Cash Pending Verification',false,null,'pending',
 8,'3 keys duplicated.','',null),

('jb-0010-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0010-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Ignition Repair','Google Business Profile','Completed','1100 Louisiana St, Houston, TX 77002',
 now()-interval'19 days'+interval'10 hours', 200, 225, 225,
 'Card','Paid',true,'https://pay.titan.com/link/jkl012',null,
 45,'Ignition cylinder replaced.','',null),

('jb-0011-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0011-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'House Lockout','Phone','Completed','4455 Shepherd Dr, Houston, TX 77019',
 now()-interval'18 days'+interval'14 hours', 95, 95, 95,
 'Venmo','Paid',false,null,null,
 0,'Pick open. No damage.','',null),

('jb-0012-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0012-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Lock Replacement','Yelp','Completed','7801 Westpark Dr, Houston, TX 77063',
 now()-interval'17 days'+interval'9 hours', 220, 260, 260,
 'Card','Paid',true,'https://pay.titan.com/link/mno345',null,
 80,'Replaced front and side door locks.','',null),

('jb-0013-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0013-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Rekey','Website','Completed','2910 Buffalo Speedway, Houston, TX 77098',
 now()-interval'16 days'+interval'10 hours', 120, 120, 120,
 'Payment Link','Paid',true,'https://pay.titan.com/link/pqr678',null,
 15,'Rekeyed 2 locks.','',null),

('jb-0014-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0014-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Car Lockout','Phone','Completed','500 Crawford St, Houston, TX 77002',
 now()-interval'15 days'+interval'16 hours', 75, 75, 75,
 'Cash','Cash Pending Verification',false,null,'pending',
 0,'Quick lockout, 15 min.','',null),

('jb-0015-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0015-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Smart Lock Install','Google Business Profile','Completed','3800 Greenbriar Dr, Houston, TX 77098',
 now()-interval'14 days'+interval'13 hours', 400, 450, 450,
 'Card','Paid',true,'https://pay.titan.com/link/stu901',null,
 150,'August Smart Lock Pro + keypad installed.','',null),

('jb-0016-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0001-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Emergency Locksmith','Phone','Completed','1204 Oak Lane, Houston, TX 77001',
 now()-interval'13 days'+interval'22 hours', 150, 175, 175,
 'Cash','Cash Pending Verification',false,null,'pending',
 15,'Broken key extraction. Lock still functional.','',null),

('jb-0017-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0002-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Commercial Lock Repair','Referral','Completed','8820 Westheimer Rd, Houston, TX 77063',
 now()-interval'12 days'+interval'9 hours', 350, 390, 390,
 'Check','Paid',false,null,null,
 110,'Master key system installed for 5 doors.','Commercial client 2nd job this month.',null),

('jb-0018-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0003-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Safe Opening','Phone','Completed','3301 Kirby Dr, Houston, TX 77098',
 now()-interval'11 days'+interval'11 hours', 275, 300, 300,
 'Zelle','Paid',false,null,null,
 0,'Gun safe — electronic bypass used.','',null),

('jb-0019-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0004-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'House Lockout','Google Business Profile','Completed','5502 Main St, Houston, TX 77002',
 now()-interval'10 days'+interval'9 hours', 95, 95, 0,
 'Payment Link','Payment Link Sent',true,'https://pay.titan.com/link/vwx234',null,
 0,'Completed. Sent payment link.','',null),

('jb-0020-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0005-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Ignition Repair','Phone','Completed','714 Heights Blvd, Houston, TX 77007',
 now()-interval'9 days'+interval'13 hours', 185, 210, 210,
 'Card','Paid',false,null,null,
 50,'Ignition switch replaced. Key programmed.','',null),

('jb-0021-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0006-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Rekey','Website','Completed','2200 Montrose Blvd, Houston, TX 77006',
 now()-interval'8 days'+interval'10 hours', 140, 160, 160,
 'Payment Link','Paid',true,'https://pay.titan.com/link/yza567',null,
 20,'Rekeyed 4 locks.','',null),

('jb-0022-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0007-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Key Duplication','Phone','Completed','9900 Bellaire Blvd, Bellaire, TX 77401',
 now()-interval'7 days'+interval'11 hours', 25, 30, 30,
 'Cash','Cash Pending Verification',false,null,'pending',
 5,'2 house keys.','',null),

('jb-0023-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0008-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Car Lockout','Google Business Profile','Completed','330 W Alabama St, Houston, TX 77006',
 now()-interval'6 days'+interval'15 hours', 75, 85, 85,
 'Card','Paid',true,'https://pay.titan.com/link/bcd890',null,
 0,'Tesla Model 3 lockout.','',null),

('jb-0024-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0009-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Lock Replacement','Referral','Completed','6400 Richmond Ave, Houston, TX 77057',
 now()-interval'5 days'+interval'10 hours', 230, 275, 275,
 'Zelle','Paid',false,null,null,
 90,'Kwikset SmartKey set installed front and back.','',null),

('jb-0025-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0010-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Emergency Locksmith','Phone','Completed','1100 Louisiana St, Houston, TX 77002',
 now()-interval'4 days'+interval'20 hours', 200, 225, 225,
 'Cash','Cash Pending Verification',false,null,'pending',
 20,'Business lockout — owner forgot keys.','Emergency commercial rate.',null),

('jb-0033-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0005-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Key Duplication','Phone','Completed','714 Heights Blvd, Houston, TX 77007',
 now()-interval'3 days'+interval'11 hours', 40, 40, 40,
 'Cash','Cash Pending Verification',false,null,'pending',
 8,'4 keys made.','',null),

('jb-0034-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0006-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Ignition Repair','Google Business Profile','Completed','2200 Montrose Blvd, Houston, TX 77006',
 now()-interval'2 days'+interval'14 hours', 195, 220, 220,
 'Card','Paid',false,null,null,
 55,'Honda Civic ignition.','',null),

('jb-0036-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0008-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Smart Lock Install','Website','Completed','330 W Alabama St, Houston, TX 77006',
 now()-interval'1 day'+interval'9 hours', 375, 395, 395,
 'Payment Link','Paid',true,'https://pay.titan.com/link/hij456',null,
 130,'Yale Assure installed. Works great.','',null),

('jb-0037-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0009-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Emergency Locksmith','Phone','Completed','6400 Richmond Ave, Houston, TX 77057',
 now()-interval'1 day'+interval'23 hours', 175, 200, 200,
 'Cash','Cash Pending Verification',false,null,'pending',
 10,'Midnight call. Forced entry damage — door knob replaced.','Emergency premium applied.',null),

('jb-0038-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0010-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'Rekey','Referral','Completed','1100 Louisiana St, Houston, TX 77002',
 now()-interval'1 day'+interval'13 hours', 130, 155, 155,
 'Venmo','Paid',false,null,null,
 20,'Move-out rekey 3 locks.','',null),

-- ── TODAY'S ACTIVE JOBS ──────────────────────────────────────

('jb-0039-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0011-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Car Lockout','Google Business Profile','Completed','4455 Shepherd Dr, Houston, TX 77019',
 date_trunc('day', now())+interval'8 hours', 75, 75, 75,
 'Card','Paid',true,'https://pay.titan.com/link/klm789',null,
 0,'F-150 lockout, slim jim.','',null),

('jb-0026-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0011-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Smart Lock Install','Google Business Profile','Assigned','4455 Shepherd Dr, Houston, TX 77019',
 date_trunc('day', now())+interval'10 hours', 350, null, 0,
 null,'Unpaid',false,null,null,
 0,'','Customer has lock — install only.',null),

('jb-0027-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0012-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Rekey','Phone','Scheduled','7801 Westpark Dr, Houston, TX 77063',
 date_trunc('day', now())+interval'13 hours 30 minutes', 120, null, 0,
 null,'Unpaid',false,null,null,
 0,'','',null),

('jb-0028-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0013-0000-0000-0000-000000000001','tc-0003-0000-0000-0000-000000000001',
 'Car Lockout','Google Business Profile','En Route','2910 Buffalo Speedway, Houston, TX 77098',
 date_trunc('day', now())+interval'9 hours', 75, null, 0,
 null,'Unpaid',true,'https://pay.titan.com/link/efg123',null,
 0,'','',null),

('jb-0029-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0014-0000-0000-0000-000000000001','tc-0004-0000-0000-0000-000000000001',
 'House Lockout','Phone','In Progress','500 Crawford St, Houston, TX 77002',
 date_trunc('day', now())+interval'11 hours', 95, null, 0,
 null,'Unpaid',false,null,null,
 0,'','',null),

-- ── FUTURE SCHEDULED ─────────────────────────────────────────

('jb-0030-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0015-0000-0000-0000-000000000001',null,
 'Lock Replacement','Yelp','Scheduled','3800 Greenbriar Dr, Houston, TX 77098',
 date_trunc('day', now())+interval'1 day'+interval'9 hours', 240, null, 0,
 null,'Unpaid',false,null,null,
 0,'','Prefers morning slot.',null),

('jb-0031-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0001-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'Commercial Lock Repair','Referral','Scheduled','1204 Oak Lane, Houston, TX 77001',
 date_trunc('day', now())+interval'2 days'+interval'10 hours', 300, null, 0,
 null,'Unpaid',false,null,null,
 0,'','',null),

('jb-0040-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0012-0000-0000-0000-000000000001',null,
 'Lock Replacement','Phone','New Lead','7801 Westpark Dr, Houston, TX 77063',
 date_trunc('day', now())+interval'3 days'+interval'10 hours', 200, null, 0,
 null,'Unpaid',false,null,null,
 0,'','Called in this morning. Needs estimate.',null),

-- ── MISC STATUS ───────────────────────────────────────────────

('jb-0032-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0003-0000-0000-0000-000000000001','tc-0002-0000-0000-0000-000000000001',
 'Safe Opening','Phone','Cancelled','3301 Kirby Dr, Houston, TX 77098',
 now()-interval'3 days'+interval'14 hours', 275, null, 0,
 null,'Unpaid',false,null,null,
 0,'','Customer cancelled — rescheduling.',null),

('jb-0035-0000-0000-0000-000000000001','a1b2c3d4-0000-0000-0000-000000000001',
 'cu-0007-0000-0000-0000-000000000001','tc-0001-0000-0000-0000-000000000001',
 'House Lockout','Phone','No Show','9900 Bellaire Blvd, Bellaire, TX 77401',
 now()-interval'2 days'+interval'10 hours', 95, null, 0,
 null,'Unpaid',false,null,null,
 0,'No one home. Called twice.','',null);

-- ============================================================
-- EXPENSES
-- ============================================================

insert into expenses (company_id, category, amount, date, notes, recurring) values
  ('a1b2c3d4-0000-0000-0000-000000000001','Payroll',       12000, current_date, 'Monthly technician payroll',         true),
  ('a1b2c3d4-0000-0000-0000-000000000001','Vehicle',        1800, current_date, '4 trucks fuel + maintenance',         true),
  ('a1b2c3d4-0000-0000-0000-000000000001','Insurance',       850, current_date, 'General liability + commercial auto', true),
  ('a1b2c3d4-0000-0000-0000-000000000001','Marketing',       600, current_date, 'Google Ads + Yelp',                   true),
  ('a1b2c3d4-0000-0000-0000-000000000001','Tools/Equipment', 350, current_date, 'Monthly supply restocking',           true),
  ('a1b2c3d4-0000-0000-0000-000000000001','Misc',            200, current_date, 'Office + admin misc',                false);
