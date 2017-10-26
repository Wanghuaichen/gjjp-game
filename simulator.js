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

var server = 4;
var arguments = process.argv.splice(2);
if(arguments.length > 0){
	server = parseInt(arguments[0]);
}
console.log('进入服务区', server);


var username = 'xj1614792693';
var password = '801268';


var request = require('request');
const queryString = require('query-string');


var serverUrl_4 = 'http://llhzf.commpad.cn/servers/s4.php?sevid=4&ver=V1.0.61';
var serverUrl_5 = 'http://llhzf.commpad.cn/servers/s5.php?sevid=5&ver=V1.0.61';
var serverUrl_6 = 'http://llhzf.commpad.cn/servers/s6.php?sevid=6&ver=V1.0.61';
var vipHeros_4 = [44, 8, 2, 6, 20, 9, 16, 17, 18, 19, 21];
var vipHeros_5 = [44, 45, 2, 6, 20, 16, 10, 18, 19, 21, 8];
var vipHeros_6 = [44, 2, 6, 20, 16, 10, 18, 19, 21, 8];

var vipHeros = vipHeros_4;
var serverUrl = serverUrl_4;
if(server == 5){
	vipHeros = vipHeros_5;
	serverUrl = serverUrl_5;
}else if(server == 6){
	vipHeros = vipHeros_6;
	serverUrl = serverUrl_6;
}


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
	{id: 22, name: '墨子'},
	{id: 23, name: '李白'},
	{id: 24, name: '廉颇'},
	{id: 25, name: ''},
	{id: 26, name: ''},
	{id: 27, name: ''},
	{id: 28, name: ''},
	{id: 29, name: ''},
	{id: 30, name: ''},
	{id: 43, name: '岳飞'},
	{id: 44, name: '狄仁杰'},
	{id: 45, name: '韩信'},
	{id: 46, name: '曹操'}

];

function getHeroName(hid){
	var name = 'NaN';
	var hero = heroNames.find(function(h){return h.id == hid});
	if(hero) name = hero.name;
	return name;
}


var heros_yamen = [48, 47, 46, 45, 44, 43, 42, 41, 40, 2, 6, 16, 11];

var heros = [];

var school = {};
var mingwang = {};
var hanlin_running = false;

var shili_ranking = [];
var topUsers = [];


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
	var tokenUrl = 'http://usercenter.zhisnet.cn/account/fastLogin.php?appid=205&username=' + username + '&password=' + password;
	request(tokenUrl, function(error, response, body) {
	  if(!error && response.statusCode == 200){
	  	try{
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
	  	}catch(e){
	  		console.log('fastLogin error', e, body);
	  	}
	    
	  }else{
	  	console.log(error, body);
	  	setTimeout(fastLogin, randomWait(5));
	  }
	});



}

fastLogin();



function accountLogin(){
	console.log('do account login');
	var formData = {"login":{"loginAccount":{"platform":"llhzfgjjp", "openid":username, "openkey":fastToken}}};


	request.post({url: serverUrl + '&uid=&token=', form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){
			try{
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
					console.log('accountLogin error', JSON.stringify(respData.a.system.errror, null, '  '));

					setTimeout(fastLogin, randomWait(15));
				}
			}catch(e){
				console.log('accountLogin error', e, body);
				setTimeout(fastLogin, randomWait(15));
			}
			
		}else{
			console.log('accountLogin error', error, body);
			setTimeout(fastLogin, randomWait(15));
		}
	});
}


function finalLogin(){
	// login access
	var formData = {"guide":{"login":{"platform":"llhzfgjjp"}}};

	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){

			try{
				var respData = JSON.parse(body);

				if(respData.a.user){

					userParam = respData.a.user.user;
					console.log('用户信息: name=', userParam.name, 'level =', userParam.level, 'cash = ', userParam.cash, 'coin = ', userParam.coin,
						'food = ', userParam.food, 'cash = ', userParam.food);
				}

				if(respData.a.hanlin){
					console.log('校场经验', respData.a.hanlin.info);
				}


				if(respData.a.school){
					school = respData.a.school;
				}

				if(respData.a.laofang){
					mingwang = respData.a.laofang.mingwang;
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
					heros = [];
					_heroList.forEach(function(hero){
						var heroName = 'NaN';
						var hName = heroNames.find(function(h){return h.id == hero.id;});
						if(hName) heroName = hName.name;
						
						console.log(hero.id, heroName, hero.level, zz(hero.zz), hero.aep.e1, hero.aep.e2, hero.aep.e3, hero.aep.e4);
						hero.name = heroName;
						heros.push(hero);
					});
				}

				startTask();

				if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}
			}catch(e){
				console.log('finalLogin error', e, body);
				setTimeout(finalLogin, randomWait(5));
			}

			
			
		}
	});
}
	
function startTask(){
	doTask();
	
	setTimeout(fastLogin, 300000 + randomWait(60));
}

