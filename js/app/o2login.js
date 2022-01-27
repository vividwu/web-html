$(document).ready(function(){
    var code = Request.QuerySearchString("code");  //vipspa.lash.indexOf("login")==0

    if(code != "")  //返回?code=5hbYQX#login&state=pvg-user-menu
    {
        ;
        $.ajax({
            async:false,
            url: vipspa.Auth.config.authTokeUrl+code,
            type: "post",
            contentType: "application/x-www-form-urlencoded",
            success: function (data) {
                if(data != null) {
                    console.log(data);
                    //window.localStorage.setItem("access_token", data.access_token);
                    //window.localStorage.setItem("refresh_token", data.refresh_token);
                    window.localStorage.setItem("TOKEN_DATA", JSON.stringify(data));  //TODO  是否有必要兼容低版本ie?
                    var redirect = Request.QuerySearchString("state");
                    location.href = location.pathname+"#"+redirect;   //"/#abc"
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown){
                alert(errorThrown)
            }
        });
    }
    else
        location.href = vipspa.Auth.config.loginUrl+vipspa.lash;

    //%23

    console.log('您尚未登陆....')
    //alert('您尚未登陆....');
});