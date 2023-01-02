var serviceHost = "http://127.0.0.1:5020"

var ipObject;
var sessionCheckResult;
var userData;
var schdule;
var recordSchdule;
var allUserWeignt;
var userWeignt;
var applicants = [];
var TableRecord = [];
var chart;
var selectedImage;
var base64Image = null;
var appearanceName = document.getElementById("normal-text-name");
var initWeightDisplay = document.getElementById("normal-text-init-weight");
var targetWeightDisplay = document.getElementById("normal-text-target-weight");

var isSessionExpire;

var compareModeCheck = document.getElementById("compare-mode-switch");
var compareMode= document.getElementById("compare-status");

const table = document.getElementById("record-table");
const notFoundGraph = document.getElementById("not-found-graph");
const notFoundTable = document.getElementById("not-found-table");
const graph = document.getElementById("line-chart-grouped");
const inputWeight = document.getElementById("weight-submit-input");
const submit = document.getElementById("weight-submit-btn");
const scheduleSelect = document.getElementById("weight-submit-schdule");
const waiting = document.getElementById("waiting-sign");
const popup = document.getElementById("popup-normal");
const popupBodyText = document.getElementById("body-popup-message");
const popupCloseBtn = document.getElementById("popup-close-btn");
const filterScreen = document.getElementById("filter-screen");
const loginBtn = document.getElementById("loginBtn");
const inputElement = document.getElementById("choose-image-hidden")
const selectedImageName = document.getElementById("selected-image-name");


async function pageLoad(){

  // Disable popup and set flag

  popup.style.display = "none"
  filterScreen.style.display = "none"

  isSessionExpire = false

  // Get session data

  userData = JSON.parse(localStorage.getItem("userData"));

  if(userData == null){

    // Check IP

    ipObject = await fetch('http://api.ipify.org/?format=json')
                    .then(result => result.json())

    // get session

    try{
      
      let path = serviceHost + '/LoginAndSession/session/check';
      
      sessionCheckResult = await fetch(path, {
      method: 'POST',
      headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
          "IPAddress": ipObject.ip 
      })                
      }).then(response => response.json())

      if(sessionCheckResult.errorCode == 200){

        userData = sessionCheckResult.data;
  
        localStorage.setItem("userData", JSON.stringify(userData));   
        localStorage.setItem("fromLoginPage", true);     
      }
      else{
        isSessionExpire = true;
        popupBodyText.innerHTML = sessionCheckResult.message
        showPopup()
      }
    }
    catch{
        // Do nothing
    }
  }

  // Set appearant display

  appearanceName.innerHTML = userData.name;
  initWeightDisplay.innerHTML = userData.initWeight;
  targetWeightDisplay.innerHTML = userData.targetWeight
  
  // Map graph

  schdule = userData.schdule.map(s => s);
  recordSchdule = schdule.map(s => s.displaySchduleDate);
  allUserWeignt = userData.records.map(w => w.weight);

  applicants = userData.allApplicantName.filter(applicant => applicant.toLowerCase() != userData.name.toLowerCase())
  userWeignt = userData.records.filter(user => user.name.toLowerCase() == userData.name.toLowerCase()).map(w => w.weight)

    // Set drop downlist data
  
    for(let s in schdule){

      let option = document.createElement("option");
      option.text = schdule[s].displaySchduleDate
      option.value = s 
      scheduleSelect.add(option);
    }
    
  if(userWeignt.length == 0){
    notFoundGraph.style.display = "block"
    notFoundTable.style.display = "block"
    // graph.style.display = "none"

    return;
  }{
    notFoundGraph.style.display = "none"
    notFoundTable.style.display = "none"
    // graph.style.display = "block"
  }

  // private user
  compareModeCheck.checked = false;
  compareMode.innerHTML = "OFF";
  await SetupGraph()

  // Set table data

  let userRecordData = userData.records.filter(user => user.name.toLowerCase() == userData.name.toLowerCase())
  for(var item in userRecordData){
    TableRecord.push(userRecordData[item])
  }

  await SetupTable()

}

