class ReturnOrder{

    constructor(id, r, state, returnDate = null, products = []){
        this.id = id;
        this.restockOrderId = r;
        this.state = state;
        this.returnDate = returnDate;
        this.products = products;
    }

    getID(){
        return this.id;
    }

    addSKUItem(products) {
        products.forEach(product => this.products.push(product));
    }
}

module.exports = ReturnOrder;