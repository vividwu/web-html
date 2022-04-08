$(function(){
    vipspa.Auth({
        config:{ logoutUrl:"http://10.1.9.16:10380/logout?out=http://localhost:8255/wfhtml/login.html",
            loginUrl:"http://101.43.138.169:8880/oauth/token?grant_type=password&",
            authTokeUrl:"http://10.1.9.16:6600/oauth/token?client_id=ConsumeWebProd&client_secret=12345&grant_type=authorization_code&redirect_uri=http://10.1.9.14:8251/%23login&code=" },
        isLogin: function(){
            var act = window.sessionStorage.getItem("user_info");
            return act != null;
        },
        getLoginRespCode: function(){},
        getAuthUser: function(){
            var act = window.sessionStorage.getItem("user_info");
            return JSON.parse(act);  //TODO  是否有必要兼容低版本ie?
        },
		getHeaderToken: function(){
			return {Authorization:"bearer "+window.sessionStorage.getItem("access_token")};
		},
        logout: function(){
			window.sessionStorage.removeItem("access_token");
            window.sessionStorage.removeItem("user_info");
            location.href = this.config.logoutUrl;
        }
    });
	vipspa.debug=true;  //不缓存加载的HTML/JS
	//多窗口共享session
	window.localStorage.setItem('SESSION_CHANGE', Date.now().toString())
	window.addEventListener("storage", function(event){
		if(!event.newValue){
			return;
		}
		if(event.key === 'SESSION_CHANGE'){
			localStorage.setItem("storeSessionData", sessionStorage.getItem('SESSION_CHANGE'))
			console.log('sessionStorage.getItem(constant.SESSION_ID):' + sessionStorage.getItem('SESSION_CHANGE'))
			localStorage.removeItem("storeSessionData")
		} else if (event.key === 'storeSessionData') {
			console.log('event.newValue:' + event.newValue)
			sessionStorage.setItem('SESSION_CHANGE', event.newValue)
		}
	})
});

var Request = {
    QueryHashString: function (item) {
        var result = location.hash.match(new RegExp("[\?\&]" + item + "=([^\&]+)","i"));
        if(result == null || result.length < 1){
            return "";
        }
        return result[1];
    },
    QuerySearchString: function (item) {
        var result = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]+)","i"));
        if(result == null || result.length < 1){
            return "";
        }
        return result[1];
    },
	QueryString: function (item) {
        var result = location.href.match(new RegExp("[\?\&]" + item + "=([^\&]+)","i"));
        if(result == null || result.length < 1){
            return "";
        }
        return result[1];
    },
    ajaxGet:function(){

    }
}

var SysConfig = {
    Api:{ host:"http://localhost:8880" }
}
toastr.options = {"timeOut": "2000", "closeButton": true, "positionClass": "toast-top-center"}