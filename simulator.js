/**
* 手机游戏'官居几品'模拟器
* 功能实现
* 1. 模拟登录
* 2. 模拟经营操作：经商、经农、征兵
* 3. 模拟政务
* 4. 模拟出巡 
* 5. 模拟随机传唤
* 6. 模拟子嗣培养

// TODO:
* 7. 请安
* 8. 膜拜
* 9. 惩罚罪犯
* 10. 衙门出使

* 高阶功能
* 模拟关卡
*/

var request = require('request');
const queryString = require('query-string');


var serverUrl_4 = 'http://llhzf.commpad.cn/servers/s4.php?sevid=4&ver=V1.0.53';
var serverUrl_5 = 'http://llhzf.commpad.cn/servers/s5.php?sevid=5&ver=V1.0.53';

var serverUrl = serverUrl_4;

var apiUrl = serverUrl;

var userParam = {
	"uid": 0,
	"name": '',
	"cash": 912,
	"coin": 1622797,
	"food": 839192,
	"army": 1074601,
	"bmap": 0,
	"smap": 0,
	"mmap": 0
};

var gameInfo = {
	
};

console.log('simulator start...');

var heroNames = [
	{id: 1, name: '来福'},
	{id: 2, name: '白玉堂'},
	{id: 3, name: '纪晓岚'},
	{id: 4, name: '刘罗锅'},
	{id: 5, name: '吴承恩'},
	{id: 6, name: '霍元甲'},
	{id: 7, name: '沈万三'},
	{id: 8, name: '萧何'},
	{id: 9, name: '唐伯虎'},
	{id: 10, name: '施琅'},
	{id: 11, name: '陈近南'},
	{id: 12, name: '郑成功'},
	{id: 13, name: '祝枝山'},
	{id: 14, name: '张居正'},
	{id: 15, name: '李时珍'},
	{id: 16, name: '李寻欢'},
	{id: 17, name: '扁鹊'},
	{id: 18, name: '胡雪岩'},
	{id: 19, name: '管仲'},
	{id: 20, name: '程咬金'},
	{id: 21, name: '华佗'},
	{id: 22, name: ''},
	{id: 23, name: ''},
	{id: 24, name: ''},
	{id: 25, name: ''},
	{id: 26, name: ''},
	{id: 27, name: ''},
	{id: 28, name: ''},
	{id: 29, name: ''},
	{id: 30, name: ''}

];

var heros = [];

/**
* 服务器列表
*/ 
function listserver(){
	var serverlistUrl = 'http://llhzf.commpad.cn/serverlist.php';
	request(serverlistUrl, function(error, response, body) {
	  if(!error && response.statusCode == 200){
	  	var serverlist = JSON.parse(body);
	    console.log('server list:\n', JSON.stringify(serverlist, null, '  '));
	  }
	});
}

/**
* 随机等待n秒
*/
function randomWait(n){
	return Math.ceil(Math.random() * n) * 1000;
}

/**
* 登录 POST
*/
var fastToken;

function fastLogin(){
	var tokenUrl = 'http://usercenter.zhisnet.cn/account/fastLogin.php?appid=205&username=xj1614792693&password=801268';
	request(tokenUrl, function(error, response, body) {
	  if(!error && response.statusCode == 200){
	  	var loginObj = JSON.parse(body);
	  	if(loginObj.status == 0){
	  		var uid = loginObj.data.uid;
	  		var token = loginObj.data.token;
	  		console.log('登录成功, uid = ' + uid + ', token = ' + token);
	  		
	  		fastToken = token;

	  		accountLogin();

	  	}else{
	  		console.log('登录失败, status = ' + loginObj.status + ', msg = ' + loginObj.msg);
	  	}
	    
	  }else{
	  	console.log(error);
	  }
	});



}

fastLogin();

