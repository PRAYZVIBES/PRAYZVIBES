/*
PRAYZVIBES PROFESSIONAL FINAL SCRIPT
OPTIMIZED VERSION
*/


document.addEventListener("DOMContentLoaded", () => {



// =========================
// MOBILE MENU
// =========================


const menuButton = document.getElementById("menuButton");

const mobileMenu = document.getElementById("mobileMenu");


if(menuButton && mobileMenu){


menuButton.addEventListener("click",()=>{


const opened = mobileMenu.classList.toggle("active");


menuButton.setAttribute(
"aria-expanded",
String(opened)
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


if(event.key === "Escape"){


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


const header = document.querySelector(".site-header");


if(header){


let ticking = false;


window.addEventListener(
"scroll",
()=>{


if(!ticking){


window.requestAnimationFrame(()=>{


if(window.scrollY > 50){

header.classList.add("scrolled");

}

else{

header.classList.remove("scrolled");

}



ticking = false;


});


ticking = true;


}


},
{
passive:true
}

);


}







// =========================
// SECTION REVEAL
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
// BREVO FORM VALIDATION
// =========================


const brevoForm =
document.getElementById("sib-form");


if(brevoForm){


brevoForm.addEventListener(
"submit",
(event)=>{


const email =
document.getElementById("EMAIL");



const emailPattern =
/^[^\s@]+@[^\s@]+\.[^\s@]+$/;



if(
!email ||
!emailPattern.test(email.value.trim())
){


event.preventDefault();


alert(
"Please enter a valid email address."
);


}


}

);


}



});
