var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//引入数据库配置文件
var setting = require('./setting');
//引入数据库操作实例
var db = require('./model/db');

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
//
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

