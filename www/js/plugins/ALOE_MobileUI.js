/*:
* @plugindesc v1.4.0 Creates buttons on the screen for touch input
* @author Aloe Guvner
* Terms of Use:
* Free for use in commercial or non-commercial projects.
* Credits required to: Aloe Guvner */
(function () {
    let needShowButton = false;
    let Parameters = {
        "dPadSettings": {
            "image": "d_pad",
            "activeScenes": [],
            "x": 0,
            "y": "Graphics.boxHeight - 250",
            "soundEffect": ""
        },
        "keyButtonSettings": [{
            "name": "ok",
            "inputMethod": 0,
            "inputTrigger": "ok",
            "image": "a_button",
            "activeScenes": "",
            "x": "Graphics.boxWidth - 135",
            "y": "Graphics.boxHeight - 268",
            "soundEffect": "",
            "customCode": "",
            "vibratePattern": 0
        },{
            "name": "escape",
            "inputMethod": 0,
            "inputTrigger": "escape",
            "image": "b_button",
            "activeScenes": ["Scene_Map", "Scene_Menu", "Scene_Options", "Scene_Battle", "Scene_Item", "Scene_Skill", "Scene_Equip", "Scene_File", "Scene_Save", "Scene_Load", "Scene_GameEnd", "Scene_Shop", "Scene_Name", "Scene_Gameover"],
            "x": "Graphics.boxWidth - 255",
            "y": "Graphics.boxHeight - 145",
            "soundEffect": "",
            "customCode": "",
            "vibratePattern": 0
        }],
        "controlButtonSettings": {
            "image": "circle_button",
            "activeScenes": "",
            "x": 0,
            "y": "Graphics.boxHeight - 300",
            "soundEffect": "",
            "buttonsToHide": [],
            "hideDPad": true
        },
        "fadeDuration": 24,
        "disableTouchWindows": [],
        "disableTouchMovement": true,
        "enableDiagonalInput": false
    };
    ImageManager.loadMobileUI = function (filename, hue) {
        return this.loadBitmap("img/mobileUI/", filename, hue, true)
    };
    ImageManager.reserveMobileUI = function (filename, hue, reservationId) {
        return this.reserveBitmap("img/mobileUI/", filename, hue, true, reservationId)
    };

    function Sprite_Button() {
        this.initialize.apply(this, arguments)
    }

    Sprite_Button.prototype = Object.create(Sprite_Base.prototype);
    Sprite_Button.prototype.constructor = Sprite_Button;
    Sprite_Button.prototype.initialize = function (x, y,
                                                   normalImage, soundEffect, vibratePattern) {
        Sprite_Base.prototype.initialize.call(this);
        if (normalImage) {
            this.bitmap = ImageManager.loadMobileUI(normalImage);
            if (normalImage === "touch_ok") {
                this.bitmapTouch = ImageManager.loadMobileUI("choice_disable");
                this.tmpBitmap = this.bitmap
            }
        }
        if (soundEffect) this._soundEffect = soundEffect;
        if (vibratePattern) if (!window.navigator.vibrate) this._vibratePattern = 0; else if (typeof vibratePattern === "number") this._vibratePattern = vibratePattern; else this._vibratePattern = vibratePattern.split(",").map(function (num) {
            return parseInt(num)
        });
        if (isNaN(x)) x = eval(x || "0") || 0;
        if (isNaN(y)) y = eval(y || "0") || 0;
        this.move(x, y);
        this._start = new Point(null, null);
        this._distance = new Point(null, null);
        this._destination = new Point(null, null);
        this._velocity = new Point(null, null);
        this._origin = new Point(x, y);
        this._hiding = false;
        this._duration = Parameters["fadeDuration"];
        this.active = true;
        this.z = 8;
        this._touching = false;
        this._coldFrame = null;
        this._hotFrame = null;
        this._clickHandler = null
    };
    Sprite_Button.prototype.update = function () {
        Sprite_Base.prototype.update.call(this);
        if (!!this.bitmapTouch) if (QMovement.moveOnClick) this.bitmap = this.tmpBitmap; else this.bitmap = this.bitmapTouch;
        if (this.active) this.updateTouchInput();
        if (this.moving) this.updatePosition();
        if (!this.active) this.updateActive();
        this.updateFrame();
        this.processTouch()
    };
    Sprite_Button.prototype.updateFrame = function () {
        let frame;
        if (this._touching) frame = this._hotFrame; else frame = this._coldFrame;
        if (frame) this.setFrame(frame.x, frame.y, frame.width, frame.height)
    };
    Sprite_Button.prototype.setColdFrame = function (x, y, width,
                                                     height) {
        this._coldFrame = new Rectangle(x, y, width, height)
    };
    Sprite_Button.prototype.setHotFrame = function (x, y, width, height) {
        this._hotFrame = new Rectangle(x, y, width, height)
    };
    Sprite_Button.prototype.setClickHandler = function (method) {
        this._clickHandler = method
    };
    Sprite_Button.prototype.callClickHandler = function () {
        if (this._clickHandler) this._clickHandler()
    };
    Sprite_Button.prototype.isActive = function () {
        var node = this;
        while (node) {
            if (!node.visible) return false;
            node = node.parent
        }
        return true
    };
    Sprite_Button.prototype.processTouch =
        function () {
            if (this.isActive()) {
                if (TouchInput.isTriggered() && this.isButtonTouched()) this._touching = true;
                if (this._touching) if (TouchInput.isReleased() || !this.isButtonTouched()) {
                    this._touching = false;
                    if (TouchInput.isReleased()) this.callClickHandler()
                }
            } else this._touching = false
        };
    Sprite_Button.prototype.updateTouchInput = function () {
    };
    Sprite_Button.prototype.isButtonTouched = function () {
        var x = this.canvasToLocalX(TouchInput.x);
        var y = this.canvasToLocalY(TouchInput.y);
        return x >= 0 && y >= 0 && x < this.width && y < this.height
    };
    Sprite_Button.prototype.canvasToLocalX = function (x) {
        var node = this;
        while (node) {
            x -= node.x;
            node = node.parent
        }
        return x
    };
    Sprite_Button.prototype.canvasToLocalY = function (y) {
        var node = this;
        while (node) {
            y -= node.y;
            node = node.parent
        }
        return y
    };
    Sprite_Button.prototype.updateVisibility = function () {
        if (this._hiding && this.opacity > 0) this.opacity -= 255 / this._duration; else if (!this._hiding && this.opacity < 255) this.opacity += 255 / this._duration
    };
    Sprite_Button.prototype.updateActive = function () {
        if (this.opacity === 255) this.active =
            true
    };
    Sprite_Button.prototype.updatePosition = function () {
        this.x += this._velocity.x;
        this.y += this._velocity.y;
        var currentPos = new Point(this.x, this.y);
        var currentDistance = this.absDistance(this._start, currentPos);
        if (currentDistance >= this._distance.abs) {
            this.x = this._destination.x;
            this.y = this._destination.y;
            this._velocity.x = 0;
            this._velocity.y = 0;
            this.moving = false
        }
    };
    Sprite_Button.prototype.hide = function () {
        this._hiding = true;
        this.active = false
    };
    Sprite_Button.prototype.show = function () {
        this._hiding = false
    };
    Sprite_Button.prototype.hideInstant =
        function () {
            this._hiding = true;
            this.opacity = 0;
            this.active = false
        };
    Sprite_Button.prototype.showInstant = function () {
        this._hiding = false;
        this.opacity = 255;
        this.active = true
    };
    Sprite_Button.prototype.collapse = function (x, y) {
        this._destination.x = x;
        this._destination.y = y;
        this._start.x = this.x;
        this._start.y = this.y;
        this._distance.x = this._destination.x - this._start.x;
        this._distance.y = this._destination.y - this._start.y;
        this._distance.abs = this.absDistance(this._destination, this._start);
        this._velocity.x = this._distance.x / this._duration;
        this._velocity.y = this._distance.y / this._duration;
        this.moving = true
    };
    Sprite_Button.prototype.expand = function () {
        this._destination.x = this._origin.x;
        this._destination.y = this._origin.y;
        this._start.x = this.x;
        this._start.y = this.y;
        this._distance.x = this._destination.x - this._start.x;
        this._distance.y = this._destination.y - this._start.y;
        this._distance.abs = this.absDistance(this._destination, this._start);
        this._velocity.x = this._distance.x / this._duration;
        this._velocity.y = this._distance.y / this._duration;
        this.moving = true
    };
    Sprite_Button.prototype.absDistance = function (pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))
    };

    function Sprite_DirectionalPad() {
        this.initialize.apply(this, arguments)
    }

    Sprite_DirectionalPad.prototype = Object.create(Sprite_Button.prototype);
    Sprite_DirectionalPad.prototype.constructor = Sprite_DirectionalPad;
    Sprite_DirectionalPad.prototype.initialize = function (x, y, image, soundEffect) {
        Sprite_Button.prototype.initialize.call(this, x, y, image, soundEffect);
        this._lastInput = "";
        this.z =
            8;
        this._hiding = false
    };
    Sprite_DirectionalPad.prototype.updateTouchInput = function () {
        this.clearLastDirection();
        if (TouchInput.isPressed()) {
            const point = new Point(TouchInput.x, TouchInput.y);
            if (this.containsPoint(point)) {
                if (this._soundEffect) AudioManager.playSe(this._soundEffect);
                const index = this.whichIndex(point);
                switch (index) {
                    case 0:
                        if (Parameters.enableDiagonalInput) {
                            Input._currentState["up"] = true;
                            Input._currentState["left"] = true;
                            this._lastInput = "up-left"
                        }
                        break;
                    case 1:
                        Input._currentState["up"] = true;
                        this._lastInput =
                            "up";
                        break;
                    case 2:
                        if (Parameters.enableDiagonalInput) {
                            Input._currentState["right"] = true;
                            Input._currentState["up"] = true;
                            this._lastInput = "up-right"
                        }
                        break;
                    case 3:
                        Input._currentState["left"] = true;
                        this._lastInput = "left";
                        break;
                    case 4:
                        break;
                    case 5:
                        Input._currentState["right"] = true;
                        this._lastInput = "right";
                        break;
                    case 6:
                        if (Parameters.enableDiagonalInput) {
                            Input._currentState["left"] = true;
                            Input._currentState["down"] = true;
                            this._lastInput = "down-left"
                        }
                        break;
                    case 7:
                        Input._currentState["down"] = true;
                        this._lastInput =
                            "down";
                        break;
                    case 8:
                        if (Parameters.enableDiagonalInput) {
                            Input._currentState["down"] = true;
                            Input._currentState["right"] = true;
                            this._lastInput = "down-right"
                        }
                        break;
                    default:
                        break
                }
            }
        }
    };
    Sprite_DirectionalPad.prototype.whichIndex = function (point) {
        let index = 0;
        index += point.x - this.x > this.width / 3 ? point.x - this.x > this.width * 2 / 3 ? 2 : 1 : 0;
        index += point.y - this.y > this.height / 3 ? point.y - this.y > this.height * 2 / 3 ? 6 : 3 : 0;
        return index
    };
    Sprite_DirectionalPad.prototype.clearLastDirection = function () {
        if (this._lastInput) {
            this._lastInput.split("-").forEach((a) =>
                Input._currentState[a] = false);
            this._lastInput = ""
        }
    };

    function Sprite_KeyButton() {
        this.initialize.apply(this, arguments)
    }

    Sprite_KeyButton.prototype = Object.create(Sprite_Button.prototype);
    Sprite_KeyButton.prototype.constructor = Sprite_KeyButton;
    Sprite_KeyButton.prototype.initialize = function (x, y, image, soundEffect, inputTrigger, customCode, vibratePattern) {
        const inputMethod = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 0;
        Sprite_Button.prototype.initialize.call(this, x, y, image, soundEffect, vibratePattern);
        if (inputTrigger) this._inputTrigger = inputTrigger;
        this._inputMethod = inputMethod
    };
    Sprite_KeyButton.prototype.isTouchTriggered = function () {
        switch (this._inputMethod) {
            case 0:
                return TouchInput.isTriggered();
            case 1:
                return TouchInput.isPressed();
            case 2:
                return TouchInput.isRepeated();
            case 3:
                return TouchInput.isLongPressed();
            case 4:
                return TouchInput.isReleased();
            default:
                return TouchInput.isTriggered()
        }
    };
    Sprite_KeyButton.prototype.updateTouchInput = function () {
        if (this.isTouchTriggered()) {
            var point = new Point(TouchInput.x,
                TouchInput.y);
            if (this.containsPoint(point)) {
                if (this._soundEffect) AudioManager.playSe(this._soundEffect);
                if (this._vibratePattern) window.navigator.vibrate(this._vibratePattern);
                if (this._inputTrigger) Input._currentState[this._inputTrigger] = true
            } else Input._currentState[this._inputTrigger] = false
        } else Input._currentState[this._inputTrigger] = false
    };

    function Sprite_ControlButton() {
        this.initialize.apply(this, arguments)
    }

    Sprite_ControlButton.prototype = Object.create(Sprite_Button.prototype);
    Sprite_ControlButton.prototype.constructor =
        Sprite_ControlButton;
    Sprite_ControlButton.prototype.initialize = function (x, y, image, soundEffect) {
        Sprite_Button.prototype.initialize.call(this, x, y, image, soundEffect);
        this._inputTrigger = "control";
        this._buttonsHidden = false
    };
    Sprite_ControlButton.prototype.updateTouchInput = function () {
        if (TouchInput.isTriggered()) {
            const {x, y} = TouchInput;
            const point = new Point(x, y);
            if (this.containsPoint(point)) {
                if (this._soundEffect) AudioManager.playSe(this._soundEffect);
                if (this._buttonsHidden) this.showAllButtons(); else this.hideAllButtons()
            }
        }
    };
    Sprite_ControlButton.prototype.showAllButtons = function () {
        if (!needShowButton) return;
        const params = Parameters["controlButtonSettings"];
        if (params.buttonsToHide.length > 0) params.buttonsToHide.forEach((buttonName) => {
            if (!this._keyButtons[buttonName]) return;
            this._keyButtons[buttonName].show();
            this._keyButtons[buttonName].expand()
        }); else Object.values(this._keyButtons).forEach((button) => {
            button.show();
            button.expand()
        });
        if (params.hideDPad && this._directionalPad) {
            this._directionalPad.show();
            this._directionalPad.expand()
        }
        this._buttonsHidden =
            false
    };
    Sprite_ControlButton.prototype.hideAllButtons = function () {
        const params = Parameters["controlButtonSettings"];
        if (params.buttonsToHide.length > 0) params.buttonsToHide.forEach((buttonName) => {
            if (!this._keyButtons[buttonName]) return;
            this._keyButtons[buttonName].hide();
            this._keyButtons[buttonName].collapse(this.x, this.y)
        }); else Object.values(this._keyButtons).forEach((button) => {
            button.hide();
            button.collapse(this.x, this.y)
        });
        if (params.hideDPad && this._directionalPad) {
            this._directionalPad.hide();
            this._directionalPad.collapse(this.x,
                this.y)
        }
        this._buttonsHidden = true
    };
    const clearFindPath = () => {
        $gamePlayer._isPathfinding = false;
        $gameTemp.clearDestination();
        $gamePlayer.clearPathfind()
    };
    const callBattle = () => {
        if (!$gameMessage.isBusy()) {
            $gameTemp.clearCommonEvent();
            $gameTemp.reserveCommonEvent(3)
        }
    };
    const callShop = () => {
        if (!$gameMessage.isBusy()) {
            $gameTemp.clearCommonEvent();
            $gameTemp.reserveCommonEvent(2)
        }
    };
    const callGift = () => {
        $gameMessage.isBusy() || ($gameTemp.clearCommonEvent(), $gameTemp.reserveCommonEvent(13))
    };
    const updateMove = () => {
            QMovement.moveOnClick = !QMovement.moveOnClick;
            if (QMovement.moveOnClick) {
                needShowButton = false;
                SceneManager._scene._spriteset._controlButton.hideAllButtons()
            } else {
                needShowButton = true;
                SceneManager._scene._spriteset._controlButton.showAllButtons()
            }
            clearFindPath();
            return 1
        };
    const callMenu = () => {
        if (!$gameMessage.isBusy() || !$gamePlayer.isMoving()){
            SoundManager.playOk();
            SceneManager.push(Scene_Menu);
            Window_MenuCommand.initCommandPosition();
            $gameTemp.clearDestination();
        }
    };

    const oldSprite_update = Spriteset_Base.prototype.update;
    Spriteset_Base.prototype.update = function () {
        oldSprite_update.call(this);
        if (!this.sp_createbutton) {
            this.createDirPad();
            this.createKeyButtons();
            this.createControlButton();
            if (SceneManager.isScene()) {
                if (QMovement.moveOnClick &&
                    !needShowButton) this._controlButton.hideAllButtons();
                if (!this._keyFeatures) this._keyFeatures = {};
                let key = "shopping";
                this._keyFeatures[key] = new Sprite_Button(0, 60, key);
                this._keyFeatures[key].setClickHandler(callShop.bind(this));
                this.addChild(this._keyFeatures[key]);
                key = "battle";
                this._keyFeatures[key] = new Sprite_Button(0, 120, key);
                this._keyFeatures[key].setClickHandler(callBattle.bind(this));
                this.addChild(this._keyFeatures[key]);
                if (window.game_outschool.hasInternet()) {
                    key = "gift";
                    this._keyFeatures[key] =
                        new Sprite_Button(0, 180, key);
                    this._keyFeatures[key].setClickHandler(callGift.bind(this));
                    this.addChild(this._keyFeatures[key])
                }
                key = "touch_ok";
                this._keyFeatures[key] = new Sprite_Button(Graphics.boxWidth - 100, 120, key);
                this._keyFeatures[key].setClickHandler(updateMove.bind(this));
                this.addChild(this._keyFeatures[key]);
                key = 'escape';
                this._keyFeatures[key] = new Sprite_Button(Graphics.boxWidth - 255, Graphics.boxHeight - 145, 'b_button');
                this._keyFeatures[key].setClickHandler(callMenu.bind(this));
                this.addChild(this._keyFeatures[key]);
            }
            this.sp_createbutton = true
        }
    };
    const Scene_MenuBase_Create = Scene_MenuBase.prototype.create;
    Scene_MenuBase.prototype.create = function () {
        Scene_MenuBase_Create.call(this);
        this._spButtonTemp = new Sprite;
        this._spButtonTemp.x = 0;
        this._spButtonTemp.y = 0;
        this._spButtonTemp.z = 8;
        this._spButtonTemp.createDirPad();
        this._spButtonTemp.createKeyButtons();
        this._spButtonTemp.createControlButton();
        this.addChild(this._spButtonTemp)
    };
    SceneManager.snap = function () {
        if (this._scene) {
            if (this._scene instanceof Scene_Map) {
                let sp = this._scene._spriteset;
                sp.removeChild(sp._directionalPad);
                sp.removeChild(sp._controlButton);
                if(sp._keyFeatures){
                    for(let k of Object.values(sp._keyFeatures)){
                        if(k){
                            sp.removeChild(k);
                        }
                    }
                }
                for (let key of Object.values(sp._keyButtons)) if (key) sp.removeChild(key)
            }
            return Bitmap.snap(this._scene)
        }
    };
    Sprite.prototype.createDirPad = function () {
        const params = Parameters["dPadSettings"];
        if (params) {
            let x = params.x;
            let y = params.y;
            let image = params.image || "";
            let soundEffect = params.soundEffect;
            this._directionalPad = new Sprite_DirectionalPad(x, y, image, soundEffect);
            this.addChild(this._directionalPad)
        }
    };
    Sprite.prototype.createKeyButtons = function () {
        let params = Parameters["keyButtonSettings"];
        if (params) if (params.length > 0) {
            this._keyButtons = {};
            for (let i = 0; i < params.length; i++) {
                let a = params[i];
                this._keyButtons[a.name.toLowerCase()] =
                    new Sprite_KeyButton(a.x, a.y, a.image, a.soundEffect, a.inputTrigger.toLowerCase(), a.customCode, a.vibratePattern, a.inputMethod);
                this.addChild(this._keyButtons[a.name.toLowerCase()])
            }
        }
    };
    Sprite.prototype.createControlButton = function () {
        let params = Parameters["controlButtonSettings"];
        if (params) {
            let x = params.x;
            let y = params.y;
            let image = params.image || "";
            let soundEffect = params.soundEffect;
            this._controlButton = new Sprite_ControlButton(x, y, image, soundEffect);
            this.addChild(this._controlButton);
            this._controlButton._keyButtons =
                this._keyButtons;
            this._controlButton._directionalPad = this._directionalPad
        }
    };
    UHPD_Sprite.prototype.createDirPad = function () {
        return Sprite.prototype.createDirPad.call(this)
    };
    UHPD_Sprite.prototype.createKeyButtons = function () {
        return Sprite.prototype.createKeyButtons.call(this)
    };
    UHPD_Sprite.prototype.createControlButton = function () {
        return Sprite.prototype.createControlButton.call(this)
    };
    const oldMap_isReady = Scene_Map.prototype.isReady;
    Scene_Map.prototype.isReady = function () {
        clearFindPath();
        TouchInput.clear();
        return oldMap_isReady.call(this)
    };
    const Scene_Map_processMapTouch = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function () {
        if (TouchInput.isTriggered()) {
            const {x, y} = TouchInput;
            const point = new Point(x, y);
            if (this._controlButton) {
                if (this._controlButton.containsPoint(point)) {
                    clearFindPath();
                    return
                }
            } else if (this._directionalPad) {
                if (this._directionalPad.active && this._directionalPad.containsPoint(point)) {
                    clearFindPath();
                    return
                }
            } else if (this._keyButtons) if (Object.keys(this._keyButtons).some((a) =>
                this._keyButtons[a].containsPoint(point))) {
                clearFindPath();
                return
            }
        }
        Scene_Map_processMapTouch.call(this)
    };
    Scene_Map.prototype.updateCallMenu = function () {
        this.menuCalling = false
    };
    window.Sprite_Button = Sprite_Button;
})();
