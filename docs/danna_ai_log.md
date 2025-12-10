AI-Assisted Web Development — Technical Issues & Explanations
1. Why was the authentication card touching the edges of the background instead of having proper margins?

The card had padding, but the parent container had no outer spacing. Without margin or layout spacing on the parent wrapper, the card expanded to the very top and touched the edges.

2. Why wasn’t the list of tourist attractions scrolling?

The container didn’t have a fixed vertical height, so the browser didn’t create a scrollable region. Defining a height allowed scrolling to work correctly.

3. Why did the “Logout” button work on some pages but not on others?

The logout function existed only in the authentication script. Pages that didn’t import that module couldn’t access the function, so the button failed on those pages.

4. Why weren’t my CSS updates showing up even after editing the files?

Multiple CSS files defined the same classes. The stylesheet loaded last overrode earlier definitions, producing unexpected results. Fixing the load order and removing duplicates solved the issue.

5. Why was the grid layout breaking on small screens?

The grid’s minimum width exceeded mobile screen sizes, causing layout overflow. Responsive breakpoints and adjusted minmax() values fixed the behavior.

6. Why did Git refuse to commit even though the files were modified?

Running git add * inside a subfolder only staged files in the current directory. Modified files located in ../frontend/ were ignored, so Git saw no staged changes and refused the commit.

7. Why did some icons not display in the navigation header?

The Font Awesome stylesheet loaded after the icons were rendered, and the browser cached the missing state. Reordering the <link> or forcing a refresh fixed the issue.

8. Why did Firefox and Chrome render the login input fields differently?

Each browser applies its own default styles to input fields. Without resetting form element appearance globally, the visual design differed between browsers.

9. Why did the responsive layout break only after navigating from the login page?

The login page applied overriding global styles (like fixed width or modified flexbox rules) that were not reset afterward. These persistent styles affected other pages until overwritten.
