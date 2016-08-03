(function(exports) {
    /**
     * Mouse and keyboard input handler.
     */
    function Input(canvas, camera) {
		
		// Make sure the game is accessible.
		this.canvas = canvas;
		this.camera = camera;
		
		// The input mapping.
		this.inputMapping = {
			up: 'KeyW',
			down: 'KeyS',
			left: 'KeyA',
			right: 'KeyD',
			shoot: 1,
			teleport: 2,
			focus: 3
		}
		
		// Make the mapping for the input state.
		this.input = {};
		this.oldInput = {};
		
		// Where the cursor is located.
		this.cursor = {
			x: 0,
			y: 0
		};
		
		// Add the states to the input states.
		for(var key in this.inputMapping){
			if(this.inputMapping.hasOwnProperty(key)) {
				this.input[key] = false;
				this.oldInput[key] = false;
			}
		}
		
		var my = this;
		
		// Add events for inputs.
		document.addEventListener('mousedown',function(e) {
			my.handleInput.call(my,e);
		});
		document.addEventListener('mouseup',function(e) {
			my.handleInput.call(my,e);
		});
		document.addEventListener('keydown',function(e) {
			my.handleInput.call(my,e);
		});
		document.addEventListener('keyup',function(e) {
			my.handleInput.call(my,e);
		});
	}
	
	/**
	 * Handles the input of the keyboard and mouse.
	 */
	Input.prototype.handleInput = function(e) {
		for(var key in this.inputMapping) {
			if(this.inputMapping.hasOwnProperty(key)) { 
				switch(e.type) {
					case 'keydown':
					case 'keyup':
						if(e.code === this.inputMapping[key]) {
							this.input[key] = e.type === 'keydown';
						}
						break;
					case 'mousedown':
					case 'mouseup':
						if(e.which === this.inputMapping[key]) {
							this.input[key] = e.type === 'mousedown';
						}
						var r = this.canvas.getBoundingClientRect();
						var c = this.camera.getLoc();
						this.cursor = {
							x: e.clientX - r.left + c.x,
							y: e.clientY - r.top + c.y
						};
						break;
				}
			}
		}
	}
	
	/**
	 * Gets the state of a key.
	 */
	Input.prototype.getInput = function() {
		var input = {};
		for(var key in this.input) {
			if(this.input.hasOwnProperty(key)) {
				input[key] = this.input[key];
			}
		}
		return input;
	}
	
	/**
	 * Gets the state of a key.
	 */
	Input.prototype.getChanges = function() {
		var mapping = {};
		var changed = false;
		for(var key in this.inputMapping) {
			if(this.inputMapping.hasOwnProperty(key)) { 
				if(this.oldInput[key] != this.input[key]) {
					mapping[key] = this.input[key];
					changed = true;
				}
				this.oldInput[key] = this.input[key];
			}
		}
		return {
			mapping: mapping,
			changed: changed
		};
	}
	
	Input.getEmptyInput = function() {
		var input = {};
		for(var key in this.inputMapping) {
			if(this.inputMapping.hasOwnProperty(key)) {
				input[key] = false;
			}
		}
		return input;
	}
	
	/**
	 * Gets the state of the cursor.
	 */
	Input.prototype.getCursor = function() {
		return this.cursor;
	}
	
    exports.Input = Input;
})(window);