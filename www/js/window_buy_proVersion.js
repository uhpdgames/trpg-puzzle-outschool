Graphics._makeErrorHtml = function(name, message) {
    return ('<font color="yellow"><b>An unknown error</b></font><br>' +
            '<font color="white">Contact the author to report this error. You can receive a free version check at https://fb.com/trpgoutschool</font><br>');
};
// Graphics.printError = function (name, message) {
//     this._errorShowed = true;
//     if (this._errorPrinter) {
//         this._errorPrinter.innerHTML = this._makeErrorHtml(name, message);
//     }
//     this._applyCanvasFilter();
//     this._clearUpperCanvas();
// };
class Window_Buy_Pro extends Window_Base {
    constructor(...args) {
        super();
        this.initialize(...args)
    }
    initialize(x, y, width, height) {
        super.initialize(x, y, width, height);
        this.isOpenShop = false;
        this._text = `
            \\c[10]\\{ - NO Ads Banner & VideoAds
            \\c[2]\\{ + Play OFFLINE MODE
            \\c[16]\\{ + PREMIUM content
            \\c[23]\\}The PC will be available at April 29, fb.com/trpgoutschool
            `;
        this.refresh()
    }
    update() {
        super.update();
        if (TouchInput.isTriggered() && isOpening) {
            const {x, y} = TouchInput;
            const check_x = x >= this.x && x <= this.width + this.x;
            const check_y = y >= this.y && y <= this.height + this.y;
            if (check_x && check_y) {
                if (!this.isOpenShop) {
                    game_outschool.openApp();
                    this.isOpenShop = true
                }
                isOpening = false
            } else {
                this.isOpenShop = false;
                isOpening = false
            }
            this.deactivate();
            this.hide()
        }
    }
    refresh() {
        let x = this.textPadding() * 2;
        this.contents.clear();
        const Text = this._text.split("\n");
        let y = x || 36;
        for (let i = 0; i < Text.length; i++) {
            x *= i;
            y += x || 36;
            y += 5;
            const t = Text[i] || false;
            if (t) this.drawTextEx(t, x, y)
        }
    }
}
(function () {
    let isOpening = false;
    const oldAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function () {
        oldAllWindows.call(this);
        const {boxWidth, boxHeight} = Graphics;
        this._windowBuyproVersion = new Window_Buy_Pro(boxWidth / 4, boxHeight / 4, boxWidth / 1.5, boxHeight / 1.5);
        this._windowBuyproVersion.deactivate();
        this._windowBuyproVersion.hide();
        this.addWindow(this._windowBuyproVersion)
    };
    const callWindow_Buy = () => {
        if(!$gameMessage.isBusy()){
            isOpening = true;
            const scene = SceneManager._scene;
            scene._windowBuyproVersion.activate();
            scene._windowBuyproVersion.show();
            $gameMessage.setBackground(2);
            $gameMessage.setPositionType(1);
            $gameMessage.add("zzz");
            return isOpening
        }
    };
    const oldInitialize = Spriteset_Map.prototype.initialize;
    Spriteset_Map.prototype.initialize = function () {
        oldInitialize.call(this);
        if (SceneManager.isScene()) {
            if (!this._keyFeatures) this._keyFeatures = {};
            let key = "premium";
            if (!this._keyFeatures[key]) {
                this._keyFeatures[key] = new Sprite_Button(Graphics.boxWidth - 100, 180, key);
                this._keyFeatures[key].setClickHandler(callWindow_Buy.bind(this));
                this.addChild(this._keyFeatures[key])
            }
        }
    }
})();
Scene_Map.prototype.updateCallMenu = function () {
    this.menuCalling = false
};
Scene_Map.prototype.isReady = function () {
    if (!this._mapLoaded && DataManager.isMapLoaded()) {
        this.onMapLoaded();
        this._mapLoaded = true;
    }
    if ($dataQMap.length > 0) {
        $uhpd.loadedTexture = Object.keys($gameResources).length > 3 && $uhpd.hasLoadedQMap >0;
    }
    $uhpd.mapLoaded = this._mapLoaded && Scene_Base.prototype.isReady.call(this) && $uhpd.loadedTexture;
    return $uhpd.mapLoaded;
};