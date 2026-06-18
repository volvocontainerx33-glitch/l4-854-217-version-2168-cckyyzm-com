纯静态电影网站说明

站点名称：高清剧集大全
页面标题：电视剧热播榜单-热门电视剧大全-高清剧集在线播放
影片数量：2000
播放源数量：20 个 m3u8 源循环绑定到详情页播放器。

使用方式：
1. 解压 ZIP 后，直接打开 index.html 即可浏览。
2. 如果需要展示封面图，请把 1.jpg 到 150.jpg 放在网站顶级目录，与 index.html 同级。
3. 所有 HTML 页面已插入百度统计脚本，脚本位于 </body> 前，不会显示为页面文字。
4. 详情页播放器使用 HLS 初始化逻辑，浏览器可通过 hls.js 或原生 HLS 播放 m3u8。

目录说明：
- index.html：首页，包含 Hero 首屏轮播、精选、最新、排行榜、分类入口。
- categories.html：分类总览页。
- categories/：多个真实独立分类页。
- movies.html：全部片库页，包含全部影片卡片与搜索筛选。
- rankings.html：排行榜页。
- video/：每部影片一个独立详情页。
- assets/css/style.css：未压缩的可读 CSS。
- assets/js/main.js 与 assets/js/player.js：未压缩的可读 JS。
