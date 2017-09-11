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
    item.updated_at_new = formatDate(item.updated_at);
  });
  let repos = $.extend([], response);
  repos = {"repos": repos};
  repositories = repos;
  const template = $("#ghRepos").html().trim();
  //Render the Mustache template
  let html = Mustache.render(template,repos);
  $("#reposit").html(html);
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

  fetch(url)
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
