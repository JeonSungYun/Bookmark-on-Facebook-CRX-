/*
* Initial
* get all tags, bookmarks 
*/
document.addEventListener('DOMContentLoaded', function () {
  var accordion = $('#bookmarks');
  $('#bookmarks').accordion({
      heightStyle: "fill",
      beforeActivate: function( event, ui ) {
        $.each(ui.oldPanel, function(){
          $(this).find("li.ui-selected").removeClass("ui-selected");
        });
      }
  });
  accordion.empty();
  setAccordion("");
});

/*
* Search
* Search the bookmarks when entering the search keyword.
*/
$(function() {
  $('#search').keyup(function() {
    var accordion = $('#bookmarks');
    $('#bookmarks').accordion({
      heightStyle: "fill",
      beforeActivate: function( event, ui ) {
        $.each(ui.oldPanel, function(){
          $(this).find("li.ui-selected").removeClass("ui-selected");
        });
      }
    });
    accordion.empty();
    setAccordion($('#search').val());
  });
});

/*
* Listing
* if query is null, list all
* else search all order by tags. 
*/
function setAccordion(query) {
  var ROOT_FOLDER_NAME = "FaceBookMark";
  chrome.bookmarks.getChildren("2",function(topChildren){
    var rootId = "";
    // check if root folder is exist
    var existRootFolder = false;

    topChildren.forEach(function(topChild){
      //console.log("finding root.." + result.title );
      if ( topChild.title == ROOT_FOLDER_NAME && existRootFolder == false ) {
        rootId = topChild.id;
        existRootFolder = true;
      }
    });

    // add sections if it is not null that returned bookmark list
    chrome.bookmarks.getSubTree(rootId, function(tagList) {
      // setAutocomplete 
      setAutocomplete(tagList[0]);
      // traverse all tags.
      for ( var i = 0; i < tagList[0].children.length; i++ ){
        // select a tag
        var tag = tagList[0].children[i];
        // only if the tag has contents.
        if ( tag.children.length > 0 ){
          var section_contents = getSectionContents(tag.children,query);
          if ( section_contents.html() != "" ){
            // if contents added
            // add section title (<h3> tag).
            jQuery('#bookmarks').append(
              jQuery('<h3>').append(getSectionTitle(tag.title))
            );
            // add section contents (<div> tag).
            jQuery('#bookmarks').append(
              jQuery('<div>').append(
                section_contents
              )
            );
          } else {
            // if no contents added
          }
        }
      }
      $('#bookmarks').accordion("refresh");
      console.log("accordion refresh");
    });
  });
}

/*
* Listing
* get a new section title
*/
function getSectionTitle(title) {
  // section title layout
  return title;
}

/*
* Listing
* get a new section contents
*/
function getSectionContents(bookmarkList,query) {
  var section_root = jQuery('<ol>').addClass('section_content');
  // section contents layout 
  for ( var i = 0; i < bookmarkList.length; i++ ){
    if ( query == "" || bookmarkList[i].title.indexOf(query) >= 0 ){
      section_root.append(
        jQuery('<li>').attr('class','ui-widget-content').append(
          jQuery('<div>').text(bookmarkList[i].title).css('font-size','1em').add(
            jQuery('<input>').attr('type','hidden').val(bookmarkList[i].url)
          )
        )
      )
 
    }//end of if
  }//end of for.
  section_root.selectable({
    filter:'li',
    selected: function(event, ui) {
      chrome.tabs.create({url:$(ui.selected).find("input").val()})
    }
  });
  return section_root;
}
function dongyub(){
  console.log('aa');
}

/*
* AutoComplete
* set autocomplete materials by tags
*/
function setAutocomplete(tags){
  var dataArr = new Array();
  for ( var i = 0; i < tags.children.length; i++ ){
    for ( var j = 0; j < tags.children[i].children.length; j++ ){
      // use title, tag for label, category by tags
      var data = new Object();
      data['category'] = tags.children[i].title // tag name
      data['label'] = tags.children[i].children[j].title; // bookmark name
      dataArr.push(data);
    }
  }
  console.log(dataArr);
  $( "#search" ).bookmarkcomplete({
    delay: 0,
    source: dataArr
  });
}

/*
Which element the menu should be appended to. When the value is null, 
the parents of the input field will be checked for a class of ui-front. 
If an element with the ui-front class is found, the menu will be appended 
to that element. Regardless of the value, if no element is found, the menu
 will be appended to the body.
*/
$.widget( "custom.bookmarkcomplete", $.ui.autocomplete, {
  _renderMenu: function( ul, items ) {
    var that = this,
      currentCategory = "";
    $.each( items, function( index, item ) {
      if ( item.category != currentCategory ) {
        ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
        currentCategory = item.category;
      }
      that._renderItemData( ul, item );
    });
  },
});