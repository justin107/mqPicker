// import MqPicker from "./js/mqPicker"

//高德相关
function loadAmapApi(amapKey,amapVersion) {
    if(!amapKey) amapKey='';
    if(!amapVersion) amapVersion='1.4.14';
    // var amapApiUrl = 'https://webapi.amap.com/maps?v='+amapVersion+'&key='+amapKey+'&callback=apiLoad',//加载JS api
    var amapApiUrl = 'https://webapi.amap.com/maps?v='+amapVersion+'&key='+amapKey+'&plugin=AMap.DistrictSearch'+'&callback=apiLoad',//加载JS api
        jsapi = document.createElement('script');

    jsapi.charset = 'utf-8';
    jsapi.src = amapApiUrl;
    document.head.appendChild(jsapi);
}

loadAmapApi('7a83c014e37800a4ecb7193e306b67ba');

window.apiLoad=function (){//异步加载
    window.districtSearch = new AMap.DistrictSearch({
        subdistrict: 1,//  显示下级行政区级数，1表示返回下一级行政区
    });

    var demoOne=new MqPicker({
        domMaster:'#demo1',
        layPosition:'float',
        lastIsMultiple:false,
        pickerErrors:searchError
    });

    var demoTwo=new MqPicker({
        domMaster:'#demo2',
        layPosition:'float',
        lastIsMultiple:true,
    });

    var demoThree=new MqPicker({
        domMaster:'#demo3',
        layPosition:'float',
        placeholderText:'你试试换个提示',
        lastIsMultiple:false,
    });

    var demoFour=new MqPicker({
        domMaster:'#demo4',
        layPosition:'layer',
        lastIsMultiple:true,
        output:'name'
    });

    var demoFive=new MqPicker({
        domMaster:'#demo5',
        layPosition:'layer',
        lastIsMultiple:true,
        pickerLevel:{
            name:['自定义'],
        },
        pickerClass:'pickerPost',
        loadAjax:test
    });

    var demoFix=new MqPicker({
        domMaster:'#demo6',
        layPosition:'layer',
        lastIsMultiple:false,
        pickerLevel:{
            name:['自定义'],
        },
        pickerClass:'pickerPost',
        loadAjax:test
    });

    var demoTen=new MqPicker({
        domMaster:'#demo10',
        pickerLevel:{
            name:['省','市','自定义'],
        },
        layPosition:'layer',
        lastIsMultiple:true,
        pickerClass:'pickerAreaPost',
        loadAjax:test
    });

    var url="https://www.easy-mock.com/mock/59a9210de0dc66334198c0cd/example/data";
    function test(data){
        return $.ajax({
            url: url,
            data:data || {},
        })
    }


    function searchError(){
        alert("错误提示方法")
    }

    $(".demo10 .button").on("click",function () {
        demoTen.pickerReset()
    });

    $(".demo10 .edit").on("click",function () {
        demoTen.pickerRewrite(["420000","420500",["123456"]])
    });

    $(".demo10 .console").on("click",function () {
        console.log(demoTen.tabData)
    });

    $(".demo1 .edit").on("click",function () {
        demoOne.pickerRewrite([420000,420500,420528])
        // demoOne.pickerRewrite(["420000","429000","429004"])//测试回写
    });

    $(".demo1 .button").on("click",function () {
        demoOne.pickerReset()
    });

    $(".demo1 .console").on("click",function () {
        console.log(demoOne.tabData)
    });

    $(".demo2 .button").on("click",function () {
        demoTwo.pickerReset()
    });

    $(".demo2 .console").on("click",function () {
        console.log(demoTwo.tabData)
    });

    $(".demo2 .edit").on("click",function () {
        demoTwo.pickerRewrite(["420000","420500",["420504","420583"]])//测试回写
    });

    $(".demo3 .button").on("click",function () {
        $(".demo3 .txt").html(demoThree.outValue)
    });

    $(".demo4 .button").on("click",function () {
        $(".demo4 .txt").html(demoFour.outName)
    });

    $(".demo5 .edit").on("click",function () {
        demoFive.pickerRewrite(["12","123456","12345678"])
    });

    $(".demo5 .button").on("click",function () {
        demoFive.pickerReset()
    });

    $(".demo5 .console").on("click",function () {
        console.log(demoFive.tabData)
    });

    $(".demo6 .edit").on("click",function () {
        demoFix.pickerRewrite("12")
    });

    $(".demo6 .button").on("click",function () {
        demoFix.pickerReset()
    });

    $(".demo6 .console").on("click",function () {
        console.log(demoFix.tabData)
    });

};