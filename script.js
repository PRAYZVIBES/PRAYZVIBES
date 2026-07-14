/*
PRAYZVIBES PROFESSIONAL FINAL SCRIPT
BREVO COMPATIBLE VERSION
*/


// =========================
// MOBILE MENU
// =========================


const menuButton =
document.getElementById("menuButton");


const mobileMenu =
document.getElementById("mobileMenu");



if(menuButton && mobileMenu){


menuButton.addEventListener("click",()=>{


const opened =
mobileMenu.classList.toggle("active");


menuButton.setAttribute(
"aria-expanded",
opened
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
// HEADER SCROLL
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
// SECTION REVEAL
// =========================


const sections =
document.querySelectorAll("section");



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









// =========================
// CLOSE MENU ESCAPE
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
// IMAGE ERROR HANDLING
// =========================


document.querySelectorAll("img")
.forEach(image=>{


image.addEventListener("error",()=>{


image.style.opacity="0.5";


});


});









// =========================
// BREVO FORM FIX
// =========================


// Prevent empty submit and make sure Brevo button works


const brevoForm =
document.getElementById("sib-form");



if(brevoForm){


brevoForm.addEventListener("submit",(event)=>{


const email =
document.getElementById("EMAIL");



if(!email || email.value.trim()===""){


event.preventDefault();


alert(
"Please enter your email address."
);


return false;


}



});


}