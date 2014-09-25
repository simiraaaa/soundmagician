

    enchant.nineleap.memory.LocalStorage.DEBUG_MODE = true;
    enchant.nineleap.memory.LocalStorage.GAME_ID = 4288;

/* Label改造 */


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
    initialize: function(text,x,y) {
        enchant.Entity.call(this);
        this.text = text || '';
        this.width = 300;
        this.fontsize = 'bold 16';
        this.fonttype = 'ＭＳ ゴシック';
        this.font=this.fontsize+" "+this.fonttype;
        this.textAlign = 'left';
        this.color="white";
        this._debugColor = '#ff0000';

        this.x=x===undefined?0:x;
        this.y=y===undefined?0:y;
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

var MagicList={
	Aup:function(){
		if(savedata.rateA>=2){
			return savedata.name+"の攻撃力はもう上がらない";
		}else{
			savedata.rateA*=2;
			return savedata.name+"の攻撃力が2倍になった!";
		}
	},
	Dup:function(){
		if(savedata.rateD>=2){
			return savedata.name+"の防御力はもう上がらない";
		}else{
			savedata.rateD*=2;
			return savedata.name+"の防御力が2倍になった!";
		}
	},
	Adown:function(){
		if(Enemy.rateA<=0.5){
			return Enemy.name+"の攻撃力はもう下がらない";
		}else{
			Enemy.rateA/=2;
			return Enemy.name+"の攻撃力が半分になった!";
		}
	},
	Ddown:function(){
			if(Enemy.rateD<=0.5){
				return Enemy.name+"の防御力はもう下がらない";
			}else{
				Enemy.rateD/=2;
				return Enemy.name+"の防御力が半分になった!";
			}
	},
	HPdrain:function(){
		sentou.isHPdrain=false;
		var v=sentou.enemydamagenow;
		if(v<=5)return "回復できるほどダメージを与えていない";
		var sv=savedata;
		if(sv.hp>=sv.maxhp)return sv.name+"のHPは最大だ";
		else{
			v=~~(v*0.2);
			if(sv.hp+v>=sv.maxhp){
				v=sv.maxhp-sv.hp;
			}
			sv.hp+=v;
		}
		return sv.name+"のHPが"+v+"回復した";
	},
	MPdrain:function(v){
		sentou.isMPdrain=false;
		var v=sentou.enemydamagenow;
		if(v<=34)return "回復できるほどダメージを与えていない";
		var sv=savedata;
		if(sv.mp>=sv.maxmp)return sv.name+"のMPは最大だ";
		else{
			v=~~(v*0.03);
			if(sv.mp+v>=sv.maxmp){
				v=sv.maxmp-sv.mp;
			}
			sv.hp+=v;
		}
		return sv.name+"のMPが"+v+"回復した";
	}
};

var GAKUHU={
		onpa:{
			name:"音波",
			setumei:"無属性:音波を飛ばして敵を攻撃する",
			mp:0,
			power:1,
			magic:function(){
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					MessageWindowCt(["音波を飛ばした!",Enemy.damage(this.mg.power)]);
				});
			},
			canField:false,
			canSentou:true,
			s:[0,2,4],
			t:[0,15,30]
		},
		mezame:{
			name:"目覚めの歌",
			setumei:"夢の世界から現実に戻る",
			mp:0,
			magic:function(){scene.tl.delay(1).then(function(){
				if(scene.isDream){
					if(savedata.gakuhu[savedata.gakuhu.length-1]==="mezame"){
						SuperReplaceScene(MuraScene(),true);
					}else MessageWindowCt(["……","何も起こらなかった。","もう少し探索してみよう"]);
				}else{
					MessageWindowCt(["……","どうやらここは現実のようだ。"]);
				}
			})},
			canField:true,
			canSentou:false,
			s:[12,7,5,7,5,0,5,7,12],
			t:[0,8,16,24,32,40,48,55,63]
		},
		kanki:{
			name:"歓喜の歌",
			setumei:"以下の効果を選択。[MP5,HP50%回復]<BR>[MP15,HP全回復]<BR>[MP0,MP50%回復]",
			mp:0,
			magic:function(){
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					Sentaku(["MP5:HP50%回復",
					         function(){
								if(savedata.mp>=5){
									if(savedata.hp>=savedata.maxhp){
										MessageWindowCt(["HPは最大だ"]);
									}else{
										savedata.mp-=5;
										MessageWindowCt([function(){
											var sv=savedata;
											var v=Math.round(sv.maxhp/2);
											if(v+sv.hp>=sv.maxhp){
												sv.hp=sv.maxhp;
												return sv.name+"のHPが回復し、最大になった!";
											}else{
												sv.hp+=v;
												return sv.name+"のHPが"+v+"回復した";
											}
										},function(){Enemy.Turn();return Enemy.name+"の行動"}]);
									}
						         }else{
										MessageWindowCt(["MPが足りない!"]);
								}
							},"MP15:HP全回復",
							function(){
								if(savedata.mp>=15){
									if(savedata.hp>=savedata.maxhp){
										MessageWindowCt(["HPは最大だ"]);
									}else{
										savedata.mp-=15;
										MessageWindowCt([function(){
											var sv=savedata;
											sv.hp=sv.maxhp;
											return sv.name+"のHPが全回復した!";
										},function(){Enemy.Turn();return Enemy.name+"の行動"}]);
									}
								}else{
									MessageWindowCt(["MPが足りない!"]);
								}
							},"MP0:MP50%回復",
							function(){
								if(savedata.mp>=savedata.maxmp){
									MessageWindowCt(["MPは最大だ"]);
								}else{
									MessageWindowCt([function(){
										var sv=savedata;
										var v=Math.round(sv.maxmp/2);
										if(v+sv.mp>=sv.maxmp){
											sv.mp=sv.maxmp;
											return sv.name+"のMPが最大になった!";
										}else{
											sv.mp+=v;
											return sv.name+"のMPが"+v+"回復した";
										}
									},function(){Enemy.Turn();return Enemy.name+"の行動"}]);
								}
							}]);
				});
			},
			canField:false,
			canSentou:true,
			s:[6,6,7,9,9,7,6,4,2,2,4,6,6,4,4,6,6,7,9,9,7,6,4,2,2,4,6,4,2,2],
			t:[0,14,28,41,55,68,82,95,109,124,137,150,163,184,190,217,230,243,255,269,281,294,306,319,333,344,357,370,389,396]
		},
		kirakira:{
			name:"きらきら星",
			setumei:"無属性:以下の効果を選択。[MP3,手裏剣]<BR>[MP30,メテオ]",
			mp:3,
			magic:function(){
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					Sentaku(["MP3:手裏剣",
					         function(){
								savedata.mp-=3;
								MessageWindowCt(["星型の手裏剣を飛ばした。",Enemy.damage(sentou.mg.power[0])]);
							},"MP30:メテオ",
							function(){
								if(savedata.mp>=30){
									savedata.mp-=30;
									MessageWindowCt([Enemy.name+"に向かって隕石が降り注ぐ!",Enemy.damage(sentou.mg.power[1])]);
								}else{
									MessageWindowCt(["MPが足りない!"]);
								}
							}]);
				});
			},
			canField:false,
			canSentou:true,
			power:[2.5,7],
			s:[0,0,7,7,9,9,7,5,5,4,4,2,2,0,7,7,5,5,4,4,2,7,7,5,5,4,4,2,0,0,7,7,9,9,7,5,5,4,4,2,2,0],
			t:[0,14,27,42,56,70,83,109,123,136,149,161,175,189,217,231,245,258,271,284,298,325,340,352,366,380,394,408,435,450,463,477,491,505,518,544,558,571,584,597,611,624]
		},
		bunbun:{
			name:"ぶんぶんぶん",
			setumei:"無属性:蜂を操り敵を刺しまくる",
			mp:1,
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					MessageWindowCt(["蜂の大群が"+Enemy.name+"を襲う!",Enemy.damage(this.mg.power)]);
				});
			},
			canField:false,
			canSentou:true,
			power:1.5,
			s:[7,5,4,2,4,5,2,0],
			t:[0,14,28,54,62,69,76,84]
		},
		noroi:{
			name:"呪いの旋律",
			setumei:"以下の効果を選択。[MP10,敵の攻撃力を半分にする]<BR>[MP10,敵の防御力を半分にする]",
			mp:10,
			magic:function(){
				sentou.tl.delay(1).then(function(){
					Sentaku(["MP10:敵の攻撃力を半分にする",
					         function(){
								savedata.mp-=10;
								MessageWindowCt([MagicList.Adown,function(){Enemy.Turn();return Enemy.name+"の行動"}]);
							},"MP10:敵の防御力を半分にする",
							function(){
								savedata.mp-=10;
								MessageWindowCt([MagicList.Ddown,function(){Enemy.Turn();return Enemy.name+"の行動"}]);
							}]);
				});
			},
			canField:false,
			canSentou:true,
			s:[1,3,5,4,5,7,5,7,8,7,5,4,1,3,5,4,5,7,5,7,8,12,10,8,8,7,5,4,7,5],
			t:[0,7,13,20,27,34,42,49,56,63,68,76,83,89,96,103,110,116,123,129,136,142,149,156,162,168,174,181,194,202]
		},
		shuku:{
			name:"祝福の旋律",
			setumei:"以下の効果を選択。[MP10,自分の攻撃力を2倍にする]<BR>[MP10,自分の防御力を2倍にする]",
			mp:10,
			magic:function(){
				sentou.tl.delay(1).then(function(){
					Sentaku(["MP10:自分の攻撃力を2倍にする",
					         function(){
								savedata.mp-=10;
								MessageWindowCt([MagicList.Aup,function(){Enemy.Turn();return Enemy.name+"の行動"}]);
							},"MP10:自分の防御力を2倍にする",
							function(){
								if(savedata.rateD===0){
									MessageWindowCt(["防御力が0なので2倍しても意味がない……。"]);
								}else{
									savedata.mp-=10;
									MessageWindowCt([MagicList.Dup,function(){Enemy.Turn();return Enemy.name+"の行動"}]);
								}
							}]);
				});
			},
			canField:false,
			canSentou:true,
			s:[0,2,4,2,4,7,4,7,9,7,4,2,0,2,4,7,4,7,9,7,9,12,9,7,9,7,4,2,4,0],
			t:[0,6,12,19,24,30,37,42,49,55,60,66,73,79,86,93,101,108,116,122,128,134,142,148,156,162,169,175,189,195]
		},
		yami:{
			name:"絶望の闇",
			setumei:"闇属性:闇の魔法で敵を攻撃。その後、敵の防御力を半分にする。",
			mp:15,
			type:"yami",
			power:4,
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					MessageWindowCt([Enemy.name+"が闇に包まれた!",Enemy.damage(this.mg.power,this.mg.type),MagicList.Ddown]);
				});
			},
			canField:false,
			canSentou:true,
			s:[5,0,5,7,8,1,12,1,10,1,8,3,7,8,7,4,0,5],
			t:[0,8,16,25,33,48,53,67,73,87,93,110,115,146,155,163,171,184]
		},
		hikari:{
			name:"希望の光",
			setumei:"光属性:光の魔法で敵を攻撃。その後、自分の防御力を2倍にする。",
			mp:15,
			power:4,
			type:"hikari",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					MessageWindowCt([Enemy.name+"の体が光り輝き爆発した!",Enemy.damage(this.mg.power,this.mg.type),MagicList.Dup]);
				});
			},
			canField:false,
			canSentou:true,
			s:[5,0,5,7,5,7,9,10,12,10,9,7,0,5,9,12,4,7,5],
			t:[0,6,11,16,27,32,43,48,54,59,71,77,88,93,98,105,110,122,133]
		},
		honoo:{
			name:"闘志の炎",
			setumei:"火属性:火の魔法で敵を攻撃。その後、自分の攻撃力を二倍にする。",
			mp:15,
			power:4,
			type:"hi",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					MessageWindowCt(["炎の渦が"+Enemy.name+"を包む!",Enemy.damage(this.mg.power,this.mg.type),MagicList.Aup]);
				});
			},
			canField:false,
			canSentou:true,
			s:[0,5,9,0,5,9,2,7,11,2,7,11,4,9,12,4,9,12,2,7,11,2,7,11,12],
			t:[0,5,10,13,19,22,27,31,35,41,46,49,53,57,61,67,71,75,81,86,89,95,98,102,108]
		},
		koori:{
			name:"守護の氷",
			setumei:"水属性:水の魔法で敵を攻撃。その後、敵の攻撃力を半分にする。",
			mp:15,
			power:4,
			type:"mizu",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					MessageWindowCt([Enemy.name+"に氷の刃が突き刺さる!",Enemy.damage(this.mg.power,this.mg.type),MagicList.Adown]);
				});
			},
			canField:false,
			canSentou:true,
			s:[11,4,7,4,11,2,7,2,9,2,6,2,9,0,6,0,7],
			t:[0,6,12,18,23,30,35,42,48,53,59,65,71,78,85,91,100]
		},
		tengoku:{
			name:"天国と地獄",
			setumei:"火属性:敵を地獄の業火で焼き尽くす。与えたダメージの20%自分のHPを回復する。",
			mp:30,
			type:"hi",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					this.isHPdrain=true;
					MessageWindowCt([Enemy.name+"を地獄の業火で焼き尽くした!",Enemy.damage(this.mg.power,this.mg.type)]);
				});
			},
			power:6,
			canField:false,
			canSentou:true,
			s:[0,0,2,5,4,2,7,7,7,9,4,5,2,2,2,5,4,2,0,12,11,9,7,5,4,2,0,0,2,5,4,2,7,7,7,9,4,5,2,2,2,5,4,2,0,7,2,4,0],
			t:[0,11,23,27,33,38,43,54,64,70,74,79,84,95,105,110,116,121,127,133,139,144,149,155,160,166,171,182,192,197,203,208,213,224,235,240,247,251,257,269,278,284,289,295,302,307,314,318,324]
		},
		menue:{
			name:"光の剣",
			setumei:"光属性:光の剣で敵を斬り刻む。与えたダメージの3%自分のMPを回復する。",
			mp:30,
			type:"hikari",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					this.isMPdrain=true;
					MessageWindowCt(["無数の光の剣が"+Enemy.name+"を斬り刻む！",Enemy.damage(this.mg.power,this.mg.type)]);
				});
			},
			power:6,
			canField:false,
			canSentou:true,
			s:[7,0,2,4,5,7,0,0,9,5,7,9,11,12,0,0,5,7,5,4,2,4,5,4,2,0,2,4,2,0,2,0],
			t:[0,15,22,30,37,46,60,76,90,105,113,121,129,137,153,168,182,198,205,214,222,230,244,252,260,266,274,288,294,301,309,318]
		},
		moru:{
			name:"モルダウ",
			setumei:"水属性:流れる川の幻想で敵を飲み込む。与えたダメージの3%自分のMPを回復する。",
			mp:30,
			type:"mizu",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					this.isMPdrain=true;
					MessageWindowCt([Enemy.name+"は川に流されていった……。",Enemy.damage(this.mg.power,this.mg.type)]);
				});
			},
			power:6,
			canField:false,
			canSentou:true,
			s:[0,2,3,2,3,5,3,5,7,5,7,8,7,8,10,8,7,5,7,5,3,2,7,0,2,3,5,7,7,7,8,8,7,7,5,5,5,3,5,3,3,2,2,2,0],
			t:[0,4,8,12,16,20,24,28,32,36,40,44,48,52,56,60,64,68,72,76,80,84,88,96,112,120,136,144,160,168,192,216,240,280,288,312,328,336,352,360,376,384,408,424,432]
		},
		unmei:{
			name:"運命",
			setumei:"闇属性:闇属性攻撃。与えたダメージの20%自分のHPを回復する。",
			mp:30,
			type:"yami",
			magic:function(){
				savedata.mp-=this.mp;
				sentou.mg=this;
				sentou.tl.delay(1).then(function(){
					this.isHPdrain=true;
					MessageWindowCt([Enemy.name+"はどこからともなく襲い来る攻撃を受ける運命になった!",Enemy.damage(this.mg.power,this.mg.type)]);
				});
			},
			power:6,
			canField:false,
			canSentou:true,s:[9,9,9,5,7,7,7,4,9,9,9,5,10,10,10,9,5,5,5,2,9,9,9,4,10,10,10,9,7,7,7,4,9,9,7,5,5,5,7,9,9,9,7,5,5,5,7,9,9,9,7,5,2,9,10,10,10,7],
			t:[0,7,14,22,105,111,119,125,215,222,229,235,243,250,258,265,273,281,287,294,334,341,348,356,364,371,379,386,393,401,408,414,456,464,471,479,487,493,500,508,515,522,529,536,544,551,559,566,573,580,588,596,624,655,725,735,742,753]
		},
		zenon:{
			name:"ゼノン",
			setumei:"無属性:MPをすべて消費して攻撃する。消費したMPが多いほど威力が上がる。",
			mp:1,
			magic:function(){
				sentou.tl.delay(1).then(function(){
					MessageWindowCt(["ありったけのMPを爆発させた!",Enemy.damage(Math.sqrt(savedata.mp)*1.1)]);
					savedata.mp=0;
				});
			},
			power:0,
			canField:false,
			canSentou:true,
			s:[0,2,3,5,4,2,1,1,2,4,5,7,8,10,9,7,6,6,7,9,12,11,9,11,9,7,9,11,12,7,5,4,4,0,4,2,0,0],
			t:[0,10,19,32,39,45,52,61,71,78,91,99,109,122,129,136,143,152,162,169,182,191,200,213,220,226,233,244,254,261,271,281,288,306,325,338,382,390]
		},
		save:{
			name:"神の記憶",
			setumei:"今の状態をセーブする。",
			mp:0,
			magic:function(){
				scene.tl.delay(1).then(function(){
					if(savedata.isDungeon){
						var arr=[];
						for(var i=0,j=0;i<5;i++,j+=2){
							arr[j]="スロット"+(i+1)+"：";
							arr[j]+=savedataList[i].name?"レベル"+savedataList[i].level+savedataList[i].name:"空のスロット"
							arr[j+1]=function(v){
									var sv= savedata;
									var sL=savedataList[v];
									var dsL=game.memory.player.data.savedataList[v];
									for(var k in sv){
										if(k==="gakuhu"){
											for(var i=0,len=sv[k].length;i<len;i++){
												sL[k][i]=sv[k][i];
												dsL[k][i]=sv[k][i];
											}
										}else {
											sL[k]=sv[k];
											dsL[k]=sv[k];
										}
									}
									game.memory.update();
									MessageWindowCt(["スロット"+(v+1)+"にデータをセーブしました。","ゲームを終了しますか？"]);
									scene.mswin.endFunc=function(){
										YesNo("はい","いいえ",function(){game.end(0,"クリア率000%");},function(){MessageWindowCt(["ゲームを続けます。"]);})
									}
							};
						}
						MessageWindowCt([" <BR> <BR> <BR>どのスロットにセーブしますか？"]);
						Sentaku(arr,function(){MessageWindowCt(["セーブしなかった"]);});
					}else{
						MessageWindowCt(["ここではセーブできない!"]);
					}
				});
			},
			canField:true,
			canSentou:false,
			s:[7,0,3,8,9,5,11,7,12],
			t:[0,4,8,12,16,20,24,28,32]
		},
		iwa:{
			name:"岩砕き",
			setumei:"フィールド上の岩を砕いて通れるようにする。",
			mp:0,
			magic:function(){
				scene.tl.delay(1).then(function(){
					MessageWindowCt(["フィールド上の岩に接触したとき岩が砕けるようになった。"]);
					isIwakudaki=true;
				});
			},
			canField:true,
			canSentou:false,
			s:[2,7,11,2,7,11,2,7,11,2,7,11,12],
			t:[0,3,5,9,12,15,17,21,23,26,30,32,34]
		},
};

