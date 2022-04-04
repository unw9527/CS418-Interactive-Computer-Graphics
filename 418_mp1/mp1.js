/**
 * @file mp1: dancing logo
 * @author Kunle Li 
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The vertex array object for the triangle */
var vertexArrayObject;

/** @global The rotation angle of our triangle */
var coefRadius = 0;

/** @global The ModelView matrix contains any modeling and viewing transformations */
var modelViewMatrix = glMatrix.mat4.create();

/** @global Records time last frame was rendered */
var previousTime = 0;

/** @global Scale Vector */
var scaleVec = glMatrix.vec3.create();

/** @global Translate Vector */
var translateVec = glMatrix.vec3.create();

/** @global angle for flipping logo */
var flip = 0;

/** @global vertices for myillini logo */
var vertices;

/** @global Rotation coefficient */
var theta = 0;

/** @global The last time when computing elapsed time */
var lastTime = 0;

/** @global The radius coefficient of the triangle */
var coefRadius = 0;


/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
    var context = null;
    context = canvas.getContext("webgl2");
    if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
    } else {
    alert("Failed to create WebGL context!");
    }
    return context;
}


/**
 * Loads a shader.
 * Retrieves the source code from the HTML document and compiles it.
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
    var shaderScript = document.getElementById(id);

    // If we don't find an element with the specified id
    // we do an early exit
    if (!shaderScript) {
    return null;
    }

    var shaderSource = shaderScript.text;

    var shader;
    if (shaderScript.type === "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type === "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
    return null;
    }

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
    }
    return shader;
}


/**
 * Set up the fragment and vertex shaders.
 */
function setupShaders() {
    // Compile the shaders' source code.
    vertexShader = loadShaderFromDOM("shader-vs");
    fragmentShader = loadShaderFromDOM("shader-fs");

    // Link the shaders together into a program.
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
    }

    // We only use one shader program for this example, so we can just bind
    // it as the current program here.
    gl.useProgram(shaderProgram);

    // Query the index of each attribute in the list of attributes maintained
    // by the GPU.
    shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexPosition");
    shaderProgram.vertexColorAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexColor");

    //Get the index of the Uniform variable as well
    shaderProgram.modelViewMatrixUniform =
    gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
}


/**
 * Set up the buffers to hold the triangle's vertex positions and colors.
 */
