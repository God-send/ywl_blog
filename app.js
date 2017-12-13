var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require('fs'),
    gm = require('gm').subClass({imageMagick:true});

//引入数据库配置文件
var setting = require('./setting');
//引入数据库操作实例
// var db = require('./model/db');
//引入flash插件
var flash = require('connect-flash');
//session插件
var session = require('express-session');
//session存放数据库的插件
var Mongostore = require('connect-mongo')(session);

//添加路由
var routes = require('./routes/index');

var app = express();

// 视图引擎设置 _dirname当前目录
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));//打印日志
//数据转化为json格式
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//使用flash
app.use(flash());
//使用session
app.use(session({
    //加密
    secret:setting.cookieSecret,
    //cookie过期时间
    cookie:{maxAge:1000*60*60*24*30},
    //加密
    key:setting.db,
    //连接数据库地址
    store:new Mongostore({
        url:'mongodb://localhost/blog'
    }),
    //是否强制保存会话
    resave:false,
    //会话未修改的时候，是否保存
    saveUninitialized:true
}))
//将app传递给路由函数使用
routes(app);

// 捕获404和转发错误处理程序
// 应用级别的中间件 function
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);//将错误对象抛给下个中间件
});

// 错误处理程序
app.use(function(err, req, res, next) {
  // 设置局部，只提供开发中的错误，临时工
  res.locals.message = err.message;
  //env环境 是 开发模式
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // 呈现错误页面 错误状态码 || 500
  res.status(err.status || 500);
  res.render('error');
});
//添加监听
app.listen(3030,function(){
  console.log('node in ok');
})
module.exports = app;

//----------------------------------------------------------------------------------

exports.imgUpload = function(req, res) {
    res.header('Content-Type', 'text/plain');
    var path = req.files.img.path;	//获取用户上传过来的文件的当前路径
    var sz = req.files.img.size;
    if (sz > 2*1024*1024) {
        fs.unlink(path, function() {	//fs.unlink 删除用户上传的文件
            res.end('1');
        });
    } else if (req.files.img.type.split('/')[0] != 'image') {
        fs.unlink(path, function() {
            res.end('2');
        });
    } else {
        imageMagick(path)
            .resize(150, 150, '!') //加('!')强行把图片缩放成对应尺寸150*150！
            .autoOrient()
            .write('public/images/user/'+req.files.img.name, function(err){
                if (err) {
                    console.log(err);
                    res.end();
                }
                fs.unlink(path, function() {
                    return res.end('3');
                });
            });
    }
};