function SetupGraph(){
  
  let weightData = []
  let userWeightData = new Object();
  userWeightData.data = userWeignt;
  userWeightData.borderColor = "red";
  userWeightData.fill = false
  userWeightData.label = userData.name

  weightData.push(userWeightData);
  if(compareModeCheck.checked){

    // Multiline

    for(let index in applicants){

      applicantWeignt = userData.records.filter(user => user.name.toLowerCase() == applicants[index].toLowerCase()).map(w => w.weight)

      let rgb = "rgb("

      for(let i = 0; i < 3; i++){

        let num = Math.floor(Math.random() * 255)
        rgb = rgb + num
        if(i < 2){
          rgb = rgb + ","
        }
      }

      rgb = rgb + ")"
      
      let applicantWeightData = new Object();
      applicantWeightData.data = applicantWeignt;
      applicantWeightData.borderColor = rgb;
      applicantWeightData.fill = false
      applicantWeightData.label = applicants[index]
      weightData.push(applicantWeightData)
    }
  }

  if(chart != null){
    
    chart.destroy();
  }
  var xValues = recordSchdule
  chart = new Chart(document.getElementById('line-chart-grouped'), {
    type: "line",
    data: {
      labels: xValues,
      datasets: weightData
    },
    options: {
      legend: {display: false}
    }
  });
  
  chart.render();
}

async function SetupTable(){

  for(let index in TableRecord){
    var row = table.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);

    let dateTimeSplit = TableRecord[index].submitDate.split(" - ")
    
    cell1.innerHTML = index;
    cell2.innerHTML = TableRecord[index].name;
    cell3.innerHTML = TableRecord[index].weight;
    cell4.innerHTML = dateTimeSplit[1];
    cell5.innerHTML = dateTimeSplit[0];
    cell6.innerHTML = TableRecord[index].scheduleDate;

    const para = document.createElement("input");
    para.type = "button";
    para.value = "view";

    para.disabled = TableRecord[index].imagePath === "None" ? true:false

    cell7.appendChild(para);
  }
}

async function toggleCompareModel(element){

  if(element.checked){

    // Active compare display mode
    compareMode.innerHTML = "ON"
    await SetupGraph()
  }
  else{
    // Active private display mode
    compareMode.innerHTML = "OFF"
    await SetupGraph()
  }
}

submit.onclick = async function(){

  let submitResult;
  let img = "None"

  if(base64Image != null){
    img = base64Image;
  }

  try{

    let path = serviceHost + '/User/record'
    submitResult = await fetch(path, {
    method: 'POST',
    headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "ownerId": userData.userId,
        "name": userData.name,
        "weight": inputWeight.value,
        "submitSchdule": schdule[scheduleSelect.value].schduleDate,
        "imagePath": img
    })                
    }).then(response => response.json())

    if(submitResult.errorCode == 200){
      
      popupBodyText.innerHTML = submitResult.message
      showPopup()
      location.reload();
    }
    else{
      popupBodyText.innerHTML = submitResult.message
      showPopup()
    }

  }
  catch{

    // Handle service not response
    popupBodyText.innerHTML = "Cannot connect APIs service.";
    await showPopup();
  }
}

loginBtn.onclick = async function(){
  
  let logoutRequest;
  try{

    let path = serviceHost + '/LoginAndSession/logout'
    logoutRequest = await fetch(path, {
    method: 'POST',
    headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 
        "userId": userData.userId
    })                
    }).then(response => response.json())

    if(logoutRequest.errorCode == 200){

      window.location.replace("/Login.html");
      return false
    }

  }
  catch{

    popupBodyText.innerHTML = "Cannot connect APIs service.";
    await showPopup();
  }
  
}

popupCloseBtn.onclick = async function(){
  closePopup()
}

window.onbeforeunload = function() {

  localStorage.removeItem("userData");
  return '';
};

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

  // Back to login

  if(isSessionExpire == true){

    window.location.replace("/Login.html");
    return false

  }
}


let base64String = "";
inputElement.onchange = async function(event) {

  selectedImage = document.querySelector(
    'input[type=file]')['files'][0];
  
  var fileType = selectedImage.type.substring(0, 5);
  
  if(fileType.toLowerCase() == "image"){

    // Convert to base64
    var reader = new FileReader();
    
    reader.onload = function (e) {
      base64Image = reader.result.replace("data:", "").replace(/^.+,/, "");
      console.log(base64Image)
    }

    reader.readAsDataURL(selectedImage);

    // Set name
    selectedImageName.innerHTML = selectedImage.name
  }
  else{
    popupBodyText.innerHTML = "Selected file is not image !"
    showPopup();
  }
}
