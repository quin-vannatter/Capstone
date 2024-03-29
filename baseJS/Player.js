/* Player.js
 * The class for a player of the game.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.27: Created.
 *
 */

'use strict';

class Player extends GameObject {
    constructor(location, texture, playerId, name) {
		const SIZE = {
			width: 50,
			height: 50
		};
		const SPEED = 3.5;
		const MAX_HEALTH = 100;

		super(texture, location, 50, 50, SPEED, Vector.zero(), true);

		this.playerId = playerId;
		this.currentHealth = MAX_HEALTH;
		this.MAX_HEALTH = MAX_HEALTH;
		this.HEALTH_BAR_SCALE = .15;
		this.HEALTH_BAR_BASE_SIZE = {
			width: 450,
			height: 70
		}

		this.HEALTH_BAR_SIZE = {
			width: this.HEALTH_BAR_BASE_SIZE.width * this.HEALTH_BAR_SCALE,
			height: this.HEALTH_BAR_BASE_SIZE.height * this.HEALTH_BAR_SCALE
		}

		this.HEALTH_OFFSET_IN_BAR = {
			x: 1,
			y: 1,
			width: this.HEALTH_BAR_SIZE.width - 3,
			height: this.HEALTH_BAR_SIZE.height - 2.2
		}

		this.HEALTH_BAR_OFFSET = {
			x: -9,
			y: 1
		};

		this.KD_OFFSET = {
			x: (this.size.width / 2),
			y: 26.5
		}

		this.NAME_OFFSET = {
			x: (this.size.width / 2),
			y: 45
		}

		// Per second.
		this.POWER_RECHARGE = 25;
		this.MAX_POWER = 50;
		this.POWER_PER_SHOT = 10;
		this.ALPHA_CHANGE = 0.1;
		this.RESPAWN_TIME = 3 * 60;
		this.LOC_PROXIMITY = 5;
		this.MOVE_EASE = 4;
		this.HEALTH_RATE = 4 / 60;
		
		if (typeof global === 'undefined') {
			// Client.
			this.TELEPORT_TIME = 3 * 60;
		} else {
			// Server.
			this.TELEPORT_TIME = 3 * 50;
		}

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
		this.updateLoc = {
			x: location.x,
			y: location.y
		};
		this.updatingLocation = false;
		this.teleporting = false;
		this.kill = false;
		this.playerId = playerId;

		this.numKills = 0;
		this.numDeaths = 0;

		// The last player to hit this player with a shot.
		this.lastHitter = null;

		this.playerName = name;
		this.score = 0;
		this.maxTeleport = 1000;
    }

	setName(newName) {
		this.playerName = newName;
	}

	getName() {
		return this.playerName;
	}

	toTransit() {
		return {
			type: 'Player',
			playerId: this.playerId,
			loc: this.loc,
			velocity: this.velocity,
			health: this.currentHealth,
			numKills: this.numKills,
			numDeaths: this.numDeaths,
			playerName: this.playerName
		}
	}
	
	getLeaderString() {
		return this.numKills + '/' + this.numDeaths + ' ' + this.playerName;
	}

	getKDString() {
		return this.numKills + '/' + this.numDeaths;
	}

	isDead() {
		return this.kill;
	}

	setNumKills(newKills) {
		this.numKills = newKills;
		this.updateScore();
	}

	setNumDeaths(newDeaths) {
		this.numDeaths = newDeaths;
		this.updateScore();
	}

	getNumKills() {
		return this.numKills;
	}

	getNumDeaths() {
		return this.numDeaths;
	}

	getTeleporting() {
		return this.teleporting;
	}

	getHealthPercent() {
		if (this.currentHealth <= 0) {
			return 0;
		}

		return this.currentHealth / this.MAX_HEALTH;
	}

	getHealthBarSize() {
		return this.HEALTH_BAR_SIZE;
	}

