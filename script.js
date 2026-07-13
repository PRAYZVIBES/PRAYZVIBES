/*
PRAYZVIBES WEBSITE SCRIPT
*/


// =========================
// MOBILE MENU
// =========================


const menuButton = document.getElementById("menuButton");

const mobileMenu = document.getElementById("mobileMenu");



if(menuButton && mobileMenu){


menuButton.addEventListener("click", function(event){


event.stopPropagation();



if(mobileMenu.style.display === "block"){


mobileMenu.style.display="none";


}

else{


mobileMenu.style.display="block";


}


});


}








// CLOSE MOBILE MENU AFTER LINK CLICK


const mobileLinks=document.querySelectorAll(".mobile-menu a");



mobileLinks.forEach(function(link){


link.addEventListener("click",function(){


if(mobileMenu){


mobileMenu.style.display="none";


}


});


});









// CLOSE WHEN CLICKING OUTSIDE


document.addEventListener("click",function(event){



if(!mobileMenu || !menuButton){

return;

}



if(

!mobileMenu.contains(event.target)

&&

!menuButton.contains(event.target)

){


mobileMenu.style.display="none";


}



});









// =========================
// HEADER CHANGE ON SCROLL
// =========================


const header=document.querySelector(".site-header");



if(header){


window.addEventListener("scroll",function(){



if(window.scrollY > 80){


header.classList.add("scrolled");


}

else{


header.classList.remove("scrolled");


}



});


}









// =========================
// PAGE FADE IN ANIMATION
// =========================


const sections=document.querySelectorAll("section");



const observer=new IntersectionObserver(function(entries){



entries.forEach(function(entry){



if(entry.isIntersecting){


entry.target.style.opacity="1";

entry.target.style.transform="translateY(0)";


}



});



},{

threshold:.15

});





sections.forEach(function(section){


section.style.opacity="0";

section.style.transform="translateY(40px)";

section.style.transition="all .8s ease";


observer.observe(section);


});









// =========================
// RELEASE COVER FALLBACK
// =========================


const covers=document.querySelectorAll(".release-cover img");



covers.forEach(function(cover){



cover.addEventListener("error",function(){



cover.style.background="#311F14";


cover.style.display="block";


});



});