const canvas_element = document.getElementById('myCanvas');
const ctx = canvas_element.getContext('2d');

let offset_x = 0;
let offset_y = 0;
let scale = 1;
let is_space_pressed = false;
let is_panning = false;
let start_x = 0;
let start_y = 0;
let initial_dist = null; // Used for pinch-zoom distance
let is_shift_pressed = false;
let is_ctrl_pressed = false;
let is_alt_pressed = false;

let zoom_pivot = { x: 0, y: 0 }; // Store zoom pivot point

// Resize the canvas and redraw
function resize_canvas() {
    console.log("Resizing canvas"); // Debug Point
    canvas_element.width = window.innerWidth;
    canvas_element.height = window.innerHeight;
    draw(); // Redraw the canvas when resized
}

// Draw the content on the canvas
function draw() {
    console.log("Drawing canvas"); // Debug Point
    ctx.clearRect(0, 0, canvas_element.width, canvas_element.height);
    ctx.save();
    ctx.translate(offset_x, offset_y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "blue";
    ctx.fillRect(100, 100, 200, 200); // Example blue square
    ctx.restore();
}

// Handle keydown event (spacebar, shift, ctrl, alt)
function handle_keydown(e) {
    if (e.key === ' ') {
        is_space_pressed = true;
        console.log("Spacebar pressed"); // Debug Point
    }
    if (e.key === 'Shift') {
        is_shift_pressed = true;
        console.log("Shift key pressed"); // Debug Point
    }
    if (e.key === 'Control') {
        is_ctrl_pressed = true;
        console.log("Ctrl key pressed"); // Debug Point
    }
    if (e.key === 'Alt') {
        is_alt_pressed = true;
        console.log("Alt key pressed"); // Debug Point
    }
}

// Handle keyup event (spacebar, shift, ctrl, alt)
function handle_keyup(e) {
    if (e.key === ' ') {
        is_space_pressed = false;
        is_panning = false; // Stop panning
        console.log("Spacebar released, panning stopped"); // Debug Point
    }
    if (e.key === 'Shift') {
        is_shift_pressed = false;
        console.log("Shift key released"); // Debug Point
    }
    if (e.key === 'Control') {
        is_ctrl_pressed = false;
        console.log("Ctrl key released"); // Debug Point
    }
    if (e.key === 'Alt') {
        is_alt_pressed = false;
        console.log("Alt key released"); // Debug Point
    }
}

// Handle mouse down event for right-click, middle-click, and panning
function handle_mousedown(e) {
    if (is_space_pressed) {
        is_panning = true;
        start_x = e.clientX - offset_x;
        start_y = e.clientY - offset_y;
        console.log("Mouse down at:", start_x, start_y); // Debug Point
    }

    if (e.button === 0) {
        console.log("Left-click detected"); // Debug Point
    } else if (e.button === 1) {
        console.log("Middle-click detected"); // Debug Point
    } else if (e.button === 2) {
        console.log("Right-click detected"); // Debug Point
    }
}

// Prevent context menu from opening on right-click
canvas_element.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    console.log("Context menu prevented"); // Debug Point
});

// Handle mouse move event for panning
function handle_mousemove(e) {
    if (is_panning) {
        const prev_x = offset_x;
        const prev_y = offset_y;
        offset_x = e.clientX - start_x;
        offset_y = e.clientY - start_y;

        // Debugging pan direction
        if (offset_x > prev_x) {
            console.log("Panning right"); // Debug Point
        } else if (offset_x < prev_x) {
            console.log("Panning left"); // Debug Point
        }
        if (offset_y > prev_y) {
            console.log("Panning down"); // Debug Point
        } else if (offset_y < prev_y) {
            console.log("Panning up"); // Debug Point
        }

        console.log("Panning: offset_x =", offset_x, "offset_y =", offset_y); // Debug Point
        draw(); // Redraw the canvas after panning
    }
}

