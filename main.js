/*
 *
 * Label改造
 *
 *
 */


/**
 * @scope enchant.Label.prototype
 */
enchant.Label = enchant.Class.create(enchant.Entity, {
    /**
     * @name enchant.Label
     * @class
     * A class for Label object.
     * @constructs
     * @extends enchant.Entity
     */
    initialize: function(text) {
        enchant.Entity.call(this);

        this.text = text || '';
        this.width = 300;
        this.fontsize = '14px';
        this.fonttype = 'serif';
        this.font=this.fontsize+" "+this.fonttype;
        this.textAlign = 'left';

        this._debugColor = '#ff0000';
    },
    /**#nocode+*/
    width: {
        get: function() {
            return this._width;
        },
        set: function(width) {
            this._width = width;
            this._dirty = true;
            // issue #164
            this.updateBoundArea();
        }
    },
    /**#nocode-*/
    /**
     * Text to be displayed.
     * @type String
     */
    text: {
        get: function() {
            return this._text;
        },
        set: function(text) {
            text = '' + text;
            if(this._text === text) {
                return;
            }
            this._text = text;
            text = text.replace(/<(br|BR) ?\/?>/g, '<br/>');
            this._splitText = text.split('<br/>');
            this.updateBoundArea();
            for (var i = 0, l = this._splitText.length; i < l; i++) {
                text = this._splitText[i];
                var metrics = this.getMetrics(text);
                this._splitText[i] = {};
                this._splitText[i].text = text;
                this._splitText[i].height = metrics.height;
            }
        }
    },
    /**
     * Specifies horizontal alignment of text.
     * Can be set according to the format of the CSS 'text-align' property.
     * @type String
     */
    textAlign: {
        get: function() {
            return this._style['text-align'];
        },
        set: function(textAlign) {
            this._style['text-align'] = textAlign;
            this.updateBoundArea();
        }
    },
    /**
     * Font settings.
     * Can be set according to the format of the CSS 'font' property.
     * @type String
     */
    font: {
        get: function() {
            return this._style.font;
        },
        set: function(font) {
            this._style.font = font;
            this.updateBoundArea();
        }
    },

    fontsize: {
        get: function() {
            return this._fontsize;
        },
        set: function(font) {
        	font=font || 14;
            this._fontsize = font+"px";
            this._style.font = this._fontsize+" "+this._fonttype;
            this.updateBoundArea();
        }
    },

    fonttype: {
        get: function() {
            return this._fonttype;
        },
        set: function(font) {
            this._fonttype = font;
            this._style.font = this._fontsize+" "+this._fonttype;
            this.updateBoundArea();
        }
    },
    /**
     * Text color settings.
     * Can be set according to the format of the CSS 'color' property.
     * @type String
     */
    color: {
        get: function() {
            return this._style.color;
        },
        set: function(color) {
            this._style.color = color;
        }
    },
    cvsRender: function(ctx) {
        var x, y = 0;
        var labelWidth = this.width;
        var charWidth, amount, line, text, c, buf, increase, length;
        var bufWidth;
        if (this._splitText) {
            ctx.textBaseline = 'top';
            ctx.font = this.font;
            ctx.fillStyle = this.color || '#000000';
            charWidth = ctx.measureText(' ').width;
            amount = labelWidth / charWidth;
            for (var i = 0, l = this._splitText.length; i < l; i++) {
                line = this._splitText[i];
                text = line.text;
                c = 0;
                while (text.length > c + amount || ctx.measureText(text.slice(c, c + amount)).width > labelWidth) {
                    buf = '';
                    increase = amount;
                    length = 0;
                    while (increase > 0) {
                        if (ctx.measureText(buf).width < labelWidth) {
                            length += increase;
                            buf = text.slice(c, c + length);
                        } else {
                            length -= increase;
                            buf = text.slice(c, c + length);
                        }
                        increase = increase / 2 | 0;
                    }
                    ctx.fillText(buf, 0, y);
                    y += line.height - 1;
                    c += length;
                }
                buf = text.slice(c, c + text.length);
                if (this.textAlign === 'right') {
                    x = labelWidth - ctx.measureText(buf).width;
                } else if (this.textAlign === 'center') {
                    x = (labelWidth - ctx.measureText(buf).width) / 2;
                } else {
                    x = 0;
                }
                ctx.fillText(buf, x, y);
                y += line.height - 1;
            }
        }
    },
    domRender: function(element) {
        if (element.innerHTML !== this._text) {
            element.innerHTML = this._text;
        }
    },
    detectRender: function(ctx) {
        ctx.fillRect(this._boundOffset, 0, this._boundWidth, this._boundHeight);
    },
    updateBoundArea: function() {
        var metrics = this.getMetrics();
        this._boundWidth = metrics.width;
        this._boundHeight = metrics.height;
        if (this.textAlign === 'right') {
            this._boundOffset = this.width - this._boundWidth;
        } else if (this.textAlign === 'center') {
            this._boundOffset = (this.width - this._boundWidth) / 2;
        } else {
            this._boundOffset = 0;
        }
    },
    getMetrics: function(text) {
        var ret = {};
        var div, width, height;
        if (document.body) {
            div = document.createElement('div');
            for (var prop in this._style) {
                if(prop !== 'width' && prop !== 'height') {
                    div.style[prop] = this._style[prop];
                }
            }
            text = text || this._text;
            div.innerHTML = text.replace(/ /g, '&nbsp;');
            div.style.whiteSpace = 'noWrap';
            div.style.lineHeight = 1;
            document.body.appendChild(div);
            ret.height = parseInt(getComputedStyle(div).height, 10) + 1;
            div.style.position = 'absolute';
            ret.width = parseInt(getComputedStyle(div).width, 10) + 1;
            document.body.removeChild(div);
        } else {
            ret.width = this.width;
            ret.height = this.height;
        }
        return ret;
    }
});


