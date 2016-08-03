/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Player extends GameObject {
	
    constructor(location, texture, playerId, input) {
		const SIZE = {
			width: 50,
			height: 50
		};
		const SPEED = 5;
		
        super(texture, location, SIZE, SPEED, Vector.zero(), 0, true);
		
		// Per second.
		this.POWER_RECHARGE = 25;
		this.MAX_POWER = 50;
		this.POWER_PER_SHOT = 10;
		
		this.power = this.MAX_POWER;
		this.playerId = playerId;
		this.input = input;
    }
	
	updateInput(inputChanges) {
		for(var key in inputChanges) {
			if(inputChanges.hasOwnProperty(key)) {
				this.input[key] = inputChanges[key];
			}
		}
	}
	
	update() {
		super.move();
		
		this.power += this.POWER_RECHARGE * (1/60)
		
		if (this.power > this.MAX_POWER) {
			this.power = this.MAX_POWER;
		}
	}
	
	subrtactShotPower() {
		this.power -= this.POWER_PER_SHOT;
	}
	
	getPower() {
		return this.power;
	}
	
	setPower(power) {
		this.power = power;
	}
	
	getPowerPerShot() {
		return this.POWER_PER_SHOT;
	}
}