import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env.local and .env
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        if (typeof process.loadEnvFile === 'function') {
          process.loadEnvFile(filePath);
        }
      } catch {
        // Fallback manual parser
        const content = fs.readFileSync(filePath, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ Error: VITE_SUPABASE_URL or SUPABASE_URL is missing in .env / .env.local');
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is missing in .env / .env.local');
  console.error('   Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file from your Supabase Dashboard -> Project Settings -> API (service_role secret).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Demo accounts specification
const DEMO_USERS = [
  {
    role: 'Admin',
    email: 'admin@infratrace.com',
    password: 'Admin@123456',
    fullName: 'Anil Patel',
    department: 'Infrastructure Management'
  },
  {
    role: 'Verifier',
    email: 'verifier@infratrace.com',
    password: 'Verify@123456',
    fullName: 'Suresh Sharma',
    department: 'Municipal Inspection & Verification'
  },
  {
    role: 'User',
    email: 'user@infratrace.com',
    password: 'User@123456',
    fullName: 'Ramesh Deshmukh',
    profession: 'Civil Engineer'
  }
];

// Helper to create or fetch auth user idempotently
async function ensureAuthUser(demoUser) {
  console.log(`Checking auth user: ${demoUser.email} (${demoUser.role})...`);
  
  // List users to check existing
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    throw new Error(`Failed to list auth users: ${listError.message}`);
  }

  let user = listData.users.find(u => u.email.toLowerCase() === demoUser.email.toLowerCase());

  if (!user) {
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: demoUser.email,
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.fullName,
        role: demoUser.role
      }
    });

    if (createError) {
      throw new Error(`Failed to create user ${demoUser.email}: ${createError.message}`);
    }
    user = createData.user;
    console.log(`  Created auth user ${demoUser.email} (ID: ${user.id})`);
  } else {
    // Update password, email_confirm and metadata to ensure valid state
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: demoUser.password,
      email_confirm: true,
      user_metadata: {
        full_name: demoUser.fullName,
        role: demoUser.role
      }
    });

    if (updateError) {
      console.warn(`  Warning updating user ${demoUser.email}: ${updateError.message}`);
    } else {
      user = updateData.user || user;
    }
    console.log(`  Existing auth user confirmed ${demoUser.email} (ID: ${user.id})`);
  }

  // Insert or update matching role profile table
  if (demoUser.role === 'Admin') {
    const { error: adminErr } = await supabase.from('admins').upsert({
      id: user.id,
      email: demoUser.email,
      full_name: demoUser.fullName,
      department: demoUser.department || 'Infrastructure Management'
    });
    if (adminErr) throw new Error(`Failed to upsert admins table: ${adminErr.message}`);
  } else if (demoUser.role === 'Verifier') {
    const { error: verifierErr } = await supabase.from('verifiers').upsert({
      id: user.id,
      email: demoUser.email,
      full_name: demoUser.fullName,
      department: demoUser.department || 'Inspection & Verification'
    });
    if (verifierErr) throw new Error(`Failed to upsert verifiers table: ${verifierErr.message}`);
  } else if (demoUser.role === 'User') {
    const { error: userProfileErr } = await supabase.from('users_profile').upsert({
      id: user.id,
      email: demoUser.email,
      full_name: demoUser.fullName,
      profession: demoUser.profession || 'Civil Engineer'
    });
    if (userProfileErr) throw new Error(`Failed to upsert users_profile table: ${userProfileErr.message}`);
  }

  return user;
}

