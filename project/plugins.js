var plugins_bb40132b_638b_4a9f_b028_d3fe47acc8d1 = 
{
    "init": function () {

	console.log("插件编写测试");

	// 可以写一些直接执行的代码
	// 在这里写的代码将会在【资源加载前】被执行，此时图片等资源尚未被加载。
	// 请勿在这里对包括bgm，图片等资源进行操作。


	this._afterLoadResources = function () {
		// 本函数将在所有资源加载完毕后，游戏开启前被执行
		// 可以在这个函数里面对资源进行一些操作，比如切分图片等。

		// 这是一个将assets.png拆分成若干个32x32像素的小图片并保存的样例。
		// var arr = core.splitImage("assets.png", 32, 32);
		// for (var i = 0; i < arr.length; i++) {
		//     core.material.images.images["asset"+i+".png"] = arr[i];
		// }

	}
	events.prototype._changeFloor_getHeroLoc = function (floorId, stair, heroLoc) {
		if (!heroLoc)
			heroLoc = core.clone(core.status.hero.loc);
		if (stair) {
			// --- 对称
			if (stair == ':now')
				heroLoc = core.clone(core.status.hero.loc);
			else if (stair == ':symmetry') {
				heroLoc.x = core.bigmap.width - 1 - core.getHeroLoc('x');
				heroLoc.y = core.bigmap.height - 1 - core.getHeroLoc('y');
			}
			else if (stair == ':symmetry_x')
				heroLoc.x = core.bigmap.width - 1 - core.getHeroLoc('x');
			else if (stair == ':symmetry_y')
				heroLoc.y = core.bigmap.height - 1 - core.getHeroLoc('y');
			// 检查该层地图的 upFloor & downFloor
			else if (core.status.maps[floorId][stair]) {
				heroLoc.x = core.status.maps[floorId][stair][0];
				heroLoc.y = core.status.maps[floorId][stair][1];
				
			}
			else {
				var blocks = core.status.maps[floorId].blocks;
				for (var i in blocks) {
					if (!blocks[i].disable && blocks[i].event.id === stair) {
						heroLoc.x = blocks[i].x;
						heroLoc.y = blocks[i].y;
						break;
					}
				}
			}
			
				// !find empty
				for(var d in core.utils.scan){
					var dx = core.utils.scan[d].x + heroLoc.x,
						dy = core.utils.scan[d].y + heroLoc.y;
					if(dx>=0 && dx <core.status.maps[floorId].width && 
						dy>=0 && dy <core.status.maps[floorId].height && 
						!core.getBlock(dx, dy, floorId)){
						heroLoc.direction = d;
						heroLoc.x=dx;
						heroLoc.y=dy;
						break;
					}
				}
		}
		['x', 'y', 'direction'].forEach(function (name) {
			if (heroLoc[name] == null)
				heroLoc[name] = core.getHeroLoc(name);
		});
		return heroLoc;
	}

	////// 接下来N个临界值和临界减伤计算 //////
	enemys.prototype.nextCriticals = function (enemy, number, x, y, floorId) {
		if (typeof enemy == 'string') enemy = core.material.enemys[enemy];
		number = number || 1;
		if(core.getBlock(x,y)){
			var info = core.getEnemyInfo(enemy,null,x,y);
			return [[info.hp,0]];
		}else{
			return [[0,0]];
		}
		
	}

	maps.prototype._moveJumpBlock_finished = function (blockInfo, canvases, info, animate, callback) {
		if (info.keep) info.opacity = 0;
		else info.opacity = 0;
		if (info.opacity <= 0) {
			delete core.animateFrame.asyncId[animate];
			clearInterval(animate);
			this._deleteDetachedBlock(canvases);
			// 不消失
			if (info.keep) {
				core.setBlock(blockInfo.number, info.x, info.y);
				core.showBlock(info.x, info.y);
			}
			if (callback) callback();
		}
		else {
			this._moveDetachedBlock(blockInfo, info.px, info.py, info.opacity, canvases);
		}
	}


	////// 绘制事件层 //////
	maps.prototype.drawEvents = function (floorId, blocks, layer) {
		floorId = floorId || core.status.floorId;
		if (!blocks) blocks = core.status.maps[floorId].blocks;
		var arr = this._getMapArrayFromBlocks(blocks, core.floors[floorId].width, core.floors[floorId].height);
		layer = layer || core.scenes.mapScene.getLayer('event');
		// var onMap = layer == null;
		// if (onMap) layer = //core.sprite.layer.destCtx;
		blocks.filter(function (block) {
			return block.event && !block.disable;
		}).forEach(function (block) {
			core.drawBlock(block, layer, arr);
		});
		core.drawNets(layer, floorId);
		// if (onMap) core.status.autotileAnimateObjs.map = core.clone(arr);
	}

	maps.prototype._canMoveDirectly_checkGlobal = function () {
		// 检查全塔是否禁止瞬间移动
		if (!core.flags.enableMoveDirectly) return false;
		// 检查该楼层是否不可瞬间移动
		if (core.status.thisMap.cannotMoveDirectly) return false;
		// flag:cannotMoveDirectly为true：不能
		if (core.hasFlag('cannotMoveDirectly')) return false;
		// 中毒状态：不能
		if (core.hasFlag('poison')) return false;

		if((flags.aiBlks||[]).length>0)return false;

		return true;
	}
	// 可以在任何地方（如afterXXX或自定义脚本事件）调用函数，方法为 core.plugin.xxx();
	// 从V2.6开始，插件中用this.XXX方式定义的函数也会被转发到core中，详见文档-脚本-函数的转发。
},
    "drawLight": function () {

	// 绘制灯光/漆黑层效果。调用方式 core.plugin.drawLight(...)
	// 【参数说明】
	// name：必填，要绘制到的画布名；可以是一个系统画布，或者是个自定义画布；如果不存在则创建
	// color：可选，只能是一个0~1之间的数，为不透明度的值。不填则默认为0.9。
	// lights：可选，一个数组，定义了每个独立的灯光。
	//        其中每一项是三元组 [x,y,r] x和y分别为该灯光的横纵坐标，r为该灯光的半径。
	// lightDec：可选，0到1之间，光从多少百分比才开始衰减（在此范围内保持全亮），不设置默认为0。
	//        比如lightDec为0.5代表，每个灯光部分内圈50%的范围全亮，50%以后才开始快速衰减。
	// 【调用样例】
	// core.plugin.drawLight('curtain'); // 在curtain层绘制全图不透明度0.9，等价于更改画面色调为[0,0,0,0.9]。
	// core.plugin.drawLight('ui', 0.95, [[25,11,46]]); // 在ui层绘制全图不透明度0.95，其中在(25,11)点存在一个半径为46的灯光效果。
	// core.plugin.drawLight('test', 0.2, [[25,11,46,0.1]]); // 创建一个test图层，不透明度0.2，其中在(25,11)点存在一个半径为46的灯光效果，灯光中心不透明度0.1。
	// core.plugin.drawLight('test2', 0.9, [[25,11,46],[105,121,88],[301,221,106]]); // 创建test2图层，且存在三个灯光效果，分别是中心(25,11)半径46，中心(105,121)半径88，中心(301,221)半径106。
	// core.plugin.drawLight('xxx', 0.3, [[25,11,46],[105,121,88,0.2]], 0.4); // 存在两个灯光效果，它们在内圈40%范围内保持全亮，且40%后才开始衰减。
	this.drawLight = function (name, color, lights, lightDec) {

		// 清空色调层；也可以修改成其它层比如animate/weather层，或者用自己创建的canvas
		var ctx = core.getContextByName(name);
		if (ctx == null) {
			if (typeof name == 'string')
				ctx = core.createCanvas(name, 0, 0, core.__PIXELS__, core.__PIXELS__, 98);
			else return;
		}

		ctx.mozImageSmoothingEnabled = false;
		ctx.webkitImageSmoothingEnabled = false;
		ctx.msImageSmoothingEnabled = false;
		ctx.imageSmoothingEnabled = false;

		core.clearMap(name);
		// 绘制色调层，默认不透明度
		if (color == null) color = 0.9;
		ctx.fillStyle = "rgba(0,0,0," + color + ")";
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

		lightDec = core.clamp(lightDec, 0, 1);

		// 绘制每个灯光效果
		ctx.globalCompositeOperation = 'destination-out';
		lights.forEach(function (light) {
			// 坐标，半径，中心不透明度
			var x = light[0],
				y = light[1],
				r = light[2];
			// 计算衰减距离
			var decDistance = parseInt(r * lightDec);
			// 正方形区域的直径和左上角坐标
			var grd = ctx.createRadialGradient(x, y, decDistance, x, y, r);
			grd.addColorStop(0, "rgba(0,0,0,1)");
			grd.addColorStop(1, "rgba(0,0,0,0)");
			ctx.beginPath();
			ctx.fillStyle = grd;
			ctx.arc(x, y, r, 0, 2 * Math.PI);
			ctx.fill();
		});
		ctx.globalCompositeOperation = 'source-over';
		// 可以在任何地方（如afterXXX或自定义脚本事件）调用函数，方法为  core.plugin.xxx();
	}
},

    "components": function () {
	// 一个UI可以注册多个组件，但每一类组件只能注册一个
	// 组件编写方法： 必须要返回一个至少包含启动（install）、卸载（uninstall）的对象，这个对象会被绑定作为UI的成员。UI会在注册组件时，为组件提供自身的访问接口，可以通过 this.ui 进行访问。可以获取的数据：this.ui.x this.ui.y this.ui.width this.ui.height


	// 范例1：触摸/点击交互 (使用ondown 可以捕获像素级精度)
	this.component_click = function (data) {
		var compName = data.name;
		var action = data.action;
		action.push({ "type": "function", "function": "function(){['name','x','y','width','height'].forEach(function(it){core.removeFlag('arg_'+it)})}" });

		function install() {
			// 点击时执行调用
			var x = this.ui.x;
			var y = this.ui.y;
			var w = this.ui.width;
			var h = this.ui.height;
			var name = this.ui.name;
			var self = this;

			function tmpfunc(_x, _y, px, py) {
				if (!self.ui.enable) return false;
				if (px >= x && px <= x + w && py > y && py <= y + h) {
					if (core.hasFlag('arg_name')) return false;
					core.setFlag('arg_x', x);
					core.setFlag('arg_y', y);
					core.setFlag('arg_px', px);
					core.setFlag('arg_py', py);
					core.setFlag('arg_width', w);
					core.setFlag('arg_height', h);
					core.setFlag('arg_name', name);
					core.insertAction(action);
					return true;
				}
				return false;
			}
			core.registerAction('ondown', name + compName, tmpfunc, data.param || 100); //优先级？
		}

		function uninstall() {
			var name = this.ui.name;
			core.unregisterAction('ondown', name + compName);
		}
		return { 'install': install, 'uninstall': uninstall };
	}
	// 范例2：拖动交互 (使用ondown/onup/onmove)
	this.component_drag = function (data) {
		var compName = data.name;
		var action = data.action;
		action.push({ "type": "function", "function": "function(){['name','x','y','width','height'].forEach(function(it){core.removeFlag('arg_'+it)})}" });
		var isdown = false;
		var lastX = 0;
		var lastY = 0;

		function install() {
			var x = this.ui.x;
			var y = this.ui.y;
			var w = this.ui.width;
			var h = this.ui.height;
			var name = this.ui.name;
			var self = this;

			function down(_x, _y, px, py) {
				if (!self.ui.enable) return false;
				if (px >= x && px <= x + w && py > y && py <= y + h) {
					isdown = true;
					lastX = px;
					lastY = py;
					return false;
				}
			}

			function up(_x, _y, px, py) {
				if (!self.ui.enable) return false;
				if (isdown) {
					isdown = false;
				}
			}

			function move(_x, _y, px, py) {
				if (!self.ui.enable) return false;
				if (core.hasFlag('arg_name') || !isdown) return false;
				core.setFlag('arg_lastx', lastX);
				core.setFlag('arg_lasty', lastY);
				core.setFlag('arg_x', x);
				core.setFlag('arg_y', y);
				core.setFlag('arg_px', px);
				core.setFlag('arg_py', py);
				core.setFlag('arg_width', w);
				core.setFlag('arg_height', h);
				core.setFlag('arg_name', name);
				core.insertAction(action);
				lastX = px;
				lastY = py;
				return true;
			}
			core.registerAction('ondown', name + compName, down, data.param || 100); //优先级？
			core.registerAction('onup', name + compName, up, data.param || 100);
			core.registerAction('onmove', name + compName, move, data.param || 100);
		}

		function uninstall() {
			var name = this.ui.name;
			core.unregisterAction('ondown', name + compName);
			core.unregisterAction('onup', name + compName);
			core.unregisterAction('onmove', name + compName);
		}
		return { 'install': install, 'uninstall': uninstall, isdown: false };
	}


	var keyTable = { "0": "96", "1": "97", "2": "98", "3": "99", "4": "100", "5": "101", "6": "102", "7": "103", "8": "104", "9": "105", "A": "65", "J": "74", "S": "83", "B": "66", "K": "75", "T": "84", "C": "67", "L": "76", "U": "85", "D": "68", "M": "77", "V": "86", "E": "69", "N": "78", "W": "87", "F": "70", "O": "79", "X": "88", "G": "71", "P": "80", "Y": "89", "H": "72", "Q": "81", "Z": "90", "I": "73", "R": "82", "F1": "112", "F7": "118", "F2": "113", "F8": "119", "*": "106", "F3": "114", "F9": "120", "+": "107", "F4": "115", "F10": "121", "Enter": "13", "F5": "116", "F11": "122", "-": "109", "F6": "117", "F12": "123", ".": "110", "/": "111", "BackSpace": "8", "Esc": "27", "Right": "39", "-_": "189", "Tab": "9", "Spacebar": "32", "Down": "40", ".>": "190", "Clear": "12", "PageUp": "33", "Insert": "45", "PageDown": "34", "Delete": "46", "~": "192", "Shift": "16", "End": "35", "NumLock": "144", "[{": "219", "Control": "17", "Home": "36", ";:": "186", "Alt": "18", "Left": "37", "=+": "187", "}": "221", "CapeLock": "20", "Up": "38", "<": "188", "\'": "222" };

	// 范例3：按键 (使用onkeyup)
	this.component_keyup = function (data) {
		var compName = data.name;
		var action = data.action;
		action.push({ "type": "function", "function": "function(){['name','key'].forEach(function(it){core.removeFlag('arg_'+it)})}" });
		var isdown = false;
		var lastX = 0;
		var lastY = 0;
		var piror = 0;
		var keys = {};
		var blocke = false;
		data.param.split(',').forEach(function (k) {
			if (keyTable[k]) {
				keys[keyTable[k]] = k;
			} else {
				var tmp = parseInt(k);
				if (tmp > 0) piror = tmp;
				else blocke = true;
			}
		});

		function install() {
			var x = this.ui.x;
			var y = this.ui.y;
			var w = this.ui.width;
			var h = this.ui.height;
			var name = this.ui.name;
			var self = this;

			function keydown(e) {
				if (!self.ui.enable) return false;
				if (core.hasFlag('arg_name') || !keys[e]) return blocke;
				core.setFlag('arg_key', keys[e]);
				core.setFlag('arg_name', name);
				core.insertAction(action);
				return true;
			}
			core.registerAction('keyUp', name + compName, keydown, piror);
		}

		function uninstall() {
			var name = this.ui.name;
			core.unregisterAction('keyUp', name + compName);
		}
		return { 'install': install, 'uninstall': uninstall, isdown: false };
	}

	// 范例4：延时按键 (使用onkeyup)
	this.component_keydelaydown = function (data) {
		var compName = data.name;
		var action = data.action;
		action.push({ "type": "function", "function": "function(){['name','key'].forEach(function(it){core.removeFlag('arg_'+it)})}" });
		var isdown = false;
		var lastX = 0;
		var lastY = 0;
		var piror = 0;
		var keys = {};
		var blocke = false;
		data.param.split(',').forEach(function (k) {
			if (keyTable[k]) {
				keys[keyTable[k]] = k;
			} else {
				var tmp = parseInt(k);
				if (tmp > 0) piror = tmp;
				else blocke = true;
			}
		});

		function install() {
			var x = this.ui.x;
			var y = this.ui.y;
			var w = this.ui.width;
			var h = this.ui.height;
			var name = this.ui.name;
			var self = this;

			function keydown(e) {
				if (!self.ui.enable) return false;
				if (core.hasFlag('arg_name') || !keys[e] || self.isdown) return blocke;
				core.setFlag('arg_key', keys[e]);
				core.setFlag('arg_name', name);
				self.isdown = true;
				self.itv = setTimeout(function () { self.isdown = false; }, 100); // 按住后会按每秒四次执行
				core.insertAction(action);
				return true;
			}

			function keyup(e) {
				if (core.hasFlag('arg_name') || !keys[e]) return blocke;
				if (self.itv) clearTimeout(self.itv);
				self.isdown = false;
				return true;
			}
			core.registerAction('keyUp', name + compName, keyup, piror);
			core.registerAction('keyDown', name + compName, keydown, piror);
		}

		function uninstall() {
			var name = this.ui.name;
			core.unregisterAction('keyUp', name + compName);
			core.unregisterAction('keyDown', name + compName);
		}
		return { 'install': install, 'uninstall': uninstall, isdown: false };
	}


	// 析构组件 当删除时调用action
	this.component_deconstruct = function (data) {
		var action = data.action;

		function install() {}

		function uninstall() {
			core.insertAction(action);
		}
		return { 'install': install, 'uninstall': uninstall };
	}
},
"archer":function(){
// 策划
	/*
	技能表：

	诱捕 —— 丢下一张网 怪物经过时 会被困住一回合
	灵引 —— 允许引导下次箭头的路径，最多13长度（ 录像问题？
	瞬步 —— 瞬间后退两步，拉开与怪物的距离
	强击 —— 下次射出的箭矢能够多次击穿怪物 每次穿透攻击力降低一半

	箭矢表：
	蚀甲箭 —— 箭矢造成额外伤害，数值为怪物已受到的伤害*0.2
	爆裂箭 —— 射出的箭矢附带溅射爆伤 怪物附近产生30%溅射伤害
	麻痹箭 —— 射出的箭矢让怪物变成白痴 定在原地不动一回合
	幽灵箭 —— 射出的箭矢无视一次墙壁

	*/
	main.dom.hard.onclick = function () {
		if (core.isReplaying())
			return;
		if(core.canUseItem('skill1'))
			core.useItem('skill1');
		// core.insertAction("技能盘");
	}




// ===== 逻辑
	// 射击
	var simulate = false;
	var shootUpdate = function(pos){
		var cgpt = ((flags.changePoints||{})[core.status.floorId]||[]).find(function(pt){
			return pt.x == pos.x && pt.y == pos.y;
		})
		if(cgpt && !cgpt.disable){
			core.playSound('shootChange.ogg');
			pos.direction = cgpt.direction;
			cgpt.disable = true;
		}
		var dx = core.utils.scan[pos.direction].x, dy = core.utils.scan[pos.direction].y;
		pos.x += dx;
		pos.y += dy;
		
	}
	var shootCheckBlock = function(pos, checkFunc){
		if(!(pos.x>=0 && pos.y>=0 && pos.x<core.status.thisMap.width && pos.y<core.status.thisMap.height)){
			return true;
		}
		var blk = core.getBlock(pos.x,pos.y);
		if(checkFunc.updatePosition){
			checkFunc.updatePosition(pos);
		}
		if(blk){
			var cls = blk.block.event.cls;
			if(checkFunc[cls] && checkFunc[cls](blk.block, simulate)){
				return true;
			}
		}
		return false;
	}
	var shoot = function(x,y,dir,checkFunc){
		var pos = {
			x: x,
			y: y,
			direction: dir,
		}
		do{
			shootUpdate(pos);
			if(shootCheckBlock(pos, checkFunc))
				return;
		}while(pos.x>=0 && pos.y>=0 && pos.x<core.__SIZE__ && pos.y<core.__SIZE__);
	}


	// AI反应 - 应对以下行为后调用 
	// 1 被主角射伤 - 掉血过半：逃跑 否则 追击  ?
	// 2 激活后的主角移动 ： 逼近
	// 统一处理 防止互相碰撞
	maps.prototype._canMoveHero_checkPoint = function (x, y, direction, floorId, extraData) {
		// 1. 检查该点 cannotMove
		if (core.inArray((core.floors[floorId].cannotMove || {})[x + "," + y], direction))
			return false;
	
		var nx = x + core.utils.scan[direction].x, ny = y + core.utils.scan[direction].y;
		if (nx < 0 || ny < 0 || nx >= core.floors[floorId].width || ny >= core.floors[floorId].height)
			return false;
	
		// 2. 检查该点素材的 cannotOut 和下一个点的 cannotIn
		if (this._canMoveHero_checkCannotInOut([
				extraData.bgArray[y][x], extraData.fgArray[y][x], extraData.eventArray[y][x]
			], "cannotOut", direction))
			return false;
		if (this._canMoveHero_checkCannotInOut([
				extraData.bgArray[ny][nx], extraData.fgArray[ny][nx], extraData.eventArray[ny][nx]
			], "cannotIn", direction))
			return false;
	
		// 3. 检查是否能进将死的领域
		if(flags.goDeadZone)return true;
		if (floorId == core.status.floorId
			&& core.status.hero.hp <= (core.status.checkBlock.damage[nx + "," + ny]||0)
			&& !core.flags.canGoDeadZone && extraData.eventArray[ny][nx] == 0)
			return false;
		return true;
	}
	this.bfsFlood = function (startX, startY) {
		flags.goDeadZone = true;
		var route = {}, canMoveArray = core.maps.generateMovableArray();
		flags.goDeadZone = false;
		var blockArr = core.getMapBlocksObj();
		// 使用优先队列
		var queue = new PriorityQueue({comparator: function (a,b) { return a.depth - b.depth; }});
		route[startX + "," + startY] = {'step':0};
		queue.queue({depth: 0, x: startX, y: startY});
		while (queue.length!=0) {
			var curr = queue.dequeue(), deep = curr.depth, nowX = curr.x, nowY = curr.y;
			for (var direction in core.utils.scan) {
				if (!core.inArray(canMoveArray[nowX][nowY], direction)) continue;
				var nx = nowX + core.utils.scan[direction].x;
				var ny = nowY + core.utils.scan[direction].y;
				if (nx<0 || nx>=core.bigmap.width || ny<0 || ny>=core.bigmap.height || route[nx+","+ny] != null) continue;
				if(blockArr[nx+","+ny])continue; //只要是块就绕过
				route[nx+","+ny] = {'direction':direction, 'step':deep+1};
				queue.queue({depth: deep + 1, x: nx, y: ny});
			}
		}
		return route;
	}

	// 死亡
	var afterDead = function(blk){
		flags.aiBlks.splice(flags.aiBlks.indexOf(blk), 1);
		blk.disable = true;
		var enemy = core.material.enemys[blk.event.id];
		var hint = "打败 " + enemy.name;
		var money =  enemy.money;
		var experience = enemy.experience;
		if (core.flags.enableMoney) hint += "，金币+" + enemy.money;
		if (core.flags.enableExperience) hint += "，经验+" + enemy.experience;	
		core.status.hero.money += money;
		core.status.hero.statistics.money += money;
		core.status.hero.experience += experience;
		core.status.hero.statistics.experience += experience;
		

		core.drawTip(hint);
		var idx = core.status.thisMap.blocks.indexOf(blk);
		if(idx>=0)core.status.thisMap.blocks.splice(idx, 1);
		core.checkAfterBattle();
		blk.notify('hide',{
            'time': 500,
            'callback': function(){
                blk.notify('stop');
				blk.notify('remove');
            }
		});
		//core.insertAction([
		//	{"type": "hide", "loc": [[blk.x,blk.y]], "time": 500},
		//  ]);
	}

	// 伤害处理
	var hurt = function(blk, dmg){
		var info = core.getEnemyInfo(blk.event.id,null,blk.x,blk.y);
		dmg = dmg || Math.max(0,core.status.hero.atk - info.def);
		// 击穿次数
		var hitCount = flags._hitCount || 0;
		hitCount += 1;
		dmg /= hitCount;
		flags._hitCount = hitCount;
		// 爆裂箭
		if(core.hasEquip('arrow3') && !flags._bombArrow){
			core.playSound('shootBomb.ogg');
			flags._bombArrow = true;
			var ard = core.utils.scan;
			for(var d in ard){
				var dst = core.getBlock(blk.x + ard[d].x, blk.y + ard[d].y);
				if(dst && dst.block.event.cls=='enemys'){
					hurt(dst.block, dmg*(flags.bombArrowDamage || 0.5));
				}
			}
			flags._bombArrow = false;
		}
		// 麻痹箭
		if(core.hasEquip('arrow4')){
			blk.palsy = true;
		}
		blk.damage = blk.damage || 0;
		blk.damage += dmg;
		var exDmg = core.hasEquip('arrow2')?Math.floor(blk.damage * (flags.pdamage || 0.1)):0;
		blk.damage += exDmg;
		blk.hurtct = blk.hurtct || 0;
		blk.hurtct += 1;
		if(info.hp - dmg - exDmg<=0){
			afterDead(blk);
		}else{
			insertAI(blk);
		}
	}

	var inv_dir = {
		'left':'right',
		'right':'left',
		'up':'down',
		'down':'up',
	}
	// 刷新AI的行动
	var AIaction = function(){
		var hloc = core.status.hero.loc;
		flags.aiBlks = (flags.aiBlks || []).filter(function(blk){
			return core.status.thisMap.blocks.indexOf(blk)>=0;
		});
		flags.aiBlks.forEach(function(blk){
			blk.disable = true;
		});
		var destX = hloc.x, destY = hloc.y;
		if(core.status.heroMoving){
			if(!core.getBlock(core.nextX(),core.nextY())){
				destX = core.nextX(); destY = core.nextY();
			}
		}
		var route = core.bfsFlood(destX, destY);
		var empty = {'step':999};
		flags.aiBlks.sort(function(blk1, blk2){
			if(blk1===blk2)return 0;
			return (route[blk1.x+','+blk1.y]||empty).step - (route[blk2.x+','+blk2.y]||empty).step;
		})
		
		flags.aiBlks.forEach(function(blk){
			blk.disable = false;
			var posIdx = blk.x+','+blk.y;
			if(blk.palsy){
				blk.palsy = false;
				blk.action = null;
				return;
			}
			var net = (flags.nets||[]).find(function(t){
				return t.x==blk.x && t.y==blk.y && t.floorId == core.status.floorId;
			});
			if(net){
				net.notify('remove');
				flags.nets.splice(flags.nets.indexOf(net),1);
				blk.action=null;
				hurt(blk, core.status.hero.def || flags.netDamage || 50);
				return;
			}
			if(!route[posIdx]){
				blk.action = null;
				return;
			}
			var dir = inv_dir[route[posIdx].direction];
			if(!dir){
				blk.action = null;
				return;
			}
			var nx = blk.x + core.utils.scan[dir].x,
				ny = blk.y + core.utils.scan[dir].y
			if(route[nx+','+ny]){
				blk.action = dir;
				route[nx+','+ny] = null;
			}else{
				blk.action=null;
			}
		});
	}
	var insertAI = function(blk){
		if(flags.aiBlks.indexOf(blk)>=0){
			return;
		}
		blk.acive = true;
		flags.aiBlks.push(blk);
	}

	this.saveAIData = function(floorId){
		floorId = floorId || core.status.floorId;
		flags.aiBlks = (flags.aiBlks || []).filter(function(blk){
			return core.status.maps[floorId].blocks.indexOf(blk)>=0;
		});
		flags.aiInfo = flags.aiInfo || {};
		flags.aiInfo[floorId] = [];
		var exclude = ['event', 'observers'];
		flags.aiBlks.forEach(function(blk) {
			var tmp = {};
			for(var k in blk){
				if(exclude.indexOf(k)>=0)continue;
				if(typeof blk[k] == 'function')continue;
				tmp[k] = blk[k];
			}
			flags.aiInfo[floorId].push(tmp);
		});
	}
	this.loadAIData = function(floorId){
		floorId = floorId || core.status.floorId;
		flags.aiBlks = [];
		((flags.aiInfo||{})[floorId] || []).forEach(function(blk) {
			var block = core.getBlock(blk.x, blk.y, floorId);
			if(block){
				for(var key in blk){
					block.block[key] = blk[key];
				}
				flags.aiBlks.push(block.block);
			}
		});
	}


	// 获取射击路径
	var getShootRoute = function(loc, checkFun){
		loc = loc || core.status.hero.loc;
		var route = [];
		var func = {};
		func.enemys = checkFun.enemys || function(blk){
			return true;
		};
		func.terrains =  checkFun.terrains || function(blk){
			return true;
		};
		var updt = checkFun.updatePosition;
		func.updatePosition = function(pos){
			route.push(pos.direction);
			if(updt){
				updt(pos);
			}
		}
		shoot(loc.x,loc.y,loc.direction,func);
		return route;
	}

// ========= 动画

	this.shootAnimate = function(sx,sy,direction,checkFunc,callback){
		core.playSound('shoot.ogg');
		var blk = {'x':sx, 'y':sy, 'direction': direction};
		flags.tmp_blk = blk;
		var layer = core.scenes.mapScene.getLayer('event');
		var obj = core.sprite.getSpriteObj('arrowShow');
		layer.addNewObj(obj);
		core.becomeSubject(blk);
		blk.addObserver(obj);
		var adspeed = 3;
		var i = 6;
		var next = function(){
			adspeed += i;
			i=~~(i/2);
			adspeed = Math.max(3,adspeed);
			blk.notify('move',
			{
				direction: blk.direction,
				speed: adspeed,
				callback: function(){
					shootUpdate(blk);
					if(shootCheckBlock(blk, checkFunc)){
						layer.removeChild(obj);
						if(callback)callback();
					}else{
						next();
					}
				}}
			);
		}
		return next();

		obj.setPositionWithBlock({x:sx,y:sy});
		core.eventMoveSprite(obj, route, 50, function(){
			layer.removeChild(obj);
			if(callback)callback();
		});
	}
/*
	this.shootAnimate = function(sx,sy,dir,dis,callback){
		if(!core.dymCanvas.thunder)ctx = core.createCanvas('arrow',0,0,core.__PIXELS__,core.__PIXELS__,63);
		var lastTime = 0;
		var fps = 30;
		var speed = 10;
		var x = sx*32, y = sy*32;
		var idx = ['up', 'left', 'right', 'down'].indexOf(dir);
		var dx = core.utils.scan[dir].x,
			dy = core.utils.scan[dir].y;
		var loop = function(timeStamp){
			if(timeStamp-lastTime>fps){
				lastTime = timeStamp;
				x += dx*speed;
				y += dy*speed;
				core.clearMap('arrow');
				core.drawImage('arrow','arrow.png',idx*32,0,32,32,x,y,32,32);
			}
			if(Math.abs(sx*32-x) + Math.abs(sy*32-y) >= dis*32){
				core.unregisterAnimationFrame('arrow');
				core.clearMap('arrow');
				if(callback)callback();
			}
		}
		core.registerAnimationFrame('arrow', true, loop);
	}
	*/

// update archer actions
	this.aiCheckHero = function(){
		/// 检查是否碰怪
		if(!core.status.heroMoving){
			var loc = core.status.hero.loc;
			/*core.status.thisMap.blocks.forEach(function(blk){
				if(blk.x == loc.x && blk.y == loc.y && blk.event.cls=='enemys' && !blk.disable){
					core.doSystemEvent(blk.event.trigger, blk, null);
				}
			});// 暂时无法解决事件重叠问题 请避免此类设计
			*/
			if(core.getBlock(loc.x,loc.y)){
				core.insertAction([
					{"type": "trigger", "loc": [loc.x,loc.y]},
				]);
			}
		}
	}
	this.mainArcherLoop = function(){
		AIaction();
		var ct = 0;
		flags.aiBlks.forEach(function(blk){if(blk.action)ct+=1;});
		flags.aiBlks.forEach(function(blk){
			var callback = function(){
				// core.status.thisMap.blocks.push(blk);
				ct -= 1;
				if(ct == 0){
					core.aiCheckHero();
				}
			}
			if(blk.action){
				if(core.isReplaying()){
					callback();
				}else {
					blk.notify('move',
					{
						direction: blk.action,
						speed: 5,
						callback: callback
					});
				}
				blk.x += core.utils.scan[blk.action].x;
				blk.y += core.utils.scan[blk.action].y;
			}
		});
	}

// 基本射击
	var blockProc = { // 基本的检查方法
		'enemys':function(blk, simulate){
			if(!simulate){
				core.playSound('shootOn.ogg');
				hurt(blk);
			}
			if((flags.buff||{})["skill5"])return false;
			return true;
		},
		'terrains':function(blk, simulate){
			if(core.hasEquip('arrow5')){
				if(flags.breakTerrain){
					flags.breakTerrain = false;
					return true;
				}else{
					flags.breakTerrain = true;
					return false;
				}
			}
			return true;
		},
		'items':function(){
			return false;
		}
	}
	var baseShoot = function(checkFunc){
		var loc = core.status.hero.loc;
		checkFunc = checkFunc || blockProc;

		flags._hitCount = 0;
		//simulate = true;
		//var route = getShootRoute(loc, checkFunc); // 模拟射击
		//simulate = false;
		var callback = function(){
			core.mainArcherLoop();
			core.status.hero.eventlock = false;
			core.unLockControl();
			core.updateStatusBar();
			core.updateBuff();
		}
		if(core.isReplaying()){
			shoot(loc.x, loc.y, loc.direction, checkFunc);
			callback();
		}else{
			core.status.hero.eventlock = true;
			core.lockControl();
			core.waitHeroToStop(
				function(){
					core.shootAnimate(loc.x,loc.y,loc.direction,checkFunc,callback);
					//core.shootAnimate(loc.x,loc.y,loc.direction,dist,callback);
				}
			);
		}
	}


	this.hasChoiceSkill = function(itemId){
		if(itemId.indexOf('skill')==0){
			if((flags.buff || {})[itemId])return true;
		}else{
			var a = flags.arrowCho || 'arrow1';
			if(itemId == a){
				return true;
			}
		}
		return false;
	}

	var skillCostTable = {
		'skill1':0,
		'skill2':1,
		'skill3':3,
		'skill4':1,
		'skill5':2,
	};
	var arrowCostTable = {
		'arrow1':1,
		'arrow2':2,
		'arrow3':4,
		'arrow4':2,
		'arrow5':3,
	};
	var skillEffectTable = {
		'skill1':baseShoot,
		'skill2':function(){
			flags.nets = flags.nets||[];
			flags.nets.push({
				x: core.getHeroLoc('x'),
				y: core.getHeroLoc('y'),
				floorId: core.status.floorId,
			});
			core.drawNets(core.scenes.mapScene.getLayer('event'));
			return false;
		},
		'skill3':function(){
			core.insertAction("灵引");
			return false;
		},
		'skill4':function(){
			var dir = core.status.hero.loc.direction;
			var dx = core.utils.scan[dir].x,
				dy = core.utils.scan[dir].y;
			var x = core.status.hero.loc.x - 2*dx,
				y = core.status.hero.loc.y - 2*dy;
			core.status.hero.loc.x = x;
			core.status.hero.loc.y = y;
			core.drawHero();
			return false;
		},
		'skill5':function(){
			return true;
		}
	};
	this.canUseSkill = function(id){
		switch(id) {
			case 'skill1':break;
			case 'skill2':
				if(!(flags.nets||[]).find(function(n){return n.x==core.getHeroLoc('x') && n.y==core.getHeroLoc('y')})){
					return true;
				}return false;
			case 'skill3':break;
			case 'skill4':
				var dir = core.status.hero.loc.direction;
				var dx = core.utils.scan[dir].x,
					dy = core.utils.scan[dir].y;
				var x2 = core.status.hero.loc.x - 2*dx,
					y2 = core.status.hero.loc.y - 2*dy;
					x1 = core.status.hero.loc.x - dx,
					y1 = core.status.hero.loc.y - dy;
				if(x2<0 || y2 <0 || x2>= core.__BLOCK_SIZE__ || y2>=core.__BLOCK_SIZE__){
					return false;
				}
				return !core.getBlock(x1, y1) && !core.getBlock(x2,y2);
			case 'skill5':
				break;
		}
		return true;
	}
	this.useSkill = function(itemId){
		var arrowCho = flags.arrowCho || 0;
		var arrow = core.status.hero.equipment[0];
		if(!arrow){
			core.drawTip('需要先装备弓箭！');
			return;
		}
		if(itemId=='skill1'){
			var moneyCost = core.items.items[arrow].equip.cost;
			if(core.status.hero.money >= moneyCost){
				core.autosave(true);// 发射前自动存档
				core.status.hero.money -= moneyCost;
			}else{
				core.drawTip('金币不足以制造箭矢！');
				return;
			}
			skillEffectTable[itemId]();
		}else{ // 立即使用型
			flags.buff = flags.buff || {};
			var manaCost = core.items.items[itemId].equip.cost || 0;
			if(core.status.hero.mana >= manaCost || flags.buff[itemId]){
				if(flags.buff[itemId]){ // cancel
					core.status.hero.mana += manaCost;
					flags.buff[itemId] = false;
					return;
				}
				else if(skillEffectTable[itemId]()){ // use
					flags.buff[itemId] = true;
				}
				core.status.hero.mana -= manaCost;
			}else{
				core.drawTip('能量不足！');
			}
		}
	}

	this.drawNets = function(ctx, floorId){
		floorId = floorId || core.status.floorId;
		(core.getFlag('nets', [])).forEach(function(blk){
			if(blk.floorId != floorId)return;
			if(blk.notify && blk.observers().length>0){
				blk.notify("draw");
			}else{
				core.becomeSubject(blk);
				var obj = core.getSpriteObj('flower');
				ctx.addNewObj(obj, 0);
				blk.addObserver(obj);
				blk.notify("draw");
			}
		});
		
		(core.getFlag('changePoints', {})[floorId]||[]).forEach(function(blk){
			if(blk.notify && blk.observers().length>0){
				blk.notify("draw");
			}else{
				core.becomeSubject(blk);
				var obj = core.getSpriteObj(blk.direction+'Portal');
				obj.addAnimateInfo({'speed':30});
				ctx.addNewObj(obj, 0);
				blk.addObserver(obj);
				blk.notify("draw");
			}
		});
	}
	this.updateBuff = function(){
		//// 射箭后更新各种buff信息
		
		// 强击关闭
		(flags.buff || {})['skill5']=false; 
		// 用过的转向清除
		
		(flags.changePoints||{})[core.status.floorId] = ((flags.changePoints||{})[core.status.floorId]||[]).filter(function(pt){
			if(pt.disable && pt.notify){
				pt.notify('remove');
			}
			return !pt.disable
		});

		// 清除穿墙信息
		flags.breakTerrain = false;
		flags._hitCount = 0;
	}


	this.checkAfterBattle = function(){
		switch(core.status.floorId){
			case 'MT1':
				if(!core.status.thisMap.blocks.find(function(blk){
					return blk.event.cls == 'enemys';
				})){
					core.insertAction([
						{"type": "show", "loc": [[4,0]], "time": 500},
					  ]);
				}
				break;
			default:break;
		}
	}
},

"gestureAction":function(){
	///// 手势识别
	var mx, my, moving=false;
	var route = [];
	var vecs = [];
	var thrLen = 25; // 判断路径的点数阈值
	var thrDist2 = 32*32; // 记录距离的阈值

	// 基本向量操作
	var Vector = function(x, y){
		this.x = x;
		this.y = y;
		this.multiply = function(vec){
			return this.x*vec.x + this.y*vec.y;
		}
		this.norm2 = function(){
			return this.x*this.x + this.y*this.y;
		}
		this.calAngle = function(vec){
			return Math.acos(this.multiply(vec)/Math.sqrt(this.norm2()*vec.norm2()))/Math.PI*180;
		}
		this.add = function(vec){
			this.x += vec.x;
			this.y += vec.y;
		}
		// 编成方向码
		this.encode = function(){
			if(Math.abs(this.x)>Math.abs(this.y)){
				return this.x>0 ? 'right':'left';
			}else{
				return this.y < 0 ? 'up' : 'down';
			}
		}
	}

	// 路径融合
	var packRoute = function(){
		var dx=0,dy=0;
		vecs.forEach(function(v){
			dx += v.x; dy += v.y;
		})
		var r = new Vector(dx,dy);
		vecs = [];
		if(r.norm2()<thrDist2){
			vecs.push(r);
			return;
		}
		if(route.length){
			var lastRoute = route[route.length-1];
			var ang =  Math.abs(lastRoute.calAngle(r));
			if (ang < 30 || lastRoute.encode()==r.encode()){ // 如果偏差较小 则认为方向累积
				lastRoute.add(r);
			}else{// 否则 产生新的方向
				route.push(r);
			}
		}else{
			route.push(r);
		}
		
	}

	var _ondown = function (_x, _y, px, py) {
		if (core.isPlaying() && core.hasFlag('enableGesture') && !core.status.lockControl) {
			mx = px;
			my = py;
			moving = true;
			route = [];
			vecs = [];
		}
	}
	var _onup = function () {
		if (moving) {
			moving = false;
			core.clearMap('ui');
			core.actions.doRegisteredAction('gesture', route.map(function(v){return v.encode()}));
			if(route.length){
				core.status.stepPostfix = [];
				route = [];
				return true;
			}
		}
	}

	var gestureAction = function(route, prepare){
		if(route.length==1){
			if(prepare){
				var dict = {'left':'左','right':'右','up':'上','down':'下',};
				if(core.hasItem('skill1')){
					return {'name': dict[route[0]]+"射击", 'id': 'skill1'};
				}
				else{
					return ;
				}
			}else{
				core.setHeroLoc('direction', route[0]);
				core.useItem('skill1');
				return;
			}
		}
		var code = '';
		route.forEach(function(r){
			code += r[0];
		});
		flags.gestureAction = flags.gestureAction || {};
		var it = flags.gestureAction[code];
		var items = core.material.items;
		if(!it){
			for(var k in core.status.hero.items.constants){
				if(items[k] && items[k].gesture==code){
					it = k;break;
				}
			}
		}
		if(it){
			if(prepare){
				return {'name': items[it].name, 'id': it};
			}
			if(core.canUseItem(it)){
				core.drawTip('使用'+items[it].name, it);
				core.useItem(it);
				return true;
			}else{
				core.drawTip('无法使用');
			}
		}else{

		}
	}

	var _onmove = function (_x, _y, px, py) {
		if(moving){
			vecs.push(new Vector(px-mx, py-my));
			core.drawLine('ui', mx, my, px, py, "#ffd700");
			mx = px; my = py;
			if(vecs.length >= thrLen){
				packRoute();
				if(route.length>0){
					var ret = gestureAction(route.map(function(v){return v.encode()}), true);
					if(ret && !core.timeout.tipTimeout){
						if(typeof ret == 'string'){
							core.drawTip(ret);
						}else{
							core.drawTip(ret.name, ret.id);
						}
					}
				}
			}
			return true;
		}
	}
	this.bindGesture = function(code, it){
		flags.gestureAction = flags.gestureAction || {};
		flags.gestureAction[code] = it;
	}

	var gesture2direction = function(code){
		var txt = {
			'u':'↑',
			'd':'↓',
			'l':'←',
			'r':'→',
		}
		var ret = '';
		for(var i in code){
			ret += txt[code[i]];
		}
		return ret;
	}


	core.registerAction('ondown', 'gestureOnDown', _ondown, 50);
	core.registerAction('onup', 'gestureOnUp', _onup, 50);
	core.registerAction('onmove','gestureOnMove', _onmove, 50);
	core.registerAction('gesture', 'gestureAction', gestureAction, 50);

	// 道具显示手势
	ui.prototype._drawToolbox_drawDescription = function (info, max_height) {
		core.setTextAlign('ui', 'left');
		if (!info.selectId) return;
		var item=core.material.items[info.selectId];
		var name = item.name;
		if(item.gesture){
			name += '【'+gesture2direction(item.gesture)+'】';
		}
		core.fillText('ui', name, 10, 32, '#FFD700', this._buildFont(20, true))
		var text = item.text||"该道具暂无描述。";
		try {
			// 检查能否eval
			text = core.replaceText(text);
		} catch (e) {}
	
		for (var font_size = 17; font_size >= 14; font_size -= 3) {
			var lines = core.splitLines('ui', text, this.PIXEL - 15, this._buildFont(font_size, false));
			var line_height = parseInt(font_size * 1.4), curr = 37 + line_height;
			if (curr + lines.length * line_height < max_height) break;
		}
		core.setFillStyle('ui', '#FFFFFF');
		for (var i=0;i<lines.length;++i) {
			core.fillText('ui', lines[i], 10, curr);
			curr += line_height;
			if (curr>=max_height) break;
		}
		if (curr < max_height) {
			core.fillText('ui', '<继续点击该道具即可进行使用>', 10, curr, '#CCCCCC', this._buildFont(14, false));
		}
	}
	

}

}