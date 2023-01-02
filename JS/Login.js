var serviceHost = "http://127.0.0.1:5020"

var sessionCheckResult;
var ipObject;

const pageBody = document.getElementById("pageBody")
const container = document.querySelector(".container")
const pwShowHide = document.querySelectorAll(".showHidePw")
const pwFields = document.querySelectorAll(".password")
const signUp = document.querySelector(".signup-link")
const login = document.querySelector(".login-link")
const waiting = document.getElementById("waiting-sign")
const popup = document.getElementById("popup-normal")
const popupBodyText = document.getElementById("body-popup-message");
const popupCloseBtn = document.getElementById("popup-close-btn");
const filterScreen = document.getElementById("filter-screen");

async function pageLoad(){

    // Close all box

    waiting.style.display = "none"
    popup.style.display = "none"
    filterScreen.style.display = "none"

    // Check IP

    ipObject = await fetch('http://api.ipify.org/?format=json')
                    .then(result => result.json())

    // check session 

    try{

        // let path = serviceHost + '/LoginAndSession/session/check'
        
        // sessionCheckResult = await fetch(path, {
        // method: 'POST',
        // headers: {
        //     'accept': 'application/json',
        //     'Content-Type': 'application/json'
        // },
        // body: JSON.stringify({ 
        //     "IPAddress": ipObject.ip 
        // })                
        // }).then(response => response.json())

        // if(sessionCheckResult.errorCode == 200){

        //     var userData = sessionCheckResult.data;
    
        //     // Store
        //     if(JSON.parse(localStorage.getItem("userData")) != "")
        //     {
        //         localStorage.setItem("userData", JSON.stringify(""));
        //     }
    
        //     localStorage.setItem("userData", JSON.stringify(userData));   
        //     window.location.replace("/Main.html");
        //     return false
        // }
    }
    catch{
        // Do nothing
    }
}
    //   js code to show/hide password and change icon
    pwShowHide.forEach(eyeIcon =>{
        eyeIcon.addEventListener("click", ()=>{
            pwFields.forEach(pwField =>{
                if(pwField.type ==="password"){
                    pwField.type = "text";

                    pwShowHide.forEach(icon =>{
                        icon.classList.replace("uil-eye-slash", "uil-eye");
                    })
                }else{
                    pwField.type = "password";

                    pwShowHide.forEach(icon =>{
                        icon.classList.replace("uil-eye", "uil-eye-slash");
                    })
                }
            }) 
        })
    })

    // js code to appear signup and login form
    signUp.addEventListener("click", ( )=>{
        container.classList.add("active");

        document.getElementById('created-name').value = null
    });
    login.addEventListener("click", ( )=>{
        container.classList.remove("active");
    });

let loginBtn = document.getElementById('loginBtn')

//#region login

loginBtn.onclick = async function(){
    
    waiting.style.display = "block"

    let rmCheck = document.getElementById("RememberMeCheck")
    let username = document.getElementById('input-username').value
    let password = document.getElementById('input-password').value

    let loginResult;

    try{

        let path = serviceHost + '/LoginAndSession/login'

        loginResult = await fetch(path, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            "UserName": username,
            "Password": password,
            "IPAddress": ipObject.ip 
        })                
        }).then(response => response.json())

    }
    catch{

        // Handle service not response
        waiting.style.display = "none"
        popupBodyText.innerHTML = "Cannot connect APIs service.";
        await showPopup()
    }

    if(loginResult.errorCode == 200){
        
        popupBodyText.innerHTML = loginResult.message
        await showPopup()

        if(rmCheck.checked == true){

        }

        var userData =loginResult.data;

        // Store
        if(JSON.parse(localStorage.getItem("userData")) != "")
        {
            localStorage.setItem("userData", JSON.stringify(""));
        }

        localStorage.setItem("userData", JSON.stringify(userData));

        waiting.style.display = "none"
        
        window.location.replace("/Main.html");
        return false
    }
    else{
        // Handle login failed
        waiting.style.display = "none"
        popupBodyText.innerHTML = loginResult.message
        await showPopup();
    }
}

//#endregion

//#region register

