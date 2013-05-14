var BMO = window.BMO ? window.BMO : {};

/*
@class: Bomb
@extends: Element
@construtor
@param _grid: BMO.Grid
@param _BMM: BMO.BMM
@param _wsClient: BMO.BMM.wsClient
@param _BM: BMO.BM
@param _pow: powerOfFire
PS. this.view is special from other element
                this.view.anchor = {x:0.5,y:0.5}
        IE. this.view.position = {x:48/2,y:48/2}
        while this.X = 0 && this.Y = 0 && this._X = 48/2 && this._Y = 48/2
**/
BMO.Bomb =function(_grid,_BMM,wsClient,_BM,_pow){
	try{
	BMO.Element.call(this,_grid,_BMM);
	this.classname = "Bomb";
	this.wsClient = wsClient;
	this.waitIndex = 0;
	this.owner = _BM;
	this.powerOfFire = _pow;
	}catch(e){throw e;};
}

//constructor
BMO.Bomb.construtor = BMO.Bomb;
BMO.Bomb.prototype = Object.create( BMO.Element.prototype );

/*
@private method waitEffect
**/
BMO.Bomb.prototype.waitEffect = function(){
	var table = [0.8,0.9,1,0.9];
	this.view.scale.x = this.view.scale.y = table[this.waitIndex++];
	this.waitIndex = this.waitIndex % 4;
}


/*
@public overrid method setView
@param _id: frame_id in .json
**/
BMO.Bomb.prototype.setView = function(_id){
	BMO.Element.prototype.setView.call(this,_id);//super.setView()....
	//Do more
	this._X = 48/2;
	this._Y = 48/2;
	this.view.position.x = this._X; //PUt Center
	this.view.position.y = this._Y; //PUT CENTER
	this.view.anchor.x = 0.5;       //PUt Center
	this.view.anchor.y = 0.5;       //PUT Center
	var self = this;
	this.waitFunc = setInterval(function(){self.waitEffect();},400);

}

/*
@private method explode
@param payload: {
                U:{},
                D:{},
                L:{},
                R:{}
        }
**/
BMO.Bomb.prototype.explode = function(payload){
	try{
	console.log("Bomb.explode():payload=",payload);
	if (this.owner.alive) this.owner.bombNum++;
	this.vanish();
	}catch(e){console.log(e);throw e;};
}


/*
@protected override method vanish()
**/
BMO.Bomb.prototype.vanish = function(){
	try{
	BMO.Element.prototype.vanish.call(this);
	this.BM = null;
	this.wsClient= null;
	if(this.waitFunc != null){
		clearInterval(this.waitFunc);
		this.waitFunc = null;
	}
	}catch(e){console.log(e);throw e;};
}

/*
@public method eventProcesser
@param event: event object
		var event ={
			type: "",
			payload: ""
		}
**/
BMO.Bomb.prototype.eventProcesser = function(event){
	if (event.type === "explode"){
		//console.log("Bomb.explode:",event);
		this.explode(event.payload);
	}
}