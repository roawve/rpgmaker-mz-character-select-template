# RPG Maker MZ - Character Selection Screen Template

**Version:** 1.0
**Author:** roawve
**Engine:** RPG Maker MZ

## Overview

This plugin provides a template for creating a character selection screen in RPG Maker MZ, allowing the player to choose their starting character from a defined list. 

**❗ Important:** This is a template plugin. You **must** configure the `CHARACTERS` array within the plugin's `.js` file to define your specific characters, descriptions, appearances, and starting positions before use.

## Features

*   Displays multiple character choices with portraits/pictures.
*   Shows selected character's name and description.
*   Supports keyboard (left/right/ok/cancel) and mouse (hover/click) input.
*   Configurable character data directly within the plugin file.
*   Sets up the chosen character's party, appearance, and starting map location.
*   Optional integration to automatically show on "New Game" from the title screen.
*   Uses Game Switches/Variables to track selection status and chosen character ID/Name.

## Configuration (Required!)

Open the plugin's `.js` file in a text editor and find the `const CHARACTERS = [...]` array near the top. You need to edit the objects inside this array for each character you want to offer:

*   `id`: A unique string identifier for the character (e.g., `"knight"`, `"mage"`). Used for game logic (stored in Variable 1).
*   `name`: The character's name displayed on screen (e.g., `"Sir Kalt"`, `"Eliza"`). (Stored in Variable 2).
*   `description`: The text shown below the character's name. Can use RPG Maker text codes.
*   `picture`: The filename (without extension) of the character's portrait/image located in your project's `img/pictures/` folder.
*   `characterName`: The filename (without extension) of the character's map spritesheet located in `img/characters/`.
*   `characterIndex`: The index (0-7) on the `characterName` spritesheet for this character.
*   `startingMap`: The ID of the map the player should be transferred to after selecting this character.
*   `startingX`: The X coordinate on the `startingMap`.
*   `startingY`: The Y coordinate on the `startingMap`.
*   **Actor ID Assumption:** The code currently assumes Actor ID 1 corresponds to the first character in the array, Actor ID 2 to the second, and so on. Adjust the `setupPlayerParty` function if your Actor IDs don't match this pattern.

## Usage

1.  **Configure:** Edit the `CHARACTERS` array in the `.js` file as described above.
2.  **Install:** Save the configured `.js` file into your project's `js/plugins` folder. Activate it in the Plugin Manager.
3.  **Trigger:** Use the Plugin Command `CharacterSelect: Open` within an event to manually open the selection screen.
4.  **Automatic Start (Optional):** The plugin automatically tries to open the selection screen on "New Game" from the title *unless* Switch #1 is ON.
5.  **Post-Selection:** After the player makes a selection:
    *   Switch #1 is turned ON (you can use this to skip selection on subsequent loads/starts).
    *   Variable #1 is set to the selected character's `id`.
    *   Variable #2 is set to the selected character's `name`.
    *   The player is transferred to the character's defined starting map/location. You should have an event on that map (e.g., Autorun or Parallel triggered by Switch #1) to handle any further game introduction or setup.



## Technical Details & Learnings

*   **Language:** JavaScript (ES6+)
*   **Engine/Library:** RPG Maker MZ Plugin System, PIXI.js (implicitly via MZ core scripts)
*   **Key Concepts:**
    *   **Scene Management:** Created a custom scene (`Scene_CharacterSelect`) inheriting from `Scene_MenuBase`. Managed scene transitions using `SceneManager.push`, `SceneManager.goto`, `SceneManager.isPreviousScene`.
    *   **Plugin Commands:** Registered and handled MZ-style plugin commands.
    *   **Configuration:** Used a constant JavaScript array (`CHARACTERS`) within the plugin file for easy user configuration.
    *   **Sprites & Windows:** Used `Sprite_Clickable` for character portraits, `Window_Base` for text display (title, description). Manipulated sprite properties (position, opacity, bitmap).
    *   **Input Handling:** Managed keyboard (`Input.isTriggered`, `Input.isRepeated`) and mouse/touch (`TouchInput`, `isBeingTouched`) events.
    *   **Game Data Manipulation:** Interacted with core game objects like `$gameSwitches`, `$gameVariables`, `$gameParty`, `$gamePlayer`, `$gameActors`.
    *   **Aliasing:** Modified existing engine behavior (`Scene_Title.prototype.commandNewGame`, `Scene_Map.prototype.start`) to integrate the new scene flow.
    *   **Asynchronous Operations:** Used `fadeOutAll` and scene transitions which occur over time. (Removed explicit `setTimeout` in favor of standard scene flow).

## License

This plugin template is released under the [MIT License](LICENSE).