function changeserver(){
	if(serverUrl == serverUrl_4){
		console.log('切换到服务区5');
		serverUrl = serverUrl_5;
		fastLogin();
	}else{
		console.log('切换到服务区4');
		serverUrl = serverUrl_4;
		fastLogin();
	}

	setTimeout(changeserver, 900*1000);   // 1小时切换一次服务区 
}
// setTimeout(changeserver, 900*1000);


function accountLogin(){
	console.log('do account login');
	var formData = {"login":{"loginAccount":{"platform":"llhzfgjjp","openid":"xj1614792693","openkey":fastToken}}};


	request.post({url: serverUrl + '&uid=&token=', form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.a.loginMod){
				var _account = respData.a.loginMod.loginAccount;
				var uid = _account.uid;
				var token = _account.token;

				apiUrl = serverUrl + '&' + queryString.stringify({uid: uid, token: token});
				console.log('api string is ', apiUrl);

				setTimeout(finalLogin, 1000);

			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
			
			
		}
	});
}


function finalLogin(){
	// login access
	var formData = {"guide":{"login":{"platform":"llhzfgjjp"}}};

	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.a.user){

				userParam = respData.a.user.user;
				console.log('用户信息:', 'level =', userParam.level, 'cash = ', userParam.cash, 'coin = ', userParam.coin,
					'food = ', userParam.food, 'cash = ', userParam.food);

				doTask();

			}

			if(respData.a.hero.heroList){
				_heroList = respData.a.hero.heroList;
				var zz = function(zz){
					return zz.e1 + zz.e2 + zz.e3 + zz.e4;
				};
				_heroList.sort(function(h1, h2){
					return zz(h2.zz) - zz(h1.zz);
				});
				console.log('id', 'name', '等级', '综合资质', '武力', '智力', '政治', '魅力');
				_heroList.forEach(function(hero){
					var heroName = heroNames[hero.id - 1].name;
					console.log(hero.id, heroName, hero.level, zz(hero.zz), hero.aep.e1, hero.aep.e2, hero.aep.e3, hero.aep.e4);

					heros.push({id: hero.id, name: heroName, level: hero.level, zz: zz(hero.zz), aep: hero.aep});
				});
			}


			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
			
		}
	});
}
	
function startTask(){
	doTask();

	setTimeout(doTask, 900000);  // 15分钟后重新执行

}

var isTaskRunning = false;
function doTask(){
	// 执行任务

	if(isTaskRunning) return;
	isTaskRunning = true;

	for(int i = 0; i < 5; i++){
		setTimeout(checkJingying, i*60000 + 2000);
	}
	


	setTimeout(checkXunfang, randomWait(60));
	setTimeout(doZhengwu, randomWait(60));
	setTimeout(doChuanhuan, randomWait(60));
	setTimeout(doSonPlay, randomWait(60));

	setTimeout(doSchool, randomWait(60));
	setTimeout(fuli_qiandao, randomWait(60));
	setTimeout(mobai, randomWait(60));
	setTimeout(laofang, randomWait(60));
	setTimeout(qingan, randomWait(60));

	setTimeout(pve.bind(this, 40), randomWait(60));
	setTimeout(doHeroUpgrade, randomWait(60));
	// setTimeout(yamen, randomWait(100));
	

//	setTimeout(pve.bind(this, 40), randomWait(5));
	
}


