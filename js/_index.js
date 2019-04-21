//高德相关
function loadAmapApi(amapKey,amapVersion) {
    if(!amapKey) amapKey='';
    if(!amapVersion) amapVersion='1.4.14';
    var amapApiUrl = 'https://webapi.amap.com/maps?v='+amapVersion+'&key='+amapKey+'&callback=onLoad',//加载JS api
        jsapi = document.createElement('script');

    jsapi.charset = 'utf-8';
    jsapi.src = amapApiUrl;
    document.head.appendChild(jsapi);
}

loadAmapApi('7a83c014e37800a4ecb7193e306b67ba');


var tempData=[//临时数据
    {name:'测试',value:'123456'},
    {name:'测试2',value:'1234563'},
    {name:'测试3',value:'12345633'},
    {name:'测试4',value:'123456333'},
    {name:'测试5',value:'1234563333'},
    {name:'测试6',value:'12345633333'},
    {name:'测试7',value:'12345633333'},
    {name:'测试8',value:'123456333333'},
    {name:'测试9',value:'3333333333333'}
];

window.onLoad  = function(){
    var districtSearch,
        domMaster=$('#demo'),//实例
        pickerMap,//实例化地图
        layPosition='float',//tab弹窗位置,float,//悬浮，no-float,相对,layer,页面正中，须指定面板宽度

        placeholderText='请输入省/市/区',
        separator='，',//省市间隔符号
        areaSeparator='、',//区字符间隔
        pickerLevel=3,//设置级别，控制按钮等逻辑，默认省市区3级
        pickerClass='pickerArea', //定义picker类别，
                        // pickerArea,默认省市区，
                        // pickerCity,默认省市,
                        // pickerAreaPost,省市自定义区
                        // pickerPost,只接受POST自定义数据，单级选择
        arrayArea=[],//地区checkbox数组
        amapProvinceName='',//省名,产出
        amapProvinceVal='',//省值,产出
        amapCityName='',//市名,产出
        amapCityVal='',//市值,产出
        amapAreaName='',//区名,产出
        amapAreaVal='',//区值,产出
        amapAreaPostName='',//自定义区名,产出
        amapAreaPostVal='',//自定义区值,产出

        isMultiple=true,//转义是否单、多选
        areaType=isMultiple?'checkbox':'radio',//区的单、多选，单选radio
        onceLoad=true,//是否初次加载，省数据不用重复请求

        tabHeadVal='1',//选中tab的值,1省2市3区4自定义区
        isPostArea=false,//是否自定义区

        thisLevel,//查询时的级别
        districtListNext=[],//查询数据
        specialCityList=[],//直辖市,只载入一次
        provinceList=[];//省,只载入一次

    function initPicker(){//初始判断一下

        //动态输出dom
        updateHtml();


        if(layPosition==='float'){
            domMaster.find('.aMap-picker-tab').addClass('aMap-picker-tab-float')
        }else if(layPosition==='layer'){

            //body加父级class
            //动态输出tab
            domMaster.find('.aMap-picker-tab').addClass('aMap-picker-tab-layer')
        }

        if(pickerClass==='pickerArea'){//默认省市区
            //dom渲染3级，pickerLevel=3，默认
            pickerSearch('中国')
        }else  if(pickerClass==='pickerCity'){//只展示省市
            //dom渲染2级，pickerLevel=2
        }
    }

    function updateHtml(){//根据配置渲染页面
        var pickerArea=
            ['<div class="aMap-picker-input-box">',
            '<i class="ico-arrow border_cort"></i>',
                '<div class="input-area">',
                    '<span class="input-placeholder">'+placeholderText+'</span>',
                    '<span class="input-area-province"></span>',
                    '<span class="input-area-city"></span>',
                    '<span class="input-area-area"></span>',
                    '<span class="input-area-post"></span>',
                '</div>',
            '</div>'].join('');
        var tabBox=
            ['<div class="aMap-picker-tab">',
            '<div class="aMap-picker-tab-head">',
                '<div class="tab-head-province"><label><input name="tab-head-radio" type="radio" checked value="1"><span>省</span></label></div>',
            '<div class="tab-head-city"><label><input name="tab-head-radio" type="radio"  value="2"><span>市</span></label></div>',
            '<div class="tab-head-area"><label><input name="tab-head-radio" type="radio"  value="3"><span>区</span></label></div>',
            '<div class="tab-head-area-post"><label><input name="tab-head-radio" type="radio"><span>自定义区</span></label></div>',
            '</div>',
        '<div class="aMap-picker-tab-pane">',
            '<div class="tab-pane-province">',
                '<div class="tab-pane-box"></div>',
            '</div>',
            '<div class="tab-pane-city">',
                '<div class="tab-pane-box">',
                    '<p class="no-data">暂无数据</p>',
                '</div>',
            '</div>',
            '<div class="tab-pane-area">',
                '<div class="tab-pane-box">',
                    '<p class="no-data">暂无数据</p>',
                '</div>',
            '</div>',
            '<div class="tab-pane-area-post">',
                '<div class="tab-pane-box">',
                    '<p class="no-data">暂无数据</p>',
                '</div>',
            '</div>',
            '</div>',
            '<div class="aMap-picker-tab-buttons">',
                '<div class="aMap-picker-tab-buttons-box">',
                    '<span class="aMap-btn-submit">确定</span>',
                    '<span class="aMap-btn-choose-all">全选</span>',
                    '<span class="aMap-btn-cancel">取消</span>',
                '</div>',
            '</div>',
            '</div>'].join('');

        domMaster.html(pickerArea+tabBox)
    }

    /*数据和地图互动，显示地理围栏，后期有精力补齐
     pickerMap= new AMap.Map('pickerMap',{//地图ID
        zoom: 12,  //设置地图显示的缩放级别
        resizeEnable:true,
        mapStyle: 'amap://styles/whitesmoke',  //设置地图的显示样式
    });

    pickerMap.on('complete', function(){
        // 地图图块加载完成后触发
        console.log('pickerMap complete');
    });
     */

    AMap.plugin('AMap.DistrictSearch', function () {
        districtSearch = new AMap.DistrictSearch({
            level: 'country',// 关键字对应的行政区级别，country表示国家
            subdistrict: 1,//  显示下级行政区级数，1表示返回下一级行政区
        });
        console.log('AMap.plugin complete')
    });

    function pickerSearch(val){// 根据汉字、cityCode查询下一级信息
        districtSearch.search(val, function(status, result) {
            // 查询成功时，result即为对应的行政区信息
            //业务范畴为规范省市，不考虑返回为查询类多数组
            if(status=='complete' && result.districtList.length===1){
                districtListNext=result.districtList[0].districtList;//下一TAB展示数据
                thisLevel=result.districtList[0].level;//上一级别等级

                if(thisLevel=='country' && onceLoad){//页面载入第一次使用，省数据
                    var provinceData=districtListNext;
                    onceLoad=false;//只用一次

                    sortChinese(provinceData,'name');

                    //处理直辖市和简称问题
                    provinceData.forEach(function (item,index) {
                        if(item.adcode =="450000"){
                            item.name='广西';
                            item.letter='G'
                        }else if(item.adcode =="650000"){
                            item.name='新疆';
                            item.letter='X'
                        }else if(item.adcode =="540000"){
                            item.name='西藏';
                            item.letter='X'
                        }else if(item.adcode =="640000"){
                            item.name='宁夏';
                            item.letter='N'
                        }else if(item.adcode =="810000"){
                            item.name='香港';
                            item.letter='X'
                        }else if(item.adcode =="150000"){
                            item.name='内蒙古';
                            item.letter='N'
                        }else if(item.adcode =="820000"){
                            item.name='澳门';
                            item.letter='A'
                        }else if(item.adcode =="230000"){
                            item.name='黑龙江';
                            item.letter='H'
                        }else if(item.adcode =="340000"){//安徽
                            item.letter='A'
                        }else if(item.adcode =="110000"){//北京
                            item.letter='B'
                        }else if(item.adcode =="500000"){//重庆
                            item.letter='C'
                        }else if(item.adcode =="350000"){//福建
                            item.letter='F'
                        }else if(item.adcode =="620000"){//甘肃
                            item.letter='G'
                        }else if(item.adcode =="440000"){//广东
                            item.letter='G'
                        }else if(item.adcode =="520000"){//贵州
                            item.letter='G'
                        }else if(item.adcode =="460000"){//海南
                            item.letter='H'
                        }else if(item.adcode =="130000"){//河北
                            item.letter='H'
                        }else if(item.adcode =="410000"){//河南
                            item.letter='H'
                        }else if(item.adcode =="420000"){//湖北
                            item.letter='H'
                        }else if(item.adcode =="430000"){//湖南
                            item.letter='H'
                        }else if(item.adcode =="220000"){//吉林
                            item.letter='J'
                        }else if(item.adcode =="320000"){//江苏
                            item.letter='J'
                        }else if(item.adcode =="360000"){//江西
                            item.letter='J'
                        }else if(item.adcode =="210000"){//辽宁
                            item.letter='L'
                        }else if(item.adcode =="630000"){//青海
                            item.letter='Q'
                        }else if(item.adcode =="370000"){//山东
                            item.letter='S'
                        }else if(item.adcode =="140000"){//山西
                            item.letter='S'
                        }else if(item.adcode =="610000"){//陕西
                            item.letter='S'
                        }else if(item.adcode =="310000"){//上海
                            item.letter='S'
                        }else if(item.adcode =="510000"){//四川
                            item.letter='S'
                        }else if(item.adcode =="710000"){//台湾
                            item.letter='T'
                        }else if(item.adcode =="120000"){//天津
                            item.letter='T'
                        }else if(item.adcode =="530000"){//云南
                            item.letter='Y'
                        }else if(item.adcode =="330000"){//浙江
                            item.letter='Z'
                        }


                        if(isString(item.citycode)){//分离省和特别市
                            specialCityList.push(item)
                        }else {
                            provinceList.push(item);
                        }

                    });

                    specialCityList.sort(function(a,b){
                            return (a.citycode)*1-(b.citycode)*1
                        });

                    updateProvince(provinceList,specialCityList);
                }

                if(thisLevel=='province'){//市数据
                    var cityData=districtListNext;
                    cityData.sort(function (a, b) {//按名称长短
                        return a.name.length-b.name.length
                    });
                    // console.log(cityData);
                    updateCity(cityData)
                }

                if(thisLevel=='city'){//区数据
                    var areaData=districtListNext;
                    areaData.sort(function (a, b) {//按名称长短
                        return a.name.length-b.name.length
                    });

                    updateArea(areaData,areaType);
                    if(areaType=='checkbox'){
                        $("input[type='checkbox'][name='area']").data({checked:false})
                    }
                }
            }else {
                alert('返回错误!')
            }
        })
    }


    //事件
    domMaster.on('click','.input-area',function () {
        domMaster.find('.aMap-picker-tab').fadeIn()
    });

    $(document).mousedown(function(e){
        if($(e.target).parents(".aMap-picker-area").length==0){
            domMaster.find('.aMap-picker-tab').fadeOut()
            pickerReset()//点击面板以外就重置
        }
    });

    domMaster.on("change","input[name=tab-head-radio]",function () {
        tabHeadVal=$(this).val();
        if(tabHeadVal == '1'){
            domMaster.find('.tab-pane-province').show().siblings().hide();
        }else if(tabHeadVal == '2') {
            domMaster.find('.tab-pane-city').show().siblings().hide();
        }else if(tabHeadVal == '3'){
            domMaster.find('.tab-pane-area').show().siblings().hide();
        }else if(tabHeadVal == '4'){
            domMaster.find('.tab-pane-area-post').show().siblings().hide();
        }
        isShowButtons()//判断是否显示按钮
    });


    domMaster.on("click","input[name=province]",function () {
        var provinceName=$(this).siblings().find('i').text();
        domMaster.find('.input-placeholder').hide();
        if(provinceName===amapProvinceName){//区分是否存在
            //直接切换
            $("input[name=tab-head-radio][value='2']").prop('checked',true).change();
        }else {
            amapProvinceName=provinceName;
            amapProvinceVal=$(this).val();
            domMaster.find('.input-area-province').html(provinceName);
            pickerSearch(amapProvinceVal);
            //清空
            domMaster.find('.input-area-city').html('');
            domMaster.find('.input-area-area').html('');
            arrayArea=[]
        }
    });

    domMaster.on("click","input[name=city]",function () {
        var cityName=$(this).siblings().text();
        domMaster.find('.input-area-city').html(separator+cityName);
        if(cityName===amapCityName){
            //直接切换
            if(!isPostArea){//判断是否自定义区域
                $("input[name=tab-head-radio][value='3']").prop('checked',true).change();
            }else {
                $("input[name=tab-head-radio][value='4']").prop('checked',true).change();
            }
        }else {
            amapCityName=cityName;
            amapCityVal=$(this).val();
            pickerSearch(amapCityVal);
            //清空
            domMaster.find('.input-area-area').html('');
            arrayArea=[]
        }
    });

    //按钮-全选,只可能checkbox情况下出现
    domMaster.on("click",'.aMap-btn-choose-all',function () {
        domMaster.find("input[type='checkbox'][name='area']").prop('checked',true).change();
        $(this).hide().siblings('.aMap-btn-cancel').css('display','inline-block')
    });

    //按钮-确定
    domMaster.on("click",'.aMap-btn-submit',function () {

        //打印产出


        domMaster.find('.aMap-picker-tab').fadeOut()
    });

    //按钮-取消,只可能checkbox情况下出现
    domMaster.on("click",'.aMap-btn-cancel',function () {
        domMaster.find("input[type='checkbox'][name='area']").prop('checked',false).change();
        $(this).hide().siblings('.aMap-btn-choose-all').css('display','inline-block')
    });

    domMaster.on("click","input[type='radio'][name='area']",function () {
        var areaName=$(this).siblings().text();
        domMaster.find('.input-area-area').html(separator+areaName);
        isShowButtons()
    });


    domMaster.on("click","input[type='checkbox'][name='area']",function () {

        //不区分先后点击
        /*
        var checkboxArea=$("input[type='checkbox'][name='area']:checked");
        var array=[];
        for(var i=0;i<checkboxArea.length;i++){
            array.push($(checkboxArea[i]).next().text())
        }
        domMaster.find('.input-area-area').html(array.join('、'))
         */

        //区分先后点击
        var array=[],
            _that=$(this),
            checked=_that.data().checked,
            checkedVal=_that.next().text();
        if(!checked){
            _that.data().checked=true;
            arrayArea.push(_that.next().text());
        }else {
            _that.data().checked=false;
            array=arrayArea.filter(function (item) {
                    return item != checkedVal
                });
            arrayArea=array;
        }

        isShowButtons();//是否显示按钮区

        if(arrayArea.length!==0){//区数量
            var arrayAreaStr=arrayArea.join(areaSeparator);
            domMaster.find('.input-area-area').html('<em title='+arrayAreaStr+'>'+separator+arrayAreaStr+'</em>')
        }else {
            domMaster.find('.input-area-area').html('')
        }
    });
    
    
    //清空picker
    function pickerReset() {
        console.log('pickerReset')
    }

    //判断是否显示按钮
    function isShowButtons(){
        //根据值显示
        if(isMultiple){//多选
            if(arrayArea.length<1){
                domMaster.find('.aMap-picker-tab-buttons').hide()
            }else {
                domMaster.find('.aMap-picker-tab-buttons').show()
            }
        }else {//单选
            domMaster.find('.aMap-picker-tab-buttons').show();
            domMaster.find('.aMap-btn-choose-all').hide();
        }

        //根据级别判断显示按钮区，最后一级显示
        if(tabHeadVal==pickerLevel && arrayArea.length!==0){
            domMaster.find('.aMap-picker-tab-buttons').show();
        }else {
            domMaster.find('.aMap-picker-tab-buttons').hide();
        }

    }

    //区更新
    function updateArea(data,type){
        var areaDom=domMaster.find('.tab-pane-area');
        domMaster.find('.tab-head-area input').prop('checked',true).change();//tab head
        areaDom.show().siblings().hide();
        var interHtml=[];
        //区分单选多选
        if(type=='radio'){
            for(var i=0;i<data.length;i++){
                interHtml.push('<label><input name="area" type="radio" value='+data[i].adcode+'><span>'+data[i].name+'</span></label>');
            }
        }else {
            for(var i=0;i<data.length;i++){
                interHtml.push('<label><input name="area" type="checkbox" value='+data[i].adcode+'><span>'+data[i].name+'</span></label>');
            }
        }
        areaDom.find('.tab-pane-box').html(interHtml.join(''))
    }


    //市更新
    function updateCity(data){
        var cityDom=domMaster.find('.tab-pane-city');
        domMaster.find('.tab-head-city input').prop('checked',true).change();//tab head
        cityDom.show().siblings().hide();
        var interHtml=[];
        for(var i=0;i<data.length;i++){
            interHtml.push('<label><input name="city" type="radio" value='+data[i].adcode+'><span>'+data[i].name+'</span></label>');
        }
        cityDom.find('.tab-pane-box').html(interHtml.join(''))
    }


    //省
    function updateProvince(dataA,dataB){
        var alphabet=['A','F','G','H','J','L','N','Q','S','X','Y','Z'];//字母表
        //省处理
        var htmlChild=[],htmlChildStr;
        for(var i=0;i<alphabet.length;i++){
            var dateSame=dataA.filter(function (value) {
                return value.letter==alphabet[i]
            });
            var interHtml=[];
            for(var n=0;n<dateSame.length;n++){
                var provinceName=dateSame[n].name;
                if(provinceName.length === 2){
                    provinceName='<i class="space-letter">'+provinceName+'</i>'
                }else {
                    provinceName='<i>'+provinceName+'</i>'
                }
                interHtml.push('<label><input name="province" type="radio" value='+dateSame[n].adcode+'><span>'+provinceName+'</span></label>');
            }
            var outerhtml=['<dl>',
                    '<dt name='+alphabet[i]+'>',
                    alphabet[i],
                    '</dt>',
                    '<dd>','</dd>',
                '</dl>'];
            outerhtml.splice(5,0,interHtml.join(''));
            htmlChild.push(outerhtml.join(''))
        }
        //直辖市处理
        var cities=[],cityStr;
        dataB.forEach(function (item,index) {
            var cityName=item.name;
            if(cityName.length === 2){
                cityName='<i class="space-letter">'+cityName+'</i>'
            }else {
                cityName='<i>'+cityName+'</i>'
            }
            if(item.adcode*1 < 710000){//台湾710000，大于它的都用不上
                cities.push('<label><input name="province" type="radio" value='+item.adcode+'><span>'+cityName+'</span></label>')
            }else {
                cities.push('<label title="未开通地区"><input name="province" disabled type="radio" value='+item.adcode+'><span>'+cityName+'</span></label>')
            }
        });
        cityStr='<dl class="special-city">'+'<dt>'+'</dt>'+'<dd>'+cities.join('')+'</dd>'+'</dl>';
        htmlChildStr=cityStr+htmlChild.join('');
        domMaster.find('.tab-pane-province .tab-pane-box').html(htmlChildStr)
    }

    function sortChinese (arr, dataLeven) {
        // 参数：arr 排序的数组; dataLeven 数组内的需要比较的元素属性
        /* 获取数组元素内需要比较的值 */
        function getValue (option) { // 参数： option 数组元素
            if (!dataLeven) return option;
            var data = option
            dataLeven.split('.').filter(function (item) {
                data = data[item]
            })
            return data + ''
        }
        arr.sort(function (a, b) {//按字母排序
            return getValue(a).localeCompare(getValue(b), 'zh-CN');
        });
        arr.sort(function (a, b) {//按adcode排序
            return (a.adcode)*1-(b.adcode)*1
        });
    }

    function isString(str){//判断是否是字符串,省为数组
        return (typeof str=='string')&&str.constructor==String;
    }

    initPicker();

};




function AmapPicker (element, options) {

}

AmapPicker.prototype={
    constructor:AmapPicker,
    initPicker:function () {
        
    },
};




