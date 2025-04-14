document.addEventListener("DOMContentLoaded", function () {
  // Variable to keep track of the currently active (open) details panel.
  let activeDetails = null;

  // Get all project rectangle elements.
  const projects = document.querySelectorAll(".project");

  projects.forEach((project) => {
    // Listen for click events on each rectangle.
    project.addEventListener("click", function () {
      // Use the data-details attribute to retrieve the associated details panel's ID.
      const detailsId = project.getAttribute("data-details");
      const detailsEl = document.getElementById(detailsId);

      // If the clicked project's details are already active, do nothing.
      // You could also re-trigger the animation if desired.
      if (activeDetails === detailsEl) {
        return;
      }

      // If there is another panel already active, transition it back to "off".
      if (activeDetails) {
        // Switch the current active panel to the "down" state (slide down) first.
        activeDetails.classList.remove("up");
        activeDetails.classList.add("down");

        // When the "down" transition finishes, move it to the "off" state.
        activeDetails.addEventListener(
          "transitionend",
          function offHandler(event) {
            // Check that we're handling the transform transition.
            if (event.propertyName === "transform") {
              activeDetails.classList.remove("down");
              activeDetails.classList.add("off");
              // Remove this event listener so it doesn't fire again.
              activeDetails.removeEventListener("transitionend", offHandler);
            }
          }
        );
      }

      // Now, set up the clicked project's details panel.
      // If it is still in the "off" state (hidden), remove that class.
      if (detailsEl.classList.contains("off")) {
        detailsEl.classList.remove("off");
      }
      // Ensure any previous state (down or up) is removed.
      detailsEl.classList.remove("down", "up");

      // Set the panel to the "down" state.
      // (The CSS for .project-details.down should position the element 50px lower with lower opacity.)
      detailsEl.classList.add("down");

      // Listen for when the transition (for example, the transform) ends on this panel.
      // Once the downward movement is complete, we switch to the "up" state.
      detailsEl.addEventListener("transitionend", function upHandler(event) {
        // Check that the transition is the transform property.
        if (event.propertyName === "transform") {
          // Remove the "down" state and add the "up" state, which brings the panel into its final position.
          detailsEl.classList.remove("down");
          detailsEl.classList.add("up");
          // Remove the listener so that this block only runs once per click.
          detailsEl.removeEventListener("transitionend", upHandler);
        }
      });

      // Finally, update the reference so we know which panel is now active.
      activeDetails = detailsEl;
    });
  });
});