/**
* 经营
*/
function checkJingying(){
	console.log('检查经营任务', new Date().toLocaleString());
	
	var jyForm = '{"user":{"refjingying":[]}}';
	request.post({url: apiUrl, form: jyForm}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			// console.log(JSON.stringify(respData, null, '  '));

			if(respData.a.jingYing){
				var coinInfo = respData.a.jingYing.coin;
				var foodInfo = respData.a.jingYing.food;
				var armyInfo = respData.a.jingYing.army;
				
				if(coinInfo.num > 0){
					setTimeout(doJingying.bind(this, 'coin'), 2000);
				}else{
					console.log('coin经营时间未到');
				}
				if(foodInfo.num > 0){
					setTimeout(doJingying.bind(this, 'food'), 4000);
				}else{
					console.log('food经营时间未到');
				}
				if(armyInfo.num > 0){
					setTimeout(doJingying.bind(this, 'army'), 6000);
				}else{
					console.log('army经营时间未到');
				}

			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
			
		}else{
			console.log('checkJingying error! ', error);
		}
	});

	var jyDelay = 60000;  // 1分钟检查一次经营操作
	setTimeout(checkJingying, jyDelay);

}
function doJingying(jytype){
	
	var coinForm = '{"user":{"jingYing":{"jyid":2}}}';   
	var foodForm = '{"user":{"jingYing":{"jyid":3}}}';   
	var armyForm = '{"user":{"jingYing":{"jyid":4}}}';   


	if(jytype == 'coin'){
		request.post({url: apiUrl, form: coinForm}, function(error, response, body){
			if(!error && response.statusCode == 200){
				var respData = JSON.parse(body);
				
				console.log('执行一次经营操作 coin', new Date().toLocaleString());
				console.log(JSON.stringify(respData.u.user.user, null, '  '));
				
				if(respData.a.system.errror){
					console.log('coin经营失败', JSON.stringify(respData.a.system.errror, null, '  '));
				}
				
			}else{
				console.log('coin经营操作失败.', error);
			}
		});
	}
	
	if (jytype == 'food') {
		request.post({url: apiUrl, form: foodForm}, function(error, response, body){
			if(!error && response.statusCode == 200){
				

				var respData = JSON.parse(body);
				// console.log(JSON.stringify(respData, null, '  '));
				console.log('执行一次经营操作 food', new Date().toLocaleString());
				
				console.log(JSON.stringify(respData.u.user.user, null, '  '));
				
				if(respData.a.system.errror){
					console.log('food经营失败', JSON.stringify(respData.a.system.errror, null, '  '));
				}

			}else{
				console.log('food经营操作失败.', error);
			}
		});
	}

	if(jytype == 'army'){
		request.post({url: apiUrl, form: armyForm}, function(error, response, body){
			if(!error && response.statusCode == 200){
				

				var respData = JSON.parse(body);
				// console.log(JSON.stringify(respData, null, '  '));

				console.log('执行一次经营操作 army', new Date().toLocaleString());
				console.log(JSON.stringify(respData.u.user.user, null, '  '));
				
				if(respData.a.system.errror){
					console.log('army经营失败', JSON.stringify(respData.a.system.errror, null, '  '));
				}
				
			}else{
				console.log('army经营操作失败.', error);
			}
		});
	}

}


/** 
* 寻访 start
*/


function checkXunfang(){
	console.log('检查寻访任务', new Date().toLocaleString());
	var xfForm = '{"user":{"refxunfang":[]}}';
	request.post({url: apiUrl, form: xfForm}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.a.xunfang){
				var xfInfo = respData.a.xunfang.xfInfo;
				if(xfInfo.num > 0){
					setTimeout(doXunfang, randomWait(10));
				}else{
					console.log('寻访时间未到.');
				}
			}

			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}

			
		}else{
			console.log('checkXunfang error! ', error);
		}
	});
	var xunfangDelay = 1800000;   // 寻访间隔，半小时
	setTimeout(checkXunfang, xunfangDelay);  // 半小时后再次寻访
}

function doXunfang(){
	console.log('执行一次寻访操作', new Date().toLocaleString());
	var doXfForm = '{"xunfang":{"xunfan":{"type":0}}}';
	request.post({url: apiUrl, form: doXfForm}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);
			var xfInfo = respData.a.xunfang.xfInfo;
			if(xfInfo.num > 0){
				setTimeout(doXunfang, randomWait(30));
			}
			
		}else{
			console.log('寻访失败.', error);
		}
	});
	
}


/** 
* 寻访 end
**/


/** 
* 政务
*/