var isIwakudaki=false;
//魔法が発動しているかどうかgakuhusの順番
var isMagicActive=new Array(18);
var fmn=[];
var smn=[];
var i=0;
var gakuhus=[];
for(var k in GAKUHU){
	gakuhus[i]=GAKUHU[k];
	if(GAKUHU[k].canField)fmn[fmn.length]=k;
	if(GAKUHU[k].canSentou)smn[smn.length]=k;
	GAKUHU[k].number=i;
	i++;
}
var savedataList=[];
var sL=savedataList;
for(var i=0;i<5;i++){
	sL[i]={name:"",gakuhu:[]};
}
console.log(savedataList);
var savedata={
		name:"フォルテ",
		level:1,
		maxhp:9,
		maxmp:1,
		hp:9,
		mp:1,
		atk:5,
		def:5,
		rateA:1,
		rateD:1,
		isDungeon:false,
		isQuickSM:false,
		isQuickFM:false,
		gakuhu:["onpa","kanki","kirakira","tengoku","noroi","shuku","yami","hikari","honoo","koori","menue","moru","iwa","zenon","unmei"],
		exp:0,
		expTable:1
};


//敵の能力、敵は同時に１体しか相手しない　２体以上なら配列かクラス
var Enemy={
	name:"スライム",
	maxhp:8,
	hp:8,
	atk:8,
	def:3,
	mu:20,
	yami:10,
	mizu:150,
	hikari:50,
	hi:1,
	rateA:1,
	rateD:1,
	exp:1,
	set:function(n,h,a,d,mu,ya,mi,hika,hi,ex,AI){
		this.name=n;
		this.maxhp=h;
		this.hp=h;
		this.atk=a;
		this.def=d;
		this.mu=mu;
		this.yami=ya;
		this.mizu=mi;
		this.hikari=hika;
		this.hi=hi;
		this.rateA=1;
		this.rateD=1;
		this.exp=ex;
		this.AI=AI;
	},
	setAI:function(f){
		this.AI[this.AI.length]=f;
	},
	clearAI:function(){
		this.AI.length=0;
	},
	DefaultAI:{
		1:function(){var that=Enemy;
	    	that.message=[that.name+"の攻撃!",that.Attack()];
		},
		2:function(){var that=Enemy;
			if(that.rateD<2)that.message=[that.name+"は守りのオーラを強化した。",function(){that.rateD*=2; return (that.rateD===1)?that.name+"の防御力が元に戻った":that.name+"の防御力が2倍になった!";}];
			else that.DefaultAI[1]();
		},
		4:function(){var that=Enemy;
			if(that.rateA<2)that.message=[that.name+"は力のオーラを強化した。",function(){that.rateA*=2; return (that.rateA===1)?that.name+"の攻撃力が元に戻った":that.name+"の攻撃力が2倍になった!";}];
			else that.DefaultAI[1]();
		},
		8:function(){var that=Enemy;
			if(savedata.rateD>=1)that.message=[that.name+"は守りのオーラを侵食してきた。",function(){savedata.rateD/=2; return (savedata.rateD===1)?savedata.name+"の防御力が元に戻った":savedata.name+"の防御力が半分になった";}];
			else that.DefaultAI[1]();
		},
		16:function(){var that=Enemy;
			if(savedata.rateA>=1)that.message=[that.name+"は力のオーラを侵食してきた。",function(){savedata.rateA/=2; return (savedata.rateA===1)?savedata.name+"の攻撃力が元に戻った":savedata.name+"の攻撃力が半分になった";}];
			else that.DefaultAI[1]();
		},
		32:function(){var that=Enemy;
			var isUpD=(that.rateD<2);
			var isUpA=(that.rateA<2);
			console.log(isUpD);
			if(isUpD||isUpA){
				if(isUpD)that.message=that.message.concat([that.name+"は守りのオーラを強化した。",function(){if(that.rateD<2){that.rateD*=2; return (that.rateD===1)?that.name+"の防御力と全耐性が元に戻った":that.name+"の防御力と全耐性が2倍になった!";}else{ return "しかし、何も起こらなかった。";}}]);
				if(isUpA)that.message=that.message.concat([that.name+"は力のオーラを強化した。",function(){if(that.rateA<2){that.rateA*=2; return (that.rateA===1)?that.name+"の攻撃力が元に戻った":that.name+"の攻撃力が2倍になった!";}else{ return "しかし、何も起こらなかった。";}}]);
			}else{
				that.DefaultAI[1]();
			}
		},
		64:function(){var that=Enemy;
			var isDownD=(savedata.rateD>=1);
			var isDownA=(savedata.rateA>=1);
			console.log(isDownD);
			if(isDownD||isDownA){
				that.message=[];
				if(isDownD)that.message=that.message.concat([that.name+"は守りのオーラを侵食してきた。",function(){savedata.rateD/=2; return (savedata.rateD===1)?savedata.name+"の防御力が元に戻った":savedata.name+"の防御力が半分になった";}]);
				if(isDownA)that.message=that.message.concat([that.name+"は力のオーラを侵食してきた。",function(){savedata.rateA/=2; return (savedata.rateA===1)?savedata.name+"の攻撃力が元に戻った":savedata.name+"の攻撃力が半分になった";}]);
			}else{
				that.DefaultAI[1]();
			}
		},
		128:function(){var that=Enemy;
			if(that.hp<that.maxhp){
				that.message=[function(){var h=that.hp; that.hp+=~~(that.maxhp*0.1); if(that.hp>that.maxhp)that.hp=that.maxhp; return that.name+"はHPを"+(that.hp-h)+"回復した";}];
			}else{
				that.DefaultAI[1]();
			}
		}
	},
	setDefaultAI:function(v){//全部セットする場合はこんな感じ(1+2+4+8+16+32+64+128)
		//1 通常攻撃
		//2  防御アップ
		//4  攻撃アップ
		//8  防御ダウン
		//16 攻撃ダウン
		//32 防御攻撃アップ同時
		//64 防御攻撃ダウン同時
		//128 HP回復
		for(k in this.DefaultAI){
			if(((+k)&v)===(+k))this.AI[this.AI.length]=this.DefaultAI[k];
		}
	},
	damage:function(p,t){
		t=t || "mu";
		p=((p * savedata.atk*savedata.rateA) -(this.def*this.rateD)) *(0.8+Math.random()*0.4);
		if(p<=0)p=0;
		p=Math.round((1-(this[t])/100)*p);
		if(savedata.rateD===0)p+=Math.round(this.maxhp*(Math.random()*0.2+0.3));
		this.hp-=p;
		if(this.hp>this.maxhp)this.hp=this.maxhp;
		var s = sentou;
		if(this.hp<=0){
			s.tl.delay(1).then(function(){
				var ms=this.mst;
				ms.txtAdd([Enemy.name+"を倒した！",Enemy.exp+"の経験値を獲得"]);
				var sv=savedata;
				sv.exp+=Enemy.exp;
				while(sv.exp>=sv.expTable){
					sv.level++;
					var h=~~(Math.random()*5+8);
					var m=~~(Math.random()*3+1);
					var a=~~(Math.random()*3+2);
					var d=~~(Math.random()*3+2);
					sv.expTable+=sv.level*sv.level;
					sv.maxhp+=h;
					sv.maxmp+=m;
					sv.atk+=a;
					sv.def+=d;
					ms.txtAdd(["レベルが"+sv.level+"に上がった!","HPの最大値が"+h+"上がった! <BR>MPの最大値が"+m+"上がった!","攻撃力が"+a+"上がった! <BR>防御力が"+d+"上がった!"]);
				}
				this.mswin.endFunc2=function(){sentou.isEnd=true;}
			});
		}else {
			Enemy.Turn(p);
		}

		console.log(savedata);
		console.log(Enemy);

		if(p>0){
			return this.name+"に"+p+"のダメージ!";
		}else if(p===0){
			return this.name+"の防御力が高くてダメージが通らなかった!";
		}else if(p<0){
			return this.name+"の耐性が高くてダメージが吸収されてしまった！ <BR>"+this.name+"のHPが"+(-p)+"回復した";
		}
	},
	Turn:function(p){
		sentou.tl.delay(1).then(function(){
			if(p!==undefined){
				if(this.isHPdrain){
					sentou.enemydamagenow=p;
					this.mst.txtAdd(MagicList.HPdrain);
				}else if(this.isMPdrain){
					sentou.enemydamagenow=p;
					this.mst.txtAdd(MagicList.MPdrain);
				}
				if(p<=0){
					var sv=savedata;
					if(sv.rateA<2){
						sv.rateA*=2;
						this.mst.txtAdd([sv.name+"は攻撃が通らなくて激おこプンプン丸!","攻撃力が2倍になった"]);
					}else if(sv.rateD>0){
						sv.rateD=0;
						this.mst.txtAdd([sv.name+"は攻撃が通らないのでやけくそになった。",sv.name+"の防御力が0になり、ダメージが必ず与えられるようになった!"]);
					}
				}
			}
			Enemy.AI[~~(Math.random()*Enemy.AI.length)]();
			this.mst.txtAdd(Enemy.message);
		});
	},
	message:[],
	Attack:function(p){
		p=p || 1;
		p=Math.round(((p * this.atk * this.rateA)-(savedata.def*savedata.rateD))*(0.8+Math.random()*0.4));
		if(p<=0)p=0;
		if(Enemy.rateD===0)p+=Math.round(savedata.maxhp*(Math.random()*0.2+0.3));
		sentou.p=p;
		if(savedata.hp-p<=0){
			sentou.tl.delay(1).then(function(){
				this.mst.stack[this.mst.stack.length]=savedata.name+"は死んでしまった。";
				this.mswin.endFunc2=function(){sentou.isEnd=true;}
			});
		}else if(p===0){
			sentou.tl.delay(1).then(function(){
				if(Enemy.rateA<2){
					Enemy.rateA*=2;
					this.mst.txtAdd([Enemy.name+"は攻撃が通らないことに怒り、攻撃力が2倍になった"]);
				}else if(Enemy.rateD>0){
					Enemy.rateD=0;
					this.mst.txtAdd([Enemy.name+"は攻撃が通らないのでやけくそになった。",Enemy.name+"の防御力が0になり、ダメージが必ず通るようになった!"]);
				}
			});
		}

		console.log(savedata);
		console.log(Enemy);
		if(p>0){
			return function(){var sv =savedata; sv.hp-=sentou.p;if(sv.hp<=0)sv.hp=0; return sentou.p+"のダメージを受けた!";};
		}else if(p===0){
			return savedata.name+"はダメージを受けなかった。";
		}
	},
	Hirumi:function(v){
		v=v?0.5:0.2;
		if(Math.random()<=v){

			return function(){
				if(savedata.hp>=1)Enemy.Turn();
				return savedata.name+"はひるんで動けない！";
				};
		}
		return savedata.name+"はひるまなかった";
	},
	Tuika15:function(v,txt){
		v=v?0.5:0.2;
		if(Math.random()<=v&&savedata.hp>=1){

			return function(){
				var sv=savedata;
				var d=~~(sv.maxhp*0.15);
				sv.hp-=d;
				if(sv.hp<=0){
					sv.hp=0;
					sentou.tl.delay(1).then(function(){
						this.mst.stack[this.mst.stack.length]=savedata.name+"は死んでしまった。";
						this.mswin.endFunc2=function(){sentou.isEnd=true;}
					});
				}
				return "さらに"+d+"の追加ダメージを受けた!";
				};
		}
		return txt;
	},
	Tuika30:function(v,txt){
		v=v?0.5:0.2;
		if(Math.random()<=v&&savedata.hp>=1){
			return function(){
				var sv=savedata;
				var d=~~(sv.maxhp*0.3);
				sv.hp-=d;
				if(sv.hp<=0){
					sv.hp=0;
					sentou.tl.delay(1).then(function(){
						this.mst.stack[this.mst.stack.length]=savedata.name+"は死んでしまった。";
						this.mswin.endFunc2=function(){sentou.isEnd=true;}
					});
				}
				return "さらに"+d+"の追加ダメージを受けた!";
				};
		}
		return txt;
	},
	AI:[
		function(){var that=Enemy;
	    	that.message=[that.name+"の攻撃!",that.Attack()];
		},
	    function(){
	    	Enemy.message=[Enemy.name+"はプルプルしている。"];
		}
		]
};

