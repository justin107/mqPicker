
    var MqPicker = function (setting) {
        //可配参数
        this.param = {
            domMaster: null,//传入DOM
            placeholderText: '请输入省/市/区',
            layPosition: 'float',//tab弹窗位置,float,//悬浮，
                                 // no-float,相对,
                                 // layer,页面正中，须指定面板宽度
            layerWidth: 500,//控制layer时TAB宽度
            // 填写必须是pickerArea、pickerCity、pickerCityArea、pickerAreaPost
            searchName: '中国',//默认起始行政数据
            lastIsMultiple: false,//最后一级是否单、多选,默认最后一级单选
            pickerClass: 'pickerArea',// pickerArea,默认省市区，
            // pickerCity,默认省市,
            // pickerCityArea,默认市区,
            // pickerAreaPost,省市自定义区
            // pickerPost,只接受POST自定义数据，单级选择
            pickerLevel: {
                name: ['省', '市', '区'],
            },
            separator: '，',//省市间隔符号
            areaSeparator: '、',//区字符间隔,
            output: 'value',//默认value,最后一级value
            //allName,全部名称
            //allValue,全部value
            //产出name,最后一级名称

        };
        $.extend(this.param, setting);
        //内部数据
        //转义
        this.domMaster = $(this.param.domMaster);
        this.levelNum = this.param.pickerLevel.name.length;
        //单、多选，单选radio,最后一级别
        this.param.areaType = this.param.lastIsMultiple ? 'checkbox' : 'radio';
        this.onceLoad = true;//是否初次加载，省数据不用重复请求
        this.isLastDom = false;//考虑一下优化
        this.tabData = [];//

        this.rndNum = Math.random().toString(36).substr(2);//随机数
        this.tabHeadVal = '0';
        this.outName = '';
        this.outValue = '';
        this.init();
    };

    $.extend(MqPicker.prototype, {
        init: function () {
            var self = this;
            self.initData();
            self.initDom();
        },

        initDom: function () {
            var self = this,
                inputChildItem = [],//input内子元素
                tabHeadChildItem = [],//tab head子元素
                tabBoxChildItem = [],//tab box内元素
                innterHtml = '';

            //动态子类
            for (var i = 0; i < self.levelNum; i++) {
                inputChildItem.push('<span index="' + i + '" class="input-area-item input-area-item-' + i + '"></span>');

                if (i === 0) {//给第一项加上属性checked
                    tabHeadChildItem.push('<div index="' + i + '" class="tab-head tab-head-' + i + '"><label><input checked name="tab-head-radio-' + self.rndNum + '" type="radio" value=' + i + '><span>' + self.param.pickerLevel.name[i] + '</span></label></div>');
                } else {
                    tabHeadChildItem.push('<div index="' + i + '" class="tab-head tab-head-' + i + '"><label><input name="tab-head-radio-' + self.rndNum + '" type="radio" value=' + i + '><span>' + self.param.pickerLevel.name[i] + '</span></label></div>');
                }

                tabBoxChildItem.push('<div index="' + i + '" class="tab-pane tab-pane-' + i + '"><div class="tab-pane-box"><p class="no-data">暂无数据</p></div></div>')
            }

            var inputHtml = ['<div class="aMap-picker-input-box">',
                '<i class="ico-arrow"></i>',
                '<span class="input-placeholder">' + self.param.placeholderText + '</span>',
                '<div class="input-area">'].concat(inputChildItem, ['</div>', '</div>']).join('');

            var tabStr = "aMap-picker-tab-" + self.rndNum;
            var tabHtml = ['<div class="aMap-picker-tab ' + tabStr + '">',
                '<div class="aMap-picker-tab-head">'].concat(tabHeadChildItem, ['</div>'],
                ['<div class="aMap-picker-tab-pane">'],
                tabBoxChildItem,
                ['</div>']).join('');
            var buttons = [
                '<div class="aMap-picker-tab-buttons">',
                '<div class="aMap-picker-tab-box">',
                '<span class="aMap-btn-submit">确定</span>',
                '<span class="aMap-btn-choose-all">全选</span>',
                '<span class="aMap-btn-cancel">取消</span>',
                '</div>',
                '</div>'
            ].join('');

            //区分是否弹窗浮框
            if (self.param.layPosition === 'float') {//浮窗
                innterHtml = inputHtml + tabHtml + buttons + '</div>';
                self.domMaster.html(innterHtml);
                self.domMaster.find('.aMap-picker-tab').addClass('aMap-picker-tab-float')
            } else if (self.param.layPosition === 'layer') {//弹窗居中
                innterHtml = inputHtml + '</div>';
                self.domMaster.html(innterHtml);
                $('body').addClass('aMap-picker-tab-out').append(tabHtml + buttons);
                self.layerDom = $('.' + tabStr);
                self.layerDom.addClass("aMap-picker-tab-layer").css('width', self.param.layerWidth + 'px')
            } else {//no-float
                innterHtml = inputHtml + tabHtml + buttons + '</div>';
                self.domMaster.html(innterHtml);
            }
            self.domMaster.addClass('aMap-picker-area');

            if (self.param.layPosition !== 'layer') {//float
                self.tabDom = self.domMaster.find('.aMap-picker-tab');
            } else {
                self.tabDom = self.layerDom;
            }
            self.initEvent();
        },

        initData: function () {
            var self = this;
            self.tabHeadVal = '0';
            for (var i = 0; i < self.levelNum; i++) {
                self.tabData[i] = {name: '', value: "", data: []};
                if (self.param.lastIsMultiple) {
                    self.tabData[self.levelNum - 1] = {name: [], value: [], data: []}
                }
            }
        },
        initEvent: function () {
            var self = this,
                levelNum = self.levelNum,
                lastIndex = levelNum - 1,
                lastData = self.tabData[lastIndex];

            if (self.param.pickerClass !== 'pickerPost') {
                self.pickerSearch(self.param.searchName)
            } else {



                // var postData=self.param.loadAjax();
                // console.log(postData)
                // self.updateArea(postData)
            }

            //点击消失，逻辑可能改成点击重置
            if (self.param.layPosition !== 'layer') {//float
                $(document).mousedown(function (e) {
                    if ($(e.target).parents(".aMap-picker-area").length === 0) {
                        self.domMaster.find('.aMap-picker-tab').hide();
                        //self.pickerReset()//点击面板以外就重置
                        self.isPlaceholder();
                        self.domMaster.find('.ico-arrow').removeClass('activeMove')
                    }
                });

            } else {//layer
                $(document).mousedown(function (e) {
                    if ($(e.target).parents(".aMap-picker-tab").length === 0 && $(e.target).parents(".aMap-picker-tab-layer").length === 0) {
                        self.tabDom.hide();
                        //self.pickerReset()//点击面板以外就重置
                        self.isPlaceholder();
                        self.domMaster.find('.ico-arrow').removeClass('activeMove')
                    }
                })
            }

            self.domMaster.on('click', '.aMap-picker-input-box', function () {
                self.tabDom.show();
                self.domMaster.find('.ico-arrow').addClass('activeMove')

                // if(self.param.pickerClass === 'pickerPost'){
                //     self.param.loadAjax()
                //     .done(function (data) {
                //         console.log("数据", data.data);
                //         self.updateArea(data.data)
                //     });
                // }
            });

            // self.domMaster.on('click', '.input-area', function () {
            //     //如果有值先备份一份
            //     self.tabDom.show();
            //     self.domMaster.find('.ico-arrow').addClass('activeMove')
            // });
            //
            // self.domMaster.on('click', '.input-placeholder', function () {
            //     self.tabDom.show();
            //     self.domMaster.find('.ico-arrow').addClass('activeMove')
            // });
            //
            // self.domMaster.on('click', '.ico-arrow', function () {
            //     self.tabDom.show();
            //     self.domMaster.find('.ico-arrow').addClass('activeMove')
            // });

            self.tabDom.on('change', "input[name='tab-head-radio-" + self.rndNum + "']", function () {
                self.tabHeadVal = $(this).val();
                self.tabDom.find('.tab-pane-' + self.tabHeadVal).show().siblings().hide();

                self.isShowButtons()//判断是否显示按钮
            });

            for (var i = 0; i < levelNum; i++) {
                self.tabDom.on("click", "input[type='radio'][name='tabLabel-area-" + i + "-" + self.rndNum + "']", function () {
                    var labelName = $(this).siblings().text(),
                        labelVal = $(this).val();

                    var inputItem = self.domMaster.find('.input-area-item-' + self.tabHeadVal + '');
                    if (self.tabHeadVal == 0) {
                        inputItem.html(labelName);
                    } else {
                        inputItem.html(self.param.separator + labelName);
                    }

                    var index = $(this).parents('.tab-pane').attr('index') * 1,
                        nextIndex = index + 1 + '';

                    //判断是否最后一个
                    if (lastIndex != index) {//不是
                        $("input[name='tab-head-radio-" + self.rndNum + "'][value=" + nextIndex + "]")
                            .prop('checked', true).change();
                        //区分是否存在
                        if (labelName !== self.tabData[index].name) {
                            self.tabData[index].name = labelName;
                            self.tabData[index].value = labelVal;

                            //清空下一级dom
                            self.domMaster.find('.input-area-item-' + index).nextAll().html('');
                            var level = $(this).parent().attr('level');
                            if (self.param.pickerClass === 'pickerAreaPost' && level === "city") {
                                self.param.loadAjax({name: labelName})
                                    .done(function (data) {
                                        console.log("数据", data.data);
                                        self.updateArea(data.data)
                                    });
                            } else {
                                self.pickerSearch(labelName);//默认请求
                            }
                        }

                        //重置下一级数据
                        for (var m = nextIndex; m < levelNum; m++) {
                            self.tabData[m].name = '';
                            self.tabData[m].value = '';
                        }
                        if (self.param.lastIsMultiple && lastIndex + 1 === levelNum) {
                            self.tabData[nextIndex].name = [];
                            self.tabData[nextIndex].value = [];
                        }

                    } else {//是最后一级
                        self.tabData[index].name = labelName;
                        self.tabData[index].value = labelVal;
                    }
                    self.isShowButtons();
                    self.isPlaceholder();
                });
            }

            self.tabDom.on("click", "input[type='checkbox'][name='tabLabel-area-" + lastIndex + "-" + self.rndNum + "']", function () {
                var arrayName = [], arrayVal = [],
                    _that = $(this),
                    checked = _that.data().checked,
                    checkedName = _that.next().text(),
                    checkedVal = _that.val();
                if (!checked) {
                    _that.data().checked = true;
                    self.tabData[lastIndex].name.push(checkedName);
                    self.tabData[lastIndex].value.push(checkedVal)
                } else {//移除
                    _that.data().checked = false;
                    arrayName = self.tabData[self.levelNum - 1].name.filter(function (item) {
                        return item != checkedName
                    });
                    arrayVal = self.tabData[self.levelNum - 1].value.filter(function (item) {
                        return item != checkedVal
                    });
                    self.tabData[self.levelNum - 1].name = arrayName;
                    self.tabData[self.levelNum - 1].value = arrayVal;
                }
                var lastInputItem = self.domMaster.find('.input-area-item:last');
                if (self.tabData[self.levelNum - 1].name.length !== 0) {//区数量
                    var arrayAreaStr = self.tabData[self.levelNum - 1].name.join(self.param.areaSeparator);

                    if (lastIndex === 0) {
                        lastInputItem.html('<em title=' + arrayAreaStr + '>' + arrayAreaStr + '</em>')
                    } else {
                        lastInputItem.html('<em title=' + arrayAreaStr + '>' + self.param.separator + arrayAreaStr + '</em>')
                    }
                } else {
                    lastInputItem.html('')
                }
                self.isShowButtons();//是否显示按钮区
                self.isPlaceholder();
            });

            //多选逻辑只会是唯一或最后一级
            //按钮-全选,只可能checkbox情况下出现
            self.tabDom.on("click", '.aMap-btn-choose-all', function () {
                self.tabDom.find(".tab-pane:last input[type='checkbox']")
                    .prop('checked', true).change().data({checked: true});
                self.tabData[lastIndex].value = [];
                self.tabData[lastIndex].name = [];

                var lastDom = self.tabDom.find('div.tab-pane:last');

                lastDom.find("input[type='checkbox']").each(function () {
                    if ($(this).is(':checked')) {
                        self.tabData[lastIndex].value.push($(this).val());
                        self.tabData[lastIndex].name.push($(this).next().text())
                    }
                });
                var lastInputItem = self.domMaster.find('.input-area-item:last');
                if (lastIndex !== 0) {//不是唯一
                    lastInputItem.html(self.param.separator + self.tabData[lastIndex].name.join(self.param.areaSeparator));
                } else {//唯一
                    lastInputItem.html(self.tabData[lastIndex].name.join(self.param.areaSeparator));
                }
                $(this).hide().siblings('.aMap-btn-cancel').show();//和取消按钮互斥
            });

            //按钮-取消,只可能checkbox情况下出现
            self.tabDom.on("click", '.aMap-btn-cancel', function () {
                self.tabDom.find(".tab-pane:last input[type='checkbox']")
                    .prop('checked', false).change().data({checked: false});
                self.outClear();//重置输出
                self.tabData[lastIndex].name = [];
                self.tabData[lastIndex].value = [];
                self.domMaster.find('.input-area-item:last').html('');
                $(this).hide().siblings('.aMap-btn-choose-all').show();//和全选互斥
                self.isPlaceholder();
            });

            //按钮-确定
            self.tabDom.on("click", '.aMap-btn-submit', function () {
                //打印产出所有记录
                console.log('tabData', self.tabData);
                //output:'value',//默认value,最后一级value
                //allName,全部名称
                //allValue,全部value
                //产出name,最后一级名称
                self.outClear();//重置输出
                //重新查询获取
                if (self.param.output === 'value') {
                    if (self.param.lastIsMultiple) {
                        self.outValue = lastData.value.join(self.param.separator);
                    } else {
                        self.outValue = lastData.value;
                    }
                } else if (self.param.output === 'name') {
                    if (self.param.lastIsMultiple) {
                        self.outName = lastData.name.join(self.param.separator);
                    } else {
                        self.outName = lastData.name;
                    }
                }
                self.tabDom.hide()
            });

        },

        outClear: function () {
            var self = this;
            self.outValue = "";
            self.outName = "";
        },

        isShowButtons: function () {//是否显示按钮组
            var self = this,
                buttons = self.tabDom.find('.aMap-picker-tab-buttons'),
                chooseAll = self.tabDom.find('.aMap-btn-choose-all'),
                cancelAll = self.tabDom.find('.aMap-btn-cancel'),
                lastData = self.tabData[self.levelNum - 1];
            self.isLastDom = self.levelNum === (self.tabHeadVal * 1 + 1) ? true : false;//判断是否是最后一级
            if (self.isLastDom) {
                //单、多选逻辑判断是否有全选按钮
                if (self.param.lastIsMultiple) {//多选
                    lastData.name.length === 0 ? buttons.hide() : buttons.show();//未选
                    if (lastData.name.length === lastData.data.length) {//全选
                        cancelAll.show();
                        chooseAll.hide();
                    } else {
                        cancelAll.hide();
                        chooseAll.show();
                    }
                } else {//单选
                    chooseAll.hide();
                    cancelAll.hide();
                    lastData.name != '' ? buttons.show() : buttons.hide();
                }
            } else {
                buttons.hide()
            }
        },

        isPlaceholder: function () {//是否显示提示
            var self = this,
                placeholder = self.domMaster.find('.input-placeholder');

            if (self.tabDom.find('.tab-pane-box :checked').length === 0) {
                placeholder.show()
            } else {
                placeholder.hide()
            }
        },


        pickerSearch: function (name, indexEdit, editArray) {
            //兼顾自定义接口，所以数据都存在tabData里
            var self = this;
            var districtListNext,
                index = indexEdit * 1 || self.tabHeadVal * 1,
                indexData = self.tabData[index],
                val = name || indexData.value;
            window.districtSearch.search(val, function (status, result) {
                if (status == 'complete' && result.districtList.length === 1) {
                    districtListNext = result.districtList[0].districtList;
                    var thisLevel = result.districtList[0].level;//上一级别等级
                    // console.log(val,districtListNext);
                    if (thisLevel == 'country' && self.onceLoad) {//页面载入第一次使用，行政省数据,
                        indexData.data = districtListNext;
                        self.updateProvince(districtListNext)
                    } else {//行政其它
                        if (indexEdit) {
                            self.updateArea(districtListNext, indexEdit, editArray[index])
                        } else {
                            self.updateArea(districtListNext); //通用方法
                        }

                    }
                } else {
                    console.log(status, result);
                    if (self.param.pickerErrors) {
                        self.param.pickerErrors();
                    } else {
                        alert('返回错误!')
                    }
                    self.pickerReset();//重置
                }
            })

        },

        updateProvince: function (data) {
            var self = this,
                specialCityList = [],
                provinceList = [],
                provinceData = data;
            self.onceLoad = false;//只用一次
            sortChinese(provinceData, 'name');//排序
            //处理直辖市和简称问题
            provinceData.forEach(function (item, index) {
                if (item.adcode === "450000") {
                    item.name = '广西';
                    item.letter = 'G'
                } else if (item.adcode === "650000") {
                    item.name = '新疆';
                    item.letter = 'X'
                } else if (item.adcode === "540000") {
                    item.name = '西藏';
                    item.letter = 'X'
                } else if (item.adcode === "640000") {
                    item.name = '宁夏';
                    item.letter = 'N'
                } else if (item.adcode === "810000") {
                    item.name = '香港';
                    item.letter = 'X'
                } else if (item.adcode === "150000") {
                    item.name = '内蒙古';
                    item.letter = 'N'
                } else if (item.adcode === "820000") {
                    item.name = '澳门';
                    item.letter = 'A'
                } else if (item.adcode === "230000") {
                    item.name = '黑龙江';
                    item.letter = 'H'
                } else if (item.adcode === "340000") {//安徽
                    item.letter = 'A'
                } else if (item.adcode === "110000") {//北京
                    item.letter = 'B'
                } else if (item.adcode === "500000") {//重庆
                    item.letter = 'C'
                } else if (item.adcode === "350000") {//福建
                    item.letter = 'F'
                } else if (item.adcode === "620000") {//甘肃
                    item.letter = 'G'
                } else if (item.adcode === "440000") {//广东
                    item.letter = 'G'
                } else if (item.adcode === "520000") {//贵州
                    item.letter = 'G'
                } else if (item.adcode === "460000") {//海南
                    item.letter = 'H'
                } else if (item.adcode === "130000") {//河北
                    item.letter = 'H'
                } else if (item.adcode === "410000") {//河南
                    item.letter = 'H'
                } else if (item.adcode === "420000") {//湖北
                    item.letter = 'H'
                } else if (item.adcode === "430000") {//湖南
                    item.letter = 'H'
                } else if (item.adcode === "220000") {//吉林
                    item.letter = 'J'
                } else if (item.adcode === "320000") {//江苏
                    item.letter = 'J'
                } else if (item.adcode === "360000") {//江西
                    item.letter = 'J'
                } else if (item.adcode === "210000") {//辽宁
                    item.letter = 'L'
                } else if (item.adcode === "630000") {//青海
                    item.letter = 'Q'
                } else if (item.adcode === "370000") {//山东
                    item.letter = 'S'
                } else if (item.adcode === "140000") {//山西
                    item.letter = 'S'
                } else if (item.adcode === "610000") {//陕西
                    item.letter = 'S'
                } else if (item.adcode === "310000") {//上海
                    item.letter = 'S'
                } else if (item.adcode === "510000") {//四川
                    item.letter = 'S'
                } else if (item.adcode === "710000") {//台湾
                    item.letter = 'T'
                } else if (item.adcode === "120000") {//天津
                    item.letter = 'T'
                } else if (item.adcode === "530000") {//云南
                    item.letter = 'Y'
                } else if (item.adcode === "330000") {//浙江
                    item.letter = 'Z'
                }

                if (isString(item.citycode)) {//分离省和特别市
                    specialCityList.push(item)
                } else {
                    provinceList.push(item);
                }

            });
            specialCityList.sort(function (a, b) {
                return (a.citycode) * 1 - (b.citycode) * 1
            });
            self.renderProvince(provinceList, specialCityList);
        },

        renderProvince: function (dataA, dataB) {//处理省
            var self = this,
                alphabet = ['A', 'F', 'G', 'H', 'J', 'L', 'N', 'Q', 'S', 'X', 'Y', 'Z'];//字母表
            //省处理
            var htmlChild = [], htmlChildStr;
            for (var i = 0; i < alphabet.length; i++) {
                var dataSame = dataA.filter(function (value) {
                    return value.letter == alphabet[i]
                });
                var interHtml = [];
                for (var n = 0; n < dataSame.length; n++) {
                    var provinceName = dataSame[n].name;
                    if (provinceName.length === 2) {
                        provinceName = '<i class="space-letter">' + provinceName + '</i>'
                    } else {
                        provinceName = '<i>' + provinceName + '</i>'
                    }
                    interHtml.push('<label><input name="tabLabel-area-' + self.tabHeadVal + '-' + self.rndNum + '" type="radio" value=' + dataSame[n].adcode + '><span>' + provinceName + '</span></label>');
                }
                var outerHtml = ['<dl>',
                    '<dt name=' + alphabet[i] + '>',
                    alphabet[i],
                    '</dt>',
                    '<dd>', '</dd>',
                    '</dl>'];
                outerHtml.splice(5, 0, interHtml.join(''));
                htmlChild.push(outerHtml.join(''))
            }
            //直辖市处理
            var cities = [], cityStr;
            dataB.forEach(function (item, index) {
                var cityName = item.name;
                if (cityName.length === 2) {
                    cityName = '<i class="space-letter">' + cityName + '</i>'
                } else {
                    cityName = '<i>' + cityName + '</i>'
                }
                if (item.adcode * 1 < 710000) {//台湾710000，大于它的都用不上
                    cities.push('<label><input name="tabLabel-area-' + self.tabHeadVal + '-' + self.rndNum + '" type="radio" value=' + item.adcode + '><span>' + cityName + '</span></label>')
                } else {
                    cities.push('<label title="未开通地区"><input name="tabLabel-area-' + self.tabHeadVal + '-' + self.rndNum + '" disabled type="radio" value=' + item.adcode + '><span>' + cityName + '</span></label>')
                }
            });
            cityStr = '<dl class="special-city">' + '<dt>' + '</dt>' + '<dd>' + cities.join('') + '</dd>' + '</dl>';
            htmlChildStr = cityStr + htmlChild.join('');

            var provinceDom = self.tabDom.find('.tab-pane:first').addClass('tab-pane-province').find('.tab-pane-box');
            provinceDom.html(htmlChildStr)
        },


        //通用方法渲染TABBOX
        updateArea: function (data, indexEdit, val) {
            var self = this;

            var areaData = data,
                index = indexEdit * 1 || self.tabHeadVal * 1,
                indexData = self.tabData[index];
            areaData.sort(function (a, b) {//按名称长短
                return a.name.length - b.name.length
            });
            //为自定义添加转义adcode=value
            if (self.param.pickerClass === 'pickerPost' || self.param.pickerClass === 'pickerAreaPost') {
                areaData.forEach(function (item) {
                    item.adcode = item.adcode || item.value;
                    item.level = item.level || "";
                })
            }

            indexData.data = areaData;
            self.renderArea(areaData, indexEdit, val);
            console.log(areaData)
        },

        renderArea: function (data, indexEdit, val) {
            var self = this;
            var index = indexEdit * 1 || self.tabHeadVal * 1;
            var areaDom = self.tabDom.find('.tab-pane-' + index);
            self.domMaster.find('.tab-head-' + index + ' input')
                .prop('checked', true).change();//tab head
            areaDom.show().siblings().hide();
            var interHtml = [];
            self.isLastDom = self.levelNum === (index + 1) ? true : false;//判断是否是最后一级
            //区分是否最后一个
            if (self.isLastDom) {
                //区分单选多选
                if (self.param.areaType === 'radio') {
                    for (var i = 0; i < data.length; i++) {
                        interHtml.push('<label><input name="tabLabel-area-' + index + '-' + self.rndNum + '" type="radio" value=' + data[i].adcode + '><span>' + data[i].name + '</span></label>');
                    }
                } else {
                    for (var i = 0; i < data.length; i++) {
                        interHtml.push('<label><input name="tabLabel-area-' + index + '-' + self.rndNum + '" type="checkbox" value=' + data[i].adcode + '><span>' + data[i].name + '</span></label>');
                    }
                }
            } else {
                for (var i = 0; i < data.length; i++) {
                    interHtml.push('<label level=' + data[i].level + '><input name="tabLabel-area-' + index + '-' + self.rndNum + '" type="radio" value=' + data[i].adcode + '><span>' + data[i].name + '</span></label>');
                }
            }

            areaDom.find('.tab-pane-box').html(interHtml.join(''));

            if (self.isLastDom && self.param.lastIsMultiple) {
                $('.tab-pane:last input[type="checkbox"]').data({checked: false})
            }


            //回写数据，先处理省市区单选逻辑应急
            if (indexEdit) {
                if (self.param.lastIsMultiple && self.isLastDom) {
                    let textArray = [];
                    for (var i = 0; i < val.length; i++) {
                        let checkeds = self.tabDom.find("[name='tabLabel-area-" + index + "-" + self.rndNum + "'][value='" + val[i] + "']")
                        checkeds.prop('checked', true).data({checked: true});
                        textArray.push(checkeds.siblings().text());
                    }

                    if (index) {
                        self.domMaster.find('.input-area-item').eq(index).html(self.param.separator + textArray.join(self.param.areaSeparator));
                    } else {
                        self.domMaster.find('.input-area-item').eq(index).html(textArray.join(self.param.areaSeparator));
                    }
                    self.tabData[index].value = val;
                    self.tabData[index].name = textArray;

                } else {
                    self.tabDom.find("[name='tabLabel-area-" + index + "-" + self.rndNum + "'][value='" + val + "']").prop('checked', true);
                    var text = self.tabDom.find("[name='tabLabel-area-" + index + "-" + self.rndNum + "'][value='" + val + "']").siblings().text();


                    if (index) {
                        self.domMaster.find('.input-area-item').eq(index).html(self.param.separator + text);
                    } else {
                        self.domMaster.find('.input-area-item').eq(index).html(text);
                    }

                    self.tabData[index].value = val;
                    self.tabData[index].name = text;
                }
            }

        },
        //重置
        pickerReset: function () {
            var self = this;
            self.tabDom.find('input').prop('checked', false);
            self.tabDom.find('.tab-head:first input').prop('checked', true).change();
            self.tabDom.find('.tab-pane:first').show().siblings().find('.tab-pane-box').html('<p class="no-data">暂无数据</p>');

            self.initData();

            self.domMaster.find('.aMap-picker-tab-buttons').hide();
            self.domMaster.find('.input-area-item').html("");
            self.domMaster.find('.input-placeholder').show();
        },

        pickerRewrite(array) {
            var self = this;
            self.pickerReset()//重置下先
            //暂定是省市区单、多选的
            console.log(array);
            if (self.param.pickerClass === 'pickerPost') {//单接口自定义
                self.domMaster.find('.input-placeholder').hide();
                self.param.loadAjax({name: array})
                    .done(function (data) {
                        console.log("数据", data.data);
                        self.updateArea(data.data, "0", array)
                    });
            } else {
                self.domMaster.find('.input-placeholder').hide();
                //默认省已加载，所以排除0,直接赋值省
                self.tabDom.find("[name='tabLabel-area-0-" + self.rndNum + "'][value='" + array[0] + "']").prop('checked', true);
                var text = self.tabDom.find("[name='tabLabel-area-0-" + self.rndNum + "'][value='" + array[0] + "']").siblings().text();
                self.domMaster.find('.input-area-item').eq(0).html(text);
                self.tabData[0].value = array[0];
                self.tabData[0].name = text;
                //查询市
                self.pickerSearch(array[0], 1, array);

                //自定义区
                if (self.param.pickerClass === 'pickerAreaPost') {
                    self.param.loadAjax({name: array[1]})
                        .done(function (data) {
                            console.log("数据", data.data);
                            self.updateArea(data.data, 2, array[2])
                        });
                } else {//查询区
                    self.pickerSearch(array[1], 2, array);
                }
            }
        },

        postAjax: function (callback) {//接口自定义
        },

        getValue: function () {

        }
    });

    function sortChinese(arr, dataLeven) {
        // 参数：arr 排序的数组; dataLeven 数组内的需要比较的元素属性
        /* 获取数组元素内需要比较的值 */
        function getValue(option) { // 参数： option 数组元素
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
            return (a.adcode) * 1 - (b.adcode) * 1
        });
    }

    function isString(str) {//判断是否是字符串,省为数组
        return (typeof str == 'string') && str.constructor === String;
    }

    window.MqPicker=MqPicker;
    // export default MqPicker



// util.ajax = function(obj)  {
//     var deferred = $.Deferred();
//     $.ajax({
//         url: obj.url || '/interface',
//         data: obj.data || {},
//         dataType: obj.dataType || 'json',
//         type: obj.type || 'get',
//     }).success(function (data) {
//         if (data.code != 200) {
//             deferred.reject(data.err_msg);
//         } else {
//             deferred.resolve(data.data)
//         }
//     }).error(function (err) {
//         deferred.reject('接口出错，请重试');
//     })
//     return deferred.fail(function (err) {
//         alert(err)
//     });
// }
//
//
// // 调用
// var obj = {
//     url: '/interface',
//     data: {
//         interface_name: 'name',
//         interface_params: JSON.stringify({})
//     }
// };
// util.ajax(obj)
//     .done(function(data){
//         dosomething(data)
//     })


