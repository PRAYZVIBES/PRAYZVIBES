/*
PRAYZVIBES PROFESSIONAL SCRIPT
*/


// =========================
// MOBILE MENU
// =========================


const menuButton = document.getElementById("menuButton");

const mobileMenu = document.getElementById("mobileMenu");



if(menuButton && mobileMenu){


menuButton.addEventListener("click",()=>{


const open =
mobileMenu.classList.toggle("active");


menuButton.setAttribute(
"aria-expanded",
open.toString()
);


});




document.querySelectorAll(".mobile-menu a")
.forEach(link=>{


link.addEventListener("click",()=>{


mobileMenu.classList.remove("active");


menuButton.setAttribute(
"aria-expanded",
"false"
);


});


});


}







// =========================
// CLOSE MENU WITH ESCAPE
// =========================


document.addEventListener("keydown",(event)=>{


if(event.key==="Escape"){


if(mobileMenu){

mobileMenu.classList.remove("active");

}


if(menuButton){

menuButton.setAttribute(
"aria-expanded",
"false"
);

}


}


});








// =========================
// HEADER SCROLL EFFECT
// =========================


const header =
document.querySelector(".site-header");



if(header){


const updateHeader = ()=>{


if(window.scrollY > 60){


header.classList.add("scrolled");


}

else{


header.classList.remove("scrolled");


}


};



window.addEventListener(
"scroll",
updateHeader,
{
passive:true
}
);


updateHeader();


}








// =========================
// SCROLL REVEAL ANIMATION
// =========================


const sections =
document.querySelectorAll("section");



const reducedMotion =
window.matchMedia(
"(prefers-reduced-motion: reduce)"
).matches;




if(!reducedMotion && sections.length){


const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add("visible");


observer.unobserve(
entry.target
);


}


});


},
{


threshold:0.15


});





sections.forEach(section=>{


observer.observe(section);


});


}

else{


sections.forEach(section=>{


section.classList.add("visible");


});


}








// =========================
// IMAGE ERROR HANDLING
// =========================


document.querySelectorAll("img")
.forEach(image=>{


image.addEventListener(
"error",
()=>{


image.style.opacity="0.5";


console.warn(
"Image failed to load:",
image.src
);


}

);


});








// =========================
// LAZY YOUTUBE OPTIMISATION
// =========================


const videos =
document.querySelectorAll(
"iframe"
);



videos.forEach(video=>{


video.setAttribute(
"loading",
"lazy"
);


});