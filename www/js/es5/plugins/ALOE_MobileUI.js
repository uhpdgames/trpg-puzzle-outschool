var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.owns = function (b, c) {
    return Object.prototype.hasOwnProperty.call(b, c)
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function (b, c, f) {
    b != Array.prototype && b != Object.prototype && (b[c] = f.value)
};
$jscomp.getGlobal = function (b) {
    return "undefined" != typeof window && window === b ? b : "undefined" != typeof global && null != global ? global : b
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (b, c, f, d) {
    if (c) {
        f = $jscomp.global;
        b = b.split(".");
        for (d = 0; d < b.length - 1; d++) {
            var h = b[d];
            h in f || (f[h] = {});
            f = f[h]
        }
        b = b[b.length - 1];
        d = f[b];
        c = c(d);
        c != d && null != c && $jscomp.defineProperty(f, b, {configurable: !0, writable: !0, value: c})
    }
};
$jscomp.polyfill("Object.values", function (b) {
    return b ? b : function (b) {
        var c = [], d;
        for (d in b) $jscomp.owns(b, d) && c.push(b[d]);
        return c
    }
}, "es8", "es3");
Graphics.printLoadingError = function (b) {
};
Graphics.printError = function (b, c) {
};
(function () {
    function b() {
        this.initialize.apply(this, arguments)
    }

    function c() {
        this.initialize.apply(this, arguments)
    }

    function f() {
        this.initialize.apply(this, arguments)
    }

    function d() {
        this.initialize.apply(this, arguments)
    }
    QMovement.moveOnClick = true;
    let h = !1, g = {
        dPadSettings: {image: "d_pad", activeScenes: [], x: 0, y: "Graphics.boxHeight - 250", soundEffect: ""},
        keyButtonSettings: [{
            name: "ok",
            inputMethod: 0,
            inputTrigger: "ok",
            image: "a_button",
            activeScenes: "",
            x: "Graphics.boxWidth - 135",
            y: "Graphics.boxHeight - 268",
            soundEffect: "",
            customCode: "",
            vibratePattern: 0
        }, {
            name: "escape",
            inputMethod: 0,
            inputTrigger: "escape",
            image: "b_button",
            activeScenes: "Scene_Map Scene_Menu Scene_Options Scene_Battle Scene_Item Scene_Skill Scene_Equip Scene_File Scene_Save Scene_Load Scene_GameEnd Scene_Shop Scene_Name Scene_Gameover".split(" "),
            x: "Graphics.boxWidth - 255",
            y: "Graphics.boxHeight - 145",
            soundEffect: "",
            customCode: "",
            vibratePattern: 0
        }],
        controlButtonSettings: {
            image: "circle_button",
            activeScenes: "",
            x: 0,
            y: "Graphics.boxHeight - 300",
            soundEffect: "",
            buttonsToHide: [],
            hideDPad: !0
        },
        fadeDuration: 24,
        disableTouchWindows: [],
        disableTouchMovement: !0,
        enableDiagonalInput: !1
    };
    ImageManager.loadMobileUI = function (a, e) {
        return this.loadBitmap("img/mobileUI/", a, e, !0)
    };
    ImageManager.reserveMobileUI = function (a, e, b) {
        return this.reserveBitmap("img/mobileUI/", a, e, !0, b)
    };
    b.prototype = Object.create(Sprite_Base.prototype);
    b.prototype.constructor = b;
    b.prototype.initialize = function (a, e, b, c, d) {
        Sprite_Base.prototype.initialize.call(this);
        b && (this.bitmap = ImageManager.loadMobileUI(b), "touch_ok" ===
        b && (this.bitmapTouch = ImageManager.loadMobileUI("choice_disable"), this.tmpBitmap = this.bitmap));
        c && (this._soundEffect = c);
        d && (this._vibratePattern = window.navigator.vibrate ? "number" === typeof d ? d : d.split(",").map(function (a) {
            return parseInt(a)
        }) : 0);
        isNaN(a) && (a = eval(a || "0") || 0);
        isNaN(e) && (e = eval(e || "0") || 0);
        this.move(a, e);
        this._start = new Point(null, null);
        this._distance = new Point(null, null);
        this._destination = new Point(null, null);
        this._velocity = new Point(null, null);
        this._origin = new Point(a, e);
        this._hiding =
            !1;
        this._duration = g.fadeDuration;
        this.active = !0;
        this.z = 8;
        this._touching = !1;
        this._clickHandler = this._hotFrame = this._coldFrame = null
    };
    b.prototype.update = function () {
        Sprite_Base.prototype.update.call(this);
        this.bitmapTouch && (this.bitmap = QMovement.moveOnClick ? this.tmpBitmap : this.bitmapTouch);
        this.active && this.updateTouchInput();
        this.moving && this.updatePosition();
        this.active || this.updateActive();
        this.updateFrame();
        this.processTouch()
    };
    b.prototype.updateFrame = function () {
        let a;
        (a = this._touching ? this._hotFrame :
            this._coldFrame) && this.setFrame(a.x, a.y, a.width, a.height)
    };
    b.prototype.setColdFrame = function (a, e, b, c) {
        this._coldFrame = new Rectangle(a, e, b, c)
    };
    b.prototype.setHotFrame = function (a, e, b, c) {
        this._hotFrame = new Rectangle(a, e, b, c)
    };
    b.prototype.setClickHandler = function (a) {
        this._clickHandler = a
    };
    b.prototype.callClickHandler = function () {
        this._clickHandler && this._clickHandler()
    };
    b.prototype.isActive = function () {
        for (var a = this; a;) {
            if (!a.visible) return !1;
            a = a.parent
        }
        return !0
    };
    b.prototype.processTouch = function () {
        this.isActive() ?
            (TouchInput.isTriggered() && this.isButtonTouched() && (this._touching = !0), !this._touching || !TouchInput.isReleased() && this.isButtonTouched() || (this._touching = !1, TouchInput.isReleased() && this.callClickHandler())) : this._touching = !1
    };
    b.prototype.updateTouchInput = function () {
    };
    b.prototype.isButtonTouched = function () {
        var a = this.canvasToLocalX(TouchInput.x), b = this.canvasToLocalY(TouchInput.y);
        return 0 <= a && 0 <= b && a < this.width && b < this.height
    };
    b.prototype.canvasToLocalX = function (a) {
        for (var b = this; b;) a -= b.x, b = b.parent;
        return a
    };
    b.prototype.canvasToLocalY = function (a) {
        for (var b = this; b;) a -= b.y, b = b.parent;
        return a
    };
    b.prototype.updateVisibility = function () {
        this._hiding && 0 < this.opacity ? this.opacity -= 255 / this._duration : !this._hiding && 255 > this.opacity && (this.opacity += 255 / this._duration)
    };
    b.prototype.updateActive = function () {
        255 === this.opacity && (this.active = !0)
    };
    b.prototype.updatePosition = function () {
        this.x += this._velocity.x;
        this.y += this._velocity.y;
        var a = new Point(this.x, this.y);
        this.absDistance(this._start, a) >= this._distance.abs &&
        (this.x = this._destination.x, this.y = this._destination.y, this._velocity.x = 0, this._velocity.y = 0, this.moving = !1)
    };
    b.prototype.hide = function () {
        this._hiding = !0;
        this.active = !1
    };
    b.prototype.show = function () {
        this._hiding = !1
    };
    b.prototype.hideInstant = function () {
        this._hiding = !0;
        this.opacity = 0;
        this.active = !1
    };
    b.prototype.showInstant = function () {
        this._hiding = !1;
        this.opacity = 255;
        this.active = !0
    };
    b.prototype.collapse = function (a, b) {
        this._destination.x = a;
        this._destination.y = b;
        this._start.x = this.x;
        this._start.y = this.y;
        this._distance.x = this._destination.x - this._start.x;
        this._distance.y = this._destination.y - this._start.y;
        this._distance.abs = this.absDistance(this._destination, this._start);
        this._velocity.x = this._distance.x / this._duration;
        this._velocity.y = this._distance.y / this._duration;
        this.moving = !0
    };
    b.prototype.expand = function () {
        this._destination.x = this._origin.x;
        this._destination.y = this._origin.y;
        this._start.x = this.x;
        this._start.y = this.y;
        this._distance.x = this._destination.x - this._start.x;
        this._distance.y = this._destination.y -
            this._start.y;
        this._distance.abs = this.absDistance(this._destination, this._start);
        this._velocity.x = this._distance.x / this._duration;
        this._velocity.y = this._distance.y / this._duration;
        this.moving = !0
    };
    b.prototype.absDistance = function (a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
    };
    c.prototype = Object.create(b.prototype);
    c.prototype.constructor = c;
    c.prototype.initialize = function (a, e, c, d) {
        b.prototype.initialize.call(this, a, e, c, d);
        this._lastInput = "";
        this.z = 8;
        this._hiding = !1
    };
    c.prototype.updateTouchInput =
        function () {
            this.clearLastDirection();
            if (TouchInput.isPressed()) {
                const a = new Point(TouchInput.x, TouchInput.y);
                if (this.containsPoint(a)) switch (this._soundEffect && AudioManager.playSe(this._soundEffect), this.whichIndex(a)) {
                    case 0:
                        g.enableDiagonalInput && (Input._currentState.up = !0, Input._currentState.left = !0, this._lastInput = "up-left");
                        break;
                    case 1:
                        Input._currentState.up = !0;
                        this._lastInput = "up";
                        break;
                    case 2:
                        g.enableDiagonalInput && (Input._currentState.right = !0, Input._currentState.up = !0, this._lastInput = "up-right");
                        break;
                    case 3:
                        Input._currentState.left = !0;
                        this._lastInput = "left";
                        break;
                    case 5:
                        Input._currentState.right = !0;
                        this._lastInput = "right";
                        break;
                    case 6:
                        g.enableDiagonalInput && (Input._currentState.left = !0, Input._currentState.down = !0, this._lastInput = "down-left");
                        break;
                    case 7:
                        Input._currentState.down = !0;
                        this._lastInput = "down";
                        break;
                    case 8:
                        g.enableDiagonalInput && (Input._currentState.down = !0, Input._currentState.right = !0, this._lastInput = "down-right")
                }
            }
        };
    c.prototype.whichIndex = function (a) {
        let b;
        b = a.x - this.x > this.width /
        3 ? a.x - this.x > 2 * this.width / 3 ? 2 : 1 : 0;
        return b += a.y - this.y > this.height / 3 ? a.y - this.y > 2 * this.height / 3 ? 6 : 3 : 0
    };
    c.prototype.clearLastDirection = function () {
        this._lastInput && (this._lastInput.split("-").forEach((a) => Input._currentState[a] = !1), this._lastInput = "")
    };
    f.prototype = Object.create(b.prototype);
    f.prototype.constructor = f;
    f.prototype.initialize = function (a, e, c, d, f, g, h) {
        const m = 7 < arguments.length && void 0 !== arguments[7] ? arguments[7] : 0;
        b.prototype.initialize.call(this, a, e, c, d, h);
        f && (this._inputTrigger = f);
        this._inputMethod =
            m
    };
    f.prototype.isTouchTriggered = function () {
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
    f.prototype.updateTouchInput = function () {
        if (this.isTouchTriggered()) {
            var a = new Point(TouchInput.x, TouchInput.y);
            this.containsPoint(a) ? (this._soundEffect && AudioManager.playSe(this._soundEffect), this._vibratePattern &&
            window.navigator.vibrate(this._vibratePattern), this._inputTrigger && (Input._currentState[this._inputTrigger] = !0)) : Input._currentState[this._inputTrigger] = !1
        } else Input._currentState[this._inputTrigger] = !1
    };
    d.prototype = Object.create(b.prototype);
    d.prototype.constructor = d;
    d.prototype.initialize = function (a, e, c, d) {
        b.prototype.initialize.call(this, a, e, c, d);
        this._inputTrigger = "control";
        this._buttonsHidden = !1
    };
    d.prototype.updateTouchInput = function () {
        if (TouchInput.isTriggered()) {
            const {x: a, y: b} = TouchInput,
                c = new Point(a, b);
            this.containsPoint(c) && (this._soundEffect && AudioManager.playSe(this._soundEffect), this._buttonsHidden ? this.showAllButtons() : this.hideAllButtons())
        }
    };
    d.prototype.showAllButtons = function () {
        if (h) {
            var a = g.controlButtonSettings;
            0 < a.buttonsToHide.length ? a.buttonsToHide.forEach((a) => {
                this._keyButtons[a] && (this._keyButtons[a].show(), this._keyButtons[a].expand())
            }) : Object.values(this._keyButtons).forEach((a) => {
                a.show();
                a.expand()
            });
            a.hideDPad && this._directionalPad && (this._directionalPad.show(),
                this._directionalPad.expand());
            this._buttonsHidden = !1
        }
    };
    d.prototype.hideAllButtons = function () {
        const a = g.controlButtonSettings;
        0 < a.buttonsToHide.length ? a.buttonsToHide.forEach((a) => {
            this._keyButtons[a] && (this._keyButtons[a].hide(), this._keyButtons[a].collapse(this.x, this.y))
        }) : Object.values(this._keyButtons).forEach((a) => {
            a.hide();
            a.collapse(this.x, this.y)
        });
        a.hideDPad && this._directionalPad && (this._directionalPad.hide(), this._directionalPad.collapse(this.x, this.y));
        this._buttonsHidden = !0
    };
    const k =
        () => {
            $gamePlayer._isPathfinding = !1;
            $gameTemp.clearDestination();
            $gamePlayer.clearPathfind()
        }, n = () => {
        $gameMessage.isBusy() || ($gameTemp.clearCommonEvent(), $gameTemp.reserveCommonEvent(3))
    }, p = () => {
        $gameMessage.isBusy() || ($gameTemp.clearCommonEvent(), $gameTemp.reserveCommonEvent(2))
    }, q = () => {
        $gameMessage.isBusy() || ($gameTemp.clearCommonEvent(), $gameTemp.reserveCommonEvent(13))
    }, r = () => {
        QMovement.moveOnClick = !QMovement.moveOnClick;
        QMovement.moveOnClick ? (h = !1, SceneManager._scene._spriteset._controlButton.hideAllButtons()) :
            (h = !0, SceneManager._scene._spriteset._controlButton.showAllButtons());
        k();
        return 1
    }, t = () => {
        l = !0;
        const a = SceneManager._scene;
        a._windowBuyproVersion.activate();
        a._windowBuyproVersion.show();
        $gameMessage.setBackground(2);
        $gameMessage.setPositionType(1);
        $gameMessage.add("zzz");
        return l
    }, u = () => {
        $gameMessage.isBusy() || (SoundManager.playOk(), SceneManager.push(Scene_Menu), Window_MenuCommand.initCommandPosition(), $gameTemp.clearDestination())
    }, v = Spriteset_Base.prototype.update;
    Spriteset_Base.prototype.update =
        function () {
            v.call(this);
            if (!this.sp_createbutton) {
                this.createDirPad();
                this.createKeyButtons();
                this.createControlButton();
                if (SceneManager.isScene()) {
                    QMovement.moveOnClick && !h && this._controlButton.hideAllButtons();
                    this._keyFeatures || (this._keyFeatures = {});
                    let a = "shopping";
                    this._keyFeatures[a] = new b(0, 60, a);
                    this._keyFeatures[a].setClickHandler(p.bind(this));
                    this.addChild(this._keyFeatures[a]);
                    a = "battle";
                    this._keyFeatures[a] = new b(0, 120, a);
                    this._keyFeatures[a].setClickHandler(n.bind(this));
                    this.addChild(this._keyFeatures[a]);
                    a = "gift", this._keyFeatures[a] = new b(0, 180, a), this._keyFeatures[a].setClickHandler(q.bind(this)), this.addChild(this._keyFeatures[a]);
                    a = "touch_ok";
                    this._keyFeatures[a] = new b(Graphics.boxWidth - 100, 120, a);
                    this._keyFeatures[a].setClickHandler(r.bind(this));
                    this.addChild(this._keyFeatures[a]);
                    a = "premium";
                    (this._keyFeatures[a] = new b(Graphics.boxWidth - 100, 180, a), this._keyFeatures[a].setClickHandler(t.bind(this)), this.addChild(this._keyFeatures[a]));
                    a = "escape";
                    this._keyFeatures[a] = new b(Graphics.boxWidth - 255, Graphics.boxHeight - 145, "b_button");
                    this._keyFeatures[a].setClickHandler(u.bind(this));
                    this.addChild(this._keyFeatures[a])
                }
                this.sp_createbutton = !0
            }
        };
    const w = Scene_MenuBase.prototype.create;
    Scene_MenuBase.prototype.create = function () {
        w.call(this);
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

                        for (let key of Object.values(sp._keyButtons)) {
                            if (key) {
                                sp.removeChild(key);
                            }
                        }
                    }

                    return Bitmap.snap(this._scene);
                }
    };
    Sprite.prototype.createDirPad = function () {
        const a = g.dPadSettings;
        a && (this._directionalPad = new c(a.x, a.y, a.image || "", a.soundEffect), this.addChild(this._directionalPad))
    };
    Sprite.prototype.createKeyButtons =
        function () {
            let a = g.keyButtonSettings;
            if (a && 0 < a.length) {
                this._keyButtons = {};
                for (let b = 0; b < a.length; b++) {
                    let c = a[b];
                    this._keyButtons[c.name.toLowerCase()] = new f(c.x, c.y, c.image, c.soundEffect, c.inputTrigger.toLowerCase(), c.customCode, c.vibratePattern, c.inputMethod);
                    this.addChild(this._keyButtons[c.name.toLowerCase()])
                }
            }
        };
    Sprite.prototype.createControlButton = function () {
        let a = g.controlButtonSettings;
        a && (this._controlButton = new d(a.x, a.y, a.image || "", a.soundEffect), this.addChild(this._controlButton), this._controlButton._keyButtons =
            this._keyButtons, this._controlButton._directionalPad = this._directionalPad)
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
    const x = Scene_Map.prototype.isReady;
    Scene_Map.prototype.isReady = function () {
        k();
        TouchInput.clear();
        return x.call(this)
    };
    const y = Scene_Map.prototype.processMapTouch;
    Scene_Map.prototype.processMapTouch = function () {
        if (TouchInput.isTriggered()) {
            const {x: a, y: b} = TouchInput, c = new Point(a, b);
            if (this._controlButton) {
                if (this._controlButton.containsPoint(c)) {
                    k();
                    return
                }
            } else if (this._directionalPad) {
                if (this._directionalPad.active && this._directionalPad.containsPoint(c)) {
                    k();
                    return
                }
            } else if (this._keyButtons && Object.keys(this._keyButtons).some((a) => this._keyButtons[a].containsPoint(c))) {
                k();
                return
            }
        }
        y.call(this)
    };
    let l = !1;

    class z extends Window_Base {
        constructor(...a) {
            super();
            this.initialize(...a)
        }

        initialize(a, b, c, d) {
            super.initialize(a, b, c, d);
            this.isOpenShop = !1;
            this._text = "           \n            \\c[10]\\{ - NO Ads Banner & VideoAds\n            \\c[2]\\{ + Play OFFLINE MODE\n            \\c[16]\\{ + PREMIUM content\n            \\c[23]\\{ + Downloadable content\n            ";
            this.refresh()
        }

        update() {
            super.update();
            if (TouchInput.isTriggered() && l) {
                const {x: a, y: b} = TouchInput, c = b >= this.y && b <= this.height + this.y;
                a >= this.x && a <= this.width + this.x && c ? this.isOpenShop || (game_outschool.openApp(),
                    this.isOpenShop = !0) : this.isOpenShop = !1;
                l = !1;
                this.deactivate();
                this.hide()
            }
        }

        refresh() {
            let a = 2 * this.textPadding();
            this.contents.clear();
            const b = this._text.split("\n");
            let c = a || 36;
            for (let d = 0; d < b.length; d++) {
                a *= d;
                c += a || 36;
                c += 5;
                const e = b[d] || !1;
                e && this.drawTextEx(e, a, c)
            }
        }
    }
    window.Window_Buy_Pro = z;
    const A = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function () {
        A.call(this);
        const {boxWidth: a, boxHeight: b} = Graphics;
        this._windowBuyproVersion = new z(a / 4, b / 4, a / 1.5, b / 1.5);
        this._windowBuyproVersion.deactivate();
        this._windowBuyproVersion.hide();
        this.addWindow(this._windowBuyproVersion)
    }
})();