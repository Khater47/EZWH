const InternalOrder = require('../InternalOrder');

class InternalOrderDAO {

    constructor(db) {
        this.db = db;
    }

    getInternalOrdersList() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNALORDER_TABLE";
            this.db.all(sql, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const internalOrders = rows.map(row => {
                        return new InternalOrder(row.ID, row.STATE, row.ISSUEDATE, row.CUSTOMER);
                    });
                    resolve(internalOrders);
                }
            });
        });
    }

    getInternalOrdersIssuedList() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNALORDER_TABLE WHERE STATE = ?";
            this.db.all(sql, ['ISSUED'], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const internalOrdersIssued = rows.map(row => {
                        return new InternalOrder(row.ID, row.STATE, row.ISSUEDATE, row.CUSTOMER);
                    });
                    resolve(internalOrdersIssued);
                }
            });
        });
    }

    getInternalOrdersAcceptedList() {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNALORDER_TABLE WHERE STATE = ?";
            this.db.all(sql, ['ACCEPTED'], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    const internalOrdersIssued = rows.map(row => {
                        return new InternalOrder(row.ID, row.STATE, row.ISSUEDATE, row.CUSTOMER);
                    });
                    resolve(internalOrdersIssued);
                }
            });
        });
    }

    getInternalOrder(internalOrderID) {
        return new Promise((resolve, reject) => {
            const sql = "SELECT * FROM INTERNALORDER_TABLE WHERE ID = ?";
            this.db.get(sql, [internalOrderID], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    if (row === undefined) {
                        resolve(undefined);
                    } else {
                        resolve(new InternalOrder(row.ID, row.STATE, row.ISSUEDATE, row.CUSTOMER));
                    }
                }
            });
        });
    }

    getInternalOrderItems(internalOrderID){
        return new Promise((resolve, reject) => {
            const sql = "SELECT SKU_TABLE.ID, INTERNALORDERITEM_TABLE.DESCRIPTION, SKU_TABLE.PRICE, INTERNALORDERITEM_TABLE.QUANTITY "
                        +
                        "FROM INTERNALORDERITEMS_LIST, INTERNALORDERITEM_TABLE, SKU_TABLE "
                        +
                        "WHERE INTERNALORDERITEMS_LIST.ID_INTERNALORDERITEM = INTERNALORDERITEM_TABLE.ID "
                        +
                        "AND INTERNALORDERITEM_TABLE.SKUID = SKU_TABLE.ID "
                        +
                        "AND INTERNALORDERITEMS_LIST.ID_INTERNALORDER = ?";
            this.db.all(sql, [internalOrderID], (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    const items = rows.map(row => {
                        return {SKUId : row.ID, description : row.DESCRIPTION, price : row.PRICE, qty : row.QUANTITY};
                    });
                    resolve(items);
                }
            });
        });
    }

    addInternalOrder(issueDate, customerId) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO INTERNALORDER_TABLE(ISSUEDATE, STATE, CUSTOMER) VALUES(?,?,?)";
            this.db.run(sql, [issueDate, 'ISSUED', customerId], function(err) {
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    addInternalOrderItem(internalOrderItem) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO INTERNALORDERITEM_TABLE(SKUID, QUANTITY, DESCRIPTION) VALUES (?,?,?)";
            this.db.run(sql, [internalOrderItem.SKUId, internalOrderItem.qty, internalOrderItem.description], function(err) {
                if(err){
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    addInternalOrderItemxInternalOrder(itemID, OrderID) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO INTERNALORDERITEMS_LIST(ID_INTERNALORDER, ID_INTERNALORDERITEM) VALUES (?,?)";
            this.db.run(sql, [OrderID, itemID], function(err) {
                if(err){
                    reject(err);
                } else {
                    resolve('OK');
                }
            });
        });
    }

    editInternalOrder(internalOrderID, newState) {
        return new Promise((resolve, reject) => {
            const sql = "UPDATE INTERNALORDER_TABLE SET STATE = ? WHERE ID = ?";
            this.db.run(sql, [newState, internalOrderID], err => {
                if(err){
                    reject(err);
                } else{
                    resolve(this.changes);
                }
            });
        });
    }

    addRFIDToInternalOrderItems(internalOrderID, SKUID, RFID) {
        return new Promise((resolve, reject) => {
            const sql = "INSERT INTO COMPLETEDINTERNALORDERITEMS_LIST(ID_INTERNALORDER, SKUID, RFID) VALUES (?,?,?)";
            this.db.run(sql, [internalOrderID, SKUID, RFID], err => {
                if(err){
                    reject(err);
                } else{
                    resolve(this.lastID);
                }
            });
        });
    }

    getCompletedProducts(internalOrderID){
        return new Promise((resolve, reject) => {
            const sql = "SELECT SKUID, RFID FROM COMPLETEDINTERNALORDERITEMS_LIST WHERE ID_INTERNALORDER = ?";
            this.db.all(sql, [internalOrderID], (err, rows) => {
                if(err){
                    reject(err);
                } else {
                    if(rows === undefined){
                        resolve(undefined);
                    }else{
                        const products = rows.map(row => {
                            row['SkuID'] = row['SKUID'];
                            delete row['SKUID'];
                            return row;
                        });
                        resolve(products);
                    }
                }
            });
        });
    }

    deleteInternalOrder(internalOrderID) {
        return new Promise((resolve, reject) => {
            const sql = "DELETE FROM INTERNALORDER_TABLE WHERE ID = ?";
            this.db.run(sql,[internalOrderID], err => {
                if(err){
                    reject(err);
                } else{
                    resolve('OK');
                }
            });
        });
    }

}

module.exports = InternalOrderDAO;