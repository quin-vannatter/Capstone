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
		
		super(texture, location, SIZE, SPEED, Vector.zero(), true);

		this.playerId = playerId;

		this.currentHealth = MAX_HEALTH;
		
		// Per second.
		this.POWER_RECHARGE = 25;
		this.MAX_POWER = 50;
		this.POWER_PER_SHOT = 10;
		this.ALPHA_CHANGE = 0.1;
		
		this.power = this.MAX_POWER;
		this.teleportLoc = {
			x: 0,
			y: 0
		};
		this.teleporting = false;
		this.playerId = playerId;
    }

	toTransit() {
		return {
			type: 'Player',
			playerId: this.playerId,
			loc: this.loc,
			velocity: this.velocity
		}
	}
	
	update() {
		super.move();
		var alpha = this.getAlpha();

		if(this.teleporting) {
			if(alpha > 0) {
				alpha -= this.ALPHA_CHANGE;
			} else {
				alpha = 0;
				this.setLoc({
					x: this.teleportLoc.x,
					y: this.teleportLoc.y
				});
				this.teleporting = false;
			}
		} else {
			if(alpha < 1) { alpha += this.ALPHA_CHANGE; }
			else { alpha = 1; }
		}

		// Make sure the alpha is within 1 and 0.
		alpha = Math.min(Math.max(0,alpha),1);
		this.setAlpha(alpha);

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

	teleport(location) {
		this.teleportLoc = {
			x: location.x,
			y: location.y
		};
		this.teleporting = true;
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