const sqlite = require('sqlite3');
const SKU = require('../SKU');

class SKUDAO{

    constructor(db){
        this.db = db;
    }

    getAllSKUs(){
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU_TABLE";
            this.db.all(sql, [], (err, rows) => {
                if(err){
                    reject(500);
                } else {
                    const skus = rows.map(row => new SKU(row.DESCRIPTION, row.WEIGHT, row.VOLUME, row.PRICE, row.NOTES, row.POSITION, row.ID, row.AVAILABLEQUANTITY));
                    resolve(skus);
                }
            });
        });
    }

    getSKUByID(ID){
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM SKU_TABLE WHERE ID = ?";
            this.db.get(sql, [ID], (err, row) => {
                if(err){
                    reject(err);
                } else {
                    if(row === undefined){
                        resolve(undefined);
                    } else{
                        resolve(new SKU(row.DESCRIPTION, row.WEIGHT, row.VOLUME, row.PRICE, row.NOTES, row.POSITION, row.ID, row.AVAILABLEQUANTITY));
                    }
                }
            });
        });
    }

    insertSKU(sku){
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO SKU_TABLE(DESCRIPTION, WEIGHT, VOLUME, PRICE, NOTES, AVAILABLEQUANTITY) VALUES(?,?,?,?,?,?)";
            this.db.run(sql, [sku.getDescription(), sku.getWeight(), sku.getVolume(), sku.getPrice(), sku.getNotes(), sku.getAvailableQuantity()], err => {
                if(err){
                    reject(err);
                }else{
                    resolve('OK');
                }
            });
        });
    }

    updateSKU(SKUID, newDescription, newWeight, newVolume, newNotes, newPrice, newAvailableQuantity){
        return new Promise((resolve, reject) => {
            const sql = "UPDATE SKU_TABLE SET "
                        +
                        "DESCRIPTION = ?, "
                        +
                        "WEIGHT = ?, "
                        +
                        "VOLUME = ?, "
                        +
                        "PRICE = ?, "
                        +
                        "NOTES = ?, "
                        +
                        "AVAILABLEQUANTITY = ? "
                        +
                        "WHERE ID = ?";
            this.db.run(sql, [newDescription, newWeight, newVolume, newPrice, newNotes, newAvailableQuantity, SKUID], err => {
                if(err){
                    reject(err);
                }else {
                    resolve('ok');
                }
            });
        });
    }

    updateSKUPosition(SKUID, newPositionID){
        return new Promise((resolve, reject) => {
            const sql = "UPDATE SKU_TABLE SET "
                        +
                        "POSITION = ? "
                        +
                        "WHERE ID = ?";
            this.db.run(sql, [newPositionID, SKUID], err => {
                if(err){
                    reject(err);
                } else {
                    resolve('OK');
                }
            });
        });
    }

    deleteSKU(SKUID){
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM SKU_TABLE WHERE ID = ?";
            this.db.run(sql, [SKUID], err => {
                if(err){
                    reject(err);
                }else{
                    resolve(204);
                }
            });
        });
    }
}

module.exports = SKUDAO;