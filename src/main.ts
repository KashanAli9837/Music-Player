import { gsap } from "gsap";
function loaderAnimation(e: string) {
  return gsap.from(e, {
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
  // Types
  type Elem = HTMLElement;
  type Elems = NodeListOf<HTMLElement>;
  type Input = HTMLInputElement;
  type Image = HTMLImageElement;
  type song = { title: string; format?: string };
  type Songs = readonly song[];
  type volumeIntensity = "high" | "medium" | "low" | "mute";

  // Short way to get element / elements

  function gets(e: string) {
    return document.querySelector(e) as Elem;
  }
  function get(e: string) {
    return document.querySelectorAll(e) as Elems;
  }

  // To remove main loader

  function removeMainLoader() {
    const loader = gets(".main_loader_container");

    loader.style.display = "none";
    mainLoaderAnimation.kill();
  }
  removeMainLoader();

  // All Songs
  const songs: Songs = [
    { title: "Bloody Mary (refrain)" },
    { title: "She Knowns (Lyrics)" },
    { title: "Crystal Castles - Empathy" },
    { title: "Sia - Unstoppable (Lyrics)" },
    { title: "Clovis Eyes Fluxxwave" },
    {
      title: "Living Life in the Night",
      format: "mkv",
    },
    { title: "From a Man + After Dark" },
    { title: "Money so big" },
    { title: "Bella Ciao" },
    { title: "MAFIA - Trap Rap Beat" },
    { title: "const me Down Slowly" },
    { title: "Thunder - imagine dragons" },
    { title: "Memory Reboot" },
    { title: "One Pumped PHONK" },
    { title: "The last soul X last soul" },
    { title: "SleepWalker" },
    { title: "Pastel Ghost Dark Beach" },
    { title: "Rage Time Funk" },
    { title: "Edit Phonk" },
    { title: "Metamorphosim - Interworld" },
    { title: "Clandestina - Jvstin" },
    { title: "Brodyaga Funk" },
    { title: "Particles Slowed" },
    { title: "As It Was" },
    { title: "idfc - blackbear" },
    { title: "Rapture (Slowed + Reverb)" },
    { title: "ShootOut (Slowed + Reverb)" },
    { title: "On My Own" },
    { title: "Choix de vie" },
    { title: "Hensonn - Sahara" },
    { title: "Sweater Weather" },
    { title: "I like the way you kiss me X the perfect girl" },
  ];

  // selecting elements
  const video = gets("video") as HTMLVideoElement;
  const volumeRange = gets("#volume_range") as Input;
  const timelapse = gets("#timelapse") as Input;
  const loopIcon = gets("#loop_icon") as Image;
  const remTimeInd = gets("#remaining_time");
  const line = gets("#duration_progress");
  const right = gets("#main_right");

  let isVideoPlaying: boolean = false;
  let isLoop: boolean = false;
  let originalVolume: number;
  let originalVolumeIcon: volumeIntensity;
  let isMute: boolean = false;

  let remainingTimeInterval: number;
  let timelapseInterval: number;
  let durationLineInterval: number;

  function getSongName(song: song): string {
    const title = song.title;

    if (title.length > 22) {
      return `${title.slice(0, 22)}...`;
    }

    return title;
  }

  function addSongs(): void {
    right.innerHTML = "";

    songs.forEach((song, i) => {
      const songElement = document.createElement("h4");
      songElement.textContent = getSongName(song);
      songElement.classList.add(`${i}`);
      right.appendChild(songElement);
    });
  }
  addSongs();

  // Selecting songNames
  const songNames = get("#main_right h4");

  function handleError(i: number) {
    const errorContainer = gets("#video_error");

    const showError = () => {
      errorContainer.classList.remove("hidden");
    };

    if (i < 0 || i >= songs.length) {
      showError();
    }
    video.addEventListener("error", showError);

    // Otherwise Remove Error
    errorContainer.classList.add("hidden");
  }

  function updateComponents(i: number) {
    const songNameDisplayer = gets(".song_name_displayer");

    songNames.forEach((songName) => {
      songName.classList.remove("active");
    });

    songNames[i].classList.add("active");
    video.src = `songs/song${i + 1}.${checkFormat(i)}`;
    songNameDisplayer.textContent = `${i + 1}. ${getSongName(songs[i])}`;

    // To check Video Format
    function checkFormat(i: number) {
      let hasFormat = songs[i]["format"];
      return hasFormat ?? "mp4";
    }
  }

  function refreshTimelapse() {
    timelapse.value = "0";
    line.style.width = "0";
  }

  function videoLoader() {
    const videoLoaderContainer = gets(".video_loader_container");
    displayLoader();

    video.addEventListener("canplaythrough", () => {
      removeLoader();
    });

    function displayLoader() {
      videoLoaderContainer.style.display = "flex";
      videoLoaderAnimation.play();
    }

    function removeLoader() {
      videoLoaderContainer.style.display = "none";
      videoLoaderAnimation.pause();
    }
  }

  function trackEnd() {
    video.addEventListener("ended", () => {
      if (!video.loop) {
        pauseVideo();
      }
    });
  }

  function displayDuration(i: number) {
    video.addEventListener("loadeddata", () => {
      putDuration();

      editSong(i, 19, "0 : 06", "0 : 38");
      editSong(i, 25, "start", "2 : 02");
      editSong(i, 26, "start", "2 : 35");
      editSong(i, 32, "0 : 10", "0 : 45");
    });
  }

  function updateSong(i = 0) {
    handleError(i);
    refreshTimelapse();
    updateComponents(i);
    videoLoader();
    displayDuration(i);
    trackEnd();
  }

  function checkSongCondition() {
    if (isVideoPlaying) {
      video.play();
    } else {
      video.pause();
    }
  }

  // Playing song based on click
  function playSongByUser() {
    right.addEventListener("click", (e) => {
      const target = e.target as HTMLHeadingElement;
      const idx = +target.classList[0];

      if (idx) {
        updateSong(idx);
        checkSongCondition();
        saveData("songIdx", idx.toString());
      }
    });
  }

  function putDuration() {
    const totalTimeIndicator = gets("#total_time");
    const duration = Math.floor(video.duration);

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

  function createIcon(Icon: "play" | "pause") {
    const icon = document.createElement("img");
    icon.src = "icons/pause.svg";
    icon.alt = "play & pause icon";
    icon.id = "playPauseIcon";
    icon.src = `icons/${Icon}.svg`;
    return icon;
  }

  function playVideo() {
    const playIcon = gets("#playPauseIcon");
    const pauseIcon = createIcon("pause");

    pauseIcon.addEventListener("load", () => {
      playIcon.replaceWith(pauseIcon);
      video.play();
      isVideoPlaying = true;

      remainingTimeInterval = setInterval(() => {
        remTimeInd.innerHTML = calcRemDur();
      }, 100);
      timelapseInterval = setInterval(() => {
        timelapse.value = video.currentTime.toString();
      }, 100);
      durationLine();
    });
  }

  function pauseVideo() {
    const pauseIcon = gets("#playPauseIcon");
    const playIcon = createIcon("play");

    playIcon.addEventListener("load", () => {
      pauseIcon.replaceWith(playIcon);
      video.pause();
      isVideoPlaying = false;

      clearInterval(remainingTimeInterval);
      clearInterval(timelapseInterval);
      clearInterval(durationLineInterval);
    });
  }

  function playPauseFuncationality() {
    const playPauseBtn = gets("#playPauseIcon_container");
    playPauseBtn.addEventListener("click", playOrPause);
  }

  function playOrPause() {
    if (!isVideoPlaying) {
      playVideo();
    } else {
      pauseVideo();
    }
  }

  function backAndForwardFunctionality() {
    const skippers = get(".skippers");

    skippers.forEach((icon, i) => {
      icon.addEventListener("click", () => {
        backAndForward(i);
      });
    });
  }

  function backAndForward(i: number) {
    if (i === 0) {
      video.currentTime -= 5;
    } else {
      video.currentTime += 5;
    }
    refreshComponents();
  }

  function refreshComponents(check: boolean = true) {
    remTimeInd.innerHTML = calcRemDur();
    moveDurationLine();

    if (check) {
      timelapse.value = `${video.currentTime}`;
    } else {
      video.currentTime = +timelapse.value;
    }
  }

  function moveVideo() {
    ["input", "click"].forEach((e) => {
      timelapse.addEventListener(e, () => {
        refreshComponents(false);
      });
    });
  }

  function durationLine() {
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

  function makeLoop() {
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
    saveData("loop", isLoop.toString());
  }

  function createVolumeIcon(intensity: volumeIntensity) {
    const volumeIcon = gets("#volume_icon");
    const icon = document.createElement("img");

    icon.src = `icons/volume-${intensity}.svg`;
    icon.className = "cursor-pointer w-[2vw]";
    icon.alt = "volume icon";
    icon.id = "volume_icon";

    icon.addEventListener("load", () => {
      volumeIcon.replaceWith(icon);
    });
  }

  function setVol() {
    const volume = +volumeRange.value;
    video.volume = volume / 100;
    isMute = false;

    switch (true) {
      case volume > 80:
        createVolumeIcon("high");
        break;
      case volume > 25:
        createVolumeIcon("medium");
        break;
      case volume > 0:
        createVolumeIcon("low");
        break;

      default:
        createVolumeIcon("mute");
        break;
    }

    saveData("volume", volumeRange.value.toString());
  }

  function findIntensity(): volumeIntensity {
    const volumeIcon = gets(".volumeStuff > img") as Image;
    const src = volumeIcon.src;
    const starting = src.indexOf("-") + 1;
    const ending = src.lastIndexOf(".");

    return src.slice(starting, ending) as volumeIntensity;
  }

  function muteUnmute() {
    if (isMute && video.volume === 0) {
      createVolumeIcon(originalVolumeIcon);
      video.volume = originalVolume;
      volumeRange.value = (originalVolume * 100).toString();
    } else {
      originalVolume = video.volume;
      originalVolumeIcon = findIntensity();

      createVolumeIcon("mute");
      video.volume = 0;
      volumeRange.value = "0";
    }

    isMute = !isMute;
    saveData("volume", volumeRange.value.toString());
  }

  function makeVolFunctionality(): void {
    volumeRange.addEventListener("input", () => {
      setVol();
    });
  }

  function shortcutsFunctionality() {
    window.addEventListener("keydown", (e) => {
      if (e.repeat) {
        return;
      }
      switch (e.key) {
        case " ":
          e.preventDefault();
          playOrPause();
          break;
        case "ArrowRight":
          backAndForward(1);
          break;
        case "ArrowLeft":
          backAndForward(0);
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
    startingTime: string | "start",
    endingTime: string | "end"
  ) {
    if (i + 1 === editSongIdx) {
      video.addEventListener("timeupdate", (): void => {
        if (endingTime !== "end") {
          if (remTimeInd.innerHTML > endingTime) {
            if (video.loop) {
              video.currentTime = 0;
            } else {
              pauseVideo();
            }
          }
        }

        if (startingTime !== "start") {
          if (remTimeInd.innerHTML < startingTime) {
            const seconds = changeTimeIntoSec(startingTime);

            video.currentTime = seconds;
            timelapse.value = seconds.toString();
            moveDurationLine();
          }
        }
      });
    }
  }

  function changeTimeIntoSec(time: string): number {
    const splittedTime = time.split(" : ");
    return +splittedTime[0] * 60 + +splittedTime[1];
  }

  function saveData(n: string, v: string) {
    localStorage.setItem(n, v);
  }

  function showData() {
    const songIdx = localStorage.getItem("songIdx") as string;
    const loop = localStorage.getItem("loop") as string;
    const volume = localStorage.getItem("volume") as string;

    if (songIdx) {
      updateSong(+songIdx);
      songNames[+songIdx].scrollIntoView();
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

  function dynamicVolumeFunctionality() {
    window.addEventListener("mousedown", () => {
      window.addEventListener("mousemove", dynamicVolume);
    });

    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", dynamicVolume);
      showDynamicVolume(false);
    });
  }

  function dynamicVolume(e: any) {
    const { top, bottom } = video.getBoundingClientRect();
    const y = Math.floor(gsap.utils.mapRange(bottom, top, 0, 100, e.y));
    const condY = y >= 0 && y <= 100;
    const condX = e.x >= 612 && e.x <= 700;

    if (condY && condX) {
      volumeRange.value = y.toString();
      setVol();

      const indicator = gets("#dynamicVolumeInd");
      indicator.style.left = `${e.x + 20}px`;
      indicator.style.top = `${e.y - 5}px`;
      indicator.textContent = `${y}%`;
      showDynamicVolume(true);
    }
  }

  function showDynamicVolume(what: boolean) {
    const indicator = gets("#dynamicVolumeInd");

    if (what) {
      indicator.classList.remove("hidden");
    } else {
      indicator.classList.add("hidden");
    }
  }

  updateSong();
  playSongByUser();
  playPauseFuncationality();
  backAndForwardFunctionality();
  moveVideo();
  makeLoopFunctionality();
  makeVolFunctionality();
  shortcutsFunctionality();
  showData();
  dynamicVolumeFunctionality();
}
