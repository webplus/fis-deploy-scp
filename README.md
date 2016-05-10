# fis-deploy-scp

## 说明
FIS2的scp部署插件，将FIS产出部署到远程机，scp适合单机部署的方式，多机部署请使用rsync。
此插件分为三步，第一步先把要部署的输出文件夹压缩成zip包，第二步使用scp到目标服务器，第三步在目标服务器上解压到指定文件夹。

## 使用方法

安装 

```bash
npm install fis-deploy-scp -g 
``` 

启用 

```javascript
fis.config.set('modules.deploy', 'scp'); 
```

配置

```javascript
fis.config.set('settings.deploy.scp', {
    publish: {
        source: '../output', // 要上传的文件夹
        server: 'root@127.0.0.1', // 远程机
        to: '/remote/dir' // 要上传到的远程机器的文件夹
    }
});
```

发布

```bash
fis release -Dompd publish
```
