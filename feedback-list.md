# 🚀 Project Refinement & Bug Fix Requests

TO joc,

To polish our project and ensure a smoother user experience, I have compiled a list of necessary modifications. Please review the items below and let's assign tasks to move forward.

---

### 1. Improve Homepage Slideshow Transition
* **Issue:** The transition from the last slide back to the first is unnatural (jerky), and the overall slide change speed is too fast.
* **Technical Proposal:**
    * **Goal:** Replace the harsh `display: block/none` toggle with a smooth CSS `opacity` fade-in/out effect.
    * **Files:** `frontend/index.html` (script), `frontend/css/home.css`
    * **Implementation:**
        1.  **CSS:** Update `.mySlides` to use `position: absolute`, `opacity: 0`, and `transition: opacity 1.5s ease-in-out`. Use a class like `.active` to set `opacity: 1`.
        2.  **JS:** Modify the slideshow logic to toggle the `.active` class instead of changing the `display` property.
        3.  **Timing:** Increase the `setTimeout` delay from 4000ms to **5000ms+** for a more relaxed pace.

### 2. Add Schedule Links to Drawer Menu
* **Issue:** The side navigation (drawer) lacks direct access to schedule-related pages.
* **Technical Proposal:**
    * **Files:** `frontend/index.html`
    * **Implementation:** Inside the `<aside id="drawer">` -> `<nav>` section, separate and add the following links:
        * `Schedule List` (Link to list view)
        * `New Schedule` (Link to scheduler/creation view)

### 3. Update GNB Login/Logout State
* **Issue:** The "Login" button in the Global Navigation Bar (top bar) does not change to "Logout" after the user logs in.
* **Technical Proposal:**
    * **Files:** `frontend/js/home.js`
    * **Implementation:** Update `refreshGNBUser` (or equivalent function):
        * Check for the existence of the `token` in `localStorage`.
        * **If Logged In:** Change button text to **"Logout"**. Attach a click handler that clears `localStorage` and reloads the page.
        * **If Logged Out:** Keep the original "Login" functionality.

### 4. Enhance User Menu (Dropdown)
* **Issue:** Clicking "Hello, [Name]" currently does nothing. It needs to be functional.
* **Technical Proposal:**
    * **Goal:** Implement a dropdown menu for the user profile.
    * **Files:** `frontend/index.html`, `frontend/css/home.css`, `frontend/js/home.js`
    * **Implementation:**
        1.  **HTML:** Structure `#gnb-user` to include a hidden dropdown container.
        2.  **JS:** Add a toggle event on the username click.
        3.  **Features:** Add options for **"My Schedule List"** and **"Delete Account"**.
            * *Note:* The "Delete Account" action must trigger the `DELETE /users/:id` API call.

### 5. Rebrand Top Navigation
* **Issue:** The top bar displays the team name ("CocoaTeam") instead of the project topic, which is confusing for users.
* **Technical Proposal:**
    * **Files:** `frontend/index.html`
    * **Implementation:**
        * Change the `<div class="brand">` text to a project-relevant name (e.g., **"Trip Planner"** or **"Journey Jot"**).
        * Keep the team name "CocoaTeam" strictly in the **Footer**.

### 6. Dynamic Drawer Menu (Login State)
* **Issue:** "Log In" and "Sign Up" links remain visible in the side menu even after the user has logged in.
* **Technical Proposal:**
    * **Files:** `frontend/js/home.js`
    * **Implementation:**
        * Create a function (e.g., `refreshDrawerMenu`) to check auth state.
        * **If Logged In:** Hide "Log In/Sign Up". Show **"My Account"** and **"Logout"** buttons.
        * *Tip:* Using a utility class on the `<body>` (e.g., `.is-logged-in`) and controlling visibility via CSS is often cleaner than manipulating DOM elements individually.

