(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-408989aa"],{"394c":function(t,e,a){"use strict";a.r(e);var n=function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"d-flex flex-column flex-root"},[a("div",{staticClass:"login login-1 d-flex flex-column flex-lg-row flex-column-fluid bg-white",class:{"login-signin-on":"signin"==this.state,"login-signup-on":"signup"==this.state,"login-forgot-on":"forgot"==this.state},attrs:{id:"kt_login"}},[a("div",{staticClass:"login-content flex-row-fluid d-flex flex-column justify-content-center position-relative overflow-hidden p-7 mx-auto"},[a("div",{staticClass:"d-flex flex-column-fluid flex-center"},[a("div",{staticClass:"login-form login-signin"},[a("form",{staticClass:"form",attrs:{novalidate:"novalidate",id:"kt_login_signin_form"},on:{submit:function(e){return e.stopPropagation(),e.preventDefault(),t.onSubmitLogin()}}},[a("div",{staticClass:"pb-13 pt-lg-0 pt-5"},[a("h3",{staticClass:"font-weight-bolder text-dark font-size-h4 font-size-h1-lg"},[t._v("Login ke MarketWatch")]),a("span",{staticClass:"text-muted font-weight-bold font-size-h4"},[t._v("Baru? "),a("a",{staticClass:"text-primary font-weight-bolder",attrs:{id:"kt_login_signup"},on:{click:function(e){return t.showForm("signup")}}},[t._v("Silahkan mendaftar")])])]),a("div",{staticClass:"form-group"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark"},[t._v("Username")]),a("div",{attrs:{id:"example-input-group-1",label:"","label-for":"example-input-1"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.username,expression:"username"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg",attrs:{type:"text",name:"username",readonly:"readonly"},domProps:{value:t.username},on:{input:function(e){e.target.composing||(t.username=e.target.value)}}})])]),a("div",{staticClass:"form-group"},[t._m(0),a("div",{attrs:{id:"example-input-group-2",label:"","label-for":"example-input-2"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.login_token,expression:"login_token"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg",attrs:{type:"login_token",name:"login_token",autocomplete:"off"},domProps:{value:t.login_token},on:{input:function(e){e.target.composing||(t.login_token=e.target.value)}}})])]),a("div",{staticClass:"pb-lg-0 pb-5"},[a("button",{ref:"kt_login_signin_submit",staticClass:"btn btn-primary font-weight-bolder font-size-h6 px-15 py-4 my-3 mr-3"},[t._v("Sign In")])])])]),a("div",{staticClass:"login-form login-signup"},[a("form",{staticClass:"form",attrs:{novalidate:"novalidate",id:"kt_login_signup_form"},on:{submit:function(e){return e.stopPropagation(),e.preventDefault(),t.onSubmitRegister()}}},[t._m(1),0==t.regstep?a("div",[a("div",{staticClass:"form-group"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark"},[t._v("Nama Lengkap")]),a("div",{attrs:{id:"email",label:"","label-for":"example-input-1"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.nama_lengkap,expression:"nama_lengkap"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg",attrs:{type:"nama_lengkap",name:"nama_lengkap"},domProps:{value:t.nama_lengkap},on:{input:function(e){e.target.composing||(t.nama_lengkap=e.target.value)}}})])]),a("div",{staticClass:"form-group"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark"},[t._v("Email")]),a("div",{attrs:{id:"email",label:"","label-for":"example-input-1"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.email,expression:"email"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg",attrs:{type:"email",name:"email"},domProps:{value:t.email},on:{input:function(e){e.target.composing||(t.email=e.target.value)}}})])]),a("div",{staticClass:"form-group"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark"},[t._v("Password")]),a("div",{attrs:{id:"email",label:"","label-for":"example-input-1"}},[a("input",{directives:[{name:"model",rawName:"v-model",value:t.password,expression:"password"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg",attrs:{type:"password",name:"password"},domProps:{value:t.password},on:{input:function(e){e.target.composing||(t.password=e.target.value)}}})])]),a("div",{staticClass:"form-group d-flex flex-wrap pb-lg-0 pb-3"},[a("button",{staticClass:"btn btn-light-primary font-weight-bolder font-size-h6 px-8 py-4 my-3",attrs:{type:"button"},on:{click:function(e){return t.showForm("signin")}}},[t._v("Batal")]),a("button",{staticClass:"btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 ml-4",attrs:{type:"button"},on:{click:function(e){t.regstep=1}}},[t._v("Berikutnya")])])]):t._e(),1==t.regstep?a("div",[a("div",{staticClass:"form-group"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark"},[t._v("Kode Registrasi")]),a("textarea",{directives:[{name:"model",rawName:"v-model",value:t.register_data_hash,expression:"register_data_hash"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg font-size-h6",attrs:{rows:"10",type:"text",placeholder:"Register Hash",readonly:"true"},domProps:{value:t.register_data_hash},on:{input:function(e){e.target.composing||(t.register_data_hash=e.target.value)}}})]),a("div",{staticClass:"form-group d-flex flex-wrap pb-lg-0 pb-3"},[a("button",{staticClass:"btn btn-light-primary font-weight-bolder font-size-h6 px-8 py-4 my-3",attrs:{type:"button"},on:{click:function(e){e.preventDefault(),t.regstep=0}}},[t._v("Kembali")]),a("button",{staticClass:"btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 ml-4",attrs:{type:"button"},on:{click:function(e){e.preventDefault(),t.regstep=2}}},[t._v("Berikutnya")])])]):t._e(),2==t.regstep?a("div",[a("div",{staticClass:"form-group"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark"},[t._v("Token Aktivasi")]),a("textarea",{directives:[{name:"model",rawName:"v-model",value:t.register_token,expression:"register_token"}],staticClass:"form-control form-control-solid h-auto py-7 px-6 rounded-lg font-size-h6",attrs:{rows:"10",type:"text",placeholder:"Kode Aktivasi",autocomplete:"off"},domProps:{value:t.register_token},on:{input:function(e){e.target.composing||(t.register_token=e.target.value)}}})]),a("div",{staticClass:"form-group d-flex flex-wrap pb-lg-0 pb-3"},[a("button",{staticClass:"btn btn-light-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4",attrs:{type:"button",id:"kt_login_signup_cancel"},on:{click:function(e){t.regstep=1}}},[t._v("Kembali")]),a("button",{ref:"kt_login_signup_submit",staticClass:"btn btn-primary font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4",staticStyle:{width:"150px"}},[t._v("Register")]),a("button",{staticClass:"btn btn-light-danger font-weight-bolder font-size-h6 px-8 py-4 my-3 mr-4",attrs:{type:"button"},on:{click:function(e){return t.unRegister()}}},[t._v("Unreg")])])]):t._e()])])])])])])},i=[function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"d-flex justify-content-between mt-n5"},[a("label",{staticClass:"font-size-h6 font-weight-bolder text-dark pt-5"},[t._v("Login Token")])])},function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("div",{staticClass:"pb-13 pt-lg-0 pt-5"},[a("h3",{staticClass:"font-weight-bolder text-dark font-size-h4 font-size-h1-lg"},[t._v("Mendaftar")])])}],s=a("5530"),o=(a("ac1f"),a("5319"),a("d3b7"),a("25f0"),a("ae1f")),r=a("2f62"),l=a("854b"),u=a("3d20"),g=a.n(u),m=a("d9db"),c={name:"login-1",data:function(){return{regstep:0,state:"signin",username:"",email:"",nama_lengkap:"",password:"",register_data_hash:"",login_token:"",register_token:localStorage.getItem("mw_register_hash"),uuid:null}},watch:{nama_lengkap:function(t){localStorage.setItem("mw_reg_nama_lengkap",t),this.generateRegData()},email:function(t){localStorage.setItem("mw_reg_email",t),this.generateRegData()},password:function(){this.generateRegData()}},computed:Object(s["a"])(Object(s["a"])({},Object(r["b"])(["currentUser","isAuthenticated","cekLoginToken"])),{},{backgroundImage:function(){return"media/svg/illustrations/login-visual-1.svg"},encrypted:function(){return m["a"].encrypt(JSON.stringify({username:"gema",nama_lengkap:"gema",level_akses:1,fitur:null,tanggal:Date.now(),entropy:"a"}))}}),mounted:function(){var t=localStorage.getItem("mw_uid");if(null===t){var e=this.create_UUID();t=m["a"].encrypt(JSON.stringify({uuid:e,ua:window.navigator.userAgent})),localStorage.setItem("mw_uid",t),this.uuid=e}else try{if(t=m["a"].decrypt(t),t=JSON.parse(t),t.ua!=window.navigator.userAgent)throw"uuid not match";this.uuid=t.uuid}catch(i){var a=this.create_UUID();t=m["a"].encrypt(JSON.stringify({uuid:a,ua:window.navigator.userAgent})),localStorage.setItem("mw_uid",t),this.uuid=a}this.nama_lengkap=localStorage.getItem("mw_reg_nama_lengkap"),this.email=localStorage.getItem("mw_reg_email"),this.register_data_hash=localStorage.getItem("mw_reg_register_data_hash");var n=this.cekLoginToken;"ok"==n.status&&n.expired>Date.now()?this.$router.push({name:"dashboard"}):this.reloadForm()},methods:{generateRegData:function(){this.register_data_hash=m["a"].encrypt(JSON.stringify({nama_lengkap:this.nama_lengkap,email:this.email,password:m["a"].md5(this.password),uuid:this.uuid})),localStorage.setItem("mw_reg_register_data_hash",this.register_data_hash)},reloadForm:function(){console.log(this.currentUser),this.register_token=localStorage.getItem("mw_register_hash"),this.username=this.currentUser.username},showForm:function(t){this.state=t;var e="kt_login_"+t+"_form";o["a"].animateClass(o["a"].getById(e),"animate__animated animate__backInUp")},onSubmitLogin:function(){var t=this,e=this.$refs["kt_login_signin_submit"];e.classList.add("spinner","spinner-light","spinner-right"),this.$store.dispatch(l["a"],this.login_token).then((function(a){"ok"!=a.status?g.a.fire({title:"Gagal!",text:a.message,icon:"error",confirmButtonClass:"btn btn-secondary",heightAuto:!1}):t.$router.push({name:"dashboard"}),e.classList.remove("spinner","spinner-light","spinner-right")})).catch((function(){}))},onSubmitRegister:function(){var t=this,e=this.$refs["kt_login_signup_submit"];e.classList.add("spinner","spinner-light","spinner-right"),this.$store.dispatch(l["c"],this.register_token).then((function(a){e.classList.remove("spinner","spinner-light","spinner-right"),"ok"!=a.status?g.a.fire({title:"Gagal!",text:a.message,icon:"error",confirmButtonClass:"btn btn-secondary",heightAuto:!1}):g.a.fire({title:"Sukses!",text:"Pendaftaran sukses, silahkan login",icon:"success",confirmButtonClass:"btn btn-secondary",heightAuto:!1}).then((function(){t.reloadForm(),t.showForm("signin")}))}))},unRegister:function(){var t=this;this.$store.dispatch(l["d"]).then((function(){t.reloadForm(),g.a.fire({title:"Berhasil unreg!",text:"Silahkan register kembali",icon:"success",confirmButtonClass:"btn btn-secondary",heightAuto:!1})}))},create_UUID:function(){var t=(new Date).getTime(),e="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,(function(e){var a=(t+16*Math.random())%16|0;return t=Math.floor(t/16),("x"==e?a:3&a|8).toString(16)}));return e}}},d=c,p=(a("4134"),a("2877")),f=Object(p["a"])(d,n,i,!1,null,null,null);e["default"]=f.exports},4134:function(t,e,a){"use strict";a("5a10")},"5a10":function(t,e,a){}}]);
//# sourceMappingURL=chunk-408989aa.fa2b0b7d.js.map