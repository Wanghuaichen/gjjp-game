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


var serverUrl_4 = 'http://llhzf.commpad.cn/servers/s4.php?sevid=4&ver=V1.0.54';
var serverUrl_5 = 'http://llhzf.commpad.cn/servers/s5.php?sevid=5&ver=V1.0.54';
var serverUrl_6 = 'http://llhzf.commpad.cn/servers/s6.php?sevid=6&ver=V1.0.54';
var vipHeros_4 = [44, 8, 2, 6, 20, 9, 16, 17, 18, 19, 21];
var vipHeros_5 = [44, 45, 2, 6, 20, 9, 16, 17, 18, 19, 21, 8];
var vipHeros_6 = [44, 45, 2, 6, 20, 9, 16, 17, 18, 19, 21, 8];

var vipHeros = vipHeros_4;

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
	{id: 30, name: ''},
	{id: 44, name: '狄仁杰'},
	{id: 45, name: '韩信'}

];



var heros = [];

var school = {};

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
	  		console.log(e);
	  	}


	  	
	    
	  }else{
	  	console.log(error);
	  	setTimeout(fastLogin, randomWait(5));
	  }
	});



}

fastLogin();



function accountLogin(){
	console.log('do account login');
	var formData = {"login":{"loginAccount":{"platform":"llhzfgjjp","openid":"xj1614792693","openkey":fastToken}}};


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
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}
			}catch(e){
				console.log(e);
				setTimeout(accountLogin, randomWait(5));
			}

			
			
			
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
					console.log('用户信息:', 'level =', userParam.level, 'cash = ', userParam.cash, 'coin = ', userParam.coin,
						'food = ', userParam.food, 'cash = ', userParam.food);

				}


				if(respData.a.school){
					school = respData.a.school;
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
				console.log(e);
				setTimeout(finalLogin, randomWait(5));
			}

			
			
		}
	});
}
	
function startTask(){

	doTask();

	setTimeout(function(){
		isTaskRunning = false;
		if(serverUrl == serverUrl_4){
			console.log('切换到服务区5', new Date().toLocaleString());
			serverUrl = serverUrl_5;
			vipHeros = vipHeros_5;
			try{
				fastLogin();
			}catch(e){
				console.log(e);
			}
			
		}else if(serverUrl == serverUrl_5){
			console.log('切换到服务区6', new Date().toLocaleString());
			serverUrl = serverUrl_6;
			vipHeros = vipHeros_6;
			fastLogin();
		}else if(serverUrl == serverUrl_6){
			console.log('切换到服务区4', new Date().toLocaleString());
			serverUrl = serverUrl_4;
			vipHeros = vipHeros_4;
			fastLogin();
		}

	}, 120000);  // 5分钟后重新执行

}

var isTaskRunning = false;
function doTask(){
	// 执行任务

	if(isTaskRunning) return;
	isTaskRunning = true;

	console.log('开始执行任务', new Date().toLocaleString());


	setTimeout(checkJingying, randomWait(30));   // 经营
	setTimeout(doZhengwu, randomWait(30));       // 政务
	setTimeout(doSchool, randomWait(30));        // 书院	
	setTimeout(doChuanhuan, randomWait(30));     // 传唤
	setTimeout(checkXunfang, randomWait(30));    // 寻访
	setTimeout(doSonPlay, randomWait(30));       // 子嗣培养
	setTimeout(uppkskill, randomWait(30));       // 门客技能升级
	setTimeout(doHeroUpgrade, randomWait(30));  // 门客等级升级


	setTimeout(fuli_qiandao, randomWait(60));     // 每日签到
	setTimeout(mobai, randomWait(60));            // 膜拜榜单
	// setTimeout(laofang, randomWait(120));      // 牢房
	setTimeout(qingan, randomWait(60));           // 皇宫请安

	// setTimeout(yamen, randomWait(30));            // 衙门战斗
	setTimeout(wordboss, randomWait(30));         // 中午 匈奴兵来袭
	setTimeout(jiulou, randomWait(30));           // 酒楼

	// setTimeout(pve.bind(this, 40), randomWait(120));
	
	
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
				console.log(e);
				setTimeout(checkJingying, 1000);
			}
			
			
		}else{
			console.log('checkJingying error! ', error);
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
					console.log(e);
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
					console.log(e);
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
					console.log(e);
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
	var xunfangDelay = 1800000;   // 寻访间隔，半小时
	setTimeout(checkXunfang, xunfangDelay);  // 半小时后再次寻访
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
				setTimeout(doXunfang, randomWait(5));

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
	var formData = '{"user":{"zhengWu":{"act":1}}}';
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
					console.log('政务失败.', JSON.stringify(respData.a.system.errror, null, '  '));
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
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}
			}catch(e){
				console.log(e);
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
				console.log(e);
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

			console.log(e);
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
		pvb(1);
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
				}catch(e){
					console.log(e);
					setTimeout(function(){pve(times - 1);}, randomWait(5));
				}
				
			}else{
				console.log('pve任务失败.', error);
			}
		});
	}catch(e){
		console.log(e);
		setTimeout(function(){pve(times)}, randomWait(5));
	}
	
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
			try{
				var respData = JSON.parse(body);

				if(respData.s == 2){
					setTimeout(function(){pvb(uindex + 1)}, 1000);
				}else if(respData.s == 1){
					setTimeout(function(){pve(40)}, 1000);
				}
				if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
					setTimeout(function(){pve(40)}, randomWait(10));
				}

			}catch(e){
				console.log(e);
				setTimeout(function(){pvb(uindex)}, 1000);

			}
			
		}else{
			console.log('pvb任务失败.', error);
		}
	});

}

