function swipeDetector(element, callback, stopDefault){

    var DIRECTIONS = {
        left: "left",
        right: "right",
        up: "up",
        down: "down"
    };

    var touchElement = element,
		swipeDirection,
		startX,
		startY,
		distX,
		distY,
		threshold = 50, //distance to be travelled to consider swipe
		restraint = 100, // allow perpendicular distance
		allowedTime = 500, // maximum time allowed to travel that distance
		elapsedTime, // diffrence between touch start time and touch end time
		startTime, // touch start time
		swipeCallback = callback || function(swipeDirection){},
		preventDefault = function(event) {
			if (stopDefault) {
				event.preventDefault();
			}
		};

    touchElement.addEventListener('touchstart', function(event){
        var touch_started_obj = event.changedTouches[0];
        swipeDirection = "none";
        startX = touch_started_obj.pageX;
        startY = touch_started_obj.pageY;
        startTime = new Date().getTime(); // record time when finger first makes contact with surface
		preventDefault(event);
    }, false);

    touchElement.addEventListener('touchmove', function(event){
        preventDefault(event);
    }, false);

    touchElement.addEventListener('touchend', function(event){
        var touch_ended_obj = event.changedTouches[0]
        distX = touch_ended_obj.pageX - startX; // get horizontal dist traveled by finger while in contact with surface
        distY = touch_ended_obj.pageY - startY; // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime; // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipeDirection = (distX < 0)? DIRECTIONS.left : DIRECTIONS.right; // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipeDirection = (distY < 0)? DIRECTIONS.up : DIRECTIONS.down; // if dist traveled is negative, it indicates up swipe
            }
        }
        swipeCallback(swipeDirection);
        preventDefault(event);
    }, false);
}
