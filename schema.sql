PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    name TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role TEXT NOT NULL CHECK (
        role IN ('patient', 'doctor', 'admin')
    ),

    phone TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS patient_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    date_of_birth TEXT,

    gender TEXT,

    blood_group TEXT,

    emergency_contact_name TEXT,

    emergency_contact_phone TEXT,

    address TEXT,

    health_score INTEGER DEFAULT 0,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS doctor_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    user_id INTEGER NOT NULL UNIQUE,

    specialty TEXT NOT NULL,

    qualification TEXT,

    experience_years INTEGER DEFAULT 0,

    consultation_fee REAL DEFAULT 0,

    location TEXT,

    bio TEXT,

    rating REAL DEFAULT 5.0,

    available INTEGER DEFAULT 1,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS vitals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    patient_id INTEGER NOT NULL,

    heart_rate INTEGER,

    oxygen_level REAL,

    temperature REAL,

    systolic INTEGER,

    diastolic INTEGER,

    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    patient_id INTEGER NOT NULL,

    doctor_id INTEGER NOT NULL,

    appointment_date TEXT NOT NULL,

    appointment_time TEXT NOT NULL,

    consultation_type TEXT NOT NULL,

    reason TEXT,

    status TEXT DEFAULT 'confirmed',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (doctor_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS medicines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    patient_id INTEGER NOT NULL,

    name TEXT NOT NULL,

    dosage TEXT NOT NULL,

    frequency TEXT DEFAULT 'Daily',

    medicine_time TEXT NOT NULL,

    prescribed_by INTEGER,

    active INTEGER DEFAULT 1,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (patient_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (prescribed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);


CREATE TABLE IF NOT EXISTS medicine_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    medicine_id INTEGER NOT NULL,

    patient_id INTEGER NOT NULL,

    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (medicine_id)
        REFERENCES medicines(id)
        ON DELETE CASCADE,

    FOREIGN KEY (patient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS emergency_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    patient_id INTEGER NOT NULL,

    latitude REAL,

    longitude REAL,

    message TEXT,

    status TEXT DEFAULT 'active',

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    resolved_at DATETIME,

    FOREIGN KEY (patient_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);