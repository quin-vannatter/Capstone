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
		const SPEED = 4;
		const MAX_HEALTH = 5;

		super(texture, location, SIZE, SPEED, Vector.zero(), true);

		this.playerId = playerId;
		this.currentHealth = MAX_HEALTH;
		this.MAX_HEALTH = MAX_HEALTH;

		// Per second.
		this.POWER_RECHARGE = 25;
		this.MAX_POWER = 50;
		this.POWER_PER_SHOT = 10;
		this.ALPHA_CHANGE = 0.1;
		this.RESPAWN_TIME = 3 * 60;
		this.TELEPORT_TIME = 3 * 60;

		this.teleportTime = this.TELEPORT_TIME;
		
		this.power = this.MAX_POWER;
		this.respawn = this.RESPAWN_TIME;
		this.teleportLoc = {
			x: 0,
			y: 0
		};
		this.respawnLoc = {
			x: 0,
			y: 0
		}
		this.teleporting = false;
		this.kill = false;
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
		var alpha = this.getAlpha();

		if(this.kill && alpha>0) {
			alpha -= this.ALPHA_CHANGE;
		}

		if(this.teleporting) {
			if(alpha > 0) {
				alpha -= this.ALPHA_CHANGE;
			} else {
				alpha = 0;
				this.loc = {
					x: this.teleportLoc.x,
					y: this.teleportLoc.y
				};
				this.teleporting = false;
			}
		} 
		
		if(this.kill) {
			 this.respawn --;
			 if(this.respawn <= 0) {
				this.kill = false;
				this.loc = {
					x: this.respawnLoc.x,
					y: this.respawnLoc.y
				}
			 }
		}

		if(!this.kill && !this.teleporting) {
			if(alpha < 1) { alpha += this.ALPHA_CHANGE; }
			else { alpha = 1; }
		}

		// Make sure the alpha is within 1 and 0.
		alpha = Math.min(Math.max(0,alpha),1);
		this.setAlpha(alpha);

		if(!this.kill) {
			super.move();
			this.power += this.POWER_RECHARGE * (1/60);
			
			if (this.power > this.MAX_POWER) {
				this.power = this.MAX_POWER;
			}

			this.teleportTime++;
			
			if (this.teleportTime > this.TELEPORT_TIME) {
				this.teleportTime = this.TELEPORT_TIME;
			}
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
		this.teleportTime = 0;
	}

	getHealth() {
		return this.currentHealth;
	}

	getKill() {
		return this.kill;
	}

	canTeleport() {
		return this.teleportTime === this.TELEPORT_TIME;
	}

	takeShotDamage(shot, location) {
		if (!shot.getHitPlayer()) {
			this.currentHealth -= shot.getDamage();
			if (this.currentHealth <= 0) {
				this.kill = true;
				this.respawn = this.RESPAWN_TIME;
				this.setVel(Vector.zero());
				this.currentHealth = this.MAX_HEALTH;
				this.power = this.MAX_POWER;
				this.respawnLoc = {
					x: location.x,
					y: location.y
				};
				return true;
			} else {
				return false;
			}
		}
	}

	getId() {
		return this.playerId;
	}

	setSpawnLoc(location) {
		this.respawnLoc = {
			x: location.x,
			y: location.y
		};
	}
}

if (typeof global !== 'undefined') {
	module.exports = Player;
}