//var isTaskRunning = false;
function doTask(){
	// 执行任务
	console.log('开始执行任务', new Date().toLocaleString());

	doDailyTask();

	setTimeout(checkJingying, randomWait(30));   // 经营
	setTimeout(doZhengwu, randomWait(30));       // 政务
	setTimeout(doSchool, randomWait(30));        // 书院	
	setTimeout(doChuanhuan, randomWait(30));     // 传唤
	setTimeout(checkXunfang, randomWait(30));    // 寻访
	setTimeout(doSonPlay, randomWait(30));       // 子嗣培养
	setTimeout(uppkskill, randomWait(30));       // 门客技能升级
	// setTimeout(doHeroUpgrade, randomWait(30));  // 门客等级升级

	if(mingwang.mw == mingwang.maxmw){				// 名望满时，执行牢房任务
		setTimeout(laofang, randomWait(120));      // 牢房
	}
	if(!hanlin_running){
		setTimeout(hanlin, randomWait(5));
		hanlin_running = true;
	}	
	

	setTimeout(yamen, randomWait(30));            // 衙门战斗
	setTimeout(wordboss, randomWait(30));         // 中午 匈奴兵来袭
	setTimeout(wordboss_gofightg2d, randomWait(5));         // 围剿匈奴王
	
	setTimeout(keju, randomWait(10));
	// setTimeout(huodong, randomWait(20));
	setTimeout(club_boss, randomWait(10));
	setTimeout(jiulou, randomWait(30));           // 酒楼

	setTimeout(pve.bind(this, 40), randomWait(120));

}


var dailyTaskTag = {};
function doDailyTask(){
	var dateStr = new Date().toISOString().slice(0, 10);
	if(dailyTaskTag[dateStr]){
		return;
	}
	
	list_shili();   // 获取势力榜, 用户信息

	setTimeout(qingan, randomWait(60));           // 皇宫请安
	setTimeout(fuli_qiandao, randomWait(60));     // 每日签到
	setTimeout(mobai, randomWait(60));            // 膜拜榜单
	
	dailyTaskTag[dateStr] = true;

}


/**
* 获取势力榜
*/
function list_shili(){
	var formData = '{"ranking":{"paihang":{"type":1}}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		if(!error && response.statusCode == 200){

			try{
				var respData = JSON.parse(body);
				if(respData.s = 1 && respData.a.ranking){
					shili_ranking = respData.a.ranking.shili;

					shili_ranking.forEach(function(rank, index){
						setTimeout(getFuserInfo.bind(this, rank.uid, index * 1000 + randomWait(3)));
					});
				}
			}catch(e){

			}
		}
	});

	
}

/**
* 获取用户信息
*/ 
function getFuserInfo(uid){
	var formData = {"user":{"getFuserMember":{"id":uid}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){

			try{
				var respData = JSON.parse(body);
				if(respData.s = 1 && respData.a.user){
					var fuser = respData.a.user.fuser;
					topUsers[fuser.id] = fuser;
				}
			}catch(e){

			}
		}
	});
}

