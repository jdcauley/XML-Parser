/**********************************************************
            Javascript XML Parser for RSS Feed
**********************************************************/


/*
  Making xmlHttpRequest and opening up the XML file
  that contain all the information
*/
function getRSS(){
	if(window.ActiveXObject)//IE
	xml_req = new ActiveXObject("Microsoft.XMLHTTP");
	else if(window.XMLHttpRequest)
	xml_req = new XMLHttpRequest();
	else
	alert("no AJAX support");
	
	
	xml_req.onreadystatechange = function(){
		if(xml_req.readyState == 4){
			if(xml_req.status == 200){
				if(xml_req.responseText != null)
					processRSS(xml_req.responseXML);
				else{
					alert("failed to receive RSS File");
					return false;
				}
			}
			else
				alert("Error code " + xml_req.status + " received: " + xml_req.statusText);
		}
	}
	var url = "thefile.xml";
	xml_req.open("GET", url, true);
	
	xml_req.setRequestHeader("Cache-Control", "no-cache");
	xml_req.setRequestHeader("Pragma", "no-cache");
	xml_req.send(null);
}



/*
  Creating a new object that represents all the
  entries within the XML file
*/
function processRSS(rssxml)
{
	RSS = new RSS2Channel(rssxml);
	showRSS(RSS);
}



/*
  Loop through each of the "entry" element, and then
  retrieve the data stored in its child elements, and
  return the data back as an object.
*/
function RSS2Channel(rssxml){
	this.entries = new Array();
	this.logo;
	this.time;
	
	var entryElements = rssxml.getElementsByTagName("entry");
	
	for(var i=0; i<entryElements.length; i++){
		var Entry = new RSS2Entry(entryElements[i]);
		this.entries.push(Entry);
	}
	
	var logo = rssxml.getElementsByTagName("logo")[0].childNodes[0].nodeValue;
	this.logo = logo;
	
	this.time = rssxml.getElementsByTagName("updated")[0].childNodes[0].nodeValue;
	this.time = parseTime(this.time);
}



/*
  Parse the current time information stored 
  in the XML file
*/
function parseTime(time){
	var temp = time.slice(0,-1);
	temp = temp.split('T');
	var date = temp[0].split('-');
	var clock = temp[1];
	var arrayMonths = new Array("January","February","March","April","May","June","July","August","September","October","Novermber","December");
	date[1] = arrayMonths[parseInt(date[1]) - 1];
	date = date[1] + "/" +date[2] + "/" + date[0];
	return(date +" ("+clock+")");
}



/*
  Populating all the attributes of a single XML
  javascript object with the data stored in the
  child elements of "entry". 
*/
function RSS2Entry(itemxml){
	this.title, this.published, this.linkAlt, this.linkEnc,
	this.authorName, this.content;
	
	var tags = new Array("title", "published", "content");
	var tempElt=null;
	for(var i=0; i<tags.length; i++){
		tempElt = itemxml.getElementsByTagName(tags[i])[0];
		if(tempElt != null){
			eval("this." +tags[i]+"=tempElt.childNodes[0].nodeValue");
		}
	}
	
	tempElt = itemxml.getElementsByTagName("author")[0];
	this.authorName = (tempElt.getElementsByTagName("name")[0]).childNodes[0].nodeValue;
	
	tempElt = itemxml.getElementsByTagName("link");
	for(var i=0; i<tempElt.length; i++){
		var tempAttr = tempElt[i].getAttribute("rel");
		if(tempAttr=="alternate")
			this.linkAlt = tempElt[i].getAttribute("href");
		else if(tempAttr=="enclosure")
			this.linkEnc = tempElt[i].getAttribute("href");
	}
}



/*
  Produce the data parsed by the parser as HTML elements.
*/
function showRSS(RSS)
{

	document.getElementById('RSS_header').innerHTML = "<div class='header_logo'><a href='http://www.vodo.net'>"+ "<img border=0 src='"+ RSS.logo+"'/>"+"</a></div><h2>Latest feed content from Vodo</h2>"+RSS.time+"<h5>powered by <a href='http://www.bittorrent.com' target='_blank'><img src='bittorrent_logo.png'/></a></h5>";

	document.getElementById('RSS_entries').innerHTML = "";
	for(var i=0; i<RSS.entries.length; i++){
		var entry_html = "<div id='entry'>";
		entry_html += (RSS.entries[i].title == null) ? "" : "<a class='title' target='_blank' href='"+RSS.entries[i].linkAlt+"'>" + RSS.entries[i].title + "</a><br/><br/>";
		entry_html += (RSS.entries[i].published == null) ? "" : "<div id='entry_published'>" + 				"Date/Time Published : "+RSS.entries[i].published + "</div>";
		entry_html += (RSS.entries[i].authorName == null) ? "" : "<div id='entry_authorName'>" + 				"Film by : "+RSS.entries[i].authorName + "</div>";
		entry_html += "<div id='entry_desc'>" + "<a onclick='showDesc("+ i +")' href='#_'><span>View Film Synopsis >></span></a>" +"</div>";
		entry_html += (RSS.entries[i].content == null) ? "" : "<div id='entry_content'>" +RSS.				entries[i].content + "</div><br/>";
		entry_html += (RSS.entries[i].linkEnc == null) ? "" : "<a target='_blank' href='"+RSS.entries[i].linkEnc+"'>" + "<span>Download This Torrent</span>" + "</a><br/>";
		entry_html += "</div>";
		document.getElementById("RSS_entries").innerHTML += entry_html;
	}
	$('#RSS_body #RSS_entries #entry #entry_content').css('display','none');
    return true;
}

function showDesc(index){
	index += 1;
	var toggleElt = $('#RSS_body #RSS_entries #entry:nth-child('+index+') #entry_content');
	var curValue = toggleElt.css('display')=='none' ? 'block' : 'none'; 	
	toggleElt.css('display',curValue);
 }