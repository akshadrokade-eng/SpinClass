Redesign the attached SpinClass UI into a polished, highly structured desktop application interface.

IMPORTANT:
Use the attached screenshots as the visual reference for the EXISTING application and preserve its overall identity, but significantly improve the layout, hierarchy, spacing, alignment, and usability.

Do NOT create a generic SaaS dashboard.
Do NOT add unnecessary cards, charts, sidebars, illustrations, gradients, or decorative elements.

This is a classroom random team/student picker called SPINCLASS.

==================================================
DESIGN DIRECTION
==================================================

Style:
- Minimalist brutalist / editorial interface
- Black / near-black background
- Off-white typography
- Thin gray borders
- Monospace / typewriter-inspired typography
- High contrast
- Professional but distinctive
- Functional classroom tool
- Spacious and organized

Keep the existing monochrome identity.

The redesign should feel like a carefully designed desktop application rather than a loose collection of controls.

==================================================
1. TOP NAVIGATION
==================================================

Create a clean horizontal top navigation bar.

LEFT:
SPINCLASS

Next to it:
- SPINCLASS
- TEAM & TOPIC

"TEAM & TOPIC" should appear as the currently active navigation item using a subtle outlined rectangular treatment.

RIGHT:
Three compact square icon buttons:
- Student/list management
- Fullscreen
- Reset

Keep these buttons aligned perfectly on one horizontal baseline.

Use simple line icons.

Do not make the navigation too tall.

==================================================
2. MAIN CONTENT STRUCTURE
==================================================

The biggest improvement should be the main layout.

Create a centered configuration workspace with TWO clearly defined columns:

LEFT COLUMN:
TEAM MEMBERS

RIGHT COLUMN:
TOPIC

The two columns must have:
- Equal visual alignment
- Clear headings
- Consistent spacing
- Consistent widths
- Shared vertical rhythm

Do NOT position the elements loosely in the middle of the screen.

Use a structured grid.

Recommended desktop proportions:

TEAM MEMBERS: approximately 60%
TOPIC + controls: approximately 40%

==================================================
3. TEAM MEMBERS PANEL
==================================================

Create a clearly defined Team Members section.

At the top:

TEAM MEMBERS

Below the heading show:

20 STUDENTS LOADED    ↻

The student count and reset/reload icon should be aligned horizontally.

Then create a large bordered student-selection panel.

The panel should have a fixed, clearly defined width and height.

Inside the panel:
- Show several student names vertically.
- Center the active/current student.
- Use faded opacity for students above/below the active position.
- Clearly highlight the currently selected student.
- Add a subtle selection frame around the active student.
- Add small up/down indicators to communicate that the list is scrollable/spinning.

Example:

                 ▲

        Akshad Rokade

        Rahul Patil

    ┌─────────────────────────┐
    │      Sneha Sharma       │
    └─────────────────────────┘

        Tanvi Joshi

        Neha Joshi

                 ▼

The selection area should feel intentional and symmetrical.

IMPORTANT:
Do not allow the student names to visually float without a container.

The existing screenshot currently has too much empty space around the names.
Fix this by creating a strong visual boundary for the picker.

==================================================
4. TOPIC PANEL
==================================================

To the right of the Team Members picker:

TOPIC

Below:

21 TOPICS LOADED    ↻

Then create a clearly defined topic selector.

Use:

◀   ┌───────────────────────────┐   ▶
    │       Student Name        │
    └───────────────────────────┘

The topic selection box should have:
- Clear border
- Proper padding
- Centered text
- Left/right navigation arrows
- Consistent width
- Strong alignment with the student picker

The topic selector should visually belong to the same system as the Team Members picker.

==================================================
5. TEAM SIZE CONTROL
==================================================

Below the two-column picker area, create a dedicated Team Size control.

Center it horizontally.

Label:

TEAM SIZE

Then:

[ − ]   3   [ + ]

Make the number visually prominent.

The minus and plus buttons should:
- Be square
- Have thin borders
- Have consistent dimensions
- Have hover/pressed states

Do not make this look like a random floating control.

It should clearly belong to the configuration section.

==================================================
6. PRIMARY ACTION
==================================================

Below Team Size:

Create a large primary action button.

Text:

SPIN

Include a small circular-arrow icon.

The button should be wider than the team-size controls and clearly communicate:

"This starts the random selection."

Use a strong border and high-contrast typography.

Do not use a bright filled color.

