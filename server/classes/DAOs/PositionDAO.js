const sqlite = require('sqlite3');
const Position = require('../Position');

class PositionDAO{

    constructor(db){
        this.db = db;
    }

    getAllPositions(){
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM POSITION_TABLE";
            this.db.all(sql, [], (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    const positions = rows.map(row => {
                        return new Position(row.AISLE, row.ROW, row.COL, row.MAX_WEIGHT, row.MAX_VOLUME, row.OCCUPIED_WEIGHT, row.OCCUPIED_VOLUME);
                    });
                    resolve(positions);
                }
            });
        });
    }
    
    getPosition(positionID){
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM POSITION_TABLE WHERE ID = ?";
            this.db.get(sql, [positionID], (err, row) => {
                if(err){
                    reject(err);
                } else {
                    if(row === undefined){
                        resolve(undefined);
                    } else {
                        resolve(new Position(row.AISLE, row.ROW, row.COL, row.MAX_WEIGHT, row.MAX_VOLUME, row.OCCUPIED_WEIGHT, row.OCCUPIED_VOLUME));
                    }
                }
            });
        });
    }

    updatePosition(positionID, newOccupiedVolume, newOccupiedWeight){
        return new Promise((resolve, reject) => {
            const sql = "UPDATE POSITION_TABLE SET OCCUPIED_WEIGHT = ?, OCCUPIED_VOLUME = ? WHERE ID = ?";
            this.db.run(sql, [newOccupiedWeight, newOccupiedVolume, positionID], err => {
                if(err){
                    reject(err);
                }else{
                    resolve('OK');
                }
            });
        });
    }

    addPosition(positionID, aisleID, row, col, weight, volume){
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO POSITION_TABLE(ID, AISLE, ROW, COL, MAX_WEIGHT, MAX_VOLUME, OCCUPIED_WEIGHT, OCCUPIED_VOLUME) " +
                        "VALUES(?,?,?,?,?,?,?,?)";
            this.db.run(sql, [positionID, aisleID, row, col, weight, volume, 0, 0], function(err){
                if(err){
                    reject(err);
                } else{
                    resolve(this.changes);
                }
            });
        });
    }

    editPositionID(oldPositionID, position){
        return new Promise((resolve, reject) => {
            const sql = "UPDATE POSITION_TABLE SET ID = ?, AISLE = ?, ROW = ?, COL = ?, MAX_WEIGHT = ?, MAX_VOLUME = ?, OCCUPIED_WEIGHT = ?, OCCUPIED_VOLUME = ? " +
                        "WHERE ID = ?";
            const params = [position.getPositionID(), position.getAisleID(), position.getRow(), position.getCol(), position.getMaxWeight(), position.getMaxVolume(), position.getOccupiedWeight(), position.getOccupiedVolume(), oldPositionID];
            this.db.run(sql, params, function(err){
                if(err){
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    deletePosition(positionID){
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM POSITION_TABLE WHERE ID = ?";
            this.db.run(sql, [positionID], function(err){
                if(err){
                    reject(err);
                } else{
                    resolve(this.changes);
                }
            });
        });
    }
}

module.exports = PositionDAO;