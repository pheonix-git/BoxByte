# Box Byte - A Monochromatic Snake Game

This is a complete, offline-ready snake game built with HTML, CSS, and JavaScript. It features a minimalist, dark-themed aesthetic, persistent high scores, and dynamic obstacle generation.

## Features


- **Monochromatic Design:** A clean, dark-gray/black theme for a retro feel.
- **Custom Snake Graphics:** Arrow-shaped head and chevron-shaped tail drawn on the canvas.
- **Persistent High Score:** Your best score is saved in your browser's local storage.
- **Dynamic Obstacles:** A new obstacle appears for every 10 fruits eaten.
- **Progress Bar:** Visually tracks your progress to the next obstacle.
- **Responsive Controls:** Play with either Arrow keys or WASD.
- **Pause/Restart:** Full control over the game state.

## How to Run

1.  Ensure all files (`index.html`, `style.css`, `script.js`) and the `fonts` folder are in the same directory.
2.  Open `index.html` in any modern web browser (e.g., Chrome, Firefox, Edge).
3.  The game will start automatically.

## Suggestions for Packaging

The self-contained nature of this project makes it easy to package as a native desktop or mobile application.

### Desktop App (.exe, .dmg) using Electron

Electron allows you to wrap web applications in a native container. To package this game, you would set up a basic Electron project, point its main browser window to this `index.html` file, and then use a tool like `electron-builder` to create distributable installers for Windows, macOS, and Linux.

### Mobile App (.apk, .ipa) using Cordova/Capacitor

Apache Cordova or Capacitor can be used to convert the game into a mobile app. You would add your project files to a new Cordova/Capacitor project, and the tool would wrap them in a native WebView, giving you an installable `.apk` (Android) or an Xcode project for iOS.