function getHeroName(hid){
	var name = 'NaN';
	var hero = heroNames.find(function(h){return h.id == hid});
	if(hero) name = hero.name;
	return name;
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
					console.log(e);
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
				console.log(e);
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
				try{
					var respData = JSON.parse(body);
					if(respData.s == 1){
						console.log('膜拜', getTypeName(type));
					}
					if(respData.a.system.errror){
						console.log(JSON.stringify(respData.a.system.errror, null, '  '));
					}
				}catch(e){
					console.log(e);
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
			console.log(e);
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
			console.log(e);
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
				if(respData.a.yamen.fight.fstate == 1){
						var fheros = respData.a.yamen.fight.fheros;

						if(fheros.length > 0){
							var random = Math.random();

							var fhero = fheros[0];
							if(random > 0.6){
								fhero = fheros[2];
							}else if(random > 0.3){
								fhero = fheros[1];
							}
							yamen_fight(fhero.id);
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
					});
				}
				

			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){

			console.log(e);
		}

		
		
	});
}
 

function yamen_fight(heroId){
	var hero = heros.find(function(h){ return h.id == heroId;});
	console.log('衙门战斗, fhero is ', hero);
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

								
				var fheros = respData.a.yamen.fight.fheros;

				var random = Math.random();

				var fhero = fheros[0];
				if(random > 0.6){
					fhero = fheros[2];
				}else if(random > 0.3){
					fhero = fheros[1];
				}

				
				if(respData.a.yamen.fight.fstate == 1){
					var shop = respData.a.yamen.fight.shop;
					if(shop.length > 0){
						console.log('衙门战斗: 临时属性加成', shop[0].id);
						var shopData = {"yamen":{"seladd":{"id":shop[0].id}}};
						request.post({url: apiUrl, form: JSON.stringify(shopData)}, function(){
							
							setTimeout(yamen_fight.bind(this, fhero.id), randomWait(5));
							
						});
					}
				}
				 else if(respData.a.yamen.fight.fstate == 2){
					
					setTimeout(yamen_getrwd.bind(this, fhero.id), randomWait(5));
						
				}
				
				
			}

			if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}

		}catch(e){
			console.log(e);
			setTimeout(yamen_fight.bind(this, heroId), randomWait(5));
		}

		
	});
}

function yamen_getrwd(heroId){
	console.log('衙门战斗 领取奖励');
	var formData = '{"yamen":{"getrwd":[]}}';
	request.post({url: apiUrl, form: formData}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1 ){
				setTimeout(yamen_fight.bind(this, heroId), randomWait(5));
				
			}

			if(respData.a.system.errror){
					console.log(JSON.stringify(respData.a.system.errror, null, '  '));
				}
		}catch(e){
			console.log(e);
			setTimeout(yamen_getrwd.bind(this, heroId), randomWait(5));
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
	console.log('门客升级, hero is', hero.name);

	var reqData = {"hero":{"upgrade":{"id":hid}}};
	request.post({url: apiUrl, form: JSON.stringify(reqData)}, function(error, response, body){
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
									var yhChi = {"jiulou":{"yhChi":{"type":2,"xwid":seat.id,"fuid":fUid}}};
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
											console.log(e);
										}
										
									});							
								}else{
									console.log('座位已满');
								}


							}
						}catch(e){
							console.log(e);
						}
						
					});
				}
				if(respData.a.jiulou.yhshow.length == 0){
					console.log('无宴会信息');
				}
				
			}
		}catch(e){
			console.log(e);
		}

		
	});
}


/**
* 战场
*/
function wordboss(){
	console.log('进入战场, wordboss, ', new Date().toLocaleString());
	if(new Date().getHours < 12 || new Date().getHours() > 14){
		console.log('时间未到，战场未开启');
	}

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
							setTimeout(wordboss_fight.bind(this, 1), randomWait(5));
						}
						if(respData.a.system.errror){
							console.log(JSON.stringify(respData.a.system.errror, null, '  '));
						}

					}catch(e){
						console.log(e);
						setTimeout(goFightmg, randomWait(10));
					}

				});

			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}
		}catch(e){
			console.log(e);
			setTimeout(wordboss, randomWait(10));
		}
	});
}

function wordboss_fight(index){
	
	var hero = heros[heros.length - index];
	if(!hero){
		console.log('战场 - 未找到战斗的门客, 战斗结束!', index);
		return;
	}
	console.log('战场 - 门课战斗, 出场', hero.name);
	var hitmenggu = {"wordboss":{"hitmenggu":{"id":hero.id}}};
	request.post({url: apiUrl, form: JSON.stringify(hitmenggu, null, '  ')}, function(error, response, body){
		try{
			var respData = JSON.parse(body);
			if(respData.s == 1){
				setTimeout(wordboss_fight.bind(this, index + 1), randomWait(5));
			}
			if(respData.a.system.errror){
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}

		}catch(e){
			console.log(e);
			setTimeout(wordboss_fight.bind(this, index), randomWait(5));
		}

	});

}



/*
* 升级门客技能
*/
function uppkskill(){
	console.log('升级门客技能', new Date().toLocaleString());
	heros.forEach(function(hero){
		if(hero.pkexp > 50){
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
	request.post({url: apiUrl, form: JSON.stringify(formData, null, '  ')}, function(error, response, body){
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
				console.log('门客技能升级失败', getHeroName(hid));
				console.log(JSON.stringify(respData.a.system.errror, null, '  '));
			}

		}catch(e){
			console.log(e);
			
		}

	});

}