function doZhengwu(){
	console.log('执行一次政务检查任务', new Date().toLocaleString());
	var formData = '{"user":{"zhengWu":{"act":2}}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.a.jingYing){
				var num = respData.a.jingYing.exp.cd.num;
				if(num > 0){
					setTimeout(doZhengwu, randomWait(10));
				}else{
					console.log('暂无政务处理， 等候半小时');
					var delay = 1800000;
					setTimeout(doZhengwu, delay);
				}
			}
			if(respData.a.system.errror){
				console.log('政务失败.  等候半小时', JSON.stringify(respData.a.system.errror, null, '  '));
				var delay = 1800000;
				setTimeout(doZhengwu, delay);
			}
		}else{
			console.log('政务失败.', error);
		}
	});
	
}


/**
* 随机传唤
*/ 
function doChuanhuan(){
	console.log('执行一次随机传唤', new Date().toLocaleString());
	var formData = '{"wife":{"sjxo":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.a.wife){
				var num = respData.a.wife.jingLi.num;
				if(num > 0){
					setTimeout(doChuanhuan, randomWait(10));
				}
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}else{
			console.log('随机传唤失败.', error);
		}
	});
}


/**
* 子嗣
*/ 
function doSonPlay(){
	console.log('执行一次子嗣培养', new Date().toLocaleString());
	var formData = '{"user":{"refson":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.a.son){
				var sonList = respData.a.son.sonList;

				// console.log('son list\n:', JSON.stringify(sonList, null, ' '));

				for(var iSon = 0; iSon < sonList.length; iSon++){
					var son = sonList[iSon];
					if(son.state == 1 || son.state == 2){  // 1. 新生 2. 孩童
						if(son.power > 0){
							setTimeout(playSon.bind(this, son), randomWait(5));
						}else{
							console.log('子嗣培养时间未到: ', son.name);
						}	
					}
				}
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}else{
			console.log('子嗣培养失败.', error);
		}
	});
}

function playSon(son){
	var playData = {"son":{"play":{"id":son.id}}};
	request.post({url: apiUrl, form: JSON.stringify(playData)}, function(error, response, body){
		var respData = JSON.parse(body);
		if(respData.s == 1 && respData.u.son){
			son = respData.u.son.sonList[0];
			console.log('培养子嗣成功:', son.name, '等级:', son.level);

			if(son.state == 2 && son.power > 0){
				setTimeout(playSon.bind(this, son), randomWait(5));
			}
		}
		if(respData.a.system.errror){
			console.log('培养子嗣失败:', son.name, JSON.stringify(respData.a.system.errror, null, '  '));
		}
	});
}

/**
* 关卡
* 40场小型战斗pve + 一场boss战斗pvb
*/

function pve(times){

	if(times == 0){
		// pve完成，打boss
		pvb(1);
		return;
	}

	console.log('执行pve任务, 次数', times, new Date().toLocaleString());
	var pveData = '{"user":{"pve":[]}}';

	request.post({url: apiUrl, form: pveData}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			// console.log('pve response:\n' + JSON.stringify(respData, null, '  '));

			if(respData.s == 1 && respData.u){
				var army = respData.u.user.user.army;
				var deil = respData.a.user.win.pvewin.deil;
				console.log('armay = ' + army + ', deil = ' + deil);
				if(army > deil){
					setTimeout(function(){pve(times - 1);}, randomWait(5));
				}else{
					console.log('兵力不足, respData.s == 1');
				}
				
			}else if(respData.s == 0 && respData.a.system.errror.type == 0){
				setTimeout(function(){pvb(1)}, randomWait(5));
			}else if(respData.s == 2){
				console.log('兵力不足, respData.s == 2');
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}else{
			console.log('pve任务失败.', error);
		}
	});
}