/**
* 经营
*/
function checkJingying(){
	console.log('检查经营任务', new Date().toLocaleString());
	
	var jyForm = '{"user":{"refjingying":[]}}';
	request.post({url: apiUrl, form: jyForm}, function(error, response, body){
		if(!error && response.statusCode == 200){

			try{
				var respData = JSON.parse(body);

				// console.log(JSON.stringify(respData, null, '  '));

				if(respData.a.jingYing){
					var coinInfo = respData.a.jingYing.coin;
					var foodInfo = respData.a.jingYing.food;
					var armyInfo = respData.a.jingYing.army;
					
					if(coinInfo.num > 0){
						setTimeout(doJingying.bind(this, 'coin'), 1000);
					}else{
						console.log('coin经营时间未到');
					}
					if(foodInfo.num > 0){
						setTimeout(doJingying.bind(this, 'food'), 2000);
					}else{
						console.log('food经营时间未到');
					}
					if(armyInfo.num > 0){
						setTimeout(doJingying.bind(this, 'army'), 3000);
					}else{
						console.log('army经营时间未到');
					}

				}
				if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}

			}catch(e){
				console.log('refjingying error', e);
				setTimeout(checkJingying, 1000);
			}
			
			
		}else{
			console.log('checkJingying error! ', error, body);
		}
	});

}
function doJingying(jytype){
	
	var coinForm = '{"user":{"jingYing":{"jyid":2}}}';   
	var foodForm = '{"user":{"jingYing":{"jyid":3}}}';   
	var armyForm = '{"user":{"jingYing":{"jyid":4}}}';   


	if(jytype == 'coin'){
		request.post({url: apiUrl, form: coinForm}, function(error, response, body){
			if(!error && response.statusCode == 200){
				try{
					var respData = JSON.parse(body);
					console.log('执行一次经营操作 coin', new Date().toLocaleString());
					if(respData.s == 1 && respData.a.jingYing && respData.a.jingYing.coin.num > 0){
						console.log(respData.u.user.user);
						setTimeout(doJingying.bind(this, 'coin'), randomWait(10));
					}
					if(respData.a.system.errror){
						console.log('coin经营失败', JSON.stringify(respData.a.system.errror, null, '  '));
					}
				}catch(e){
					console.log('doJingying coin error', e, body);
					setTimeout(doJingying.bind(this, 'coin'), randomWait(10));
				}
				
				
			}else{
				console.log('coin经营操作失败.', error);
			}
		});
	}
	
	if (jytype == 'food') {
		request.post({url: apiUrl, form: foodForm}, function(error, response, body){
			if(!error && response.statusCode == 200){
				
				try{
					var respData = JSON.parse(body);
					// console.log(JSON.stringify(respData, null, '  '));
					console.log('执行一次经营操作 food', new Date().toLocaleString());
					
					if(respData.s == 1 && respData.a.jingYing && respData.a.jingYing.food.num > 0){
						console.log(respData.u.user.user);
						setTimeout(doJingying.bind(this, 'food'), randomWait(10));
					}
					
					if(respData.a.system.errror){
						console.log('food经营失败', JSON.stringify(respData.a.system.errror, null, '  '));
					}
				}catch(e){
					console.log('doJingying food error', e, body);
					setTimeout(doJingying.bind(this, 'food'), randomWait(10));
				}


			}else{
				console.log('food经营操作失败.', error);
			}
		});
	}

	if(jytype == 'army'){
		request.post({url: apiUrl, form: armyForm}, function(error, response, body){
			if(!error && response.statusCode == 200){
				try{
					var respData = JSON.parse(body);
					// console.log(JSON.stringify(respData, null, '  '));

					console.log('执行一次经营操作 army', new Date().toLocaleString());
					if(respData.s == 1 && respData.a.jingYing && respData.a.jingYing.army.num > 0){
						console.log(respData.u.user.user);
						setTimeout(doJingying.bind(this, 'army'), randomWait(10));
					}
					
					if(respData.a.system.errror){
						console.log('army经营失败', JSON.stringify(respData.a.system.errror, null, '  '));
					}					
				}catch(e){
					console.log('doJingying army error', e, body);
					setTimeout(doJingying.bind(this, 'army'), randomWait(10));
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
			try{
				var respData = JSON.parse(body);

				if(respData.s == 1 && respData.a.xunfang){
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
			}catch(e){
				setTimeout(checkXunfang, randomWait(10));
			}
			
		}else{
			console.log('checkXunfang error! ', error);
		}
	});
	
}

function doXunfang(){
	console.log('执行一次寻访操作', new Date().toLocaleString());
	var doXfForm = '{"xunfang":{"xunfan":{"type":0}}}';
	request.post({url: apiUrl, form: doXfForm}, function(error, response, body){
		if(!error && response.statusCode == 200){

			try{
				var respData = JSON.parse(body);
				if(respData.s == 1 && respData.a.xunfang){
					var xfInfo = respData.a.xunfang.xfInfo;
					if(xfInfo.num > 0){
						setTimeout(doXunfang, randomWait(30));
					}
				}
				if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}

			}catch(e){
				//setTimeout(doXunfang, randomWait(5));
				console.log('xunfang error', e, body);
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
function zhengwu(){


}


function doZhengwu(){
	console.log('执行一次政务检查任务', new Date().toLocaleString());
	var formData = '{"user":{"zhengWu":{"act":2}}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		if(!error && response.statusCode == 200){
			try{
				var respData = JSON.parse(body);

				if(respData.s == 1 && respData.a.jingYing){
					var num = respData.a.jingYing.exp.cd.num;
					if(num > 0){
						setTimeout(doZhengwu, randomWait(10));
					}else{
						console.log('暂无政务处理');
					}
				}
				if(respData.a.system.errror){
					console.log('政务失败.', respData.a.system.errror.msg);
				}
			}catch(e){
				setTimeout(doZhengwu, randomWait(10));
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

			try{
				var respData = JSON.parse(body);

				if(respData.s == 1 && respData.a.wife){
					var num = respData.a.wife.jingLi.num;
					if(num > 0){
						setTimeout(doChuanhuan, randomWait(10));
					}
				}
				if(respData.a.system.errror){
					console.log(respData.a.system.errror.msg);
				}
			}catch(e){
				console.log('wife-sjxo error', e, body);
				setTimeout(doChuanhuan, randomWait(10));
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
			try{

				var respData = JSON.parse(body);

				if(respData.s == 1 && respData.a.son){
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
			}catch(e){
				console.log('refson error', e, body);
				setTimeout(doSonPlay, randomWait(5));
			}

			
		}else{
			console.log('子嗣培养失败.', error);
		}
	});
}

function playSon(son){
	var playData = {"son":{"play":{"id":son.id}}};
	request.post({url: apiUrl, form: JSON.stringify(playData)}, function(error, response, body){
		try{
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

		}catch(e){

			console.log('play son error', e, body);
			setTimeout(playSon.bind(this, son), randomWait(5));
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
		pvb();
		return;
	}

	try{
		console.log('执行pve任务, 次数', times, new Date().toLocaleString());
		var pveData = '{"user":{"pve":[]}}';

		request.post({url: apiUrl, form: pveData}, function(error, response, body){
			if(!error && response.statusCode == 200){

				try{
					var respData = JSON.parse(body);

					// console.log('pve response:\n' + JSON.stringify(respData, null, '  '));

					if(respData.s == 1 && respData.u){
						var army = respData.u.user.user.army;
						var deil = respData.a.user.win.pvewin.deil;
						console.log('armay = ' + army + ', deil = ' + deil);
						if(army > deil){
							setTimeout(function(){pve(times - 1);}, randomWait(10));
						}else{
							console.log('兵力不足, respData.s == 1');
						}
						
					}else if(respData.s == 0 && respData.a.system.errror.type == 0){
						setTimeout(function(){pvb()}, randomWait(5));
					}else if(respData.s == 2){
						console.log('兵力不足, respData.s == 2');
					}
					if(respData.a.system.errror){
						console.log(JSON.stringify(respData.a.system.errror, null, '  '));
					}
				}catch(e){
					console.log('pve error', e, body);
				}
				
			}else{
				console.log('pve任务失败.', error);
			}
		});
	}catch(e){
		console.log('pve error', e);
	}
	
}

function pvb(){
	heros.forEach(function(h, index){
		setTimeout(pvb_fight.bind(this, h.id), (index + 1) * randomWait(3));
	});
}

function pvb_fight(hid){
	
	
	var pvbUser = {"user":{"pvb":{"id": hid}}};
	

	request.post({url: apiUrl, form: JSON.stringify(pvbUser)}, function(error, response, body){
		if(!error && response.statusCode == 200){

			var msg = '成功';
			try{
				var respData = JSON.parse(body);

				if(respData.a.system.errror){
					msg = respData.a.system.errror.msg;
				}

			}catch(e){
				console.log('pvb error', e, body);
			}
			console.log('执行pvb任务', 'hero is ', getHeroName(hid), msg);
			
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
	var desk = school.base.desk;

	if(desk > 0){
		school.list.forEach(function(stu){
			if(stu.hid != 0){
				
				if(stu.cd.next == 0){

					var formData = {"school":{"over":{"id":stu.id}}};
					request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
						if(!error && response.statusCode == 200){
							try{
								console.log('学习完成, ', getHeroName(stu.hid));
								var respData = JSON.parse(body);
								
								setTimeout(sendToSchool.bind(this, stu.hid, stu.id), randomWait(10));
								
							}catch(e){

							}
						}

					});

				}else{
					console.log('门客学习中', getHeroName(stu.hid));
				}
			}else{
				console.log('空闲座位', stu.id);
			}
		});

	}
	else{
		console.log('书院 - 一键完成');
		var formData = '{"school":{"allover":[]}}';
		request.post({url: apiUrl, form: formData}, function(error, response, body){
			if(!error && response.statusCode == 200){
				try{
					var respData = JSON.parse(body);
					if(respData.s == 1){
						vipHeros.forEach(function(hid, index){
							setTimeout(sendToSchool.bind(this, hid, index+1), randomWait(10));
						});
					}
				
					if(respData.a.system.errror){
						console.log(JSON.stringify(respData.a.system.errror, null, '  '));
					}
				}catch(e){
					console.log('school-allover error', e, body);
					setTimeout(doSchool, randomWait(5));
				}
				
			}else{
				console.log('书院学习任务.', error);
			}
		});

	}

	
}


/**
* 书院就读 hid: 门客id, sid: 书院座位
*/
function sendToSchool(hid, sid){

	console.log('sendToSchool', getHeroName(hid), sid);
	var formData = {"school":{"start":{"id":sid,"hid":hid}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		if(!error && response.statusCode == 200){
			try{
				var respData = JSON.parse(body);
				if(respData.s == 1 && respData.a.school && respData.a.school.list[sid-1].hid == hid){
					console.log('门客就学成功, 座位', sid, '门客', getHeroName(hid));
				}else {
					console.log('门客就学失败, 座位', sid, '门客', getHeroName(hid));

				}

				if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}

			}catch(e){
				console.log('school-start error', e,  body);
				setTimeout(sendToSchool.bind(this, hid, sid), randomWait(5));
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
	
	setTimeout(doMobai.bind(this, 1), randomWait(5));
	setTimeout(doMobai.bind(this, 2), randomWait(5));
	setTimeout(doMobai.bind(this, 3), randomWait(5));
	setTimeout(doMobai.bind(this, 4), randomWait(5));
	setTimeout(doMobai.bind(this, 5), randomWait(5));

}

function doMobai(type){
	var getTypeName = function(p){
		if(p == 1) return '势力榜';
		if(p == 2) return '关卡榜';
		if(p == 3) return '亲密榜';
		if(p == 4) return '跨服势力';
		if(p == 5) return '跨服帮会';
		return 'NaN';
	}

	var formData = {"ranking":{"mobai":{"type":type}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
			if(!error && response.statusCode == 200){
				try{
					var respData = JSON.parse(body);
					if(respData.s == 1){
						console.log('膜拜', getTypeName(type));
					}
					if(respData.a.system.errror){
						// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
					}
				}catch(e){
					console.log('ranking-mobai error', e, body);
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
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				console.log('牢房刑罚1次');
				setTimeout(laofang, randomWait(5));
			}

		}catch(e){
			console.log('laofang-bianDa error', e, body);
		}
			
		});

}


/**
* 请安
*/
function qingan(){
	var formData = '{"huanggong":{"qingAn":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				console.log('执行请安操作');
			}
		}catch(e){
			console.log('huanggong-qingAn error', e, body);
		}
			
		});
}

/**
* 衙门
*/
function yamen(){
	console.log('衙门出使', new Date().toLocaleString());
	var reqData = '{"yamen":{"yamen":[]}}';
	request.post({url: apiUrl, form: reqData}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			// console.log(JSON.stringify(respData, null, '  '));
			if(respData.s == 1) {
				if(respData.a.yamen.fight.hid){
					console.log('出使门客', getHeroName(respData.a.yamen.fight.hid));
				}
				if(respData.a.yamen.fight.fstate == 1){
						var fheros = respData.a.yamen.fight.fheros;

						if(fheros.length > 0){
							yamen_fight_heros(fheros);
						}
				}else{
					// 批准
					console.log('批准');
					var pizhun = '{"yamen":{"pizun":[]}}';
					request.post({url: apiUrl, form: pizhun}, function(error, response, body){
						var respData = JSON.parse(body);

						// console.log(JSON.stringify(respData, null, '  '));

						if(respData.s == 1){
							var fheros = respData.a.yamen.fight.fheros;

							if(fheros.length > 0){
								yamen_fight_heros(fheros);
							}
						}
					});
				}
				

			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){

			console.log('yamen error', e, body);
		}

		
		
	});
}
 
function yamen_fight_heros(fheros){
	var hArr = [];
	fheros.forEach(function(h){
		hArr.push({name: getHeroName(h.id), senior: h.senior});
	});
	console.log('衙门对战', hArr);

	var fhero = fheros[0];
	for(var i = 1; i < fheros.length; i++){
		var fhero2 = fheros[i];
		if(fhero.senior > fhero2.senior){
			fhero = fhero2;
		}else if(fhero.senior == fhero2.senior){

			var hIndex1 = heros_yamen.findIndex(function(hid){return hid == fhero.id;});
			var hIndex2 = heros_yamen.findIndex(function(hid){return hid == fhero2.id;});
			if(hIndex2 == -1 && hIndex1 != -1){
				fhero = fhero2;
			}
			if(hIndex1 < hIndex2){
				fhero = fhero2;
			}
		}
	}
	console.log('选中', getHeroName(fhero.id));

	yamen_fight(fhero.id);
}

var shopInfo = {
	'4': '初级血量',
	'5': '初级技能',
	'6': '初级攻击',
	'7': '中级血量',
	'8': '中级技能',
	'9': '中级攻击'
}
function yamen_fight(heroId){
	
	console.log('衙门战斗, fhero is ', heroId, getHeroName(heroId));
	var formData = {"yamen":{"fight":{"id":heroId}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			// console.log(JSON.stringify(respData, null, '  '));
			if(respData.s == 1 ){
				if(respData.a.yamen.win.over && respData.a.yamen.win.over.isover == 1){
					console.log('战斗结束');

					return;
				}

				if(respData.a.yamen.fight){
					var hp = respData.a.yamen.fight.hp;
					var hpmax = respData.a.yamen.fight.hpmax;
					if(hpmax) console.log('剩余血量', hp/hpmax);
				}


				if(respData.a.yamen.fight.fstate == 1){
					if(respData.a.yamen.fight.money >=2 ){
						var shop = respData.a.yamen.fight.shop;
						if(shop.length > 0){
							var shopId = shop[0].id;
							var hp = respData.a.yamen.fight.hp;
							var hpmax = respData.a.yamen.fight.hpmax;
							if(hp / hpmax <= 0.9){
								if(shop[1].id == 7) shopId = shop[1].id;
							}

							if(shopId == 6 || shopId == 9){
								var fheros = respData.a.yamen.fight.fheros;
								if(fheros.length > 0) {
									yamen_fight_heros(fheros);
								}
							}else{
								console.log('衙门战斗: 临时属性加成', shopInfo[shopId]);
								var shopData = {"yamen":{"seladd":{"id":shopId}}};
								request.post({url: apiUrl, form: JSON.stringify(shopData)}, function(){
									try{
										var respData = JSON.parse(body);
										var fheros = respData.a.yamen.fight.fheros;
										if(fheros.length > 0) {
											yamen_fight_heros(fheros);
										}
									}catch(e){
										console.log('yamen_fight seladd error', e, body);
									}
									
								});
							}
							
						}


					}else{
						console.log('money 不足, 不购买临时属性');

						var fheros = respData.a.yamen.fight.fheros;
						if(fheros.length > 0) {
							yamen_fight_heros(fheros);
						}
					}

					
				}
				 else if(respData.a.yamen.fight.fstate == 2){
					setTimeout(yamen_getrwd, randomWait(5));
						
				}
			}

			if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}

		}catch(e){
			console.log('yamen_fight error', e, body);
			setTimeout(yamen_fight.bind(this, heroId), randomWait(5));
		}

		
	});
}

function yamen_getrwd(){
	console.log('衙门战斗 领取奖励');
	var formData = '{"yamen":{"getrwd":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.yamen.fight){
				var fheros = respData.a.yamen.fight.fheros;
				if(fheros.length > 0){
					yamen_fight_heros(fheros);
				}else{
					console.log('全歼对方门客');
				}
			}

			if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}
		}catch(e){
			console.log('yamen_getrwd error', e, body);
			setTimeout(yamen_getrwd, randomWait(5));
		}
		
	});

}

/**
* 门客升级
*/
function doHeroUpgrade(){
	console.log('检查一次门客升级');
	var isHeroUpgrading = false;
	vipHeros.forEach(function(hid){
		var hero = heros.find(function(h){return h.id == hid;});
		if(!hero) console.log('hero not find', hid);
		if(hero && !isHeroUpgrading){
			if((hero.senior == 1 && hero.level < 100) || 
			   (hero.senior == 2 && hero.level < 150)){
			   	isHeroUpgrading = true;
			   	// console.log('doHeroUpgrade', hero.id, hero.name, hero.level);
				setTimeout(hero_upgrade.bind(this, hid), randomWait(5));
				return;
			}
		}
		

	});
}

function hero_upgrade(hid){
	var hero = heros.find(function(h){ return h.id == hid;});

	if(!hero){
       console.log('hero_upgrade, hero not find', hid);
       return;
    }

	console.log('门客升级, hero is', hero.name);

	var reqData = {"hero":{"upgrade":{"id":hid}}};
	request.post({url: apiUrl, form: JSON.stringify(reqData)}, function(error, response, body){

		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.u.user.user.coin > 0){

				var hero = respData.u.hero.heroList[0];
				var heroIndex = heros.find(function(h){return h.id == hero.id;});
				hero.name = getHeroName(hero.id);
				heros[heroIndex] = hero;
				console.log('门客升级成功', hero.name, hero.level);
				
				if(respData.u.user.user.coin > 100000){
					setTimeout(hero_upgrade.bind(this, hid), randomWait(5));
				}
				
			}

			if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}

		}catch(e){
			console.log('hero_upgrade error', e, body);
		}
		
	});

}