var ensou=[];


//シーンを移動するときの
var SuperReplaceScene=function(s,white){
	var ss=new Scene();
	var siro=new Sprite(321,321);
	siro.image=new Surface(321,321);
	var c=siro.image.context;
	c.fillStyle=white?"white":"black";
	c.fillRect(0,0,320,320);
	siro.opacity=0;
	siro.s=s;
	siro.ss=new Scene();
	siro.tl.tween({
		time:15,
		opacity:1
	}).then(function(){
		game.popScene();
		game.replaceScene(this.s);
		game.pushScene(this.ss);
		this.ss.addChild(this);
	}).tween({
		time:15,
		opacity:0
	}).then(function(){
		game.popScene();
	});
	ss.addChild(siro);
	game.pushScene(ss);
};
//戦闘シーンへ
var SuperPushScene=function(s){
	var ss=new Scene();
	var siro=new Sprite(21,21);
	siro.image=new Surface(21,21);
	siro.image.context.fillRect(0,0,320,320);
	siro.s=s;
	siro.x=150;
	siro.y=150;
	siro.ss=new Scene();
	siro.tl.tween({
		time:5,
		scaleX:16,
		scaleY:16
	}).then(function(){
		game.popScene();
		game.pushScene(this.s);
		game.pushScene(this.ss);
		this.ss.addChild(this);
	}).delay(4).tween({
		time:3,
		opacity:0
	}).then(function(){
		game.popScene();
	});
	ss.addChild(siro);
	game.pushScene(ss);
};




//タイトルシーン
var TitleScene = function(){
	var s=new Scene();
	scene=s;
	s.isDream=true;
    player=Player();
	player.setPosition(10,10);
	map = new Map(16, 16);
	map.image = game.assets['images/map1.png'];
	map.loadData([
	                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	                        [0,0,0,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,49,0,0,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,48,0,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,83,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,84,85,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,100,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,115,100,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,100,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,16,17,17,17,17,17,17,17,17,18,3,3,3,3,3,3,3,99,101,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,32,0,0,0,0,0,0,0,0,34,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,101,3,3,3,3,3,3,3,32,0,0,0,0,0,0,0,0,34,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,83,100,85,3,3,3,3,3,3,32,0,0,0,0,0,0,0,0,34,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,101,3,3,3,3,3,3,32,0,0,0,0,0,0,0,0,34,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,101,3,3,3,3,3,3,32,0,0,0,0,0,0,0,0,34,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,101,3,3,3,3,3,3,48,49,49,49,49,49,49,49,49,50,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,99,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,99,100,101,3,3,3,3,3,3,3,3,3,3,3,3,3,3,83,84,84,84,84,84,84,84,84,101,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,83,100,100,100,84,84,85,3,3,3,3,3,3,3,3,3,3,3,99,100,100,100,100,100,100,100,100,101,100,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,99,100,100,100,100,100,101,3,3,3,3,3,3,3,3,3,3,3,99,100,100,100,100,100,100,100,100,101,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,99,100,100,100,100,100,100,84,84,84,84,84,84,84,84,84,84,84,100,116,116,116,116,116,116,116,116,117,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,115,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,116,117,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,1,2,1,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,0,17,17,17,17,18,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,0,49,49,49,0,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,34,3,3,3,32,34,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,32,0,0],
	                        [0,0,0,17,17,17,0,0,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,17,0,0,0],
	                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	                        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	                    ],[
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,107,107,107,107,107,107,107,107,107,107,107,107,107,-1,-1,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,-1,-1,107,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,107,107,107,107,60,61,28,28,107,-1,-1,-1,-1,-1,-1,107,107,107,107,107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,107,-1,-1,28,28,76,77,28,28,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,107,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,107,-1,-1,107,107,107,107,107,107,107,107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,107,107,-1,107,107,-1,-1,-1,28,28,28,28,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,107,-1,-1,107,-1,-1,28,28,28,-1,-1,28,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,107,107,107,107,107,-1,-1,-1,107,-1,-1,107,107,107,107,107,28,-1,107,107,107,107,107,107,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,107,107,107,107,107,107,107,107,107,107,107,107,-1,107,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,107,-1,107,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107,107,107,107,107,107,107,107,107,107,-1,107,-1,107,-1,-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,107,107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,-1,-1,-1,107,-1,107,-1,-1,-1,-1,107,107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,107,-1,-1,-1,-1,-1,107,107,107,-1,-1,-1,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,107,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,-1,28,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,107,107,107,107,-1,-1,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,-1,-1,107,-1,-1,107,-1,-1,-1,-1,28,28,-1,-1,-1,-1,-1,-1],
	                        [-1,28,-1,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,107,-1,-1,107,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1],
	                        [-1,28,-1,-1,-1,107,107,107,107,107,107,107,107,107,107,107,107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,107,-1,-1,107,-1,-1,-1,28,28,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,107,-1,-1,107,-1,-1,107,-1,-1,-1,28,28,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,-1,-1,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,-1,28,28,28,-1,-1,-1,-1,-1,-1],
	                        [-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,-1,-1,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,-1,28,28,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,-1,-1,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,-1,28,28,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,12,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,28,28,28,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,28,-1,28,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,-1,107,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,-1,-1,107,12,12,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,12,12,-1,-1,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,28,28,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,28,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,-1,28,-1,28,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,-1,-1,12,-1,-1,-1,-1,-1,28,28,28,28,28,-1,28,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
	                        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
	                    ]);
	                    map.collisionData = [
	                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,1,1,1,1,1,0,0,0,1,0,0,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,1,0,0,0,0,0,1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,1,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	                        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1]
	                    ];
	var npcs=[];
	npcs[0]=new NPC(25,["あなたの持ってる鍵盤で、そこの宝箱に入ってる楽譜を演奏してみて。","鍵盤は画面の左上をタッチすると使えるよ。あと楽譜は画面の右側の♪をタッチすると見れるよ。"]);
	npcs[0].setPosition(20,30);

	npcs[1]=new Takara("mezame",23,29);
    Grouping([map,npcs[0],npcs[1],player]);
    FieldAdd();
    TouchCtrl();
	MagicActiveAllFalse();
    MessageWindowCt(["ここはどこだろう……。","……とりあえず、抜け出そう。"]);
    s.git=game.input.touch;
    s.onenterframe=function(){
    	if(this.isMessage){
    		if(this.git.start)MessageNext();
    	}else{
    		if(this.git.leftupstart)game.pushScene(PianoScene());
    		else if(this.git.rightstart)game.pushScene(GakuhuSelectScene());
    		else if(this.git.rightdownstart)game.pushScene(TuyosaScene());
    	}
    }
    return s;
};