// Handle pinch-to-zoom event for touch-based zooming (with two fingers)
function handle_pinch_zoom(e) {
    if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        // Calculate the midpoint between the two fingers
        const midpointX = (touch1.pageX + touch2.pageX) / 2;
        const midpointY = (touch1.pageY + touch2.pageY) / 2;

        // Set the zoom pivot at the start of the gesture (first pinch)
        if (initial_dist === null) {
            initial_dist = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY); // Set initial distance
            zoom_pivot.x = (midpointX - canvas_element.offsetLeft - offset_x) / scale;
            zoom_pivot.y = (midpointY - canvas_element.offsetTop - offset_y) / scale;
            console.log("Zoom pivot set to (fingers):", zoom_pivot); // Debug Point
        }

        // Calculate the current distance between the two fingers
        const current_dist = Math.hypot(touch2.pageX - touch1.pageX, touch2.pageY - touch1.pageY);

        // Calculate zoom factor based on distance change
        const zoom_factor = current_dist / initial_dist;

        // Apply the zoom factor and adjust the offsets to zoom around the pivot
        const previousScale = scale;
        scale *= zoom_factor;

        offset_x -= zoom_pivot.x * (scale - previousScale);
        offset_y -= zoom_pivot.y * (scale - previousScale);

        console.log("Pinch zooming, scale =", scale); // Debug Point

        draw();  // Redraw the canvas after zooming

        // Update initial distance for the next frame
        initial_dist = current_dist;
    }
}

// Handle touchend to reset initial distance after pinch gesture ends
canvas_element.addEventListener('touchend', () => {
    initial_dist = null;  // Reset the initial pinch distance when fingers are lifted
    console.log("Zoom action completed"); // Debug Point
});

// Handle mouse wheel zooming (Zoom In, Zoom Out)
function handle_zoom(event) {
    event.preventDefault();
    const zoomIntensity = 0.1;

    // Calculate the mouse position relative to the canvas and adjusted by the current offset and scale
    const mouseX = (event.clientX - canvas_element.offsetLeft - offset_x) / scale;
    const mouseY = (event.clientY - canvas_element.offsetTop - offset_y) / scale;

    // Store the pivot point for zooming
    zoom_pivot.x = mouseX;
    zoom_pivot.y = mouseY;
    console.log("Zoom pivot set to:", zoom_pivot); // Debug Point

    // Calculate the previous scale
    const previousScale = scale;

    if (event.deltaY < 0) {
        // Zoom in
        scale *= (1 + zoomIntensity);
        console.log("Wheel zooming in, scale =", scale); // Debug Point
    } else {
        // Zoom out
        scale *= (1 - zoomIntensity);
        console.log("Wheel zooming out, scale =", scale); // Debug Point
    }

    // Adjust offsets so that the zoom happens around the zoom_pivot
    offset_x -= zoom_pivot.x * (scale - previousScale);
    offset_y -= zoom_pivot.y * (scale - previousScale);

    draw(); // Redraw the canvas after zooming
}

// Handle mouse up event to stop panning
function handle_mouseup() {
    if (is_panning) {
        console.log("Mouse up, panning stopped"); // Debug Point
        is_panning = false; // Stop panning on mouse release
    }
}

// Attach all event listeners
function attach_event_listeners() {
    console.log("Attaching event listeners"); // Debug Point
    window.addEventListener('keydown', handle_keydown);
    window.addEventListener('keyup', handle_keyup);
    canvas_element.addEventListener('mousedown', handle_mousedown);
    window.addEventListener('mousemove', handle_mousemove);  // Attach globally to track all movements
    window.addEventListener('mouseup', handle_mouseup);  // Attach globally to detect mouseup outside canvas
    canvas_element.addEventListener('contextmenu', (e) => e.preventDefault()); // Prevent default right-click
// Handle wheel zoom events
canvas_element.addEventListener('wheel', handle_zoom); // Handle wheel zoom events
canvas_element.addEventListener('touchmove', handle_pinch_zoom); // Pinch zoom event for touch devices
}

// Initialize the canvas and attach events
function initialize() {
console.log("Initializing application"); // Debug Point
resize_canvas();
window.addEventListener('resize', resize_canvas);
attach_event_listeners();
}

// Initialize the application
initialize();
