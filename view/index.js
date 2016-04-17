!function(t,e,n){"use strict";const s=require("simple-undo");class i{constructor(){this.state={imageDimensions:null,imageSrc:null};this.history=new s({maxLength:10,provider:t=>t(n.stringify(this.state))});this.history.initialize(n.stringify(this.state));this.unserializer=(e=>{this.state=n.parse(e);const{imageDimensions,imageSrc}=this.state;if(imageSrc!=null){t.negative.frameController.setImageAndSize(imageSrc,imageDimensions[0],imageDimensions[1])}else{t.negative.frameController.removeImage()}})}save(t){this.state=t;this.history.save()}undo(){this.history.undo(this.unserializer)}redo(){this.history.redo(this.unserializer)}canUndo(){return this.history.canUndo()}canRedo(){return this.history.canRedo()}serialize(){return{canUndo:this.canUndo(),canRedo:this.canRedo()}}}const{ipcRenderer}=require("electron");class a{constructor(){this.currentImage=e.getElementById("negativeImage");this.imageContainer=e.getElementById("imageContainer");this.currentImage.addEventListener("load",function(){e.body.classList.add("negative-on")},false);ipcRenderer.send("get-settings-request");ipcRenderer.on("get-settings-response",((t,n)=>{if(n["shouldShowTips"]===false){e.body.classList.add("no-tips")}}))}setShouldShowTips(t){if(t){e.body.classList.remove("no-tips")}else{e.body.classList.add("no-tips")}}setImageAndSize(n,s,i){if(n){e.body.classList.add("negative-on");this.currentImage.setAttribute("src",n);const a=`${i}px`;const r=`${s}px`;this.currentImage.style.width=r;this.currentImage.style.height=a;this.imageContainer.style.width=r;this.imageContainer.style.height=a;t.negative.tabsController.setTabHasContent();t.negative.tabsController.setTabLabel(`${s}x${i}`)}}removeImage(){e.body.classList.remove("negative-on");this.currentImage.setAttribute("src","");t.negative.tabsController.unsetTabHasContent();t.negative.tabsController.setTabLabel("")}setFocused(){e.body.classList.remove("blur");e.body.classList.add("focus")}unsetFocused(){e.body.classList.remove("focus");e.body.classList.add("blur")}setPrimary(){e.body.classList.add("primary")}unsetPrimary(){e.body.classList.remove("primary")}}const{clipboard,nativeImage,remote}=require("electron"),{BrowserWindow}=remote,r=70,o=126;class c{constructor(){this.dragOverIndex=null;this.tabIndex=0;this.tabs=[this.getEmptyModel()];this.tabsContainer=e.getElementById("tabs");this.tabsContainer.addEventListener("mousedown",this._mouseDown.bind(this),false);this.tabsContainer.addEventListener("dragstart",this._dragStart.bind(this),false);this.tabsContainer.addEventListener("dragover",this._dragOver.bind(this),false);this.tabsContainer.addEventListener("dragend",this._dragResetStyles.bind(this),false);this.tabsContainer.addEventListener("drop",this._drop.bind(this),false);e.getElementById("close").addEventListener("click",(t=>{BrowserWindow.getFocusedWindow().close()}));e.getElementById("minimize").addEventListener("click",(t=>{BrowserWindow.getFocusedWindow().minimize()}));e.getElementById("maximize").addEventListener("click",(t=>{BrowserWindow.getFocusedWindow().maximize()}))}_mouseDown(t){const{target}=t;if(target){if(target.classList.contains("tab")){this.deselectTabByIndex(this.tabIndex);this.tabIndex=Array.from(this.tabsContainer.children).indexOf(target);this.selectTabByIndex(this.tabIndex)}else if(target.classList.contains("close")){this.closeTab()}}}_dragStart(t){const{target}=t;if(target){if(target.classList.contains("tab")&&this.tabs.length>1){t.dataTransfer.setData("from-index",`${this.tabIndex}`);t.dataTransfer.effectAllowed="move"}else{t.preventDefault();return false}}}_dragOver(t){t.preventDefault();const e=t.x-r;const n=Math.floor(e/o);const s=+t.dataTransfer.getData("from-index");if(n!==this.dragOverIndex){const t=(n-s)*o+"px";this.tabsContainer.children[s].style.left=t;this.dragOverIndex=n}Array.from(this.tabsContainer.children).forEach(((t,e)=>{if(s>e){if(n<=e){t.classList.add("shift-right")}else{t.classList.remove("shift-right")}}else if(s<e){if(n>=e){t.classList.add("shift-left")}else{t.classList.remove("shift-left")}}}))}_dragResetStyles(){this.tabsContainer.classList.add("shift-none");setTimeout((()=>{this.tabsContainer.classList.remove("shift-none")}),250);Array.from(this.tabsContainer.children).forEach((t=>{t.style.transform="";t.style.left="";this.dragOverIndex=null;setTimeout((()=>{t.classList.remove("shift-left","shift-right")}),250)}))}_drop(t){t.preventDefault();const{target}=t;if(target&&target.classList.contains("tab")){const e=t.x-r;const n=Math.floor(e/o);const s=+t.dataTransfer.getData("from-index");const i=n>s?n+1:n;this.moveTab(s,i);this.tabs.splice(i,0,this.tabs.splice(s,1,null)[0]);this.tabs=this.tabs.filter(function(t){return t!==null});this.tabIndex=n;this._dragResetStyles()}}addTab(){this.deselectTabByIndex(this.tabIndex);this.tabIndex++;this.tabs.splice(this.tabIndex,0,this.getEmptyModel());const e=this.getTabButtonElement(true);const n=this.tabs.length*o;this.tabsContainer.insertBefore(e,this.getCurrentTab());this.tabsContainer.style.width=`${n}px`;e.focus();t.negative.frameController.removeImage();this.refreshMenu()}closeTab(){const t=this.tabIndex;if(!this.canSelectNextTab()){if(this.canSelectPreviousTab()){this.tabIndex--}else{BrowserWindow.getFocusedWindow().close();return}}this.tabs.splice(t,1);const e=this.tabs.length*o;this.tabsContainer.children[t].remove();this.tabsContainer.style.width=`${e}px`;this.selectTabByIndex(this.tabIndex)}getCurrentTab(){return this.tabsContainer.children[this.tabIndex]}moveTab(t,e){this.tabsContainer.insertBefore(this.tabsContainer.children[t],this.tabsContainer.children[e])}canSelectNextTab(){return this.tabIndex+1<this.tabs.length}canSelectPreviousTab(){return this.tabIndex>0}selectTabByIndex(e){const n=this.tabs[e].undoManager.state;const s=this.tabsContainer.children[e];const{imageDimensions,imageSrc}=n;s.classList.add("selected");s.setAttribute("aria-selected","true");s.focus();if(imageSrc&&imageDimensions){t.negative.frameController.setImageAndSize(imageSrc,imageDimensions[0],imageDimensions[1])}else{t.negative.frameController.removeImage()}this.refreshMenu()}deselectTabByIndex(t){const e=this.tabsContainer.children[t];e.classList.remove("selected");e.setAttribute("aria-selected","false")}selectNextTab(){const t=this.canSelectNextTab();if(t){this.deselectTabByIndex(this.tabIndex);this.tabIndex++;this.selectTabByIndex(this.tabIndex)}return t}selectPreviousTab(){const t=this.canSelectPreviousTab();if(t){this.deselectTabByIndex(this.tabIndex);this.tabIndex--;this.selectTabByIndex(this.tabIndex)}return t}setTabHasContent(){this.getCurrentTab().classList.add("has-content")}unsetTabHasContent(){this.getCurrentTab().classList.remove("has-content")}setTabLabel(t){this.getCurrentTab().children[0].textContent=t}getEmptyModel(){return{undoManager:new i}}getTabButtonElement(t){const n=e.createElement("div");const s=e.createElement("span");const i=e.createElement("button");n.classList.add("tab");n.setAttribute("draggable","true");s.classList.add("label");i.classList.add("close");i.setAttribute("aria-label","close");i.innerHTML="&times;";if(t){n.classList.add("selected");n.setAttribute("aria-selected","true")}n.appendChild(s);n.appendChild(i);return n}saveForUndo(t){const e=this.tabs[this.tabIndex].undoManager;e.save(t);this.refreshMenu()}undo(){const t=this.tabs[this.tabIndex].undoManager;t.undo();this.refreshMenu()}redo(){const t=this.tabs[this.tabIndex].undoManager;t.redo();this.refreshMenu()}copy(){const t=this.tabs[this.tabIndex].undoManager.state;const{imageDimensions,imageSrc}=t;if(imageSrc!==null&&imageDimensions!==null){clipboard.write({image:nativeImage.createFromDataURL(imageSrc),text:n.stringify(imageDimensions)});this.refreshMenu()}}paste(){const e=clipboard.readImage();let s;try{s=n.parse(clipboard.readText()||null)}catch(i){}if(e!==null){if(!s){s=function(t){return[t.width,t.height]}(e.getSize())}const n=e.toDataURL();t.negative.frameController.setImageAndSize(n,s[0],s[1]);this.saveForUndo({imageDimensions:s,imageSrc:n});this.refreshMenu()}}refreshMenu(){const t=this.tabs[this.tabIndex].undoManager;ipcRenderer.send("refresh-menu",{canAddTab:true,canCloseTab:true,canCloseWindow:true,canUndo:t.canUndo(),canRedo:t.canRedo(),canCapture:true,isImageEmpty:t.state.imageSrc===null,canReload:true,canToggleDevTools:true,canSelectPreviousTab:this.canSelectPreviousTab(),canSelectNextTab:this.canSelectNextTab(),canMinimize:true,canMove:true})}fitWindowToImage(){const t=this.tabs[this.tabIndex].undoManager.state;ipcRenderer.send("fit-window-to-image",t.imageDimensions)}}e.addEventListener("DOMContentLoaded",(()=>{t.negative={frameController:new a,tabsController:new c}}))}(window,document,JSON);