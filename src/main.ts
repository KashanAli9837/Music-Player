function loaderAnimation(Elements: string) {
  return gsap.from(Elements, {
    y: 50,
    stagger: {
      each: 0.2,
      repeat: -1,
      yoyo: true,
    },
  });
}

// animating loaders
const mainLoaderAnimation = loaderAnimation(".main_loader");
const videoLoaderAnimation = loaderAnimation(".video_loader");

window.addEventListener("load", main);

function main(): void {
  // Type Aliases
  type Div = HTMLDivElement;
  type Elems = NodeListOf<HTMLElement>;
  type Elem = HTMLElement;
  type Input = HTMLInputElement;
  type Image = HTMLImageElement;

  // removing main loader
  function removeMainLoaderAnimation(): void {
    const loader = document.querySelector(".main_loader_container") as Div;

    loader.style.display = "none";
    mainLoaderAnimation.kill();
  }

  // Short way to get element / elements
  class get {
    // For Single Element
    static elem(element: string): Elem {
      return document.querySelector(element) as Elem;
    }

    // For Multiple Elements
    static elems(elements: string): Elems {
      return document.querySelectorAll(elements) as Elems;
    }
  }

  // All Songs
  const songs: string[][] = [
    ["Bloody Mary (refrain)"],
    ["She Knowns (Lyrics)"],
    ["Crystal Castles - Empathy"],
    ["Sia - Unstoppable (Lyrics)"],
    ["Clovis Eyes Fluxxwave"],
    ["Living Life in the Night", "mkv"],
    ["From a Man + After Dark"],
    ["Money so big"],
    ["Bella Ciao"],
    ["MAFIA - Trap Rap Beat"],
    ["Let me Down Slowly"],
    ["Thunder - imagine dragons"],
    ["Memory Reboot"],
    ["One Pumped PHONK"],
    ["The last soul X last soul"],
    ["SleepWalker"],
    ["Pastel Ghost Dark Beach"],
    ["Rage Time Funk"],
    ["Edit Phonk"],
    ["Metamorphosim - Interworld"],
    ["Clandestina - Jvstin"],
    ["Brodyaga Funk"],
    ["Particles Slowed"],
    ["As It Was"],
    ["idfc - blackbear"],
    ["Rapture (Slowed + Reverb)"],
    ["ShootOut (Slowed + Reverb)"],
    ["On My Own"],
    ["Choix de vie"],
    ["Hensonn - Sahara"],
    ["Sweater Weather"],
  ];

  // selecting elements
  const video = get.elem("video") as HTMLVideoElement;
  const timelapse = get.elem("#timelapse") as HTMLInputElement;
  const remTimeInd = get.elem("#remaining_time");
  const playPauseIcon = get.elem("#playPauseIcon") as Image;
  const line = get.elem("#duration_progress");
  const loopIcon = get.elem("#loop_icon") as HTMLImageElement;
  const volumeRange = get.elem("#volume_range") as Input;
  const volumeIcon = get.elem("#volume_icon") as Image;

  let isVideoPlaying: boolean = false;
  let isLoop: boolean = false;
  let originalVolume: number;
  let originalVolumeIcon: string;

  let remainingTimeInterval: number;
  let timelapseInterval: number;
  let durationLineInterval: number;

  // Adding Songs Name
  function addSongsName(): void {
    const right = get.elem("#main_right");
    let clutter: string = "";

    songs.forEach((song) => {
      clutter += `<h4>${song[0]}</h4>`;
    });

    right.innerHTML = clutter;
  }
  addSongsName();

  const h4 = get.elems("#main_right h4");

  function updateSong(i: number = 0): void {
    video.addEventListener("error", showError);

    // If the given index is wrong
    if (i < 0 || i >= songs.length) {
      showError();
    }

    function showError(): void {
      const errorDiv = get.elem("#video_error");
      errorDiv.classList.remove("hidden");

      return;
    }

    const songNameDisplayer = get.elem(".song_name_displayer");

    h4.forEach((h4) => {
      h4.className = "";
    });

    h4[i].className = "active";
    video.src = `songs/song${i + 1}.${checkFormat(i)}`;
    songNameDisplayer.innerHTML = `${i + 1}. ${songs[i][0]}`;
    timelapse.value = "0";
    line.style.width = "0";

    (function workingWithVideo(): void {
      const videoLoaderContainer = get.elem(".video_loader_container");
      displayVideoLoader(videoLoaderContainer);

      video.addEventListener("loadedmetadata", () => {
        putDuration();
      });

      editSong(i, 19, "0 : 38", 6);
      editSong(i, 25, "2 : 02");
      editSong(i, 26, "2 : 35");

      video.addEventListener("canplaythrough", (): void => {
        removeVideoLoader(videoLoaderContainer);

        video.addEventListener("ended", (): void => {
          if (!video.loop) {
            pauseVideo();
          }
        });
      });
    })();

    function displayVideoLoader(elem: Elem): void {
      elem.style.display = "flex";
      videoLoaderAnimation.play();
    }

    function removeVideoLoader(elem: Elem): void {
      elem.style.display = "none";
      videoLoaderAnimation.pause();
    }
  }

  // Check Video Format
  function checkFormat(i: number): string {
    let hasFormat: string = songs[i][1];

    if (hasFormat) {
      return hasFormat;
    }

    return "mp4";
  }

  // adding listeners to the song names
  function playSongByUser(): void {
    h4.forEach((h4, i) => {
      h4.addEventListener("click", () => {
        updateSong(i);
        checkSongCondition();
        saveData("songIdx", String(i));
      });
    });

    function checkSongCondition(): void {
      if (isVideoPlaying) {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  function putDuration() {
    const totalTimeIndicator = get.elem("#total_time");
    const duration = Math.floor(video.duration);

    function calcRemDur(): string {
      const currentTime = Math.floor(video.currentTime);
      return changeFormat(currentTime);
    }

    function calcTotalDur(): string {
      return changeFormat(duration);
    }

    totalTimeIndicator.innerHTML = calcTotalDur();
    remTimeInd.innerHTML = calcRemDur();
    timelapse.max = `${duration}`;
  }

  function calcRemDur(): string {
    const currentTime = Math.floor(video.currentTime);
    return changeFormat(currentTime);
  }

  function changeFormat(time: number): string {
    const minutes = Math.floor(time / 60);
    const seconds = String(time % 60).padStart(2, "0");
    return `${minutes} : ${seconds}`;
  }

  function playVideo() {
    playPauseIcon.src = "icons/pause.svg";
    video.play();
    isVideoPlaying = true;

    remainingTimeInterval = setInterval(() => {
      remTimeInd.innerHTML = calcRemDur();
    }, 1);
    timelapseInterval = setInterval(() => {
      timelapse.value = String(video.currentTime);
    }, 1);
    durationLine();
  }

  function pauseVideo() {
    playPauseIcon.src = "icons/play.svg";
    video.pause();
    isVideoPlaying = false;

    clearInterval(remainingTimeInterval);
    clearInterval(timelapseInterval);
    clearInterval(durationLineInterval);
  }

  function playPauseFuncationality(): void {
    const playPauseBtn = get.elem("#playPauseIcon_container");
    playPauseBtn.addEventListener("click", playOrPause);
  }

  function playOrPause(): void {
    if (!isVideoPlaying) {
      playVideo();
    } else {
      pauseVideo();
    }
  }

  function backAndForwardFunctionality(): void {
    const skippers = document.querySelectorAll(".skippers");

    skippers.forEach((icon, i) => {
      icon.addEventListener("click", () => {
        if (i === 0) {
          video.currentTime -= 5;
        } else if (i === 1) {
          video.currentTime += 5;
        }
        backAndForward();
      });
    });
  }

  function backAndForward(): void {
    remTimeInd.innerHTML = calcRemDur();
    moveDurationLine();
    timelapse.value = `${video.currentTime}`;
  }

  function moveVideo(): void {
    timelapse.addEventListener("input", () => {
      video.currentTime = +timelapse.value;
      remTimeInd.innerHTML = calcRemDur();
      moveDurationLine();
    });
  }

  function durationLine(): void {
    durationLineInterval = setInterval(() => {
      moveDurationLine();
    }, 1);
  }

  function moveDurationLine(): void {
    const time = Math.floor((video.currentTime / video.duration) * 100);
    gsap.to(line, {
      width: `${time}%`,
      ease: "power4",
    });
  }

  function makeLoop(): void {
    video.loop = true;
    loopIcon.src = `icons/repeat-true.svg`;
    isLoop = true;
  }
  function remvoeLoop(): void {
    video.loop = false;
    loopIcon.src = `icons/repeat-false.svg`;
    isLoop = false;
  }

  function makeLoopFunctionality() {
    loopIcon.addEventListener("click", changeLoopFunctionality);
  }

  function changeLoopFunctionality() {
    if (!isLoop) {
      makeLoop();
    } else {
      remvoeLoop();
    }
    saveData("loop", String(isLoop));
  }
  let isMute: boolean = false;

  function setVol(): void {
    const volume = +volumeRange.value;
    video.volume = volume / 100;

    if (volume > 80) {
      volumeIcon.src = "icons/volume-high.svg";
    } else if (volume > 25) {
      volumeIcon.src = "icons/volume-medium.svg";
    } else if (volume > 0) {
      volumeIcon.src = "icons/volume-low.svg";
    } else {
      volumeIcon.src = "icons/volume-mute.svg";
    }
  }

  function muteUnmute() {
    if (isMute) {
      volumeIcon.src = originalVolumeIcon;
      video.volume = originalVolume;
      volumeRange.value = String(originalVolume * 100);
      isMute = false;
    } else {
      originalVolume = video.volume;
      originalVolumeIcon = volumeIcon.src;

      volumeIcon.src = "icons/volume-mute.svg";
      video.volume = 0;
      volumeRange.value = "0";
      isMute = true;
    }
  }

  function makeVolFunctionality(): void {
    volumeRange.addEventListener("input", () => {
      setVol();
      saveData("volume", String(volumeRange.value));
    });
  }

  function makeKeyboardFunctionality(): void {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case " ":
          playOrPause();
          e.preventDefault();
          break;
        case "ArrowRight":
          video.currentTime += 5;
          backAndForward();
          break;
        case "ArrowLeft":
          video.currentTime -= 5;
          backAndForward();
          break;
        case "l":
          changeLoopFunctionality();
          break;
        case "m":
          muteUnmute();
          break;
      }
    });
  }

  function editSong(
    i: number,
    editSongIdx: number,
    time: string,
    startingTime?: number
  ): void {
    if (i + 1 === editSongIdx) {
      video.addEventListener("timeupdate", (): void => {
        if (remTimeInd.innerHTML >= time) {
          if (video.loop) {
            video.currentTime = 0;
          } else {
            pauseVideo();
          }
        }

        if (startingTime) {
          if (video.currentTime < startingTime) {
            video.currentTime = startingTime;
          }
        }
      });
    }
  }

  function saveData(n: string, v: string): void {
    localStorage.setItem(n, v);
  }

  function showData(): void {
    const songIdx = localStorage.getItem("songIdx") as string;
    const loop = localStorage.getItem("loop") as string;
    const volume = localStorage.getItem("volume") as string;

    if (songIdx) {
      updateSong(+songIdx);
      h4[+songIdx].scrollIntoView();
    }

    if (loop) {
      isLoop = !JSON.parse(loop);
      changeLoopFunctionality();
    }

    if (volume) {
      volumeRange.value = volume;
      setVol();
    }
  }

  removeMainLoaderAnimation();
  updateSong();
  playSongByUser();
  playPauseFuncationality();
  backAndForwardFunctionality();
  moveVideo();
  makeLoopFunctionality();
  makeVolFunctionality();
  makeKeyboardFunctionality();
  showData();
}
