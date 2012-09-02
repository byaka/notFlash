/*============================================================*/
//!проблема при попытки проиграть стейт,в котором есть пустые кк

var dragger={'enabled':true,'what':'','tmp':{}};
var kfmode='timechain',kfarea={ratio:1,zoom:1,x:0},dontScrollToRow=false;
var wp={'z':1,'w':0,'h':0};
var mySkl={},panel=['boneTree','boneEdit','wp','keyframesList'];
var hlp={};

hlp.wpO=function(){return {'left':workplace.offset().left-8,'top':workplace.offset().top-8}}
hlp.gBn=function(ind){return skl.getBone(mySkl.ind,ind?ind:boneNow())}

function panelSave(){
   forMe(panel,function(val){lStorage.set(val,$('#'+val).offset(),'object')});
}

function panelLoad(){
   forMe(panel,function(val){
      var v=lStorage.get(val,true);
      if(v) $('#'+val).offset({left:v.left,top:v.top});
   })
}

function funListTab(items){
   forMe(items,function(val){
      var p=$(val).prev().attr('parent');
      if(!p) return;
      $(val).css('margin-left',parseInt($('.selecter#'+p).next().css('margin-left'))+25);
   },true)
}

function funListDel(obj,ind){
   var it=obj.children('.selecter#'+ind).next();
   it.remove();
   obj.children('.selecter#'+ind).remove();
}

function funListAdd(obj,name,ind,parent,buttons,checked,method){
   method=method ||'append';
   if(!obj.hasClass('funlist')) var flobj=obj.parents('.funlist');
   else var flobj=obj;
   if(obj.children('.selecter#'+ind).length){
//==item already exist
   }else{
      var s="<input class='selecter' id='"+ind+"' parent='"+parent+"' type='radio' name='"+flobj.attr('id')+"'"+(checked?" checked":"")+"><label id='item' for='"+ind+"'><div id='name'>"+name+"</div><div id='tools'>";
      if(buttons){
         forMe(buttons,function(val){s+="<div id='button' class='"+val[0]+"'>"+val[1]+"</div>"})
      }
      obj[method](s+"</div></label>");
   }
   if(parent) funListTab([flobj.children('#'+ind).next()[0]]);//becose 'forMe' wath in deep of object
}

function wpZoom(z){
   workplace.css('width',(wp.w*z).toFixed(0)).css('height',(wp.h*z).toFixed(0));
   wp.z=z;
   boneSelect();
}

function wpSave(as){
   var tout={},tarr1=JSON.stringify(mySkl.statesObj);
   tarr1=tarr1.replace(new RegExp('\,\"tind\"\:\".*?._kf\"','g'),'')
              .replace(new RegExp('\"tind\"\:\".*?._kf\"\,','g'),'');
   $.each(mySkl.bones,function(ind,name){
      mySkl.bonesLink[ind].name=name;
      tarr1=tarr1.replace(new RegExp(ind,'g'),name);
   });
   var tarr2=JSON.stringify(mySkl.bonesObj), tarr3=JSON.stringify(mySkl.txtrsObj);
   forMe(mySkl.txtrs,function(ind,name){
      tarr2=tarr2.replace(new RegExp('\"texture\"\:\"'+ind+'\"','g'),'"texture":"'+name+'"');
      tarr3=tarr3.replace(new RegExp('\"'+ind+'\"\:','g'),'"'+name+'":');
      tarr1=tarr1.replace(new RegExp('\:\"'+ind+'\"','g'),':"'+name+'"');
   })
   $.each(mySkl.states,function(ind,name){
      tarr1=tarr1.replace(new RegExp(ind,'g'),name);
   });
   tout.skl=JSON.parse(tarr2);
   tout.states=JSON.parse(tarr1);
   tout.txtrs=JSON.parse(tarr3);
   var s=JSON.stringify(tout);
   if(as=='q') lStorage.set('quicksave',s);
   else fileSave(s,mySkl.name+'.myskl',true);
}

function wpLoad(content,name){
   var tobj=JSON.parse(content);
   sklLoad(name,tobj);
}

function sklClear(name){
   skl.unload(mySkl.ind);
   var s='skl'+getms();
   mySkl={'name':name,'ind':s,'bonesLink':{},'statesObj':{},'bones':{},'states':{},'txtrs':{},'txtrsObj':{},'txtrsLink':{}};
   statelist.html('');
   bonelist.html("<div id='showparent'></div>");
   showparent=$('#bonelist.funlist #showparent');
   $('#boneEdit #texture.line #value').html("<option value='empty'>—————————</option>");
   kflist.html('');
}

