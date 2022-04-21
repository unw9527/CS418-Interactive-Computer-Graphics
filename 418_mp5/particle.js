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

class Particle{
    constructor(){
        this.velocity = glMatrix.vec3.create();
        glMatrix.vec3.random(this.velocity, 10);
        this.radius = Math.random() * (0.4 - 0.1) + 0.1; // random magic numbers
        this.position = glMatrix.vec3.fromValues(randInitPos(-1, 1), randInitPos(-1, 1), randInitPos(-1, 1));
        this.color = glMatrix.vec3.fromValues(Math.random(), Math.random(), Math.random());
        this.stopMoving = false;
    }

    update(t){
        if (this.stopMoving) {return;}
        let E = m * (-gravity[1]) * (this.position[1] - this.radius + boxsize) + 0.5 * m * Math.pow(this.velocity[1], 2);
        if (E < 0.8){ // 0.8 is based on trial
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
        for (let i = 0; i < 3; i++) {
            if (this.radius - newPos[i] > boxsize){
                temp_t = ((this.position[i] - this.radius) + boxsize) / Math.abs(this.velocity[i]);
            }
            if (this.radius + newPos[i] > boxsize){
                temp_t = (boxsize - (this.position[i] + this.radius)) / Math.abs(this.velocity[i]);
            }
            if (temp_t < delta_t){
                delta_t = temp_t;
                this.velocity[i] *= -0.9;
            }
        }
        if (delta_t != Infinity) {
            glMatrix.vec3.scale(newPos, this.velocity, delta_t);
            glMatrix.vec3.add(newPos, this.position, newPos);
            t -= delta_t;
        }
        glMatrix.vec3.copy(this.position, newPos);
    }
}

function randInitPos(min, max) { 
    return Math.random() * (max - min) + min;
}