function setupBuffers() {

    // Create the vertex array object, which holds the list of attributes for
    // the triangle.
    vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);

    // Create a buffer for positions, and bind it to the vertex array object.
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

    // Define a triangle in clip coordinates.
    var orangeVertices = [
        // Orange
        // Top
        -0.5, 0.5, 0.0,
        -0.5, 0.8, 0.0,
        -0.3, 0.5, 0.0,
        -0.3, 0.5, 0.0,
        0, 0.8, 0.0,
        0.3, 0.5, 0.0,
        0, 0.8, 0.0,
        -0.5, 0.8, 0.0,
        -0.3, 0.5, 0.0,
        0, 0.8, 0.0,
        0.3, 0.5, 0.0,
        0.5, 0.8, 0.0,
        0.3, 0.5, 0.0,
        0.5, 0.8, 0.0,
        0.5, 0.5, 0.0,
        // Middle
        -0.3, 0.5, 0.0,
        0.3, 0.5, 0.0,
        -0.3, 0.0, 0.0,
        -0.3, 0.0, 0.0,
        0.3, -0.5, 0.0,
        -0.3, -0.5, 0.0,
        0.3, 0.5, 0.0,
        -0.3, 0.0, 0.0,
        0.3, -0.5, 0.0,
        // Bottom
        -0.3, -0.5, 0.0,
        -0.5, -0.8, 0.0,
        0, -0.8, 0.0,
        -0.5, -0.5, 0.0,
        -0.5, -0.8, 0.0,
        -0.3, -0.5, 0.0,
        -0.3, -0.5, 0.0,
        0, -0.8, 0.0,
        0.3, -0.5, 0.0,
        0.3, -0.5, 0.0,
        0.5, -0.8, 0.0,
        0.5, -0.5, 0.0,
        0, -0.8, 0.0,
        0.3, -0.5, 0.0,
        0.5, -0.8, 0.0,
    ];

    var blueVertices = [
        // Blue
        // Top
        -0.35, 0.45, 0.0,
        -0.55, 0.45, 0.0,
        -0.55, 0.85, 0.0,
        -0.35, 0.45, 0.0,
        -0.55, 0.85, 0.0,
        0, 0.85, 0.0,
        0.35, 0.45, 0.0,
        0.55, 0.85, 0.0,
        0.55, 0.45, 0.0,
        0, 0.85, 0.0,
        0.35, 0.45, 0.0,
        0.55, 0.85, 0.0,
        -0.35, 0.45, 0.0,
        0, 0.85, 0.0,
        0.35, 0.45, 0.0,
        // Body
        0.35, 0.45, 0.0,
        -0.35, 0.0, 0.0,
        0.35, -0.45, 0.0,
        -0.35, 0.45, 0.0,
        0.35, 0.45, 0.0,
        -0.35, 0.0, 0.0,
        -0.35, 0.0, 0.0,
        0.35, -0.45, 0.0,
        -0.35, -0.45, 0.0,
        // Bottom
        -0.35, -0.45, 0.0,
        -0.55, -0.45, 0.0,
        -0.55, -0.85, 0.0,
        -0.55, -0.85, 0.0,
        -0.35, -0.45, 0.0,
        0, -0.85, 0.0,
        -0.35, -0.45, 0.0,
        0, -0.85, 0.0,
        0.35, -0.45, 0.0,
        0.35, -0.45, 0.0,
        0.55, -0.85, 0.0,
        0.55, -0.45, 0.0,
        0, -0.85, 0.0,
        0.35, -0.45, 0.0,
        0.55, -0.85, 0.0,
    ];

    vertices = orangeVertices.concat(blueVertices);

    // Populate the buffer with the position data.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = vertices.length/vertexPositionBuffer.itemSize;

    // Binds the buffer that we just made to the vertex position attribute.
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Do the same steps for the color buffer.
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    const blue = [24/255, 58/255, 93/255, 1];
    const orange = [232/255, 74/255, 39/255, 1];
    var colors = [];
    for(let i = 0; i < orangeVertices.length/vertexPositionBuffer.itemSize; i++) {
        colors.push(...orange);
    }
    for(let i = 0; i < blueVertices.length/vertexPositionBuffer.itemSize; i++) {
        colors.push(...blue);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = vertexPositionBuffer.numberOfItems;
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //Enable each attribute we are using in the VAO.
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // Unbind the vertex array object to be safe.
    gl.bindVertexArray(null);
}


/**
 * Draws a frame to the screen.
 */
function draw() {
    // Transform the clip coordinates so the render fills the canvas dimensions.
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    // Clear the screen.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Use the vertex array object that we set up.
    gl.bindVertexArray(vertexArrayObject);

    // Send the ModelView matrix with our transformations to the vertex shader.
    gl.uniformMatrix4fv(shaderProgram.modelViewMatrixUniform,
                      false, modelViewMatrix);

    // Render the triangle.
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);

    // Unbind the vertex array object to be safe.
    gl.bindVertexArray(null);
}


/**
 * scaling:
 * Affine transformation. Scaled the "I" logo based on theta
 */
function scaling() {
    glMatrix.vec3.set(scaleVec, Math.cos(degToRad(theta*0.5)), Math.cos(degToRad(theta*0.5)), 1);
    glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, scaleVec);
}


/**
 * rotation:
 * Affine transformation. Mostly from the template provided.
 */
function rotation(currentTime) {
    // Read the speed slider from the web page.
    let speed = 75;
    // Convert the time to seconds.
    currentTime *= 0.001;
    // Subtract the previous time from the current time.
    var deltaTime = currentTime - previousTime;
    // Remember the current time for the next frame.
    previousTime = currentTime;

    // Update geometry to rotate 'speed' degrees per second.
    coefRadius += speed * deltaTime;
    if (coefRadius > 360.0)
        coefRadius = 0.0;
    glMatrix.mat4.fromZRotation(modelViewMatrix, degToRad(coefRadius));
}


