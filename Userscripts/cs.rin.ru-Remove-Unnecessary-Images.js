// ==UserScript==
// @name        cs.rin.ru-Remove-Unnecessary-Images
// @namespace   https://github.com/SeriousHoax/AnythingAdblock
// @description Remove Unnecessary User Signature Images on cs.rin.ru
// @match       https://cs.rin.ru/forum/*
// @version     2
// @author      SeriousHoax
// @run-at      document-start
// @grant       none
// ==/UserScript==

(function () {
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

  function cancelImageFetch(img) {
    img.srcset = '';
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');
    if (img.src) {
      img.src = '';
    }
    img.removeAttribute('data-src');
    img.removeAttribute('data-lazy-src');
    img.removeAttribute('data-srcset');
    img.removeAttribute('data-lazy-srcset');
  }

  function processPostBody(postbody) {
    const imgs = postbody.querySelectorAll('img');
    imgs.forEach(img => {
      if (hasSeparatorAbove(img)) {
        cancelImageFetch(img);
        img.remove();
      }
    });
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const addedNode of mutation.addedNodes) {
        if (addedNode.nodeType !== Node.ELEMENT_NODE) continue;
        const postbodies = addedNode.classList?.contains('postbody')
          ? [addedNode]
          : addedNode.querySelectorAll?.('.postbody');
        postbodies && postbodies.forEach(processPostBody);
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });

  const imgObserver = new MutationObserver(muts => {
    for (const mut of muts) {
      for (const node of mut.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'IMG') {
          if (hasSeparatorAbove(node)) {
            cancelImageFetch(node);
            node.remove();
          }
        }
      }
    }
  });

  function observePostBodiesForImgs(root = document) {
    root.querySelectorAll('.postbody').forEach(pb => {
      imgObserver.observe(pb, { childList: true, subtree: true });
    });
  }

  const postbodyAttachObserver = new MutationObserver(muts => {
    for (const mut of muts) {
      for (const node of mut.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.classList?.contains('postbody')) {
            imgObserver.observe(node, { childList: true, subtree: true });
          } else {
            observePostBodiesForImgs(node);
          }
        }
      }
    }
  });
  postbodyAttachObserver.observe(document, { childList: true, subtree: true });

  document.querySelectorAll('.postbody').forEach(processPostBody);
  observePostBodiesForImgs(document);
})();