/*********/






enchant();

var SPRITE_WIDTH  = ~~320/8;
var SPRITE_HEIGHT = ~~320/3;


window.onload = function() {
    var game = new Game();

	game.preload("piano/do1.mp3",
		"piano/do1s.mp3",
		"piano/re.mp3",
		"piano/res.mp3",
		"piano/mi.mp3",
		"piano/fa.mp3",
		"piano/fas.mp3",
		"piano/so.mp3",
		"piano/sos.mp3",
		"piano/ra.mp3",
		"piano/ras.mp3",
		"piano/si.mp3",
		"piano/do2.mp3");
    game.onload = function() {
	var scene = game.rootScene;
	scene.backgroundColor = "aqua";

	var SE_PATH={
			do1:"piano/do1.mp3",
			do1s:"piano/do1s.mp3",
			re:"piano/re.mp3",
			res:"piano/res.mp3",
			mi:"piano/mi.mp3",
			fa:"piano/fa.mp3",
			fas:"piano/fas.mp3",
			so:"piano/so.mp3",
			sos:"piano/sos.mp3",
			ra:"piano/ra.mp3",
			ras:"piano/ras.mp3",
			si:"piano/si.mp3",
			do2:"piano/do2.mp3",
	};



	// スプライト生成
        var sprites  = {
            do1:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            do1s:new Sprite(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2),
            re:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            res:new Sprite(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2),
            mi:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            fa:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            fas:new Sprite(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2),
            so:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            sos:new Sprite(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2),
            ra:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            ras:new Sprite(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2),
            si:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            do2:new Sprite(SPRITE_WIDTH, SPRITE_HEIGHT),
            name:["do1","re","mi","fa","so","ra","si","do2"],
            names:["do1s","res","","fas","sos","ras"],
            namej:["ド↓","レ","ミ","ファ","ソ","ラ","シ","ド↑"],
            namesj:["ド♯","レ♯","","ファ♯","ソ♯","ラ♯"]
        };




        //どこ押したかラベル
	    var label = new Label("Touch!");scene.addChild(label);
	    //label.x=160;label.y=100;label.fontsize=50;

        for(var i=0;i<8;i++){
            sprite=sprites[sprites.name[i]];
            sprite.image = new Surface(SPRITE_WIDTH, SPRITE_HEIGHT);	// サーフェス生成白けん

            // canvas 描画
            sprite.image.context.fillStyle = "white";
            sprite.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
            sprite.image.context.lineWidth=4;
            sprite.image.context.strokeStyle = "black";
            sprite.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);

            scene.addChild(sprite);
            sprite.x=i*SPRITE_WIDTH;
            sprite.y=SPRITE_HEIGHT*2;
            sprite.otoname=sprites.namej[i];
            sprite.sepath=SE_PATH[sprites.name[i]];
            sprite.addEventListener('touchstart',function(){
                this.image.context.fillStyle = "blue";
                this.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
                this.image.context.strokeStyle = "black";
                this.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
            	game.assets[this.sepath].clone().play();
                label.text=this.otoname;
                console.log(this.otoname);
            });

            sprite.addEventListener('touchend',function(){
                this.image.context.fillStyle = "white";
                this.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
                this.image.context.strokeStyle = "black";
                this.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
            });
        }
        for(var i=0;i<7;i++){
            if(sprites.names[i]){
                sprite=sprites[sprites.names[i]];
                sprite.image =  new Surface(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2);	// 黒

                // canvas 描画
                sprite.image.context.fillStyle = "black";
                sprite.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);

                scene.addChild(sprite);
                sprite.x=i*SPRITE_WIDTH+SPRITE_WIDTH/2;
                sprite.y=SPRITE_HEIGHT*2;
                sprite.otoname=sprites.namesj[i];
                sprite.sepath=SE_PATH[sprites.names[i]];
                sprite.addEventListener('touchstart',function(){
                	this.image.context.fillStyle="teal";
                	this.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);
                	game.assets[this.sepath].clone().play();
                    label.text=this.otoname;
                    console.log(this.otoname);
                });
                sprite.addEventListener('touchend',function(){
                	this.image.context.fillStyle="black";
                	this.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);
                });
            }
        }
    };

    game.start();
};