# 企鹅服务机
基于Serverless架构的[企鹅弹幕机](https://github.com/xqe2011/danmuji)/[企鹅评论机](https://github.com/xqe2011/pinglunji)远程控制中转服务器。

本项目基于[cloudflare](http://cloudflare.com)+[pusher](https://pusher.com)实现无状态服务的零成本中转服务器。

本项目提供企鹅服务机官方的免费远程中转服务器: `https://fuwuji.nuozi.club`

## Serverless部署
### 前言
首先你需要注册一个`cloudflare`账号和`pusher`账号, 在`cloudflare`上完成自己域名绑定，在`pusher`上创建应用并保存好应用的`id`、`key`等信息.  
接着在`pusher`的应用的`App Settings`中打开`Enable client events`.  

### 部署Worker
你需要先安装`NodeJS`, 可在对应语言官网下载.
```
git clone https://github.com/xqe2011/fuwuji
npm install
npm run deploy
```
按照提示登录自己的`cloudflare`账号, 之后`wrangler`会自动将本项目上传到`cloudflare`的`worker`页面.

### 配置环境变量和域名
进入`cloudflare`后台, 找到本项目, [绑定域名](https://developers.cloudflare.com/pages/configuration/custom-domains/).

接着在本项目页面找到`Settings`, 然后导航到`Variables`, 按照以下内容填写环境变量并选择`Encrypt`.


| 名称 | 含义 | 备注 |
| --- | --- | --- |
| PUSHER_APPID | PUSHER应用ID | 加密, 必填 |
| PUSHER_CLUSTER | PUSHER集群,建议选择`ap1`使用新加坡节点 | 加密, 必填 |
| PUSHER_KEY | PUSHER应用Key | 加密, 必填 |
| PUSHER_SECRET | PUSHER应用Secret | 加密, 必填 |
| DASHBOARD_URL | 前端面板URL, 用于企鹅弹幕机配置页面快速复制远程链接使用 | 选填 |

### 部署前端面板
企鹅弹幕机/评论机仓库会维持不同版本的面板部署, 其地址默认为`https://danmuji.nuozi.club/版本号/index.html`或`https://pinglunji.nuozi.club/版本号/index.html`, 若无特别需求, 建议直接用即可, 这些部署是完全前端的, 你仍然可以使用自己的服务机, 可以放心安全问题.  
如果你一定期望部署前端面板，请在`cloudflare`中创建`pages`项目, `git`地址填写企鹅弹幕机/企鹅评论机仓库地址.  
接着框架选择`vue.js`, 项目根目录选择`./web`, 输出目录选择`./dist`, 然后进行部署并绑定自己的域名.  
接着修改本项目`worker`的`DASHBOARD_URL`为你的域名即可.