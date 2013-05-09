var BMO = window.BMO ? window.BMO : {};

/*
@class BMM
@construtor	
**/
BMO.BMM = function(wsClient, handlers){
	this.gridList = [];
	this.elementList = [];
	this.view = new PIXI.Stage(0x000000); 
	this.wsClient = wsClient;
	this.handlers = handlers;
};

//constructor
BMO.BMM.consturctor = BMO.BMM;

/*
@public method setMap
@param name: name of the map file (JSON format)
@param onProgress: callback for loading in progress
@param onComplete: callback for loading end
**/
BMO.BMM.prototype.setMap = function(name,onProgress,onComplete){
	console.log("setMap");
	var mapSkin = [name];//pixi5-MAP1.json eg
	var self = this;
	console.log("self="+self+" "+"mapSkin="+mapSkin+"onComplete="+onComplete);
	if (typeof(onComplete) !== "function" ) throw "I need a call-back for onLoadend";
	try{
		var loader = new PIXI.AssetLoader(mapSkin);
		if (typeof(onProgress) === "function") loader.onProgress = onProgress;
		loader.onComplete = function(){
			/*
			Game_Area.txt
			Screen Resolution: 960px x 560px
			A Grid Resolution: 48px x 48px ? (Our skin most likely 48x48)
			Game_Area_Max Resolution: 11 rows x 17 cols ( including the border )
			**/
			try{
				for(var i = 0;i<11;i++){
					self.gridList[i] = [];
					for(var j =0;j<17;j++){						
						var _grid = new BMO.Grid(j,i,self);
						self.gridList[i].push(_grid);
						_grid.view.addChild(PIXI.Sprite.fromFrame("tile"));
						//Wall.............
						if ( i == 0 || i == 10) _grid.view.addChild(PIXI.Sprite.fromFrame("wall"));				
						else{
							if ( j == 0 || j == 16)	_grid.view.addChild(PIXI.Sprite.fromFrame("wall"));	
							else{
								if ( (i%2) == 0 && (j%2) == 0) _grid.view.addChild(PIXI.Sprite.fromFrame("wall"));	
							}
						}
						//End of wall......
						//Box..............
						
						if ( i > 2 && j >2 && i < 8 && j<15 && ((i%2) != 0 || (j%2) !=0)){
							_grid.view.addChild(PIXI.Sprite.fromFrame("box"));
						}
						//End of Box.......
						self.view.addChild(_grid.view);
					}
				}
				onComplete();
			}catch(e){throw e;};		
		};
		loader.load();
	}catch(e){throw e;};
}

/*
@public method setPlayer
@param msg: 
		msg.name = name of the map file ;
		msg.p1.row = p1 init row pos
		msg.p1.col = p1 init col pos		
@param onProgress: callback for loading in progress
@param onComplete: callback for loading end
**/
BMO.BMM.prototype.setPlayer = function(msg,onProgress,onComplete){
	console.log("setPlayer");
	var playerSkin = [msg.name];//demo.json eg
	var self = this;
	console.log("self="+self+" "+"playerSkin="+playerSkin);
	//if (typeof(onComplete) !== "function" ) throw "I need a call-back for onLoadend";
	try{
		var loader = new PIXI.AssetLoader(playerSkin);
		if (typeof(onProgress) === "function") loader.onProgress = onProgress;		
		loader.onComplete = function(){			
			console.log("setPlayer:onComplete");
			var _grid = self.gridList[msg.p1.row][msg.p1.col];
			var _BM = new BMO.BM(_grid,self);
			self.elementList.push(_BM);
			_BM.setView("D0");
			_grid.view.addChild(_BM.view);
			if (onComplete) onComplete();
		};
		loader.load();
	}catch(e){throw e;};
}

/*
@public method setController
**/
BMO.BMM.prototype.setController = function(){
	console.log("BMM:setController");
	var self = this;
	
	document.body.addEventListener("keydown",function(e){
		self.elementList[0].eventProcesser(e);
	},false);
	document.body.addEventListener("keyup",function(e){
		self.elementList[0].eventProcesser(e);
	},false);
	
	self.handlers["playerMoveACK"] = function(){};
	self.handlers["broadcastPlayerMove"] = self.broadcastPlayerMove;
	self.handlers["broadcastPlayerMove"] = self.broadcastPlayerMove;
	self.handlers["broadcastPlayerStopMove"] = self.broadcastPlayerStopMove;
}

BMO.BMM.prototype.broadcastPlayerMove = function(data, wsClient){
	/*
	data = {
		classname : "",
		id: "username" / {x:x ,y:y},
		payload: payload you want
	}
	*/
	var element = search(this.elementList, classname, id);
	var newData ={
		type: "otherPlayerMove",
		payload: data.payload
	}
	element.eventProcesser(newData);
};

BMO.BMM.prototype.broadcastPlayerStopMove = function(data, wsClient){
	var element = search(this.elementList, classname, id);
	var newData ={
		type: "otherPlayerStopMove",
		payload: null,
	}
	element.eventProcesser(newData);
};