;(function($,window,document,undefined){

    var CommonPicker=function (element, params,postAjax) {
        this.domMaster=$(element);
        this.param={
                placeholderText:'请输入省/市/区',
                layPosition:'float',//tab弹窗位置,float,//悬浮，no-float,相对,layer,页面正中，须指定面板宽度
                // postAjax:postAjax || this.pickerSearch,
                layerWidth:500,
                pickerLevel:{
                    name:['省','市','区'],
                },
                pickerClass:'pickerArea',// pickerArea,默认省市区，
                                         // pickerCity,默认省市,
                                         // pickerCityArea,默认市区,
                                         // pickerAreaPost,省市自定义区
                                         // pickerPost,只接受POST自定义数据，单级选择
                isMultiple:true,//转义是否单、多选,最后一级
                separator:'，',//省市间隔符号
                areaSeparator:'、',//区字符间隔
        };
        this.param = $.extend(this.param, params);

        this.param.pickerLevel.level=this.param.pickerLevel.name.length;
        //单、多选，单选radio,最后一级别
        this.param.areaType=this.param.isMultiple?'checkbox':'radio';
        this.aMapPicker={
            thisLevel:'',//查询时的级别
            districtListNext:[],//查询数据
            onceLoad:true,//是否初次加载，省数据不用重复请求
            specialCityList:[],//直辖市,只载入一次
            provinceList:[],//省,只载入一次
            arrayArea:[],//地区checkbox数组
            amapProvinceName:'',//省名,产出
            amapProvinceVal:'',//省值,产出
            amapCityName:'',//市名,产出
            amapCityVal:'',//市值,产出
            amapAreaName:'',//区名,产出
            amapAreaVal:'',//区值,产出
        };

        this.result={//产出结果
            radioName:'',
            radioVal:'',
            checkboxName:[],
            checkboxVal:[],
        };

        // this.rndNum=Math.floor(Math.random()*100);
        this.rndNum=Math.random().toString(36).substr(2);

        if(this.param.pickerClass!=='pickerPost' && window.districtSearch !== undefined) {
            this.initAmap('中国')//异步引入
        }
        this.initDom()//初始化
    };
    CommonPicker.prototype={
        initDom:function () {
            var self=this;
            var inputStart=[],
                inputChildItem=[],
                inputHtml="",
                tabStart=[],
                tabHtml="",
                tabHeadChildItem=[],
                tabBoxChildItem=[],
                innterhtml="";
            //输出框HTML
            inputStart=
                ['<div class="aMap-picker-input-box">',
                    '<i class="ico-arrow border_cort"></i>',
                    '<span class="input-placeholder">'+self.param.placeholderText+'</span>',
                    '<div class="input-area">'];
            //动态子类
            for(var i=0;i<self.param.pickerLevel.level;i++){
                inputChildItem.push('<span index="'+i+'" class="input-area-item input-area-item-'+i+'"></span>');

                if(i===0){
                    tabHeadChildItem.push('<div index="'+i+'" class="tab-head tab-head-'+i+'"><label><input checked name="tab-head-radio-'+self.rndNum+'" type="radio" value='+i+'><span>'+self.param.pickerLevel.name[i]+'</span></label></div>');
                }else {
                    tabHeadChildItem.push('<div index="'+i+'" class="tab-head tab-head-'+i+'"><label><input name="tab-head-radio-'+self.rndNum+'" type="radio" value='+i+'><span>'+self.param.pickerLevel.name[i]+'</span></label></div>');
                }

                tabBoxChildItem.push('<div index="'+i+'" class="tab-pane tab-pane-'+i+'"><div class="tab-pane-box"><p class="no-data">暂无数据</p></div></div>')
            }
            inputHtml=inputStart.concat(inputChildItem,['</div>','</div>']).join('');

            //给第一项加上属性checked
            //tab部分
            self.domMasterStr="aMap-picker-tab-"+self.rndNum
            tabStart=['<div class="aMap-picker-tab '+self.domMasterStr+'">',
                    '<div class="aMap-picker-tab-head">'];

            tabHtml=tabStart.concat(tabHeadChildItem,['</div>'],
                    ['<div class="aMap-picker-tab-pane">'],
                    tabBoxChildItem,
                    ['</div>']).join('');

            var buttons=[
                    '<div class="aMap-picker-tab-buttons">',
                        '<div class="aMap-picker-tab-box">',
                            '<span class="aMap-btn-submit">确定</span>',
                            '<span class="aMap-btn-choose-all">全选</span>',
                            '<span class="aMap-btn-cancel">取消</span>',
                        '</div>',
                    '</div>'
            ].join('');

            //区分是否弹窗浮框
            if(self.param.layPosition==='float'){//浮窗
                innterhtml=inputHtml+tabHtml+buttons+'</div>';
                self.domMaster.html(innterhtml);
                self.domMaster.find('.aMap-picker-tab').addClass('aMap-picker-tab-float')
            }else if(self.param.layPosition==='layer'){//弹窗居中
                innterhtml=inputHtml+'</div>';
                self.domMaster.html(innterhtml);
                $('body').addClass('aMap-picker-tab-out').append(tabHtml+buttons);
                if(self.param.layPosition==='layer'){
                    self.layerDom=$('.'+self.domMasterStr);
                }
                self.layerDom.addClass("aMap-picker-tab-layer").css('width',self.param.layerWidth+'px')
            }else {
                innterhtml=inputHtml+tabHtml+buttons+'</div>';
                self.domMaster.html(innterhtml);
            }

            self.domMaster.addClass('aMap-picker-area');
            self.initEvent();
        },
        
        initEvent:function () {
            var self=this;
            //点击消失，逻辑可能改成点击重置
            if(self.param.layPosition!=='layer'){//float
                $(document).mousedown(function(e){
                    if($(e.target).parents(".aMap-picker-area").length==0){
                        self.domMaster.find('.aMap-picker-tab').hide();
                        self.pickerReset()//点击面板以外就重置
                    }
                });

            }else {//layer
                $(document).mousedown(function(e){
                    if($(e.target).parents(".aMap-picker-tab").length==0 && $(e.target).parents(".aMap-picker-tab-layer").length==0){
                        self.layerDom.hide();
                        self.pickerReset()//点击面板以外就重置
                    }
                })
            }

            var tabDom;//tab事件
            if(self.param.layPosition!=='layer') {//float
                tabDom=self.domMaster.find('.aMap-picker-tab');
            }else {
                tabDom=self.layerDom;
            }

            self.domMaster.on('click','.input-area',function () {
                tabDom.show();
            });

            tabDom.on('change',"input[name='tab-head-radio-"+self.rndNum+"']",function () {
                self.tabHeadVal=$(this).val();
                tabDom.find('.tab-pane-'+self.tabHeadVal).show().siblings().hide();
                self.isShowButtons()//判断是否显示按钮
            });

            //处理省
            tabDom.on("click","input[name='tabLabel-province-"+self.rndNum+"']",function () {
                var labelName=$(this).siblings().find('i').text();
                self.domMaster.find('.input-placeholder').hide();
                self.domMaster.find('.input-area-item-0').html(labelName).siblings().html('');
                var index=$(this).parents('.tab-pane').attr('index'),next=index*1+1+'';
                //直接切换
                $("input[name='tab-head-radio-"+self.rndNum+"'][value="+next+"]").prop('checked',true).change();
                if(labelName!==self.aMapPicker.amapProvinceName){//区分是否存在
                    self.aMapPicker.amapProvinceName=labelName;
                    self.aMapPicker.amapProvinceVal=$(this).val();
                    self.pickerSearch(self.aMapPicker.amapProvinceVal);
                    //清空
                    self.aMapPicker.arrayArea=[]
                }

                self.isShowButtons();//是否显示按钮区
            });

            //处理市
            tabDom.on("click","input[name='tabLabel-city-"+self.rndNum+"']",function () {
                var labelName=$(this).siblings().text();
                self.domMaster.find('.input-placeholder').hide();
                self.domMaster.find('.input-area-item-1').html(self.param.separator+labelName);

                var index=$(this).parents('.tab-pane').attr('index'),next=index*1+1+'';
                //直接切换
                $("input[name='tab-head-radio-"+self.rndNum+"'][value="+next+"]").prop('checked',true).change();
                if(labelName!==self.aMapPicker.amapCityName){//区分是否存在
                    self.aMapPicker.amapCityName=labelName;
                    self.aMapPicker.amapCityVal=$(this).val();
                    self.pickerSearch(self.aMapPicker.amapCityVal);

                    //清空
                    self.domMaster.find('.input-area-item-2').html('');
                    self.aMapPicker.arrayArea=[]
                }

                self.isShowButtons();//是否显示按钮区
            });

            tabDom.on("click","input[type='radio'][name='tabLabel-area-"+self.rndNum+"']",function () {
                var labelName=$(this).siblings().text();
                self.domMaster.find('.input-area-item-2').html(self.param.separator+labelName);
                self.isShowButtons()
            });

            tabDom.on("click","input[type='checkbox'][name='tabLabel-area-"+self.rndNum+"']",function () {

                var array=[],
                    _that=$(this),
                    checked=_that.data().checked,
                    checkedVal=_that.next().text();
                if(!checked){
                    _that.data().checked=true;
                    self.aMapPicker.arrayArea.push(_that.next().text());
                }else {
                    _that.data().checked=false;
                    array=self.aMapPicker.arrayArea.filter(function (item) {
                        return item != checkedVal
                    });
                    self.aMapPicker.arrayArea=array;
                }

                self.isShowButtons();//是否显示按钮区

                if(self.aMapPicker.arrayArea.length!==0){//区数量
                    var arrayAreaStr=self.aMapPicker.arrayArea.join(self.param.areaSeparator);
                    self.domMaster.find('.input-area-item-2').html('<em title='+arrayAreaStr+'>'+self.param.separator+arrayAreaStr+'</em>')
                }else {
                    self.domMaster.find('.input-area-item-2').html('')
                }

            })



            //按钮-全选,只可能checkbox情况下出现
            tabDom.on("click",'.aMap-btn-choose-all',function () {
                tabDom.find("input[type='checkbox'][name='tabLabel-area-"+self.rndNum+"']").prop('checked',true).change();
                $(this).hide().siblings('.aMap-btn-cancel').css('display','inline-block')
            });

            //按钮-取消,只可能checkbox情况下出现
            tabDom.on("click",'.aMap-btn-cancel',function () {
                tabDom.find("input[type='checkbox'][name='tabLabel-area-"+self.rndNum+"']").prop('checked',false).change();
                $(this).hide().siblings('.aMap-btn-choose-all').css('display','inline-block')
            });


            //按钮-确定
            tabDom.on("click",'.aMap-btn-submit',function () {
                //打印产出,只有最后一级checked的记录

                //重置
                self.result.checkboxName=[];
                self.result.checkboxVal=[];
                self.result.radioVal='';
                self.result.radioName='';
                //找到最后一级dom,简单粗暴
                var index=tabDom.find('.tab-pane').length-1;
                var lastDom=tabDom.find('div.tab-pane-'+index);
                console.log(lastDom.find("input[type='checkbox']"))
                if(self.param.isMultiple){//多选
                    lastDom.find("input[type='checkbox']").each(function(){
                        if($(this).is(':checked')){
                            self.result.checkboxVal.push($(this).val())
                        }
                    });
                    console.log(self.result.checkboxVal)
                }else {
                    lastDom.find("input[type='radio']").each(function(){
                        if($(this).is(':checked')){
                            self.result.radioVal=$(this).val()
                        }
                    });
                    console.log(self.result.radioVal)
                }
                tabDom.hide()
            });


        },

        initAmap:function(val){
            var self=this;
            self.aMapPicker.districtSearch=window.districtSearch;
            self.pickerSearch(val)//高德特殊处理
        },

        pickerSearch:function(val){// 根据汉字、cityCode查询下一级信息
            var self=this;
            self.aMapPicker.districtSearch.search(val, function(status, result) {
                if(status=='complete' && result.districtList.length===1){
                    self.aMapPicker.districtListNext=result.districtList[0].districtList;//下一TAB展示数据
                    self.aMapPicker.thisLevel=result.districtList[0].level;//上一级别等级

                    if(self.aMapPicker.thisLevel=='country' && self.aMapPicker.onceLoad){//页面载入第一次使用，省数据
                        self.updateProvince()
                    }

                    if(self.aMapPicker.thisLevel=='province'){//市数据
                        self.updateCity()
                    }

                    if(self.aMapPicker.thisLevel=='city'){//区数据
                        self.updateArea()
                    }

                }else {
                    alert('返回错误!')
                }
            })
        },

        updateArea:function(){
            var self=this;
            var areaData=self.aMapPicker.districtListNext;
            areaData.sort(function (a, b) {//按名称长短
                return a.name.length-b.name.length
            });
            self.renderArea(areaData,self.param.areaType);
            if(self.param.areaType=='checkbox'){
                $('input[type="checkbox"][name="tabLabel-area-'+self.rndNum+'"]').data({checked:false})
            }
        },

        renderArea:function(data){
            var self=this;

            var tabDom;//tab事件
            if(self.param.layPosition!=='layer') {//float
                tabDom=self.domMaster.find('.aMap-picker-tab');
            }else {
                tabDom=self.layerDom;
            }

            var areaDom=tabDom.find('.tab-pane-2');
            self.domMaster.find('.tab-head-2 input').prop('checked',true).change();//tab head
            areaDom.show().siblings().hide();
            var interHtml=[];
            //区分单选多选
            if(self.param.areaType=='radio'){
                for(var i=0;i<data.length;i++){
                    interHtml.push('<label><input name="tabLabel-area-'+self.rndNum+'" type="radio" value='+data[i].adcode+'><span>'+data[i].name+'</span></label>');
                }
            }else {
                for(var i=0;i<data.length;i++){
                    interHtml.push('<label><input name="tabLabel-area-'+self.rndNum+'" type="checkbox" value='+data[i].adcode+'><span>'+data[i].name+'</span></label>');
                }
            }
            areaDom.find('.tab-pane-box').html(interHtml.join(''))
        },

        updateCity:function(){
            var self=this;
            var cityData=self.aMapPicker.districtListNext;
            cityData.sort(function (a, b) {//按名称长短
                return a.name.length-b.name.length
            });
            self.renderCity(cityData)
        },

        renderCity:function(data){
            var self=this;
            var tabDom;//tab事件
            if(self.param.layPosition!=='layer') {//float
                tabDom=self.domMaster.find('.aMap-picker-tab');
            }else {
                tabDom=self.layerDom;
            }

            var cityDom=tabDom.find('.tab-pane-1');
            self.domMaster.find('.tab-head-1 input').prop('checked',true).change();//tab head
            cityDom.show().siblings().hide();
            var interHtml=[];
            for(var i=0;i<data.length;i++){
                interHtml.push('<label><input name="tabLabel-city-'+self.rndNum+'" type="radio" value='+data[i].adcode+'><span>'+data[i].name+'</span></label>');
            }
            cityDom.find('.tab-pane-box').html(interHtml.join(''))
        },

        updateProvince:function(){
            var self=this;
            var provinceData=self.aMapPicker.districtListNext;
            self.aMapPicker.onceLoad=false;//只用一次

            sortChinese(provinceData,'name');//排序

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
                    self.aMapPicker.specialCityList.push(item)
                }else {
                    self.aMapPicker.provinceList.push(item);
                }

            });

            self.aMapPicker.specialCityList.sort(function(a,b){
                return (a.citycode)*1-(b.citycode)*1
            });
            self.renderProvince(self.aMapPicker.provinceList,self.aMapPicker.specialCityList);

        },

        renderProvince:function(dataA,dataB){//处理省
            var self=this;
            var alphabet=['A','F','G','H','J','L','N','Q','S','X','Y','Z'];//字母表
            //省处理
            var htmlChild=[],htmlChildStr;
            for(var i=0;i<alphabet.length;i++){
                var dataSame=dataA.filter(function (value) {
                    return value.letter==alphabet[i]
                });
                var interHtml=[];
                for(var n=0;n<dataSame.length;n++){
                    var provinceName=dataSame[n].name;
                    if(provinceName.length === 2){
                        provinceName='<i class="space-letter">'+provinceName+'</i>'
                    }else {
                        provinceName='<i>'+provinceName+'</i>'
                    }
                    interHtml.push('<label><input name="tabLabel-province-'+self.rndNum+'" type="radio" value='+dataSame[n].adcode+'><span>'+provinceName+'</span></label>');
                }
                var outerHtml=['<dl>',
                    '<dt name='+alphabet[i]+'>',
                    alphabet[i],
                    '</dt>',
                    '<dd>','</dd>',
                    '</dl>'];
                outerHtml.splice(5,0,interHtml.join(''));
                htmlChild.push(outerHtml.join(''))
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
                    cities.push('<label><input name="tabLabel-province-'+self.rndNum+'" type="radio" value='+item.adcode+'><span>'+cityName+'</span></label>')
                }else {
                    cities.push('<label title="未开通地区"><input name="tabLabel-province-'+self.rndNum+'" disabled type="radio" value='+item.adcode+'><span>'+cityName+'</span></label>')
                }
            });
            cityStr='<dl class="special-city">'+'<dt>'+'</dt>'+'<dd>'+cities.join('')+'</dd>'+'</dl>';
            htmlChildStr=cityStr+htmlChild.join('');

            //区分是否layer
            if(self.param.layPosition!=='layer'){
                self.domMaster.find('.tab-pane-0').addClass('tab-pane-province').find('.tab-pane-box').html(htmlChildStr)
            }else {
                self.layerDom.find('.tab-pane-0 ').addClass('tab-pane-province').find('.tab-pane-box').html(htmlChildStr)
            }
        },

        pickerReset:function (){//重置

        },

        isShowButtons:function () {
            var self=this;
            var tabDom;//tab事件
            if(self.param.layPosition!=='layer') {//float
                tabDom=self.domMaster.find('.aMap-picker-tab');
            }else {
                tabDom=self.layerDom;
            }

            //先判断是不是最后一级
            if(self.param.pickerLevel.name.length===self.tabHeadVal*1+1){
                tabDom.find('.aMap-picker-tab-buttons').show()
            }else {
                tabDom.find('.aMap-picker-tab-buttons').hide();
            }


            //单、多选逻辑判断是否有全选按钮
            if(self.param.isMultiple){
                tabDom.find('.aMap-btn-choose-all').show();
            }else {
                tabDom.find('.aMap-btn-choose-all').hide();
            }

            
        },

    };

    $.fn.commonPicker = function (params) {
        var picker = new CommonPicker(this, params);
        return picker;
    };

    function sortChinese(arr, dataLeven) {
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

})(jQuery,window,document);

