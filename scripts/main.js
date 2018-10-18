/**
 * 
 */
var pixelblock = (function(){

  var safe_pattern  = '?safe-img-pbza#',
      proxy_pattern = 'media.superhumanapp.com/images/_/';

  var blacklist = [{name:'Sidekick',     pattern:'t.signaux',              url:'http://getsidekick.com'},
                   {name:'Sidekick',     pattern:'t.senal',                url:'http://getsidekick.com'},
                   {name:'Sidekick',     pattern:'t.sidekickopen',         url:'http://getsidekick.com'},
                   {name:'Sidekick',     pattern:'t.sigopn',               url:'http://getsidekick.com'},
                   {name:'Banana Tag',   pattern:'bl-1.com',               url:'http://bananatag.com'},
                   {name:'Boomerang',    pattern:'mailstat.us/tr',         url:'http://boomeranggmail.com'},
                   {name:'Cirrus Inisght', pattern:'tracking.cirrusinsight.com', url:'http://cirrusinsight.com'},
                   {name:'Yesware',      pattern:'app.yesware.com',        url:'http://yesware.com'},
                   {name:'Yesware',      pattern:'t.yesware.com',          url:'http://yesware.com'},
                   {name:'Streak',       pattern:'mailfoogae.appspot.com', url:'http://streak.com'},
                   {name:'LaunchBit',    pattern:'launchbit.com/taz-pixel',url:'http://launchbit.com'},
                   {name:'MailChimp',    pattern:'list-manage.com/track',  url:'http://mailchimp.com'},
                   {name:'Postmark',     pattern:'cmail1.com/t',           url:'http://postmarkapp.com'},
                   {name:'iContact',     pattern:'click.icptrack.com/icp/',url:'http://icontact.com'},
                   {name:'Infusionsoft', pattern:'infusionsoft.com/app/emailOpened',  url:'http://infusionsoft.com'},
                   {name:'Intercom',     pattern:'via.intercom.io/o',      url:'http://intercom.io'},
                   {name:'Mandrill',     pattern:'mandrillapp.com/track',  url:'http://mandrillapp.com'},
                   {name:'Hubspot',      pattern:'t.hsms06.com',           url:'http://hubspot.com'},
                   {name:'RelateIQ',     pattern:'app.relateiq.com/t.png', url:'http://relateiq.com'},
                   {name:'RJ Metrics',   pattern:'go.rjmetrics.com',       url:'http://rjmetrics.com'},
                   {name:'Mixpanel',     pattern:'api.mixpanel.com/track', url:'http://mixpanel.com'},
                   {name:'Front App',    pattern:'web.frontapp.com/api',   url:'http://frontapp.com'},
                   {name:'Mailtrack.io', pattern:'mailtrack.io/trace',     url:'http://mailtrack.io'},
                   {name:'ToutApp',      pattern:'go.toutapp.com',         url:'http://toutapp.com'},
                   {name:'Outreach',     pattern:'app.outreach.io',        url:'http://outreach.io'},
                   ];

  /*
   * 
   */
  var is_blacklisted = function(img){
    var blacklisted = false;

    // run img src's against our blacklist
    $.each(blacklist, function() {
      if(img.src.indexOf(this.pattern) > 0) {
        img.tracker_info = this;
        blacklisted = true;
      }
    });

    // block all images left over that are 1 x 1 (or less, regardless)
    if (!blacklisted) {
      var elem = $(img)[0];
      // fetch all possible height values
      var w1 = clean_height_width(elem.style.width);
      var w2 = clean_height_width(elem.style.maxWidth);
      var w3 = clean_height_width(elem.style.minWidth);

      var w4 = -1;
      // check if width attr exists (otherwise dom always returns 0)
      if(typeof $(img).attr('width') != 'undefined') {
        w4 = clean_height_width(elem.width) ;
      }

      // fetch all possible width values
      var h1 = clean_height_width(elem.style.height);
      var h2 = clean_height_width(elem.style.maxHeight);
      var h3 = clean_height_width(elem.style.minHeight);

      var h4 = -1;
      // check if height attr exists (otherwise dom always returns 0)
      if(typeof $(img).attr('height') != 'undefined') {
        h4 = clean_height_width(elem.height);
      }

      if ( (w1 == 0 || w1 == 1 || w2 == 0 || w2 == 1 || w3 == 0 || w3 == 1 || w4 == 0 || w4 == 1) &&
          (h1 == 0 || h1 == 1 || h2 == 0 || h2 == 1 || h3 == 0 || h3 == 1 || h4 == 0 || h4 == 1)
      ) {
        img.tracker_info = {pattern:'', name:'Unknown', url:''};
        blacklisted = true;
      }
    }

    // if blacklisted, hide image (ie. prevent the tracking img from loading)
    if(blacklisted) img.style.display = 'none';
    return blacklisted;
  }

  var clean_height_width = function(x){
    if (x !== "") return parseInt(x, 10);
    return -1;
  }

  /*
   * Whitelist an image, i.e. let it display/load
   */
  var whitelist_image = function(img){
    if(img.src.indexOf(safe_pattern) == -1) img.src = img.src.replace('#', safe_pattern);
  }

  /*
   * 
   */
  var show_tracking_eye = function(email){
    var tracking_images = $(email).find("img[tracker='true']");

    if(tracking_images.length > 0){
      // Add the red eye
      var eye = $('#red-eye').clone();
      var content = get_popover_content(tracking_images);
      $(eye).popover({trigger:'click',placement:'bottom', content:content, html:true});

      $(eye).click( function(e){ e.stopPropagation(); } );
      $(email).click( function(e){ $(eye).popover('hide'); } );

      eye.show();
      $(email).find('h3.iw').append(eye);// div.gK
    }
  }

  /*
   * 
   */
  var get_popover_content = function(imgs){
    var plural = imgs.length > 1 ? 's':'';
    var content = '<div class="hover-content">';
    content += '<div>Blocked <span style="font-weight:bold;text-decoration:underline;">' + imgs.length + '</span> tracking attempt' + plural + '</div>';
    content += '<div style="margin-top:8px;"><span style="text-decoration:underline;">Source' + plural + '</span>:&nbsp;';

    $.each(imgs, function(index){
      var url = clean_url(this.src);
      if(index > 0) content += ', ';

      if(this.tracker_info.url != ''){
        content += '<a class="tracker-name" href="'+ this.tracker_info.url +'" target="_blank" title="' + this.tracker_info.url  + '">' + this.tracker_info.name + '</a>';
      }else{
        content += '<span class="tracker-name unknown" title="' + url + '">' + this.tracker_info.name + '</span>';
      }
      
    });
    content += '</div></div>';
    return content;
  }

  /*
   * 
   */
  var clean_url = function(url){
    if(url == '' || url.indexOf('#') == -1) return url;
    return url.substring(url.indexOf('#')+1);
  }

  // var scan_images = function(){
  //   try {
  //     // Note: For some reason gmail.js seems to crash once in a while, add a check to re-init it
  //     var threadPane = $('.ThreadPane-messages');
  //     //var emails = threadPane.find('div.h7[processed!="true"]');
  //     var messagePanes = threadPane.find('.MessagePane');

  //     var blockedSources = [];
  //     var allowedSources = [];

  //     // go through all open emails on screen
  //     for(var x = 0; x < messagePanes.length; x++){
  //       var messagePane = messagePanes[x], tracking_image_found = false;
  //       var iframe = $(messagePane).find('iframe');
  //       var iframeContents = iframe.contents();
  
  //       // loop over all images in this email
  //       $("img[src]", iframeContents).each(function(){
  //         var src = this.src;
  //         if(src.indexOf(proxy_pattern) > 0 && src.indexOf(safe_pattern) == -1){
  //           if(is_blacklisted(this)){
  //             this.setAttribute('tracker', 'true');
  //             tracking_image_found = true;
  //             blockedSources.push(src);
  //           }else{
  //             whitelist_image(this);
  //             allowedSources.push(src);
  //           }
  //         }
  //       });

  //       var logInfo = true;

  //       if (logInfo) {
  //         var totalSources = blockedSources.length + allowedSources.length;
  //         console.group("PixelBlock: Found " + blockedSources.length + " / " + totalSources + " tracking pixels");

  //         for (var i = 0; i < blockedSources.length; i++) {
  //           var src = blockedSources[i];
  //           console.log("Blocked " + src);
  //         }

  //         for (var i = 0; i < allowedSources.length; i++) {
  //           var src = allowedSources[i];
  //           console.log("Allowed " + src);
  //         }

  //         console.groupEnd();  
  //       }
  
  //       // show 'eye'
  //       if(tracking_image_found) show_tracking_eye(messagePane);
  
  //       // Handle no images mode
  //       if($("div.ado", messagePane).length == 0) messagePane.setAttribute('processed', 'true');
  //     }
  //   }catch(e){
  //     console.log('PixelBlock Error: ' + e);
  //   }
  // }

  var blockImagesInIframeContents = function(iframeContents) {
      // loop over all images in this email
      $("img[src]", iframeContents).each(function(){
        var src = this.src;

        var noticeDiv = $('<div class="superhuman-pixel-block-notice">Blocked</div>');
        noticeDiv.data('imgsrc', src);

        var $img = $(this);
        noticeDiv.insertAfter($img);
        $img.removeAttr('src');

        blockedImageCount = blockedImageCount + 1;
      });
  };

  var scan_images = function(){
    try {
      var greyBlockImgSrc = null;
      var greyBlock = $('#grey-block');

      if (greyBlock.length > 0) {
        greyBlockImgSrc = greyBlock[0].src;
      }

      // Note: For some reason gmail.js seems to crash once in a while, add a check to re-init it
      var threadPane = $('.ThreadPane-messages');
      //var emails = threadPane.find('div.h7[processed!="true"]');
      var messagePanes = threadPane.find('.MessagePane');

      // go through all open emails on screen
      for(var x = 0; x < messagePanes.length; x++){
        var messagePane = messagePanes[x], tracking_image_found = false;
        var iframe = $(messagePane).find('iframe');

        if (iframe.length > 0) {
          var iframeMutationObserver;
          iframeMutationObserver = new MutationObserver(function (mutations) {
            iframeMutationObserver.disconnect();

            var target = mutations[0].target;
            var iframeContents = $(target).contents();
            var blockedImageCount = 0;
            var blockedSources = [];
            
            // loop over all images in this email
            $("img[src]", iframeContents).each(function(){
              var src = this.src;

              var noticeDiv = $('<div class="superhuman-pixel-block-notice"></div>');
              var backgroundCss = "url(" + greyBlockImgSrc + ")";
              noticeDiv.css('background', backgroundCss);
              noticeDiv.css('width', '15px');
              noticeDiv.css('height', '15px');
              noticeDiv.css('background-size', '15px 15px');
              noticeDiv.attr('title', src);
              noticeDiv.data('imgsrc', src);

              var $img = $(this);
              noticeDiv.insertAfter($img);
              $img.removeAttr('src');

              blockedImageCount = blockedImageCount + 1;
              blockedSources.push(src);
            });

            var blockedDomains = [];

            for (var i = 0; i < blockedSources.length; i++) {
              var blockedSource = blockedSources[i];
              var trimmedSource = blockedSource.replace(/https:\/\/media.superhumanapp.com\/images\/_\//g,'');
              var regExp = /https:\/\/(.*?)\//g;
              var matches = regExp.exec(trimmedSource);

              if (matches != null && matches.length > 0) {
                blockedDomains.push(matches[1]);
              }
            }

            var onlyUnique = function(value, index, self) { 
                return self.indexOf(value) === index;
            };

            var uniqueBlockedDomains = blockedDomains.filter(onlyUnique);

            console.group("PixelBlock: Blocked " + blockedSources.length + " images (" + uniqueBlockedDomains.length + " domains)");
            
            for (var i = 0; i < uniqueBlockedDomains.length; i++) {
              var blockedDomain = blockedDomains[i];

              console.log("PixelBlock: Blocked " + blockedDomain);
            }

            console.groupEnd();
          });

          iframeMutationObserver.observe(iframe.get(0), {
            attributes: true,
            characterData: false,
            childList: false,
            subtree: false,
            attributeOldValue: false,
            characterDataOldValue: false
          });
        }

        // var iframeContents = iframe.contents();
  
        // loop over all images in this email
        // $("img[src]", iframeContents).each(function(){
        //   var src = this.src;

        //   var noticeDiv = $('<div class="superhuman-pixel-block-notice">Blocked</div>');
        //   noticeDiv.data('imgsrc', src);

        //   var $img = $(this);
        //   noticeDiv.insertAfter($img);
        //   $img.removeAttr('src');

        //   blockedImageCount = blockedImageCount + 1;
        // });
  
        // // show 'eye'
        // if(tracking_image_found) show_tracking_eye(messagePane);
  
        // // Handle no images mode
        // if($("div.ado", messagePane).length == 0) messagePane.setAttribute('processed', 'true');
      }
    }catch(e){
      console.log('PixelBlock Error: ' + e);
    }
  }

  var init = function(){
    // add bootstrap.js
    $('#bs-script').attr('src', $('#bs-script').attr('data-src'));
    // init gmail.js
  }

  var didAddExpandedMessageObserver = false;
  var didAddThreadListObserver = false;

  var addExpandedMessageObserver = function() {
    if (didAddExpandedMessageObserver) {
      return;
    }

    var threadPaneMessages = $('.ThreadPane-messages');

    if (threadPaneMessages.length > 0) {
      // Observe new messages being expanded
      var expandedMessageObserver = new MutationObserver(function(mutations) {

        var newExpandedMessagePanes = false;

        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];

          var $target = $(mutation.target);
          if ($target.hasClass('MessagePane-expanded')) {
            newExpandedMessagePanes = true;
            break;
          }
        }

        if (newExpandedMessagePanes) {
          console.log("PixelBlocker: Expanded message(s)");
          scan_images();

          // Keep trying to add the other observer, in case it
          // hasn't been added already (all these divs are lazy loaded by Superhuman)
          addThreadListObserver();
        }
      });

      expandedMessageObserver.observe(threadPaneMessages.get(0), {
        attributes: false,
        characterData: false,
        childList: true,
        subtree: true,
        attributeOldValue: false,
        characterDataOldValue: false
      });

      didAddExpandedMessageObserver = true;
      console.log("PixelBlocker: Added expanded message observer");
    }
  };

  var addThreadListObserver = function() {
    if (didAddThreadListObserver) {
      return;
    }

    var threadPaneView = $('.ThreadPaneView');

    if (threadPaneView.length > 0) {
      // Observe the thread pane view being visible (i.e. going from Inbox to Conversation view)
      var threadPaneViewObserver = new MutationObserver(function (mutations) {
        var openedThreadView = false;

        for (var i = 0; i < mutations.length; i++) {
          var mutation = mutations[i];

          var $target = $(mutation.target);
          if ($target.hasClass('ThreadPaneView') && $target.hasClass('isVisible')) {
            openedThreadView = true;
            break;
          }
        }

        if (openedThreadView) {
          console.log("PixelBlocker: Opened thread view");
          scan_images();

          // Keep trying to add the other observer, in case it
          // hasn't been added already (all these divs are lazy loaded by Superhuman)
          addExpandedMessageObserver();
        }
      });

      threadPaneViewObserver.observe(threadPaneView.get(0), {
        attributes: true,
        characterData: false,
        childList: false,
        subtree: false,
        attributeOldValue: false,
        characterDataOldValue: false
      });

      didAddThreadListObserver = true;
      console.log("PixelBlocker: Added thread list observer");
    }
  };

  var start = function(){
    addExpandedMessageObserver();
    addThreadListObserver();
  }

  return {init:init, start:start};
})();

// check if jquery/gmail.js loaded & initialized
var checkLoaded = function() {
  if(window.jQuery && typeof Gmail != 'undefined') {
    $.fn.onAvailable = function(e) {
      var t = this.selector;
      var n = this;
      if (this.length > 0) e.call(this);
      else {
        var r = setInterval(function () {
          if ($(t).length > 0) {
            e.call($(t));
            clearInterval(r);
          }
        }, 50);
        
      }
    };
    pixelblock.init();
    pixelblock.start();
  } else {
    setTimeout(checkLoaded, 100);
  }
};
checkLoaded();