registerBtn.onclick = async function(){

    let name = document.getElementById('created-name').value
    let username = document.getElementById('created-username').value
    let password = document.getElementById('created-password').value
    let rePassword = document.getElementById('re-created-password').value
    let initWeight = document.getElementById('init').value
    let targetWeight = document.getElementById('target').value
    let isAccepCon = document.getElementById('termCon').checked

    //#region validation

    var nameRegex = /^[a-zA-Z\-]+$/;
    var usernameRegex = /^[a-zA-Z0-9]+$/;
    var passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;

    if(name == null || name == ""){
        //alert("Please enter name.")
        popupBodyText.innerHTML = "Please enter name."
        showPopup()
        return
    }
    else if(!nameRegex.test(name)){
        //alert("Name must be chars and not be white space.")
        popupBodyText.innerHTML = "Name must be chars and not be white space."
        showPopup()
        return
    }

    if(username == null || username == ""){
        //alert("Please enter Username.")
        popupBodyText.innerHTML = "Please enter Username."
        showPopup()
        return
    }
    else if(!usernameRegex.test(username)){
        //alert("Username must be upper or lower character or number.")
        popupBodyText.innerHTML = "Username must be upper or lower character or number."
        showPopup()
        return
    }

    if(password == null || password == ""){
        //alert("Please enter Username.")
        popupBodyText.innerHTML = "Please enter Username."
        showPopup()
        return
    }
    else if(!passwordRegex.test(password)){
        //alert("Password must contain at lease one number and special characers, and lenght must no be lower than 6 chars.")
        popupBodyText.innerHTML = "Password must contain at lease one number and special characers, and lenght must no be lower than 6 chars."
        showPopup()
        return
    }
    else if(!(password === rePassword)){
        //alert("Re-input password is not correct.")
        popupBodyText.innerHTML = "Re-input password is not correct."
        showPopup()
        return
    }

    if(initWeight == null || initWeight == "" || initWeight < 0){
        //alert("Initial weight must not be null and negative.")
        popupBodyText.innerHTML = "Initial weight must not be null and negative."
        showPopup()
        return
    }

    if(targetWeight == null || targetWeight == "" || targetWeight < 0){
        //alert("Target weight must not be null and negative.")
        popupBodyText.innerHTML = "Target weight must not be null and negative."
        showPopup()
        return
    }

    if(isAccepCon != true){
        //alert("Please accept term and condition.")
        popupBodyText.innerHTML = "Please accept term and condition."
        showPopup()
        return
    }

    //#endregion

    let path = serviceHost + '/User/register'

    try{

        let registerResult = await fetch(path, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                "userName": username,
                "Password": password,
                "Name": name,
                "InitialWeight": initWeight,
                "TargetWeight": targetWeight,
                "IsAcceptCondition": isAccepCon 
            })                
        }).then(response => response.json())

        if(registerResult.errorCode == 200){
            // alert(registerResult.message)
            // popupBodyText.innerHTML = registerResult.message
    
            container.classList.remove("active");
    
        }
        else{
            popupBodyText.innerHTML = registerResult.message;
            showPopup();
        }
    }
    catch{

        // Handle service not response
        waiting.style.display = "none"
        popupBodyText.innerHTML = "Cannot connect APIs service.";
        await showPopup()
    }

}
//#endregion

async function showPopup(){
    disableScroll();
    filterScreen.style.display = "block"
    popup.style.display = "block"
  }
  
  async function closePopup(){
    enableScroll()
    filterScreen.style.display = "none"
    popup.style.display = "none"
  
    popupBodyText.innerHTML = "Message error."

  }

  function disableScroll() {

    // To get the scroll position of current webpage
    TopScroll = window.pageYOffset || document.documentElement.scrollTop;
    LeftScroll = window.pageXOffset || document.documentElement.scrollLeft,
    
    // if scroll happens, set it to the previous value
    window.onscroll = function() {
    window.scrollTo(LeftScroll, TopScroll);
    };
  }
    
  function enableScroll() {
    window.onscroll = function() {};
  }

  popupCloseBtn.onclick = async function(){
    closePopup()
  }