/**
 * translation
 * Affine transformation. Translate the "I" logo based on speed
 */
function translation() {
    // Read the speed slider from the web page.
    let speed = 30;
    glMatrix.vec3.set(translateVec, speed*0.02, speed*0.02, 0);
    glMatrix.mat4.translate(modelViewMatrix, modelViewMatrix, translateVec);
}


/**
 * Directly change vertex positions, as fulfilling the second requirement
 */
function directlyChange() {
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    for(let i = 0; i < 90; i++) {
        let y = Math.cos(degToRad(flip));
        vertices[i*3 + 1] *= y;
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
}


/**
 * My Animation:
 * draw a scaling triangle, with the color changing
 */
function myAnimation(){
    // reset view model to default
    modelViewMatrix = glMatrix.mat4.create();
    // reset vertices and buffer
    var vertices = [];
    var colors = [];

    for (let r = (coefRadius/300)%1; r >= 0; r -= 0.1){
      // draw a triangle with radius r
      vertices = vertices.concat([-r*Math.sqrt(3)/2, r/2, 0]);
      vertices = vertices.concat([r*Math.sqrt(3)/2, r/2, 0]);
      vertices = vertices.concat([0, -r, 0]);
        for (let i = 1; i <= 3 ; i++){
            colors= colors.concat([r/1.2, r/1.2, r/1.2, 1.0]);
        }
    }
    // Create the vertex array object, which holds the list of attributes for
    // the triangle.
    vertexArrayObject = gl.createVertexArray();
    gl.bindVertexArray(vertexArrayObject);

    // Create a buffer for positions, and bind it to the vertex array object.
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);


    // Populate the buffer with the position data.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    vertexPositionBuffer.itemSize = 3;
    vertexPositionBuffer.numberOfItems = vertices.length/vertexPositionBuffer.itemSize;

    // Binds the buffer that we just made to the vertex position attribute.
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Do the same steps for the color buffer.
    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    vertexColorBuffer.itemSize = 4;
    vertexColorBuffer.numItems = vertexPositionBuffer.numberOfItems;
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //Enable each attribute we are using in the VAO.
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // Unbind the vertex array object to be safe.
    gl.bindVertexArray(null);
}


/**
 * Animates the triangle by updating the ModelView matrix with a rotation
 * each frame.
 */
 function animate(currentTime) {

    if (document.getElementById("Illinois").checked === true) {
        setupBuffers(); // !!!!!!!!need to set buffer first!!!!!
        // global variables:
        flip = (flip + 2) % 360;
        
        // update theta
        var timeNow = new Date().getTime();
        if (lastTime != 0) {
          theta += 1.0;
        }
        lastTime = timeNow;

        // transformation on "I"
        directlyChange();
        rotation(currentTime);
        scaling();
        translation();

    } 
    else {
        // Read the speed slider from the web page.
        let my_animation_speed = 60;
        // Convert the time to seconds.
        currentTime *= 0.001;
        // Subtract the previous time from the current time.
        var deltaTime = currentTime - previousTime;
        // Remember the current time for the next frame.
        previousTime = currentTime;

        // update coefficient
        coefRadius += my_animation_speed * deltaTime;
        myAnimation();
    }

    // Draw the frame.
    draw();

    // Animate the next frame. The animate function is passed the current time in
    // milliseconds.
    requestAnimationFrame(animate);
}


/**
 * Startup function called from html code to start the program.
 */
 function startup() {
  console.log("Starting animation...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);
  setupShaders();
  setupBuffers();
  gl.clearColor(229/255, 229/255, 229/255, 1.0);
  requestAnimationFrame(animate);
  gl.enable(gl.DEPTH_TEST); // otherwise, orange cannot be seen
}
