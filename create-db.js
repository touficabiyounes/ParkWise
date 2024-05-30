"use strict"


const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');
db.prepare('DROP TABLE IF EXISTS user').run();
db.prepare('DROP TABLE IF EXISTS parkingLocation').run();
db.prepare('DROP TABLE IF EXISTS reservations').run();

db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT , name TEXT, password TEXT)').run();
db.prepare('CREATE TABLE parkingLocation (parkingName TEXT PRIMARY KEY, capacity INT) ').run();
db.prepare('CREATE TABLE reservations (reservationId INTEGER PRIMARY KEY AUTOINCREMENT, userId INT ,parkingName TEXT, slotNumber INT , startDate DATE , endDate DATE)').run();

db.prepare('INSERT INTO user (name, password) VALUES (?, ?)').run('John Doe', 'password123')
db.prepare('INSERT INTO parkingLocation (parkingName, capacity) VALUES (?, ?)').run('Luminy Parking', 100);
db.prepare('INSERT INTO parkingLocation (parkingName, capacity) VALUES (?, ?)').run('Joliette Parking ', 200);
db.prepare('INSERT INTO parkingLocation (parkingName, capacity) VALUES (?, ?)').run('Prado Parking', 2);
db.prepare('INSERT INTO reservations (userId, parkingName, slotNumber, startDate, endDate) VALUES (?, ?, ?, ?, ?)').run(1, 'Parking Lot A', 5, '2023-04-10 10:00:00', '2023-04-12 15:30:00')