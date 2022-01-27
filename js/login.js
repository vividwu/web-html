$(document).ready(function(){
    $("#loginBtn").click(function () {
        onLogin();
    });
});
function onLogin() {
    // var code = Request.QuerySearchString("code");  //vipspa.lash.indexOf("login")==0
    // if(code != "")  //返回?code=5hbYQX#login&state=pvg-user-menu
    // {
    ;
    $.ajax({
        async: false,
        url: vipspa.Auth.config.loginUrl + 'username=' + $("#username").val() + '&password=' + $("#password").val(),
        type: "post",
        contentType: "application/x-www-form-urlencoded",
        success: function (data) {

            if (data != null) {
                console.log(data);
                //window.localStorage.setItem("access_token", data.access_token);
                //window.localStorage.setItem("refresh_token", data.refresh_token);
                window.sessionStorage.setItem("access_token", data.data.access_token);  //TODO  是否有必要兼容低版本ie?
                var uiStr = Base64.decode(data.data.access_token.split('.')[1]);
                var tokenObj = eval("("+uiStr+")");
                window.sessionStorage.setItem('user_info','{"uid":'+tokenObj.uid+',"uname":"'+tokenObj.uname+'","displayName":"'+tokenObj.udisplay+'"}');
                var redirect = Request.QuerySearchString("state");
                location.href = "/wfhtml/#"+(redirect?unescape(redirect):"home");   //"/#abc"
            }
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            alert(errorThrown)
        }
    });
    // }
    // else
    //     location.href = vipspa.Auth.config.loginUrl+vipspa.lash;

    //%23

    console.log('您尚未登陆....')
    //alert('您尚未登陆....');
}