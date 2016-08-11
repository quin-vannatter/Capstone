/* Vector.js
 * Has methods for normalizing vectors.
 * 
 * Revision History
 *		Quinlan Vannatter & Jermey Buick, 2016.07.28: Created.
 *
 */

'use strict';

class Vector {
	static normalize(vector) {
		if(!Vector.equals(Vector.zero(),vector)) {
			var magnitude = Math.sqrt(Math.pow(vector.x,2) + Math.pow(vector.y,2));
			vector = Vector.divide(vector, magnitude);
		}
		return vector;
	}
	
	static zero() {
		return {
			x: 0,
			y: 0
		}
	}
	
	static equals(vectorA, vectorB) {
		return vectorA.x === vectorB.x && vectorA.y === vectorB.y;
	}
	
	static multiply(vector, value) {
		var newVector = {
			x: vector.x *= value,
			y: vector.y *= value
		};
		
		return vector;
	}
	
	static divide(vector, value) {
		if(value === 0) {
			throw "Can't divide by 0";
		}
		
		var newVector = {
			x: vector.x /= value,
			y: vector.y /= value
		};
		
		return newVector;
	}
	
	static add(vectorA, vectorB) {
		var vector = {
			x: vectorA.x + vectorB.x,
			y: vectorA.y + vectorB.y
		};
		
		return vector;
	}
	
	static delta(vectorA, vectorB) {
		return {
			x: vectorA.x - vectorB.x,
			y: vectorA.y - vectorB.y
		};
	}
}

if (typeof global !== 'undefined') {
	module.exports = Vector;
}