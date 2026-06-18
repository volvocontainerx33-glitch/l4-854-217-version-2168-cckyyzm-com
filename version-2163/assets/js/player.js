(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupPlayer(container) {
    var source = container.dataset.src || "";
    var title = container.dataset.title || "视频";
    var video = container.querySelector("video");
    var startButton = container.querySelector("[data-player-start]");
    var status = container.querySelector("[data-player-status]");
    var prepared = false;
    var hls = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function prepare() {
      if (prepared || !video) {
        return;
      }

      prepared = true;

      if (!source) {
        setStatus("暂无可用播放源");
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("播放源已就绪");
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("播放源已就绪");
        });
      } else {
        setStatus("当前浏览器不支持 HLS 播放");
      }
    }

    function play() {
      prepare();

      if (!video) {
        return;
      }

      var promise = video.play();

      if (promise && typeof promise.then === "function") {
        promise.then(function () {
          if (startButton) {
            startButton.hidden = true;
          }
          setStatus("正在播放：" + title);
        }).catch(function () {
          setStatus("请再次点击播放按钮");
        });
      }
    }

    if (startButton) {
      startButton.addEventListener("click", play);
    }

    if (video) {
      video.addEventListener("play", function () {
        if (startButton) {
          startButton.hidden = true;
        }
        setStatus("正在播放：" + title);
      });

      video.addEventListener("pause", function () {
        setStatus("已暂停");
      });

      video.addEventListener("error", function () {
        setStatus("视频加载失败，请检查网络或播放源");
      });
    }

    prepare();

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-hls-player]"));
    players.forEach(setupPlayer);
  });
})();