// 30 Realistic Nashik Utility Records
function getUtilityRecords(adminId, verifierId, userId) {
  return [
    // --- WATER UTILITIES ---
    {
      record_id: 'WTR-2041',
      type: 'water',
      location_text: 'Gangapur Road, Near Old Pump Station, Nashik',
      latitude: 19.9985,
      longitude: 73.7650,
      installed_date: '2021-04-12',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: '12-inch Water Main, Gangapur Road',
      status: 'Verified',
      rejection_reason: null,
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'WTR-1002',
      type: 'water',
      location_text: 'College Road, Model Colony Junction, Nashik',
      latitude: 20.0052,
      longitude: 73.7715,
      installed_date: '2022-08-10',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: '6-inch Potable Water Feeder supplying College Road residential cluster.',
      status: 'Verified',
      rejection_reason: null,
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'WTR-1003',
      type: 'water',
      location_text: 'Anandwali Bridge, Godavari Bank, Nashik',
      latitude: 20.0145,
      longitude: 73.7482,
      installed_date: '2024-02-18',
      owner: 'Water Resources Dept, Maharashtra',
      description: 'Raw Water Intake Line along river embankment awaiting final pressure review.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },
    {
      record_id: 'WTR-1004',
      type: 'water',
      location_text: 'Mahatma Nagar Water Tank Road, Nashik',
      latitude: 19.9912,
      longitude: 73.7523,
      installed_date: '2023-11-05',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: 'Commercial 4-inch HDPE branch serving local retail center.',
      status: 'Rejected',
      rejection_reason: 'Missing hydrostatic pressure test certificate from accredited municipal surveyor.',
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'WTR-1005',
      type: 'water',
      location_text: 'Old Panchavati, Near Ramkund, Nashik',
      latitude: 20.0120,
      longitude: 73.7935,
      installed_date: '2020-10-14',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: 'High Pressure Water Supply Trunk serving heritage pilgrim district.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'WTR-1006',
      type: 'water',
      location_text: 'Govind Nagar City Center Link, Nashik',
      latitude: 19.9825,
      longitude: 73.7684,
      installed_date: '2024-01-20',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: 'Sub-main distribution line connected to secondary ring main.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },

    // --- ELECTRICITY UTILITIES ---
    {
      record_id: 'ELC-1001',
      type: 'electricity',
      location_text: 'Satpur MIDC Sector 1 Industrial Zone, Nashik',
      latitude: 19.9725,
      longitude: 73.7455,
      installed_date: '2019-06-20',
      owner: 'MSEDCL',
      description: '11kV Underground Power Feeder supplying manufacturing plants.',
      status: 'Verified',
      rejection_reason: null,
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'ELC-1002',
      type: 'electricity',
      location_text: 'Ambad MIDC Main Substation Loop, Nashik',
      latitude: 19.9328,
      longitude: 73.7315,
      installed_date: '2018-11-12',
      owner: 'MSETCL',
      description: '33kV Primary Transmission Grid Link to industrial substation.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'ELC-1003',
      type: 'electricity',
      location_text: 'Sharanpur Road Commercial Complex, Nashik',
      latitude: 19.9968,
      longitude: 73.7802,
      installed_date: '2024-03-01',
      owner: 'MSEDCL',
      description: '415V 4-Core Low-Tension underground feeder for office towers.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },
    {
      record_id: 'ELC-1004',
      type: 'electricity',
      location_text: 'Mumbai Naka Overbridge Access, Nashik',
      latitude: 19.9882,
      longitude: 73.7795,
      installed_date: '2023-09-15',
      owner: 'MSEDCL',
      description: 'Underground Transformer Spur feeding junction streetlighting.',
      status: 'Rejected',
      rejection_reason: 'Cable trench clearance violates minimum 1.5m safety margin from high-pressure gas main.',
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'ELC-1005',
      type: 'electricity',
      location_text: 'Dwarka Circle Traffic Interchange, Nashik',
      latitude: 19.9792,
      longitude: 73.8052,
      installed_date: '2021-12-05',
      owner: 'MSEDCL',
      description: 'Ring Main Unit (RMU) automated switching cable and isolation panel.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'ELC-1006',
      type: 'electricity',
      location_text: 'Pathardi Phata Highway Crossing, Nashik',
      latitude: 19.9482,
      longitude: 73.7761,
      installed_date: '2024-04-10',
      owner: 'MSEDCL',
      description: '11kV underground cable extension crossing NH-3 service road.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },

    // --- GAS UTILITIES ---
    {
      record_id: 'GAS-1001',
      type: 'gas',
      location_text: 'Indira Nagar Housing Complex Sector 2, Nashik',
      latitude: 19.9654,
      longitude: 73.7752,
      installed_date: '2022-05-19',
      owner: 'Maharashtra Natural Gas Ltd (MNGL)',
      description: 'Medium Pressure City Gas Grid (4 bar) piped natural gas network.',
      status: 'Verified',
      rejection_reason: null,
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'GAS-1002',
      type: 'gas',
      location_text: 'Trimbak Road Hospitality Cluster, Nashik',
      latitude: 19.9855,
      longitude: 73.7580,
      installed_date: '2021-07-22',
      owner: 'Maharashtra Natural Gas Ltd (MNGL)',
      description: '63mm PE Commercial PNG Main supplying hospitality sector.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'GAS-1003',
      type: 'gas',
      location_text: 'Untwadi Road City Center Mall Access, Nashik',
      latitude: 19.9852,
      longitude: 73.7621,
      installed_date: '2024-05-15',
      owner: 'Maharashtra Natural Gas Ltd (MNGL)',
      description: 'Residential Gas Distribution Loop undergoing pneumatic pressure test.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },
    {
      record_id: 'GAS-1004',
      type: 'gas',
      location_text: 'Cidco Sector 4 Commercial Boulevard, Nashik',
      latitude: 19.9555,
      longitude: 73.7554,
      installed_date: '2023-12-02',
      owner: 'Maharashtra Natural Gas Ltd (MNGL)',
      description: 'CNG Daughter Booster Station Supply Line.',
      status: 'Rejected',
      rejection_reason: 'Trench depth of 0.7m is below the mandatory 1.2m urban safety standard.',
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'GAS-1005',
      type: 'gas',
      location_text: 'Satpur Industrial Colony Gate 2, Nashik',
      latitude: 19.9760,
      longitude: 73.7380,
      installed_date: '2020-03-10',
      owner: 'Maharashtra Natural Gas Ltd (MNGL)',
      description: 'Primary City Gate Station Supply Conduit with cathodic protection.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'GAS-1006',
      type: 'gas',
      location_text: 'Canada Corner Commercial Quad, Nashik',
      latitude: 19.9972,
      longitude: 73.7805,
      installed_date: '2024-06-01',
      owner: 'Maharashtra Natural Gas Ltd (MNGL)',
      description: 'Sub-network PE valve manifold linking Sharanpur and Canada Corner lines.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },

    // --- SEWAGE UTILITIES ---
    {
      record_id: 'SWR-1001',
      type: 'sewage',
      location_text: 'Godavari Riverfront South Embankment, Nashik',
      latitude: 20.0085,
      longitude: 73.7885,
      installed_date: '2019-01-15',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: '1200mm RCC Interception & Diversion Trunk Sewer to Tapovan STP.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'SWR-1002',
      type: 'sewage',
      location_text: 'Nashik Road Railway Colony Zone, Nashik',
      latitude: 19.9620,
      longitude: 73.8180,
      installed_date: '2021-09-30',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: '450mm Stoneware Gravity Sewer Line serving Nashik Road railway precinct.',
      status: 'Verified',
      rejection_reason: null,
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'SWR-1003',
      type: 'sewage',
      location_text: 'Ambad MIDC Industrial Drainage Corridor, Nashik',
      latitude: 19.9380,
      longitude: 73.7380,
      installed_date: '2024-02-28',
      owner: 'MIDC Sanitation Board',
      description: 'Industrial Effluent Collection Line with internal acid-resistant lining.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },
    {
      record_id: 'SWR-1004',
      type: 'sewage',
      location_text: 'CBS Central Bus Station Junction, Nashik',
      latitude: 20.0015,
      longitude: 73.7865,
      installed_date: '2023-10-18',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: 'Stormwater Outfall Collector and box culvert drainage system.',
      status: 'Rejected',
      rejection_reason: 'GPS coordinate drift exceeding 4 meters relative to NMC master GIS survey benchmark.',
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'SWR-1005',
      type: 'sewage',
      location_text: 'Tapovan Sewage Treatment Plant Feed, Nashik',
      latitude: 20.0060,
      longitude: 73.8050,
      installed_date: '2020-07-14',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: 'Secondary Sewage Collector Main delivering to Tapovan bio-reactors.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'SWR-1006',
      type: 'sewage',
      location_text: 'Govind Nagar Sector 3 Outer Ring, Nashik',
      latitude: 19.9805,
      longitude: 73.7710,
      installed_date: '2024-03-25',
      owner: 'Nashik Municipal Corporation (NMC)',
      description: 'Vitrified Clay Sanitary Sub-collector awaiting CCTV crawler scan.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },

    // --- TELECOM UTILITIES ---
    {
      record_id: 'TEL-1001',
      type: 'telecom',
      location_text: 'Nashik Smart City Command Center (ICCC), Panchavati',
      latitude: 19.9995,
      longitude: 73.7820,
      installed_date: '2021-01-10',
      owner: 'Nashik Smart City Development Corp (NMSCDCL)',
      description: '48-Core Optical Fiber Backbone linking civic CCTV surveillance network.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'TEL-1002',
      type: 'telecom',
      location_text: 'Gangapur Road IT Corridor, Nashik',
      latitude: 19.9940,
      longitude: 73.7610,
      installed_date: '2020-11-25',
      owner: 'BSNL',
      description: 'Underground Telecom Multi-Duct housing state fiber backbone.',
      status: 'Verified',
      rejection_reason: null,
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'TEL-1003',
      type: 'telecom',
      location_text: 'College Road Modern High School Sector, Nashik',
      latitude: 20.0035,
      longitude: 73.7690,
      installed_date: '2024-04-05',
      owner: 'Jio Digital Fiber Ltd',
      description: '5G Micro-cell Optical Fiber Spur for small-cell urban pole mounts.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    },
    {
      record_id: 'TEL-1004',
      type: 'telecom',
      location_text: 'Cidco Sector 9 Main Arterial Road, Nashik',
      latitude: 19.9520,
      longitude: 73.7480,
      installed_date: '2023-08-20',
      owner: 'Airtel Telesonic',
      description: '96-Core Underground Fiber Conduit along highway bypass.',
      status: 'Rejected',
      rejection_reason: 'Lacks documented underground warning ribbon and magnetic tracer wire at 0.5m depth.',
      created_by: userId,
      verified_by: verifierId
    },
    {
      record_id: 'TEL-1005',
      type: 'telecom',
      location_text: 'Panchavati Police Divisional HQ Link, Nashik',
      latitude: 20.0150,
      longitude: 73.7910,
      installed_date: '2022-03-12',
      owner: 'Nashik City Police & Disaster Mgmt',
      description: 'Emergency Response Radio & Fiber Conduit linking emergency command post.',
      status: 'Verified',
      rejection_reason: null,
      created_by: adminId,
      verified_by: verifierId
    },
    {
      record_id: 'TEL-1006',
      type: 'telecom',
      location_text: 'Trimbak Road Rail-Civic Corridor, Nashik',
      latitude: 19.9890,
      longitude: 73.7660,
      installed_date: '2024-05-20',
      owner: 'RailTel Corporation',
      description: 'Metropolitan High Capacity Dark Fiber Ring linking civic exchange.',
      status: 'Pending',
      rejection_reason: null,
      created_by: userId,
      verified_by: null
    }
  ];
}

async function seed() {
  console.log('🚀 Starting InfraTrace backend database seeding...');
  console.log(`Connected to: ${supabaseUrl}`);

  // 1. Create or confirm Demo Auth Users & Role tables
  console.log('\n--- Step 1: Setting up Demo Accounts ---');
  const userMap = {};
  for (const demoUser of DEMO_USERS) {
    const authUser = await ensureAuthUser(demoUser);
    userMap[demoUser.role] = authUser.id;
  }

  const adminId = userMap['Admin'];
  const verifierId = userMap['Verifier'];
  const userId = userMap['User'];

  console.log('✅ Demo accounts ready:');
  console.log(`   Admin:    admin@infratrace.com    (ID: ${adminId})`);
  console.log(`   Verifier: verifier@infratrace.com (ID: ${verifierId})`);
  console.log(`   User:     user@infratrace.com     (ID: ${userId})`);

  // 2. Insert 30 Nashik Utility Records
  console.log('\n--- Step 2: Seeding 30 Nashik Utility Records ---');
  const utilityRecords = getUtilityRecords(adminId, verifierId, userId);

  const insertedUtilities = [];
  for (const record of utilityRecords) {
    const { data, error } = await supabase
      .from('utilities')
      .upsert(record, { onConflict: 'record_id' })
      .select('id, record_id, status, type, location_text, description')
      .single();

    if (error) {
      console.error(`❌ Error upserting utility ${record.record_id}:`, error.message);
      throw error;
    }
    insertedUtilities.push({ ...data, ...record });
  }

  console.log(`✅ Upserted ${insertedUtilities.length} utility records successfully.`);

  // 3. Seed Status Timeline Events (record_events)
  console.log('\n--- Step 3: Seeding Timeline Audit Events ---');
  for (const util of insertedUtilities) {
    // Check if events already exist for this utility
    const { data: existingEvents, error: evCheckErr } = await supabase
      .from('record_events')
      .select('id')
      .eq('utility_id', util.id);

    if (evCheckErr) {
      console.warn(`Warning checking events for ${util.record_id}: ${evCheckErr.message}`);
    }

    if (!existingEvents || existingEvents.length === 0) {
      const eventsToInsert = [
        {
          utility_id: util.id,
          event: 'Submitted',
          note: `Initial mapping record captured and submitted for ${util.description || util.record_id}.`,
          by_user: util.created_by,
          created_at: util.installed_date ? new Date(util.installed_date).toISOString() : new Date().toISOString()
        }
      ];

      if (util.status === 'Verified') {
        eventsToInsert.push({
          utility_id: util.id,
          event: 'Verified',
          note: 'On-site field verification completed. Coordinates and depth validated with municipal GIS standard.',
          by_user: util.verified_by || verifierId,
          created_at: new Date(Date.now() - 86400000 * 5).toISOString()
        });
      } else if (util.status === 'Rejected') {
        eventsToInsert.push({
          utility_id: util.id,
          event: 'Rejected',
          note: util.rejection_reason || 'Record rejected due to validation failure.',
          by_user: util.verified_by || verifierId,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        });
      } else if (util.status === 'Pending') {
        eventsToInsert.push({
          utility_id: util.id,
          event: 'Under Review',
          note: 'Queued for on-site municipal field inspection and survey validation.',
          by_user: verifierId,
          created_at: new Date(Date.now() - 86400000 * 1).toISOString()
        });
      }

      const { error: evInsertErr } = await supabase.from('record_events').insert(eventsToInsert);
      if (evInsertErr) {
        console.warn(`Warning inserting events for ${util.record_id}: ${evInsertErr.message}`);
      }
    }
  }

  console.log('✅ Timeline audit events populated.');

  console.log('\n=============================================================');
  console.log('🎉 InfraTrace database seeding completed successfully!');
  console.log('=============================================================');
  console.log('Demo Credentials:');
  console.log('  👑 Admin:    admin@infratrace.com    / Admin@123456');
  console.log('  🔍 Verifier: verifier@infratrace.com / Verify@123456');
  console.log('  👷 User:     user@infratrace.com     / User@123456 (Civil Engineer)');
  console.log('=============================================================');
}

seed().catch(err => {
  console.error('❌ Seeding failed with error:', err);
  process.exit(1);
});
