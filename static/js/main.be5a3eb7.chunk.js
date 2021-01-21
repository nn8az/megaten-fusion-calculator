(this["webpackJsonpmegaten-fusion-calculator"]=this["webpackJsonpmegaten-fusion-calculator"]||[]).push([[0],{106:function(e,n,t){},107:function(e,n,t){"use strict";t.r(n);var a=t(2),i=t(0),r=t.n(i),s=t(13),o=t.n(s),c=function(e){e&&e instanceof Function&&t.e(3).then(t.bind(null,170)).then((function(n){var t=n.getCLS,a=n.getFID,i=n.getFCP,r=n.getLCP,s=n.getTTFB;t(e),a(e),i(e),r(e),s(e)}))},l=t(11),u=t(84),d=t(160),m=t(161),h=t(12),v=t(23),f=t(30),b=t(19),j=function e(n,t,a,i,r){Object(v.a)(this,e),this.id=0,this.name=void 0,this.lvl=void 0,this.race=void 0,this.rank=0,this.specialRecipe=!1,this.stats=[],this.id=n,this.name=t,this.lvl=a,this.race=i,this.stats=r};j.statsName=[];var g=function(){function e(n,t){Object(v.a)(this,e),this.demon=void 0,this.ingredients=void 0,this.demon=n,this.ingredients=t}return Object(f.a)(e,[{key:"isFused",value:function(){return!!this.ingredients&&this.ingredients.length>0}},{key:"getBaseIngredients",value:function(){if(this.ingredients){var e,n={},t=Object(h.a)(this.ingredients);try{for(t.s();!(e=t.n()).done;){var a=e.value;n=Object(b.a)(Object(b.a)({},n),a.getBaseIngredients())}}catch(r){t.e(r)}finally{t.f()}return n}var i={};return i[this.demon.id]=this.demon,i}},{key:"getBaseIngredientsCounts",value:function(){if(this.ingredients){var e,n={},t=Object(h.a)(this.ingredients);try{for(t.s();!(e=t.n()).done;){var a=e.value.getBaseIngredientsCounts();for(var i in a)n[i]=(n[i]||0)+a[i]}}catch(s){t.e(s)}finally{t.f()}return n}var r={};return r[this.demon.id]=1,r}},{key:"toBaseIngredientsIdCode",value:function(){return Object.keys(this.getBaseIngredients()).join("-")}},{key:"toBaseIngredientSearchString",value:function(){return Object.values(this.getBaseIngredients()).map((function(e){return e.name})).join(" ")}},{key:"isWeakerThanIngredients",value:function(){return this.demon.lvl<this.getHighestIngredientLvl()}},{key:"getHighestIngredientLvl",value:function(){var e=0;if(this.ingredients){var n,t=Object(h.a)(this.ingredients);try{for(t.s();!(n=t.n()).done;){var a=n.value.getHighestIngredientLvl();a>e&&(e=a)}}catch(i){t.e(i)}finally{t.f()}return e}return this.demon.lvl}}]),e}(),p=function e(n,t){Object(v.a)(this,e),this.caption="",this.demons=[],this.caption=n,this.demons=t},O="Element",y=function(){function e(n,t,a,i){Object(v.a)(this,e),this.demonsAry=[],this.normalFusionChart={},this.tripleFusionChart={},this.elementsMap={},this.elementFusionChart={},this.demonsPresets=[],this.gameHasElements=!1,this._usePersonaSameRaceFusionMechanic=!1,this._usePersonaTripleFusionMechanic=!1,this.disableSameDemonFusion=!1,this.idMap={},this.nameMap={},this.raceIdMap={},this.raceLvlDemonMap={},this.parseDemons(n),this.prepDemonIds(),a&&this.parseSettings(a),this.parseFusionChart(t),this.prepRaceLvlInfo(),i&&this.parsePresets(i)}return Object(f.a)(e,[{key:"getDemonById",value:function(e){return this.idMap[e]}},{key:"getDemonByName",value:function(e){return this.nameMap[e]}},{key:"getDemonArray",value:function(){return this.demonsAry}},{key:"getDemonPresets",value:function(){return this.demonsPresets}},{key:"fuseDemons",value:function(e,n){if(e.id!==n.id||!this.disableSameDemonFusion)return e.race===O&&n.race===O?void 0:e.race===O||n.race===O?this.fuseDemonWithElement(e,n):e.race===n.race?this.fuseDemonSameRaceNoElement(e,n):this.fuseDemonDiffRaceNoElement(e,n)}},{key:"tripleFuseDemons",value:function(e,n,t){var a=this;if(!this.disableSameDemonFusion||e.id!==n.id&&e.id!==t.id&&n.id!==t.id){var i=[e,n,t].sort((function(e,n){return e.lvl!==n.lvl?e.lvl-n.lvl:a.getRaceOrder(n.race)-a.getRaceOrder(e.race)})),r=Object(l.a)(i,3),s=r[0],o=r[1],c=r[2],u=this.getFusionRace(s.race,o.race);if(u){var d=this.getTripleFusionRace(u,c.race);if(d){var m=this.getLvlTableForRace(d,!0),h=(s.lvl+o.lvl+c.lvl+12.75)/3,v=this.findResultLvlFromLvlTable(m,h,!0),f=this.getDemonFromRaceLvl(d,v);if(f){if(f.id!==s.id&&f.id!==o.id&&f.id!==c.id)return f;var b=m.indexOf(v);if(!(b<0))return b+1<m.length?(v=m[b+1],this.getDemonFromRaceLvl(d,v)):void 0}}}}}},{key:"testGetDemon",value:function(e){if(e)return this.getDemonByName(e);if(0!==this.demonsAry.length){var n=Math.floor(Math.random()*this.demonsAry.length);return this.demonsAry[n]}}},{key:"testGetRandomElement",value:function(){var e=Object.keys(this.elementsMap),n=e.length;if(0!==n){var t=Math.floor(Math.random()*n),a=Number(e[t]);return this.elementsMap[a]}}},{key:"testFuseDemonWithAll",value:function(e){var n=this.testGetDemon(e);if(n){for(var t={},a=0;a<this.demonsAry.length;a++){var i=this.demonsAry[a],r=this.fuseDemons(n,i);r&&(t[i.name]=r)}console.log(n),console.log(t)}}},{key:"testTripleFuseDemonWithAll",value:function(e){var n=this.testGetDemon(e);if(n){for(var t={},a={},i=0;i<this.demonsAry.length;i++)for(var r=this.demonsAry[i],s=i;s<this.demonsAry.length;s++){var o=this.demonsAry[s],c=this.tripleFuseDemons(n,r,o);c&&(t[c.name]||(t[c.name]=[]),a[c.name]||(a[c.name]={}),a[c.name][r.name]||(a[c.name][r.name]=[]),a[c.name][o.name]||(a[c.name][o.name]=[]),t[c.name].push([r,o]),a[c.name][r.name].push(o.name),a[c.name][o.name].push(r.name))}console.log(n),console.log(t),console.log(a)}}},{key:"parseDemons",value:function(e){j.statsName=e.statsName;var n=e.demons;for(var t in n){var a=n[t];this.demonsAry.push(new j(0,t,a.lvl,a.race,a.stats))}}},{key:"parseSettings",value:function(e){this._usePersonaSameRaceFusionMechanic="persona"===e.sameRaceFusionMechanic,this._usePersonaTripleFusionMechanic="persona"===e.tripleFusionMechanic,this.disableSameDemonFusion=Boolean(e.disableSameDemonFusion)}},{key:"parseFusionChart",value:function(e){for(var n=0;n<e.raceFusionTable.length;n++)for(var t=0;t<e.raceFusionTable[n].length;t++){var a=[];if(this._usePersonaTripleFusionMechanic)t<n?a.push(this.tripleFusionChart):t===n?(a.push(this.tripleFusionChart),a.push(this.normalFusionChart)):a.push(this.normalFusionChart);else{if(t>n)continue;a.push(this.normalFusionChart)}for(var i=e.races[n],r=e.races[t],s=e.raceFusionTable[n][t],o=0,c=a;o<c.length;o++){var l=c[o];l[i]||(l[i]={}),l[i][r]=s,l[r]||(l[r]={}),l[r][i]=s}}if(e.specialRecipes)for(var u in e.specialRecipes){var d=this.getDemonByName(u);d&&(d.specialRecipe=!0,d.rank=1e3)}for(var m=0;m<e.races.length;m++)this.raceIdMap[e.races[m]]=m;if(e.elements&&e.elements.length>0){this.gameHasElements=!0;for(var h={},v=0;v<e.elements.length;v++){var f=e.elements[v],b=this.getDemonByName(f);b&&(this.elementsMap[b.id]=b,h[b.id]=v)}if(e.elementFusionTable)for(var j in this.raceIdMap){this.elementFusionChart[j]={};var g=this.raceIdMap[j];for(var p in this.elementsMap){var O=h[p];e.elementFusionTable[g]&&(this.elementFusionChart[j][p]=e.elementFusionTable[g][O])}}}}},{key:"parsePresets",value:function(e){if(e){var n,t=Object(h.a)(e.presets);try{for(t.s();!(n=t.n()).done;){var a,i=n.value,r=[],s=Object(h.a)(i.demons);try{for(s.s();!(a=s.n()).done;){var o=a.value,c=this.getDemonByName(o);c&&r.push(c)}}catch(u){s.e(u)}finally{s.f()}var l=new p(i.caption,r);this.demonsPresets.push(l)}}catch(u){t.e(u)}finally{t.f()}}}},{key:"prepDemonIds",value:function(){this.demonsAry=this.demonsAry.sort((function(e,n){return e.lvl>n.lvl?1:-1}));var e,n=1,t=Object(h.a)(this.demonsAry);try{for(t.s();!(e=t.n()).done;){var a=e.value;a.id=n,this.idMap[a.id]=a,this.nameMap[a.name]=a,n++}}catch(i){t.e(i)}finally{t.f()}}},{key:"prepRaceLvlInfo",value:function(){var e,n=Object(h.a)(this.demonsAry);try{for(n.s();!(e=n.n()).done;){var t=e.value;this.raceLvlDemonMap[t.race]||(this.raceLvlDemonMap[t.race]={}),this.raceLvlDemonMap[t.race][t.lvl]=t}}catch(s){n.e(s)}finally{n.f()}var a,i=Object(h.a)(this.demonsAry);try{for(i.s();!(a=i.n()).done;){var r=a.value;r.specialRecipe||(r.rank=this.getLvlTableForRace(r.race,!0).indexOf(r.lvl))}}catch(s){i.e(s)}finally{i.f()}}},{key:"getLvlTableForRace",value:function(e,n){if(!this.raceLvlDemonMap[e])return[];var t=[];for(var a in this.raceLvlDemonMap[e])n&&this.raceLvlDemonMap[e][a].specialRecipe||t.push(Number(a));return t}},{key:"getDemonFromRaceLvl",value:function(e,n){if(this.raceLvlDemonMap[e]&&this.raceLvlDemonMap[e][n])return this.raceLvlDemonMap[e][n]}},{key:"getFusionRace",value:function(e,n){if(this.normalFusionChart[e]&&this.normalFusionChart[e][n])return this.normalFusionChart[e][n]}},{key:"getTripleFusionRace",value:function(e,n){if(this.tripleFusionChart[e]&&this.tripleFusionChart[e][n])return this.tripleFusionChart[e][n]}},{key:"getRaceOrder",value:function(e){return this.raceIdMap[e]}},{key:"findResultLvlFromLvlTable",value:function(e,n,t){for(var a=0,i=0;i<e.length;i++)n>e[i]&&a++;if(a>=e.length){if(t)return-1;a=e.length-1}return e[a]}},{key:"fuseDemonDiffRaceNoElement",value:function(e,n){var t=this.getFusionRace(e.race,n.race);if(t){var a=this.getLvlTableForRace(t,!0);if(0!==a.length){var i=(n.lvl+e.lvl+1)/2,r=this.findResultLvlFromLvlTable(a,i);return this.getDemonFromRaceLvl(t,r)}}}},{key:"fuseDemonSameRaceNoElement",value:function(e,n){if(this.gameHasElements){var t=this.getFusionRace(e.race,n.race);if(!t)return;return this.getDemonByName(t)}if(this._usePersonaSameRaceFusionMechanic){var a,i=this.getLvlTableForRace(n.race,!0).filter((function(n){return n!==e.lvl})),r=-1,s=Object(h.a)(i);try{for(s.s();!(a=s.n()).done;){var o=a.value;e.lvl+n.lvl>=2*o&&(r+=1)}}catch(l){s.e(l)}finally{s.f()}if(i[r]===n.lvl&&(r-=1),r<0)return;var c=i[r];return this.getDemonFromRaceLvl(e.race,c)}}},{key:"fuseDemonWithElement",value:function(e,n){var t,a;if(e.race===O)t=e,a=n;else{if(n.race!==O)return this.fuseDemonSameRaceNoElement(e,n);t=n,a=e}var i=this.elementFusionChart[a.race][t.rank];if(void 0!==i){var r=this.getLvlTableForRace(a.race),s=a.rank+i;if(!(s<0||s>=r.length))return this.getDemonFromRaceLvl(a.race,r[s])}}},{key:"usePersonaTripleFusionMechanic",get:function(){return this._usePersonaTripleFusionMechanic}},{key:"usePersonaSameRaceFusionMechanic",get:function(){return this._usePersonaSameRaceFusionMechanic}}]),e}(),x=t(159),_=t(154),C=t(156),F=t(147),D=t(153),S=t(155),k=t(151),R=t(168),N=t(152),I=t(51),B=t.n(I),T=t(166),L=function(e){var n,t=e.dataTableProvider,i=r.a.useState(0),s=Object(l.a)(i,2),o=s[0],c=s[1],u=r.a.useState(void 0),d=Object(l.a)(u,2),m=d[0],v=d[1],f=r.a.useState(void 0),j=Object(l.a)(f,2),g=j[0],p=j[1],O=r.a.useState("string"),y=Object(l.a)(O,2),x=y[0],R=y[1],I=t.pageSize,L=t.getColumnDefinition(),w=t.getAllRowsData(),U=w.length;if(0===U){void 0!==m&&v(void 0),1!==o&&c(1),void 0!==g&&p(void 0);var H=Object(a.jsx)(r.a.Fragment,{}),E=t.renderBanner?t.renderBanner():void 0;return E&&(H=E),H}if(n=Math.ceil(U/I),(o-1)*I>=U)return c(Math.ceil(U/I)),Object(a.jsx)(r.a.Fragment,{});var V=w.map((function(e,n){return{id:n,data:e}}));if(void 0!==m&&void 0!==g&&void 0!==t.getSortValue){var G=t.getSortValue,z="asc"===g?1:-1,W="number"===x?M:A;V.sort((function(e,n){var t=G(e.data,m),a=G(n.data,m);return z*W(t,a)}))}var q=V.filter((function(e,n){return n>=(o-1)*I&&n<o*I}));var J,K=[],Y=0,Z=Object(h.a)(L);try{for(Z.s();!(J=Z.n()).done;){var X=J.value,Q=X.sortSpec?P(X.headerContent,Y,X.sortSpec.sortType,[m,v],[g,p],[x,R]):X.headerContent;K.push(Object(a.jsx)(F.a,Object(b.a)(Object(b.a)({},X.headerProps),{},{children:Q}),"H-"+Y)),Y++}}catch(ie){Z.e(ie)}finally{Z.f()}var $,ee=[],ne=Object(h.a)(q);try{for(ne.s();!($=ne.n()).done;){var te=$.value;ee.push(Object(a.jsx)(k.a,{children:t.renderRow(te.data)},te.id))}}catch(ie){ne.e(ie)}finally{ne.f()}var ae=B.a.paperContainer;return e.className&&(ae+=" "+e.className),Object(a.jsx)(N.a,{className:ae,elevation:3,children:Object(a.jsxs)(D.a,{className:B.a.tableContainer,children:[Object(a.jsxs)(_.a,{children:[Object(a.jsx)(S.a,{className:B.a.header,children:Object(a.jsx)(k.a,{children:K})}),Object(a.jsx)(C.a,{className:B.a.tableBody,children:ee})]}),Object(a.jsx)(T.a,{count:n,page:o,onChange:function(e,n){c(n)},size:"small"})]})})};function A(e,n){return e>n?1:e===n?0:-1}function M(e,n){return e-n}function P(e,n,t,i,r,s){var o=Object(l.a)(i,1)[0],c=Object(l.a)(r,1)[0];return Object(a.jsx)(R.a,{active:o===n&&void 0!==c,direction:o===n?c:void 0,onClick:w(n,t,i,r,s),children:e})}function w(e,n,t,a,i){return function(r){var s=Object(l.a)(t,2),o=s[0],c=s[1],u=Object(l.a)(a,2),d=u[0],m=u[1],h=Object(l.a)(i,2)[1],v=d;o===e?("asc"===d&&(v="desc"),"desc"===d&&(v=void 0),void 0===d&&(v="asc")):v="asc",m(v),c(e),h(n)}}var U,H=t(167),E=t(65),V=t.n(E),G=function(e){var n;return e.icon&&(n=Object(a.jsx)("div",{className:V.a.icon,children:e.icon})),Object(a.jsxs)(N.a,{className:e.className?e.className:V.a.warningBanner,children:[n,Object(a.jsx)("span",{children:e.message})]})},z=r.a.memo(G),W=t(157),q=t(78),J=t.n(q),K=t(77),Y=t.n(K),Z=t(34),X=t.n(Z);function Q(e){return Object(a.jsx)(W.a,{onClick:function(n){e.onRemoveIngredient&&e.onRemoveIngredient(e.demonId)},className:X.a.removeDemonButton,children:Object(a.jsx)(Y.a,{className:X.a.removeDemonButtonIcon})})}function $(e){var n=e.demonId,t=e.setting,i=e.ingredientsSettings,r=!1;switch(t){case U.mustUse:r=i[n].mustUse;break;case U.multipleUse:default:r=i[n].multipleUse}return Object(a.jsx)(H.a,{className:X.a.checkBox,defaultChecked:r,onChange:function(e,a){switch(t){case U.mustUse:i[n].mustUse=e.target.checked;break;case U.multipleUse:default:i[n].multipleUse=e.target.checked}},color:"default"})}!function(e){e[e.multipleUse=1]="multipleUse",e[e.mustUse=2]="mustUse"}(U||(U={}));var ee=function(){function e(n,t){Object(v.a)(this,e),this.pageSize=25,this.demonCompendium=void 0,this.ingredients=void 0,this.ingredientsSettings=void 0,this.onRemoveIngredient=void 0,this.allRowsData=void 0,this.demonCompendium=n.demonCompendium,this.ingredients=n.ingredients,this.ingredientsSettings=n.ingredientsSettings,this.onRemoveIngredient=n.onRemoveIngredient,this.allRowsData=t}return Object(f.a)(e,[{key:"getColumnDefinition",value:function(){return[{headerContent:"Demon",sortSpec:{sortType:"string"},headerProps:{className:X.a.nameColumnHeader}},{headerContent:"Level",sortSpec:{sortType:"number"},headerProps:{className:X.a.raceColumnHeader}},{headerContent:"Race",sortSpec:{sortType:"string"}},{headerContent:"Only Show Recipes That Use This Demon",headerProps:{width:150,align:"center"}},{headerContent:"Can Use Multiple per Recipe",headerProps:{width:120,align:"center"}},{}]}},{key:"getAllRowsData",value:function(){return this.allRowsData}},{key:"renderRow",value:function(e){return Object(a.jsxs)(r.a.Fragment,{children:[Object(a.jsx)(F.a,{children:e.name}),Object(a.jsx)(F.a,{children:e.lvl}),Object(a.jsx)(F.a,{children:e.race}),Object(a.jsx)(F.a,{align:"center",children:Object(a.jsx)($,{demonId:e.id,setting:U.mustUse,ingredientsSettings:this.ingredientsSettings})}),Object(a.jsx)(F.a,{align:"center",children:Object(a.jsx)($,{demonId:e.id,setting:U.multipleUse,ingredientsSettings:this.ingredientsSettings})}),Object(a.jsx)(F.a,{children:Object(a.jsx)(Q,{demonId:e.id,onRemoveIngredient:this.onRemoveIngredient})})]})}},{key:"getSortValue",value:function(e,n){switch(n){case 0:return e.name;case 1:return e.lvl;case 2:return e.race;default:return e.name}}},{key:"renderBanner",value:function(){var e=Object(a.jsx)(J.a,{className:X.a.warningIcon});return Object(a.jsx)(z,{message:"No ingredient demons. Use the section above to add demons to use for fusions.",icon:e})}}]),e}(),ne=function(e){!function(e,n){for(var t in e)n[t]||(n[t]={mustUse:!1,multipleUse:!1})}(e.ingredients,e.ingredientsSettings);var n=r.a.useMemo((function(){var n=[];for(var t in e.ingredients){var a=e.demonCompendium.getDemonById(Number(t));a&&n.push(a)}return n}),[e.ingredients,e.demonCompendium]),t=new ee(e,n);return Object(a.jsx)(L,{dataTableProvider:t,className:X.a.dataTable})},te=r.a.memo(ne),ae=t(24),ie=t.n(ae),re=function(){function e(n){Object(v.a)(this,e),this.pageSize=50,this.fusionResults=void 0,this.fusionResults=n.fusionResults}return Object(f.a)(e,[{key:"getColumnDefinition",value:function(){for(var e=[{headerContent:"Demon",sortSpec:{sortType:"string"},headerProps:{className:ie.a.nameColumn}},{headerContent:"Level",sortSpec:{sortType:"number"},headerProps:{className:ie.a.lvlColumn}},{headerContent:"Race",sortSpec:{sortType:"string"},headerProps:{className:ie.a.raceColumn}}],n=j.statsName,t=0;t<n.length;t++)e.push({headerContent:n[t],headerProps:{className:ie.a.statColumn},sortSpec:{sortType:"number"}});return e.push({headerContent:"Recipe"}),e}},{key:"getAllRowsData",value:function(){var e=[];for(var n in this.fusionResults)if(1!==Number(n))for(var t in this.fusionResults[n]){var a,i=Object(h.a)(this.fusionResults[n][t]);try{for(i.s();!(a=i.n()).done;){var r=a.value;e.push(r)}}catch(s){i.e(s)}finally{i.f()}}return e}},{key:"renderRow",value:function(e){var n=[],t=0;n.push(Object(a.jsxs)(r.a.Fragment,{children:[Object(a.jsx)(F.a,{className:ie.a.nameColumn,children:e.demon.name}),Object(a.jsx)(F.a,{className:ie.a.lvlColumn,children:e.demon.lvl}),Object(a.jsx)(F.a,{className:ie.a.raceColumn,children:e.demon.race})]},t)),t++;var i,s=Object(h.a)(e.demon.stats);try{for(s.s();!(i=s.n()).done;){var o=i.value;n.push(Object(a.jsx)(r.a.Fragment,{children:Object(a.jsx)(F.a,{className:ie.a.statColumn,children:o})},t)),t++}}catch(c){s.e(c)}finally{s.f()}return n.push(Object(a.jsx)(r.a.Fragment,{children:Object(a.jsx)(F.a,{children:this.renderRecipe(e)})},t)),t++,Object(a.jsx)(r.a.Fragment,{children:n})}},{key:"getSortValue",value:function(e,n){switch(n){case 0:return e.demon.name;case 1:return e.demon.lvl;case 2:return e.demon.race;default:return e.demon.stats[n-3]}}},{key:"renderBanner",value:function(){return Object(a.jsx)(z,{message:"No results found"})}},{key:"renderDemonName",value:function(e){return e.isFused()?Object(a.jsx)(r.a.Fragment,{children:e.demon.name}):Object(a.jsx)("span",{className:ie.a.baseIngredientName,children:e.demon.name})}},{key:"renderRecipe",value:function(e){var n=Object(a.jsx)(r.a.Fragment,{});if(e.ingredients){var t,i=Object(a.jsx)(r.a.Fragment,{}),s=!0,o=Object(h.a)(e.ingredients);try{for(o.s();!(t=o.n()).done;){var c=t.value;n=Object(a.jsxs)(r.a.Fragment,{children:[n,this.renderRecipe(c)]});var l=s?void 0:Object(a.jsx)(r.a.Fragment,{children:" + "});i=Object(a.jsxs)(r.a.Fragment,{children:[i,l,this.renderDemonName(c)]}),s=!1}}catch(d){o.e(d)}finally{o.f()}var u=this.renderDemonName(e);return Object(a.jsxs)(r.a.Fragment,{children:[n,Object(a.jsxs)("div",{className:ie.a.recipeLine,children:[i," = ",u]})]})}return n}}]),e}(),se=function(e){var n=new re(e);return Object(a.jsx)(L,{dataTableProvider:n,className:ie.a.dataTable})},oe=r.a.memo(se),ce=t(163),le=t(169),ue=t(37),de=t.n(ue),me=function e(){Object(v.a)(this,e),this.charLvl=99,this.maxIngredient=3,this.useTripleFusion=!1,this.useTripleFusionSettingIsVisible=!1};function he(e){var n=e.eventHandlers,t=e.settings,r=Object(i.useState)(!1),s=Object(l.a)(r,2),o=s[0],c=s[1],u=Object(i.useState)(t.charLvl),d=Object(l.a)(u,2),m=d[0],h=d[1],v=Object(i.useState)(t.maxIngredient),f=Object(l.a)(v,2),b=f[0],j=f[1];n.toggleVisibility=function(){c(!o)};var g={};return o||(g.height="0px"),Object(a.jsx)("div",{style:g,className:de.a.settingsPanel,children:Object(a.jsxs)(N.a,{variant:"outlined",className:de.a.paper,children:[Object(a.jsx)("h2",{children:"Settings"}),Object(a.jsx)(ve,{label:"Character level",min:1,max:99,emptyFieldValue:99,fieldStateValueAndSetter:[m,h],onSetSettings:function(e){t.charLvl=e}}),Object(a.jsx)(ve,{label:"Max ingredients per recipe",min:2,max:5,emptyFieldValue:3,fieldStateValueAndSetter:[b,j],onSetSettings:function(e){t.maxIngredient=e}}),t.useTripleFusionSettingIsVisible?Object(a.jsx)(fe,{label:"Allow triple fusion",checked:t.useTripleFusion,onSetSettings:function(e){t.useTripleFusion=e}}):void 0]})})}function ve(e){var n=e.label,t=e.fieldStateValueAndSetter,i=e.onSetSettings,r=e.min,s=e.max,o=e.emptyFieldValue,c=Object(l.a)(t,2),u=c[0],d=c[1];return Object(a.jsxs)("div",{className:"".concat(de.a.settingsLine," ").concat(de.a.numberSettings),children:[Object(a.jsx)("span",{className:de.a.numberFieldLabel,children:n}),Object(a.jsx)(ce.a,{style:{width:"50px"},type:"number",InputLabelProps:{shrink:!0},inputProps:{min:r,max:s,step:1},variant:"outlined",value:u,onChange:function(e){var n=e.target.value;if(""===n)return d(""),void i(o);var t=Number(n);t>=r&&t<=s&&(d(t),i(t))}})]})}function fe(e){var n=e.label,t=e.checked,i=e.onSetSettings;return Object(a.jsx)("div",{className:"".concat(de.a.settingsLine),children:Object(a.jsx)(le.a,{control:Object(a.jsx)(H.a,{defaultChecked:t,onChange:function(e){i(e.target.checked)},color:"default"}),label:n})})}var be=t(165),je=t(80),ge=t.n(je),pe=t(38),Oe=t.n(pe);function ye(e){var n=e.demonCompendium,t=e.onAddDemon,i=Object(a.jsx)(r.a.Fragment,{});return n.getDemonPresets().length>0&&(i=Object(a.jsxs)(r.a.Fragment,{children:[Object(a.jsx)("p",{children:"Add from presets"}),Object(a.jsx)(Ce,{demonCompendium:n,onAddDemon:t})]})),Object(a.jsxs)("div",{className:Oe.a.demonAdderContainer,children:[Object(a.jsx)("p",{children:"Add by searching"}),Object(a.jsx)(xe,{demonCompendium:n,onAddDemon:t}),Object(a.jsx)("p",{children:"Add by entering level range"}),Object(a.jsx)(_e,{demonCompendium:n,onAddDemon:t}),i]})}function xe(e){var n=e.demonCompendium,t=e.onAddDemon,r=Object(i.useState)(null),s=Object(l.a)(r,2),o=s[0],c=s[1],u=n.getDemonArray();function d(){o&&(t([o]),c(null))}return Object(a.jsxs)("div",{className:Oe.a.subAdderContainer,children:[Object(a.jsx)(be.a,{value:o,options:u,onChange:function(e,n){c(n)},onKeyPress:function(e){"Enter"===e.key&&d()},getOptionLabel:function(e){return e.name},getOptionSelected:function(e,n){return e.id===n.id},style:{width:300},autoHighlight:!0,autoSelect:!0,renderInput:function(e){return Object(a.jsx)(ce.a,Object(b.a)(Object(b.a)({},e),{},{label:"Enter demon name",variant:"outlined"}))}}),Object(a.jsx)(Fe,{onClick:function(){d()}})]})}function _e(e){var n=e.demonCompendium,t=e.onAddDemon,r=Object(i.useState)(1),s=Object(l.a)(r,2),o=s[0],c=s[1],u=Object(i.useState)(99),d=Object(l.a)(u,2),m=d[0],v=d[1];function f(e){for(var n=e.key,t=!1,a=0,i=["0","1","2","3","4","5","6","7","8","9"];a<i.length;a++){if(n===i[a]){t=!0;break}}t||(e.preventDefault(),e.stopPropagation())}function b(e,n){var t=n.target.value,a=Number(t);(""===t||a>=1&&a<=99)&&e(n.target.value)}return Object(a.jsxs)("div",{className:Oe.a.subAdderContainer,children:[Object(a.jsxs)("div",{className:Oe.a.lvlFieldsContainer,children:[Object(a.jsx)(ce.a,{label:"Min Lv",style:{width:"147px"},type:"number",InputLabelProps:{shrink:!0},variant:"outlined",value:o,onChange:b.bind(void 0,c),onKeyPress:f}),Object(a.jsx)(ce.a,{label:"Max Lv",style:{width:"147px"},type:"number",InputLabelProps:{shrink:!0},variant:"outlined",value:m,onKeyPress:f,onChange:b.bind(void 0,v)})]}),Object(a.jsx)(Fe,{onClick:function(){var e,a=[],i=Object(h.a)(n.getDemonArray());try{for(i.s();!(e=i.n()).done;){var r=e.value;r.lvl>=o&&r.lvl<=m&&a.push(r)}}catch(s){i.e(s)}finally{i.f()}t(a)}})]})}function Ce(e){var n,t=e.demonCompendium,r=e.onAddDemon,s=Object(i.useState)(null),o=Object(l.a)(s,2),c=o[0],u=o[1],d=[],m=1,v=Object(h.a)(t.getDemonPresets());try{for(v.s();!(n=v.n()).done;){var f=n.value;d.push({id:m,preset:f}),m++}}catch(g){v.e(g)}finally{v.f()}function j(){c&&(r(c.preset.demons),u(null))}return Object(a.jsxs)("div",{className:Oe.a.subAdderContainer,children:[Object(a.jsx)(be.a,{value:c,options:d,onChange:function(e,n){u(n)},onKeyPress:function(e){"Enter"===e.key&&j()},getOptionLabel:function(e){return e.preset.caption},getOptionSelected:function(e,n){return e.id===n.id},style:{width:300},autoHighlight:!0,autoSelect:!0,renderInput:function(e){return Object(a.jsx)(ce.a,Object(b.a)(Object(b.a)({},e),{},{label:"Select a preset",variant:"outlined"}))}}),Object(a.jsx)(Fe,{onClick:function(){j()}})]})}function Fe(e){var n=e.onClick;return Object(a.jsxs)(x.a,{variant:"outlined",onClick:n,className:Oe.a.addDemonButton,children:[Object(a.jsx)(ge.a,{}),"Add"]})}var De,Se,ke=t(83),Re=t.n(ke),Ne=t(81),Ie=t.n(Ne),Be=t(82),Te=t.n(Be),Le=t(39),Ae=t.n(Le);function Me(e,n,t,a){for(var i={},r=1;r<=t.maxIngredient&&r<=5;r++)i[r]={};for(var s in e){var o=n.getDemonById(Number(s));if(o){var c=new g(o);i[1][o.id]||(i[1][o.id]=[]),i[1][o.id].push(c)}}for(var l=2;l<=t.maxIngredient&&l<=5;l++){for(var u=l-1;u>=l/2;u--){var d=l-u,m={};for(var v in i[u])if(0!==i[u][v].length){var f=i[u][v][0].demon;for(var b in i[d])if(0!==i[d][b].length){var j=i[d][b][0].demon;if(!m[j.id]){var p=n.fuseDemons(f,j);if(p&&Ue(i,t,p,l,[f,j])){var O=Ve(p,a,i[u][v],i[d][b]);i[l][p.id]||(i[l][p.id]=[]);var y,x=Object(h.a)(O);try{for(x.s();!(y=x.n()).done;){var _=y.value;i[l][p.id].push(_)}}catch(R){x.e(R)}finally{x.f()}}}}m[f.id]=!0}}t.useTripleFusion&&Pe(e,n,t,a,i,l)}var C=function(e,n){var t={};for(var a in n)e[a].mustUse&&(t[a]=!0);return t}(a,e),F=Ee.bind(void 0,C);for(var D in i)if(1!==Number(D))for(var S in i[D]){var k=i[D][S];k=(k=k.filter((function(e){return!e.isWeakerThanIngredients()}))).filter(F),i[D][S]=k}return i}function Pe(e,n,t,a,i,r){for(var s=[];we(s,r);){var o=s[0],c=s[1],l=s[2],u={};for(var d in i[o])if(0!==i[o][d].length){var m=i[o][d][0].demon,v={};for(var f in i[c])if(!u[Number(f)]&&0!==i[c][f].length){var b=i[c][f][0].demon;for(var j in i[l])if(!u[Number(j)]&&!v[Number(j)]&&0!==i[l][j].length){var g=i[l][j][0].demon,p=n.tripleFuseDemons(m,b,g);if(p&&Ue(i,t,p,r,[m,b,g])){var O=Ve(p,a,i[o][d],i[c][f],i[l][j]);i[r][p.id]||(i[r][p.id]=[]);var y,x=Object(h.a)(O);try{for(x.s();!(y=x.n()).done;){var _=y.value;i[r][p.id].push(_)}}catch(C){x.e(C)}finally{x.f()}}}v[b.id]=!0}u[m.id]=!0}}}function we(e,n){if(n<3)return!1;if(e.length<3)return e[0]=n-2,e[1]=1,e[2]=1,!0;for(var t=e.length-2;t>=0;t--){var a=t+1;if(e[t]-e[a]>=2)return e[t]=e[t]-1,e[a]=e[a]+1,!0}return!1}function Ue(e,n,t,a,i){for(var r=!1,s=a-1;s>=1;s--)if(e[s][t.id]){r=!0;break}if(r)return!1;if(t.lvl>n.charLvl)return!1;if(a===n.maxIngredient){var o,c=Object(h.a)(i);try{for(c.s();!(o=c.n()).done;){var l=o.value;if(t.lvl<l.lvl)return!1}}catch(u){c.e(u)}finally{c.f()}}return!0}function He(e,n){var t=n.getBaseIngredientsCounts();for(var a in t)if(t[a]>1&&!e[a].multipleUse)return!1;return!0}function Ee(e,n){var t=Object(b.a)({},e),a=n.getBaseIngredientsCounts();for(var i in a)delete t[i];return!(Object.keys(t).length>0)}function Ve(e,n){for(var t=[],a=[],i=arguments.length,r=new Array(i>2?i-2:0),s=2;s<i;s++)r[s-2]=arguments[s];for(var o=0;o<r.length;o++)t.push(0);for(;;){for(var c=[],l=0;l<r.length;l++)c.push(r[l][t[l]]);a.push(new g(e,c));for(var u=!0,d=t.length-1;d>=0;d--){var m=t[d];if(u&&(m+=1,u=!1),m>=r[d].length&&(m=0,u=!0),t[d]=m,!u)break}if(u)break}return a.filter(He.bind(void 0,n))}function Ge(e){var n=Object(b.a)({},De);delete n[e],Se(n)}var ze={};function We(e){var n=new me;return n.useTripleFusion=e.usePersonaTripleFusionMechanic,n.useTripleFusionSettingIsVisible=e.usePersonaTripleFusionMechanic,n}function qe(e){var n=e.demonCompendium,t=Object(i.useState)({}),r=Object(l.a)(t,2);De=r[0],Se=r[1];var s=Object(i.useState)({}),o=Object(l.a)(s,2),c=o[0],u=o[1],d=Object(i.useState)(1),m=Object(l.a)(d,2),v=m[0],f=m[1],j={},g=Object(i.useState)([We(n)]),p=Object(l.a)(g,1)[0][0],O=Object(i.useRef)(null);return Object(i.useEffect)((function(){var e;(function(e){var n=!1;for(var t in e)if(1!==Number(t)&&Object.keys(e[t]).length>0){n=!0;break}return n})(c)&&(null===(e=O.current)||void 0===e||e.scrollIntoView({behavior:"smooth"}))}),[c]),Object(a.jsxs)("div",{className:Ae.a.fusionRecommender,children:[Object(a.jsx)("h2",{children:"Add Demons to Use as Fusion Ingredients"}),Object(a.jsxs)("div",{className:Ae.a.addDemonsAndButtonsRowContainer,children:[Object(a.jsx)(ye,{demonCompendium:n,onAddDemon:function(e){var n,t=Object(b.a)({},De),a=Object(h.a)(e);try{for(a.s();!(n=a.n()).done;){t[n.value.id]=!0}}catch(i){a.e(i)}finally{a.f()}Se(t)}},v),Object(a.jsxs)("div",{className:Ae.a.buttonsRow,children:[Object(a.jsxs)(x.a,{className:Ae.a.calculateButton,variant:"outlined",onClick:function(){u(Me(De,n,p,ze))},disabled:0===Object.keys(De).length,children:[Object(a.jsx)(Ie.a,{}),"Calculate"]}),Object(a.jsx)(x.a,{className:Ae.a.settingsButton,variant:"outlined",onClick:function(){j.toggleVisibility&&j.toggleVisibility()},children:Object(a.jsx)(Te.a,{})}),Object(a.jsxs)(x.a,{className:Ae.a.resetButton,variant:"outlined",onClick:function(){Se({}),ze={},u({}),f((v+1)%2)},children:[Object(a.jsx)(Re.a,{}),"Reset"]})]})]}),Object(a.jsx)(he,{settings:p,eventHandlers:j},v),Object(a.jsx)("h2",{children:"Fusion Ingredients"}),Object(a.jsx)(te,{demonCompendium:n,ingredients:De,ingredientsSettings:ze,onRemoveIngredient:Ge}),Object(a.jsx)("h2",{children:"Results"}),Object(a.jsx)("div",{ref:O,children:Object(a.jsx)(oe,{fusionResults:c})})]})}t(106);var Je,Ke=t(164),Ye=t(162),Ze=Object(u.a)({palette:{type:"dark"},typography:{fontFamily:"sans-serif",fontSize:14}});function Xe(e){var n=t.e(7).then(t.t.bind(null,174,3)).then((function(e){return e.default})),a=t.e(8).then(t.t.bind(null,175,3)).then((function(e){return e.default})),i=t.e(9).then(t.t.bind(null,176,3)).then((function(e){return e.default}));Promise.all([n,a,i]).then((function(n){var t=new y(n[0],n[1],n[2]);e(t)}))}function Qe(e,n){switch(e){case Je.person4Golden:Xe(n);break;case Je.devilSurvivor2:!function(e){var n=t.e(4).then(t.t.bind(null,171,3)).then((function(e){return e.default})),a=t.e(5).then(t.t.bind(null,172,3)).then((function(e){return e.default})),i=t.e(6).then(t.t.bind(null,173,3)).then((function(e){return e.default}));Promise.all([n,a,i]).then((function(n){var t=new y(n[0],n[1],void 0,n[2]);e(t)}))}(n);break;default:Xe(n)}}function $e(){var e=Object(i.useState)(void 0),n=Object(l.a)(e,2),t=n[0],r=n[1],s=Object(i.useState)(Je.person4Golden),o=Object(l.a)(s,2),c=o[0],u=o[1];Object(i.useEffect)((function(){Qe(c,r)}),[c]);var h=t?Object(a.jsx)(qe,{demonCompendium:t}):void 0;return Object(a.jsxs)(d.a,{theme:Ze,children:[Object(a.jsx)(m.a,{}),Object(a.jsxs)("div",{className:"myApp",children:[Object(a.jsx)("header",{children:Object(a.jsx)("h1",{children:"MegaTen Fusion by Results Calculator"})}),Object(a.jsxs)(Ke.a,{value:c,onChange:function(e,n){r(void 0),u(n)},"aria-label":"simple tabs example",children:[Object(a.jsx)(Ye.a,{label:"Persona 4 Golden"}),Object(a.jsx)(Ye.a,{label:"Devil Survivor 2"})]}),Object(a.jsx)("div",{className:"appBody",children:h})]})]})}!function(e){e[e.person4Golden=0]="person4Golden",e[e.devilSurvivor2=1]="devilSurvivor2"}(Je||(Je={})),o.a.render(Object(a.jsx)(r.a.StrictMode,{children:Object(a.jsx)($e,{})}),document.getElementById("root")),c()},24:function(e,n,t){e.exports={dataTable:"results-table_dataTable__BqyI6",nameColumn:"results-table_nameColumn__3-ncz",lvlColumn:"results-table_lvlColumn__35Aqx",raceColumn:"results-table_raceColumn__34cLH",statColumn:"results-table_statColumn__3szBY",baseIngredientName:"results-table_baseIngredientName__3M4Ba"}},34:function(e,n,t){e.exports={dataTable:"ingredients-table_dataTable__3eHDj",checkBox:"ingredients-table_checkBox__3TQeR",nameColumnHeader:"ingredients-table_nameColumnHeader__6MDJR",raceColumnHeader:"ingredients-table_raceColumnHeader__1WXYk",removeDemonButton:"ingredients-table_removeDemonButton__3uoAu",removeDemonButtonIcon:"ingredients-table_removeDemonButtonIcon__2l4m2",warningIcon:"ingredients-table_warningIcon__p_Iu3"}},37:function(e,n,t){e.exports={settingsPanel:"settings-panel_settingsPanel__Jlbex",paper:"settings-panel_paper__ee3p0",settingsLine:"settings-panel_settingsLine__1HRFl",numberSettings:"settings-panel_numberSettings__RpSac",numberFieldLabel:"settings-panel_numberFieldLabel__30ovM"}},38:function(e,n,t){e.exports={demonAdderContainer:"ui-components_demonAdderContainer__1Nq5q",subAdderContainer:"ui-components_subAdderContainer__2g7zq",lvlFieldsContainer:"ui-components_lvlFieldsContainer__1oqYT",addDemonButton:"ui-components_addDemonButton__1Md5N",removeDemonButtonIcon:"ui-components_removeDemonButtonIcon__1s3G_",fusionResultsTable:"ui-components_fusionResultsTable__1u69P",baseIngredientName:"ui-components_baseIngredientName__2H65N",recipeLine:"ui-components_recipeLine__3sZ1S"}},39:function(e,n,t){e.exports={fusionRecommender:"fusion-calculator_fusionRecommender__1Bw9d",addDemonsAndButtonsRowContainer:"fusion-calculator_addDemonsAndButtonsRowContainer__3dth0",buttonsRow:"fusion-calculator_buttonsRow__ZN0Ep",calculateButton:"fusion-calculator_calculateButton__2n6WW",shining:"fusion-calculator_shining__1xfZn",settingsButton:"fusion-calculator_settingsButton__cvpOj",resetButton:"fusion-calculator_resetButton__zA3Vs"}},51:function(e,n,t){e.exports={paperContainer:"data-table_paperContainer__yXedv",tableContainer:"data-table_tableContainer__2trr1",header:"data-table_header__19DGp",tableBody:"data-table_tableBody__1DiId"}},65:function(e,n,t){e.exports={warningBanner:"minor-ui-components_warningBanner__27C77",icon:"minor-ui-components_icon__1xTlq"}}},[[107,1,2]]]);
//# sourceMappingURL=main.be5a3eb7.chunk.js.map