/**
* 酒楼
*/

function jiulou(){
	console.log('执行酒楼任务', new Date().toLocaleString());
	var jiulouForm = '{"jiulou":{"jlInfo":[]}}';
	request.post({url: apiUrl, form: jiulouForm}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.jiulou.yhshow){

				if(respData.a.jiulou.yhshow.length > 0){

					var fUid = respData.a.jiulou.yhshow[0].uid;

					// 进入酒楼
					console.log('进入酒楼');
					var yhGoForm = {"jiulou":{"yhGo":{"fuid":fUid}}};
					request.post({url: apiUrl, form: JSON.stringify(yhGoForm)}, function(error, response, body){
						
						try{
							var respData = JSON.parse(body);
							if(respData.s == 1){
								var seats = respData.a.jiulou.yhInfo.list;
								var seat = seats.find(function(s){
									return s.type == 0 && s.uid == 0;
								});

								if(seat){
									var yhChi = {"jiulou":{"yhChi":{"type":1,"xwid":seat.id,"fuid":fUid}}};
									request.post({url: apiUrl, form: JSON.stringify(yhChi)}, function(error, response, body){
										
										try{
											var respData = JSON.parse(body);
											if(respData.s == 1){
												console.log('酒楼就座', seat.id, fUid);
											}
											if(respData.a.system.errror){
												console.log(JSON.stringify(respData.a.system.errror, null, '  '));
											}
										}catch(e){
											console.log('jiulou-yhChi error', e, body);
										}
										
									});							
								}else{
									console.log('座位已满');
								}


							}
						}catch(e){
							console.log('jiulou-yhGo error', e, body);
						}
						
					});
				}
				if(respData.a.jiulou.yhshow.length == 0){
					console.log('无宴会信息');
				}
				
			}
		}catch(e){
			console.log('jiulou-jlInfo error', e, body);
		}

		
	});
}