function pvb(uindex){
	// var pvbData = {"guide":{"guide":{"smap":userParam.smap,"bmap":userParam.bmap,"mmap":userParam.mmap}}};

	var hero = heros[uindex - 1];
	if(!hero){
		console.log('pvb 任务失败, all the heros have been killed.')
		return;
	}
	console.log('执行pvb任务, index = ', uindex, 'hero is ', hero.name);
	
	var pvbUser = {"user":{"pvb":{"id": hero.id}}};

	request.post({url: apiUrl, form: JSON.stringify(pvbUser)}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);

			if(respData.s == 2){
				setTimeout(function(){pvb(uindex + 1)}, 1000);
			}else if(respData.s == 1){
				setTimeout(function(){pve(40)}, 1000);
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}else{
			console.log('pvb任务失败.', error);
		}
	});

}



/**
* 书院学习
*/
function doSchool(){
	console.log('书院学习任务', new Date().toLocaleString());
	var formData = '{"school":{"allover":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);
			if(respData.s == 1){

				var heroIds = [8, 3, 16, 6, 21, 17]
				heroIds.forEach(function(hid, index){
					setTimeout(sendToSchool.bind(this, hid, index+1), randomWait(10));
				});
			}
			if(respData.s == 0){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}else{
			console.log('书院学习任务.', error);
		}
	});
}

/**
* 书院就读 hid: 门客id, sid: 书院座位
*/
function sendToSchool(hid, sid){
	console.log('sendToSchool', hid, sid);
	var formData = {"school":{"start":{"id":sid,"hid":hid}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.school && respData.a.school.list[sid-1].hid == hid){
			
				console.log('门客就学成功, 座位', sid, '门客', hid, heroNames[hid-1]);
				
			}else {
				console.log('门客就学失败, 座位', sid, '门客', hid, heroNames[hid-1]);
			}
		}
	});
}


/**
* 签到
*/
function fuli_qiandao(){
	var formData = '{"fuli":{"qiandao":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		console.log('执行签到任务');
	});
}


/**
* 膜拜
*/
function mobai(){
	
	setTimeout(doMobai.bind(this, 1), randomWait(30));
	setTimeout(doMobai.bind(this, 2), randomWait(30));
	setTimeout(doMobai.bind(this, 3), randomWait(30));

}

function doMobai(type){
	var getTypeName = function(p){
		if(p == 1) return '势力榜';
		if(p == 2) return '关卡榜';
		if(p == 3) return '亲密榜';
		return 'NaN';
	}

	var formData = {"ranking":{"mobai":{"type":type}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
			if(!error && response.statusCode == 200){
				var respData = JSON.parse(body);
				if(respData.s == 1){
					console.log('膜拜', getTypeName(type));
				}
				if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}
			}
		});
}

/**
* 牢房
*/ 
function laofang(){
	var formData = '{"laofang":{"bianDa":{"type":1}}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
			var respData = JSON.parse(body);
			if(respData.s == 1){
				console.log('牢房刑罚1次');
				setTimeout(laofang, randomWait(5));
			}
		});

}


/**
* 请安
*/
function qingan(){
	var formData = '{"huanggong":{"qingAn":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
			var respData = JSON.parse(body);
			if(respData.s == 1){
				console.log('执行请安操作');
			}
		});
}

/**
* 衙门
*/
function yamen(){
	console.log('衙门出使');
	var reqData = '{"yamen":{"yamen":[]}}';
	request.post({url: apiUrl, form: reqData}, function(error, response, body){
		var respData = JSON.parse(body);
		// console.log(JSON.stringify(respData, null, '  '));
		if(respData.s == 1) {
			console.log('yamen.info.state = ', respData.a.yamen.info.state);

			if(respData.a.yamen.info.state == 2){
				// 批准
				var pizhun = '{"yamen":{"pizun":[]}}';
				request.post({url: apiUrl, form: pizhun}, function(error, response, body){
					var respData = JSON.parse(body);
					if(respData.s == 1 && respData.a.yamen.win.over.isover == 0){
						var fheros = respData.a.yamen.fight.fheros;
						var random = Math.random();

						var fhero = fheros[0];
						if(random > 0.6){
							fhero = fheros[2];
						}else if(random > 0.3){
							fhero = fheros[1];
						}
						yamen_fight(fhero.id);
					}
				});
			}else if(respData.a.yamen.fight.fheros.length > 0){

				var fheros = respData.a.yamen.fight.fheros;
				var random = Math.random();

				var fhero = fheros[0];
				if(random > 0.6){
					fhero = fheros[2];
				}else if(random > 0.3){
					fhero = fheros[1];
				}
				yamen_fight(fhero.id);
			}
		}
		if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
		}
		
	});
}
 

