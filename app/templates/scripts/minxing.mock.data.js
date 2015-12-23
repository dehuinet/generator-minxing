/*
 * @Author: minxing365.com
 * @Date:   2015-12-22
 * @Desc: 当前文件主要是为了做一些模拟数据，可以自行修改
 * @Last Modified by:   dev@dehuinet.com
 * @Last Modified time: 2015-12-22
 */
;
(function($) {
    window.MXMock = window.MXMock || {
        MXCommon: {
            serverUrl: "http://127.0.0.1:3000",
            SSOToken: "3ac99170d29a2c36c5ed5c63130c863a",
            currentUser: {
                id: 3,
                name: "王亚楠",
                login_name: "15240374125@139.com"
            }
        },
        MXContacts: {
            selectUsers: [{
                id: 2,
                name: "李刚",
                login_name: "oajcs3@js.chinamobile.com"
            }, {
                id: 4,
                name: "周杰",
                login_name: "15240374105@139.com"
            }, {
                id: 5,
                name: "徐辉",
                login_name: "15240374117@139.com"
            }]
        }

    };
})($);