"use strict";

const baseurl = "https://api.github.com/users/";
const user = "addyosmani";
//const ul = document.getElementById('reposit'); // Get the list where we will place our authors
let repositories={};
let number_of_pages1;
let nextrepo;
let $overlay = $('<div id="overlay" class="overlay"></div>');
let $container = $('<div></div>');
let overlayOn = false;
let $index = 0;

 function formatDate(iso_date){
   let date = new Date(iso_date);
   let year = date.getFullYear();
   let month = date.getMonth()+1;
   let dt = date.getDate();

    if (dt < 10) {
      dt = '0' + dt;
    }
    if (month < 10) {
      month = '0' + month;
    }

    return year+'.' + month + '.'+dt;
 }

 function msToTime(duration) {
     let milliseconds = parseInt((duration%1000)/100)
         , seconds = parseInt((duration/1000)%60)
         , minutes = parseInt((duration/(1000*60))%60)
         , hours = parseInt((duration/(1000*60*60))%24);

     return hours + " hours and " + minutes + " minutes ago";
 }

 function days_ago(iso_date) {
   let today_date = new Date();
   let date = new Date(iso_date);
  //  today_date = today_date.toISOString();
    // The number of milliseconds in one day
    const ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    const date_ms = date.getTime()
    const today_date_ms = today_date.getTime()
    // Calculate the difference in milliseconds
    const difference_ms = Math.abs(date_ms - today_date_ms);

    if (difference_ms<=ONE_DAY){
        return msToTime(difference_ms);
    } else {
        // Convert back to days and return
        const days_ago = Math.round(difference_ms/ONE_DAY);
        if (days_ago > 365){
          return formatDate(date);
        }else{
          return days_ago+" days ago";
        }
      }

    }

function createRepoList(response){
  //Prepare the data for the Mustache template
  let i=0;
  response.map(function(item){
    item.index = i;
    i+=1;
    const e = function(){
      if(item.language){
        return true;
      } else {
        return false;
      }
    };
    item.langexist = e;
    item.updated_at_new = days_ago(item.updated_at);
    if(item.topics.length>0){
      item.topics = toObject(item.topics);
    }
  });
  let repos = $.extend([], response);
  repos = {"repos": repos};
  repositories = repos;
  const template = $("#ghRepos").html().trim();
  //Render the Mustache template
  let html = Mustache.render(template,repos);
  $("#reposit").html(html);
}

function toObject(arr) {
  let output = [];
  let obj=null;
  if(arr){
    for (let i = 0; i < arr.length; ++i){
      obj={};
       obj={"topicname": arr[i]};
       output.push(obj);
     }
  }
  return output;
}

function numberOfPages(link){
  const links = {};
  if (link) {
    link.replace(/<([^>]*)>;\s*rel="([\w]*)\"/g, function(m, uri, type) {
      links[type] = uri;
    });
  }
  const repolinks = links; //Set a links attribute on this collection, may look different in your framework
  const a = repolinks.last.lastIndexOf('=');
  const b = repolinks.last.length;
  navigationHtml(repolinks.last.slice(a+1,b));
  return repolinks.last.slice(a+1,b);
}

function githubRepos (url){
  let myHeaders = new Headers();
  myHeaders.append("Accept", "application/vnd.github.mercy-preview+json");
  let myInit = { method: 'GET',
                 headers: myHeaders,
                 mode: 'cors',
                 cache: 'default' };
  fetch(url,myInit)
  .then(function(response) {
  if(!number_of_pages1){
      number_of_pages1 = numberOfPages(response.headers.get('link'));// getting the number of pages of all repos
  }
    return response.json();
  })
  .then(createRepoList)
  .catch(function(error) {
      console.log("gitubRepos - "+error);
    });
  }

  function githubUser(){
    const urlrepo = 'https://api.github.com/users/'+user;

    fetch(urlrepo)
    .then(resp => resp.json())
    .then(function(resp){
      const template = $("#ghUser").html().trim();
      //Prepare the data for the Mustache template
      let data = {
        name: resp.name,
        html_url: resp.html_url,
        avatar_url: resp.avatar_url,
        login: resp.login,
        bio: resp.bio,
        company: resp.company,
        location: resp.location,
        blog: resp.blog,
        followers: resp.followers,
        following: resp.following,
        public_repos: resp.public_repos
      }
      //Render the Mustache template
      let html = Mustache.render(template,data);
      $("#userArea").html(html);
    })
    .catch(function(error){
      console.log("githubUser - "+error)
    })
    //Fetch and show the repos fot the user
    const urlallrepos = baseurl+user+"/repos?sort=updated";
    githubRepos(urlallrepos);
    }

//////////////
//NAVIGATION//
/////////////
function navigationHtml(number_of_pages){
  //set the hidden field "current_page to 1"
  let current_page = document.getElementById("current_page");
  current_page.value = 1;

  //create the navigation node
  let navigation_html = '<a class="previous_link" href="javascript:previous();"> Prev </a>';
  let current_link = 1;
  while(number_of_pages >= current_link){
    navigation_html += '<a class="page_link" href="javascript:go_to_page(' + current_link +')" longdesc="' + current_link +'"> '+ current_link +' </a>';
    current_link++;
  }
  navigation_html += '<a class="next_link" href="javascript:next();"> Next </a>';

  $('#page_navigation_bottom').html(navigation_html);

  //add active_page class to the first page link
  $('#page_navigation .page_link:first').addClass('active_page');
}

function go_to_page(page_num){
  //debugger;
  githubRepos(baseurl+user+"/repos?page="+page_num);
  //set the actual active page class
  $('.page_link[longdesc=' + page_num +']').addClass('active_page').siblings('.active_page').removeClass('active_page');
  $('#current_page').val(page_num);//update the current page input field
  $('html, body').animate({ scrollTop: 0 }, 'fast');

}

function previous(){

	let new_page = parseInt($('#current_page').val()) - 1;
	//if there is an item before the current active link run the function
	if($('.active_page').prev('.page_link').length==true){
		go_to_page(new_page);
	}
}

function next(){
	let new_page = parseInt($('#current_page').val()) + 1;
	//if there is an item after the current active link run the function
	if($('.active_page').next('.page_link').length==true){
		go_to_page(new_page);
	}
}
//////////////////
//END NAVIGATION//
/////////////////

////////////
//SINGLE REPO END PAGE
/////////

//Function: close the overlay
var openCloseOverlay = function(event){
  if (event=='open'){
    $overlay.fadeIn();
    overlayOn = true;
  }else if (event=='close'){
    $overlay.fadeOut();
    overlayOn = false;
  }else{
    return false;
  }
};

function showRepo(index){

  $("body").append($overlay);
  const template = $("#ghSingleRepo").html().trim();

  //Render the Mustache template
  const re = repositories.repos[index];
  //debugger;
  let html = Mustache.render(template,repositories.repos[index]);
  $container.html(html);
  $overlay.append($container);
  $overlay.add().append("<button id='btnClose' class='btn btnclose'> X </button>");
  // for Close hide the overlay
  $("#btnClose").click(function(){
  	openCloseOverlay("close");
  });

  openCloseOverlay("open");
}


/********************
KEYBOARD EVENT
********************/
//Esc : 27 -> Close the Lightbox

$( window ).keyup(function(event) {
  const KeyboardKey = event.which;
  if(overlayOn){
  	if (KeyboardKey == '27'){
  		openCloseOverlay("close");
    }
  }
});

  githubUser();
