"use strict"
const Sqlite = require('better-sqlite3');
let db = new Sqlite('db.sqlite');



exports.login = (name, password) => {
    const user = db.prepare('SELECT id FROM user WHERE name = ? AND password = ?').get(name, password);
    if (user!== undefined) {
        console.log("Welcome!");
        return user.id;
    }
    return -1;
  };
  
  exports.new_user = (name, password) => {
    db.prepare('INSERT INTO user (name, password) VALUES (?, ?)').run(name, password);
    let newUserId = db.prepare('SELECT * FROM user ORDER BY id').run().lastInsertRowid;
    return newUserId;
  };




  /*exports.get_day_reservations= (parkingName, startDate , endDate)=>{ 
    console.log('startDate:', startDate);
    console.log('endDate:', endDate);
    let startDate1 = new Date(startDate.year, startDate.month - 1, startDate.day, 0, 0);
    let endDate1 = new Date(endDate.year, endDate.month - 1, endDate.day, 0, 0);
    let lastDayOfMonth = new Date(endDate1.getFullYear(), endDate1.getMonth() + 1, 0).getDate();

    if (endDate1.getDate() === lastDayOfMonth) {
      endDate1.setDate(1);
      endDate1.setMonth(endDate1.getMonth() + 1);
      if (endDate1.getMonth() > 11) {
        endDate1.setFullYear(endDate1.getFullYear() + 1);
        endDate1.setMonth(0);
      }
    } else {
      endDate1.setDate(endDate1.getDate() + 1);
    }
    let active_reservations = db.prepare('SELECT * FROM reservations WHERE parkingName = ? AND startDate >= ? AND endDate < ?')
    .all(parkingName, startDate1.toISOString(), endDate1.toISOString());

    const res_obj = {};
    active_reservations.forEach(row => {
        res_obj[row.id] = row;  
    });
    return res_obj;
  }; */


  
  exports.get_user_reservations = (userID) => {
    let user_res = db.prepare('SELECT reservationId, slotNumber, parkingName, startDate, endDate FROM reservations WHERE userId = ?').all(userID);
    const res_obj = user_res.map(info => {
      return {
        parkingName: info.parkingName,
        slotNumber: info.slotNumber,
        endDate: info.endDate,
        startDate: info.startDate,
        reservationId : info.reservationId
      };
    });
    
    return res_obj;
  };

  exports.get_reservation = (reservationId) => {
    const reservation = db.prepare('SELECT parkingName, startDate, endDate FROM reservations WHERE reservationId = ?').get(reservationId);
  
    if (reservation) {
      const startDateTime = new Date(reservation.startDate);
      const endDateTime = new Date(reservation.endDate);
  
      return {
        parkingName: reservation.parkingName,
        startDate: startDateTime.toISOString().slice(0, 10),
        startTime: startDateTime.toISOString().slice(11, 16),
        endDate: endDateTime.toISOString().slice(0, 10),
        endTime: endDateTime.toISOString().slice(11, 16)
      };
    }

    return -1;
  }
  

  exports.get_next_available_slot = (parkingName, startDateTimeStr, endDateTimeStr) => {
    const parkingCapacity = db.prepare('SELECT capacity FROM parkingLocation WHERE parkingName = ?').get(parkingName).capacity;
  
    let slotNumber = 1;
    const reservations = db.prepare('SELECT slotNumber FROM reservations WHERE parkingName = ? AND (endDate >= ? OR startDate <= ?)').all(parkingName, startDateTimeStr, endDateTimeStr);
  
    while (reservations.some(reservation => reservation.slotNumber === slotNumber)) {
      slotNumber++;
      if (slotNumber > parkingCapacity) {
        return -1;
      }
    }
    
    return slotNumber;
  };
  


  exports.add_reservations = (userID, parkingName, slotNumber, startDate, endDate) => {
    const added_reservation = db.prepare('INSERT INTO reservations (userId, parkingName, slotNumber, startDate, endDate) VALUES (?, ?, ?, ?, ?)').run(userID, parkingName, slotNumber, startDate, endDate);
    if (added_reservation.changes === 0) {
      return -1;
    }
    return added_reservation.lastInsertRowid;
  };
  

  exports.place = () => {
    const parkingLocations = db.prepare('SELECT * FROM parkingLocation').all();
    
    const places = parkingLocations.map(location => {
      return {
        value: location.parkingName,
        label: location.parkingName,
        capacity: location.capacity,
      
      };
    });
    
    return places;
  };


  exports.delete_reservation = (reservationId) =>{
    let valid_reservation =db.prepare('SELECT * FROM reservations WHERE reservationId= ?  ').get(reservationId);
    if (valid_reservation!==undefined){
        db.prepare('DELETE FROM reservations WHERE reservationId = ? ').run(reservationId);
        return true;
    }
    console.log("reservation does not exists");
    return false;
  };


  exports.modifie_reservation = (reservationId,parkingName, slotNumber , startDate , endDate) =>{
    let valid_reservation = db.prepare('SELECT FROM reservations WHERE reservationId = ?)').get(reservationId);
    if (valid_reservation!==undefined){
        db.prepare('UPDATE reservations SET parkingName = ? , slotNumber = ?, startDate = ? , endDate = ? WHERE reservedId = ? ').run(reservationId ,parkingName, slotNumber , startDate , endDate);
        return true;
    }
    console.log("reservation does not exists");
    return false; 
  };

  
  exports.ended_reservations = () => {
    const now = new Date();
    const reservations = db.prepare('SELECT * FROM reservations').all();
    reservations.forEach(reservation => {
      const endDate = new Date(reservation.endDate);
      if (endDate < now) {
        db.prepare('DELETE FROM reservations WHERE reservationId = ?').run(reservation.reservationId);
      }
    });
  };