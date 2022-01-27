// 对Date的扩展，将 Date 转化为指定格式的String   ie 不兼容2019-06-17T03:55:07.000+0000
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
function Format(v,fmt) {
    if (!v) {
        return "";
    }
    if(typeof v === 'string' && (v.indexOf('T') > -1||v.includes('T'))) {
        v = v.replace('T', ' ').replace(/\-/g, '/'); //注意：指定一个具体的时间转换时间戳，需要yyyy/mm/dd hh:ii:ss格式，yyyy-mm-dd在IE和Safari下是有问题的。
    };
    //if(typeof v === 'string' && (v.indexOf('+') > -1||v.includes('+'))) {
    //    v = v.replace('+0000', '');
    //};
    if(typeof v === 'string' && (v.indexOf('.') > -1||v.includes('.'))) {
        v = v.replace('.000+0000', '');
    };
    console.log("数据库时间："+v);
    var date = new Date(v);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ("0" + d) : d;
    var h = date.getHours();
    h = h < 10 ? ("0" + h) : h;
    var M = date.getMinutes();
    M = M < 10 ? ("0" + M) : M;
    var s = date.getSeconds();
    s = s < 10 ? ("0" + s) : s;
    var str = y + "-" + m + "-" + d + " " + h + ":" + M + ":" + s;
    console.log("原来时间:"+str);
    return str;
}

function getAuthHeader(){
    return {'Authorization':vipspa.Auth.getAuthUser().token_type + " " + vipspa.Auth.getAuthUser().access_token};
}
$(document).ready(function(){
    if(vipspa.Auth.getAuthUser() == null)
        return;
    $('.welcome-message i').text(vipspa.Auth.getAuthUser().displayName);
    $('#loginName').text(vipspa.Auth.getAuthUser().displayName);
    $('#logoutLink').click(function () {vipspa.Auth.logout();});
});
function $Ajax(url,callback) {
    $.ajax({
        "url": url,
        "type": "get",
        "headers":vipspa.Auth.getHeaderToken(),
        "error": function (a,b,c) {
            toastr.error(a);
        },
        "success": function (response) {
            callback(response)
            // if (response != null && response != "") {
            //     //刷新
            //     toastr.success("保存成功!");
            // } else {
            //     toastr.error("提交错误!");
            // }
        }
    });
}
function $Post(url,data,callback){
    $.ajax({
        "url": url,
        "contentType": "application/json;charset=utf-8",
        "data": JSON.stringify(data),
        "type": "post",
        "headers":vipspa.Auth.getHeaderToken(),
        "error": function (a,b,c) {
            toastr.error(a);
        },
        "success": function (response) {
            callback(response);
        }
    });
};
function $Confirm(heading, question, cancelButtonTxt, okButtonTxt, callback) {
  var confirmModal = 
    $('<div class="modal hide fade">' +    
        '<div class="modal-header">' +
          '<a class="close" data-dismiss="modal" >&times;</a>' +
          '<h3>' + heading +'</h3>' +
        '</div>' +

        '<div class="modal-body">' +
          '<p>' + question + '</p>' +
        '</div>' +

        '<div class="modal-footer">' +
          '<a href="#" class="btn" data-dismiss="modal">' + 
            cancelButtonTxt + 
          '</a>' +
          '<a href="#" id="okButton" class="btn btn-primary">' + 
            okButtonTxt + 
          '</a>' +
        '</div>' +
      '</div>');

  confirmModal.find('#okButton').click(function(event) {
    callback();
    confirmModal.modal('hide');
});

  confirmModal.modal('show');     
};