// ==UserScript==
// @name        cs.rin.ru-Block-&-Remove-Unnecessary-Images
// @namespace   https://github.com/SeriousHoax
// @description Block and Remove Unnecessary Images like User Avatars and Signatures on cs.rin.ru
// @match       https://cs.rin.ru/forum/*
// @version     1
// @author      SeriousHoax
// @run-at      document-start
// @grant       none
// ==/UserScript==

(function() {
  'use strict';

  function hasSeparatorAbove(img) {
    const postbody = img.closest('.postbody');
    if (!postbody) return false;

    const walker = document.createTreeWalker(postbody, NodeFilter.SHOW_ALL);
    let node;
    let foundSeparator = false;

    while ((node = walker.nextNode())) {
      if (node === img) break;
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '_________________') {
        foundSeparator = true;
      }
    }
    return foundSeparator;
  }

  function isAvatarImg(img) {
    return img.src && img.src.includes('/forum/download/file.php?avatar=');
  }

  function processElement(element) {
    if (element.tagName === 'IMG') {
      if (isAvatarImg(element) || hasSeparatorAbove(element)) {
        element.remove();
      }
    } else if (element.querySelectorAll) {
      const imgs = element.querySelectorAll('img');
      imgs.forEach(img => {
        if (isAvatarImg(img) || hasSeparatorAbove(img)) {
          img.remove();
        }
      });
    }
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(addedNode => {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            processElement(addedNode);
          }
        });
      }
    });
  });

  observer.observe(document, { childList: true, subtree: true });

  processElement(document);
})();