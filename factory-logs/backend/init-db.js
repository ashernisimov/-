const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'factory-logs.db');
const db = new Database(dbPath);

// Create events table
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('incident', 'maintenance', 'safety')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
    location TEXT NOT NULL,
    reporter TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
    resolution TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Create index for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
  CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
  CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
  CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at);
`);

// Insert sample data
const insert = db.prepare(`
  INSERT INTO events (type, title, description, severity, location, reporter, status, resolution)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const sampleEvents = [
  ['incident', 'Machine malfunction on Line 3', 'Conveyor belt motor stopped unexpectedly during production run. Production halted for 2 hours.', 'high', 'Production Line 3', 'John Smith', 'resolved', 'Motor replaced and tested. Production resumed.'],
  ['maintenance', 'Scheduled inspection of hydraulic press', 'Annual maintenance inspection of hydraulic press system including fluid check and pressure testing.', 'low', 'Assembly Area', 'Mary Johnson', 'closed', 'All systems operating normally. Next inspection due in 12 months.'],
  ['safety', 'Near miss - forklift incident', 'Forklift nearly collided with pedestrian in loading dock area. No injuries occurred.', 'medium', 'Loading Dock', 'Robert Davis', 'in_progress', 'Additional safety signage being installed.'],
  ['incident', 'Power outage affecting building A', 'Unexpected power outage in Building A caused by electrical grid issue. Backup generators activated.', 'critical', 'Building A', 'Sarah Williams', 'resolved', 'Main power restored. Investigating backup generator delay.'],
  ['maintenance', 'Replace air filters in HVAC system', 'Routine replacement of air filters in main HVAC system for Building B.', 'low', 'Building B - Mechanical Room', 'Michael Brown', 'open', null],
  ['safety', 'Spill cleanup in chemical storage', 'Small chemical spill detected in storage area. Area cordoned off immediately.', 'high', 'Chemical Storage Room', 'Jennifer Taylor', 'resolved', 'Spill cleaned by certified team. Area ventilated and cleared for use.'],
  ['incident', 'Quality issue detected in batch #4521', 'Quality control detected defects in production batch. Batch quarantined for review.', 'medium', 'Quality Control Lab', 'David Anderson', 'in_progress', 'Root cause analysis ongoing.'],
  ['maintenance', 'Oil change for CNC machine #7', 'Scheduled oil change and lubrication for CNC machine according to maintenance schedule.', 'low', 'Machine Shop', 'Lisa Martinez', 'closed', 'Maintenance completed successfully. Machine operating normally.']
];

sampleEvents.forEach(event => {
  insert.run(...event);
});

console.log('Database initialized successfully!');
console.log(`Database location: ${dbPath}`);
console.log(`Sample events inserted: ${sampleEvents.length}`);

db.close();
