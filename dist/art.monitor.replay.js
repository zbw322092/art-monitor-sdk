var Replay = (function () {
  'use strict';

  var TrackType;
  (function (TrackType) {
      TrackType[TrackType["EVENT_NETWORKEVENT"] = 0] = "EVENT_NETWORKEVENT";
      TrackType[TrackType["EVENT_SCROLL"] = 1] = "EVENT_SCROLL";
      TrackType[TrackType["EVENT_RESIZE"] = 2] = "EVENT_RESIZE";
      TrackType[TrackType["UIEVENT_SELECT"] = 3] = "UIEVENT_SELECT";
      TrackType[TrackType["KEYBOARDEVENT_KEYDOWN"] = 4] = "KEYBOARDEVENT_KEYDOWN";
      TrackType[TrackType["MOUSEEVENT_CLICK"] = 5] = "MOUSEEVENT_CLICK";
      TrackType[TrackType["TOUCHEVENT_TOUCHSTART"] = 6] = "TOUCHEVENT_TOUCHSTART";
      TrackType[TrackType["TOUCHEVENT_TOUCHMOVE"] = 7] = "TOUCHEVENT_TOUCHMOVE";
      TrackType[TrackType["TOUCHEVENT_TOUCHEND"] = 8] = "TOUCHEVENT_TOUCHEND";
      TrackType[TrackType["TOUCHEVENT_TOUCHCANCEL"] = 9] = "TOUCHEVENT_TOUCHCANCEL";
      TrackType[TrackType["FOCUSEVENT_FOCUSIN"] = 10] = "FOCUSEVENT_FOCUSIN";
      TrackType[TrackType["FOCUSEVENT_FOCUSOUT"] = 11] = "FOCUSEVENT_FOCUSOUT";
      TrackType[TrackType["POINTEREVENT_POINTERMOVE"] = 12] = "POINTEREVENT_POINTERMOVE";
      TrackType[TrackType["STATECHANGE"] = 13] = "STATECHANGE";
      TrackType[TrackType["MUTATION"] = 14] = "MUTATION";
      TrackType[TrackType["XHRINTERCEPT"] = 15] = "XHRINTERCEPT";
      TrackType[TrackType["ERROR"] = 16] = "ERROR";
  })(TrackType || (TrackType = {}));
  //# sourceMappingURL=TrackType.js.map

  var NodeType;
  (function (NodeType) {
      NodeType[NodeType["Document"] = 0] = "Document";
      NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
      NodeType[NodeType["Element"] = 2] = "Element";
      NodeType[NodeType["Text"] = 3] = "Text";
      NodeType[NodeType["CDATA"] = 4] = "CDATA";
      NodeType[NodeType["Comment"] = 5] = "Comment";
  })(NodeType || (NodeType = {}));
  //# sourceMappingURL=types.js.map

  /**
   * This file is a fork of https://github.com/reworkcss/css/blob/master/lib/parse/index.js
   * I fork it because:
   * 1. The css library was built for node.js which does not have tree-shaking supports.
   * 2. Rewrites into typescript give us a better type interface.
   */
  // http://www.w3.org/TR/CSS21/grammar.html
  // https://github.com/visionmedia/css-parse/pull/49#issuecomment-30088027
  const commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
  function parse(css, options = {}) {
      /**
       * Positional.
       */
      let lineno = 1;
      let column = 1;
      /**
       * Update lineno and column based on `str`.
       */
      function updatePosition(str) {
          const lines = str.match(/\n/g);
          if (lines) {
              lineno += lines.length;
          }
          let i = str.lastIndexOf('\n');
          column = i === -1 ? column + str.length : str.length - i;
      }
      /**
       * Mark position and patch `node.position`.
       */
      function position() {
          const start = { line: lineno, column };
          return (node) => {
              node.position = new Position(start);
              whitespace();
              return node;
          };
      }
      /**
       * Store position information for a node
       */
      class Position {
          constructor(start) {
              this.start = start;
              this.end = { line: lineno, column };
              this.source = options.source;
          }
      }
      /**
       * Non-enumerable source string
       */
      Position.prototype.content = css;
      const errorsList = [];
      function error(msg) {
          const err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
          err.reason = msg;
          err.filename = options.source;
          err.line = lineno;
          err.column = column;
          err.source = css;
          if (options.silent) {
              errorsList.push(err);
          }
          else {
              throw err;
          }
      }
      /**
       * Parse stylesheet.
       */
      function stylesheet() {
          const rulesList = rules();
          return {
              type: 'stylesheet',
              stylesheet: {
                  source: options.source,
                  rules: rulesList,
                  parsingErrors: errorsList,
              },
          };
      }
      /**
       * Opening brace.
       */
      function open() {
          return match(/^{\s*/);
      }
      /**
       * Closing brace.
       */
      function close() {
          return match(/^}/);
      }
      /**
       * Parse ruleset.
       */
      function rules() {
          let node;
          const rules = [];
          whitespace();
          comments(rules);
          while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
              if (node !== false) {
                  rules.push(node);
                  comments(rules);
              }
          }
          return rules;
      }
      /**
       * Match `re` and return captures.
       */
      function match(re) {
          const m = re.exec(css);
          if (!m) {
              return;
          }
          const str = m[0];
          updatePosition(str);
          css = css.slice(str.length);
          return m;
      }
      /**
       * Parse whitespace.
       */
      function whitespace() {
          match(/^\s*/);
      }
      /**
       * Parse comments;
       */
      function comments(rules = []) {
          let c;
          while ((c = comment())) {
              if (c !== false) {
                  rules.push(c);
              }
              c = comment();
          }
          return rules;
      }
      /**
       * Parse comment.
       */
      function comment() {
          const pos = position();
          if ('/' !== css.charAt(0) || '*' !== css.charAt(1)) {
              return;
          }
          let i = 2;
          while ('' !== css.charAt(i) &&
              ('*' !== css.charAt(i) || '/' !== css.charAt(i + 1))) {
              ++i;
          }
          i += 2;
          if ('' === css.charAt(i - 1)) {
              return error('End of comment missing');
          }
          const str = css.slice(2, i - 2);
          column += 2;
          updatePosition(str);
          css = css.slice(i);
          column += 2;
          return pos({
              type: 'comment',
              comment: str,
          });
      }
      /**
       * Parse selector.
       */
      function selector() {
          const m = match(/^([^{]+)/);
          if (!m) {
              return;
          }
          /* @fix Remove all comments from selectors
           * http://ostermiller.org/findcomment.html */
          return trim(m[0])
              .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
              .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, m => {
              return m.replace(/,/g, '\u200C');
          })
              .split(/\s*(?![^(]*\)),\s*/)
              .map(s => {
              return s.replace(/\u200C/g, ',');
          });
      }
      /**
       * Parse declaration.
       */
      function declaration() {
          const pos = position();
          // prop
          let propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
          if (!propMatch) {
              return;
          }
          const prop = trim(propMatch[0]);
          // :
          if (!match(/^:\s*/)) {
              return error(`property missing ':'`);
          }
          // val
          const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
          const ret = pos({
              type: 'declaration',
              property: prop.replace(commentre, ''),
              value: val ? trim(val[0]).replace(commentre, '') : '',
          });
          // ;
          match(/^[;\s]*/);
          return ret;
      }
      /**
       * Parse declarations.
       */
      function declarations() {
          const decls = [];
          if (!open()) {
              return error(`missing '{'`);
          }
          comments(decls);
          // declarations
          let decl;
          while ((decl = declaration())) {
              if (decl !== false) {
                  decls.push(decl);
                  comments(decls);
              }
              decl = declaration();
          }
          if (!close()) {
              return error(`missing '}'`);
          }
          return decls;
      }
      /**
       * Parse keyframe.
       */
      function keyframe() {
          let m;
          const vals = [];
          const pos = position();
          while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
              vals.push(m[1]);
              match(/^,\s*/);
          }
          if (!vals.length) {
              return;
          }
          return pos({
              type: 'keyframe',
              values: vals,
              declarations: declarations(),
          });
      }
      /**
       * Parse keyframes.
       */
      function atkeyframes() {
          const pos = position();
          let m = match(/^@([-\w]+)?keyframes\s*/);
          if (!m) {
              return;
          }
          const vendor = m[1];
          // identifier
          m = match(/^([-\w]+)\s*/);
          if (!m) {
              return error('@keyframes missing name');
          }
          const name = m[1];
          if (!open()) {
              return error(`@keyframes missing '{'`);
          }
          let frame;
          let frames = comments();
          while ((frame = keyframe())) {
              frames.push(frame);
              frames = frames.concat(comments());
          }
          if (!close()) {
              return error(`@keyframes missing '}'`);
          }
          return pos({
              type: 'keyframes',
              name,
              vendor,
              keyframes: frames,
          });
      }
      /**
       * Parse supports.
       */
      function atsupports() {
          const pos = position();
          const m = match(/^@supports *([^{]+)/);
          if (!m) {
              return;
          }
          const supports = trim(m[1]);
          if (!open()) {
              return error(`@supports missing '{'`);
          }
          const style = comments().concat(rules());
          if (!close()) {
              return error(`@supports missing '}'`);
          }
          return pos({
              type: 'supports',
              supports,
              rules: style,
          });
      }
      /**
       * Parse host.
       */
      function athost() {
          const pos = position();
          const m = match(/^@host\s*/);
          if (!m) {
              return;
          }
          if (!open()) {
              return error(`@host missing '{'`);
          }
          const style = comments().concat(rules());
          if (!close()) {
              return error(`@host missing '}'`);
          }
          return pos({
              type: 'host',
              rules: style,
          });
      }
      /**
       * Parse media.
       */
      function atmedia() {
          const pos = position();
          const m = match(/^@media *([^{]+)/);
          if (!m) {
              return;
          }
          const media = trim(m[1]);
          if (!open()) {
              return error(`@media missing '{'`);
          }
          const style = comments().concat(rules());
          if (!close()) {
              return error(`@media missing '}'`);
          }
          return pos({
              type: 'media',
              media,
              rules: style,
          });
      }
      /**
       * Parse custom-media.
       */
      function atcustommedia() {
          const pos = position();
          const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
          if (!m) {
              return;
          }
          return pos({
              type: 'custom-media',
              name: trim(m[1]),
              media: trim(m[2]),
          });
      }
      /**
       * Parse paged media.
       */
      function atpage() {
          const pos = position();
          const m = match(/^@page */);
          if (!m) {
              return;
          }
          const sel = selector() || [];
          if (!open()) {
              return error(`@page missing '{'`);
          }
          let decls = comments();
          // declarations
          let decl;
          while ((decl = declaration())) {
              decls.push(decl);
              decls = decls.concat(comments());
          }
          if (!close()) {
              return error(`@page missing '}'`);
          }
          return pos({
              type: 'page',
              selectors: sel,
              declarations: decls,
          });
      }
      /**
       * Parse document.
       */
      function atdocument() {
          const pos = position();
          const m = match(/^@([-\w]+)?document *([^{]+)/);
          if (!m) {
              return;
          }
          const vendor = trim(m[1]);
          const doc = trim(m[2]);
          if (!open()) {
              return error(`@document missing '{'`);
          }
          const style = comments().concat(rules());
          if (!close()) {
              return error(`@document missing '}'`);
          }
          return pos({
              type: 'document',
              document: doc,
              vendor,
              rules: style,
          });
      }
      /**
       * Parse font-face.
       */
      function atfontface() {
          const pos = position();
          const m = match(/^@font-face\s*/);
          if (!m) {
              return;
          }
          if (!open()) {
              return error(`@font-face missing '{'`);
          }
          let decls = comments();
          // declarations
          let decl;
          while ((decl = declaration())) {
              decls.push(decl);
              decls = decls.concat(comments());
          }
          if (!close()) {
              return error(`@font-face missing '}'`);
          }
          return pos({
              type: 'font-face',
              declarations: decls,
          });
      }
      /**
       * Parse import
       */
      const atimport = _compileAtrule('import');
      /**
       * Parse charset
       */
      const atcharset = _compileAtrule('charset');
      /**
       * Parse namespace
       */
      const atnamespace = _compileAtrule('namespace');
      /**
       * Parse non-block at-rules
       */
      function _compileAtrule(name) {
          const re = new RegExp('^@' + name + '\\s*([^;]+);');
          return () => {
              const pos = position();
              const m = match(re);
              if (!m) {
                  return;
              }
              const ret = { type: name };
              ret[name] = m[1].trim();
              return pos(ret);
          };
      }
      /**
       * Parse at rule.
       */
      function atrule() {
          if (css[0] !== '@') {
              return;
          }
          return (atkeyframes() ||
              atmedia() ||
              atcustommedia() ||
              atsupports() ||
              atimport() ||
              atcharset() ||
              atnamespace() ||
              atdocument() ||
              atpage() ||
              athost() ||
              atfontface());
      }
      /**
       * Parse rule.
       */
      function rule() {
          const pos = position();
          const sel = selector();
          if (!sel) {
              return error('selector missing');
          }
          comments();
          return pos({
              type: 'rule',
              selectors: sel,
              declarations: declarations(),
          });
      }
      return addParent(stylesheet());
  }
  /**
   * Trim `str`.
   */
  function trim(str) {
      return str ? str.replace(/^\s+|\s+$/g, '') : '';
  }
  /**
   * Adds non-enumerable parent node reference to each node.
   */
  function addParent(obj, parent) {
      const isNode = obj && typeof obj.type === 'string';
      const childParent = isNode ? obj : parent;
      for (const k of Object.keys(obj)) {
          const value = obj[k];
          if (Array.isArray(value)) {
              value.forEach(v => {
                  addParent(v, childParent);
              });
          }
          else if (value && typeof value === 'object') {
              addParent(value, childParent);
          }
      }
      if (isNode) {
          Object.defineProperty(obj, 'parent', {
              configurable: true,
              writable: true,
              enumerable: false,
              value: parent || null,
          });
      }
      return obj;
  }
  //# sourceMappingURL=cssParser.js.map

  const tagMap = {
      script: 'noscript',
      // camel case svg element tag names
      altglyph: 'altGlyph',
      altglyphdef: 'altGlyphDef',
      altglyphitem: 'altGlyphItem',
      animatecolor: 'animateColor',
      animatemotion: 'animateMotion',
      animatetransform: 'animateTransform',
      clippath: 'clipPath',
      feblend: 'feBlend',
      fecolormatrix: 'feColorMatrix',
      fecomponenttransfer: 'feComponentTransfer',
      fecomposite: 'feComposite',
      feconvolvematrix: 'feConvolveMatrix',
      fediffuselighting: 'feDiffuseLighting',
      fedisplacementmap: 'feDisplacementMap',
      fedistantlight: 'feDistantLight',
      fedropshadow: 'feDropShadow',
      feflood: 'feFlood',
      fefunca: 'feFuncA',
      fefuncb: 'feFuncB',
      fefuncg: 'feFuncG',
      fefuncr: 'feFuncR',
      fegaussianblur: 'feGaussianBlur',
      feimage: 'feImage',
      femerge: 'feMerge',
      femergenode: 'feMergeNode',
      femorphology: 'feMorphology',
      feoffset: 'feOffset',
      fepointlight: 'fePointLight',
      fespecularlighting: 'feSpecularLighting',
      fespotlight: 'feSpotLight',
      fetile: 'feTile',
      feturbulence: 'feTurbulence',
      foreignobject: 'foreignObject',
      glyphref: 'glyphRef',
      lineargradient: 'linearGradient',
      radialgradient: 'radialGradient',
  };
  function getElementTagName(node) {
      let tagName = tagMap[node.tagName] || node.tagName;
      if (tagName === 'link' && node.attributes._cssText) {
          tagName = 'style';
      }
      return tagName;
  }
  const HOVER_SELECTOR = /([^\\]):hover/g;
  function addHoverClass(cssText) {
      const ast = parse(cssText, { silent: true });
      if (!ast.stylesheet) {
          return cssText;
      }
      ast.stylesheet.rules.forEach((rule) => {
          if ('selectors' in rule) {
              (rule.selectors || []).forEach((selector) => {
                  if (HOVER_SELECTOR.test(selector)) {
                      const newSelector = selector.replace(HOVER_SELECTOR, '$1.\\:hover');
                      cssText = cssText.replace(selector, `${selector}, ${newSelector}`);
                  }
              });
          }
      });
      return cssText;
  }
  function buildNode(node, document, HACK_CSS) {
      switch (node.type) {
          // DOMImplementation Doc: https://developer.mozilla.org/en-US/docs/Web/API/DOMImplementation
          case NodeType.Document:
              return document.implementation.createHTMLDocument();
          case NodeType.DocumentType:
              return document.implementation.createDocumentType(node.name, node.publicId, node.systemId);
          case NodeType.Element:
              const tagName = getElementTagName(node);
              let element;
              if (node.isSVG) {
                  element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
              }
              else {
                  element = document.createElement(tagName);
              }
              for (const name in node.attributes) {
                  if (!node.attributes.hasOwnProperty(name)) {
                      continue;
                  }
                  let value = node.attributes[name];
                  value = typeof value === 'boolean' ? '' : value;
                  if (!name.startsWith('art_')) {
                      const isTextarea = tagName === 'textarea' && name === 'value';
                      const isRemoteOrDynamicCss = tagName === 'style' && name === '_cssText';
                      if (isRemoteOrDynamicCss && HACK_CSS) {
                          value = addHoverClass(value);
                      }
                      if (isTextarea || isRemoteOrDynamicCss) {
                          const textNodeChild = document.createTextNode(value);
                          for (const child of Array.from(element.childNodes)) {
                              if (child.nodeType === element.TEXT_NODE) {
                                  element.removeChild(child);
                              }
                          }
                          element.appendChild(textNodeChild);
                          continue;
                      }
                      if (tagName === 'iframe' && name === 'src') {
                          continue;
                      }
                      try {
                          if (node.isSVG && name === 'xlink:href') {
                              element.setAttributeNS('http://www.w3.org/1999/xlink', name, value);
                          }
                          else {
                              element.setAttribute(name, value);
                          }
                      }
                      catch (error) {
                          // skip invalid attribute, do nothing
                      }
                  }
                  else {
                      if (tagName === 'canvas' && name === 'art_dataURL') {
                          const image = document.createElement('img');
                          image.src = value;
                          image.onload = () => {
                              const context = element.getContext('2d');
                              if (context) {
                                  context.drawImage(image, 0, 0, image.width, image.height);
                              }
                          };
                      }
                      if (name === 'art_width') {
                          element.style.width = value;
                      }
                      if (name === 'art_height') {
                          element.style.height = value;
                      }
                  }
              }
              return element;
          case NodeType.Text:
              return document.createTextNode(node.isStyle && HACK_CSS ? addHoverClass(node.textContent) : node.textContent);
          case NodeType.CDATA:
              return document.createCDATASection(node.textContent);
          case NodeType.Comment:
              return document.createComment(node.textContent);
          default:
              return null;
      }
  }
  function buildNodeWithSerializedNode(node, document, map, skipChild = false, HACK_CSS = true) {
      let builtNode = buildNode(node, document, HACK_CSS);
      if (!builtNode) {
          return null;
      }
      if (node.type === NodeType.Document) {
          document.close();
          document.open();
          builtNode = document;
      }
      builtNode.__sn = node;
      map[node.id] = builtNode;
      if ((node.type === NodeType.Document || node.type === NodeType.Element) &&
          !skipChild) {
          for (const childNode of node.childNodes) {
              const builtChildNode = buildNodeWithSerializedNode(childNode, document, map, false, HACK_CSS);
              if (!builtChildNode) {
                  console.warn('Failed to rebuild', childNode);
              }
              else {
                  builtNode.appendChild(builtChildNode);
              }
          }
      }
      return builtNode;
  }
  function rebuild(node, document, HACK_CSS = true) {
      const idNodeMap = {};
      return [buildNodeWithSerializedNode(node, document, idNodeMap, false, HACK_CSS), idNodeMap];
  }
  //# sourceMappingURL=rebuild.js.map

  //# sourceMappingURL=LoggerBase.js.map

  // const isNodeNotElement = (node: Node | Element) => {
  //   return node instanceof Node && !(node instanceof Element);
  // };
  // const getNodeInfo = (node: Node) => {
  //   if (isNodeNotElement(node)) {
  //     if (node.parentElement) {
  //       return unique(node.parentElement) + ', nodeValue: ' + node.nodeValue;
  //     } else { return ''; }
  //   }
  //   return unique(node as Element);
  // };
  // const handleNode = (node: NodeList | Node) => {
  //   console.log('nodenode: ', node);
  //   if (node instanceof Node) {
  //     return getNodeInfo(node);
  //   }
  //   return JSON.stringify(
  //     Array.prototype.map.call(node, (n: Node | Element) => {
  //       return getNodeInfo(n);
  //     })
  //   );
  // };
  // export class LoggerMutation extends LoggerBase {
  //   constructor(TrackType: number, mutationRecord: MutationRecord) {
  //     super(TrackType);
  //     this.type = mutationRecord.type;
  //     this.target = handleNode(mutationRecord.target);
  //     this.addedNode = handleNode(mutationRecord.addedNodes);
  //     this.removedNodes = handleNode(mutationRecord.removedNodes);
  //     this.attributeName = mutationRecord.attributeName;
  //     this.attributeNamespace = mutationRecord.attributeNamespace;
  //     this.previousSibling = mutationRecord.previousSibling ? handleNode(mutationRecord.previousSibling) : null;
  //     this.nextSibling = mutationRecord.nextSibling ? handleNode(mutationRecord.nextSibling) : null;
  //     this.oldValue = mutationRecord.oldValue;
  //   }
  //   public type: string;
  //   public target: string;
  //   public addedNode: string;
  //   public removedNodes: string;
  //   public attributeName: string | null;
  //   public attributeNamespace: string | null;
  //   public previousSibling: string | null;
  //   public nextSibling: string | null;
  //   public oldValue: string | null;
  // }
  var MutationType;
  (function (MutationType) {
      MutationType["attributes"] = "attributes";
      MutationType["characterData"] = "characterData";
      MutationType["childList"] = "childList";
  })(MutationType || (MutationType = {}));
  //# sourceMappingURL=LoggerMutation.js.map

  const nodeMirror = {
      map: {},
      getId(node) {
          // if node has not been serialized, return -1
          if (!node.__sn) {
              return -1;
          }
          return node.__sn.id;
      },
      getNode(id) {
          return nodeMirror.map[id] || null;
      },
      removeNodeFromMap(node) {
          const id = node.__sn && node.__sn.id;
          delete nodeMirror.map[id];
          if (node.childNodes) {
              node.childNodes.forEach((child) => {
                  nodeMirror.removeNodeFromMap(child);
              });
          }
      },
      has(id) {
          return nodeMirror.map.hasOwnProperty(id);
      }
  };
  //# sourceMappingURL=utils.js.map

  class Replay {
      constructor(replayData, config) {
          this.replayData = replayData;
          const defaultConfig = {
              speed: 1,
              root: document.body,
              loadTimeout: 0,
              skipInactive: false,
              showWarning: true,
              showDebug: false,
              blockClass: 'art-block',
              liveMode: false,
              insertStyleRules: []
          };
          this.config = Object.assign({}, defaultConfig, config);
          this.initReplayPanel();
      }
      initReplayPanel() {
          this.wrapper = document.createElement('div');
          this.wrapper.classList.add('replayer-wrapper');
          this.config.root.appendChild(this.wrapper);
          this.mouse = document.createElement('div');
          this.mouse.classList.add('replayer-mouse');
          this.wrapper.appendChild(this.mouse);
          this.iframe = document.createElement('iframe');
          this.iframe.setAttribute('sandbox', 'allow-same-origin');
          this.iframe.setAttribute('scrolling', 'yes');
          this.iframe.setAttribute('style', 'pointer-events: none');
          this.wrapper.appendChild(this.iframe);
          this.buildInitialPage();
      }
      buildInitialPage() {
          const { node, initialScroll, initialWindowSize } = this.replayData.data;
          nodeMirror.map = rebuild(node, this.iframe.contentDocument)[1];
          this.iframe.width = `${initialWindowSize.width}px`;
          this.iframe.height = `${initialWindowSize.height}px`;
          this.iframe.contentWindow.scrollTo(initialScroll.x, initialScroll.y);
      }
      play() {
          setTimeout(() => {
              this.trackLogHandler(this.replayData.logs);
          }, 4000);
      }
      trackLogHandler(logs) {
          logs.forEach((log) => {
              switch (log.TrackType) {
                  case TrackType.EVENT_RESIZE:
                      console.log(111);
                      console.log(`${log.width}px, `, `${log.height}px`);
                      this.iframe.width = `${log.width}px`;
                      this.iframe.height = `${log.height}px`;
                      break;
                  case TrackType.EVENT_SCROLL:
                      console.log(222);
                      console.log(log.scrollY);
                      this.iframe.contentWindow.scrollTo(log.scrollX, log.scrollY);
                  case TrackType.MUTATION:
                      console.log(333);
                      this.replayMutation(log);
                      break;
                  default:
                      break;
              }
          });
      }
      replayMutation(log) {
          const { type } = log;
          switch (type) {
              case MutationType.characterData:
                  const targetNode = nodeMirror.getNode(log.target);
                  targetNode.textContent = log.newValue;
                  break;
              default:
                  break;
          }
      }
  }

  return Replay;

}());