function sklLoad(name,obj){
   sklClear(name);
   mySkl.bonesObj=cloneMe(obj.skl);
   skl.cb.loadOne=function(p){
      var ind=randomEx(65536,mySkl.bones,'b','b');
      mySkl.bones[ind]=p.bone
   };
   skl.load(mySkl.ind,mySkl.bonesObj);
   $.each(obj.states,function(ind,val){mySkl.statesObj[ind]=cloneMe(val)});
   var s1=JSON.stringify(mySkl.bonesObj), s2=JSON.stringify(mySkl.statesObj);
   $.each(mySkl.bones,function(ind,val){
      s1=s1.replace(new RegExp('\"name\"\:\"'+val+'\"','g'),'"name":"'+ind+'"');
      s2=s2.replace(new RegExp('\"'+val+'\"\:','g'),'"'+ind+'":');
      s2=s2.replace(new RegExp('\"bone\"\:\"'+val+'\"','g'),'"bone":"'+ind+'"')//==for 'if';
   });
   skl.cb.loadOneTxtr=function(p){
      var ind=randomEx(65536,mySkl.txtrs,'t','t');
      mySkl.txtrs[ind]=p.txtr;
      mySkl.txtrsObj[ind]=cloneMe(p.obj);
      mySkl.txtrsLink[ind]=[];
      s1=s1.replace(new RegExp('\"texture\"\:\"'+p.txtr+'\"','g'),'"texture":"'+ind+'"');
      s2=s2.replace(new RegExp('\:\"'+p.txtr+'\"','g'),':"'+ind+'"');
      $('#boneEdit #texture.line #value').append("<option value='"+ind+"'>"+p.txtr+"</option>");
   }
   skl.textures(mySkl.ind,obj.txtrs);
   mySkl.bonesObj=JSON.parse(s1);
   funListAdd(statelist,'_main_','_main_','',[],true);
   $.each(mySkl.statesObj,function(ind,val){
      var sn=randomEx(65536,mySkl.states,'s','s');
      mySkl.states[sn]=ind;
      s2=s2.replace(new RegExp('\"'+ind+'\"\:','g'),'"'+sn+'":');
      s2=s2.replace(new RegExp('\"timechain\_'+ind+'\"','g'),'"timechain_'+sn+'"');
      funListAdd(statelist,ind,sn,'',[['rename','r'],['del','-']],'');
   });
   statelist.append("<div id='item' style='height: 15px;' for='_add_'>Add</div>");
   mySkl.statesObj=JSON.parse(s2);
   skl.del(mySkl.ind);
//==finish
   skl.cb.loadOneTxtr='';
   skl.cb.loadOneFrame=function(p){if(mySkl.txtrsLink[p.txtr]) mySkl.txtrsLink[p.txtr][p.frame]=p.obj;};
   skl.cb.loadOne=boneRead;
   skl.cb.loadedOne=function(p){
      if(!mySkl.bonesLink[p.bone]) return;
      forMe(p,function(key,val){
         if(['name','bone','parent'].inOf(key)) return;
         mySkl.bonesLink[p.bone][key]=val;
      })
   };
   skl.cb.unloadOne=boneDelCB;
   skl.textures(mySkl.ind,mySkl.txtrsObj).load(mySkl.ind,mySkl.bonesObj).toQ(mySkl.ind);
   stateSelect('_main_');
console.log(skl.object,mySkl);
}

function sklSize(){
   var s={x:65536,y:65536,w:-65536,h:-65536};
   forMe(mySkl.bones,function(ind){
      var b=hlp.gBn(ind);
      if(Math.min(b.absX[0],b.absX[1])<s.x) s.x=Math.min(b.absX[0],b.absX[1]);
      if(Math.max(b.absX[0],b.absX[1])>s.w) s.w=Math.max(b.absX[0],b.absX[1]);
      if(Math.min(b.absY[0],b.absY[1])<s.y) s.y=Math.min(b.absY[0],b.absY[1]);
      if(Math.max(b.absY[0],b.absY[1])>s.h) s.h=Math.max(b.absY[0],b.absY[1]);
   })
   return s;
}

function boneRename(ind,name){
   if(!name) return;
   mySkl.bones[ind]=name;
   bonelist.children('#'+ind).next().children('#name').text(name);
}

function boneRead(p){
   var ind=p.bone, parent=p.parent, name=mySkl.bones[ind];
   if(!mySkl.bonesLink[ind]) mySkl.bonesLink[ind]=p.obj;
   if(!parent){
      funListAdd(bonelist,name,ind,parent,[['add','+'],['rename','r'],['del','-']]);
      $(kflist).html("<div class='row' id='kfl_"+ind+"'><div id='item'>"+name+"</div><div id='kfs'></div></div>");
   }else{
      $(kflist).children('.row#kfl_'+parent).after("<div class='row' id='kfl_"+ind+"'><div id='item'>"+name+"</div><div id='kfs'></div></div>");
      funListAdd($('#bonelist.funlist #'+parent).next(),name,ind,parent,[['add','+'],['rename','r'],['del','-']],'','after');
   }
}

function boneSet(aqueue,save,animate){
   skl.animate(mySkl.ind,aqueue,animate?undefined:0,'boneSelectCB',animate?undefined:'');
   skl.freeze=false;
   skl.start(35);
   if(!save) return;
   $.each(aqueue,function(key,val){
      if(!isArray(val)) val=[val];
      forMe(val,function(val){
         if(stateNow()=='_main_' && val.what.toLowerCase()=='offset'){
            mySkl.bonesLink[key].x=val.to[0];
            mySkl.bonesLink[key].y=val.to[1];
         }else if(stateNow()=='_main_') mySkl.bonesLink[key][val.what]=val.to;
         else if(kfNow()){
            if(val.what=='texture')
               kfSet(key,{'startAt':kfNow().get('_','_'),'what':val.what,'to':val.to});
            else
               kfSet(key,{'startAt':kfNow().get('_','_'),'what':val.what,'to':val.to,'clockwise':val.clockwise,'duration':val.duration});
         }
      })
   })
}

function boneNow(){
   return getChecked($("#bonelist.funlist .selecter"),'id');
}

