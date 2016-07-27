'use strict';

class Game {
    constructor() {
        this.numPlayers = 0;
        this.players = {};
    }

    addPlayer(newPlayer) {
        if (this.numPlayers >= this.MAX_PLAYERS) {
            console.error('Game full.');

            return false;
        }

        var playerId = newPlayer.getId();
        
        if (playerId in this.players) {
            console.error('Player already in game.');

            return false;
        }

        this.players[playerId] = newPlayer;
        
        this.numPlayers++;
    }

    getPlayers() {
        return this.players;
    }
}

// Class properties.
Game.prototype.MAX_PLAYERS = 2;

module.exports = Game;