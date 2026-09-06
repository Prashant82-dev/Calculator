CALCURA
A modern multi-mode calculator web app — Basic & Scientific calculator, 
Graph plotter, Unit converter, and Programmer tool, in one interface.

Repository: github.com/Prashant82-dev/Calculator
Author: Prashant Dwivedi
Stack: HTML5 · CSS3 · Vanilla JavaScript

Note: This README was generated from an analysis of the repository's 
index.html markup (the app's internal title is "Calcura"). The original 
request referred to a "digital clock" project, but the repository 
currently contains a calculator application, not a clock.


OVERVIEW
--------
Calcura is a single-page, front-end-only calculator suite. It is 
organized into four tabs — Calc, Graph, Convert, and Prog — that live 
inside one application shell with a shared top bar, theme picker, and 
slide-out calculation history panel. It is built entirely with vanilla 
HTML, CSS, and JavaScript, with no external frameworks or build tools 
required.


FEATURES
--------

1. Calculator (Basic & Scientific)
   - Toggle between Basic and Scientific modes
   - Live expression line above the main result display
   - Copy-to-clipboard button for the current result
   - Inline error messaging for invalid expressions
   - Memory functions: MC (clear), MR (recall), M+, M-, with a memory 
     indicator
   - Scientific functions: sin, cos, tan, √ (sqrt), log, ln, x^y, 
     parentheses, π, e, and factorial (n!)
   - Full keypad: digits 0-9, double-zero, decimal point, AC (all clear), 
     DEL (backspace), %, ÷, ×, −, +, and =

2. Graph Plotter
   - Enter any function of x (e.g. sin(x)*x, x^2-3)
   - Plots the function live on an HTML5 <canvas> element
   - Zoom in / zoom out controls with a visible x-axis range label
   - Inline error display for invalid or unplottable expressions

3. Unit Converter
   - Categories: Length, Weight/Mass, Temperature, Area, Speed, and 
     Data storage
   - Side-by-side "from" and "to" value/unit fields
   - One-click swap button to reverse the conversion direction
   - Inline error handling for invalid input

4. Programmer Tool
   - Enter a value in Decimal, Binary, Octal, or Hex
   - Simultaneous read-out of the value in all four bases 
     (DEC / BIN / OCT / HEX)
   - Bitwise operations panel: AND, OR, XOR, NOT, left shift (<<), and 
     right shift (>>)
   - Two operand inputs (A and B) feeding the bitwise result

5. Shared UI
   - Toggleable History side panel that lists past calculations, with a 
     Clear button
   - Four built-in visual themes: Nebula, Forest, Blush, and Mono, 
     switchable from the top bar
   - Animated background "orb" decorations for a glassmorphism-style look
   - Fully responsive tab-based layout using ARIA roles for accessibility 
     (role="tablist", role="tab")


TECH STACK
----------
Layer            | Technology
-----------------|---------------------------------------------
Structure        | HTML5
Styling          | CSS3 (custom themes via data-theme attribute)
Behavior         | Vanilla JavaScript (ES6+), no external libraries
Graph rendering  | HTML5 Canvas API


PROJECT STRUCTURE
------------------
Calculator/
  ├── index.html   # App markup: tabs, calculator, graph, converter, 
  |                  programmer panels
  ├── style.css    # Theming, layout, and component styles
  ├── script.js    # App logic: calculation engine, graphing, 
  |                  conversion, bitwise ops
  └── README.md    # Project documentation


GETTING STARTED
----------------
No build step, package manager, or server is required — Calcura runs 
entirely in the browser.

1. Clone the repository

   git clone https://github.com/Prashant82-dev/Calculator.git
   cd Calculator

2. Run it

   - Double-click index.html to open it directly in your browser, or
   - Serve it locally for the best experience, e.g.:
     python3 -m http.server 8000
     then visit http://localhost:8000


USAGE GUIDE
-----------
- Switch modes using the Calc / Graph / Convert / Prog tabs in the top 
  bar.
- Change theme by clicking one of the four color swatches in the 
  top-right theme picker.
- View history by clicking the history (clock) icon; clear it anytime 
  with the Clear button.
- Basic ↔ Scientific: use the mode switch inside the calculator panel to 
  reveal scientific functions.
- Graph a function: type an expression in terms of x into the "y =" 
  field; use +/- Zoom to change the visible range.
- Convert units: pick a category, enter a value, and the converted 
  result updates automatically; use the swap icon to flip direction.
- Programmer mode: enter a number and choose its base to see it in 
  Decimal/Binary/Octal/Hex, or use the bitwise row to compute 
  AND/OR/XOR/NOT/shift operations.


BROWSER COMPATIBILITY
----------------------
Works in all modern evergreen browsers (Chrome, Edge, Firefox, Safari) 
that support HTML5 Canvas, CSS custom properties, and ES6 JavaScript.


POSSIBLE FUTURE IMPROVEMENTS
------------------------------
- Add unit tests for the calculation and conversion logic
- Persist theme and history choices with localStorage
- Add keyboard input support for all four modes
- Add a dedicated mobile layout / PWA support


Author: Prashant Dwivedi | Project: Calcura (Calculator repo)
