var Imported=Imported||{};Imported.LeTBS_SkillBubble=!0;var Lecode=Lecode||{};Lecode.S_TBS.SkillBubble={};var parameters=PluginManager.parameters("LeTBS_SkillBubble");function Window_TBSSkillBubble(){this.initialize.apply(this,arguments)}Lecode.S_TBS.SkillBubble.showAttack=!1,Lecode.S_TBS.SkillBubble.oldTBSEntity_createComponents=TBSEntity.prototype.createComponents,TBSEntity.prototype.createComponents=function(){Lecode.S_TBS.SkillBubble.oldTBSEntity_createComponents.call(this),this._skillBubble=new Window_TBSSkillBubble(this),BattleManagerTBS.getLayer("movableInfo").addChild(this._skillBubble)},Lecode.S_TBS.SkillBubble.oldTBSEntity_update=TBSEntity.prototype.update,TBSEntity.prototype.update=function(){Lecode.S_TBS.SkillBubble.oldTBSEntity_update.call(this),this._skillBubble.updateProcess()},Lecode.S_TBS.SkillBubble.oldTBSEntity_onActionStart=TBSEntity.prototype.onActionStart,TBSEntity.prototype.onActionStart=function(t,i,e){Lecode.S_TBS.SkillBubble.oldTBSEntity_onActionStart.call(this,t,i,e),e.item().TagsLetbs.disableSkillBubble||this.battler().hasLeTBSTag("disableSkillBubble")||this._skillBubble.set(e.item())},Lecode.S_TBS.SkillBubble.oldTBSEntity_destroy=TBSEntity.prototype.destroy,TBSEntity.prototype.destroy=function(){Lecode.S_TBS.SkillBubble.oldTBSEntity_destroy.call(this),this._skillBubble.hide()},Window_TBSSkillBubble.prototype=Object.create(Window_Base.prototype),(Window_TBSSkillBubble.prototype.constructor=Window_TBSSkillBubble).prototype.initialize=function(t){this._entity=t,this._item=null,Window_Base.prototype.initialize.call(this,0,0,20,20),this.close(),this.hide()},Window_TBSSkillBubble.prototype.loadWindowskin=function(){this.windowskin=ImageManager.loadSystem("Window2")},Window_TBSSkillBubble.prototype.standardBackOpacity=function(){return 255},Window_TBSSkillBubble.prototype.standardPadding=function(){return 8},Window_TBSSkillBubble.prototype.textPadding=function(){return 6},Window_TBSSkillBubble.prototype.windowWidth=function(){return this._item?this.textWidth(this._item.name)+2*this.standardPadding()+38:20},Window_TBSSkillBubble.prototype.windowHeight=function(){return this.fittingHeight(1)},Window_TBSSkillBubble.prototype.updateProcess=function(){this.updatePosition(),this._set&&this.updateShake()},Window_TBSSkillBubble.prototype.updatePosition=function(){var t=this._entity,i=t._sprite,e=BattleManagerTBS._activeCell.y<=t.getCell().y;this.x=i.x-this.windowWidth()/2,this.y=i.y+(e?0:-(this.windowHeight()+i.height));var o=$gameMap.width()*$gameMap.tileWidth();this.y<0&&(this.y=0),this.x<0&&(this.x=0),this.x+this.width>o&&(this.x=o-this.width)},Window_TBSSkillBubble.prototype.updateShake=function(){},Window_TBSSkillBubble.prototype.updateFade=function(){this.opacity-=3,this.opacity<=0&&(this.opacity=0,this.hide()),this.contentsOpacity=this.backOpacity=this.opacity},Window_TBSSkillBubble.prototype.refresh=function(){if(this.contents.clear(),this.resetFontSettings(),this.contents._drawTextOutline=function(){},this._item){var t=this._item.name;this.contents.fontSize-=4,this.leU_drawText(t,"center",0)}},Window_TBSSkillBubble.prototype.set=function(t){if(t.id!==this._entity.battler().attackSkillId()||Lecode.S_TBS.SkillBubble.showAttack){this._item=t;var i=this.windowWidth(),e=this.windowHeight();this.move(0,0,i,e),this.createContents(),this.refresh(),this.open(),this.show(),this._shakeEffect={power:2,duration:60},this._set=!0,setTimeout(this.close.bind(this),1e3)}};