function yamen_fight(heroId){
	console.log('衙门战斗, fhero is ', heroId, heroNames[heroId - 1]);
	var formData = {"yamen":{"fight":{"id":heroId}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		var respData = JSON.parse(body);
		if(respData.s == 1 ){


			if(respData.a.yamen.win.over && respData.a.yamen.win.over.isover == 1){
				console.log('战斗结束');
				return;
			}

			if(respData.a.yamen.win.fight.win){				
				var fheros = respData.a.yamen.fight.fheros;
				var random = Math.random();

				var fhero = fheros[0];
				if(random > 0.6){
					fhero = fheros[2];
				}else if(random > 0.3){
					fhero = fheros[1];
				}


				var winnum = respData.a.yamen.win.fight.win;
				var shop = respData.a.yamen.fight.shop;
				if(shop.size > 0){
					console.log('衙门战斗: 临时属性加成', shop[0].id);
					var shopData = {"yamen":{"seladd":{"id":shop[0].id}}};
					request.post({url: apiUrl, form: JSON.stringify(shopData)}, function(){
						if(winnum % 3 == 0){
							setTimeout(yamen_getrwd.bind(this, fhero.id), randomWait(5));
						}else{
							setTimeout(yamen_fight.bind(this, fhero.id), randomWait(5));
						}
					});
				} else{
					if(winnum % 3 == 0){
						setTimeout(yamen_getrwd.bind(this, fhero.id), randomWait(5));
					}else{
						setTimeout(yamen_fight.bind(this, fhero.id), randomWait(5));
					}	
				}
				
				
			}
			
		}

		if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
	});
}

function yamen_getrwd(heroId){
	console.log('衙门战斗 领取奖励');
	var formData = '{"yamen":{"getrwd":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		var respData = JSON.parse(body);
		if(respData.s == 1 ){
			setTimeout(yamen_fight.bind(this, heroId), randomWait(5));
			
		}

		if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
	});

}

/**
* 门客升级
*/
var heroUpgrading = false;
function doHeroUpgrade(){
	console.log('检查一次门客升级');

	var averLevel = 0;
	heros.forEach(function(hero){
		averLevel += hero.level;
	});
	averLevel = averLevel / heros.length;

	heros.forEach(function(hero){
		if(heroUpgrading) return; // 每次升级一个门客

		if(hero.level < averLevel){
			heroUpgrading = true;
			setTimeout(hero_upgrade.bind(this, hero.id), randomWait(5));
		}
	});
}

function hero_upgrade(hid){
	console.log('门客升级, hero is', heroNames[hid -1 ]);
	var reqData = {"hero":{"upgrade":{"id":hid}}};
	request.post({url: apiUrl, form: JSON.stringify(reqData)}, function(error, response, body){
		var respData = JSON.parse(body);
		if(respData.s == 1 && respData.u.user.user.coin > 0){

			var hero = respData.u.hero.heroList[0];

			heros.forEach(function(h){
					if(h.id == hid) { h.level = hero.level; return;}
				});
			if(hero.level == 100){
				console.log('门客已升到100级', heroNames[hid -1]);

			}else{
				console.log('门客升级成功, hero is', heroNames[hid -1 ], 'level = ', hero.level, 'coin = ', respData.u.user.user.coin);
				setTimeout(hero_upgrade.bind(this, hid), randomWait(5));
			}
			
		}

		if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
	});

	heroUpgrading = false;
}