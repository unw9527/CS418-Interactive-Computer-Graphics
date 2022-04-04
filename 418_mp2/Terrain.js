/**
 * @file Terrain.js - A simple 3D terrain model for WebGL
 * @author Ian Rudnick <itr2@illinois.edu>
 * @brief Starter code for CS 418 MP2 at the University of Illinois at
 * Urbana-Champaign.
 * 
 * Updated Spring 2021 for WebGL 2.0/GLSL 3.00 ES.
 * 
 * You'll need to implement the following functions:
 * setVertex(v, i) - convenient vertex access for 1-D array
 * getVertex(v, i) - convenient vertex access for 1-D array
 * generateTriangles() - generate a flat grid of triangles
 * shapeTerrain() - shape the grid into more interesting terrain
 * calculateNormals() - calculate normals after warping terrain
 * 
 * Good luck! Come to office hours if you get stuck!
 */

class Terrain {   
    /**
     * Initializes the members of the Terrain object.
     * @param {number} div Number of triangles along the x-axis and y-axis.
     * @param {number} minX Minimum X coordinate value.
     * @param {number} maxX Maximum X coordinate value.
     * @param {number} minY Minimum Y coordinate value.
     * @param {number} maxY Maximum Y coordinate value.
     */
    constructor(div, minX, maxX, minY, maxY) {
        this.div = div;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
        
        // Allocate the vertex array
        this.positionData = [];
        // Allocate the normal array.
        this.normalData = [];
        // Allocate the triangle array.
        this.faceData = [];
        // Allocate an array for edges so we can draw a wireframe.
        this.edgeData = [];
        console.log("Terrain: Allocated buffers");
        
        this.generateTriangles();
        console.log("Terrain: Generated triangles");
        
        this.generateLines();
        console.log("Terrain: Generated lines");

        this.shapeTerrain();
        console.log("Terrain: Sculpted terrain");

        this.calculateNormals();
        console.log("Terrain: Generated normals");

        // You can use this function for debugging your buffers:
        // this.printBuffers();
    }
    

    //-------------------------------------------------------------------------
    // Vertex access and triangle generation - your code goes here!
    /**
     * Set the x,y,z coords of the ith vertex
     * @param {Object} v An array of length 3 holding the x,y,z coordinates.
     * @param {number} i The index of the vertex to set.
     */
    setVertex(v, i) {
        // MP2: Implement this function!
        this.positionData[i*3] = v[0];
        this.positionData[i*3+1] = v[1];
        this.positionData[i*3+2] = v[2];
    }
    

    /**
     * Returns the x,y,z coords of the ith vertex.
     * @param {Object} v An array of length 3 to hold the x,y,z coordinates.
     * @param {number} i The index of the vertex to get.
     */
    getVertex(v, i) {
        // MP2: Implement this function!
        v[0] = this.positionData[i*3];
        v[1] = this.positionData[i*3+1];
        v[2] = this.positionData[i*3+2];
    }


    /**
     * Push data to positionData and faceData
     */  
    generateTriangles() {
        // MP2: Implement the rest of this function!

        // set up vertex buffer
        var deltaX=(this.maxX-this.minX)/this.div;
        var deltaY=(this.maxY-this.minY)/this.div;
        
        for(var i = 0; i <= this.div; i++)
            for(var j = 0; j <= this.div; j++)
            { 
                this.positionData.push(this.minX+deltaX*j);
                this.positionData.push(this.minY+deltaY*i);
                this.positionData.push(0);
            }
        this.numVertices = this.positionData.length/3;
        // this.printBuffers();
        
        // set up face buffer
        for (var i = 0; i < this.div; i++) {
            for (var j = 0; j < this.div; j++) {
                let idx = (this.div + 1) * i + j;
                // first triangle
                this.faceData.push(idx);
                this.faceData.push(idx+1);
                this.faceData.push(idx+this.div+1);

                // second triangle
                this.faceData.push(idx+1);
                this.faceData.push(idx+1+this.div+1);
                this.faceData.push(idx+this.div+1);
            }
        }
        // We'll need these to set up the WebGL buffers.
        
        this.numFaces = this.faceData.length/3;
    }


