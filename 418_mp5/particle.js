/**
 * @fileoverview Particle.js - Class for spherical particles with wall collision.
 * @author Kunle Li 
 */

/** @global mass of the ball */
var m = 2;

/** @global drag coefficient*/
var drag = 0.6;

/** @global gravity */
var gravity = glMatrix.vec3.fromValues(0, -10, 0);

/** @global box size */
var boxsize = 2;

/** @global normals of walls */
var wallNormal = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

class Particle{
    constructor(){
        this.velocity = glMatrix.vec3.create();
        glMatrix.vec3.random(this.velocity, 10); // a random magic number
        this.radius = randRange(0.15, 0.45); // random magic numbers
        this.position = glMatrix.vec3.fromValues(randRange(-1, 1), randRange(-1, 1), randRange(-1, 1));
        this.color = glMatrix.vec3.fromValues(Math.random(), Math.random(), Math.random());
        this.stopMoving = false;
    }

    update(t){
        if (this.stopMoving) {return;}
        let velSquare = glMatrix.vec3.dot(this.velocity, this.velocity);
        let E = m * (-gravity[1]) * (this.position[1] - this.radius + boxsize) + 0.5 * m * velSquare;
        if (E < 0.3){ // 0.3 is based on trial to make the animation physically appealing
            this.stopMoving = true;
            return;
        }

        // update velocity
        glMatrix.vec3.scale(this.velocity, this.velocity, Math.pow(drag, t));
        let del_v_y = glMatrix.vec3.create();
        glMatrix.vec3.scale(del_v_y, gravity, t);
        glMatrix.vec3.add(this.velocity, this.velocity, del_v_y);

        // update position
        let newPos = glMatrix.vec3.create();
        glMatrix.vec3.scale(newPos, this.velocity, t);
        glMatrix.vec3.add(newPos, this.position, newPos);
        
        // collision detection
        let delta_t = Infinity;
        let temp_t;
        let idx = -1;
        for (let i = 0; i < 3; i++) {
            if (this.radius - newPos[i] > boxsize){
                temp_t = ((this.position[i] - this.radius) + boxsize) / Math.abs(this.velocity[i]);
                if (temp_t < delta_t){
                    delta_t = temp_t;
                    idx = i * 2;
                }
            }
            if (this.radius + newPos[i] > boxsize){
                temp_t = (boxsize - (this.position[i] + this.radius)) / Math.abs(this.velocity[i]);
                if (temp_t < delta_t){
                    delta_t = temp_t;
                    idx = i * 2 + 1;
                }
            }
        }
        if (delta_t != Infinity) {
            glMatrix.vec3.scale(newPos, this.velocity, delta_t);
            glMatrix.vec3.add(newPos, this.position, newPos);
            t -= delta_t;
            
            // v2 = v1 - 2 * (v1 · n) * n
            let normals = wallNormal[idx];
            let temp = glMatrix.vec3.dot(this.velocity, normals);
            let b = glMatrix.vec3.fromValues(2 * temp, 2 * temp, 2 * temp);
            glMatrix.vec3.multiply(b, b, normals);
            glMatrix.vec3.subtract(this.velocity, this.velocity, b);
            glMatrix.vec3.scale(this.velocity, this.velocity, 0.9);
        }
        glMatrix.vec3.copy(this.position, newPos);
    }
}


/**
 * Calculate a random starting position for each particle
 * @param {number} min The minimum of the starting position
 * @param {number} max The maximum of the starting position
 */
function randRange(min, max) { 
    return Math.random() * (max - min) + min;
}

