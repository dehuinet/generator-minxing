/*
 * @Author: minxing365.com
 * @Date:   2015-12-22
 * @Desc: 当前文件会自动检测在非敏行浏览器运行的时候，模拟一些事件和API,当前文件请不要修改，以后会进行升级。
 * @Last Modified by:   anchen
 * @Last Modified time: 2015-12-22
 */
;
(function($) {
    $.extend({
        sendOcuMessage: function(accessToken, ocuId, ocuSecret, direct_to_user_ids, user_id, articles, success,error) {
            //发送公众号推送消息，这个建议仅在demo环境中使用
            MXCommon.getServerUrl(function(serverUrl) {
                $.ajax({
                    url: serverUrl + "/api/v1/conversations/ocu_messages",
                    headers: {
                        "Authorization": "Bearer " + accessToken,
                        "NETWORK-ID": "110",
                        "X_AS_USER": user_id
                    },
                    method: "POST",
                    data: {
                        direct_to_user_ids: direct_to_user_ids,
                        ocu_id: ocuId,
                        ocu_secret: ocuSecret,
                        content_type: 1,
                        body: JSON.stringify({
                            article_count: articles.length,
                            articles: articles
                        }),
                        sso_key: 'user_id'
                    },
                    success:success,
                    error:function(err){
                         alert("异常！");
                         alert("err:::" + JSON.stringify(err));
                    }
                })
            })
        }
    });
})($);

;
(function($) {
    //这里代码是为了扩展一些敏行的方法，主要是用于演示用，比如直接推送一些通知

    if (/^MinxingMessenger/.test(navigator.userAgent)) {
        return;
    }
    var triggerDeviceReady=function(){
         window.setTimeout(function() {
            var event = document.createEvent('Events');
            event.initEvent('deviceready', false, false);
            document.dispatchEvent(event);
        }, 100);
    }
    // $(window).bind('hashchange', function(){
    //     triggerDeviceReady();
    // });
    //dom加载完毕，触发deviceready事件
    window.addEventListener("load", function() {
      triggerDeviceReady(); 
    }, false);


    window.MXCommon = window.MXCommon || {
        getServerUrl: function(callback) {
            callback(MXMock.MXCommon.serverUrl);
        },
        getCurrentUser: function(callback) {
            callback(MXMock.MXCommon.currentUser);
        }
    };
    window.MXWebui = window.MXWebui || {
        showWebViewTitle: function(title) {
            window.title = title;
        }
    };

    window.MXContacts = window.MXContacts || {
        selectUsers: function(callback) {
            callback({
                data: MXMock.MXContacts.selectUsers
            });
        }
    };
})($);