/**
* 战场
*/
function wordboss(){
	
	if(new Date().getHours() < 12 || new Date().getHours() >= 14){
		return;
	}
	console.log('进入战场-匈奴兵来袭, wordboss, ', new Date().toLocaleString());

	var wbForm = '{"wordboss":{"wordboss":[]}}';

	request.post({url: apiUrl, form: wbForm}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				console.log('goFightmg');
				var goFighting = '{"wordboss":{"goFightmg":[]}}';
				request.post({url: apiUrl, form: goFighting}, function(error, response, body){
					try{
						var respData = JSON.parse(body);
						if(respData.s == 1){
							// 派遣门客战斗
							var sortHeros = heros.sort(function(h1, h2){return h1.zz.e1 - h2.zz.e1});
							sortHeros.forEach(function(h, index){
								setTimeout(wordboss_fight.bind(this, h.id), (index+1) * 2000);
							});

						}
						if(respData.a.system.errror){
							console.log(JSON.stringify(respData.a.system.errror, null, '  '));
						}

					}catch(e){
						console.log('wordboss-goFightmg error', e, body);
						setTimeout(goFightmg, randomWait(10));
					}

				});

			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('wordboss-wordboss error', e, body);
			setTimeout(wordboss, randomWait(10));
		}
	});
}