function boneHighlight(ind){
   var bone=skl.getBone(mySkl.ind,ind);
   $(canvas).clearCanvas();
   if(boneNow()) $(canvas).drawLine({strokeStyle:"#1CCDF2",strokeWidth:2,rounded:true,
                                         x1:hlp.gBn().absX[0],y1:hlp.gBn().absY[0],
                                         x2:hlp.gBn().absX[1],y2:hlp.gBn().absY[1]});
   if(ind) $(canvas).drawLine({strokeStyle:"#CE64F7",strokeWidth:2,rounded:true,
                                 x1:bone.absX[0],y1:bone.absY[0],x2:bone.absX[1],y2:bone.absY[1]});
}

function boneSelectCB(p){
   if(p.bone!==boneNow()) return;
   $(pin).offset({'left':hlp.wpO().left+hlp.gBn().absX[1]*wp.z,'top':hlp.wpO().top+hlp.gBn().absY[1]*wp.z});
   boneHighlight();
   $('.line#angle #value').attr('value',hlp.gBn(p.bone).angle);
   $('.line#size #value').attr('value',hlp.gBn(p.bone).size);
   $('.line#offset #valuex').attr('value',hlp.gBn(p.bone).x);
   $('.line#offset #valuey').attr('value',hlp.gBn(p.bone).y);
}

function boneSelect(ind){
//!проверить лишние вызовы
   if(ind==undefined) ind=boneNow();
   else if(boneNow()!==ind) $("#bonelist.funlist .selecter#"+ind).attr('checked','checked');
   $(pin).offset({'left':hlp.wpO().left+hlp.gBn().absX[1]*wp.z,'top':hlp.wpO().top+hlp.gBn().absY[1]*wp.z});
   $(kflist).children('.row').removeClass('sel1');
   $(kflist).children('.row#kfl_'+ind).addClass('sel1');
   boneHighlight();
   if(stateNow()=='_main_'){
      $('.line#offset #valuex').attr('value',mySkl.bonesLink[ind].x);
      $('.line#offset #valuey').attr('value',mySkl.bonesLink[ind].y);
      $('.line#angle #value').attr('value',mySkl.bonesLink[ind].angle);
      $('.line#size #value').attr('value',mySkl.bonesLink[ind].size);
      $('.line#frame #value').attr('value',mySkl.bonesLink[ind].texture?mySkl.bonesLink[ind].frame:'')
                             .attr('disabled',mySkl.bonesLink[ind].texture?false:'disabled');
      $('.line#texture #value option[value='+(mySkl.bonesLink[ind].texture?mySkl.bonesLink[ind].texture:'empty')+']').attr('selected','selected');
   }
//else if(!kfNow() || kfNow().get('','_')!==ind) $($('#kfpanel .row#kfl_'+ind+' #kfs .kfr')[0]).attr('checked','checked').change();
   if(!dontScrollToRow) $(kflist).scrollTop($(kflist).children('.row#kfl_'+ind).index()*22);
   dontScrollToRow=false;
}

function boneAdd(parent,ind,p){
//!доделать добавление кости в стэйт _main_
   var obj=mySkl.bonesLink[parent];
   if(!obj) return;
   var nobj={'x':p.dx||0, 'y':p.dy||0, 'angle':p.angle||0, 'size':p.size, 'name':ind, 'shape':[], 'zindex':p.zindex||1, 'texture':p.texture, 'frame':p.frame||0, 'bones':[]};
   if(!obj.bones) obj.bones=[];
   obj.bones.push(nobj);
   mySkl.bones[ind]=p.name;
   mySkl.bonesLink[ind]=nobj;
   skl.load(mySkl.ind,[nobj],parent);
}

function boneDelCB(p){
   delete(mySkl.bonesLink[p.bone]);
   delete(mySkl.bones[p.bone]);
   funListDel(bonelist,p.bone);
}

function boneDel(ind){
   var p=$('.selecter#'+ind).attr('parent');
   if(p!=='undefined'){
      var obj=mySkl.bonesLink[p];
      if(!obj) return;
      obj.bones.del(obj.bones.inObj('name',ind)-1);
      boneSelect(p);
   }else mySkl.bonesObj={};
   if(stateNow()!=='_main_') pin.addClass('hidden');
   forMe(mySkl.statesObj,function(val){delete(val[ind])},true);
   kflist.children('.row#kfl_'+ind).remove();
   skl.stop();
   skl.del(mySkl.ind,ind);
   skl.start(35);
}

function kfAdd(ind,p,sind){
//!добавить возможность упаковывать несколько кк для одной кости в один момент времени,
//!они записываются в .obj как массив
   sind=sind||stateNow();
   if(kfmode=='timechain'){
      if(!mySkl.statesObj[sind][ind]) mySkl.statesObj[sind][ind]=[];
      var s=ind+'_'+p.startAt+'_kf';
      $(kflist).children('.row#kfl_'+ind).children('#kfs').append("<input type='radio' name='kf' class='kfr' id='"+s+"'><div class='kf'><label id='me'></label><div id='beginat'></div><div id='duration'></div></div>");
      var ths=kfSet(ind,p,sind).ths;
      var tobj=$(kflist).children('.row#kfl_'+ind).children('#kfs').children('#'+s);
      var t=$(kflist).children('.row#kfl_'+ind).position().top;
      tobj.next().children('#beginat').css('margin-top',0-t).css('height',t);
   }
   return ths;
}

