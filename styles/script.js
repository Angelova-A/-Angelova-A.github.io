let listVideo = document.querySelectorAll('.video-list .vid'); 
let mainVideo = document.querySelector('.main-video video'); 
let title = document.querySelector('.main-video .title'); 

listVideo.forEach(video => {
    video.onclick = () => {
        listVideo.forEach(vid => vid.classList.remove('active'));
        video.classList.add('active'); 
        if(video.classList.contains('active')){
            let src = video.children[0].getAttribute('src'); 
            mainVideo.src = src; 
            let text = video.children[1].innerHTML;
            title.innerHTML = text;
        }
    };
});

var player= document.getElementById('player'); 
let progress = document.getElementById('progress'); 
let playbtn = document.getElementById("playbtn"); 
var player2= document.getElementById('player2'); 
let progress2 = document.getElementById('progress2'); 
let playbtn2 = document.getElementById("playbtn2");
var player3= document.getElementById('player3'); 
let progress3 = document.getElementById('progress3'); 
let playbtn3 = document.getElementById("playbtn3");  

var playpause = function (){
  console.log("1"); 
  if(player.paused){
    player.play(); 
    player2.pause();
    player3.pause();
  } else{
    player.pause(); 
  }
}
var playpause2 = function (){
  console.log("2"); 
  if(player2.paused){
    player2.play(); 
    player.pause();
    player3.pause();
  } else{
    player2.pause(); 
  }
}
var playpause3 = function (){
  console.log("3"); 
  if(player3.paused){
    player3.play(); 
    player.pause(); 
    player2.pause();
  } else{
    player3.pause(); 
  }
}

playbtn.addEventListener("click", playpause); 
playbtn2.addEventListener("click", playpause2);
playbtn3.addEventListener("click", playpause3); 

player.onplay = function () {
  playbtn.classList.remove('fa-play'); 
  playbtn.classList.add('fa-pause'); 
}
player2.onplay = function () {
  playbtn2.classList.remove('fa-play'); 
  playbtn2.classList.add('fa-pause'); 
}

player3.onplay = function () {
  playbtn3.classList.remove('fa-play'); 
  playbtn3.classList.add('fa-pause'); 
}

player.onpause = function () {
  playbtn.classList.add('fa-play'); 
  playbtn.classList.remove('fa-pause'); 
}

player2.onpause = function () {
  playbtn2.classList.add('fa-play'); 
  playbtn2.classList.remove('fa-pause'); 
}
player3.onpause = function () {
  playbtn3.classList.add('fa-play'); 
  playbtn3.classList.remove('fa-pause'); 
}



player.ontimeupdate = function () {
  let ct = player.currentTime; 
  current.innerHTML = timeFormat(ct); 
  let duration = player.duration; 
  prog = Math.floor((ct * 100) / duration); 
  progress.style.setProperty("--progress", prog + "%"); 
}


player2.ontimeupdate = function () {
  let ct = player2.currentTime; 
  current2.innerHTML = timeFormat(ct); 
  let duration = player2.duration; 
  prog = Math.floor((ct * 100) / duration); 
  progress2.style.setProperty("--progress", prog + "%"); 
}

player3.ontimeupdate = function () {
  let ct = player3.currentTime; 
  current3.innerHTML = timeFormat(ct); 
  let duration = player3.duration; 
  prog = Math.floor((ct * 100) / duration); 
  progress3.style.setProperty("--progress", prog + "%"); 
}

function timeFormat(ct) {
  minutes = Math.floor(ct / 60); 
  seconds = Math.floor(ct % 60); 

  if(seconds < 10){
    seconds = "0"+seconds; 
  }
  return minutes + ":" + seconds; 
}