function wordboss_fight(hid){
	console.log('战场 - 匈奴兵来袭 - 门客战斗, 出场', getHeroName(hid));
	var hitmenggu = {"wordboss":{"hitmenggu":{"id":hid}}};
	request.post({url: apiUrl, form: JSON.stringify(hitmenggu, null, '  ')}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror));
			}

		}catch(e){
			console.log('wordboss-hitmenggu error', e, body);
			setTimeout(wordboss_fight.bind(this, index), randomWait(5));
		}

	});

}


/**
* 围剿匈奴王
*/
function wordboss_gofightg2d(){
	var cur_date = new Date();
	if(cur_date.getHours() < 20 || cur_date.getHours() >= 21){
		return;
	}


	var wbForm = '{"wordboss":{"goFightg2d":[]}}';
	request.post({url: apiUrl, form: wbForm}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.wordboss.ge2dan){
				heros.forEach(function(hero, index){
					setTimeout(wordboss_hitgeerdan.bind(this, hero), index * 1000 + 100);
				});
				
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('wordboss-goFightg2d error', e, body);
		}
	});

}


function wordboss_hitgeerdan(hero){
	
	
	var hitgeerdan = {"wordboss":{"hitgeerdan":{"id":hero.id}}};
	request.post({url: apiUrl, form: JSON.stringify(hitgeerdan)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				var damagePercent = 0;
				if(respData.a.wordboss.ge2dan){
					var allhp = respData.a.wordboss.ge2dan.allhp;
					var damage = respData.a.wordboss.ge2dan.damage;
					if(allhp != 0) damagePercent = damage / allhp;
				}

				console.log('战场 - 围剿匈奴王 - 门客战斗, 出场', hero.name, damagePercent, new Date().toLocaleString());
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}

		}catch(e){
			console.log('wordboss-hitgeerdan error', e, body);
		}

	});

}