    /**
     * Implement faulting plane method
     */
    shapeTerrain() {
        // MP2: Implement this function!
        let iters = 100;
        let deltaH = 0.01;
        let H = 0.01;
        // force R > r
        var R = Math.sqrt(Math.pow((this.maxX-this.minX), 2) + Math.pow((this.maxY-this.minY), 2));

        for (let i = 0; i < iters; i++){
            // construct a random fault plane
            // create a random point
            let px = this.minX + (this.maxX - this.minX) * Math.random();
            let py = this.minY + (this.maxY - this.minY) * Math.random();
            let p = glMatrix.vec3.fromValues(px, py, 0);
            // create a random normal
            let n = glMatrix.vec3.create();
            glMatrix.vec3.random(n);
            n[2] = 0;

            // raise and lower vertices
            for (let j = 0; j < this.numVertices; j++){
                var b = glMatrix.vec3.create();
                // console.log(b[2]);
                this.getVertex(b, j);
                // console.log(b);
                let diff = glMatrix.vec3.create();
                glMatrix.vec3.subtract(diff, b, p); // b-p
                let dist = glMatrix.vec3.distance(b, p);
                let gr = Math.pow(1 - Math.pow(dist/R, 2), 2);
                glMatrix.vec3.dot(diff, n) > 0 ? b[2] += deltaH * gr : b[2] -= deltaH * gr;
                this.setVertex(b, j);
            }
            // reduce deltaH
            deltaH /= Math.pow(2, H); 
        }
    }


    /**
     * Calculate the average normal for each vertex using triangle area weighting 
     */
    calculateNormals() {
        // MP2: Implement this function!
        // constant normal, for debugging
        // for (let j = 0; j < this.numVertices; j++){
        //     this.normalData[j*3] = 0;
        //     this.normalData[j*3+1] = 0;
        //     this.normalData[j*3+2] = 1;
        // }
        var normals = [];
        // initialize normals as all zeros
        for (let i = 0; i < this.numVertices; i++){
            normals.push([0, 0, 0]);
        }
        for (let i = 0; i < this.numFaces; i++){
            // the data in faceData is the index of element in PositionData
            let v1 = glMatrix.vec3.create();
            let v2 = glMatrix.vec3.create();
            let v3 = glMatrix.vec3.create();
            let n = glMatrix.vec3.create();
            this.getVertex(v1, this.faceData[3*i]);
            this.getVertex(v2, this.faceData[3*i+1]);
            this.getVertex(v3, this.faceData[3*i+2]);
            // glMatrix.vec3.sub(v1, v1, v2);
            // glMatrix.vec3.sub(v3, v3, v2);
            // glMatrix.vec3.cross(n, v1, v3);
            // ????? somehow the calculate above will produce normals with opposite signs 
            glMatrix.vec3.sub(v2, v2, v1);
            glMatrix.vec3.sub(v3, v3, v1);
            glMatrix.vec3.cross(n, v2, v3);

            // since we are required to use triangle area weighting, we need to scale each normal by 1/2
            glMatrix.vec3.scale(n, n, 0.5);
            // add the normal of each face to its three vertices
            for (let j = 0; j < 3; j++){
                for (let k = 0; k < 3; k++){
                    normals[this.faceData[3*i+j]][k] += n[k];
                }
            }
        }
        // normalize the normal at each vertex
        for (let i = 0; i < this.numVertices; i++){
            let normalized_n = glMatrix.vec3.fromValues(normals[i][0], normals[i][1], normals[i][2]);
            glMatrix.vec3.normalize(normalized_n, normalized_n);
            this.normalData.push(...normalized_n);
        }
    }
    /* Get the min and max Z value among all vertices */
    getminmaxZ(){
        let minZ = 0;
        let maxZ = 0;
        for (let i = 0; i < this.numVertices; i++){
            let temp = [0, 0, 0]; // !!!!!!!!!!!!!! must initialize to a vector. Cannot assign nothing !!!!!!!!!!!!!!
            this.getVertex(temp, i);
            minZ = Math.min(minZ, temp[2]);
            maxZ = Math.max(maxZ, temp[2]);
        }
        let res = glMatrix.vec2.fromValues(minZ, maxZ);
        return res;
    }

