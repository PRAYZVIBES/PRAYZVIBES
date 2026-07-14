/*
PRAYZVIBES WEBSITE SCRIPT
*/


// =========================
// MOBILE MENU
// =========================


const menuButton = document.getElementById("menuButton");

const mobileMenu = document.getElementById("mobileMenu");



if(menuButton && mobileMenu){


menuButton.addEventListener("click", function(){


if(mobileMenu.style.display === "block"){

mobileMenu.style.display="none";

}

else{

mobileMenu.style.display="block";

}


});


}





// Close mobile menu after selecting a link


document.querySelectorAll(".mobile-menu a").forEach(function(link){


link.addEventListener("click",function(){


if(mobileMenu){

mobileMenu.style.display="none";

}


});


});








// =========================
// HEADER CHANGE ON SCROLL
// =========================


const header=document.querySelector(".site-header");



if(header){


window.addEventListener("scroll",function(){


if(window.scrollY > 50){


header.classList.add("scrolled");


}

else{


header.classList.remove("scrolled");


}


});


}









// =========================
// SIMPLE FADE IN EFFECT
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

section.style.transform="translateY(30px)";

section.style.transition="all .8s ease";


observer.observe(section);


});