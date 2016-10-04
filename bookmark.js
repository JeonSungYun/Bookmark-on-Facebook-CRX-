/*
* bookmark.js
* a script to inject to page
*/
// only act in facebook
if(window.top === window.self && 'facebook.com' === document.domain) (function(){
    /*
    * mark up a html code object for modal dialog and inject it to this page's body tag,
    * load jquery-ui.css dynamically
    */
    var dynCSS = document.createElement("link");
    dynCSS.setAttribute("rel","stylesheet");
    dynCSS.setAttribute("type","text/css");
    dynCSS.setAttribute("href",chrome.extension.getURL("/jquery/css/jquery-ui.css"));

    var toastCSS=document.createElement("link");
    toastCSS.setAttribute("rel","stylesheet");
    toastCSS.setAttribute("type","text/css");
    toastCSS.setAttribute("href",chrome.extension.getURL("/jquery/css/jquery.toastmessage.css"));

    document.getElementsByTagName("head")[0].appendChild(dynCSS);
    document.getElementsByTagName("head")[0].appendChild(toastCSS);

    // it doesn't work!
    //jQuery('head').append(
    //    "<link type='text/css' rel='stylesheet' href='chrome-extension://ljfkamfkdolbkacgljmmnnddbdnemjdb/jquery/css/jquery-ui.css'"
    //    );
    jQuery('body').append(
        "<script type='text/javascript'>function showSuccessToast(){$().toastmessage('showSuccessToast', 'Success Dialog which is fading away');}</script><div id='dialog-form' title='Add A Book Mark'><p class='validateTips'>Fill forms to add bookmark.</p><form><fieldset style='border-color:#FFFFFF;'><label for='facebookmark_title'>Title</label><br><input type='text' id='facebookmark_title' class='text ui-widget-content ui-corner-all'><br><label for='facebookmark_folder'>Folder Name</label><br><input type='text' id='facebookmark_folder' value='Default' class='text ui-widget-content ui-corner-all'></fieldset></form></div>"
        );


    // connect with my extension
    var port = chrome.runtime.connect({name: "facebookmark"});
    port.onDisconnect.addListener(function() {
        port = null;
    });
    // add listener for commands
    port.onMessage.addListener(function(response) {
    
        // listener for "setDialog"
        if ( response.action == "setDialog" ){
          bookmark.setDialog(response.tags)
    
        // listener for "addBookMarkResponse"
        } else if ( response.action == "addBookMarkResponse" ){
          console.log("bookmark add complete!")
        }  
    });

    // object "bookmark" start
    var bookmark = {
        
        /* 
        * request to add a bookmark with dialog
        */
        addBookMark: function(param) {
            console.log("addBookMark() start!");
            
            // check connection
            while ( port == null ) {
                console.log("trying to reconnect!");
                port = chrome.runtime.connect({name: "facebookmark"});
            }
            
            // request to get tag list and will set dialog
            port.postMessage({action:"requestTags"});
            
            // show dialog and will add bookmark
            bookmark.showDialog(param)
        },
        /*
        * complete the dialog form by filling tag list
        */
        setDialog: function(tags){
            // set tag list for auto-complete
            if (tags == null ) {
                //console.log("setDialog() null ");
            }
            else{
                //console.log("setDialog() call");
                //console.log(tags);
            }
        },
        /*
        * show a dialog and if user select "ok" then add bookmark
        */
        showDialog: function(param){
            // pop up dialog with settings
            jQuery("#dialog-form").dialog({
                autoOpen: true,
                height: 270,
                width: 350,
                modal: true,
                buttons: {
                    "OK": function() {
                        // step 3
                        //if title is null
                        if($("#facebookmark_title").val()==""){
                            var toast=$().toastmessage('showWarningToast',"Fill in the title form.");
                            return false;            
                        }

                        port.postMessage({action:"addBookMark",Title: $("#facebookmark_title").val(), Tag:$("#facebookmark_folder").val(),Url: param.data.p1});
                        $("#facebookmark_title").val("");
                        $( this ).dialog( "close" );
                    },
                    Cancel: function() {
                        // cancel
                        $("#facebookmark_title").val("");
                        $( this ).dialog( "close" );
                    }
                },
                close: function() {
                    // close
                    $("#facebookmark_title").val("");
                    $( this ).dialog( "close" );
                }
            });
        },

        /*
        * add Buttons and set buttons to request to add a bookmark on click
        */
        addButtons: function() {
            // newsfeed
            jQuery('._5pcp').each(function() {
                //Get sub-root node
                var element = jQuery(this);
                if ( element.attr("class") == "_5pcp" ) {

                    //Get facebook link
                    var link = element.find('._5pcq').attr('href');

                    var add="https://www.facebook.com";

                    //if the link is grouped.
                    if(link == undefined || link.substring(0,1)=='#'){
                        return;
                    }
                    //console.log('extracted link : ' + link);
                    if(link.substring(0,4)!="http"){
                        link = add + link;
                    }

                    //Add a bookmark button and pass the link to the button 
                    element.append(" · ")
                    element.append( jQuery('<a>').attr('href','#').bind('click', { p1: link }, bookmark.addBookMark).append("☆").hover(
                        function(){
                            // hover
                            $(this).text("★");
                        },
                        function(){
                            // dishover
                            $(this).text("☆");
                        })
                    );


                    //Mark this node
                    element.addClass("mark");
                }
            });
            // timeline
            jQuery('._1_n.fsm.fwn.fcg').each(function() {
                //Get sub-root node
                var element = jQuery(this);
                if ( element.attr("class") == "_1_n fsm fwn fcg") {

                    //Get facebook link
                    var link = element.find('.uiLinkSubtle').attr('href');

                    var add="https://www.facebook.com";

                    //if the link is grouped.
                    if(link == undefined || link.substring(0,1)=='#'){
                        return;
                    }
                    //console.log('extracted link : ' + link);
                    if(link.substring(0,4)!="http"){
                        link = add + link;
                    }

                    //Add a bookmark button and pass the link to the button 
                    element.append(" · ")
                    element.append( jQuery('<a>').attr('href','#').bind('click', { p1: link }, bookmark.addBookMark).append("☆").hover(
                        function(){
                            // hover
                            $(this).text("★");
                        },
                        function(){
                            // dishover
                            $(this).text("☆");
                        })
                    );//end of append.
                    
                    //Mark this node
                    element.addClass("mark");
                }
            });
            //article
            jQuery('#fbPhotoSnowliftAudienceSelector').each(function() {
                var element = jQuery(this);
                if ( element.attr("class") == "mls") {
                    var star = jQuery('<a>').attr('href','#').bind('click', { p1: document.URL }, bookmark.addBookMark).append("☆").hover(
                        function(){
                            // hover
                            $(this).text("★");
                        },
                        function(){
                            // dishover
                            $(this).text("☆");
                        }
                    )
                    element.append(" · ").append(star).addClass("mark");
                }
            });
        }
    }
    // do it every 1 seconds
    setInterval(bookmark.addButtons, 1000);
    // object "bookmark" end
})();