/*
* 升级门客技能
*/
function uppkskill(){
	console.log('升级门客技能', new Date().toLocaleString());
	heros.forEach(function(hero){
		if(hero.pkexp > 150){
			if(hero.pkskill[0].level > hero.pkskill[1].level){
				setTimeout(doUppkskill.bind(this, 2, hero.id), randomWait(5));
			}else{
				setTimeout(doUppkskill.bind(this, 1, hero.id), randomWait(5));
			}
			
		}
	});
}

function doUppkskill(sid, hid){
	var formData = {"hero":{"uppkskill":{"sid":sid,"id":hid}}};
	var skillName = (sid == 1)? '辩才' : '学识';
	console.log('升级门客技能', skillName, getHeroName(hid));
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){

				if(respData.u.hero.heroList){
					
					var heroIndex = heros.findIndex(function(h){return h.id == hid});
					var hero = respData.u.hero.heroList[0];
					hero.name = getHeroName(hero.id);
					heros[heroIndex] = hero;
					console.log('门客技能升级成功', hero.name, hero.pkskill);

					if(hero.pkexp > 50){
						if(hero.pkskill[0].level > hero.pkskill[1].level){
							setTimeout(doUppkskill.bind(this, 2, hero.id), randomWait(5));
						}else{
							setTimeout(doUppkskill.bind(this, 1, hero.id), randomWait(5));
						}
					}
					
				}
				
			}
			if(respData.a.system.errror){
				console.log('门客技能升级失败', getHeroName(hid), respData.a.system.errror.msg);
			}

		}catch(e){
			console.log('doUppkskill error', e, body);
			
		}

	});

}



/**
* 演武场
*/
var hanlin_check_count = 0;
var hanlin_sit_time = 0;
var challengeRecord = [];

function hanlin(){

	var hour = new Date().getHours();
	if(hour <= 5){
		setTimeout(hanlin, 300 * 1000);
		return;
	}

	var hanlin_info = '{"hanlin":{"listinfo":[]}}';
	
	if(hanlin_check_count == 0) {
		console.log('启动校场任务', new Date().toLocaleString());
	}

	var cur_t = new Date().getTime();
	if(hanlin_sit_time > 0 && (cur_t - hanlin_sit_time < 1200000)) {
		setTimeout(hanlin, 1200000 + randomWait(120));
		return;
	}

	request.post({url: apiUrl, form: hanlin_info}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.hanlin){
				var ting = respData.a.hanlin.ting;

				if(hanlin_check_count % 60 == 0){
					console.log('校场 - 检测 - ', ting.length, new Date().toLocaleString());
				}
				hanlin_check_count++;

				if(ting && ting.length > 0){
					ting.sort(function(t1, t2){return t1.level - t2.level;}).reverse().forEach(function(t, index){
						if(t.level >= 8){
							setTimeout(hanlin_comein.bind(this, t.uid), randomWait(3));
							//return;
						}
					});
				}
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('hanlin-listinfo error', e, body);
		}

	});

	setTimeout(hanlin, randomWait(10));  // 5秒钟检测一次
}

