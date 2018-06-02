function getLocalTime(nS) {
    return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
} /*** toast封装 ***/


function toast(text) {
    $('#toast').html(text);
    $('#toast').show();
    setTimeout(function() {
        $('#toast').addClass('toast-show');
        showToast()
    }, 300);
}

function showToast() {
    setTimeout(function() {
        $('#toast').removeClass('toast-show');
        setTimeout(function() {
            $('#toast').hide();
        }, 2300);
    }, 3000);
}

function loading(type) {
    if (type) {
        $('#load').show()
    } else {
        $('#load').hide()
    }
}
loading(false);

var dappContactAddress = "n1nz8iWhfyEmBvQ7ZmDX9Dccj35NqNFP5te";
var nebulas = require("nebulas"),
    Account = Account,
    neb = new nebulas.Neb();
var NebPay = require("nebpay"); //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
//neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"))

var address = "";

if (typeof(webExtensionWallet) === "undefined") {
    $("#toast").html("您未安装WebExtensionWallet，为了不影响您的使用，请安装插件");
} else {
    $("#toast").html("您已安装WebExtensionWallet");
}



window.addEventListener('mark_info', function(e) {
    if ( !! e.data.data.account) {
        address = e.data.data.account;
        //alert(address)
        //getAllNote();
    }
});


$(document).ready(function() {
    window.postMessage({
        "target": "contentscript",
        "data": {},
        "method": "getAccount",
    }, "*");
});



var serialNumber;

$("#search").click(function() {
    if (!$("#search_md5").val()) {
        //alert('不能为空');
        return;
    }

    $('#content').text("");
    var from = dappContactAddress;
    var value = "0";
    var nonce = "0";
    var gas_price = "1000000";
    var gas_limit = "2000000";
    var callFunction = "get";
    var callArgs = "[\"" + $("#search_md5").val() + "\"]";
    console.log(callArgs);
    var contract = {
        "function": callFunction,
        "args": callArgs
    }
    loading(true)
    toast('正在为您检索，请稍候！');


    neb.api.call(from, dappContactAddress, value, nonce, gas_price, gas_limit, contract).then(function(resp) {

        console.log(resp);
        var result = resp.result;


        if (result === 'null') {
            loading(false);
            $("#md5_info").hide(), $("#md5_add").fadeIn(), $("#tag_list").empty(), $("#mark_info").text("此MD5值，暂时无人提交，快来打上你的印记吧！");
            return;
        }
        console.log(result);
        result = JSON.parse(result);


        loading(false);
        $("#md5_add").hide(), $("#md5_info").fadeIn(), $("#md5_mark_info").text("此MD5结果由" + result.authors + "提供！");
        $("#search_md5").val(result.key);
        $("#md5_md5s").val(result.md5s);
        if(result.types == "undefined"){
            $('#md5_types').val("自动");
        }else{
            $('#md5_types').val(result.types);
        }
        $('#time').val(getLocalTime(result.dates));
        $('#md5_authers').val(result.authors);


        console.log("sucess :" + result);
    }).
    catch (function(err) {
        $("#md5_info").hide(), $("#md5_add").fadeIn(), $("#mark_info").text("此MD5值，暂时无人提交，快来打上你的印记吧！");
        console.log("error :" + err.message);
        loading(false);

    })

})

$('#post').click(function() {
    if (!$("#md5s").val() ) {
        toast('没填全，要不再检查看看');
       return;
     }
    loading(false);
    toast('正在记录您提交的MD5，请稍候！');
    var to = dappContactAddress;
    var value = "0";
    var callFunction = "set";
    var timestamp = (new Date()).valueOf();
    var posts = $("#search_md5").val();
    if (!$("#search_md5").val()) {
        var posts = $("#search_md5s").val();
        if (!$("#search_md5s").val() ) {
        toast('没填全，要不再检查看看');
       return;
     }
    }
    var callArgs = "[\"" + posts + "\",\"" + $("#types").val() + "\",\"" + $("#md5s").val() + "\",\"" + timestamp + "\",\"" + address + "\"]";

    serialNumber = nebPay.call(to, value, callFunction, callArgs, { //使用nebpay的call接口去调用合约,
        listener: function(resp) {
            if (resp.txhash) {
                toast('记录提交成功,请稍后刷新查询！');
                alert('提交成功,请稍后刷新查询')

            } else {
                toast('信息添加失败,请稍后再试');
            }
            console.log("thecallback is " + resp)
        }
    });
    toast('交易成功后，请重新查询！');

})