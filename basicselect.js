// =============================================================================
// Character Selection Screen - Template Version
// =============================================================================

/*:
 * @target MZ
 * @pluginCommand CharacterSelect
 * @command Open
 * @desc Opens a character selection screen. Requires configuration.
 * @author roawve 
 * @help
 * Character Selection Screen Plugin v1.0
 * 
 * This plugin creates a character selection screen.
 * You MUST configure the characters within the plugin file's `CHARACTERS` array.
 * 
 * Setup:
 * 1. Edit the `CHARACTERS` array near the top of this plugin file (.js) 
 *    to define your selectable characters, their appearances, descriptions,
 *    and starting locations.
 * 2. Ensure the picture files listed exist in `img/pictures/`.
 * 3. Ensure the character spritesheets listed exist in `img/characters/`.
 * 4. Use the Plugin Command "CharacterSelect: Open" in an event to show the screen.
 * 
 * Optional - Skipping Selection on Load/New Game:
 *   This plugin includes code to automatically show the selection screen
 *   when starting a New Game from the title.
 *   To prevent this AFTER selection is done (e.g., when loading a save or
 *   if you want the player to confirm before starting), set Switch #1 to ON 
 *   after the player makes their choice and is transferred to the map. 
 *   The plugin uses Variable #1 to store the selected character's 'id'
 *   and Variable #2 for the selected character's 'name'.
 */

