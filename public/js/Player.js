/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';


class Player extends GameObject {
    constructor(location, texture, playerId) {
		const SIZE = {
			width: 50,
			height: 50
		};
		const SPEED = 5;
		const MAX_HEALTH = 5;
		
		super(texture, location, SIZE, SPEED, Vector.zero(), 0, true);

		this.currentHealth = MAX_HEALTH;
		
		// Per second.
		this.POWER_RECHARGE = 25;
		this.MAX_POWER = 50;
		this.POWER_PER_SHOT = 10;
		
		this.power = this.MAX_POWER;
		this.playerId = playerId;
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

	takeShotDamage(shot) {
		this.currentHealth -= shot.getDamage();

		if (this.currentHealth <= 0) {
			this.destroy = true;
		}
	}
}

if (typeof global !== 'undefined') {
	module.exports = Player;
}