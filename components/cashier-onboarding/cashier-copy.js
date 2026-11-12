// Presentation copy only. Original data, identifiers and input values stay intact.
(() => {
  function clean(text){
    return text
      .replace('Use + to give a topic more weight and − to give it less. Your choices also shape Pip’s guidance and lesson suggestions. Select the same control again to clear it.','Use + or − to set your priorities.')
      .replace('Select a sample card to start your scan.','Choose your card to get started.')
      .replace('Added assets are stored in this demo on this device.','Added assets are saved on this device.')
      .replace('Enable JavaScript to start the demo.','Enable JavaScript to get started.')
      .replace(/\b(?:demo|sample|simulated)\s+/gi,'')
      .replace(/\b(?:demo|prototype)\b/gi,'');
  }
  function refresh(){
    // Entire prototype-only notes disappear rather than leaving reworded disclaimers.
    document.querySelectorAll('.site-footer,.branch-welcome .eyebrow').forEach(element=>element.remove());
    for(const note of document.querySelectorAll('.sources-page p'))if(note.textContent.includes('The measured score uses your verified banking snapshot.'))note.remove();
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode;
      if(node.parentElement.closest('script,style,textarea,input,[contenteditable],.added-assets strong'))continue;
      const text=clean(node.textContent);if(text!==node.textContent)node.textContent=text;
    }
    for(const element of document.querySelectorAll('[aria-label],[title]'))for(const attribute of ['aria-label','title']){
      const original=element.getAttribute(attribute);if(original===null)continue;
      const text=clean(original);if(text!==original)element.setAttribute(attribute,text);
    }
  }
  new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,characterData:true});
  refresh();
})();
