"use strict";

const baseurl = "https://api.github.com/users/";
const user = "addyosmani";
//const ul = document.getElementById('reposit'); // Get the list where we will place our authors
let number_of_pages1;
let nextrepo;

function createNode (element) {
   return document.createElement(element); // Create the type of element you pass in the parameters
 }

 function append (parent, el) {
   return parent.appendChild(el); // Append the second parameter(element) to the first one
 }

 function parseResults (response){
   const myNodeUl = document.getElementById("reposit");// Select the element by its ID
   //First remove all the li child elements if any
   while (myNodeUl.firstChild) {
    myNodeUl.removeChild(myNodeUl.firstChild);
}
//   debugger;
    let repos = response; // Get the results
    return repos.map(function(repo) { // Map through the results and for each run the code below
      let li = createNode('li'), //  Create the elements we need
          span = createNode('span');
      span.innerHTML = repo.name; // Make the HTML of our span to be the first and last name of our author
      // Append all our elements
      append(li, span);
      append(myNodeUl, li);
 })
}

function numberOfPages(link){
  const links = {};

  if (link) {
    link.replace(/<([^>]*)>;\s*rel="([\w]*)\"/g, function(m, uri, type) {
      links[type] = uri;
    });
  }

  const repolinks = links; //Set a links attribute on this collection, may look different in your framework
  // nextrepo = repolinks.next;
  // debugger;
  const a = repolinks.last.lastIndexOf('=');
  const b = repolinks.last.length;
  navigationHtml(repolinks.last.slice(a+1,b));
  return repolinks.last.slice(a+1,b);
}
function githubUser(){
  const urlallrepos = baseurl+user+"/repos"; // Get 10 random users
 // const urlrepo = 'https://api.github.com/repos/'+user;
  githubRepos(urlallrepos);
  }

function githubRepos (url){

  fetch(url)
  .then(function(response) {
//debugger;
  if(!number_of_pages1){
      number_of_pages1 = numberOfPages(response.headers.get('link'));// getting the number of pages of all repos
  }

    return response.json();
    //debugger;

  })
  .then(parseResults)
  .catch(function(error) {
      console.log("Hiba: "+error);
    });
  }

function navigationHtml(number_of_pages){
  //debugger;
  let current_page = document.getElementById("current_page");
  current_page.value = 1;

  let navigation_html = '<a class="previous_link" href="javascript:previous();"> Prev </a>';
  let current_link = 1;
  while(number_of_pages >= current_link){
    navigation_html += '<a class="page_link" href="javascript:go_to_page(' + current_link +')" longdesc="' + current_link +'"> '+ current_link +' </a>';
    current_link++;
  }
  navigation_html += '<a class="next_link" href="javascript:next();"> Next </a>';

  $('#page_navigation').html(navigation_html);

  //add active_page class to the first page link
  $('#page_navigation .page_link:first').addClass('active_page');
  }

  function go_to_page(page_num){
    //debugger;
    githubRepos(baseurl+user+"/repos?page="+page_num);

  	//update the current page input field
    let current_page = document.getElementById("current_page");
    current_page.value = page_num;
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

  githubUser();