//村
var MuraScene=function(){
	MagicActiveAllFalse();
	var s=new Scene();
	scene=s;
  player=Player();
	player.setPosition(9,9);
	map = new Map(16, 16);
	map.image = game.assets['images/map1.png'];
	map.loadData([
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,82,82,82,82,82,69,69,69,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,7,23,23,23,82,69,69,69,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,7,82,82,82,82,69,69,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,7,82,82,82,82,69,69,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,23,23,23,23,23,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,82,82,82,82,82,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,82,82,82,82,82,82,82,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,16,17,17,17,17,17,17,17,17,17,17,17,17,18,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,0,49,49,49,49,49,49,49,49,49,49,0,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,37,37,37,37,37,37,37,37,37,37,32,34,37,37,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,37,37,37,37,37,37,37,37,37,37,32,34,37,37,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,20,20,20,20,20,32,34,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,48,50,20,20,20,20,20,20,20,20,20,20,48,50,20,20,20,20,20,97,97,97,97,97,97,97,97,97,97,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,97,97,97,97,97,97,97,97,97,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,66,66,66,66,66,66,66,66,66,66,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,80,81,81,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,81,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,98,81,81,81,81,81,81,81,81,81,81,81,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20],
	    [20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20]
	],[
	    [107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107],
	    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
	    [107,107,107,7,23,23,23,23,23,23,23,23,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,107,107,107],
	    [107,107,107,7,57,57,57,57,57,57,57,57,57,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [28,107,107,7,57,57,57,57,57,57,57,57,57,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,107,28,107],
	    [107,107,107,7,57,57,57,57,57,57,57,7,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [107,107,107,7,57,57,57,13,57,57,57,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,107,107,107],
	    [107,107,107,7,57,57,57,57,57,57,57,7,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [107,107,107,7,57,57,57,57,57,57,57,7,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [28,107,107,7,57,57,57,57,57,57,57,7,28,-1,-1,-1,-1,-1,-1,-1,-1,60,61,-1,-1,60,61,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,28,107],
	    [107,107,107,23,23,23,23,23,23,23,23,23,28,28,28,28,28,28,28,28,28,76,77,60,61,76,77,28,28,28,28,28,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,107,107,107],
	    [107,107,107,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,76,77,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [28,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,107,28,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,7,-1,23,23,23,23,23,23,23,7,107,107,107],
	    [107,107,107,28,-1,-1,-1,-1,-1,-1,28,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,121,-1,7,107,107,107],
	    [28,107,107,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,60,61,-1,-1,-1,-1,-1,-1,60,61,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,76,77,28,28,28,28,28,28,76,77,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,121,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,28,107],
	    [28,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,-1,-1,-1,-1,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,-1,-1,-1,-1,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,121,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,-1,-1,-1,-1,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,28,107],
	    [28,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,28,28,28,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,7,-1,-1,-1,-1,-1,-1,-1,-1,7,107,28,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,28,-1,-1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,23,23,7,-1,23,23,23,23,23,23,107,107,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [28,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,23,23,23,23,23,23,7,-1,107,28,107],
	    [107,107,107,-1,7,23,23,23,23,23,-1,-1,-1,7,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,-1,-1,156,156,156,156,156,156,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,23,23,23,23,23,23,23,23,23,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,156,156,156,156,156,156,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,55,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,156,156,156,156,156,156,7,-1,107,107,107],
	    [28,107,107,-1,7,23,23,23,23,23,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,107,28,107],
	    [107,107,107,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,-1,23,23,23,23,23,23,7,23,23,23,23,23,23,23,23,23,23,7,87,87,7,23,23,153,7,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,201,-1,-1,-1,7,-1,-1,7,-1,-1,-1,7,-1,7,-1,-1,23,23,23,23,23,7,23,23,23,7,-1,107,107,107],
	    [107,107,107,-1,7,23,23,23,23,23,23,23,-1,7,-1,23,23,23,23,23,7,-1,-1,-1,7,-1,-1,23,-1,-1,-1,7,-1,7,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,7,-1,107,107,107],
	    [28,107,107,-1,7,-1,55,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,7,-1,-1,38,38,38,38,7,-1,7,-1,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,7,-1,107,28,107],
	    [107,107,107,-1,7,204,23,23,23,23,23,7,23,23,23,23,23,23,7,-1,7,-1,-1,-1,23,-1,-1,-1,-1,-1,-1,7,-1,7,-1,-1,-1,-1,-1,-1,-1,7,121,-1,-1,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,-1,-1,-1,238,-1,7,-1,-1,-1,28,-1,-1,23,-1,7,38,38,38,38,-1,-1,-1,-1,-1,-1,7,-1,7,-1,-1,-1,-1,-1,121,-1,23,121,-1,-1,7,-1,107,107,107],
	    [107,107,107,-1,7,-1,236,23,23,7,-1,23,-1,-1,23,23,12,23,-1,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,28,107,107,107],
	    [107,107,107,-1,7,-1,236,-1,-1,7,-1,-1,-1,7,-1,-1,-1,-1,-1,-1,7,-1,-1,-1,-1,-1,121,-1,-1,-1,-1,7,-1,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,-1,107,107,107],
	    [28,107,107,-1,23,23,23,23,23,23,23,23,23,23,23,23,23,23,7,120,7,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,7,23,23,23,23,23,23,23,23,23,23,23,23,23,23,-1,107,28,107],
	    [107,107,107,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,23,-1,23,23,23,23,23,23,23,23,23,23,23,23,-1,-1,-1,-1,-1,-1,28,-1,-1,-1,-1,-1,-1,-1,-1,107,107,107],
	    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,120,120,120,120,120,120,120,120,120,120,120,120,120,120,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
	    [107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107,107],
	    [107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,28,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107,28,107,107,107,107]
	]);
	map.collisionData = [
	    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,1,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,1,1,1,1,1,1,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,1,1,1],
	    [1,1,1,0,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,1,1,1,1,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1],
	    [1,1,1,0,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,0,1,1,1,1,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,1,1,1,0,1,0,0,1,1,1,1,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1],
	    [1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1],
	    [1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
	    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
	];

	s.npcs=[
	         new NPC(7,["何か大切なことを忘れているような気がするんだけど……。","気のせいかな？"],24, 5),//うえ
	         new NPC(101,["おまえが持ってるその紙切れ、この前拾ったぞ。","どこにやったか忘れたが、欲しかったらもっていってもいいぞ。"],29,39),//ぶきや
	         new NPC(4,["この村には耳が聞こえない賢者が住んでいるんだけど、最近見てないね。","どこ行ったんだろう。"], 9,19),//左
	         new NPC(34,["井戸がおかしいの。","うめき声みたいな音がするし、水がくめなくて困ってるの。"],24,27),//いどまえ
	         new NPC(10,["ここの北の建物は隣の家の倉庫に繋がってるんだ。","この前、ナイトが何か宝箱に入れているのを見たよ。"],43,40),//右下
	         new Kanban(["井戸"],25,21),
	         new Ido(24,21),
	         new NPC(200,["ぷるぷる、絶対に無くすなって言われてたのになくしちゃったよ～。","あの紙切れがそんなに大事なのかな～？<BR>ん？","あ、それだ！おまえが持ってるやつを探してるんだよ！<BR>よこせ！"],0,0),
	         new Takara("bunbun",22,40)
	         ];
	s.npcs[s.npcs.length-2].visible=false;
	s.npcs[s.npcs.length-2].ef=function(){
		SuperPushScene(SentouScene(0,5));
	};
	s.npcs[s.npcs.length-1].ef=function(){
		MessageWindowCt(["モンスタが出たぞーーー！！！！","遠くから声が聞こえる"]);
		var npcs=scene.npcs;
		npcs[0].setPosition(24,18);
		npcs[0].talktext=["モンスターなんて絵本でしか見たことないわ。"];
		npcs[1].setPosition(23,20);
		npcs[1].talktext=["こんな格好をしているが、俺、実は弱いんだ。","代わりに倒してくれよ。頼む！"];
		npcs[3].talktext=["腰が抜けて動けないの。","誰でもいいからそのモンスターを倒して！おねがい！"];
		npcs[4].talktext=["僕はまだ死にたくないから隠れてるよ……。"];
		npcs[npcs.length-2].setPosition(24,23).visible=true;
	}
  Grouping([map,s.npcs,player]);
  FieldAdd();
  TouchCtrl();
  MessageWindowCt(["ん……？","夢か。","あれ？でもさっきの鍵盤と楽譜がある。","まあいいか。"]);
  s.git=game.input.touch;
  s.onenterframe=function(){
  	if(this.isMessage){
  		if(this.git.start)MessageNext();
  	}else{
  		if(this.git.leftupstart)game.pushScene(PianoScene());
  		else if(this.git.rightstart)game.pushScene(GakuhuSelectScene());
  		else if(this.git.rightdownstart)game.pushScene(TuyosaScene());
  	}
  	if(Enemy.hp<=0){
  		this.npcs[0].talktext=["あなたすごいわね！"];
  		this.npcs[1].talktext=["すごすぎるよ、おまえ！<BR>でも、また井戸からモンスターがやってくるかもしれない。","俺の予想ではこの井戸、魔界に繋がってる。","気が向いたらでいいから井戸の中を調べてきてほしい。"];
  		this.npcs[3].talktext=["ありがとう！","でも、まだ腰が抜けて立てないの……"];
  		this.npcs[4].talktext=["僕はまだ死にたくないから隠れてるよ……。","え？もう大丈夫だって？"];
  		this.npcs[2].talktext=["耳が聞こえない賢者はもしかしたら、井戸から魔界に行ったのかも。"];
  		this.npcs[this.npcs.length-2].setPosition(-5,-5);
  	}
  }
  return s;



};



//井戸に入った
var MakaiEnterScene=function(back){
	savedata.isDungeon=true;
	MagicActiveAllFalse();
	var s=new Scene();
	scene=s;
  player=Player();
	if(back) player.setPosition(9,1);
	else player.setPosition(9,9);
	map = new Map(16, 16);
	map.image = game.assets['images/map1.png'];
	map.loadData([
	    [228,228,228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,6,22,22,209,22,22,22,6,228,228,228,228,228,228],
	    [228,228,228,228,228,6,22,33,209,209,209,209,209,6,228,228,228,228,228,228],
	    [228,228,228,228,228,6,209,209,33,209,209,209,209,6,228,228,228,228,228,228],
	    [228,228,228,228,228,6,209,209,209,209,209,33,209,6,228,228,228,228,228,228],
	    [228,228,228,228,228,6,209,33,209,209,209,209,209,6,228,228,228,228,228,228],
	    [228,228,228,228,228,6,209,33,209,209,33,209,6,22,228,228,228,228,228,228],
	    [228,228,228,228,228,22,6,209,209,209,33,209,6,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,22,22,22,22,22,22,22,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
	    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]
	],[
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
	    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1]
	]);
	map.collisionData = [
	    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,1,1,1,0,1,1,1,1,0,0,0,0,0,0],
	    [0,0,0,0,0,1,1,1,0,0,0,0,0,1,0,0,0,0,0,0],
	    [0,0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0,0,0],
	    [0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0],
	    [0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
	    [0,0,0,0,0,1,0,1,0,0,1,0,1,1,0,0,0,0,0,0],
	    [0,0,0,0,0,1,1,0,0,0,1,0,1,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
	];


	s.npcs=[
	          new Takara("save",9,6)
	         ];


  Grouping([map,s.npcs,player]);
  FieldAdd();
  TouchCtrl();
  s.pl=player;
  s.git=game.input.touch;
  s.onenterframe=function(){
  	if(this.isMessage){
  		if(this.git.start)MessageNext();
  	}else{
		if(!this.isSentaku){
	  		if(this.git.leftupstart)game.pushScene(PianoScene());
	  		else if(this.git.rightstart)game.pushScene(GakuhuSelectScene());
	  		else if(this.git.rightdownstart)game.pushScene(TuyosaScene());
	  		else if(this.pl.getPositionY()<=0)SuperReplaceScene(DungeonScene(0,5));
		}
  	}
  }
  return s;
};

var DungeonScene=function(i,j){

	MagicActiveAllFalse();
	var s=new Scene();
	scene=s;
	player=Player();
	s.pl=player;
	s.git=game.input.touch;
	map = new Map(16, 16);
	map.image = game.assets['images/map1.png'];

	switch (i) {
	case 0:
		switch (j) {
		case 0: player.setPosition(9,1); break;
		case 1: player.setPosition(16,1); break;
		case 2: player.setPosition(17,1); break;
		case 3: player.setPosition(18,15);break;
		case 4: player.setPosition(18,17);break;
		case 5: player.setPosition(9,18);break;
		case 6: player.setPosition(1,17);break;
		case 7: player.setPosition(1,15);break;
		case 8: player.setPosition(2,1);break;
		case 9: player.setPosition(3,1);break;
		}
		player.canSentou=true;
		//4   3   5
		//1,1   2,1
		//1   0   2
		s.FloorReplace=function(){
			if(this.pl.getPositionX()===9&&this.pl.getPositionY()===0)SuperReplaceScene(DungeonScene(3,0),false);
			else if(this.pl.getPositionX()===16&&this.pl.getPositionY()===0)SuperReplaceScene(DungeonScene(5,0),false);
			else if(this.pl.getPositionX()===17&&this.pl.getPositionY()===0)SuperReplaceScene(DungeonScene(5,1),false);
			else if(this.pl.getPositionX()===19&&this.pl.getPositionY()===15)SuperReplaceScene(DungeonScene(2,1),false);
			else if(this.pl.getPositionX()===19&&this.pl.getPositionY()===17)SuperReplaceScene(DungeonScene(2,0),false);
			else if(this.pl.getPositionX()==9&&this.pl.getPositionY()===19)SuperReplaceScene(MakaiEnterScene(true),false);
			else if(this.pl.getPositionX()===0&&this.pl.getPositionY()===17)SuperReplaceScene(DungeonScene(1,0),false);
			else if(this.pl.getPositionX()===0&&this.pl.getPositionY()===15)SuperReplaceScene(DungeonScene(1,1),false);
			else if(this.pl.getPositionX()===2&&this.pl.getPositionY()===0)SuperReplaceScene(DungeonScene(4,0),false);
			else if(this.pl.getPositionX()===3&&this.pl.getPositionY()===0)SuperReplaceScene(DungeonScene(4,1),false);
		}
		map.loadData([
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
		    [228,6,225,225,6,22,22,22,6,225,6,22,22,22,22,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,6,228,228,228,6,225,6,228,228,228,228,6,225,225,6,228],
		    [228,6,225,225,22,22,22,22,22,225,22,22,22,22,22,22,225,225,6,228],
		    [228,6,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,6,228],
		    [228,6,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,6,228],
		    [228,22,22,22,22,22,22,225,225,225,225,225,22,22,22,22,22,22,22,228],
		    [228,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,228],
		    [228,22,22,22,22,225,225,225,225,225,225,225,225,225,22,22,22,22,22,228],
		    [228,225,225,209,209,209,209,209,209,209,209,209,209,209,209,209,225,225,225,228],
		    [228,22,22,22,22,22,22,22,22,209,22,22,22,22,22,22,22,22,22,228],
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]
		],[
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1],
		    [185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,185,-1,-1]
		]);
		map.collisionData = [
		    [0,1,0,0,1,0,0,0,1,0,1,0,0,0,0,0,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,0,1,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
		    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
		    [1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1],
		    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
		    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		    [1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0]
		];
		s.npcs=[];

		break;

	case 1:

		switch (j) {
		case 0: player.setPosition(18,17); break;
		case 1: player.setPosition(18,15); break;
		}
		//4   3   5
		//1,1   2,1
		//1   0   2
		s.FloorReplace=function(){
			if(this.pl.getPositionX()===19&&this.pl.getPositionY()===15)SuperReplaceScene(DungeonScene(0,7),false);
			else if(this.pl.getPositionX()===19&&this.pl.getPositionY()===17)SuperReplaceScene(DungeonScene(0,6),false);
		}

		map.loadData([
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,6,6,6,6,6,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,6,22,22,22,6,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,6,225,225,225,6,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,6,225,225,225,6,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,22,6,225,6,22,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,228,228,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,6,225,6,6,6,6,6,6,6,6,6,6,6,228],
		    [6,6,6,6,6,228,6,225,22,22,22,22,22,22,22,22,22,22,22,228],
		    [6,22,22,22,6,6,6,225,225,225,225,225,225,225,225,225,225,225,225,228],
		    [6,225,225,225,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,228],
		    [6,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,228],
		    [6,225,225,225,6,22,22,22,22,22,22,22,22,22,22,22,22,22,22,228],
		    [22,22,22,22,22,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]
		],[
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
		]);
		map.collisionData = [
		    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1],
		    [1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1],
		    [1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
		    [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		    [1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		    [1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		];

		s.npcs=[];
		break;

	case 2:

		switch (j) {
		case 0: player.setPosition(1,17); break;
		case 1: player.setPosition(1,15); break;
		}
		//4   3   5
		//1,1   2,1
		//1   0   2
		s.FloorReplace=function(){
			if(this.pl.getPositionX()===0&&this.pl.getPositionY()===17)SuperReplaceScene(DungeonScene(0,4),false);
			else if(this.pl.getPositionX()===0&&this.pl.getPositionY()===15)SuperReplaceScene(DungeonScene(0,3),false);
		}

		map.loadData([
		    [228,228,228,228,228,228,228,6,6,6,6,6,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,6,22,22,22,6,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,6,209,209,209,6,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,6,209,209,209,6,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,6,209,209,209,6,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,22,6,209,6,22,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,6,209,6,228,228,228,228,228,228,228,228,228],
		    [6,6,6,6,6,6,6,6,6,209,6,228,228,228,228,228,228,228,228,228],
		    [22,22,22,22,22,22,22,22,22,209,6,228,228,228,228,6,6,6,6,6],
		    [209,209,209,209,209,209,209,209,209,209,6,6,6,6,6,22,22,22,22,22],
		    [22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,209,209,209,22],
		    [209,209,209,209,209,209,209,209,209,209,209,209,209,209,209,209,209,209,209,22],
		    [22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,209,209,209,22],
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,22,22,22,22,22]
		],[
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
		]);
		map.collisionData = [
		    [0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,0,0,0,0,0],
		    [1,1,1,1,1,1,1,1,1,0,1,0,0,0,0,1,1,1,1,1],
		    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1],
		    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
		    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
		    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],
		    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1]
		];
		s.npcs=[];
		break;

	case 3:

		switch (j) {
		case 0: player.setPosition(9,28); break;
		}
		//4   3   5
		//1,1   2,1
		//1   0   2
		s.FloorReplace=function(){
			if(this.pl.getPositionX()===9&&this.pl.getPositionY()===29)SuperReplaceScene(DungeonScene(0,0),false);
		}

		map.loadData([
		    [228,228,228,228,228,228,22,22,22,22,22,22,22,228,228,228,228,228,228,228],
		    [228,228,228,228,228,22,22,225,225,225,225,225,22,22,228,228,228,228,228,228],
		    [228,228,228,228,22,22,225,225,225,225,225,225,225,22,22,228,228,228,228,228],
		    [228,228,228,22,22,225,225,225,225,225,225,225,225,225,22,22,228,228,228,228],
		    [228,228,228,22,225,225,225,225,225,225,225,225,225,225,225,22,228,228,228,228],
		    [228,228,228,22,225,225,225,225,225,225,225,225,225,225,225,22,228,228,228,228],
		    [228,228,228,22,225,225,225,225,225,225,225,225,225,225,225,22,228,228,228,228],
		    [228,228,228,22,225,225,225,225,225,225,225,225,225,225,225,22,228,228,228,228],
		    [228,228,228,22,22,225,225,225,225,225,225,225,225,225,22,22,228,228,228,228],
		    [228,228,228,228,22,22,225,225,225,225,225,225,225,22,22,228,228,228,228,228],
		    [228,228,228,228,228,22,22,225,225,225,225,225,22,22,228,228,228,228,228,228],
		    [228,228,228,228,228,228,22,22,225,225,225,22,22,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,22,22,225,22,22,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,22,225,22,228,228,228,228,228,228,228,228,228],
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]
		],[
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
		]);
		map.collisionData = [
		    [0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
		    [0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0],
		    [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
		    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
		    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
		    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
		    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
		    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0],
		    [0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0],
		    [0,0,0,0,1,1,0,0,0,0,0,0,0,1,1,0,0,0,0,0],
		    [0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,0],
		    [0,0,0,0,0,0,1,1,0,0,0,1,1,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0],
		    [0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0]
		];


		s.npcs=[];
		break;

	case 4:


		player.canSentou=true;
		switch (j) {
		case 0: player.setPosition(16,28); break;
		case 1: player.setPosition(17,28); break;
		}
		//4   3   5
		//1,1   2,1
		//1   0   2
		s.FloorReplace=function(){
			if(this.pl.getPositionX()===16&&this.pl.getPositionY()===29)SuperReplaceScene(DungeonScene(0,8),false);
			else if(this.pl.getPositionX()===17&&this.pl.getPositionY()===29)SuperReplaceScene(DungeonScene(0,9),false);
		}


		map.loadData([
		    [228,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,228],
		    [228,6,22,22,22,22,22,22,22,22,22,22,22,22,22,22,6,22,6,228],
		    [228,6,225,225,225,225,225,225,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,6,22,22,22,22,22,22,225,225,6,225,225,225,6,225,6,228],
		    [228,6,225,6,225,225,225,225,225,225,225,225,6,225,225,225,6,225,6,228],
		    [228,6,225,6,225,6,22,22,22,22,22,22,6,225,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,225,225,225,225,225,6,22,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,22,22,22,22,6,22,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,225,225,225,225,6,225,225,6,225,6,225,6,228],
		    [228,6,225,6,225,22,22,6,22,225,225,6,225,225,6,225,6,225,6,228],
		    [228,6,225,6,225,225,225,6,225,225,225,6,225,225,6,225,6,225,6,228],
		    [228,6,22,22,225,6,225,6,225,22,22,6,22,225,22,225,22,225,6,228],
		    [228,6,225,225,225,6,225,6,225,225,225,6,225,225,225,225,225,225,6,228],
		    [228,6,225,6,22,6,225,6,22,6,225,6,22,6,225,6,22,22,6,228],
		    [228,6,225,6,225,6,225,22,225,6,225,6,225,6,225,6,225,225,6,228],
		    [228,6,225,6,225,6,225,225,225,6,225,6,225,6,225,6,225,225,6,228],
		    [228,6,225,6,225,6,225,225,225,6,225,6,225,6,225,6,225,225,6,228],
		    [228,6,225,6,225,6,225,6,225,6,225,6,225,22,225,6,225,225,6,228],
		    [228,6,22,22,225,6,225,6,225,22,225,6,225,225,225,22,6,225,6,228],
		    [228,6,225,225,225,6,22,22,225,225,225,6,225,6,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,225,225,6,22,22,225,6,225,225,6,225,6,228],
		    [228,6,225,6,22,22,225,225,6,6,225,225,225,6,225,225,6,225,6,228],
		    [228,6,225,6,225,225,225,6,6,22,225,6,225,6,225,225,6,225,6,228],
		    [228,6,225,6,225,6,22,6,6,225,225,6,225,6,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,22,22,225,225,6,22,22,225,225,22,225,6,228],
		    [228,6,225,6,225,6,225,225,225,225,225,6,225,225,225,225,225,225,6,228],
		    [228,6,225,22,225,6,22,22,22,22,225,22,22,22,22,22,225,225,6,228],
		    [228,6,225,225,225,6,225,225,225,225,225,225,225,225,225,225,225,225,6,228],
		    [228,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,225,225,22,228],
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]
		],[
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
		]);
		map.collisionData = [
		    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,1,1,1,1,1,1,0,0,1,0,0,0,1,0,1,0],
		    [0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,1,1,1,1,1,1,1,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,0,0,0,1,1,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,0,0,1,0,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,1,1,1,0,0,1,0,0,1,0,1,0,1,0],
		    [0,1,0,1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,1,0],
		    [0,1,1,1,0,1,0,1,0,1,1,1,1,0,1,0,1,0,1,0],
		    [0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,1,0],
		    [0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,0],
		    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0],
		    [0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,0,1,0],
		    [0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,1,0,0,1,0],
		    [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0],
		    [0,1,1,1,0,1,0,1,0,1,0,1,0,0,0,1,1,0,1,0],
		    [0,1,0,0,0,1,1,1,0,0,0,1,0,1,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,1,1,1,0,1,0,0,1,0,1,0],
		    [0,1,0,1,1,1,0,0,1,1,0,0,0,1,0,0,1,0,1,0],
		    [0,1,0,1,0,0,0,1,1,1,0,1,0,1,0,0,1,0,1,0],
		    [0,1,0,1,0,1,1,1,1,0,0,1,0,1,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,1,0,0,1,1,1,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1,0],
		    [0,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,0,1,0],
		    [0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
		    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,1,0],
		    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0]
		];
		s.npcs=[];
		break;

	case 5:

		player.canSentou=true;
		switch (j) {
		case 0: player.setPosition(2,28); break;
		case 1: player.setPosition(3,28); break;
		}
		//4   3   5
		//1,1   2,1
		//1   0   2
		s.FloorReplace=function(){
			if(this.pl.getPositionX()===2&&this.pl.getPositionY()===29)SuperReplaceScene(DungeonScene(0,1),false);
			else if(this.pl.getPositionX()===3&&this.pl.getPositionY()===29)SuperReplaceScene(DungeonScene(0,2),false);
		}

		map.loadData([
		    [228,6,22,22,22,22,22,22,22,22,22,22,22,22,22,6,22,22,6,228],
		    [228,6,225,225,225,225,225,225,225,225,225,225,225,225,225,6,225,225,6,228],
		    [228,6,225,6,22,22,22,22,22,22,22,22,22,22,225,22,6,225,6,228],
		    [228,6,225,6,225,225,225,225,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,6,225,6,22,22,22,22,22,22,22,22,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,225,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,22,22,22,22,22,22,22,22,22,6,225,6,228],
		    [228,6,225,6,225,6,225,225,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,22,22,22,22,22,22,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,225,225,225,225,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,6,6,225,6,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,6,6,225,6,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,6,6,225,6,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,6,6,225,6,225,6,225,6,225,6,228],
		    [228,6,225,6,225,22,22,6,225,22,22,225,6,225,22,22,6,225,6,228],
		    [228,6,225,6,225,225,225,6,225,225,225,225,6,225,225,225,6,225,6,228],
		    [228,6,225,6,22,6,225,6,225,22,22,22,22,22,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,225,225,225,225,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,22,22,22,22,22,22,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,225,225,225,225,225,6,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,22,22,22,22,22,22,225,6,225,6,228],
		    [228,6,225,6,225,6,225,6,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,22,22,22,22,22,22,22,225,225,6,225,6,228],
		    [228,6,225,6,225,6,225,225,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,6,225,22,22,22,22,22,22,22,22,22,22,225,6,225,6,228],
		    [228,6,225,6,225,225,225,225,225,225,225,225,225,225,225,225,6,225,6,228],
		    [228,6,225,22,22,22,22,22,22,22,22,22,22,22,22,22,22,225,6,228],
		    [228,6,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,225,6,228],
		    [228,22,225,225,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,228],
		    [228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228,228]
		],[
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
		    [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
		]);
		map.collisionData = [
		    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0],
		    [0,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,0],
		    [0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,1,1,0,1,1,0,1,0,1,1,1,0,1,0],
		    [0,1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,1,0,1,0],
		    [0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,1,1,1,1,1,1,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,0,0,0,0,0,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,1,1,1,1,1,1,1,0,0,1,0,1,0],
		    [0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0],
		    [0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0],
		    [0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0],
		    [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
		    [0,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
		    [0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		];



		s.npcs=[];
		break;

	}


	Grouping([map,s.npcs,player]);
	  FieldAdd();
	  TouchCtrl();
	  s.onenterframe=function(){
	  	if(this.isMessage){
	  		if(this.git.start)MessageNext();
	  	}else{
			if(!this.isSentaku){
		  		if(this.git.leftupstart)game.pushScene(PianoScene());
		  		else if(this.git.rightstart)game.pushScene(GakuhuSelectScene());
		  		else if(this.git.rightdownstart)game.pushScene(TuyosaScene());
		  		else this.FloorReplace();
			}
	  	}
	  }
	  return s;
};


var EnemySet=function(){
	var v=null;
	var lv=savedata.level;
	var elvl=[2,4,6,8,10,12,14,15,16,18,20,22,24,25,26,28,30,32,34,35,36,38,40,42,44,45,46,49,53,55,60,65,70];
	var ran=[];

	var gCheck=["kirakira","kanki","shuku","noroi","koori","honoo","hikari","yami","menue"];
	var lCheck=[6,8,10,12,16,18,22,25,30];

	for(var i=0;i<9;i++){
		var aru=false;
		for(var j=0,ga=savedata.gakuhu,len=ga.length;j<len;j++){
			if(ga[j]===gCheck[i]){
				aru=true;
			}
		}
		if(!aru){
			lv=lCheck[i]-1;
			break;
		}
	}
	for(var i=0;elvl[i]<=lv;i++){};

	ran[i-1]=1.0;
	i-=2;
	for(;i>=0;i--){
		ran[i]=ran[i+1]/2;
	}
	var mr=Math.random();

	for(var i=0,len=ran.length;i<len;i++){
		if(0===i){
			if(ran[i]>mr){
				v=elvl[i];
			}
		}else if(ran[i]>mr&&ran[i-1]<=mr){
			v=elvl[i];
		}
	}
	//1 通常攻撃
	//2  防御アップ
	//4  攻撃アップ
	//8  防御ダウン
	//16 攻撃ダウン
	//32 防御攻撃アップ同時
	//64 防御攻撃ダウン同時
	//128 HP回復
	Enemy.clearAI();
	//set:function(n,h,a,d,mu,ya,mi,hika,hi,ex,AI)
	var x=5;
	switch (v) {
	case elvl[0]:
		Enemy.set("スライム", 20, 15, 4,20, 40, 150, 80, 0,3, [function(){Enemy.message=[Enemy.name+"はプルプルしている。"];}]);
		Enemy.setDefaultAI(1);
		break;
	case elvl[1]:
		Enemy.set("レッドスライム", 30, 23, 5,20, 60, 130, 60, 20,8, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[2]:
		Enemy.set("ブルースライム", 50, 40, 10,20, 40, 180, 60, 0,15, []);
		Enemy.setDefaultAI(1+2);
		break;
	case elvl[3]:
		Enemy.set("炎の魔導師", 70, 45,20, 25, 25, 0, 50, 120,28,
				[function(){var that=Enemy;that.message=[that.name+"の火の玉!",that.Attack(1.4)];}]);
		Enemy.setDefaultAI(1);
		break;
	case elvl[4]:
		Enemy.set("水の魔導師", 80,60, 30, 30, 30, 130, 50, 0,45,
				[function(){var that=Enemy;that.message=[that.name+"の水の波動!",that.Attack(1.3),that.Hirumi()];}]);
		Enemy.setDefaultAI(1+2);
		break;
	case elvl[5]:
		Enemy.set("ヴァム", 90, 65, 30,10, 130, 20, 0, 20,65,
				[function(){var that=Enemy;that.message=[that.name+"は噛みついた!",that.Attack(1.8)];}]);
		Enemy.setDefaultAI(1);
		break;
	case elvl[6]:
		Enemy.set("闇の魔導師", 110,80,40, 60, 150, 30, 0, 60,85,
				[function(){var that=Enemy;that.message=[that.name+"の闇の波動!",that.Attack(1),that.Hirumi(1)];}]);
		Enemy.setDefaultAI(1+8);
		break;
	case elvl[7]:
		Enemy.set("魔界草", 180,120,200,50, 50, 150, 50, 0,100,
				[]);
		Enemy.setDefaultAI(1);
		break;
	case elvl[8]:
		Enemy.set("フレアスライム", 150,90,50, 60, 60, 0, 60, 150,120,
				[function(){var that=Enemy;that.message=[that.name+"のフレアアタック!",that.Attack(1.5),that.Tuika15(0,"熱い!")];}]);
		Enemy.setDefaultAI(1+4);
		break;
	case elvl[9]:
		Enemy.set("アイススライム", 200,110,60, 60, 60, 150, 60, 0,140,
				[function(){var that=Enemy;that.message=[that.name+"のアイスアタック!",that.Attack(1.3),that.Tuika15(0,"冷たい!"),that.Hirumi()];}]);
		Enemy.setDefaultAI(1+16);
		break;
	case elvl[10]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[11]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[12]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[13]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[14]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[15]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[16]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[17]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[18]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[19]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[20]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[21]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[22]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[23]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[24]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[25]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[26]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[27]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[28]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[29]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[30]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[31]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	case elvl[32]:
		Enemy.set("レッドスライム", 40, 10, 20,20, 60, 130, 60, 20,4, []);
		Enemy.setDefaultAI(1);
		break;
	}
	console.log(Enemy);
	SuperPushScene(SentouScene(v,x));
};

var MagicActiveAllFalse=function(){
	for(var i = 0, is = isMagicActive, len = is.length ; i<len ; i++) is[i] = 0;
};

var MagicActiveSentouFalse=function(){
	for(var i=0, is=isMagicActive, arr=gakuhus, len=arr.length ;i<len;i++)	{
		if(arr[i].canSentou)is[i]=0;
	}
};

var KenbansAllTouchEnd=function(){
	var k=Kenbans;
	for(var i=0;i<13;i++)k.n[i].ontouchend();
};

var sentou;
var isSentouScene=false;

//戦闘シーン
var SentouScene=function(id,x,y){
	MagicActiveSentouFalse();
	var s=new Scene();
	isSentouScene=true;
	sentou=s;

	s.addChild(WindowCreator(0,0,320,320));

	s.enemyimage=new EnemyImage(id,x,y);
	s.addChild(s.enemyimage);
	SentouAdd();
    TouchCtrl(s);
    MessageWindowCt([Enemy.name+"が現れた!"]);
    s.g=game;
    s.t=game.input.touch;
    s.onenterframe=function(){
    	if(this.isMessage){
    		if(this.t.start){
    			MessageNext();
    			if(Enemy.hp<=0)this.removeChild(this.enemyimage);
    		}
    	}else if(!this.isEnd){
    		if(!this.isSentaku){
	    		if(this.t.rightstart)this.g.pushScene(GakuhuSelectScene());
	    		if(this.t.leftdownstart)this.g.pushScene(PianoScene());
    		}
    	}else{
    		var sv=savedata;
    		isSentouScene=false;
    		sv.hp=sv.maxhp;
    		sv.mp=sv.maxmp;
    		sv.rateA=1;
    		sv.rateD=1;
    		this.g.popScene();
    	}
    }
    return s;

};

var PianoScene = function(){
	var s=new Scene();
	KenbansAdd(s);
	ModoruCreator(s,160,120);
	if(isSentouScene)SentouMagicList(s);
	else FieldMagicList(s);
    s.on('touchstart',function(e){
    	if(e.y<320/3*2){
    		ensou.length=0;
    		game.popScene();
    	}
    });
    return s;
};
//見ながら演奏
var MinagaraPianoScene = function(i){
	var s=new Scene();
	KenbansAdd(s);
	ModoruCreator(s,160,120);
    s.on('touchstart',function(e){
    	if(e.y<320/3*2){
    		ensou.length=0;
    		KenbansAllTouchEnd();
    		game.popScene();
    	}
    });
	if(isSentouScene)SentouMagicList(s);
	else FieldMagicList(s);
    s.n=savedata.gakuhu[i];
    s.nn=i;
    s.i=0;
    s.el=ensou.length;
    s.en=ensou;
    s.onenterframe=function(){
    	var ga=GAKUHU;
    	if(ga[this.n].s.length>this.i){

    		Kenbans.n[ga[this.n].s[this.i]].setRed();

			if(this.el<this.en.length){
				if(this.en[this.en.length-1]===ga[this.n].s[this.i]){
					this.i++;
					this.el=this.en.length;
				}else{
					this.w=WindowCreator(50,150,200,25);
					this.addChild(this.w);
					this.w.tl.delay(30).removeFromScene();
					this.l=new Label("間違えた！最初からだ！",55,155);
					this.addChild(this.l);
					this.l.tl.delay(30).removeFromScene();
					KenbansAllTouchEnd();
					this.en.length=0;
					this.el=0;
					this.i=0;
				}
			}
    	}else{
    		this.en.length=0;
    		KenbansAllTouchEnd();
    		game.popScene();
    	}
    };
    return s;
};
var AutoPianoScene = function(i){
	var s=new Scene();
	KenbansAdd(s);

	ModoruCreator(s,160,160);
    s.on('touchstart',function(e){
    	if(e.y<SPRITE_HEIGHT*2){
    		KenbansAllTouchEnd();
			ensou.length=0;
			isMagicActive=[].concat(this.copied);
    		game.popScene();
    	}
    });
    s.copied=[].concat(isMagicActive);
    s.c=0;
    s.n=savedata.gakuhu[i];
    s.nn=i;
    s.i=0;
    s.k=Kenbans;
    s.onenterframe=function(){
    	var ga=GAKUHU;
    	if(this.i>=ga[this.n].t.length){
    		if(this.c===ga[this.n].t[this.i-1]+30){
        		KenbansAllTouchEnd();
    			ensou.length=0;
    			isMagicActive=[].concat(this.copied);
    			game.popScene();
    		}
    	}else if(this.c===ga[this.n].t[this.i]){
    		if(this.i>0){
    			this.k.n[ga[this.n].s[this.i-1]].ontouchend();
    		}
    		this.k.n[ga[this.n].s[this.i]].ontouchstart();
			this.k.n[ga[this.n].s[this.i]].setRed();
    		this.i++;
    	}
    	this.c++;
    };

    return s;
};

var GakuhuSelectScene = function(){
	var s=new Scene();
	TouchCtrl(s);
	var x=15;
	var y=25;
	s.addChild(WindowCreator(x,y,75,50));
	s.addChild(new Label("見ながら<br>演奏",x+5,y+5));

	y=y+106;
	s.addChild(WindowCreator(x,y,75,50));
	s.addChild(new Label("楽譜を<br>見る",x+5,y+5));

	x=320/3;
	y=0;
	s.addChild(WindowCreator(x,y,x,x*2));
	s.addChild(new Label("説明",x+2,y+2));
	s.setumeiLabel=new Label("",x+2,y+22);
	s.setumeiLabel.width=x-20;
	s.addChild(s.setumeiLabel);


	x=x+25;
	y=x*2-15;
	ModoruCreator(s,x,y);

	s.gakuhu=[];
	for(var i=0,ga=GAKUHU, svg=savedata.gakuhu, len=svg.length;i<len;i++){
		s.gakuhu[i]=new Sprite(108,18);
		s.gakuhu[i].image=new Surface(108,18);
		s.gakuhu[i].x=320/3*2;
		s.gakuhu[i].y=17*i;
		s.gakuhu[i].image.context.fillStyle="black";
		s.gakuhu[0].image.context.fillStyle="#005";
		s.gakuhu[i].image.context.strokeStyle="white";
		RoundRect(s.gakuhu[i].image,0,0,106,17,4,1);
		RoundRect(s.gakuhu[i].image,0,0,106,17,4,0);
		s.gakuhu[i].image.context.fillStyle="white";
		s.gakuhu[i].image.context.textBaseline = 'top';
		s.gakuhu[i].image.context.font="bold 16px 'ＭＳ ゴシック'";
		s.gakuhu[i].image.context.fillText(ga[svg[i]].name,0,0,100);
		s.gakuhu[i].number=i;

		s.gakuhu[i].ontouchstart=function(){
			var ga=GAKUHU, svg=savedata.gakuhu, sg=s.gakuhu[s.iti];
			sg.image.context.fillStyle="black";
			sg.image.context.strokeStyle="white";
			RoundRect(sg.image,0,0,106,17,4,1);
			RoundRect(sg.image,0,0,106,17,4,0);
			sg.image.context.fillStyle="white";
			sg.image.context.textBaseline = 'top';
			sg.image.context.font="bold 16px 'ＭＳ ゴシック'";
			sg.image.context.fillText(ga[svg[s.iti]].name,0,0,100);
			s.iti=this.number;
			this.image.context.fillStyle="#000055";
			this.image.context.strokeStyle="white";
			RoundRect(this.image,0,0,106,17,4,1);
			RoundRect(this.image,0,0,106,17,4,0);
			this.image.context.fillStyle="white";
			this.image.context.textBaseline = 'top';
			this.image.context.font="bold 16px 'ＭＳ ゴシック'";
			this.image.context.fillText(ga[svg[s.iti]].name,0,0,100);
			s.setumeiLabel.text=ga[svg[this.number]].name+"<BR>消費MP"+ga[svg[this.number]].mp+"<BR>"+ga[svg[this.number]].setumei;
		}

		s.addChild(s.gakuhu[i]);

	}
	s.iti=0;
	s.setumeiLabel.text=GAKUHU.onpa.name+"<BR>消費MP"+GAKUHU.onpa.mp+"<BR>"+GAKUHU.onpa.setumei;
	s.onenterframe=function(){
		if(game.input.touch.downstart)game.popScene();
		else if(game.input.touch.leftstart)game.replaceScene(AutoPianoScene(this.iti));
		else if(game.input.touch.leftupstart)game.replaceScene(MinagaraPianoScene(this.iti));
	};

    return s;
};

var TuyosaScene=function(){
	var s=new Scene();
	TouchCtrl(s);
	var x=160,y=0;
	s.addChild(WindowCreator(x,y,x,x));
	var l=new Label("",x+5,y+5);
	l.width=140;
	var sv=savedata;
	l.text= "レベル : "+sv.level+
	" <BR>最大HP : "+sv.maxhp+
	" <BR>最大MP : "+sv.maxmp+
	" <BR>攻撃力 : "+sv.atk+
	" <BR>防御力 : "+sv.def+
	" <BR> <BR>経験値あと "+(sv.expTable-sv.exp)+" <BR>でレベルアップ";
	s.addChild(l);
	s.onenterframe=function(){
		if(game.input.touch.start)game.popScene();
	};

    return s;

};

var FieldMagicList=function(s){
	s.gakuhu=[];
	for(var i=0;i<fmn.length;i++){
		s.gakuhu[i]=new Sprite(108,18);
		s.gakuhu[i].image=new Surface(108,18);
		s.gakuhu[i].x=320/3+~~(i/3)*320/3;
		s.gakuhu[i].y=17*(i%3)*2+~~(i/3)%2*17;
		s.gakuhu[i].image.context.fillStyle="black";
		s.gakuhu[i].image.context.strokeStyle="white";
		RoundRect(s.gakuhu[i].image,0,0,106,17,4,1);
		RoundRect(s.gakuhu[i].image,0,0,106,17,4,0);
		s.gakuhu[i].image.context.fillStyle="white";
		s.gakuhu[i].image.context.textBaseline = 'top';
		s.gakuhu[i].image.context.font="bold 16px 'ＭＳ ゴシック'";
		s.gakuhu[i].image.context.fillText(GAKUHU[fmn[i]].name,0,0,100);
		s.gakuhu[i].name=fmn[i];
		s.gakuhu[i].visible=false;
		s.gakuhu[i].ontouchstart=function(){
			GAKUHU[this.name].magic();
		}
		s.gakuhu[i].onenterframe=function(){
			var ipt=game.input;
	    	if(ipt.down||ipt.left||ipt.right||ipt.up||scene.isSentaku)this.visible=false;
	    	else if(isMagicActive[GAKUHU[this.name].number]) this.visible=true;
		}
		s.addChild(s.gakuhu[i]);

	}
};
var SentouMagicList=function(s){
	s.gakuhu=[];
	for(var i=0;i<smn.length;i++){
		s.gakuhu[i]=new Sprite(108,18);
		s.gakuhu[i].image=new Surface(108,18);
		s.gakuhu[i].x=~~(i/6)*320/3;
		s.gakuhu[i].y=17*(i%6)*2+~~(i/6)%2*17;
		s.gakuhu[i].image.context.fillStyle="black";
		s.gakuhu[i].image.context.strokeStyle="white";
		RoundRect(s.gakuhu[i].image,0,0,106,17,4,1);
		RoundRect(s.gakuhu[i].image,0,0,106,17,4,0);
		s.gakuhu[i].image.context.fillStyle="white";
		s.gakuhu[i].image.context.textBaseline = 'top';
		s.gakuhu[i].image.context.font="bold 16px 'ＭＳ ゴシック'";
		s.gakuhu[i].image.context.fillText(GAKUHU[smn[i]].name,0,0,100);
		s.gakuhu[i].name=smn[i];
		s.gakuhu[i].visible=false;
		s.gakuhu[i].ontouchstart=function(){
			if(GAKUHU[this.name].mp>savedata.mp){
				sentou.tl.delay(1).then(function(){
					MessageWindowCt(["MPが足りない!"]);
				});
			}else{
				GAKUHU[this.name].magic();
			}
		}
		s.gakuhu[i].onenterframe=function(){
			if(sentou.isMessage || sentou.isSentaku)this.visible=false;
			else if(isMagicActive[GAKUHU[this.name].number]) this.visible=true;
		}
		s.addChild(s.gakuhu[i]);

	}
};



//
var KenbansAdd=function(s){
	var k=Kenbans;
	for(var i=0;i<8;i++)s.addChild(k[k.name[i]]);
    for(var i=0;i<7;i++)if(k.names[i])s.addChild(k[k.names[i]]);
};

var ModoruCreator=function(s,x,y){
	s.addChild(WindowCreator(x,y,50,30));
	s.addChild(new Label("戻る",x+5,y+5));
};


var Kenbans;
var map;
var game;
var player;
var stage;
var scene;

//状態の定義
var JYOUTAI = {
    Idle : 0,       // 立ち状態
    Walk : 1,       // 歩き状態
};

//プレイヤー
var Player = enchant.Class.create(Sprite, {
    initialize : function(){
        Sprite.call(this, 32, 32);
        var image = new Surface(96, 128);
        image.draw(game.assets['images/chara0.png'], 0, 0, 96, 128, 0, 0, 96, 128);
        ColorChange(image.context,96,128,[2,2.5,1.5],[3,3,3]);
        this.image = image;
        this.x = 8;
        this.y = 0;
        this.canWalk = true;

        this.jyoutai = JYOUTAI.Idle;
        this.direction = 0;
        this.animCount = 1;
        this.canSentou=false;
        this.collideWith = [];
        this.control = true;
    },
    onenterframe : function(){
        var input = { x:0, y:0, d:this.direction };
        var gin=game.input,jyo=JYOUTAI;
        if (gin.up ) {
            input.d = this.control ? 3 : 0;
            input.y = this.control ?-1 : 1;
        } else if (gin.down) {
            input.d = this.control ? 0 : 3;
            input.y = this.control ? 1 :-1;
        } else if (gin.left) {
            input.d = this.control ? 1 : 2;
            input.x = this.control ? -1: 1;
        } else if (gin.right) {
            input.d = this.control ? 2 : 1;
            input.x = this.control ? 1 :-1;
        }
        this.animCount ++;
        switch(this.jyoutai){
            case jyo.Idle:
                this.frame = this.direction * 3 + 1;
                this.animCount = 0;

                if(this.canWalk){
                    // 移動
                    this.direction = input.d;
                    if (input.x || input.y) {
                        var _x = this.x + input.x * 16;
                        var _y = this.y + input.y * 16;
                        var enemies = this.findEnemies(_x + 16, _y + 24);
                        var m=map;
                        if (-8 <= _x && _x < m.width && -16 <= _y && _y < m.height &&
                            !m.hitTest(_x + 16, _y + 16) && enemies.length < 1) {
                            this.jyoutai = jyo.Walk;
                            this.tl.moveTo(_x, _y, 4).then(function(){
                                this.animCount = 0;
                                this.jyoutai = jyo.Idle;
                                if(this.canSentou)if(Math.random()<0.05)EnemySet();

                            });

                        }
                    }
                }
                break;

            case jyo.Walk:
                this.frame = this.direction * 3 + (this.animCount % 3);
                break;
        }

    },
    setPosition : function(x, y){
        this.x = x * 16 - 8;
        this.y = y * 16 - 16;

        return this;
    },
    getPositionX:function(){
    	return (this.x+8)/16;
    },
    getPositionY:function(){
    		return (this.y+16)/16;
    },
    findEnemies : function(x, y){
        var out = [];
        this.collideWith.forEach(function(item){
            if(item.x < x && x < item.x + item.width &&
                item.y < y && y < item.y + item.height){
                out[out.length] = item;
            }
        });
        return out;
    }
});

//to:0~5, 0:= , 1:+ , 2:- , 3:* , 4:/
var ColorChange=function(context,w,h,rgb,rgbto){

	var color=context.getImageData(0,0,w,h);
	for(var i=0,l=color.data.length;i<l;i+=4){
		for(var j=0;j<3;j++){
			switch (rgbto[j]) {
			case 0:
				color.data[i+j]=rgb[j];
				break;
			case 1:
				color.data[i+j]+=rgb[j];
				break;
			case 2:
				color.data[i+j]-=rgb[j];
				break;
			case 3:
				color.data[i+j]*=rgb[j];
				break;
			case 4:
				color.data[i+j]/=rgb[j];
				break;
			}
		}
    }
	context.putImageData(color,0,0);
};

//p 0:r<->g, 1:r<->b, 2:g<->b
var ColorSwap=function(context,w,h,p){
	var color=context.getImageData(0,0,w,h);
	switch (p) {
	case 0:
		for(var i=0,l=color.data.length;i<l;i+=4){
			p=color.data[i];
			color.data[i]=color.data[i+1];
			color.data[i+1]=p;
		}
		break;
	case 1:
		for(var i=0,l=color.data.length;i<l;i+=4){
			p=color.data[i];
			color.data[i]=color.data[i+2];
			color.data[i+2]=p;
		}
		break;
	case 2:
		for(var i=0,l=color.data.length;i<l;i+=4){
			p=color.data[i+1];
			color.data[i+1]=color.data[i+2];
			color.data[i+2]=p;
		}
		break;
	}

	context.putImageData(color,0,0);
};

//敵画像
var EnemyImage = enchant.Class.create(enchant.Sprite, {
  initialize : function(id,x,y){
      enchant.Sprite.call(this, 32, 32);
      var image = new Surface(32, 32);
      image.draw(game.assets['images/chara6.png'], ((id % 9)+0.1) * 32, (~~(id/9)+0.2)*32, 32, 32, 0, 0, 32, 32);
      this.image = image;
      this.x=160;this.y=160;
      if(y!==undefined)this.setScale(x,y);
      else if(x!==undefined)this.setScale(x);
      this.c=0;
  },
  setScale:function(x,y){
	  this.scaleX=x;
	  if(y===undefined){
		  this.scaleY=x;
	  }else{
		  this.scaleY=y;
	  }
  }
});

//NPC
var NPC = enchant.Class.create(enchant.Sprite, {
  initialize : function(id,text,x,y){
      enchant.Sprite.call(this, 32, 32);
      var image = new Surface(32, 32);
      if(id<100){
      	image.draw(game.assets['images/chara0.png'], (id % 9) * 32, ~~(id/9)*32, 32, 32, 0, 0, 32, 32);
      }else if(id>=100 && id<200){
      	id-=100;
      	image.draw(game.assets['images/chara5.png'], (id % 9) * 32, ~~(id/9)*32, 32, 32, 0, 0, 32, 32);
      }else if(id>=200){
      	id-=200;
      	image.draw(game.assets['images/chara6.png'], (id % 9) * 32, ~~(id/9)*32, 32, 32, 0, 0, 32, 32);
      }
      this.image = image;
      this.talktext=text || ["……。"];
      this.pl=player;
      this.i=game.input;
      if(y!==undefined)this.setPosition(x, y);
      this.pl.collideWith.push(this);
  },
  setPosition : function(x, y){
      this.x = x * 16 - 8;
      this.y = y * 16 - 16;
      return this;
  },
  onenterframe : function(){
      if(this.startTalk()&&(this.pl.canWalk)){
      	MessageWindowCt(this.talktext);
      	if(this.ef)scene.mswin.endFunc2=this.ef;
      }
  },
  startTalk : function(){
      // プレイヤーが上にいるとき, 右にいるとき, 左にいるとき, 下にいるとき
      return  (this.pl.x == this.x && this.pl.y == this.y - 32 && this.i.down) ||
              (this.pl.x == this.x + 16 && this.pl.y == this.y && this.i.left) ||
              (this.pl.x == this.x - 16 && this.pl.y == this.y && this.i.right) ||
              (this.pl.x == this.x && this.pl.y == this.y + 16 && this.i.up);
  }
});


//宝箱
var Takara = enchant.Class.create(enchant.Sprite, {
    initialize : function(item,x,y){
        enchant.Sprite.call(this, 16, 16);
        var image = new Surface(16, 16);
        image.draw(game.assets['images/map1.png'], 11 * 16, 16, 16, 16, 0, 0, 16, 16);
        this.image = image;
        if(y!==undefined)this.setPosition(x, y);
        this.item=item;
        this.pl=player;
        this.i=game.input;
        this.pl.collideWith.push(this);
        this.isTakara=true;
    },
    setPosition : function(x, y){
        this.x = x * 16 ;
        this.y = y * 16 ;
        return this;
    },
    onenterframe : function(){

        if(this.isItemGet()&&(this.pl.canWalk)){
			this.pl.collideWith.splice(this.pl.collideWith.indexOf(this),1);
			MessageWindowCt([GAKUHU[this.item].name+"の楽譜を手に入れた!"]);
			if(this.ef)scene.mswin.endFunc2=this.ef;
			var i=savedata.gakuhu.length;
			savedata.gakuhu[i]=this.item;
			game.pushScene(AutoPianoScene(i));
			stage.removeChild(this);
        }
    },
    checkData:function(){
    	for(var i=0;i<savedata.gakuhu.length;i++){
    		if(this.item===savedata.gakuhu[i]){
    			this.pl.collideWith.splice(this.pl.collideWith.indexOf(this),1);
    			stage.removeChild(this);
    		}
    	}
    },
    isItemGet : function(){
        // プレイヤーが上にいるとき, 右にいるとき, 左にいるとき, 下にいるとき
        return  (this.pl.x == this.x - 8 && this.pl.y == this.y - 32 && this.i.down) ||
                (this.pl.x == this.x + 8 && this.pl.y == this.y - 16 && this.i.left) ||
                (this.pl.x == this.x - 24 && this.pl.y == this.y -16  && this.i.right) ||
                (this.pl.x == this.x - 8 && this.pl.y == this.y  && this.i.up);
    }
});

//看板
var Kanban = enchant.Class.create(enchant.Sprite, {
    initialize : function(text,x,y){
        enchant.Sprite.call(this, 16, 16);
        var image = new Surface(16, 16);
        image.draw(game.assets['images/map1.png'], 11 * 16, 3.5*16, 16, 16, 0, 0, 16, 16);
        this.image = image;
        this.talktext=text || ["……。"];
        if(y!==undefined)this.setPosition(x, y);
        this.pl=player;
        this.i=game.input;
        this.pl.collideWith.push(this);
    },
    setPosition : function(x, y){
        this.x = x * 16 ;
        this.y = y * 16 ;
        return this;
    },
    onenterframe : function(){
        if(this.startTalk()){
        	if(this.pl.canWalk)MessageWindowCt(this.talktext);
        }
    },
    startTalk : function(){
    	// プレイヤーが上にいるとき, 右にいるとき, 左にいるとき, 下にいるとき
        return  (this.pl.x == this.x - 8 && this.pl.y == this.y - 32 && this.i.down) ||
                (this.pl.x == this.x + 8 && this.pl.y == this.y - 16 && this.i.left) ||
                (this.pl.x == this.x - 24 && this.pl.y == this.y -16  && this.i.right) ||
                (this.pl.x == this.x - 8 && this.pl.y == this.y  && this.i.up);
    }
});

var Ido = enchant.Class.create(enchant.Sprite, {
    initialize : function(x,y){
        enchant.Sprite.call(this, 16, 16);
        var image = new Surface(16, 16);
        image.draw(game.assets['images/map1.png'], 5 * 16, 12*16, 16, 16, 0, 0, 16, 16);
        this.image = image;
        if(y!==undefined)this.setPosition(x, y);
        this.pl=player;
        this.i=game.input;
        this.pl.collideWith.push(this);
    },
    setPosition : function(x, y){
        this.x = x * 16 ;
        this.y = y * 16 ;
        return this;
    },
    onenterframe : function(){
        if(this.startTalk()&&(this.pl.canWalk)){
        	if(savedata.gakuhu[savedata.gakuhu.length-1]==="bunbun" && savedata.level>1){
        		MessageWindowCt(["どうやら魔界につながっているらしい","どうする？"]);
        		scene.mswin.endFunc=function(){
        			YesNo("入る","入らない",function(){SuperReplaceScene(MakaiEnterScene(),false);},function(){MessageWindowCt(["あとにしよう"]);})
        		};
        	}else{
        		MessageWindowCt(["暗くて様子がわからない"]);
        	}
        }
    },
    startTalk : function(){
    	// プレイヤーが上にいるとき, 右にいるとき, 左にいるとき, 下にいるとき
        return  (this.pl.x == this.x - 8 && this.pl.y == this.y - 32 && this.i.down) ||
                (this.pl.x == this.x + 8 && this.pl.y == this.y - 16 && this.i.left) ||
                (this.pl.x == this.x - 24 && this.pl.y == this.y -16  && this.i.right) ||
                (this.pl.x == this.x - 8 && this.pl.y == this.y  && this.i.up);
    }
});

//はい　いいえ
var YesNo=function(ytext,ntext,yFunc,nFunc){
	player.canWalk=false;
	var s=scene;
	s.yes=new Sprite(108,21);
	s.yes.image=new Surface(108,21);
	s.yes.x=50;
	s.yes.y=150;
	s.yes.image.context.fillStyle="black";
	s.yes.image.context.strokeStyle="white";
	RoundRect(s.yes.image,0,0,106,17,4,1);
	RoundRect(s.yes.image,0,0,106,17,4,0);
	s.yes.image.context.fillStyle="white";
	s.yes.image.context.textBaseline = 'top';
	s.yes.image.context.font="bold 16px 'ＭＳ ゴシック'";
	s.yes.image.context.fillText(ytext,0,0,100);
	s.yes.Func=yFunc;
	s.yes.ontouchstart=function(){
		this.tl.delay(1).then(function(){
			player.canWalk=true;
			this.Func();
			scene.removeChild(this.no);
			scene.removeChild(this);
			delete this.no,this;
		});
	}
	s.yes.onenterframe=function(){
		player.canWalk=false;
	}
	s.no=new Sprite(108,21);
	s.no.image=new Surface(108,21);
	s.no.x=170;
	s.no.y=150;
	s.no.image.context.fillStyle="black";
	s.no.image.context.strokeStyle="white";
	RoundRect(s.no.image,0,0,106,17,4,1);
	RoundRect(s.no.image,0,0,106,17,4,0);
	s.no.image.context.fillStyle="white";
	s.no.image.context.textBaseline = 'top';
	s.no.image.context.font="bold 16px 'ＭＳ ゴシック'";
	s.no.image.context.fillText(ntext,0,0,100);
	s.no.Func=nFunc;
	s.no.ontouchstart=function(){
		this.tl.delay(1).then(function(){
			player.canWalk=true;
			this.Func();
			scene.removeChild(this.yes);
			scene.removeChild(this);
			delete this.yes,this;
		});
	}
	s.no.yes=s.yes;
	s.yes.no=s.no;
	s.addChild(s.no);
	s.addChild(s.yes);
}


//魔法が以下の効果を選択の時
var Sentaku=function(arr,f){
	player.canWalk=false;
	var s=isSentouScene?sentou:scene;
	s.isSentaku=true;
	s.SentakuList=[];
	arr[arr.length]="戻る";
	arr[arr.length]=f?f:function(){};
	for(var j=0,i=0,len=arr.length;i<len;i+=2,j++){
		s.SentakuList[j]=new Sprite(201,21);
		var sl=s.SentakuList[j];
		sl.image=new Surface(201,21);
		sl.x=60;
		sl.y=j*40+40;
		sl.image.context.fillStyle="black";
		sl.image.context.strokeStyle="white";
		RoundRect(sl.image,0,0,200,17,4,1);
		RoundRect(sl.image,0,0,200,17,4,0);
		sl.image.context.fillStyle="white";
		sl.image.context.textBaseline = 'top';
		sl.image.context.font="bold 16px 'ＭＳ ゴシック'";
		sl.image.context.fillText(arr[i],0,0,200);
		sl.Func=arr[i+1];
		sl.num=j;
		sl.ontouchstart=function(){
			this.tl.delay(1).then(function(){
				player.canWalk=true;
				this.Func(this.num);
				var sc=null;
				if(isSentouScene){
					sc=sentou;
				}else{
					sc=scene;
				}
				for(var i=0,len=sc.SentakuList.length;i<len;i++){
					sc.removeChild(sc.SentakuList[i]);
				}
				sc.SentakuList=null;
				sc.isSentaku=false;
			});
		}
		sl.onenterframe=function(){
			player.canWalk=false;
		}

		s.addChild(sl);
	}

}

//メッセージウィンドウの
var MessageWindowCt=function(text,s){
	if(isSentouScene)s=s || sentou;
	else s=s || scene;
	game.input.touch.start=false;
	s.isMessage=true;
	player.canWalk=false;
	s.mst.stack=text;
	s.mst.text=(typeof text[0]==="function")?text[0]():text[0];
	s.mswin.visible=true;
	s.mscount=0;
};
//メッセージを次に進める.なかったら消す。
var MessageNext=function(s){
	if(isSentouScene)s=s || sentou;
	else s=s || scene;
	s.mscount++;
	if(s.mst.stack.length<=s.mscount){
		s.mst.text="";
		s.mst.stack=null;
		s.mscount=0;
		player.canWalk=true;
		s.isMessage=false;
		s.mswin.visible=false;
		if(s.mswin.endFunc2){
			s.mswin.endFunc2();
			s.mswin.endFunc2=null;
		}

	}else{
		s.mst.text=(typeof s.mst.stack[s.mscount]==="function" )?s.mst.stack[s.mscount]():s.mst.stack[s.mscount];
		if(s.mswin.endFunc&&(s.mst.stack.length<=s.mscount+1)){
			s.mswin.endFunc();
			s.mswin.endFunc=null;
		}
	}
}
//スクロール用にまとめるやつ
var Grouping=function(children,s){
	s=s || scene;
	stage = new Group();
	var st=stage;
	for(var i=0,len=children.length;i<len;i++){
		if(children[i] instanceof Array){
			for(var j=0,len2=children[i].length;j<len2;j++){
				st.addChild(children[i][j]);
				if(children[i][j].isTakara)children[i][j].checkData();
			}
		}else {
			st.addChild(children[i]);
			if(children[i].isTakara)children[i].checkData();
		}
	}
	st.onenterframe=Scroll;
	Scroll();
    s.addChild(st);
}

//mapスクロール
var Scroll=function (){
	var m=map, g=game;
	var x = Math.min((g.width  - 16) / 2 - player.x, 0);
    var y = Math.min((g.height - 16) / 2 - player.y, 0);
    x = Math.max(g.width,  x + m.width)  - m.width;
    y = Math.max(g.height, y + m.height) - m.height;
    stage.x = x;
    stage.y = y;
}

//画面９分割タッチイベント
var TouchCtrl=function(s){

	if(isSentouScene)s=s || sentou;
	else s=s || scene;

	s.on('touchstart',function(e){
		var t=game.input.touch;
		t.start   =true;
		var size=320/3;
		if(e.x <size){
			if(e.y <size){
				t.leftupstart=true;
				t.leftup=true;
			}else if(e.y <size*2){
				t.leftstart=true;
				t.left=true;
			}else{
				t.leftdownstart=true;
				t.leftdown=true;
			}
		}else if(e.x < size*2){
			if(e.y <size){
				t.upstart=true;
				t.up=true;
			}else if(e.y <size*2){
				t.centerstart=true;
				t.center=true;
			}else{
				t.downstart=true;
				t.down=true;
			}
		}else{
			if(e.y <size){
				t.rightupstart=true;
				t.rightup=true;
			}else if(e.y <size*2){
				t.rightstart=true;
				t.right=true;
			}else{
				t.rightdownstart=true;
				t.rightdown=true;
			}
		}
	});
//	s.on('touchmove',function(e){
//		var size=320/3;
//		var t=game.input.touch;
//		t.leftup   =false;
//		t.up       =false;
//		t.rightup  =false;
//		t.left     =false;
//		t.center   =false;
//		t.right    =false;
//		t.leftdown =false;
//		t.down     =false;
//		t.rightdown=false;
//		if(e.x <size){
//			if(e.y <size){
//				t.leftup=true;
//			}else if(e.y <size*2){
//				t.left=true;
//			}else{
//				t.leftdown=true;
//			}
//		}else if(e.x < size*2){
//			if(e.y <size){
//				t.up=true;
//			}else if(e.y <size*2){
//				t.center=true;
//			}else{
//				t.down=true;
//			}
//		}else{
//			if(e.y <size){
//				t.rightup=true;
//			}else if(e.y <size*2){
//				t.right=true;
//			}else{
//				t.rightdown=true;
//			}
//		}
//	});
	s.on('touchend',function(){
		var t=game.input.touch;
//		t.leftup   =false;
//		t.up       =false;
//		t.rightup  =false;
//		t.left     =false;
//		t.center   =false;
//		t.right    =false;
//		t.leftdown =false;
//		t.down     =false;
//		t.rightdown=false;
	});
}

//フィールドのシーンに追加するような奴
var FieldAdd=function(s){
	s=s || scene;
	var pad = new Pad();
    pad.x = 5;
    pad.y = 215;
    s.addChild(pad);




    s.stwin=WindowCreator(320/3*2+30,320/3*2+30,78,78);
    s.stwin.label=new Label("強さを<BR>見る<BR>HP:"+savedata.hp+" <BR>MP:"+savedata.mp,s.stwin.x+5,s.stwin.y+7);
    s.stwin.onenterframe=function(){
    	var ipt=game.input;
    	if(ipt.down||ipt.left||ipt.right||ipt.up){
    		this.visible=false;
    		this.label.visible=false;
    	}else{
    		this.visible=true;
    		this.label.visible=true;
        	this.label.text="強さを<BR>見る<BR>HP:"+savedata.hp+" <BR>MP:"+savedata.mp;
    	}
    };
    s.addChild(s.stwin);
    s.addChild(s.stwin.label);


    s.minigakuhu=new Sprite(30,30);
    s.minigakuhu.image=new Surface(30,30);
    s.minigakuhu.image.context.fillStyle="white";
    RoundRect(s.minigakuhu.image, 0, 0, 29, 29, 10, 1);
    RoundRect(s.minigakuhu.image, 0, 0, 29, 29, 10, 0);
    s.minigakuhu.image.context.fillStyle="black";
    s.minigakuhu.image.context.font="bold 24px 'ＭＳ ゴシック'";
    s.minigakuhu.image.context.fillText("♪",2,23);
    s.minigakuhu.x=320-50;
    s.minigakuhu.y=160;
    s.minigakuhu.onenterframe=function(){
    	var ipt=game.input;
    	if(ipt.down||ipt.left||ipt.right||ipt.up)this.visible=false;
    	else this.visible=true;
    };
    s.addChild(s.minigakuhu);

    s.miniken=new Sprite(30,30);
    s.miniken.image=new Surface(30,30);
    for(var i=0;i<3;i++){
    	s.miniken.image.context.fillStyle="white";
    	s.miniken.image.context.fillRect(i*9,0,9,29);
    	s.miniken.image.context.strokeRect(i*9,0,9,29);
    }
    for(var i=0;i<2;i++){
    	s.miniken.image.context.fillStyle="black";
    	s.miniken.image.context.fillRect(i*9+5,0,7,15);
    }
    s.miniken.x=50;
    s.miniken.y=50;
    s.miniken.onenterframe=s.minigakuhu.onenterframe;
    s.addChild(s.miniken);

    s.mswin=WindowCreator(0,320-111,320,110);
    s.addChild(s.mswin);
    s.mswin.visible=false;
    s.mscount=0;
    s.mst=new Label();
    s.mst.width=300;
    s.mst.x=5;
    s.mst.y=320-105;
    s.addChild(s.mst);

    FieldMagicList(s);
};




//戦闘シーンに追加するような奴
var SentouAdd=function(s){
	s=s || sentou;
//	var pad = new Pad();
//	  pad.x = 5;
//	  pad.y = 215;
//	  s.addChild(pad);




  s.stwin=WindowCreator(320/3*2+30,320/3+30,78,78);
  s.stwin.label=new Label("HP:"+savedata.hp+"<BR> <BR> <BR>MP:"+savedata.mp,s.stwin.x+5,s.stwin.y+7);
  s.stwin.onenterframe=function(){
      	this.label.text="HP:"+savedata.hp+"<BR> <BR> <BR>MP:"+savedata.mp;
  };
  s.addChild(s.stwin);
  s.addChild(s.stwin.label);


  s.minigakuhu=new Sprite(30,30);
  s.minigakuhu.image=new Surface(30,30);
  s.minigakuhu.image.context.fillStyle="white";
  RoundRect(s.minigakuhu.image, 0, 0, 29, 29, 10, 1);
  RoundRect(s.minigakuhu.image, 0, 0, 29, 29, 10, 0);
  s.minigakuhu.image.context.fillStyle="black";
  s.minigakuhu.image.context.font="bold 24px 'ＭＳ ゴシック'";
  s.minigakuhu.image.context.fillText("♪",2,23);
  s.minigakuhu.x=320-50;
  s.minigakuhu.y=160;

  s.addChild(s.minigakuhu);

  s.miniken=new Sprite(30,30);
  s.miniken.image=new Surface(30,30);
  for(var i=0;i<3;i++){
  	s.miniken.image.context.fillStyle="white";
  	s.miniken.image.context.fillRect(i*9,0,9,29);
  	s.miniken.image.context.strokeRect(i*9,0,9,29);
  }
  for(var i=0;i<2;i++){
  	s.miniken.image.context.fillStyle="black";
  	s.miniken.image.context.fillRect(i*9+5,0,7,15);
  }
  s.miniken.x=50;
  s.miniken.y=270;
  s.addChild(s.miniken);


  s.mswin=WindowCreator(0,320-111,320,110);
  s.addChild(s.mswin);
  s.mswin.visible=false;
  s.mscount=0;
  s.mst=new Label();
  s.mst.width=300;
  s.mst.x=5;
  s.mst.y=320-105;
  s.addChild(s.mst);

  SentouMagicList(s);

  //s.mst.getLen=function(){return this.stack.length;};
  s.mst.txtAdd=function(t){ this.stack=this.stack.concat(t)};

};


//枠を作る
var WindowCreator=function(x,y,width,height){
	var c=new Sprite(width+1,height+1);
    c.image=new Surface(width+10,height+10);
    c.x=x;
    c.y=y;
    c.image.context.fillStyle="black";
    c.image.context.strokeStyle="white";
    c.image.context.lineWidth=3;
    RoundRect(c.image, 0, 0, width, height, 10, 1);
    RoundRect(c.image, 0, 0, width, height, 10, 0);
    return c;
};

//角丸
var RoundRect= function(c, x, y, width, height, radius, isFill) {
    var l = x + radius;
    var r = x + width - radius;
    var t = y + radius;
    var b = y + height - radius;
    c = c.context;
    c.beginPath();
    c.arc(l, t, radius,     -Math.PI, -Math.PI*0.5, false);  // 左上
    c.arc(r, t, radius, -Math.PI*0.5,            0, false);  // 右上
    c.arc(r, b, radius,            0,  Math.PI*0.5, false);  // 右下
    c.arc(l, b, radius,  Math.PI*0.5,      Math.PI, false);  // 左下
    c.closePath();
    if(isFill)c.fill();else c.stroke();
};


window.onload = function() {
    game = new Game();

	game.memory.player.preload();
    game.fps=60;
	game.input.touch={};
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
		"piano/do2.mp3",
		"images/chara0.png",
		"images/chara5.png",
		"images/chara6.png",
		"images/map1.png");
    game.onload = function() {
	var scene = game.rootScene;
	game.background="black";
	var d=game.memory.player.data;
	console.log(d.savedataList);
	if(d.savedataList){
		for(var i=0,sL=savedataList,dsL=d.savedataList,len=dsL.length;i<len;i++){
			if(dsL[i].name){
				for(var k in dsL[i]){
					if(k==="gakuhu"){
						for(var j=0,ga=sL[i][k],dga=dsL[i][k],len2=dga.length;j<len2;j++){
							ga[j]=dga[j];
						}
					}else{
						sL[i][k]=dsL[i][k];
					}
				}
			}
		}
		if(savedataList[0].name){
			var sL=savedataList[0];
			var sv=savedata;
			for(var k in sL){
				if(k==="gakuhu"){
					for(var i=0,len=sL[k].length;i<len;i++){
						sv[k][i]=sL[k][i];
					}
				}else{
					sv[k]=sL[k];
				}
			}
		}
	}else{
		game.memory.player.data.savedataList=[];
		var sL=game.memory.player.data.savedataList;
		for(var i=0;i<5;i++){
			sL[i]={name:"",gakuhu:[]};
		}
	}
	console.log(savedata);
	console.log(savedataList);

	/*
	 *鍵盤
	 */
	Kenbans= {
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
            namesj:["ド♯","レ♯","","ファ♯","ソ♯","ラ♯"],
            n:[],
            nn:["do1","do1s","re","res","mi","fa","fas","so","sos","ra","ras","si","do2"],
            KL:['A','W','S','E','D','F','T','G','Y','H','U','J','K']
        };

	for(var i=0;i<8;i++){
        var sprite=Kenbans[Kenbans.name[i]];
        sprite.image = new Surface(SPRITE_WIDTH+1, SPRITE_HEIGHT+1);
        // canvas 描画
        sprite.image.context.fillStyle = "white";
        sprite.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        sprite.image.context.lineWidth=4;
        sprite.image.context.strokeStyle = "black";
        sprite.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);

        sprite.x=i*SPRITE_WIDTH;
        sprite.y=SPRITE_HEIGHT*2;
        sprite.otoname=Kenbans.namej[i];
        sprite.sepath=SE_PATH[Kenbans.name[i]];
        sprite.ontouchstart=function(){
            this.image.context.fillStyle = "blue";
            this.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
            this.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        	game.assets[this.sepath].clone().play();
        	var en=ensou;
        	en[en.length]=this.number;
        	//すべての楽譜に対して演奏があってるか判定
        	for(var i=0,ga=gakuhus,len=ga.length;i<len;i++){
        		for(var j=0,len2=en.length-ga[i].s.length+1;j<len2;j++){
        			if(en.slice(j,j+ga[i].s.length).join()===ga[i].s.join()){
        				isMagicActive[i]=true;
        			}
        		}
        	}
        };

        sprite.ontouchend=function(){
            this.image.context.fillStyle = "white";
            this.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
            this.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        };

        sprite.setRed=function(){
            this.image.context.fillStyle = "red";
            this.image.context.fillRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
            this.image.context.strokeRect(0, 0, SPRITE_WIDTH, SPRITE_HEIGHT);
        }
        sprite.onenterframe=function(){
        	if(game.input[this.key+'buttondown'])this.ontouchstart();
        	else if(game.input[this.key+'buttonup'])this.ontouchend();
        }
    }
    for(var i=0;i<7;i++){
        if(Kenbans.names[i]){
            var sprite=Kenbans[Kenbans.names[i]];
            sprite.image =  new Surface(SPRITE_WIDTH, ~~SPRITE_HEIGHT/2);

            // canvas 描画
            sprite.image.context.fillStyle = "black";
            sprite.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);

            sprite.x=i*SPRITE_WIDTH+SPRITE_WIDTH/2;
            sprite.y=SPRITE_HEIGHT*2;
            sprite.otoname=Kenbans.namesj[i];
            sprite.sepath=SE_PATH[Kenbans.names[i]];
            sprite.ontouchstart=function(){
            	var en=ensou;
            	this.image.context.fillStyle="navy";
            	this.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);
            	game.assets[this.sepath].clone().play();
            	en[en.length]=this.number;
            	//すべての楽譜に対して演奏があってるか判定
            	for(var i=0,ga=gakuhus,len=ga.length;i<len;i++){
            		for(var j=0,len2=en.length-ga[i].s.length+1;j<len2;j++){
            			if(en.slice(j,j+ga[i].s.length).join()===ga[i].s.join()){
            				isMagicActive[i]=true;
            			}
            		}
            	}
            };
            sprite.ontouchend=function(){
            	this.image.context.fillStyle="black";
            	this.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);
            };

            sprite.setRed=function(){
            	this.image.context.fillStyle="maroon";
            	this.image.context.fillRect(~~SPRITE_WIDTH*0.1, 0, SPRITE_WIDTH*0.8, ~~SPRITE_HEIGHT/2);
            }

            sprite.onenterframe=function(){
            	if(game.input[this.key+'buttondown'])this.ontouchstart();
            	else if(game.input[this.key+'buttonup'])this.ontouchend();
            }
        }
    }


    for(var i=0;i<13;i++){
    	Kenbans.n[i]=Kenbans[Kenbans.nn[i]];
    	Kenbans.n[i].number=i;
    	Kenbans.n[i].key=Kenbans.KL[i];
    	game.keybind(Kenbans.KL[i].charCodeAt(0) , Kenbans.KL[i]);
    	game.on(Kenbans.KL[i]+'buttondown' ,function(e){game.input[e.type]=true;});
    	game.on(Kenbans.KL[i]+'buttonup' ,function(e){game.input[e.type]=true;});
    }


    game.on('exitframe',function(){
    	var t=game.input;
    	for(var i=0;i<13;i++){
   	    	t[Kenbans.KL[i]+'buttondown']=false;
   	    	t[Kenbans.KL[i]+'buttonup']=false;
   	    }
		t=game.input.touch;

		t.start   =false;
		t.leftupstart   =false;
		t.upstart       =false;
		t.rightupstart  =false;
		t.leftstart     =false;
		t.centerstart   =false;
		t.rightstart    =false;
		t.leftdownstart =false;
		t.downstart     =false;
		t.rightdownstart=false;
	});
    if(savedata.isDungeon){
    	game.replaceScene(MakaiEnterScene());
    }else{
    	game.replaceScene(TitleScene());
    }
    };


    game.start();
};