(function(){(window.webpackJsonp=window.webpackJsonp||[]).push([[2],{234:function(le,db,e){e.r(db);var y=e(0);e.n(y);var x=e(21),w=e(8),h=e(4),f=e(55);db["default"]=function(a){function b(a){var b=[];for(a.wa();a.advance();){var e=a.Da();"field"===e?b.push(String(a.V("name"))):console.warn("unrecognised field list element: "+e)}a.Na();return b}function e(a,b){return b?"false"===a?!1:!0:"true"===a?!0:!1}function db(a,f){var h=a.Da();switch(h){case "javascript":return{name:"JavaScript",javascript:a.current.textContent};
case "uri":return{name:"URI",uri:a.V("uri")};case "goto":h=null;a.wa();if(a.advance()){var n=a.V("fit");h={page:a.V("page"),fit:n};if("0"===h.page)console.warn("null page encountered in dest");else switch(f=f(Number(h.page)),n){case "Fit":case "FitB":break;case "FitH":case "FitBH":h.top=f.ha({x:0,y:a.V("top")||0}).y;break;case "FitV":case "FitBV":h.left=f.ha({x:a.V("left")||0,y:0}).x;break;case "FitR":n=f.ha({x:a.V("left")||0,y:a.V("top")||0});f=f.ha({x:a.V("right")||0,y:a.V("bottom")||0});f=new w.a(n.x,
n.y,f.x,f.y);h.top=f.aa;h.left=f.ea;h.bottom=f.ba;h.right=f.fa;break;case "XYZ":n=f.ha({x:a.V("left")||0,y:a.V("top")||0});h.top=n.y;h.left=n.x;h.zoom=a.V("zoom")||0;break;default:console.warn("unknown dest fit: "+n)}h={name:"GoTo",dest:h}}else console.$Y("missing dest in GoTo action");a.Na();return h;case "submit-form":h={name:"SubmitForm",url:a.V("url"),format:a.V("format"),method:a.V("method")||"POST",exclude:e(a.V("exclude"),!1)};f=a.V("flags");h.flags=f?f.split(" "):[];for(a.wa();a.advance();)switch(f=
a.Da(),f){case "fields":h.fields=b(a);break;default:console.warn("unrecognised submit-form child: "+f)}a.Na();return h;case "reset-form":h={name:"ResetForm",exclude:e(a.V("exclude"),!1)};for(a.wa();a.advance();)switch(f=a.Da(),f){case "fields":h.fields=b(a);break;default:console.warn("unrecognised reset-form child: "+f)}a.Na();return h;case "hide":h={name:"Hide",hide:e(a.V("hide"),!0)};for(a.wa();a.advance();)switch(f=a.Da(),f){case "fields":h.fields=b(a);break;default:console.warn("unrecognised hide child: "+
f)}a.Na();return h;case "named":return{name:"Named",action:a.V("name")};default:console.warn("Encountered unexpected action type: "+h)}return null}function r(a,b,e){var f={};for(a.wa();a.advance();){var h=a.Da();switch(h){case "action":h=a.V("trigger");if(b?-1!==b.indexOf(h):1){f[h]=[];for(a.wa();a.advance();){var n=db(a,e);Object(y.isNull)(n)||f[h].push(n)}a.Na()}else console.warn("encountered unexpected trigger on field: "+h);break;default:console.warn("encountered unknown action child: "+h)}}a.Na();
return f}function z(a){return"calculation-order"===a.Da()?b(a):[]}function n(a){return new h.a(a.V("r")||0,a.V("g")||0,a.V("b")||0,a.V("a")||1)}function le(a,b){var e=a.V("name"),f=a.V("type")||"Type1",h=a.V("size"),r=b.ha({x:0,y:0});h=b.ha({x:Number(h),y:0});b=r.x-h.x;r=r.y-h.y;e={name:e,type:f,size:Math.sqrt(b*b+r*r)||0,strokeColor:[0,0,0],fillColor:[0,0,0]};for(a.wa();a.advance();)switch(f=a.Da(),f){case "stroke-color":e.strokeColor=n(a);break;case "fill-color":e.fillColor=n(a);break;default:console.warn("unrecognised font child: "+
f)}a.Na();return e}function oe(a,b){var e={border:{style:"Solid",width:1},backgroundColor:[],fieldName:a.V("field"),page:a.V("page"),index:a.V("index")||0,rotation:a.V("rotation")||0,flags:[]},f=a.V("appearance");f&&(e.appearance=f);(f=a.V("flags"))&&(e.flags=f.split(" "));for(a.wa();a.advance();)switch(f=a.Da(),f){case "rect":var h=a,x=b(Number(e.page));f=x.ha({x:h.V("x1")||0,y:h.V("y1")||0});h=x.ha({x:h.V("x2")||0,y:h.V("y2")||0});f=new w.a(f.x,f.y,h.x,h.y);f.normalize();e.rect={x1:f.x1,y1:f.y1,
x2:f.x2,y2:f.y2};break;case "border":f=a;h={style:f.V("style")||"Solid",width:f.V("width")||1,color:[0,0,0]};for(f.wa();f.advance();)switch(x=f.Da(),x){case "color":h.color=n(f);break;default:console.warn("unrecognised border child: "+x)}f.Na();e.border=h;break;case "background-color":e.backgroundColor=n(a);break;case "actions":e.actions=r(a,"E X D U Fo Bl PO PC PV PI".split(" "),b);break;case "appearances":f=a;h=pe.Bi(e,"appearances");for(f.wa();f.advance();)if(x=f.Da(),"appearance"===x){x=f.V("name");
var y=pe.Bi(h,x);x=f;for(x.wa();x.advance();){var z=x.Da();switch(z){case "Normal":pe.Bi(y,"Normal").data=x.current.textContent;break;default:console.warn("unexpected appearance state: ",z)}}x.Na()}else console.warn("unexpected appearances child: "+x);f.Na();break;case "extra":f=a;h=b;x={};for(f.wa();f.advance();)switch(y=f.Da(),y){case "font":x.font=le(f,h(1));break;default:console.warn("unrecognised extra child: "+y)}f.Na();f=x;f.font&&(e.font=f.font);break;case "captions":h=a;f={};(x=h.V("Normal"))&&
(f.Normal=x);(x=h.V("Rollover"))&&(f.Rollover=x);(h=h.V("Down"))&&(f.Down=h);e.captions=f;break;default:console.warn("unrecognised widget child: "+f)}a.Na();return e}function ke(a){var b={value:a.V("value")};(a=a.V("display-value"))&&(b.displayValue=a);return b}function we(b,e){var f=b.V("name"),h={type:b.V("type"),quadding:b.V("quadding")||"Left-justified",maxLen:b.V("max-len")||-1},n=b.V("flags");Object(y.isString)(n)&&(h.flags=n.split(" "));for(b.wa();b.advance();)switch(n=b.Da(),n){case "actions":h.actions=
r(b,["C","F","K","V"],e);break;case "default-value":n=b;n.wa();n.advance();var w=n.current.textContent;n.Na();h.defaultValue=w;break;case "font":h.font=le(b,e);break;case "options":n=b;w=[];for(n.wa();n.advance();){var x=n.Da();switch(x){case "option":w.push(ke(n));break;default:console.warn("unrecognised options child: "+x)}}n.Na();h.options=w;break;default:console.warn("unknown field child: "+n)}b.Na();return new a.Annotations.ga.oa(f,h)}function ue(a,b){switch(a.type){case "Tx":return new x.h(a,
b);case "Ch":return a.flags.get("Combo")?new x.c(a,b):new x.d(a,b);case "Btn":return a.flags.get("PushButton")?new x.e(a,b):a.flags.get("Radio")?new x.f(a,b):new x.b(a,b);case "Sig":return new x.g(a,b);default:console.warn("Unrecognised field type: "+a.type)}return null}function ve(a,b){var e={number:a.V("number")};for(a.wa();a.advance();){var f=a.Da();switch(f){case "actions":e.actions=r(a,["O","C"],b);break;default:console.warn("unrecognised page child: "+f)}}a.Na();return e}a.uf=a.uf||{};var pe=
a.uf;pe.XM={parse:function(a,b,e,h){var n=[],w={};a.wa();var x=[],y={},db=[];Object(f.a)(function(){if(a.advance()){var e=a.Da();switch(e){case "calculation-order":x=z(a);break;case "document-actions":y=r(a,["Init","Open"],b);break;case "pages":e=[];for(a.wa();a.advance();){var f=a.Da();switch(f){case "page":e.push(ve(a,b));break;default:console.warn("unrecognised page child: "+f)}}a.Na();db=e;break;case "field":e=we(a,b(1));w[e.name]=e;break;case "widget":f=oe(a,b);(e=w[f.fieldName])?(e=ue(e,f),
n.push(e)):console.warn("ignoring widget with no corresponding field data: "+f.fieldName);break;default:console.warn("Unknown element encountered in PDFInfo: "+e)}return!0}return!1},function(){a.Na();e({calculationOrder:x,widgets:n,fields:w,documentActions:y,pages:db,custom:[]})},h)},tV:we,xV:oe,rV:z}}(window)}}]);}).call(this || window)