	getHealthOffsetInBar() {
		return this.HEALTH_OFFSET_IN_BAR;
	}

	getNameOffset(playerHeight) {
		return {
			x: this.NAME_OFFSET.x,
			y: this.NAME_OFFSET.y - playerHeight
		};
	}

	getKDOffset(playerHeight) {
		return {
			x: this.KD_OFFSET.x,
			y: this.KD_OFFSET.y + playerHeight
		};
	}

	getHealthBarOffset(playerHeight) {
		return {
			x: this.HEALTH_BAR_OFFSET.x,
			y: this.HEALTH_BAR_OFFSET.y + playerHeight
		};
	}

	getHealth() {
		return this.currentHealth;
	}

	setHealth(newHealth) {
		this.currentHealth = newHealth;

		if (this.currentHealth < 0) {
			this.currentHealth = 0;
		}
	}
	
	update() {
		var alpha = this.getAlpha();

		if(this.kill && alpha > 0) {
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
			 this.respawn--;
		}

		if(!this.kill && !this.teleporting) {
			if(alpha < 1) { alpha += this.ALPHA_CHANGE; }
			else { alpha = 1; }
		}

		// Make sure the alpha is within 1 and 0.
		alpha = Math.min(Math.max(0,alpha),1);
		this.setAlpha(alpha);

		if(!this.kill) {
			this.addHealth(this.HEALTH_RATE);

			if(this.updatingLocation) {
				this.loc.x += (this.updateLoc.x - this.loc.x) / this.MOVE_EASE;
				this.loc.y += (this.updateLoc.y - this.loc.y) / this.MOVE_EASE;

				var distance = Math.sqrt(Math.pow(this.updateLoc.x - this.loc.x,2) + 
					Math.pow(this.updateLoc.y - this.loc.y,2));

				if(distance <= this.LOC_PROXIMITY) {
					this.updateLoc = {
						x: this.loc.x,
						y: this.loc.y
					};
					this.clipping = true;
					this.updatingLocation = false;
				} else {
					this.clipping = false;
				}
			}
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

	getMaxTeleport() {
		return this.maxTeleport;
	}

	addHealth(healthAmount) {
		this.currentHealth += healthAmount;

		if (this.currentHealth > this.MAX_HEALTH) {
			this.currentHealth = this.MAX_HEALTH;
		}
	}

	getRespawnTime() {
		return this.respawn;
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

	getScore() {
		return this.score;
	}

	updateScore() {
		this.score = this.numKills / Math.max(this.numDeaths, 1);
		this.score += this.numKills * .1;
		this.score -= this.numDeaths * .01;
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

	killPlayer() {
		this.kill = true;
		this.respawn = this.RESPAWN_TIME;
		this.setVel(Vector.zero());
		this.currentHealth = this.MAX_HEALTH;
		this.power = this.MAX_POWER;
		this.numDeaths++;
		this.updateScore();
		this.lastHitter.setNumKills(this.lastHitter.getNumKills() + 1);
	}

	takeShotDamage(shot, shooter) {
		if (!shot.getHitPlayer()) {
			this.lastHitter = shooter;
			this.currentHealth -= shot.getDamage();
		}
	}

	respawnPlayer(location) {
		this.kill = false;
		this.respawn = this.RESPAWN_TIME;
		this.loc = {
			x: location.x,
			y: location.y
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

	setUpdateLoc(location) {

		var distance = Math.sqrt(Math.pow(this.updateLoc.x - this.loc.x,2) + 
			Math.pow(this.updateLoc.y - this.loc.y,2));

		if(distance > this.LOC_PROXIMITY && !this.teleporting) {
			this.updateLoc = {
				x: location.x,
				y: location.y
			};
			this.updatingLocation = true;
		} else {
			this.loc = {
				x: location.x,
				y: location.y
			};
		}
	}
}

if (typeof global !== 'undefined') {
	module.exports = Player;
}