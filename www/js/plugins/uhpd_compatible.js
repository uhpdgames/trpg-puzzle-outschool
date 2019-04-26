/**
 * @file FIX conflict and compatible TBS plugin
 */

//todo Move code to LeTBS.!
(function () {
  (function ($) {
    $.prototype.commandBounce = function (param) {
      var seq = param[0];
      var startEntity = param[1];
      var maxTargets = Number(param[2]);
      var aoe = param[3];
      var targetType = param[4] || "all";
      
      var seqArray = Lecode.S_TBS.Config.Sequences[seq].slice();
      startEntity = this.readTargets(startEntity)[0];
      var entities1 = [this.getUser()];
      var entities2 = [startEntity];
      var targeted = [this.getUser(), startEntity];
      var targets = 0;
      var entity1 = startEntity;
      let error = false;
      
      do {
        try {
          var center = entity1.getCell().toCoords();
          var size = BattleManagerTBS.getScopeFromData(aoe, center, {});
          var entities = BattleManagerTBS.getEntitiesInScope(size).filter(function (entity) {
            if (targeted.indexOf(entity) > -1) return false;
            if (targetType === "all") return true;
            if (targetType === "enemy" && this.isEnemy(entity.battler())) return true;
            return !!(targetType === "ally" && this.isAlly(entity.battler()));
            
          }, this);
          if (entities.length === 0) break;
          var entity2 = LeUtilities.getRandomValueInArray(entities);
          targeted.push(entity2);
          entities1.push(entity1);
          entities2.push(entity2);
          entity1 = entity2;
          targets++;
        } catch (e) {
          error = true;
        }
      } while (targets !== maxTargets || !!error);
      
      this._savedEntities["bounce_entities1"] = entities1;
      this._savedEntities["bounce_entities2"] = entities2;
      
      for (let i = 0; i <= targets; i++) {
        for (var j = seqArray.length - 1; j >= 0; j--) {
          var command = seqArray[j];
          this._sequence.table.unshift(command);
        }
        this._sequence.table.unshift("save_entities: bounce_entity1, saved(bounce_entities1), shift");
        this._sequence.table.unshift("save_entities: bounce_entity2, saved(bounce_entities2), shift");
      }
      
      return {};
    };
  })(TBSSequenceManager);
  (function ($) {
    $.prototype.setupStartingMapEvent = function () {
      const events = $gameMap.events();
      for (const event of events) {
        if (event.isStarting()) {
          try {
            event.clearStartingFlag();
            this._interpreter.setup(event.list(), event.eventId());
            return true;
          } catch (e) {
            return false;
          }
        }
      }
      return false;
    };
  })(Game_Troop);
  (function ($) {
    $.cursorOnMoveScope = function () {
      if (!this.isMoveScopeAvailable()) return false;
      //this.moveScope().cells
      const cells = this.moveScope().cells || [];
      for (const cell of cells) {
        if (cell && cell._walkable) {
          if (cell.x === this.cursor().cellX && cell.y === this.cursor().cellY) return true;
        }
      }
      return false;
    };
    $.getScopeFromData = function (data, center, param) {
      let scope = [];
      
      let scopesStr = data.split(";");
      for (let scopeStr of scopesStr) {
        scopeStr = scopeStr.trim();
        scope = scope.concat(this.makeScope(scopeStr, center, param));
      }
      scope = LeUtilities.uniqArray(scope);
      if (this._requestSpecialSelection) {
        this._requestSpecialSelection.aoe = scope;
      }
      scope = this.applyParamToScope(scope, center, param);
      return scope;
    };
    $.cursorOnActionScope = function () {
      try {
        if (!this.isActionScopeAvailable()) return false;
        const cells = this.actionScope().cells || [];
        for (const cell of cells) {
          if (cell._selectable && !(cell.isObstacle() && !cell.isThereEntity())) {
            if (cell.x === this.cursor().cellX && cell.y === this.cursor().cellY) {
              return true;
            }
          }
        }
      } catch (e) {
      
      }
      return false;
    };
    $.removeObstaclesFromScope = cells => {
      try {
        if (!!cells) {
          return cells.filter(cell => !cell.isObstacle());
        }
      } catch (e) {
      
      }
      return false;
    };
    $.checkScopeVisibility = function (cells, center) {
      let w = $gameMap.tileWidth();
      let h = $gameMap.tileHeight();
      let cx = center.x * w + w / 2;
      let cy = center.y * h + h / 2;
      let obstacles = [];
      let boundaries = this.getScopeBoundaries(cells);
      for (let x = boundaries.left; x <= boundaries.right; x++) {
        for (let y = boundaries.top; y <= boundaries.bottom; y++) {
          let cell = this.getCellAt(x, y);
          if (cell.isObstacleForLOS()) {
            obstacles.push(cell);
          }
        }
      }
      let nonVisible = [];
      for (let i = 0; i < cells.length; i++) {
        cells[i]._selectable = true;
      }
      
      for (let i = 0; i < obstacles.length; i++) {
        let cellsToCheck = this.cellsToCheckNearObstacle(obstacles[i], cells, center);
        for (let j = 0; j < cellsToCheck.length; j++) {
          let cellToCheck = cellsToCheck[j];
          if (obstacles[i].x === cellToCheck.x && obstacles[i].y === cellToCheck.y) {
            continue;
          }
          let dx = cellToCheck.x * w + w / 2;
          let dy = cellToCheck.y * h + h / 2;
          //- let sprite = SceneManager._scene._spriteset._debugLayer;
          let pixels = LeUtilities.getPixelsOfLine(cx, cy, dx, dy);
          for (let k = 0; k < obstacles.length; k++) {
            let obstacle = obstacles[k];
            if (obstacle.x === center.x && obstacle.y === center.y) {
              continue;
            }
            if (obstacle.isSame(cellToCheck)) {
              continue;
            }
            let x = obstacle.x * w;
            let y = obstacle.y * h;
            for (let m = 0; m < pixels.length; m++) {
              if (LeUtilities.doesRectIncludeCoord(x, y, w, h, pixels[m])) {
                nonVisible.push([cellToCheck.x, cellToCheck.y]);
                m = pixels.length;
              }
            }
          }
        }
      }
      
      for (let i = 0; i < nonVisible.length; i++) {
        for (let j = 0; j < cells.length; j++) {
          if (cells[j].x === nonVisible[i][0] && cells[j].y === nonVisible[i][1]) {
            cells[j]._selectable = false;
          }
        }
      }
    };
    $.makeScope = function (data, center, param) {
      let str;
      let min;
      let size;
      let scope;
      if (data.match(/(circle|line|square|cross)\((.+)\)/i)) {
        if (RegExp.$2.includes(",")) {
          str = RegExp.$2.split(",");
          size = Math.floor(Number(eval(str[0])));
          min = Math.floor(Number(eval(str[1])));
        }
        else {
          size = Math.floor(Number(eval(RegExp.$2)));
        }
      }
      if (data.match(/custom\((.+)\)/i)) {
        let scopeData = Lecode.S_TBS.Config.Custom_Scopes[String(RegExp.$1)];
        scope = this.getScopeFromRawData(scopeData, center, param);
      }
      else if (data.match(/circle\((.+)\)/i)) {
        scope = this.makeCircleScope(center, size, min, param);
      }
      else if (data.match(/line\((.+)\)/i)) {
        scope = this.makeLineScope(center, size, min, param);
      }
      else if (data.match(/square\((.+)\)/i)) {
        scope = this.makeSquareScope(center, size, min, param);
      }
      else if (data.match(/cross\((.+)\)/i)) {
        scope = this.makeCrossScope(center, size, min, param);
      }
      else if (data.match(/path/i)) {
        scope = this.makePathScope(param);
      }
      else {
        let aoe = eval(`[${data}]`);
        for (let i = 0; i < aoe.length; i++) {
          let cell = this.getCellAt(aoe[i][0], aoe[i][1]);
          if (cell) {
            scope = [...cell];
          }
        }
      }
      
      return LeUtilities.uniqArray(scope);
    };
    $.drawScope = function (cells, color, opa, invalidOpa, invalidCondition) {
      for (const cell of cells) {
        this._spriteset._scopesLayer.drawCell(cell.x, cell.y, opa, color);
      }
    };
    $.drawSkillScope = function (entity, obj) {
      this.makeSkillScope(entity, obj);
      this._actionScopeParam = {
        color: Lecode.S_TBS.skillColorCell,
        scolor: Lecode.S_TBS.selectedSkillColorCell,
        opacity: Lecode.S_TBS.skillCellOpacity,
        invalidOpa: 60,
        selectedOpacity: Lecode.S_TBS.skillSelectedCellOpacity
      };
      this.drawActionScope(entity);
      this.updateScopeSelection();
    };
    $.getCellAt = function (x, y) {
      if (this._groundCells[x])
        return this._groundCells[x][y];
      return {x: 0, y: 0};
    };
    $.prepareEntityFlags = () => {
    
    };
    $.isCellInScope = (cell, scope) => {
      if (!!scope && scope.length > 0) {
        for (const i of scope) {
          try {
            if (i.isSame(cell)) {
              return true;
            }
          } catch (e) {
          
          }
        }
      }
      return false;
    };
  
    
    //todo spriter chapter Game_Enemy
    $.createNeutralEntities = function () {
      const layer = this._spriteset._battlersLayer;
      $gameMap.events().forEach(function (event) {
        if (event.event().note.match(/<TBS Neutral (.+)>/i)) {
          var enemyId = Number(RegExp.$1);
          var tbsEvent = new TBSEvent(event);
          this._tbsEvents.push(tbsEvent);
          var entity = new TBSNeutralEntity(layer, tbsEvent, enemyId);
          entity.setCell(this.getCellAt(event.x, event.y));
          this._neutralEntities.push(entity);
        }
      }.bind(this));
    };
    //todo fix camera || w qCamera.js
    $.centerCell = cell => {
      $gameMap.scrollTowardsPos(cell.x, cell.y, 4, 60);
    };
  })(BattleManagerTBS);
  Game_Map.prototype.scrollTowardsPos = function (x, y, speed, frames) {
    let centerX = this._displayX + this.screenTileX() / 2;//_tDisplayX
    let centerY = this._displayY + this.screenTileY() / 2;//_tDisplayY
    if (!this.isLoopHorizontal()) {
      if (centerX < this.screenTileX() / 2) {
        centerX = this.screenTileX() / 2;
      }
      if (centerX > this.width() - this.screenTileX() / 2) {
        centerX = this.width() - this.screenTileX() / 2;
      }
    }
    if (!this.isLoopVertical()) {
      if (centerY < this.screenTileY() / 2) {
        centerY = this.screenTileY() / 2;
      }
      if (centerY > this.height() - this.screenTileY() / 2) {
        centerY = this.height() - this.screenTileY() / 2;
      }
    }
    let distanceX = (x + 0.5) - centerX;
    let distanceY = (y + 0.5) - centerY;
    
    // if (!$gameMap.isScrolling()) {
    //   this.setWaitMode('scroll');
    // }
    $gameMap.startQScroll(distanceX, distanceY, speed, frames);
    //this.startQuasiScroll(distanceX, distanceY, speed || 4, frames);
  };
  
  //todo fix (patch) tweenjs
  const oldSceneManagerRenderScene = SceneManager.renderScene;
  SceneManager.renderScene = function () {
    oldSceneManagerRenderScene.call(this);
    if(LeUtilities.isScene()) TWEEN.update();
  };
  
  LeUtilities.tweenProperty = (obj, prop, last, time, opts = {}) => {
    const easing = opts.easing || TWEEN.Easing.Quadratic.Out;
    const data = { value: obj[prop] };
    const tween = new TWEEN.Tween(data)
      .to( {value: last}, time)
      .easing(easing)
      .interpolation(TWEEN.Interpolation.CatmullRom)
      .onUpdate(object => {
        obj[prop] = data.value;
        if (opts.onUpdate) opts.onUpdate(object);
      });
    return tween;
  };
})();
