const sqlite = require('sqlite3');
const RestockOrder = require('../RestockOrder');
const SKUItem = require('../SKUItem');
const TransportNote = require('../TransportNote');

class RestockOrderDAO {

    constructor(db) {
        this.db = db;
    }

    getAllRestockOrders() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RESTOCKORDER_TABLE";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const restockOrders = rows.map(row => new RestockOrder(row.ID, row.ISSUEDATE, row.STATE, row.USERID, row.TRANSPORTNOTE));
                    resolve(restockOrders);
                }
            });
        });
    }

    getAllRestockOrdersIssued() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RESTOCKORDER_TABLE WHERE STATE = 'ISSUED'";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const ResOrdersIssued = rows.map(row => new RestockOrder(row.ID, row.ISSUEDATE, row.STATE, row.USERID, row.TRANSPORTNOTE));
                    resolve(ResOrdersIssued);
                }
            });
        });
    }

    getRestockOrderByID(ID) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM RESTOCKORDER_TABLE WHERE ID = ?";
            this.db.get(sql, [ID], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        resolve(undefined);
                    } else {
                        resolve(new RestockOrder(row.ID, row.ISSUEDATE, row.STATE, row.USERID, row.TRANSPORTNOTE));
                    }
                }
            });
        });
    }

    addRestockOrder(issueDate, state, supplierId) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO RESTOCKORDER_TABLE(ISSUEDATE, STATE, USERID) VALUES(?,?,?)";
            this.db.run(sql, [issueDate, state, supplierId], function(err){
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    editRestockOrderState(ResOrderID, newState) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE RESTOCKORDER_TABLE SET STATE = ? WHERE ID = ?";
            this.db.run(sql, [newState, ResOrderID], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    editRestockOrderTransportNote(ResOrderID, transportNoteID) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE RESTOCKORDER_TABLE SET TRANSPORTNOTE = ? WHERE ID = ?";
            this.db.run(sql, [transportNoteID, ResOrderID], err => {
                if (err) {
                    reject(err);
                } else {
                    resolve('OK');
                }
            });
        });
    }

    deleteRestockOrder(ResOrderID) {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM RESTOCKORDER_TABLE WHERE ID = ?";
            this.db.run(sql, [ResOrderID], err => {
                if (err) {
                    reject(err);
                } else {
                    resolve('OK');
                }
            });
        });
    }

    getTransportNoteByID(ID){
        return new Promise((resolve, reject) => {
            const sql = "SELECT SHIPMENTDATE FROM TRANSPORTNOTE_TABLE WHERE ID = ?";
            this.db.get(sql, [ID], (err, row) => {
                if(err){
                    reject(err);
                } else {
                    if(row === undefined){
                        resolve(undefined);
                    } else {
                        resolve(new TransportNote(row.SHIPMENTDATE));
                    }
                }
            });
        });
    }

    getRestockOrderProducts(ID){
        return new Promise((resolve, reject) => {
            const sql = "SELECT IT.SKUID, IT.DESCRIPTION, IT.PRICE, ROIT.QUANTITY " +
                        "FROM RESTOCKORDERITEM_TABLE AS ROIT, RESTOCKORDERITEMSRESTOCKORDER_LIST AS ROIROL, ITEM_TABLE AS IT " +
                        "WHERE IT.ID = ROIT.ID_ITEM AND ROIROL.ID_RESTOCKORDERITEM = ROIT.ID AND ROIROL.ID_RESTOCKORDER = ?";
            this.db.all(sql, [ID], (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    if(rows === undefined){
                        resolve(undefined);
                    } else {
                        const productsList = rows.map(row => {
                            return { SKUId : row.SKUID, description : row.DESCRIPTION, price : row.PRICE, qty : row.QUANTITY };
                        });
                        resolve(productsList);
                    }
                }
            });
        });
    }

    addRestockOrderItem(itemID, quantity){
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO RESTOCKORDERITEM_TABLE(ID_ITEM, QUANTITY) VALUES(?,?)";
            this.db.run(sql, [itemID, quantity], function(err){
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    addRestockOrderItemToList(restockOrderID, restockOrderItemID){
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO RESTOCKORDERITEMSRESTOCKORDER_LIST(ID_RESTOCKORDER, ID_RESTOCKORDERITEM) VALUES(?,?)";
            this.db.run(sql, [restockOrderID, restockOrderItemID], function(err){
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    addTransportNote(deliveryDate){
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO TRANSPORTNOTE_TABLE(SHIPMENTDATE) VALUES(?)";
            this.db.run(sql, [deliveryDate], function(err){
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    editRestockOrderSkuItems(restockOrderID, RFID){
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO SKUITEMSRESTOCKORDER_LIST(ID_SKUITEM, ID_RESTOCKORDER) VALUES(?,?)";
            this.db.run(sql, [RFID, restockOrderID], function(err){
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }
}

module.exports = RestockOrderDAO;