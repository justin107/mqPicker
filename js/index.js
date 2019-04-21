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
                    level:3,//设置级别，控制按钮等逻辑，默认省市区3级
                },
                pickerClass:'pickerArea',// pickerArea,默认省市区，
                                         // pickerCity,默认省市,
                                         // pickerAreaPost,省市自定义区
                                         // pickerPost,只接受POST自定义数据，单级选择
                isMultiple:true,//转义是否单、多选
        };
        this.param = $.extend(this.param, params);
        this.param.areaType=this.param.isMultiple?'checkbox':'radio';//单、多选，单选radio

        if(this.param.pickerClass!=='pickerPost') {
            console.log(window.AMap)
            if(window.AMap === undefined) this.initAmap()//异步开始
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

            var rndNum=Math.floor(Math.random()*100);

            //输出框HTML
            inputStart=
                ['<div class="aMap-picker-input-box">',
                    '<i class="ico-arrow border_cort"></i>',
                    '<span class="input-placeholder">'+self.param.placeholderText+'</span>',
                    '<div class="input-area">'];
            //动态子类
            for(var i=0;i<self.param.pickerLevel.level;i++){
                inputChildItem.push('<span class="input-area-item-'+i+'"></span>');
                if(i===0){
                    tabHeadChildItem.push('<div class="tab-head-'+i+'"><label><input checked name="tab-head-radio-'+rndNum+'" type="radio" value='+i+'><span>'+self.param.pickerLevel.name[i]+'</span></label></div>');
                }else {
                    tabHeadChildItem.push('<div class="tab-head-'+i+'"><label><input name="tab-head-radio-'+rndNum+'" type="radio" value='+i+'><span>'+self.param.pickerLevel.name[i]+'</span></label></div>');
                }

                tabBoxChildItem.push('<div class="tab-pane-'+i+'"><div class="tab-pane-box"><p class="no-data">暂无数据</p></div></div>')
            }
            inputHtml=inputStart.concat(inputChildItem,['</div>','</div>']).join('');

            //给第一项加上属性checked
            //tab部分
            self.domMasterStr="aMap-picker-tab-"+rndNum
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

            if(self.param.layPosition!=='layer'){//float
                $(document).mousedown(function(e){
                    if($(e.target).parents(".aMap-picker-area").length==0){
                        self.domMaster.find('.aMap-picker-tab').hide();
                        self.pickerReset()//点击面板以外就重置
                    }
                });

                self.domMaster.on('click','.input-area',function () {
                    self.domMaster.find('.aMap-picker-tab').show()
                });

            }else {//layer
                $(document).mousedown(function(e){
                    if($(e.target).parents(".aMap-picker-tab").length==0 && $(e.target).parents(".aMap-picker-tab-layer").length==0){
                        self.layerDom.hide();
                        self.pickerReset()//点击面板以外就重置
                    }
                })

                self.domMaster.on('click','.input-area',function () {
                    self.layerDom.show();
                });

            }
        },


        initAmap:function(){
            var self=this;
            //高德相关
            function loadAmapApi(amapKey,amapVersion) {
                if(!amapKey) amapKey='';
                if(!amapVersion) amapVersion='1.4.14';
                var amapApiUrl = 'https://webapi.amap.com/maps?v='+amapVersion+'&key='+amapKey+'&callback=apiLoad',//加载JS api
                    jsapi = document.createElement('script');

                jsapi.charset = 'utf-8';
                jsapi.src = amapApiUrl;
                document.head.appendChild(jsapi);
            }

            loadAmapApi('7a83c014e37800a4ecb7193e306b67ba');

            window.apiLoad=function (){
                window.AMap=AMap;
                console.log(window.AMap)
                AMap.plugin('AMap.DistrictSearch', function () {
                    self.districtSearch = new AMap.DistrictSearch({
                        level: 'country',// 关键字对应的行政区级别，country表示国家
                        subdistrict: 1,//  显示下级行政区级数，1表示返回下一级行政区
                    });
                    console.log('AMap.plugin complete')
                });
            }
        },




        pickerSearch:function(val){// 根据汉字、cityCode查询下一级信息
            var self=this;
            console.log(AMap)


        },



        pickerReset:function () {

        },


    };
    $.fn.commonPicker = function (params) {
        var picker = new CommonPicker(this, params);
        return picker;
    };
})(jQuery,window,document);

