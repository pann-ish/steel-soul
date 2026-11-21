# 钢魂烈斗 STEEL SOUL

原创热血 3D 机甲网页游戏，可以安装成手机 App，离线也能玩。

- `index.html` 初始版（正常进度，隐藏角色要解锁）
- `all.html` 全解锁版
- `sw.js` 离线缓存 + 自动更新
- `manifest.webmanifest` / `manifest-all.webmanifest` App 名称和图标

## 怎么更新
把新的 `index.html` / `all.html` 上传覆盖。玩家下次有网络打开时会自动拿到新版本；没网络时继续玩上一个版本。
大改版时把 `sw.js` 第 2 行的版本号加一（例如 v1.3.0 → v1.4.0）。
