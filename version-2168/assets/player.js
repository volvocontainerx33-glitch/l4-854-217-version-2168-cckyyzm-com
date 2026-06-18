(function () {
  function setStatus(node, text) {
    if (node) {
      node.textContent = text;
    }
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-player-trigger]');
    var status = shell.querySelector('[data-player-status]');
    var source = video ? video.getAttribute('data-src') : '';
    var hlsInstance = null;
    var initialized = false;

    if (!video || !source) {
      setStatus(status, '未找到播放源。');
      return;
    }

    function attachSource() {
      if (initialized) {
        return Promise.resolve();
      }

      initialized = true;
      setStatus(status, '正在加载高清播放源...');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        shell.classList.add('is-ready');
        setStatus(status, '播放源已就绪。');
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);

        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          shell.classList.add('is-ready');
          setStatus(status, '播放源已就绪。');
        });

        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus(status, '播放源加载失败，请稍后重试。');
          }
        });

        return Promise.resolve();
      }

      video.src = source;
      shell.classList.add('is-ready');
      setStatus(status, '当前浏览器将尝试使用原生播放器打开播放源。');
      return Promise.resolve();
    }

    function playVideo() {
      attachSource().then(function () {
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            shell.classList.remove('is-playing');
            setStatus(status, '播放已准备好，如浏览器拦截自动播放，请再次点击播放按钮。');
          });
        }
      });
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
      shell.classList.add('is-ready');
      setStatus(status, '正在播放。');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
      if (initialized) {
        setStatus(status, '已暂停，点击画面可继续播放。');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