(function() {
    'use strict'; // Recommended practice

    // --- Configuration Section ---
    // EDIT THIS ARRAY TO DEFINE YOUR CHARACTERS
    const CHARACTERS = [
        {
            // --- Core Info ---
            id: "char_id_1",        // Unique internal ID (string, no spaces)
            name: "Character One",  // Name displayed on screen
            description: "Enter a compelling description for Character One here. Explain their background or starting situation.", // Text shown at bottom
            picture: "Picture_Char1", // Filename in img/pictures/ (without extension)

            // --- Player Appearance ---
            characterName: "Actor1_Spritesheet", // Filename in img/characters/ (without extension)
            characterIndex: 0,       // Index on the spritesheet (0-7)

            // --- Starting Setup ---
            startingMap: 2,          // Map ID to transfer to after selection
            startingX: 10,           // Starting X coordinate on the map
            startingY: 10            // Starting Y coordinate on the map
            // Note: Assumes Actor ID 1 corresponds to this character
        },
        {
            id: "char_id_2",
            name: "Character Two",
            description: "Description for Character Two. Make it unique!",
            picture: "Picture_Char2",
            characterName: "Actor2_Spritesheet",
            characterIndex: 0, // Could be same sheet, different index, or different sheet
            startingMap: 2,
            startingX: 12,
            startingY: 10
            // Note: Assumes Actor ID 2 corresponds to this character
        },
        {
            id: "char_id_3",
            name: "Character Three",
            description: "Placeholder description for the third character choice.",
            picture: "Picture_Char3",
            characterName: "Actor3_Spritesheet",
            characterIndex: 0,
            startingMap: 2,
            startingX: 14,
            startingY: 10
            // Note: Assumes Actor ID 3 corresponds to this character
        },
        {
            id: "char_id_4",
            name: "Character Four",
            description: "The final character option's description goes here.",
            picture: "Picture_Char4",
            characterName: "Actor4_Spritesheet",
            characterIndex: 0,
            startingMap: 2,
            startingX: 16,
            startingY: 10
            // Note: Assumes Actor ID 4 corresponds to this character
        }
        // Add more character objects here if needed, following the same structure.
        // Make sure the number matches the layout logic (currently assumes 4).
    ];
    // --- End Configuration Section ---


    const pluginName = "CharacterSelect"; // Use a const for the plugin name

    // Register plugin command
    PluginManager.registerCommand(pluginName, "Open", function() {
        SceneManager.push(Scene_CharacterSelect);
    });

    // Add Scene_Title modification to potentially jump to character select on New Game
    const _Scene_Title_commandNewGame = Scene_Title.prototype.commandNewGame;
    Scene_Title.prototype.commandNewGame = function() {
        // Check if selection is already done (using Switch #1 as a flag)
        DataManager.setupNewGame(); // Setup must happen before checking switches/vars
        if ($gameSwitches.value(1)) {
            // Switch 1 is ON, skip selection, go to map (original behavior after setup)
             this.fadeOutAll(); // Fade out title screen
             SceneManager.goto(Scene_Map);
        } else {
            // Switch 1 is OFF, go to character selection instead of map
            this.fadeOutAll(); // Fade out title screen
            SceneManager.push(Scene_CharacterSelect); // Use push to potentially go back
        }

    };

    //=========================================================================
    // Scene_CharacterSelect
    // The actual character selection scene
    //=========================================================================
    function Scene_CharacterSelect() {
        this.initialize(...arguments);
    }

    Scene_CharacterSelect.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_CharacterSelect.prototype.constructor = Scene_CharacterSelect;

    Scene_CharacterSelect.prototype.initialize = function() {
        Scene_MenuBase.prototype.initialize.call(this);
        this._selectedIndex = 0; // Start with the first character selected
        this._selectionMade = false; // Flag to prevent multi-selection issues
    };

    Scene_CharacterSelect.prototype.create = function() {
        Scene_MenuBase.prototype.create.call(this);
        this.createBackground(); // Dimmed background
        this.createTitle();      // "Choose Your Character" text
        this.createCharacterSprites(); // Character pictures/portraits
        this.createDescriptionWindow(); // Window for description text
        this.createSelectionIndicator(); // Visual cue for selected character
    };

    Scene_CharacterSelect.prototype.createBackground = function() {
        // Use a title screen image or a custom one
        this._backgroundSprite = new Sprite();
        this._backgroundSprite.bitmap = ImageManager.loadTitle1("fog"); // <<< CONFIG: Change 'fog' if needed
        this._backgroundSprite.opacity = 128; // Make it somewhat transparent
        this.addChild(this._backgroundSprite);

        // Dark overlay for better text visibility and mood
        this._overlaySprite = new Sprite(new Bitmap(Graphics.width, Graphics.height));
        this._overlaySprite.bitmap.fillRect(0, 0, Graphics.width, Graphics.height, "rgba(0, 0, 0, 0.7)");
        this.addChild(this._overlaySprite);
    };

    Scene_CharacterSelect.prototype.createTitle = function() {
        // Simple window for the title text
        const titleY = 20;
        const titleHeight = 72;
        this._titleWindow = new Window_Base(new Rectangle(0, titleY, Graphics.width, titleHeight));
        this._titleWindow.opacity = 0; // Make window frame invisible
        this._titleWindow.contents.fontSize = 36; // Adjust font size if needed
        this._titleWindow.drawText("Choose Your Character", 0, 0, Graphics.width, "center");
        this.addChild(this._titleWindow);
    };

    Scene_CharacterSelect.prototype.createCharacterSprites = function() {
        // Calculate layout (assuming 4 characters horizontally)
        const numChars = CHARACTERS.length; // Use the actual number of characters defined
        const windowWidth = Graphics.width / numChars;
        const windowHeight = Graphics.height - 200; // Adjust height as needed
        const windowY = 100; // Adjust vertical position as needed

        this._characterSprites = []; // Array to hold the character sprite objects

        for (let i = 0; i < numChars; i++) {
            const windowX = i * windowWidth;
            const sprite = new Sprite_CharacterChoice(
                new Rectangle(windowX, windowY, windowWidth, windowHeight),
                CHARACTERS[i] // Pass the character data object
            );
            this.addChild(sprite);
            this._characterSprites.push(sprite);
        }
    };

    Scene_CharacterSelect.prototype.createDescriptionWindow = function() {
        const descY = Graphics.height - 100; // Position near the bottom
        const descHeight = 100;
        this._descriptionWindow = new Window_Base(new Rectangle(0, descY, Graphics.width, descHeight));
        this._descriptionWindow.opacity = 192; // Semi-transparent background
        this.addChild(this._descriptionWindow);
        this.refreshDescription(); // Initial population of text
    };

    Scene_CharacterSelect.prototype.createSelectionIndicator = function() {
        // Simple underline/highlight for the selected character
        const numChars = CHARACTERS.length;
        const indicatorWidth = Graphics.width / numChars;
        this._selectionSprite = new Sprite(new Bitmap(indicatorWidth, 4)); // 4px high line
        this._selectionSprite.bitmap.fillRect(0, 0, indicatorWidth, 4, "#ffffff"); // White color
        this._selectionSprite.y = 96; // Position just below the title
        this._selectionSprite.opacity = 200;
        this.addChild(this._selectionSprite);
        this.updateSelectionIndicatorPosition(); // Set initial position
    };

    Scene_CharacterSelect.prototype.update = function() {
        Scene_MenuBase.prototype.update.call(this); // Handle basic scene updates

        if (!this._selectionMade) { // Only process input if a choice hasn't been locked in
            this.updateInputHandling();
            this.updateHoverHandling(); // Mouse hover detection
        }
        // Note: Removed the fade timer logic as direct transfer is handled differently now
    };

    Scene_CharacterSelect.prototype.updateInputHandling = function() {
        if (Input.isRepeated('left')) { // Use isRepeated for smoother cycling
            this.selectPreviousCharacter();
        } else if (Input.isRepeated('right')) {
            this.selectNextCharacter();
        } else if (Input.isTriggered('ok')) {
            this.confirmSelection();
        } else if (Input.isTriggered('cancel')) {
            SoundManager.playCancel();
            // Decide what cancel does - go back to title?
            SceneManager.goto(Scene_Title);
        }
    };

    Scene_CharacterSelect.prototype.selectPreviousCharacter = function() {
        const numChars = CHARACTERS.length;
        this._selectedIndex = (this._selectedIndex + numChars - 1) % numChars;
        this.onSelectionChange();
    };

    Scene_CharacterSelect.prototype.selectNextCharacter = function() {
        const numChars = CHARACTERS.length;
        this._selectedIndex = (this._selectedIndex + 1) % numChars;
        this.onSelectionChange();
    };

    Scene_CharacterSelect.prototype.onSelectionChange = function() {
        this.updateSelectionIndicatorPosition();
        this.refreshDescription();
        SoundManager.playCursor();
    };

    Scene_CharacterSelect.prototype.updateHoverHandling = function() {
        // Check if mouse is over any character sprite area
        for (let i = 0; i < this._characterSprites.length; i++) {
            if (this._characterSprites[i].isBeingTouched()) {
                if (this._selectedIndex !== i) {
                    // Mouse is hovering over a *different* character
                    this._selectedIndex = i;
                    this.onSelectionChange(); // Update visuals and sound
                }
                if (TouchInput.isTriggered()) {
                    // Clicked on the character
                    this.confirmSelection();
                }
                break; // Stop checking once a hover/click is found
            }
        }
    };

    Scene_CharacterSelect.prototype.updateSelectionIndicatorPosition = function() {
        const numChars = CHARACTERS.length;
        const indicatorWidth = Graphics.width / numChars;
        this._selectionSprite.x = this._selectedIndex * indicatorWidth;
    };

    Scene_CharacterSelect.prototype.refreshDescription = function() {
        const character = CHARACTERS[this._selectedIndex];
        const window = this._descriptionWindow;
        window.contents.clear();

        // Draw Name (centered)
        window.changeTextColor(ColorManager.systemColor()); // Use system color for name
        window.drawText(character.name, 0, 0, window.contentsWidth(), "center");
        window.resetTextColor(); // Back to default color

        // Draw Description (using text codes)
        const descriptionY = 32; // Line height approx
        this.drawTextEx(character.description, window.padding, descriptionY);
    };

    // Helper to use drawTextEx within the description window context
    Scene_CharacterSelect.prototype.drawTextEx = function(text, x, y) {
        this.resetFontSettings(); // Ensure default font settings
        const textState = this.createTextState(text, x, y, this._descriptionWindow.contentsWidth() - x * 2);
        this.processAllText(textState);
        return textState.outputWidth;
    };


    Scene_CharacterSelect.prototype.confirmSelection = function() {
        if (this._selectionMade) return; // Already selected
        this._selectionMade = true; // Lock selection

        const character = CHARACTERS[this._selectedIndex];
        SoundManager.playOk();

        // --- Apply Character Choice ---

        // 1. Store selected character info (optional but useful)
        $gameVariables.setValue(1, character.id);   // Store unique ID in Var 1
        $gameVariables.setValue(2, character.name); // Store name in Var 2

        // 2. Set the flag Switch (important for skipping selection later)
        $gameSwitches.setValue(1, true); // Set Switch 1 ON

        // 3. Setup the player party and appearance
        this.setupPlayerParty(character);

        // 4. Prepare transfer to the starting map
        $gamePlayer.reserveTransfer(
            character.startingMap,
            character.startingX,
            character.startingY,
            2, // Default direction (2=down, 4=left, 6=right, 8=up)
            0  // No fade type (we handle fade manually)
        );

        // 5. Fade out this scene and go to the map
        this.fadeOutAll(); // Fade scene graphics
        SceneManager.goto(Scene_Map); // Transition to map scene
    };

    Scene_CharacterSelect.prototype.setupPlayerParty = function(character) {
        // Assumes Actor ID corresponds to index+1 (Actor 1 for CHARACTERS[0], etc.)
        const actorId = this._selectedIndex + 1;

        // Clear the party and add the chosen actor
        $gameParty.setupStartingMembers(); // Resets party based on database defaults
        
        // Ensure the selected actor is the leader (remove others if necessary)
        $gameParty.removeActor(1); // Remove default actor if different
        if (!$gameParty.members().includes($gameActors.actor(actorId))) {
             $gameParty.addActor(actorId);
        }
        // If actor 1 was the selected one, it might have been removed and needs re-adding
        // Simplified: Just ensure the selected one is the ONLY one for now
        $gameParty.allMembers().forEach(actor => {
            if(actor.actorId() !== actorId) {
                $gameParty.removeActor(actor.actorId());
            }
        });
        if ($gameParty.members().length === 0) { // Safety check if remove logic failed
             $gameParty.addActor(actorId);
        }


        // Set player's map sprite
        $gamePlayer.setImage(character.characterName, character.characterIndex);
        $gamePlayer.refresh(); // Apply the image change
        $gameParty.setupStartingMembers(); // This might re-add actor 1, handle this?
    };
    
    // Method to properly setup party *after* database is loaded
    const _DataManager_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function() {
        _DataManager_setupNewGame.call(this);
        // If starting via title screen and going to char select,
        // don't setup the default party yet. Let char select handle it.
        if (!SceneManager.isNextScene(Scene_CharacterSelect)) {
             $gameParty.setupStartingMembers();
        } else {
            // Clear default party if going straight to char select
             $gameParty.allMembers().forEach(actor => $gameParty.removeActor(actor.actorId()));
        }
    };

    //=========================================================================
    // Sprite_CharacterChoice
    // Clickable sprite displaying the character's picture
    //=========================================================================
    function Sprite_CharacterChoice() {
        this.initialize(...arguments);
    }

    Sprite_CharacterChoice.prototype = Object.create(Sprite_Clickable.prototype); // Inherit from Clickable
    Sprite_CharacterChoice.prototype.constructor = Sprite_CharacterChoice;

    Sprite_CharacterChoice.prototype.initialize = function(rect, character) {
        Sprite_Clickable.prototype.initialize.call(this); // Init clickable features
        this._rect = rect; // Store the layout rectangle
        this._character = character; // Store associated character data
        this.move(rect.x, rect.y); // Set sprite position
        this.createPicture(); // Load and add the character image
    };

    Sprite_CharacterChoice.prototype.createPicture = function() {
        this._pictureSprite = new Sprite();
        // Load picture from img/pictures/ using the configured filename
        this._pictureSprite.bitmap = ImageManager.loadPicture(this._character.picture);
        // Center the picture within the allocated rectangle area
        this._pictureSprite.x = this._rect.width / 2;
        this._pictureSprite.y = this._rect.height / 2;
        this._pictureSprite.anchor.x = 0.5; // Anchor at center
        this._pictureSprite.anchor.y = 0.5; // Anchor at center
        this.addChild(this._pictureSprite); // Add picture to this sprite container
    };

    // Required for Sprite_Clickable: Define the hit area
    Sprite_CharacterChoice.prototype.update = function() {
        Sprite_Clickable.prototype.update.call(this);
        // Optional: Add hover effects here if desired (e.g., change scale, opacity)
        // Example: this.opacity = this.isBeingTouched() ? 255 : 200;
    };

    // Define hit area (the whole rectangle)
    Sprite_CharacterChoice.prototype.hitTest = function(x, y) {
        const rect = this._rect;
        return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
    };
    
    // Method to check if mouse/touch is within bounds
    Sprite_CharacterChoice.prototype.isBeingTouched = function() {
        const touchX = TouchInput.x;
        const touchY = TouchInput.y;
        // Need to check against the sprite's *global* position
        const canvasX = this.worldTransform.tx;
        const canvasY = this.worldTransform.ty;
        return touchX >= canvasX && touchY >= canvasY &&
               touchX < canvasX + this._rect.width && touchY < canvasY + this._rect.height;
    };


    //=========================================================================
    // Scene_Map Integration
    // Ensure fade-in happens correctly after transfer from character select
    //=========================================================================
    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        // If the previous scene was character select, perform a fade in
        if (SceneManager.isPreviousScene(Scene_CharacterSelect)) {
            this.startFadeIn(this.fadeSpeed(), false);
        }
    };

    // Expose the scene class globally if needed for debugging or extensions
    window.Scene_CharacterSelect = Scene_CharacterSelect;

})(); // End of IIFE