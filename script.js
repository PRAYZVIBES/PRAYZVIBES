/*
PRAYZVIBES PROFESSIONAL FINAL SCRIPT
*/


// =========================
// MOBILE MENU
// =========================


const menuButton = document.getElementById("menuButton");

const mobileMenu = document.getElementById("mobileMenu");



if(menuButton && mobileMenu){


menuButton.addEventListener("click",()=>{


const isOpen =
mobileMenu.classList.toggle("active");


menuButton.setAttribute(
"aria-expanded",
isOpen
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
// HEADER SCROLL EFFECT
// =========================


const header =
document.querySelector(".site-header");



if(header){


window.addEventListener("scroll",()=>{


if(window.scrollY > 50){


header.classList.add("scrolled");


}

else{


header.classList.remove("scrolled");


}


});


}







// =========================
// SCROLL REVEAL
// =========================


const sections =
document.querySelectorAll("section");



if("IntersectionObserver" in window){


const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(entry=>{


if(entry.isIntersecting){


entry.target.classList.add("visible");


observer.unobserve(entry.target);


}


});


},
{

threshold:0.15

}

);



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
// IMAGE FALLBACK CHECK
// =========================


document.querySelectorAll("img")
.forEach(image=>{


image.addEventListener("error",()=>{


image.style.opacity="0.5";


});


});