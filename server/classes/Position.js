class Position {
	constructor(aisleID, row, col, maxWeight, maxVolume, occupiedWeight = 0, occupiedVolume = 0) {
		this.positionID = parseInt(aisleID.toString() + row.toString() + col.toString());
		this.aisleID = aisleID;
		this.row = row;
		this.col = col;
		this.maxWeight = maxWeight;
		this.maxVolume = maxVolume;
		this.occupiedWeight = occupiedWeight;
		this.occupiedVolume = occupiedVolume;
	}

	setPositionID(positionID) {
		//TODO check if the format is correct
		this.positionID = positionID;
		this.aisleID = parseInt(positionID.toString().substring(0, 4));
		this.row = parseInt(positionID.toString().substring(4, 8));
		this.col = parseInt(positionID.toString().substring(8, 12));
		//check duplicates
	}

	getMaxWeight(){
		return this.maxWeight;
	}

	getMaxVolume(){
		return this.maxVolume;
	}

	getPositionID(){
		return this.positionID;
	}

	getAisleID(){
		return this.aisleID;
	}

	getRow(){
		return this.row;
	}

	getCol(){
		return this.col;
	}

	getOccupiedWeight(){
		return this.occupiedWeight;
	}

	getOccupiedVolume(){
		return this.occupiedVolume;
	}

}

module.exports = Position;