function kfDel(ind,sAt,sind){
   sind=sind||stateNow();
   var kf=kfFind(ind,sAt,sind);
   mySkl.statesObj[sind][ind].del(kf.index);
   if(!mySkl.statesObj[sind][ind].length) delete(mySkl.statesObj[sind][ind]);
   var ths=$(kf.ths).nextAll('.kfr');
   if(!ths.length) ths=$(kf.ths).prevAll('.kfr');
   if(!ths.length) ths=[undefined];
   $(kf.ths).next('.kf').remove();
   $(kf.ths).remove();
   $(ths[0]).attr('checked','checked').change();
   if(!ths[0]) pin.addClass('hidden');
}

function kfFind(ind,sAt,sind){
   sind=sind||stateNow();
   var s=ind+'_'+sAt+'_kf';
   var index=mySkl.statesObj[sind][ind].inObj('tind',s)-1;
   var obj=mySkl.statesObj[sind][ind][index];
   var ths=$("#kfs #"+s+".kfr");
   return {'obj':obj,'ths':ths,'index':index};
}

function kfSet(ind,p,sind){
   var s=ind+'_'+p.startAt+'_kf', kf=kfFind(ind,p.startAt,sind||stateNow());
   if(!kf.obj){
      mySkl.statesObj[sind][ind].push({'tind':s,'if':skl.chkf,'args':[{'bone':'flag$','key':'timechain_'+sind,'val':1},{'bone':'flag$end','key':'timechain_'+sind,'val':p.startAt}]});
      kf=kfFind(ind,p.startAt,sind||stateNow());
   }
   if(p.startAtNew!==undefined) s=ind+'_'+p.startAtNew+'_kf';
   if(kf.ths.next('.kf').children('#me').attr('for')!==s){
      kf.ths.next('.kf').children('#me').attr('for',s);
      kf.ths.next('.kf').css('left',(p.left-9)+'px');
      kf.ths.attr('id',s);
//!обработку для мульти кк
      kf.obj.tind=s;
      kf.obj.args[1].val=parseInt(s.get('_','_'));
   }
   if(p.what && p.del){
      delete(kf.obj.what);
      delete(kf.obj.to);
      delete(kf.obj.duration);
      delete(kf.obj.clockwise);
      kf.ths.next().children('#duration').css('width',0);
   }else if(p.what){
      kf.obj.what=p.what;
      kf.obj.to=p.to;
      if(p.duration!==undefined) kf.obj.duration=p.duration;
      if(p.clockwise!==undefined) kf.obj.clockwise=p.clockwise;
      kf.ths.next().children('#duration').css('width',(kf.obj.duration>15?kf.obj.duration-1:0));
   }
   if(!kf.obj.what) kf.ths.next('.kf').children('#me').addClass('empty');
   else kf.ths.next('.kf').children('#me').removeClass('empty');
   if(['angle','size','offset'].inOf(kf.obj.what)) kf.ths.next('.kf').children('#me').addClass('param');
   else kf.ths.next('.kf').children('#me').removeClass('param');
   if(['texture','frame'].inOf(kf.obj.what)) kf.ths.next('.kf').children('#me').addClass('txtr');
   else kf.ths.next('.kf').children('#me').removeClass('txtr');
   if(!p.del) $('.spoiler#'+p.what).attr('iopen','true');
   return kf;
}

function kfSelect(ind,time){
   var kf=kfFind(ind,time);
   if(!kf.obj) return;
   if(isArray(kf.obj)){

   }else{
      if(!kf.obj.what){
         $('.spoiler').attr('iopen','false');
         $('.line #value').attr('value','0');//!тут какойто косяк
         $('.line #duration').attr('value','0');
         $('.line #clockwise').attr('checked',false);
      }else{
         $('.spoiler').attr('iopen','false');
         $('.spoiler#'+kf.obj.what).attr('iopen','true');
         if(kf.obj.what=='offset'){
            $('.line#'+kf.obj.what+' #valuex').attr('value',kf.obj.to[0]);
            $('.line#'+kf.obj.what+' #valuey').attr('value',kf.obj.to[1]);
         }else $('.line#'+kf.obj.what+' #value').attr('value',kf.obj.to);
         $('.line#'+kf.obj.what+' #duration').attr('value',kf.obj.duration);
         $('.line#'+kf.obj.what+' #clockwise').attr('checked',(kf.obj.clockwise?'checked':false));
         boneSet(objMake(ind,kf.obj));
      }
   }
   pin.removeClass('hidden');
}

function kfNow(){
   return getChecked($('#kfs .kfr'),'id');
}

function kfClear(){
   $(kflist).children('.row').children('#kfs').html('');
}

function kfS2L(s){
   return s/kfarea.ratio/kfarea.zoom+$(kflist).children('.row').children('#item').width();
}

function kfRead(obj,ind){
//==ind is state's index
   $.each(obj,function(bone,kfs){
      forMe(kfs,function(kf){
         if(kfmode=='timechain'){
            if(bone=='flag$' || !kf.args || !kf.args[1] || kf.args[1].bone!=='flag$end') return;
            if(!kf.tind) kf.tind=bone+'_'+kf.args[1].val+'_kf';
            kfAdd(bone,{'startAt':kf.args[1].val,'left':kfS2L(kf.args[1].val),'what':kf.what,'to':kf.to,'duration':kf.duration,'clockwise':kf.clockwise},ind);
         }
      })
   });
}

