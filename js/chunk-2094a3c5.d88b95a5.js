(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-2094a3c5"],{"0ccb":function(t,e,a){var i=a("50c4"),s=a("1148"),n=a("1d80"),r=Math.ceil,o=function(t){return function(e,a,o){var l,c,u=String(n(e)),h=u.length,d=void 0===o?" ":String(o),b=i(a);return b<=h||""==d?u:(l=b-h,c=s.call(d,r(l/d.length)),c.length>l&&(c=c.slice(0,l)),t?u+c:c+u)}};t.exports={start:o(!1),end:o(!0)}},"0cf3":function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("v-app",[a("div",{staticClass:"row"},[a("div",{staticClass:"col-md-12"},[a("div",{staticClass:"card card-custom gutter-b"},[a("div",{staticClass:"card-header"},[a("div",{staticClass:"card-title"},[a("h3",{staticClass:"card-label"},[t._v(" Sinyal Matcha BNB BSC "),a("button",{staticClass:"btn btn-info ml-2",on:{click:function(e){return t.kalkulatorTool("USDT",0)}}},[a("b-icon-calculator-fill"),t._v(" Kalkulator")],1)]),a("b-form-checkbox",{attrs:{switch:""},model:{value:t.auto_request,callback:function(e){t.auto_request=e},expression:"auto_request"}},[t._v("Autorun")])],1),a("div",{staticClass:"card-toolbar"},[t.axiosError.timeout.length>0?a("span",{staticClass:"mr-2"},[a("span",{staticStyle:{color:"brown","font-weight":"bold","font-size":"14px"},attrs:{title:t.axiosError.timeout.join("\n")}},[a("b-icon-clock"),t._v(" "+t._s(t.axiosError.timeout.length)+" Timeout")],1),t._v(" | ")]):t._e(),t.axiosError.error.length>0?a("span",{staticClass:"mr-2"},[a("span",{staticStyle:{color:"#ff0000","font-weight":"bold","font-size":"14px"},attrs:{title:t.axiosError.error.join("\n")}},[a("b-icon-exclamation-triangle"),t._v(" "+t._s(t.axiosError.error.length)+" Error")],1),t._v(" | ")]):t._e(),t.threshold>0?a("span",{staticClass:"mr-2"},[a("span",{staticStyle:{color:"#00aa00","font-weight":"bold","font-size":"14px"}},[a("b-icon-bell"),t._v(" "+t._s(t.threshold)+" Sinyal")],1)]):t._e(),t.running_request>0||t.request_run?t._e():a("button",{staticClass:"btn btn-primary mr-1",attrs:{disabled:t.sinyal.fetching,title:"Klik reset untuk menerapkan perubahan modal ke semua coin"},on:{click:function(e){return t.registerAndStartFetchSinyalMatchaBnbBsc()}}},[a("b-icon-back"),t._v(" Setup ")],1),t.running_request>0||t.request_run?a("span",{staticClass:"text-muted"},[a("b-spinner",{attrs:{small:""}}),t._v(" Update Harga Koin "+t._s(((t.total_request-t.running_request)/t.total_request*100).toFixed(1))+"% ")],1):a("button",{staticClass:"btn btn-success",staticStyle:{background:"#00dd00"},attrs:{disabled:t.sinyal.fetching,title:"Klik refresh untuk memperbarui data"},on:{click:function(e){return t.startFetchSinyalMatchaBnbBsc()}}},[a("b-icon-clock"),t._v(" Update ")],1),t.running_request>0||t.request_run?a("button",{staticClass:"btn btn-danger ml-2",on:{click:function(e){return t.$router.go()}}},[t._v("Stop/Refresh")]):t._e(),a("button",{staticClass:"btn btn-danger ml-2",on:{click:t.openModalLog}},[a("b-icon-clock-history"),t._v(" Log")],1)])]),a("div",{staticClass:"card-body"},[a("b-row",[a("b-col",{staticClass:"mb-5",attrs:{md:"12"}},[a("table",{staticClass:"table table-bordered table-sm"},[a("thead",[a("tr",[a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v("USDT/IDR")]),a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#ffffff"}},[t._v("BTC/IDR")]),a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v("BNB/IDR")]),a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#ffffff"}},[t._v("ETH/IDR")]),a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v("BTC/USDT")]),a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#ffffff"}},[t._v("BNB/USDT")]),a("th",{staticClass:"text-center p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v("ETH/USDT")])])]),a("tbody",[a("tr",[a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v(t._s(t.harga.usdtbidr))]),a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#ffffff"}},[t._v(t._s(t.harga.btcbidr))]),a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v(t._s(t.harga.bnbbidr))]),a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#ffffff"}},[t._v(t._s(t.harga.ethbidr))]),a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v(t._s(t.harga.btcusdt))]),a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#ffffff"}},[t._v(t._s(t.harga.bnbusdt))]),a("td",{staticClass:"text-center font-weight-bolder p-1",staticStyle:{"background-color":"#f0f8ff"}},[t._v(t._s(t.harga.ethusdt))])])])])])],1),a("b-row",[a("b-col",{attrs:{md:"3"}},[a("b-form-group",{attrs:{id:"modal_kiri_matcha_bnb_bsc",label:"Modal Binance:","label-cols-sm":"6","label-align-sm":"right","label-for":"modal_kiri_matcha_bnb_bsc"}},[a("b-form-input",{attrs:{id:"modal_kiri_matcha_bnb_bsc",type:"number",placeholder:"Modal Binance",value:t.modal_kiri_matcha_bnb_bsc,required:""},on:{input:t.updateModalKiri}})],1)],1),a("b-col",{attrs:{md:"3"}},[a("b-form-group",{attrs:{id:"modal_kanan_matcha_bnb_bsc",label:"Modal Matcha:","label-cols-sm":"6","label-align-sm":"right","label-for":"modal_kanan_matcha_bnb_bsc"}},[a("b-form-input",{attrs:{id:"modal_kanan_matcha_bnb_bsc",type:"number",placeholder:"Modal Matcha",value:t.modal_kanan_matcha_bnb_bsc,required:""},on:{input:t.updateModalKanan}})],1)],1),a("b-col",{attrs:{md:"3"}},[a("b-form-group",{attrs:{id:"limit_threshold",label:"Filter PNL:","label-cols-sm":"6","label-align-sm":"right","label-for":"limit_threshold"}},[a("b-input-group",[a("b-form-input",{attrs:{id:"limit_threshold",type:"number",placeholder:"Filter PNL",required:""},model:{value:t.limit_threshold,callback:function(e){t.limit_threshold=e},expression:"limit_threshold"}}),a("b-input-group-append",{attrs:{"is-text":"",title:"Sembunyikan yg tidak masuk kriteria"}},[a("b-form-checkbox",{staticClass:"mr-n2",attrs:{switch:"",value:"y","unchecked-value":""},model:{value:t.sinyal.table_filter,callback:function(e){t.$set(t.sinyal,"table_filter",e)},expression:"sinyal.table_filter"}})],1)],1)],1)],1),a("b-col",{staticClass:"text-center font-weight-bold",attrs:{md:"3"}},[a("span",{},[t._v("Last Fetch:"+t._s(t.lastFetchSinyalMatchaBnbBsc))])])],1),a("b-table",{attrs:{bordered:"","sticky-header":"900px","head-variant":"dark",responsive:"",hover:"",items:t.listSinyalMatchaBnbBsc,fields:t.sinyal.fields,"tbody-tr-class":t.rowClass,"filter-function":t.filterTable,filter:t.sinyal.table_filter},scopedSlots:t._u([{key:"cell(symbol)",fn:function(e){return[a("span",{class:"fa fa-star mr-2 "+t.bintangFind(e.value),on:{click:function(a){return t.bintangMark(a,e.value)}}}),a("a",{attrs:{href:t.listSettings.url_coin+e.item.coin_address,target:"_pasar"}},[t._v(t._s(e.value))]),a("span",{class:"ml-2 badge badge-pill badge-pair-"+e.item.pair},[t._v(t._s(e.item.pair))]),t._v(" "+t._s(e.item.waktu_fetch)+" "),a("span",{staticStyle:{color:"blue"}},[t._v("| stok")]),a("a",{attrs:{target:"wallet",href:"https://bscscan.com/token/"+e.item.coin_address+"?a=0x8894e0a0c962cb723c1976a4421c95949be2d4e3"}},[t._v("[1]")]),a("a",{attrs:{target:"wallet",href:"https://bscscan.com/token/"+e.item.coin_address+"?a=0xe2fc31f816a9b94326492132018c3aecc4a93ae1"}},[t._v("[2]")]),a("br"),a("small",{staticStyle:{cursor:"copy"},attrs:{id:"coin_address_"+e.item.symbol},on:{click:function(a){return t.CopyToClipboard("coin_address_"+e.item.symbol)}}},[t._v(t._s(e.item.coin_address))])]}},{key:"cell(binance_ask_price)",fn:function(e){return[a("a",{attrs:{target:"koin",href:"https://www.binance.com/en/trade/"+e.item.symbol+"_"+e.item.pair+"?type=spot",title:null!==e.item.ask_xprice?e.item.ask_xprice+" "+e.item.pair:""}},[a("span",{attrs:{id:"binance_ask_price_"+e.item.symbol},domProps:{innerHTML:t._s(parseFloat(e.value).toFixed(8))}})]),a("br"),a("a",{staticClass:"price-tool mr-2",staticStyle:{cursor:"copy"},attrs:{title:"Klik untuk copy"},on:{click:function(a){return t.CopyToClipboard("binance_ask_price_"+e.item.symbol)}}},[a("b-icon-clipboard-plus")],1),a("a",{staticClass:"price-tool",attrs:{title:"Klik untuk mengkalkulasi"},on:{click:function(a){t.kalkulatorTool(e.item.pair,parseFloat(e.value).toFixed(8),"USDT")}}},[a("b-icon-calculator")],1)]}},{key:"cell(binance_bid_price)",fn:function(e){return[a("a",{attrs:{target:"koin",href:"https://www.binance.com/en/trade/"+e.item.symbol+"_"+e.item.pair+"?type=spot",title:null!==e.item.bid_xprice?e.item.bid_xprice+" "+e.item.pair:""}},[a("span",{attrs:{id:"binance_bid_price_"+e.item.symbol},domProps:{innerHTML:t._s(parseFloat(e.value).toFixed(8))}})]),a("br"),a("a",{staticClass:"price-tool mr-2",staticStyle:{cursor:"copy"},attrs:{title:"Klik untuk copy"},on:{click:function(a){return t.CopyToClipboard("binance_bid_price_"+e.item.symbol)}}},[a("b-icon-clipboard-plus")],1),a("a",{staticClass:"price-tool",attrs:{title:"Klik untuk mengkalkulasi"},on:{click:function(a){t.kalkulatorTool(e.item.pair,parseFloat(e.value).toFixed(8),"USDT")}}},[a("b-icon-calculator")],1)]}},{key:"cell(inch_usdt)",fn:function(e){return[a("a",{attrs:{target:"koin2",href:"https://matcha.xyz/markets/56/"+t.$store.state.setting.settings.busd_address+"/"+e.item.coin_address,title:null!==e.item.ask_xprice?(parseFloat(e.value)/parseFloat(e.item.ask_pairPrice)).toFixed(8)+" "+e.item.pair:""}},[a("span",{attrs:{id:"inch_usdt"+e.item.symbol},domProps:{innerHTML:t._s(e.value)}})]),a("br"),a("a",{staticClass:"price-tool mr-2",staticStyle:{cursor:"copy"},attrs:{title:"Klik untuk copy"},on:{click:function(a){return t.CopyToClipboard("inch_usdt"+e.item.symbol)}}},[a("b-icon-clipboard-plus")],1),a("a",{staticClass:"price-tool",attrs:{title:"Klik untuk mengkalkulasi"},on:{click:function(a){t.kalkulatorTool(e.item.pair,parseFloat(e.value).toFixed(8),"BNB")}}},[a("b-icon-calculator")],1)]}},{key:"cell(selisih_pnl_kiri)",fn:function(e){return[a("span",{class:{"bg-primary text-white p-2":parseFloat(e.value)>=parseFloat(t.limit_threshold)},domProps:{innerHTML:t._s(e.value)}})]}},{key:"cell(selisih_pnl_kiri_persen)",fn:function(e){return[a("span",{domProps:{innerHTML:t._s(e.value)}})]}},{key:"cell(inch_price)",fn:function(e){return[a("a",{attrs:{target:"koin2",href:"https://matcha.xyz/markets/56/"+t.$store.state.setting.settings.busd_address+"/"+e.item.coin_address,title:null!==e.item.bid_xprice?(parseFloat(e.value)/parseFloat(e.item.bid_pairPrice)).toFixed(8)+" "+e.item.pair:""}},[a("span",{attrs:{id:"inch_price"+e.item.symbol},domProps:{innerHTML:t._s(e.value)}})]),a("br"),a("a",{staticClass:"price-tool mr-2",staticStyle:{cursor:"copy"},attrs:{title:"Klik untuk copy"},on:{click:function(a){return t.CopyToClipboard("inch_price"+e.item.symbol)}}},[a("b-icon-clipboard-plus")],1),a("a",{staticClass:"price-tool",attrs:{title:"Klik untuk mengkalkulasi"},on:{click:function(a){t.kalkulatorTool(e.item.pair,parseFloat(e.value).toFixed(8),"BNB")}}},[a("b-icon-calculator")],1)]}},{key:"cell(selisih_pnl_kanan)",fn:function(e){return[a("span",{class:{"bg-primary text-white p-2":parseFloat(e.value)>=parseFloat(t.limit_threshold)},domProps:{innerHTML:t._s(e.value)}})]}},{key:"cell(selisih_pnl_kanan_persen)",fn:function(e){return[a("span",{domProps:{innerHTML:t._s(e.value)}})]}},{key:"cell(modal_kiri)",fn:function(e){return[a("input",{staticClass:"form-control",attrs:{type:"number",title:"Ketikkan modal, tekan enter untuk memuat."},domProps:{value:e.value},on:{change:function(a){return t.indvModal(a,e.item.symbol,"kiri")}}})]}},{key:"cell(modal_kanan)",fn:function(e){return[a("input",{staticClass:"form-control",attrs:{type:"number",title:"Ketikkan modal, tekan enter untuk memuat."},domProps:{value:e.value},on:{change:function(a){return t.indvModal(a,e.item.symbol,"kanan")}}})]}},{key:"cell(num)",fn:function(e){return[a("span",{domProps:{innerHTML:t._s(e.index+1)}}),a("b-form-checkbox",{attrs:{switch:"",checked:e.item.aktif},on:{change:function(a){return t.ubahAktif(e.item.symbol,e.item.aktif)}}})]}}])},[a("template",{staticStyle:{position:"sticky"},slot:"thead-top"},[a("b-tr",[a("b-th",[t._v("Modal")]),a("b-th",{attrs:{colspan:"2"}},[t._v("PRICE")]),a("b-th",{attrs:{colspan:"2",variant:"primary"}},[t._v("SELISIH")]),a("b-th",[t._v("SYMBOL")]),a("b-th",[t._v("Modal")]),a("b-th",{attrs:{colspan:"2"}},[t._v("PRICE")]),a("b-th",{attrs:{colspan:"2",variant:"primary"}},[t._v("SELISIH")]),a("b-th",{staticStyle:{padding:"0px","text-align":"center","vertical-align":"middle","font-size":"18px",color:"#f00"},attrs:{title:t.list_koin_nonaktif.map((function(t){return t.nama_coin})).join("\n")}},[t._v(" "+t._s(t.list_koin_nonaktif.length>0?t.list_koin_nonaktif.length:"")+" ")])],1)],1)],2)],1),a("div",{staticClass:"card-footer"},[a("b-row",[a("b-col",{attrs:{md:"12"}},[a("h4",[t._v("Pengaturan update harga :")])])],1),a("b-row",[a("b-col",{attrs:{md:"4"}},[a("b-form-group",{attrs:{id:"axiosDelay",label:"Interval","label-cols-sm":"6","label-align-sm":"right","label-for":"axiosDelay"}},[a("b-input-group",[a("b-form-input",{attrs:{id:"axiosDelay",type:"number",placeholder:"Delay",value:t.axiosDelay,required:""},on:{input:t.updateDelay}}),a("b-input-group-append",{attrs:{"is-text":"",title:"Sembunyikan yg tidak masuk kriteria"}},[t._v("ms / koin")])],1)],1)],1),a("b-col",{attrs:{md:"3"}},[a("b-form-group",{attrs:{id:"auto_request_delay",label:"Auto Delay","label-cols-sm":"6","label-align-sm":"right","label-for":"auto_request_delay"}},[a("b-input-group",[a("b-form-input",{attrs:{id:"auto_request_delay",type:"number",placeholder:"Delay",value:t.auto_request_delay,required:""},on:{input:t.updateAutoRequestDelay}}),a("b-input-group-append",{attrs:{"is-text":"",title:"Milidetik"}},[t._v("ms")])],1)],1)],1),a("b-col",{attrs:{md:"5"}},[a("b-form-group",{attrs:{id:"axiosBatch",label:"Jeda:","label-cols-sm":"3","label-align-sm":"right","label-for":"axiosBatch"}},[a("b-input-group",[a("b-form-input",{attrs:{id:"axiosRehat",type:"number",placeholder:"Rehat",value:t.axiosRehat,required:""},on:{input:t.updateRehat}}),a("b-input-group-append",{attrs:{"is-text":"",title:""}},[t._v("ms per-")]),a("b-form-input",{attrs:{id:"axiosBatch",type:"number",placeholder:"Rehat",value:t.axiosBatch,required:""},on:{input:t.updateBatch}}),a("b-input-group-append",{attrs:{"is-text":"",title:""}},[t._v("koin")])],1)],1)],1)],1),a("b-row")],1)])])]),a("b-modal",{ref:"modal-log",attrs:{title:"Log Request",size:"xl"}},[a("div",{staticStyle:{height:"400px",overflow:"auto"}},[a("ul",t._l(t.log_request,(function(e,i){return a("li",{key:i},[t._v(t._s(e))])})),0)])]),a("b-modal",{ref:"modal-calculator",attrs:{title:"Kalkulator",size:"md","ok-only":"","ok-title":"Tutup"}},[a("kalkulator",{attrs:{pair:t.kalkulator_data.pair,harga:t.kalkulator_data.harga,trigger:t.kalkulator_data.trigger,defaultSource:t.kalkulator_data.defaultSource}})],1)],1)},s=[],n=a("ade3"),r=a("5530"),o=(a("7db0"),a("4de4"),a("159b"),a("843c"),a("b680"),a("a9e3"),a("d3b7"),a("25f0"),a("fb6a"),a("c740"),a("a434"),a("0bce")),l=a("2f62"),c=a("bc3a"),u=a.n(c),h=a("3d20"),d=a.n(h),b=a("f3f0"),p={data:function(){return{sinyal:{fetching:!1,totalRows:1,currentPage:1,perPage:200,filter:null,filterOn:["symbol"],table_filter:"",fields:[{key:"modal_kiri",label:"Binance",sortable:!1,tdClass:"text-center font-weight-bold",thStyle:{width:"10%"}},{key:"binance_ask_price",label:"Binance(Ask)",sortable:!1,tdClass:"text-center font-weight-bold bg-price-binance"},{key:"inch_usdt",label:"Matcha",sortable:!1,tdClass:"text-center font-weight-bold bg-price-matcha"},{key:"selisih_pnl_kiri",label:"PNL",sortable:!1,tdClass:"text-center font-weight-bold"},{key:"selisih_pnl_kiri_persen",label:"%",sortable:!1,tdClass:"text-center font-weight-bold"},{key:"symbol",label:"Coin",sortable:!0,tdClass:"text-center font-weight-bold bg-grey-100 text-dinamis bg-puteh",thStyle:{width:"40%"}},{key:"modal_kanan",label:"Matcha",sortable:!1,tdClass:"text-center font-weight-bold",thStyle:{width:"10%"}},{key:"inch_price",label:"Matcha",sortable:!1,tdClass:"text-center font-weight-bold bg-price-matcha"},{key:"binance_bid_price",label:"Binance(Bid)",sortable:!1,tdClass:"text-center font-weight-bold bg-price-binance"},{key:"selisih_pnl_kanan",label:"PNL",sortable:!1,tdClass:"text-center font-weight-bold"},{key:"selisih_pnl_kanan_persen",label:"%",sortable:!1,tdClass:"text-center font-weight-bold"},{key:"num",label:"#",sortable:!1,tdClass:"text-center font-weight-bold bg-ireng text-white"}],items:[]},modal_kiri_matcha_bnb_bsc:0,modal_kanan_matcha_bnb_bsc:0,running_request:0,total_request:0,auto_request:!1,auto_request_delay:5e3,request_run:!1,threshold:0,limit_threshold:3,log_request:[],axiosCancelToken:u.a.CancelToken,axiosCancel:null,axiosDelay:500,axiosRehat:1e4,axiosBatch:25,axiosError:{timeout:[],error:[]},harga:{btcusdt:0,btcbidr:0,ethusdt:0,ethbidr:0,bnbusdt:0,bnbbidr:0,usdtbidr:0},kalkulator_data:{pair:"USDT",harga:0,trigger:!0,defaultSource:"USDT"},testing:"",jml_koin_aktif:0,jml_koin:0,list_koin_nonaktif:[],list_koin_bintang:[]}},components:{Kalkulator:b["a"]},watch:{limit_threshold:function(){this.$store.dispatch("settingSet",{name:"filter_pnl_matcha_bnb_bsc",value:this.limit_threshold}),this.recalculateThreshold()},running_request:function(t,e){var a=this;0==t&&0!=e&&(this.auto_request?(this.request_run=!0,this.$bvToast.toast("Request selesai, me-refresh dalam "+this.auto_request_delay+"ms",{title:"Autorun",variant:"success",solid:!0}),setTimeout((function(){a.startFetchSinyalMatchaBnbBsc()}),this.auto_request_delay)):this.request_run=!1)}},computed:Object(r["a"])({},Object(l["b"])(["listSinyalMatchaBnbBsc","lastFetchSinyalMatchaBnbBsc","listSettings","listBookTicker","currentUser"])),mounted:function(){1!=this.currentUser.level_akses&&void 0==this.currentUser.fitur.find((function(t){return"sinyal_matcha_bnb_bsc"==t}))&&this.$router.push({name:"setting"}),this.modal_kiri_matcha_bnb_bsc=null===this.listSettings?400:this.listSettings.modal_kiri_matcha_bnb_bsc||400,this.modal_kanan_matcha_bnb_bsc=null===this.listSettings?400:this.listSettings.modal_kanan_matcha_bnb_bsc||400,this.limit_threshold=null===this.listSettings?5:this.listSettings.filter_pnl_matcha_bnb_bsc||5,this.axiosDelay=null===this.listSettings?500:this.listSettings.delay_matcha_bnb_bsc||500,this.axiosRehat=null===this.listSettings?1e4:this.listSettings.rehat_matcha_bnb_bsc||1e4,this.axiosBatch=null===this.listSettings?25:this.listSettings.batch_matcha_bnb_bsc||25,this.auto_request_delay=null===this.listSettings?5e3:this.listSettings.auto_request_delay||5e3,this.$store.dispatch(o["a"],[{title:"Market Watch Matcha BNB BSC"}]),this.recalculateThreshold(),this.updateHarga(),this.jml_koin=this.$store.state.coin.coins.length,this.jml_koin_aktif=this.$store.state.coin.coins.filter((function(t){return 1==t.aktif})).length,this.list_koin_nonaktif=this.$store.state.coin.coins.filter((function(t){return 0==t.aktif}));try{var t=localStorage.getItem("mw_koin_bintang");if(null==t)throw null;t=JSON.parse(t),this.list_koin_bintang=t}catch(e){console.log("mw_koin_bintang",e),localStorage.setItem("mw_koin_bintang",JSON.stringify([])),this.list_koin_bintang=[]}},methods:{ubahAktif:function(t,e){this.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:{aktif:!e}}),this.$store.dispatch("updateAktifCoin",{nama_coin:t,edit:!1,aktif:!e}),this.jml_koin_aktif=this.$store.state.coin.coins.filter((function(t){return 1==t.aktif})).length,this.list_koin_nonaktif=this.$store.state.coin.coins.filter((function(t){return 0==t.aktif}))},addLogRequest:function(t){this.log_request.push("["+(new Date).toISOString()+"]"+t)},openModalLog:function(){this.$refs["modal-log"].show()},recalculateThreshold:function(){var t=this;this.threshold=0,this.listSinyalMatchaBnbBsc.forEach((function(e){(parseFloat(e.selisih_pnl_kanan)>=t.limit_threshold||parseFloat(e.selisih_pnl_kiri)>=t.limit_threshold)&&t.threshold++}))},getBidPrice:function(t){var e=this.listBookTicker.find((function(e){return e.symbol==t}));return void 0==e?0:e.bidPrice},clearHarga:function(){this.harga.btcusdt="loading",this.harga.btcbidr="loading",this.harga.ethusdt="loading",this.harga.ethbidr="loading",this.harga.bnbusdt="loading",this.harga.bnbbidr="loading",this.harga.usdtbidr="loading"},updateHarga:function(){this.harga.btcusdt=this.getBidPrice("BTCUSDT"),this.harga.btcbidr=this.getBidPrice("BTCBIDR"),this.harga.ethusdt=this.getBidPrice("ETHUSDT"),this.harga.ethbidr=this.getBidPrice("ETHBIDR"),this.harga.bnbusdt=this.getBidPrice("BNBUSDT"),this.harga.bnbbidr=this.getBidPrice("BNBBIDR"),this.harga.usdtbidr=this.getBidPrice("USDTBIDR")},filterTable:function(t,e){if(""!=e)return!(!t.aktif||!(parseFloat(t.selisih_pnl_kanan)>=this.limit_threshold||parseFloat(t.selisih_pnl_kiri)>=this.limit_threshold))},indvModal:function(t,e,a){this.fetchSinyalMatchaBnbBsc(e,Object(n["a"])({},"modal_"+a,t.target.value))},updateModalKiri:function(t){this.$store.dispatch("settingSet",{name:"modal_kiri_matcha_bnb_bsc",value:t})},updateModalKanan:function(t){this.$store.dispatch("settingSet",{name:"modal_kanan_matcha_bnb_bsc",value:t})},updateDelay:function(t){this.axiosDelay=t,this.$store.dispatch("settingSet",{name:"delay_matcha_bnb_bsc",value:t})},updateAutoRequestDelay:function(t){this.auto_request_delay=t,this.$store.dispatch("settingSet",{name:"auto_request_delay",value:t})},updateRehat:function(t){this.axiosRehat=t,this.$store.dispatch("settingSet",{name:"rehat_matcha_bnb_bsc",value:t})},updateBatch:function(t){this.axiosBatch=t,this.$store.dispatch("settingSet",{name:"batch_matcha_bnb_bsc",value:t})},rowClass:function(t,e){if(t&&"row"===e)return parseFloat(t.selisih_pnl_kanan)>=this.limit_threshold||parseFloat(t.selisih_pnl_kiri)>=this.limit_threshold?"bg-green":void 0},refreshSinyalMatchaBnbBsc:function(){this.$store.dispatch("registerSinyalMatchaBnbBsc")},test2:function(){var t=400,e=BigInt("358516543755854128279"),a=BigInt("1".padEnd(19,"0")),i=(Number(100n*e/a)/100-t).toFixed(2);console.log(a),console.log(i)},test3:function(){var t="Matcha",e=this.$store.state.coin.coins.find((function(e){return e.nama_coin==t})),a=400,i=5.2024,s=a/i*Math.pow(10,parseInt(e.desimal));console.log(s.toString())},test4:function(){var t=this.modal_kanan_matcha_bnb_bsc*Math.pow(10,18);console.log(t)},registerAndStartFetchSinyalMatchaBnbBsc2:function(){for(var t=0;t<110;t++){var e=1e4*Math.floor(t/25),a=25*Math.floor(t/25)*this.axiosDelay+e;console.log("to "+t,t*this.axiosDelay+a,e,a)}},registerAndStartFetchSinyalMatchaBnbBsc:function(){var t=this;if(this.clearHarga(),this.axiosCancel=this.axiosCancelToken.source(),this.addLogRequest("START SETUP"),null==this.$store.state.coin.coins)return this.addLogRequest("KOIN KOSONG"),d.a.fire({title:"Belum ada koin yg didaftarkan!",text:"Silahkan impor settingan dahulu",icon:"error",heightAuto:!1}),!1;this.threshold=0,this.total_request=0,this.$store.dispatch("clearSinyalMatchaBnbBsc").then((function(){t.total_request++,t.$store.dispatch("updateBookTicker").then((function(e){console.log("respon",e),t.updateHarga(),"ok"!=e.status?d.a.fire({title:"Gagal memuat book ticker!",text:e.message,icon:"error",heightAuto:!1}):(t.addLogRequest("BINANCE UPDATED"),t.$store.dispatch("registerSinyalMatchaBnbBsc").then((function(){t.listSinyalMatchaBnbBsc.forEach((function(e,a){t.fetchSinyalMatchaBnbBsc(e.symbol,void 0,a)}))})),t.$bvToast.toast("Book Ticker berhasil binance di update",{title:"Binance Book Ticker",variant:"success",solid:!0}))}))}))},cancelFetch:function(){window.location.reload(!1)},startFetchSinyalMatchaBnbBsc:function(){var t=this;this.clearHarga(),this.axiosCancel=this.axiosCancelToken.source(),this.threshold=0,this.total_request=0,this.$store.dispatch("clearSinyalMatchaBnbBsc").then((function(){t.total_request++,t.$store.dispatch("updateBookTicker").then((function(e){t.updateHarga(),"ok"!=e.status?d.a.fire({title:"Gagal memuat book ticker!",text:e.message,icon:"error",heightAuto:!1}):(t.addLogRequest("BINANCE UPDATED"),t.listSinyalMatchaBnbBsc.forEach((function(e,a){t.fetchSinyalMatchaBnbBsc(e.symbol,void 0,a)})),t.$bvToast.toast("Book Ticker berhasil binance di update",{title:"Binance Book Ticker",variant:"success",solid:!0}))}))}))},fetchSinyalMatchaBnbBsc:function(t,e,a){var i=this,s=this.axiosRehat*Math.floor(a/this.axiosBatch),n=this.axiosDelay*a;this.axiosError.timeout=[],this.axiosError.error=[],this.running_request+=2,this.total_request+=2;var o=this.listSinyalMatchaBnbBsc.find((function(e){return e.symbol==t})),l=this.$store.state.coin.coins.find((function(e){return e.nama_coin==t}));void 0==e&&(e={});var c=this.$store.getters.getBookCoinPriceAsk(t),h=this.$store.getters.getBookCoinPriceBid(t);setTimeout((function(){i.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:Object(r["a"])(Object(r["a"])({},e),{},{binance_ask_price:c.price,ask_xprice:void 0!==c.xprice?c.xprice:null,binance_bid_price:h.price,bid_xprice:void 0!==h.xprice?h.xprice:null,ask_pairPrice:void 0!==c.pairPrice?c.pairPrice:null,bid_pairPrice:void 0!==h.pairPrice?h.pairPrice:null,selisih_pnl_kiri:"<div class='spinner-border spinner-border-sm'></div>",inch_usdt:"<div class='spinner-border spinner-border-sm'></div>",selisih_pnl_kiri_persen:"<div class='spinner-border spinner-border-sm'></div>",inch_sum:"<div class='spinner-border spinner-border-sm'></div>",inch_price:"<div class='spinner-border spinner-border-sm'></div>",selisih_pnl_kanan:"<div class='spinner-border spinner-border-sm'></div>",selisih_pnl_kanan_persen:"<div class='spinner-border spinner-border-sm'></div>"})}).then((function(){if(0==o.binance_ask_price)return i.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:Object(r["a"])(Object(r["a"])({},e),{},{selisih_pnl_kiri:0,inch_usdt:0,selisih_pnl_kiri_persen:0,inch_sum:0,inch_price:0,selisih_pnl_kanan:0,selisih_pnl_kanan_persen:0})}),i.running_request-=2,!0;var a=void 0!=e.modal_kiri?e.modal_kiri:o.modal_kiri,s=void 0!=e.modal_kanan?e.modal_kanan:o.modal_kanan,n=(a*i.harga.bnbusdt/c.price*Math.pow(10,parseInt(l.desimal))).toLocaleString("fullwide",{useGrouping:!1,maximumFractionDigits:0});u.a.get("https://bsc.api.0x.org/swap/v1/quote",{cancelToken:i.axiosCancel.token,params:{buyToken:"0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",sellToken:l.coin_address,sellAmount:n},timeout:1e3*(i.$store.state.setting.settings.timeout_request||15)}).then((function(e){i.running_request-=1;var n=e.data,r=BigInt(n.buyAmount),o=BigInt("1".padEnd(19,"0")),d=Number(10000n*r/o)/1e4-a,b=Number(10000n*r/o)/1e4/(a*i.harga.bnbusdt/c.price),p=d/a*100;i.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:{selisih_pnl_kiri:d.toFixed(3),inch_usdt:b.toFixed(7),selisih_pnl_kiri_persen:p.toFixed(2)}});var _=BigInt(s*Math.pow(10,18)).toLocaleString("fullwide",{useGrouping:!1,maximumFractionDigits:0});u.a.get("https://bsc.api.0x.org/swap/v1/quote",{cancelToken:i.axiosCancel.token,params:{buyToken:l.coin_address,sellToken:"0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",sellAmount:_},timeout:1e3*(i.$store.state.setting.settings.timeout_request||15)}).then((function(e){i.running_request-=1;var a=e.data,n=BigInt(a.buyAmount),r=BigInt("1".padEnd(parseInt(l.desimal)+1,"0")),o=Number(10000n*n/r)/1e4,c=0==o?0:s/o,u=o*h.price/i.harga.bnbusdt-s,b=0==o?0:u/s*100;(u>=i.limit_threshold||d>=i.limit_threshold)&&i.threshold++;var p=new Date;i.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:{inch_sum:o.toFixed(2),inch_price:c.toFixed(7),selisih_pnl_kanan:u.toFixed(3),selisih_pnl_kanan_persen:b.toFixed(2),waktu_fetch:("0"+p.getHours()).slice(-2)+":"+("0"+p.getMinutes()).slice(-2)+":"+("0"+p.getSeconds()).slice(-2)}})})).catch((function(e){var a;if(i.running_request-=1,"ECONNABORTED"==e.code)a="timeout",i.addLogRequest("TIMEOUT: "+t+" "+l.coin_address),i.axiosError.timeout.push(t);else if(void 0!=e.response){a="error";var s=e.response.data.message||"general error";i.addLogRequest("ERROR: "+t+" : "+s+"<br>"+e.request.responseURL),i.axiosError.error.push(t)}else u.a.isCancel(e)?(i.addLogRequest("CANCELLED: "+t+" "+l.coin_address),a="canceled",i.axiosError.error.push(t)):(i.addLogRequest("NETWORK ERROR: "+t+" "+l.coin_address+" Request ditolak oleh Matcha (CORS)"),a="error",i.axiosError.error.push(t));var n=new Date;i.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:{inch_sum:a,inch_price:a,selisih_pnl_kanan:a,selisih_pnl_kanan_persen:a,waktu_fetch:("0"+n.getHours()).slice(-2)+":"+("0"+n.getMinutes()).slice(-2)+":"+("0"+n.getSeconds()).slice(-2)}}),console.log("Fetching Matcha error",e)}))})).catch((function(e){var a;if(i.running_request-=2,"ECONNABORTED"==e.code)a="timeout",i.addLogRequest("TIMEOUT: "+t+" "+l.coin_address),i.axiosError.timeout.push(t);else if(void 0!=e.response){a="error";var s=e.response.data.message||"general error";i.addLogRequest("ERROR: "+t+" : "+s+" \n "+e.request.responseURL+" \n Cek nama koin!"),i.axiosError.error.push(t)}else u.a.isCancel(e)?(i.addLogRequest("CANCELLED: "+t+" "+l.coin_address),a="canceled",i.axiosError.error.push(t)):(i.addLogRequest("NETWORK ERROR: "+t+" "+l.coin_address+" Request ditolak oleh Matcha (CORS)"),a="error",i.axiosError.error.push(t));var n=new Date;i.$store.dispatch("updateSinyalMatchaBnbBsc",{symbol:t,value:{selisih_pnl_kiri:a,inch_usdt:a,selisih_pnl_kiri_persen:a,inch_sum:a,inch_price:a,selisih_pnl_kanan:a,selisih_pnl_kanan_persen:a,waktu_fetch:("0"+n.getHours()).slice(-2)+":"+("0"+n.getMinutes()).slice(-2)+":"+("0"+n.getSeconds()).slice(-2)}}),console.log("Fetching Matcha error",e)}))}))}),s+n)},bintangFind:function(t){var e=this.list_koin_bintang.findIndex((function(e){return e.koin==t}));return e>=0?this.list_koin_bintang[e].class:"bintang-white"},bintangMark:function(t,e){console.log(e);var a=this.list_koin_bintang.findIndex((function(t){return t.koin==e})),i="";if(a>=0){var s=this.list_koin_bintang.splice(a,1);i="bintang-white"==s[0].class?"bintang-green":"bintang-green"==s[0].class?"bintang-red":"bintang-white",this.list_koin_bintang.push({koin:e,class:i})}else i="bintang-green",this.list_koin_bintang.push({koin:e,class:i});localStorage.setItem("mw_koin_bintang",JSON.stringify(this.list_koin_bintang)),"bintang-white"==i?(t.target.classList.add("bintang-white"),t.target.classList.remove("bintang-red"),t.target.classList.remove("bintang-green")):"bintang-green"==i?(t.target.classList.remove("bintang-white"),t.target.classList.remove("bintang-red"),t.target.classList.add("bintang-green")):(t.target.classList.remove("bintang-white"),t.target.classList.add("bintang-red"),t.target.classList.remove("bintang-green"))},CopyToClipboard:function(t){console.log(t);var e=document.createRange();e.selectNode(document.getElementById(t)),window.getSelection().removeAllRanges(),window.getSelection().addRange(e),document.execCommand("copy"),window.getSelection().removeAllRanges(),this.$bvToast.toast("data dicopy",{title:"Clipboard",variant:"info",solid:!1})},kalkulatorTool:function(t,e,a){this.kalkulator_data.defaultSource=a,this.kalkulator_data.pair=t,this.kalkulator_data.harga=e,this.kalkulator_data.trigger=!this.kalkulator_data.trigger,this.$refs["modal-calculator"].show()}}},_=p,m=a("2877"),g=a("6544"),f=a.n(g),k=a("7496"),B=Object(m["a"])(_,i,s,!1,null,null,null);e["default"]=B.exports;f()(B,{VApp:k["a"]})},6544:function(t,e){t.exports=function(t,e){var a="function"===typeof t.exports?t.exports.extendOptions:t.options;for(var i in"function"===typeof t.exports&&(a.components=t.exports.options.components),a.components=a.components||{},e)a.components[i]=a.components[i]||e[i]}},7496:function(t,e,a){"use strict";var i=a("5530"),s=(a("df86"),a("2b0e")),n=s["default"].extend().extend({name:"themeable",provide:function(){return{theme:this.themeableProvide}},inject:{theme:{default:{isDark:!1}}},props:{dark:{type:Boolean,default:null},light:{type:Boolean,default:null}},data:function(){return{themeableProvide:{isDark:!1}}},computed:{appIsDark:function(){return this.$vuetify.theme.dark||!1},isDark:function(){return!0===this.dark||!0!==this.light&&this.theme.isDark},themeClasses:function(){return{"theme--dark":this.isDark,"theme--light":!this.isDark}},rootIsDark:function(){return!0===this.dark||!0!==this.light&&this.appIsDark},rootThemeClasses:function(){return{"theme--dark":this.rootIsDark,"theme--light":!this.rootIsDark}}},watch:{isDark:{handler:function(t,e){t!==e&&(this.themeableProvide.isDark=this.isDark)},immediate:!0}}}),r=n;function o(){for(var t=arguments.length,e=new Array(t),a=0;a<t;a++)e[a]=arguments[a];return s["default"].extend({mixins:e})}e["a"]=o(r).extend({name:"v-app",props:{dark:{type:Boolean,default:void 0},id:{type:String,default:"app"},light:{type:Boolean,default:void 0}},computed:{isDark:function(){return this.$vuetify.theme.dark}},beforeCreate:function(){if(!this.$vuetify||this.$vuetify===this.$root)throw new Error("Vuetify is not properly initialized, see https://vuetifyjs.com/getting-started/quick-start#bootstrapping-the-vuetify-object")},render:function(t){var e=t("div",{staticClass:"v-application--wrap"},this.$slots.default);return t("div",{staticClass:"v-application",class:Object(i["a"])({"v-application--is-rtl":this.$vuetify.rtl,"v-application--is-ltr":!this.$vuetify.rtl},this.themeClasses),attrs:{"data-app":!0},domProps:{id:this.id}},[e])}})},"843c":function(t,e,a){"use strict";var i=a("23e7"),s=a("0ccb").end,n=a("9a0c");i({target:"String",proto:!0,forced:n},{padEnd:function(t){return s(this,t,arguments.length>1?arguments[1]:void 0)}})},"9a0c":function(t,e,a){var i=a("342f");t.exports=/Version\/10(?:\.\d+){1,2}(?: [\w./]+)?(?: Mobile\/\w+)? Safari\//.test(i)},df86:function(t,e,a){},f3f0:function(t,e,a){"use strict";var i=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",[a("div",{staticClass:"form-group row"},[a("label",{staticClass:"col-sm-2 col-form-label",class:{"font-weight-bold font-italic":"IDR"==t.sourcePair}},[t._v("IDR")]),a("div",{staticClass:"col-sm-10"},[a("input",{staticClass:"form-control",attrs:{type:"text",id:"kalk_IDR",placeholder:"IDR"},domProps:{value:t.IDR},on:{input:function(e){return t.changeHarga(e,"IDR")}}})])]),a("div",{staticClass:"form-group row"},[a("label",{staticClass:"col-sm-2 col-form-label",class:{"font-weight-bold font-italic":"USDT"==t.sourcePair}},[t._v("USDT")]),a("div",{staticClass:"col-sm-10"},[a("input",{staticClass:"form-control",attrs:{type:"text",id:"kalk_USDT",placeholder:"USDT"},domProps:{value:t.USDT},on:{input:function(e){return t.changeHarga(e,"USDT")}}})])]),a("div",{staticClass:"form-group row"},[a("label",{staticClass:"col-sm-2 col-form-label",class:{"font-weight-bold font-italic":"ETH"==t.sourcePair}},[t._v("ETH")]),a("div",{staticClass:"col-sm-10"},[a("input",{staticClass:"form-control",attrs:{type:"text",id:"kalk_ETH",placeholder:"ETH"},domProps:{value:t.ETH},on:{input:function(e){return t.changeHarga(e,"ETH")}}})])]),a("div",{staticClass:"form-group row"},[a("label",{staticClass:"col-sm-2 col-form-label",class:{"font-weight-bold font-italic":"BTC"==t.sourcePair}},[t._v("BTC")]),a("div",{staticClass:"col-sm-10"},[a("input",{staticClass:"form-control",attrs:{type:"text",id:"kalk_BTC",placeholder:"BTC"},domProps:{value:t.BTC},on:{input:function(e){return t.changeHarga(e,"BTC")}}})])]),a("div",{staticClass:"form-group row"},[a("label",{staticClass:"col-sm-2 col-form-label",class:{"font-weight-bold font-italic":"BNB"==t.sourcePair}},[t._v("BNB")]),a("div",{staticClass:"col-sm-10"},[a("input",{staticClass:"form-control",attrs:{type:"text",id:"kalk_BNB",placeholder:"BNB"},domProps:{value:t.BNB},on:{input:function(e){return t.changeHarga(e,"BNB")}}})])]),a("div",{staticClass:"text-muted text-center mt-2"},[t._v("Binance Last Fetch : "+t._s(new Date(this.$store.state.binance.lastFetch).toLocaleString("id-ID")))]),a("div",{staticClass:"text-center"},[a("button",{staticClass:"btn btn-info btn-xs",attrs:{disabled:t.loading},on:{click:t.updateBinance}},[t.loading?a("div",{staticClass:"spinner-border spinner-border-sm"}):t._e(),t._v(" Reload Binance & Rekalkulasi ")])])])},s=[],n=a("5530"),r=(a("b680"),a("7db0"),a("2f62")),o={name:"Kalkulator",props:{pair:String,harga:String,trigger:Boolean,defaultSource:String},data:function(){return{IDR:0,USDT:0,ETH:0,BTC:0,BNB:0,BTCUSDT:0,BTCBIDR:0,ETHBTC:0,ETHBIDR:0,ETHUSDT:0,BNBETH:0,USDTBIDR:0,BNBBTC:0,BNBBIDR:0,BNBUSDT:0,sourcePair:"IDR",loading:!1}},computed:Object(n["a"])({},Object(r["b"])(["listBookTicker"])),watch:{trigger:{handler:function(){this.sourcePair=void 0!==this.defaultSource?this.defaultSource:"USDT",this[this.sourcePair]=this.harga,this.updateBinance()},immediate:!0}},methods:{updateBinance:function(){var t=this;this.loading=!0,this.$store.dispatch("updateBookTicker").then((function(){t.hitung(t.sourcePair,t[t.sourcePair]),t.loading=!1}))},changeHarga:function(t,e){this.hitung(e,t.target.value)},hitung:function(t,e){switch(this.sourcePair=t,this.updateKonversi(),t="BUSD"==t?"USDT":t,this[t]=e,t){case"ETH":this.BTC=parseFloat(parseFloat(this[t])*parseFloat(this.ETHBTC)).toFixed(8),this.IDR=parseFloat(parseFloat(this[t])*parseFloat(this.ETHBIDR)).toLocaleString("en",{maximumFractionDigits:2}),this.USDT=parseFloat(parseFloat(this[t])*parseFloat(this.ETHUSDT)).toFixed(8),this.BNB=parseFloat(parseFloat(this[t])/parseFloat(this.BNBETH)).toFixed(8);break;case"BTC":this.ETH=parseFloat(parseFloat(this[t])/parseFloat(this.ETHBTC)).toFixed(8),this.IDR=parseFloat(parseFloat(this[t])*parseFloat(this.BTCBIDR)).toLocaleString("en",{maximumFractionDigits:2}),this.USDT=parseFloat(parseFloat(this[t])*parseFloat(this.BTCUSDT)).toFixed(8),this.BNB=parseFloat(parseFloat(this[t])/parseFloat(this.BNBBTC)).toFixed(8);break;case"IDR":this.ETH=parseFloat(parseFloat(this[t])/parseFloat(this.ETHBIDR)).toFixed(8),this.BTC=parseFloat(parseFloat(this[t])/parseFloat(this.BTCBIDR)).toFixed(8),this.USDT=parseFloat(parseFloat(this[t])/parseFloat(this.USDTBIDR)).toFixed(8),this.BNB=parseFloat(parseFloat(this[t])/parseFloat(this.BNBBIDR)).toFixed(8);break;case"USDT":this.ETH=parseFloat(parseFloat(this[t])/parseFloat(this.ETHUSDT)).toFixed(8),this.BTC=parseFloat(parseFloat(this[t])/parseFloat(this.BTCUSDT)).toFixed(8),this.IDR=parseFloat(parseFloat(this[t])*parseFloat(this.USDTBIDR)).toLocaleString("en",{maximumFractionDigits:2}),this.BNB=parseFloat(parseFloat(this[t])/parseFloat(this.BNBUSDT)).toFixed(8);break;case"BNB":this.ETH=parseFloat(parseFloat(this[t])*parseFloat(this.BNBETH)).toFixed(8),this.BTC=parseFloat(parseFloat(this[t])*parseFloat(this.BNBBTC)).toFixed(8),this.IDR=parseFloat(parseFloat(this[t])*parseFloat(this.BNBBIDR)).toLocaleString("en",{maximumFractionDigits:2}),this.USDT=parseFloat(parseFloat(this[t])*parseFloat(this.BNBUSDT)).toFixed(8);break}},getAskPrice:function(t){var e=this.listBookTicker.find((function(e){return e.symbol==t}));return void 0==e?0:e.askPrice},updateKonversi:function(){this.BTCUSDT=this.getAskPrice("BTCUSDT"),this.BTCBIDR=this.getAskPrice("BTCBIDR"),this.ETHBTC=this.getAskPrice("ETHBTC"),this.ETHBIDR=this.getAskPrice("ETHBIDR"),this.ETHUSDT=this.getAskPrice("ETHUSDT"),this.BNBETH=this.getAskPrice("BNBETH"),this.USDTBIDR=this.getAskPrice("USDTBIDR"),this.BNBBTC=this.getAskPrice("BNBBTC"),this.BNBBIDR=this.getAskPrice("BNBBIDR"),this.BNBUSDT=this.getAskPrice("BNBUSDT")}}},l=o,c=a("2877"),u=Object(c["a"])(l,i,s,!1,null,null,null);e["a"]=u.exports}}]);
//# sourceMappingURL=chunk-2094a3c5.d88b95a5.js.map