function hanlin_comein(fuid){
	// console.log('校场 - 进入习武厅', fuid, new Date().toLocaleString());
	var formData = {"hanlin":{"comein":{"fuid":fuid}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.hanlin){
				var desks = respData.a.hanlin.desk.desks;
				var ridArr = [];
				desks.forEach(function(d){
					ridArr[d.rid] = d.rid;
				});
				for(var i = 1; i <=3; i++){
					if(!ridArr[i]){
						setTimeout(hanlin_sitdown.bind(this, fuid, i), 100);
						break;
					}
				}

				// 挑战 
				desks.forEach(function(desk, index){
					if(desk.num > 0) return;   // 保护中
					
					if(desk.level > userParam.level) {
						return;
					}
					if(desk.level == userParam.level){
						var deskUser = topUsers[desk.uid];
						if(deskUser){
							if(deskUser.exp > userParam.exp){
								// console.log('习武-挑战条件检查, 政绩比拼失败，不挑战', deskUser.name, deskUser.exp, userParam.exp);
								return;
							}
						}
					}

					
					var challenger = challengeRecord.find(function(ch){return ch.uid == desk.uid;});
					// console.log('习武-挑战条件检查',challengeRecord);
					if(challenger && (new Date().getTime() - challenger.timestamp) < 12 * 3600000 ){
						console.log('12小时内不再重复挑战', fuid);

					}else{
						// 开始挑战
						setTimeout(hanlin_ti.bind(this, fuid, desk), index * 1000 + 400);
					}

					
				});
				
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('hanlin-comein error', e, body);
		}

	});

}

function hanlin_sitdown(fuid, rid){
	console.log('校场 - 开始习武', fuid, rid);
	var formData = {"hanlin":{"sitdown":{"rid":rid, "fuid":fuid}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.hanlin){
				console.log('校场 - 开始习武 - 已就座', fuid, rid);
				hanlin_sit_time = new Date().getTime();
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('hanlin-sitdown error', e, body);
		}

	});

}

function hanlin_ti(fuid, desk){
	var rid = desk.rid;
	var uid = desk.uid;
	console.log('习武 - 挑战', desk.rid, desk.name, desk.level);
	var formData = {"hanlin":{"ti":{"rid":rid,"uid":uid,"fuid":fuid}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				if(respData.a.hanlin.win.tif.win == 0){
					console.log('挑战失败');
					challengeRecord.push({
						uid: desk.uid,
						timestamp: new Date().getTime()
					});
				}else if(respData.a.hanlin.win.tif.win == 0){
					console.log('挑战成功');
				}
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('hanlin-sitdown error', e, body);
		}

	});

}

function huodong(){
	huodong_buy_282();
	setTimeout(huodong_play_282, 5000);
}
function huodong_buy_282(){  // 购买道具
	var formData = '{"huodong":{"hd282buy":{"id":1}}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.penalize){
				console.log('活动-购买活动道具');
				var shop = respData.a.penalize.shop;
				if(shop[0].limit > 0){
					setTimeout(huodong_buy_282, 100);
				}else{
					console.log('道具购买数量不足');
				}
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('huodong_buy_282 error', e, body);
		}

	});
}

function huodong_play_282(){
	var formData = '{"huodong":{"hd282Info":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.penalize){
				console.log('活动-282-play');
				var bag = respData.a.penalize.bag;
				bag.forEach(function(b){
					for(var i = 0; i < b.count; i++){
						setTimeout(huodong_doplay_282.bind(this, b.id), randomWait(10));
					}
				});
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('huodong_play_282 error', e, body);
		}

	});
}
function huodong_doplay_282(playId){
	var formData = {"huodong":{"hd282play":{"id":playId}}};
	request.post({url: apiUrl, form: JSON.stringify(formData)}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				console.log('活动-doplay-282', playId);
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('huodong_doplay_282 error', e, body);
		}

	});
}

function keju(){
	console.log('检查科举');
	var refsonForm = '{"user":{"refson":[]}}';
	request.post({url: apiUrl, form: refsonForm}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.son.sonList){
				var sonList = respData.a.son.sonList;
				sonList.forEach(function(son){
					if(son.state == 3){
						console.log('科举 - ', son.name);
						setTimeout(doKeju.bind(this, son.id), randomWait(5));
					}
				});
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('huodong_doplay_282 error', e, body);
		}

	});
}
function doKeju(sonId){
	var kejuForm = {"son":{"keju":{"id":sonId}}};
	request.post({url: apiUrl, form: JSON.stringify(kejuForm)}, function(error, response, body){
		
	});
}



function club_boss(){
	console.log('副本检测');
	var bossForm = '{"club":{"clubBossInfo":[]}}';
	request.post({url: apiUrl, form: bossForm}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 && respData.a.club.bossInfo){
				var bossInfo = respData.a.club.bossInfo;
				if(bossInfo.length > 0){
					bossInfo.forEach(function(boss, index){
						if(boss.type == 1){
							console.log('打副本boss - ', boss);
							setTimeout(club_boss_fight.bind(this, boss.id), index * 10000 + 30000);
						}
					});
				}
				
			}
			if(respData.a.system.errror){
				// console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log('huodong_doplay_282 error', e, body);
		}

	});
}

function club_boss_fight(bossId){
	var sortHeros = heros.sort(function(h1, h2){return h1.zz.e1 - h2.zz.e1});
	sortHeros.reverse();
	sortHeros.forEach(function(h, index){
		setTimeout(club_boss_fight_hero.bind(this, bossId, h.id), (index + 1)*100);

	});
}

function club_boss_fight_hero(bossId, hid){
	var bossPk = {"club":{"clubBossPK":{"cbid":bossId,"id":hid}}};
	console.log('打副本boss - ', bossId, hid, getHeroName(hid));
	request.post({url: apiUrl, form: JSON.stringify(bossPk)}, function(error, response, body){
		
	});
}