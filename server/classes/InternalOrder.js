class InternalOrder {

    constructor(id, state, issueDate, customerID) {
        this.id = id;
        this.issueDate = issueDate;
        this.state = state;
        this.customerId = customerID;
        this.products = [];
    }

    getID() {
        return this.id;
    }

    getState() {
        return this.state;
    }

    setProductsList(products) {
        products.forEach(product => this.products.push(product));
    }

}

module.exports = InternalOrder;