function stateSelect(ind){
   if(ind!=='_main_' && !mySkl.states[ind]) return;
   kfClear();
   if(!boneNow()) boneSelect(byIndex(mySkl.bones,0));
   if(ind=='_main_'){
      kflist.css('visibility','hidden');
      $('#kftools').hide();
      $('.line #clockwise').parent().hide();
      $('.line #duration').parent().hide();
      var mainstate={};
      $.each(mySkl.bonesLink,function(key,val){
         mainstate[key]=[];
         mainstate[key].push({'what':'x','to':val.x});
         mainstate[key].push({'what':'y','to':val.y});
         mainstate[key].push({'what':'angle','to':val.angle});
         mainstate[key].push({'what':'size','to':val.size});
         mainstate[key].push({'what':'frame','to':val.frame});
         mainstate[key].push({'what':'texture','to':val.texture});
      });
      boneSet(mainstate);
      pin.removeClass('hidden');
      $('.spoiler').attr('iopen','true');
   }else{
      $('#kftools').show();
      $('.line #clockwise').parent().show();
      $('.line #duration').parent().show();
      kfRead(mySkl.statesObj[ind],ind);
      kflist.css('visibility','visible');
      pin.addClass('hidden');
      boneSelect();
      $('.spoiler').attr('iopen','false');
   }
}

function stateNow(){
   var s=getChecked(statelist.children(".selecter"),'id');
   return s;
}

function stateRename(ind,name){
   if(!name) return;
   mySkl.states[ind]=name;
   statelist.children('#'+ind).next().children('#name').text(name);
}
function stateAdd(ind,p){
   if(mySkl.states[ind]) return false;
   if(kfmode=='timechain')
      mySkl.statesObj[ind]={'flag$':[{'what':'timechain_'+ind,'to':1,'duration':0}]};
   else
      mySkl.statesObj[ind]={};
   if(p && p.name) mySkl.states[ind]=p.name;
   else mySkl.states[ind]=ind;
   funListAdd($('#statelist.funlist div#item'),ind,ind,'',[['rename','r'],['del','-']],(p && p.focus||''),'before');
   if(p && p.focus) stateSelect(ind);
   return true;
}

function boneDelCB(p){
   delete(mySkl.bonesLink[p.bone]);
   delete(mySkl.bones[p.bone]);
   funListDel(bonelist,p.bone);
}

function stateDel(ind){
   if(stateNow()==ind) $(statelist).children('.selecter#_main_').attr('checked','checked').change();
   delete(mySkl.bonesObj[ind]);
   delete(mySkl.bones[ind]);
   funListDel(statelist,ind);
}

function drawHelper(p){
   if(p.bone!==boneNow()) return;
   if($(dragger.tmp.ths).hasClass('tool_rotate')){
      $(canvas).clearCanvas().drawLine({strokeStyle:"#00DD00", strokeWidth:2, rounded:true,
         x1:p.params.x2, y1:p.params.y2,
         x2:hlp.gBn().absX[0], y2:hlp.gBn().absY[0],
         x3:hlp.gBn().absX[1], y3:hlp.gBn().absY[1]
      });
      $(dragger.tmp.ths).offset({left:hlp.wpO().left+p.params.x2*wp.z,top:hlp.wpO().top+p.params.y2*wp.z});
   }else if($(dragger.tmp.ths).hasClass('tool_size') || $(dragger.tmp.ths).hasClass('tool_move')){
      $(canvas).clearCanvas().drawLine({strokeStyle:"#00DD00", strokeWidth:2, rounded:true,
         x1:p.params.x1, y1:p.params.y1,
         x2:p.params.x2, y2:p.params.y2
      });
      $(dragger.tmp.ths).offset({left:hlp.wpO().left+p.params.x2*wp.z,top:hlp.wpO().top+p.params.y2*wp.z});
   }
}