    //-------------------------------------------------------------------------
    // Setup code (run once)
    /**
     * Generates line data from the faces in faceData for wireframe rendering.
     */
    generateLines() {
        for (var f = 0; f < this.faceData.length/3; f++) {
            // Calculate index of the face
            var fid = f*3;
            this.edgeData.push(this.faceData[fid]);
            this.edgeData.push(this.faceData[fid+1]);
            
            this.edgeData.push(this.faceData[fid+1]);
            this.edgeData.push(this.faceData[fid+2]);
            
            this.edgeData.push(this.faceData[fid+2]);
            this.edgeData.push(this.faceData[fid]);
        }
    }


    /**
     * Sets up the WebGL buffers and vertex array object.
     * @param {object} shaderProgram The shader program to link the buffers to.
     */
    setupBuffers(shaderProgram) {
        // Create and bind the vertex array object.
        this.vertexArrayObject = gl.createVertexArray();
        gl.bindVertexArray(this.vertexArrayObject);

        // Create the position buffer and load it with the position data.
        this.vertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);      
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.positionData),
                      gl.STATIC_DRAW);
        this.vertexPositionBuffer.itemSize = 3;
        this.vertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexPositionBuffer.numItems, " vertices.");

        // Link the position buffer to the attribute in the shader program.
        // console.log(shaderProgram.locations.vertexPosition);
        gl.vertexAttribPointer(shaderProgram.locations.vertexPosition,
                               this.vertexPositionBuffer.itemSize, gl.FLOAT, 
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexPosition);
    
        // Specify normals to be able to do lighting calculations
        this.vertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normalData),
                      gl.STATIC_DRAW);
        this.vertexNormalBuffer.itemSize = 3;
        this.vertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.vertexNormalBuffer.numItems, " normals.");

        // Link the normal buffer to the attribute in the shader program.
        gl.vertexAttribPointer(shaderProgram.locations.vertexNormal,
                               this.vertexNormalBuffer.itemSize, gl.FLOAT, 
                               false, 0, 0);
        gl.enableVertexAttribArray(shaderProgram.locations.vertexNormal);
    
        // Set up the buffer of indices that tells WebGL which vertices are
        // part of which triangles.
        this.triangleIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.faceData),
                      gl.STATIC_DRAW);
        this.triangleIndexBuffer.itemSize = 1;
        this.triangleIndexBuffer.numItems = this.faceData.length;
        console.log("Loaded ", this.triangleIndexBuffer.numItems, " triangles.");
    
        // Set up the index buffer for drawing edges.
        this.edgeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.edgeData),
                      gl.STATIC_DRAW);
        this.edgeIndexBuffer.itemSize = 1;
        this.edgeIndexBuffer.numItems = this.edgeData.length;
        
        // Unbind everything; we want to bind the correct element buffer and
        // VAO when we want to draw stuff
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }
    

    //-------------------------------------------------------------------------
    // Rendering functions (run every frame in draw())
    /**
     * Renders the terrain to the screen as triangles.
     */
    drawTriangles() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.triangleIndexBuffer);
        gl.drawElements(gl.TRIANGLES, this.triangleIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);
    }
    

    /**
     * Renders the terrain to the screen as edges, wireframe style.
     */
    drawEdges() {
        gl.bindVertexArray(this.vertexArrayObject);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.edgeIndexBuffer);
        gl.drawElements(gl.LINES, this.edgeIndexBuffer.numItems,
                        gl.UNSIGNED_INT,0);   
    }


    //-------------------------------------------------------------------------
    // Debugging
    /**
     * Prints the contents of the buffers to the console for debugging.
     */
    printBuffers() {
        for (var i = 0; i < this.numVertices; i++) {
            console.log("v ", this.positionData[i*3], " ", 
                              this.positionData[i*3 + 1], " ",
                              this.positionData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numVertices; i++) {
            console.log("n ", this.normalData[i*3], " ", 
                              this.normalData[i*3 + 1], " ",
                              this.normalData[i*3 + 2], " ");
        }
        for (var i = 0; i < this.numFaces; i++) {
            console.log("f ", this.faceData[i*3], " ", 
                              this.faceData[i*3 + 1], " ",
                              this.faceData[i*3 + 2], " ");
        }  
    }

} // class Terrain