Keep the monochrome style.

Add subtle hover and pressed states.

==================================================
7. RESULTS SECTION
==================================================

Below the configuration controls, create a structured Results section.

Do not let the results simply float underneath the button.

Create a clean results area with two aligned columns:

TEAM                         TOPIC

01  Tanvi Joshi              Automated Plant Watering System
02  Neha Joshi
03  Aditya Shinde

Use:
- Small uppercase labels
- Clear numbering
- Strong student names
- Strong topic text
- Consistent left alignment
- Proper vertical spacing

The result section should feel like a clean output from the Spin action.

==================================================
8. SPACING & ALIGNMENT
==================================================

This is extremely important.

Fix the current UI's excessive empty spaces.

Use a consistent spacing system.

Everything should align to an invisible grid.

Recommended structure:

TOP NAVIGATION
        ↓
MAIN CONFIGURATION AREA
        ↓
TEAM MEMBERS     TOPIC
        ↓
TEAM SIZE
        ↓
SPIN
        ↓
RESULTS

Do not vertically spread these sections across the entire screen.

Keep the main interaction area comfortably within the viewport.

The user should understand the entire workflow without scrolling on a standard 1080p desktop screen.

==================================================
9. TYPOGRAPHY
==================================================

Maintain the existing typewriter/monospace character.

Use typography hierarchy:

SPINCLASS
→ strongest branding

TEAM MEMBERS / TOPIC
→ uppercase section labels

20 STUDENTS LOADED
→ small metadata text

Student names
→ large and readable

SPIN
→ bold primary action

Results
→ readable but secondary

Avoid using too many different font sizes.

Use letter spacing for small uppercase labels.

==================================================
10. COLORS
==================================================

Background:
Near-black / black.

Primary text:
Off-white.

Secondary text:
Muted gray.

Borders:
Dark gray / subtle gray.

Selected elements:
Off-white border with slightly stronger contrast.

Do NOT introduce:
- Blue
- Purple
- Green
- Gradients
- Neon colors

Keep the monochrome visual language from the existing SpinClass interface.

==================================================
11. RESPONSIVE DESIGN
==================================================

Desktop:
Two-column Team Members + Topic layout.

Tablet:
Reduce widths and spacing while maintaining the two-column structure where possible.

Mobile:
Stack:

TEAM MEMBERS
↓
TOPIC
↓
TEAM SIZE
↓
SPIN
↓
RESULTS

Everything must remain usable.

==================================================
12. INTERACTION STATES
==================================================

Design proper states for:

Student picker:
- Normal
- Selected
- Faded surrounding students
- Hover

Topic selector:
- Normal
- Hover
- Active

Team size:
- Normal
- Hover
- Disabled

Spin button:
- Normal
- Hover
- Pressed
- Disabled
- Spinning/loading

Navigation buttons:
- Normal
- Hover
- Active

Use subtle 150–250ms transitions.

==================================================
13. VERY IMPORTANT — PRESERVE THE EXISTING PRODUCT
==================================================

This is a REDESIGN, not a new product.

Keep the existing SpinClass concepts:

- Loaded student count
- Loaded topic count
- Student picker
- Topic picker
- Team size
- Spin / Spin Again
- Results
- Reset
- Fullscreen
- Student management
- Topic management

Do not remove functionality.

Do not invent unrelated functionality.

==================================================
FINAL VISUAL GOAL
==================================================

The final screen should communicate the following hierarchy immediately:

                 SPINCLASS

        TEAM & TOPIC CONFIGURATION

     ┌────────────────┐   ┌───────────────┐
     │ TEAM MEMBERS   │   │ TOPIC         │
     │                │   │               │
     │      ▲         │   │  ◀  TOPIC  ▶ │
     │    Student     │   │               │
     │   ─────────    │   └───────────────┘
     │    Student     │
     │   ─────────    │
     │    Student     │
     │      ▼         │
     └────────────────┘

                  TEAM SIZE

                  [ − ] 3 [ + ]

                    [ SPIN ]

        ─────────────────────────

                    RESULTS

        TEAM                    TOPIC
        01 Student Name         Topic Name
        02 Student Name
        03 Student Name

The most important requirement is STRUCTURE.

The current interface has the right visual identity but feels too empty and disconnected.

Make the redesigned UI feel:
- aligned
- intentional
- compact
- readable
- balanced
- production-ready

Use the attached screenshots as reference for the existing visual language, but improve the composition substantially.