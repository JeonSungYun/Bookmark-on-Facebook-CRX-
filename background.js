/*
* background.js
* Handle a request requiring to add a bookmark
*/

/*
Note: You cannot use this API to add or remove entries in the root folder. 
You also cannot rename, move, or remove the special "Bookmarks Bar" and "Other Bookmarks" folders.
*/

/* https://developer.chrome.com/extensions/messaging */
chrome.runtime.onConnect.addListener(function(port) {
    console.assert(port.name == "facebookmark");
    port.onMessage.addListener(function(request) {
        var ROOT_FOLDER_NAME = "FaceBookMark";

        /*
        * In case of that request action is to add bookmark, execute below
        */
        if ( request.action == "addBookMark" ){
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

                //console.log("rootid : " + rootId);

                // match the same tag with tag of request

                chrome.bookmarks.getChildren(rootId,function(rootChildren){
                    // if tag is already exist
                    var tagId = "";
                    var existTag = rootChildren.some(function(element, index, arr){
                        //console.log("finding tag.." + element.title );
                        if ( element.title == request.Tag ) {
                            tagId = element.id;
                            return true;
                        }
                    });
                    if ( existTag && tagId != "" ){
                        // add there
                        chrome.bookmarks.create({'parentId':tagId,'title':request.Title,'url':request.Url}, function(bookmark){
                            //console.log("tag exist! added bookmark : " + bookmark.title);
                            port.postMessage({action:"addBookMarkResponse"});
                        });
                    // tag does not exist
                    } else {
                        // create folder and add there
                        chrome.bookmarks.create({'parentId':rootId,'title':request.Tag}, function(tag){
                            chrome.bookmarks.create({'parentId':tag.id,'title':request.Title,'url':request.Url}, function(bookmark){
                                //console.log("tag not exist! added bookmark : " + bookmark.title);
                                port.postMessage({action:"addBookMarkResponse"});
                            });
                        });
                    }
                });
            });

            
        }
        /*
        * In case of that request action is to get bookmark folders, execute below
        */
        else if ( request.action == "requestTags" ){
            chrome.bookmarks.getChildren("2",function(topChildren){
                var rootId = "";
                // check if root folder is exist
                var existRootFolder = false;
                /*
                existRootFolder = topChildren.some(function(element, index, arr){
                    //console.log("finding root.." + result.title );
                    if ( element.title == ROOT_FOLDER_NAME ) {
                        rootId = element.id;
                        return true;
                    }
                });
                */
                topChildren.forEach(function(result){
                    //console.log("finding root.." + result.title );
                    if ( result.title == ROOT_FOLDER_NAME && existRootFolder == false ) {
                        rootId = result.id;
                        existRootFolder = true;
                    }
                });

                //console.log("rootid : " + rootId);

                // create root folder and re-check
                if ( existRootFolder == false ) {
                    chrome.bookmarks.create({parentId:"2",title:ROOT_FOLDER_NAME},function(newfolder){
                        port.postMessage({action:"setDialog",tags:null});
                        console.log("create new FaceBookMark folder and and getTags");
                    });
                } else { 
                    //console.log("get tags from rootid("+rootId+").");
                    chrome.bookmarks.getChildren( rootId, function(BookmarkTree){
                        // get tags from root folder
                        var data = new Object();
                        BookmarkTree.forEach(function(bookmark){
                            //console.log("getting tags..");
                            if ( bookmark.url == undefined ){
                                // this is folder
                                //console.log("this is folder");
                                data[bookmark.title] = bookmark.id;
                            }
                        });
                        console.log("complete to get Tags")
                        console.log(data);
                        // then sendResponse result
                        port.postMessage({action:"setDialog",tags:data});
                        console.log("complete to send Tags")
                    }); 
                }
            });
        }
    });
});