$(document).ready(function(){
   mCircle($('.mcircle'));
   panelLoad();
   $(document).keyboard('ctrl+shift+s',{preventDefault:true},function(){wpSave()});
   $(document).keyboard('ctrl+s',{preventDefault:true},function(){wpSave('q')});
   $(document).keyboard('ctrl+shift+l',{preventDefault:true},function(){fileLoad(wpLoad)});
   $(document).keyboard('ctrl+l',{preventDefault:true},function(){wpLoad(lStorage.get('quicksave'))});

   $(window).on('mousedown',function(e){
      if(e.button!==1) return;
      e.preventDefault();
      mCircle.show($('#toolbar0.mcircle'),{'speed':200,'left':e.pageX,'top':e.pageY},function(o){
         var id=$(o).attr('id');
         if(!id) return;
         else if(id=='new') sklLoad('NewSkeleton',{'skl':{'x':320, 'y':220, 'angle':360, 'size':100, 'name':'root', 'shape':[], 'zindex':1, 'texture':'', 'bones':[]},'states':{}});
         else if(id=='load') wpLoad(lStorage.get('quicksave'));
         else if(id=='loadto') fileLoad(wpLoad);
         else if(id=='save') wpSave('q');
         else if(id=='saveto') wpSave();
      });
      return false;
   })

   $('.spoiler').on('mousedown',function(e){
      if(stateNow()=='_main_' || !kfNow() || !$(e.target).hasClass('spoiler') || e.offsetY>16) return;
      e.preventDefault;
      $(this).attr('iopen',!$(this).attr('iopen').bool());
      if(kfNow() && !$(this).attr('iopen').bool())
         kfSet(boneNow(),{'what':$(this).attr('id'),'del':true,'startAt':kfNow().get('_','_')});
   });

   $('#kfpanel').on('click','.row',function(e){
//      e.preventDefault();
      var ind=$(this).attr('id').slice(4);
      dontScrollToRow=true;
      $('#bonelist .selecter#'+ind).attr('checked','checked').change();
   });

   $(bonelist).on('change','.selecter',function(e){boneSelect($(this).attr('id'))});

   $(bonelist).on('mouseenter','#item',function(e){
      boneHighlight($(this).attr('for'));
      var p=$(this).prev().attr('parent');
      if(p=='undefined') var t=0,l=-10,w=0,h=0;
      else{
         var o=$(bonelist).children('#'+p);
         var t=o.position().top+$(bonelist).position().top+17, h=$(this).position().top-t+24;
         var l=parseInt(o.next().css('margin-left'))+5;
         var w=parseInt($(this).css('margin-left'))-l+4;
      }
      $(showparent).css('top',t).css('left',l).css('height',h).css('width',w);
   });

   $(bonelist).on('mousedown','#item #button',function(e){
      e.preventDefault();
      var bid=$(this).parents('#item').attr('for');
      if(!bid) return;
      if($(this).hasClass('add')) boneAdd(bid,randomEx(65536,mySkl.bones,'b','b'),{'name':'test','size':25});
      else if($(this).hasClass('del')) boneDel(bid);
      else if($(this).hasClass('rename')) boneRename(bid,prompt('Input name',mySkl.bones[bid]));
   });

   $('#bonelist,#kfpanel').on('mouseleave',function(e){
      $(showparent).css('top',0).css('left',-10).css('height',0).css('width',0);
      boneHighlight();
   });

   $('#statelist').on('change','.selecter',function(e){stateSelect($(this).attr('id'))});

   $('#statelist').on('mousedown','#item #button',function(e){
      e.preventDefault();
      var sid=$(this).parents('#item').attr('for');
      if(!sid) return;
      if($(this).hasClass('del')) stateDel(sid);
      else if($(this).hasClass('rename')) stateRename(sid,prompt('Input name',mySkl.states[sid]));
   });
   $('#statelist').on('mousedown','div#item',function(e){
      e.preventDefault;
      var s=randomEx(65536,mySkl.states,'s','s');
      stateAdd(s,{focus:true});
   });

   $('.dndPanel').on('mousedown','#title',function(e){
      e.preventDefault();
      dragger.what='dndPanel';
      dragger.tmp.ths=$(this).parent();
      dragger.tmp.startX=e.pageX;
      dragger.tmp.startY=e.pageY;
      dragger.tmp.deltaX=0;
      dragger.tmp.deltaY=0;
      dragger.tmp.hX=dragger.tmp.startX-$(dragger.tmp.ths).offset().left;
      dragger.tmp.hY=dragger.tmp.startY-$(dragger.tmp.ths).offset().top;
      dragger.tmp.moved=false;
      var grid=5;
      $(this).parent().addClass('moved');
      $(window).on('mousemove', function(e){
         e.preventDefault();
         var dx=Math.floor((dragger.tmp.startX-e.pageX)/grid)*grid;
         var dy=Math.floor((dragger.tmp.startY-e.pageY)/grid)*grid;
         if(dragger.tmp.deltaX==dx && dragger.tmp.deltaY==dy) return false;
         dragger.tmp.deltaX=dx;
         dragger.tmp.deltaY=dy;
         $(dragger.tmp.ths).css({'left':dragger.tmp.startX-dragger.tmp.hX-dragger.tmp.deltaX,
                                          'top':dragger.tmp.startY-dragger.tmp.hY-dragger.tmp.deltaY});
         return false;
      });
      return false;
   });

   $('#delkf').click(function(e){
      e.preventDefault();
      var k=kfNow();
      if(k) kfDel(k.get('','_'),k.get('_','_'));
   });

   $('#play').click(function(e){
      e.preventDefault();
      boneSet(mySkl.statesObj[stateNow()],false,true);
//!при анимировании позиции пин не перемещается на новое место
   });

   $('#playb').click(function(e){
      e.preventDefault();
      boneSet(objMake([boneNow(),'flag$'],[mySkl.statesObj[stateNow()][boneNow()],mySkl.statesObj[stateNow()]['flag$']]),false,true);
   });

   $('#kfpanel').on('mouseenter','.row',function(e){
      boneHighlight($(this).attr('id').get('_'));
   });

   $('#kfpanel').on('mousemove','.row #kfs .kf #duration',function(e){
//      e.preventDefault();
      var x=kfarea.x+e.offsetX+parseInt($(this).parent().prev().attr('id').get('_','_'));
      if(x<0) return;
      kftoolsind.text(x*kfarea.ratio*kfarea.zoom).css('font-weight','normal');
   });

   $('#kfpanel').on('mousemove','.row',function(e){
//      e.preventDefault();
      var x=kfarea.x+e.offsetX-$(this).children('#item').width();
      if(x<0) return;
      kftoolsind.text(x*kfarea.ratio*kfarea.zoom).css('font-weight','normal');
   });

   $('#kfpanel').on('dblclick','.row #kfs .kf #duration',function(e){
      e.preventDefault();
      var ind=$(this).parents('.row').attr('id').slice(4);
      var x=kfarea.x+e.offsetX+parseInt($(this).parent().prev().attr('id').get('_','_'));
      kfAdd(ind,{'startAt':x*kfarea.ratio*kfarea.zoom,'left':x+$(this).parents('.row').children('#item').width()}).attr('checked','checked').change();
      return false;
   });

   $('#kfpanel').on('dblclick','.row',function(e){
      e.preventDefault();
      var ind=$(this).attr('id').slice(4);
      var x=kfarea.x+e.offsetX;
      kfAdd(ind,{'startAt':(x-$(this).children('#item').width())*kfarea.ratio*kfarea.zoom,'left':x}).attr('checked','checked').change();
   });

   $('#kfpanel').on('change','.row #kfs .kfr',function(e){
      kfSelect($(this).attr('id').get('','_'),$(this).attr('id').get('_','_'));
   });

   $('#kfpanel').on('mouseenter','.row #kfs .kf #me',function(e){
      kftoolsind.text($(this).attr('for').get('_','_')).css('font-weight','bold');
   });

   $('#kfpanel').on('mousedown','.row #kfs .kf #me',function(e){
      e.preventDefault();
      dragger.what='kf';
      dragger.tmp.ths=$(this).parent();
      dragger.tmp.old=$(this).attr('for').get('_','_');
      dragger.tmp.ind=$(this).attr('for').get('','_');
      var sx=e.pageX,grid=1,odx=0;
      $(window).on('mousemove',function(e){
         e.preventDefault();
         var dx=Math.floor((sx-e.pageX)/grid)*grid;
         if(odx==dx) return false;
         odx=dx;
         var x=kfarea.x+sx-dragger.tmp.ths.parent().prev().offset().left-dx;
         if(x<dragger.tmp.ths.parent().prev().width()) x=dragger.tmp.ths.parent().prev().width();
         var s=(x-dragger.tmp.ths.parent().prev().width())*kfarea.ratio*kfarea.zoom;
         kfSet(dragger.tmp.ind,{'left':x, 'startAt':dragger.tmp.old, 'startAtNew':s});
         dragger.tmp.old=s;
         kftoolsind.text(s).css('font-weight','bold');
         return false;
      });
      return false;
   });

   $(workplace).on('mousedown','#output',function(e){
      if(e.button==1) return;
      e.preventDefault();
      $(this).addClass('grabbing');
      dragger.what='wp';
      dragger.tmp.startX=e.pageX;
      dragger.tmp.startY=e.pageY;
      dragger.tmp.scrlX=$('#wp #content').scrollLeft();
      dragger.tmp.scrlY=$('#wp #content').scrollTop();
      dragger.tmp.deltaX=0;
      dragger.tmp.deltaY=0;
      dragger.tmp.moved=false;
      dragger.tmp.ths=e.target;
      var grid=1;
      $(window).on('mousemove', function(e){
         e.preventDefault();
         var dx=Math.floor((dragger.tmp.startX-e.pageX)/grid)*grid;
         var dy=Math.floor((dragger.tmp.startY-e.pageY)/grid)*grid;
         if(dragger.tmp.deltaX==dx && dragger.tmp.deltaY==dy) return false;
         dragger.tmp.deltaX=dx;
         dragger.tmp.deltaY=dy;
         $('#wp #content').scrollLeft(dragger.tmp.scrlX+dx).scrollTop(dragger.tmp.scrlY+dy).scroll();
         return false;
      });
      return false;

   })

   $('#wp #content').on('scroll',function(e){$(pin).offset({'left':hlp.wpO().left+hlp.gBn().absX[1]*wp.z,'top':hlp.wpO().top+hlp.gBn().absY[1]*wp.z})})

   $(pin)[0].oncontextmenu=function(){return false}

   $(pin).on('mousedown',function(e){
      e.preventDefault();
      if(e.button==1){
         mCircle.show($('#toolbar1.mcircle'),{'speed':100,'left':e.pageX,'top':e.pageY},function(o){
            var id=$(o).attr('id');
            if(!id) return;
            else if(id=='angle') $(pin).removeClass('tool_size').removeClass('tool_move').addClass('tool_rotate');
            else if(id=='size') $(pin).addClass('tool_size').removeClass('tool_move').removeClass('tool_rotate');
            else if(id=='position') $(pin).removeClass('tool_size').addClass('tool_move').removeClass('tool_rotate');
         });
         return false;
      }
      skl.stop();
      skl.freeze=true;
      dragger.what='pin';
      dragger.tmp.startX=e.pageX;
      dragger.tmp.startY=e.pageY;
      dragger.tmp.deltaX=0;
      dragger.tmp.deltaY=0;
      dragger.tmp.moved=false;
      dragger.tmp.ths=e.target;
      var grid=1;
      $(window).on('mousemove', function(e){
         if(!dragger.enabled) return true;
         e.preventDefault();
         var dx=Math.floor((dragger.tmp.startX-e.pageX)/grid)*grid;
         var dy=Math.floor((dragger.tmp.startY-e.pageY)/grid)*grid;
         if(dragger.tmp.deltaX==dx && dragger.tmp.deltaY==dy) return false;
         dragger.tmp.deltaX=dx;
         dragger.tmp.deltaY=dy;
         if($(dragger.tmp.ths).hasClass('tool_rotate')){
            var x=(dragger.tmp.startX-dx-8-hlp.wpO().left)-hlp.gBn().absX[0]*wp.z;
            var y=hlp.gBn().absY[0]*wp.z-(dragger.tmp.startY-dy-8-hlp.wpO().top);
            var angle=Math.atan(y/(x+0.01))*rad2deg;
            if(x<0) angle+=180;
            if(angle<0) angle+=360;
            angle=Math.round(reAngle(90+angle-(hlp.gBn().absAngle-hlp.gBn().angle)))
            dragger.tmp.result=angle;
            skl.virtualize(mySkl.ind,{'bone':[boneNow()],'angle':[dragger.tmp.result]},drawHelper);
            dragger.tmp.moved=true;
         }else if($(dragger.tmp.ths).hasClass('tool_size')){
            var x=(dragger.tmp.startX-dx-8-hlp.wpO().left)-hlp.gBn().absX[0]*wp.z;
            var y=hlp.gBn().absY[0]*wp.z-(dragger.tmp.startY-dy-8-hlp.wpO().top);
            dragger.tmp.result=Math.round(Math.sqrt(x*x+y*y)/wp.z);
            skl.virtualize(mySkl.ind,{'bone':[boneNow()],'size':[dragger.tmp.result]},drawHelper);
            dragger.tmp.moved=true;
         }else if($(dragger.tmp.ths).hasClass('tool_move')){
            var x=(dragger.tmp.startX-dx-8-hlp.wpO().left)-hlp.gBn().absX[1]*wp.z;
            var y=hlp.gBn().absY[1]*wp.z-(dragger.tmp.startY+dy-8-hlp.wpO().top);
            dragger.tmp.result=[Math.round(hlp.gBn().x+x/wp.z),Math.round(hlp.gBn().y+y/wp.z)];
            skl.virtualize(mySkl.ind,{'bone':[boneNow()],'x':[dragger.tmp.result[0]],'y':[dragger.tmp.result[1]]},drawHelper);
            dragger.tmp.moved=true;
         }
         return false;
      });
      return false;
   });

   $(window).on('mouseup', function(e){
      $(window).off('mousemove');
      if(dragger.what=='wp'){
         $(dragger.tmp.ths).removeClass('grabbing');
         return;
      }else if(dragger.what=='dndPanel'){
         $(dragger.tmp.ths).removeClass('moved');
         panelSave();
         return;
      }
      if(!dragger.enabled || !dragger.tmp.moved) return true;
      dragger.tmp.moved=false;
      $(canvas).clearCanvas();
      if($(dragger.tmp.ths).hasClass('tool_rotate'))
         boneSet(objMake(boneNow(),{'what':'angle','to':dragger.tmp.result}),true);
      else if($(dragger.tmp.ths).hasClass('tool_size'))
         boneSet(objMake(boneNow(),{'what':'size','to':dragger.tmp.result}),true);
      else if($(dragger.tmp.ths).hasClass('tool_move'))
         boneSet(objMake(boneNow(),{'what':'offset','to':dragger.tmp.result}),true);
      return;
   });

   $('#boneEdit').on('change','.spoiler .line input,.spoiler .line select',function(e){
      if($(this).attr('minme') && $(this).attr('maxme')){
         var min=parseInt($(this).attr('minme')), max=parseInt($(this).attr('maxme'));
         var v=parseInt($(this).attr('value'));
         if(v>max) $(this).attr('value',min);
         else if(v<min) $(this).attr('value',max);
      }
      if(!boneNow() || (stateNow()!=='_main_' && !kfNow())) return;
      var what=$(this).parent().attr('id'), ths='#boneEdit .spoiler#'+what+' .line#'+what+' #';
      if(what=='offset') var to=[$(ths+'valuex').attr('value'),$(ths+'valuey').attr('value')];
      else var to=$(ths+'value').attr('value');
      boneSet(objMake(boneNow(),[{'what':what,'to':to,'clockwise':$(ths+'clockwise').attr('checked')=='checked','duration':$(ths+'duration').attr('value')}]),true);
   });

   $('#viewmode').on('change','input',function(e){skl.drawMode[e.target.id]=$(e.target).attr('checked')=='checked'});
   $('#zoom').on('change',function(e){wpZoom(parseFloat($(this).attr('value')))});
   if(skl.drawMode.textures) $('#viewmode #textures').attr('checked','checked');
   if(skl.drawMode.bones) $('#viewmode #bones').attr('checked','checked');
   if(skl.drawMode.shapes) $('#viewmode #shapes').attr('checked','checked');
   workplace=$('#workplace');
   wp.w=parseInt(workplace.css('width'));
   wp.h=parseInt(workplace.css('height'));
   canvas=$('#output.help');
   kflist=$('#kfpanel');
   pin=$('#pin');
   speedcounter=$('#speedcounter');
   skl.out([$('#output.general')[0].getContext('2d')]);
//   skl.out([$('#output.general')[0]]);
   statelist=$('#statelist.funlist');
   bonelist=$('#bonelist.funlist');
   showparent=$('#bonelist.funlist #showparent');
   kftoolsind=$('#kftools #ind');
//==parse skl
   sklLoad('NewSkeleton',{'skl':{'x':320, 'y':220, 'angle':360, 'size':100, 'name':'root', 'shape':[], 'zindex':1, 'texture':'', 'bones':[]},'states':{}});
   skl.start(35);
   setInterval(function(){
      if(!mySkl.ind) return;
      $(speedcounter).text(((skl.object[mySkl.ind].speed.time/skl.object[mySkl.ind].speed.count)*25).toFixed(0));
/*
      var s=sklSize();
      var w=parseInt($('#output').width()), h=parseInt($('#output').height());
      if(w-s.w<=150) w+=(150-(w-s.w));
      if(h-s.h<=150) h+=(150-(h-s.h));
      $('#output').width(w).height(h);
      wp.w=w;
      wp.h=h;
      wp.Zoom(wp.z);
*/
      skl.object[mySkl.ind].speed.time=0;
      skl.object[mySkl.ind].speed.count=0;
   },1000);
});