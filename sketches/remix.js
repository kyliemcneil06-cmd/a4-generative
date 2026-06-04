// =============================================
// remix.js — your combined sketch
// This is where sketch1 and sketch2 come together
// into something new
// =============================================

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(220);
  // your combined code here

}



// ________________________________

  function drawww() {

  // Create the circle that will follow the cursor as it hovers
  // over the canvas.
  fill(300);
  noStroke();
  ellipse(mouseX, mouseY, 20, 20);


  // When the cursor hovers over the offscreen buffer, replicate the
  // circle that is drawn when the cursor is hovering over the
  // canvas. Within the buffer area, only show the outline of the circle.
  graphic.stroke(250);
  graphic.ellipse(mouseX - 150, mouseY - 75, 60, 60);

  // Draw the buffer to the screen with image().
  image(graphic, 150, 75);

  }
  
function draw() {
  // background(70);

  // Calculate the angle based on the mouse position, maximum 90 degrees
  angle = (mouseX / width) * 90;
  angle = min(angle, 90);

  // Start the tree from the bottom of the screen
  translate(width / 2, height);

  // Draw a line 120 pixels
  stroke(0, 255, 255);
  line(0, 0, 0, -120);

  // Move to the end of that line
  translate(0, -120);

  // Start the recursive branching
  branch(120, 0);

  describe(
    'A tree drawn by recursively drawing branches, with angle determined by the user mouse position.'
  );
  
}

function branch(h, level) {
  // Set the hue based on the recursion level
  stroke(level * 57, 400, 800);

  // Each branch will be 2/3 the size of the previous one
  h *= 0.70;
  // 0.66

  // Draw if our branch length > 2, otherwise stop the recursion
  if (h > 2) {
    // Draw the right branch
    // Save the current coordinate system
    push();

    // Rotate by angle
    rotate(angle);

    // Draw the branch
    line(0, 0, 0, -h);

    // Move to the end of the branch
    translate(0, -h);

    // Call branch() recursively
    branch(h, level + 1);

    // Restore the saved coordinate system
    pop();

    // Draw the left branch
    push();
    rotate(-angle);
    line(0, 0, 0, -h);
    translate(0, -h);
    branch(h, level + 1);
    pop();

  }
}


// _________________________________

// let graphic;

// function setup() {
//   describe(
//     'Black canvas with a very dark grey rectangle in the middle. When the cursor is hovered over the canvas, a white circle follows the cursor in the black areas of the canvas, but not over the dark grey rectangle.'
//   );
//   createCanvas(720, 400);

//   // Create the graphic that will be placed within the canvas.
//   graphic = createGraphics( 40, 40);
// }

// function draw() {
//   // Create a black rectangle to cover the canvas.
//   // Make the rectangle black with an alpha value of 12 so that
//   // the white circle following the cursor slowly fades into the background.
//   background(70, 19);
//   // 12

//   // Create the circle that will follow the cursor as it hovers
//   // over the canvas.
//   fill(300);
//   noStroke();
//   ellipse(mouseX, mouseY, 20, 20);

//   // Give the buffer a dark grey background.
//   // Any shapes within the buffer will have no fill.
//   graphic.background(51);
//   graphic.noFill();

//   // When the cursor hovers over the offscreen buffer, replicate the
//   // circle that is drawn when the cursor is hovering over the
//   // canvas. Within the buffer area, only show the outline of the circle.
//   graphic.stroke(250);
//   graphic.ellipse(mouseX - 150, mouseY - 75, 60, 60);

//   // Draw the buffer to the screen with image().
//   image(graphic, 150, 75);
