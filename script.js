/*
PRAYZVIBES WEBSITE SCRIPT
FINAL VERSION
*/


document.addEventListener("DOMContentLoaded", function(){





/* =========================
MOBILE MENU
========================= */


const menuButton = document.getElementById("menuButton");

const mobileMenu = document.getElementById("mobileMenu");



if(menuButton && mobileMenu){



menuButton.addEventListener("click", function(event){


event.stopPropagation();


mobileMenu.classList.toggle("active");


});





const mobileLinks = mobileMenu.querySelectorAll("a");



mobileLinks.forEach(function(link){


link.addEventListener("click", function(){


mobileMenu.classList.remove("active");


});


});





document.addEventListener("click", function(event){


if(

!mobileMenu.contains(event.target)

&&

!menuButton.contains(event.target)

){


mobileMenu.classList.remove("active");


}


});





document.addEventListener("keydown", function(event){


if(event.key === "Escape"){


mobileMenu.classList.remove("active");


}


});



}








/* =========================
HEADER SCROLL
========================= */


const header = document.querySelector(".site-header");



if(header){



window.addEventListener("scroll", function(){



if(window.scrollY > 80){


header.classList.add("scrolled");


}

else{


header.classList.remove("scrolled");


}



});


}









/* =========================
SCROLL ANIMATIONS
========================= */


const sections = document.querySelectorAll("section");



if("IntersectionObserver" in window){



const observer = new IntersectionObserver(function(entries){



entries.forEach(function(entry){



if(entry.isIntersecting){


entry.target.classList.add("visible");


observer.unobserve(entry.target);


}



});


},{

threshold:0.15


});






sections.forEach(function(section){


observer.observe(section);


});



}









/* =========================
EXTERNAL LINKS SECURITY
========================= */


const externalLinks = document.querySelectorAll(
'a[target="_blank"]'
);



externalLinks.forEach(function(link){


link.setAttribute(
"rel",
"noopener noreferrer"
);


});









/* =========================
IMAGE FALLBACK
========================= */


const images = document.querySelectorAll("img");



images.forEach(function(image){



image.addEventListener("error",function(){



image.style.opacity="0.4";


});



});





});