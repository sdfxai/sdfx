/**
 * fabric.brushes - A collection of brushes for fabric.js (version 4 and up).
 *
 * Made by Arjan Haverkamp, https://www.webgear.nl
 * Copyright 2021 Arjan Haverkamp
 * MIT Licensed
 * @version 1.0 - 2021-06-02
 * @url https://github.com/av01d/fabric-brushes
 *
 * Inspiration sources:
 * - https://github.com/tennisonchan/fabric-brush
 * - https://mrdoob.com/projects/harmony/
 * - http://perfectionkills.com/exploring-canvas-drawing-techniques/
 */

export const initBrushes = (fabric: any) => {
  /**
   * Trim a canvas. Returns the left-top coordinate where trimming began.
   * @param {canvas} canvas A canvas element to trim. This element will be trimmed (reference).
   * @returns {Object} Left-top coordinate of trimmed area. Example: {x:65, y:104}
   * @see: https://stackoverflow.com/a/22267731/3360038
   */
  fabric.util.trimCanvas = function(canvas: any) {
    var ctx = canvas.getContext('2d'),
      w = canvas.width,
      h = canvas.height,
      pix = {x:[] as any[], y:[] as any[]}, n,
      imageData = ctx.getImageData(0,0,w,h),
      fn = function(a: number, b: number) { return a-b };

    for (var y = 0; y < h; y++) {
      for (var x = 0; x < w; x++) {
        if (imageData.data[((y * w + x) * 4)+3] > 0) {
          pix.x.push(x);
          pix.y.push(y);
        }
      }
    }
    pix.x.sort(fn);
    pix.y.sort(fn);
    n = pix.x.length-1;

    //if (n == -1) {
    //  // Nothing to trim... empty canvas?
    //}

    w = pix.x[n] - pix.x[0];
    h = pix.y[n] - pix.y[0];
    var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);

    canvas.width = w;
    canvas.height = h;
    ctx.putImageData(cut, 0, 0);

    return {x:pix.x[0], y:pix.y[0]};
  }

  /**
   * Extract r,g,b,a components from any valid color.
   * Returns {undefined} when color cannot be parsed.
   *
   * @param {number} color Any color string (named, hex, rgb, rgba)
   * @returns {(Array|undefined)} Example: [0,128,255,1]
   * @see https://gist.github.com/oriadam/396a4beaaad465ca921618f2f2444d49
   */
  fabric.util.colorValues = function(color: string) {
    if (!color) { return; }
    if (color.toLowerCase() === 'transparent') { return [0, 0, 0, 0]; }
    if (color[0] === '#') {
      if (color.length < 7) {
        // convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
        color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3] + (color.length > 4 ? color[4] + color[4] : '');
      }
      return [parseInt(color.substr(1, 2), 16),
        parseInt(color.substr(3, 2), 16),
        parseInt(color.substr(5, 2), 16),
        color.length > 7 ? parseInt(color.substr(7, 2), 16)/255 : 1];
    }
    if (color.indexOf('rgb') === -1) {
      // convert named colors
      var tempElem = document.body.appendChild(document.createElement('fictum')); // intentionally use unknown tag to lower chances of css rule override with !important
      var flag = 'rgb(1, 2, 3)'; // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
      tempElem.style.color = flag;
      if (tempElem.style.color !== flag) {
        return; // color set failed - some monstrous css rule is probably taking over the color of our object
      }
      tempElem.style.color = color;
      if (tempElem.style.color === flag || tempElem.style.color === '') {
        return; // color parse failed
      }
      color = getComputedStyle(tempElem).color;
      document.body.removeChild(tempElem);
    }
    if (color.indexOf('rgb') === 0) {
      if (color.indexOf('rgba') === -1) {
        color += ',1'; // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
      }
      return color.match(/[\.\d]+/g)?.map(function(a)  {
        return +a
      });
    }
  }

  fabric.Point.prototype.angleBetween = function(that: any) {
    return Math.atan2( this.x - that.x, this.y - that.y);
  };

  fabric.Point.prototype.normalize = function(thickness: number) {
    if (null === thickness || undefined === thickness) {
      thickness = 1;
    }

    var length = this.distanceFrom({ x: 0, y: 0 });

    if (length > 0) {
      this.x = this.x / length * thickness;
      this.y = this.y / length * thickness;
    }

    return this;
  };

  /**
   * Convert a brush drawing on the upperCanvas to an image on the fabric canvas.
   * This makes the drawing editable, it can be moved, rotated, scaled, skewed etc.
   */
  fabric.BaseBrush.prototype.convertToImg = function() {
    var pixelRatio = this.canvas.getRetinaScaling(),
      c = fabric.util.copyCanvasElement(this.canvas.upperCanvasEl),
      xy = fabric.util.trimCanvas(c),
      img = new fabric.Image(c);

    const z = this.canvas.getZoom()

    img.set({
      left: xy.x/pixelRatio,
      top: xy.y/pixelRatio,
      scaleX: 1/pixelRatio,
      scaleY: 1/pixelRatio
    });

    img.setCoords()
    this.canvas.add(img)
  }

  fabric.util.getRandom = function(max: number, min: number) {
    min = min ? min : 0;
    return Math.random() * ((max ? max : 1) - min) + min;
  };

  fabric.util.clamp = function (n: number, max: number, min: number) {
    if (typeof min !== 'number') { min = 0; }
    return n > max ? max : n < min ? min : n;
  };

  fabric.Stroke = fabric.util.createClass(fabric.Object,{
    color: null,
    inkAmount: null,
    lineWidth: null,

    _point: null,
    _lastPoint: null,
    _currentLineWidth: null,

    initialize: function(ctx: any, pointer: any, range: any, color: string, lineWidth: number, inkAmount: number) {
      var rx = fabric.util.getRandom(range),
        c = fabric.util.getRandom(Math.PI * 2),
        c0 = fabric.util.getRandom(Math.PI * 2),
        x0 = rx * Math.sin(c0),
        y0 = rx / 2 * Math.cos(c0),
        cos = Math.cos(c),
        sin = Math.sin(c);

      this.ctx = ctx;
      this.color = color;
      this._point = new fabric.Point(pointer.x + x0 * cos - y0 * sin, pointer.y + x0 * sin + y0 * cos);
      this.lineWidth = lineWidth;
      this.inkAmount = inkAmount;
      this._currentLineWidth = lineWidth;

      ctx.lineCap = 'round';
    },

    update: function(pointer: any, subtractPoint: any, distance: number) {
      this._lastPoint = fabric.util.object.clone(this._point);
      this._point = this._point.addEquals({ x: subtractPoint.x, y: subtractPoint.y });

      var n = this.inkAmount / (distance + 1),
        per = (n > 0.3 ? 0.2 : n < 0 ? 0 : n);
      this._currentLineWidth = this.lineWidth * per;
    },

    draw: function() {
      var ctx = this.ctx;
      ctx.save();
      this.line(ctx, this._lastPoint, this._point, this.color, this._currentLineWidth);
      ctx.restore();
    },

    line: function(ctx: any, point1: any, point2: any, color: string, lineWidth: number) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(point1.x, point1.y);
      ctx.lineTo(point2.x, point2.y);
      ctx.stroke();
    }
  });

  /**
   * CrayonBrush
   * Based on code by Tennison Chan.
   */
  fabric.CrayonBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 0.6,
    width: 30,

    _baseWidth: 20,
    _inkAmount: 10,
    _latestStrokeLength: 0,
    _point: null,
    _sep: 5,
    _size: 0,
    _latest: null,
    _drawn: false,

    initialize: function(canvas: any, opt: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
      this._point = new fabric.Point(0, 0);
    },

    onMouseDown: function(pointer: any) {
      this.canvas.contextTop.globalAlpha = this.opacity;
      this._size = this.width / 2 + this._baseWidth;
      this._drawn = false;
      this.set(pointer);
    },

    onMouseMove: function(pointer: any) {
      this.update(pointer);
      this.draw(this.canvas.contextTop);
    },

    onMouseUp: function() {
      if (this._drawn) {
        this.convertToImg();
      }
      this._latest = null;
      this._latestStrokeLength = 0;
      this.canvas.contextTop.globalAlpha = 1;
    },

    set: function(p: any) {
      if (this._latest) {
        this._latest.setFromPoint(this._point);
      } else {
        this._latest = new fabric.Point(p.x, p.y);
      }
      fabric.Point.prototype.setFromPoint.call(this._point, p);
    },

    update: function(p: any) {
      this.set(p);
      this._latestStrokeLength = this._point.subtract(this._latest).distanceFrom({ x: 0, y: 0 });
    },

    draw: function(ctx: any) {
      var i, j, p, r, c, x, y, w, h, v, s, stepNum, dotSize, dotNum, range;

      v = this._point.subtract(this._latest);
      s = Math.ceil(this._size / 2);
      stepNum = Math.floor(v.distanceFrom({ x: 0, y: 0 }) / s) + 1;
      v.normalize(s);

      dotSize = this._sep * fabric.util.clamp(this._inkAmount / this._latestStrokeLength * 3, 1, 0.5);
      dotNum = Math.ceil(this._size * this._sep);

      range = this._size / 2;

      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      for (i = 0; i < dotNum; i++) {
        for (j = 0; j < stepNum; j++) {
          p = this._latest.add(v.multiply(j));
          r = fabric.util.getRandom(range);
          c = fabric.util.getRandom(Math.PI * 2);
          w = fabric.util.getRandom(dotSize, dotSize / 2);
          h = fabric.util.getRandom(dotSize, dotSize / 2);
          x = p.x + r * Math.sin(c) - w / 2;
          y = p.y + r * Math.cos(c) - h / 2;
          ctx.rect(x, y, w, h);
        }
      }
      ctx.fill();
      ctx.restore();
      this._drawn = true;
    },

    _render: function() {}

  }); // End CrayonBrush

  /**
   * FurBrush
   * Based on code by Mr. Doob.
   */
  fabric.FurBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000000',
    opacity: 1,
    width: 1,

    _count: 0,

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || 1;
      this._points = []
    },

    _addPoint: function(point: any) {
      this._points.push(point)
      return true
    },

    onMouseDown: function(pointer: any, options: any) {
      if (!this.canvas._isMainEvent(options.e)) {
        return
      }

      this._points = [pointer]
      this._count = 0

      var ctx = this.canvas.contextTop,
        color = fabric.util.colorValues(this.color);

      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.1 * this.opacity) + ')';
      ctx.lineWidth = this.width;

      this._points.push(pointer);
    },

    onMouseMove: function(pointer: any, options: any) {
      if (!this.canvas._isMainEvent(options.e)) {
        return
      }

      if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
        return
      }

      this._addPoint(pointer)

      var i, dx, dy, d,
        ctx = this.canvas.contextTop,
        points = this._points,
        lastPoint = points[points.length - 2];

      this._saveAndTransform(ctx)

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();

      for (i = 0; i < this._points.length; i++) {
        dx = this._points[i].x - this._points[this._count].x;
        dy = this._points[i].y - this._points[this._count].y;
        d = dx * dx + dy * dy;

        if (d < 2000 && Math.random() > d / 2000) {
          ctx.beginPath();
          ctx.moveTo(pointer.x + (dx * 0.5), pointer.y + (dy * 0.5));
          ctx.lineTo(pointer.x - (dx * 0.5), pointer.y - (dy * 0.5));
          ctx.stroke();
        }
      }

      ctx.restore()

      this._count++;
    },

    onMouseUp: function(options: any) {
      if (!this.canvas._isMainEvent(options.e)) {
        return true
      }
      if (this._count > 0) {
        this.convertToImg();
      }
    },

    _render: function() {

    },

    _reset: function() {
      this._points = []
    }
  }); // End FurBrush

  /**
   * InkBrush
   * Based on code by Tennison Chan.
   */
  fabric.InkBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 30,

    _baseWidth: 20,
    _inkAmount: 7,
    _lastPoint: null,
    _point: null,
    _range: 10,
    _strokes: null,

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;

      this._point = new fabric.Point();
    },

    _render: function(pointer: any) {
      var len, i, point = this.setPointer(pointer),
        subtractPoint = point.subtract(this._lastPoint),
        distance = point.distanceFrom(this._lastPoint),
        stroke;

      for (i = 0, len = this._strokes.length; i < len; i++) {
        stroke = this._strokes[i];
        stroke.update(point, subtractPoint, distance);
        stroke.draw();
      }

      if (distance > 30) {
        this.drawSplash(point, this._inkAmount);
      }
    },

    onMouseDown: function(pointer: any) {
      this.canvas.contextTop.globalAlpha = this.opacity;
      this._resetTip(pointer);
    },

    onMouseMove: function(pointer: any) {
      if (this.canvas._isCurrentlyDrawing) {
        this._render(pointer);
      }
    },

    onMouseUp: function() {
      this.convertToImg();
      this.canvas.contextTop.globalAlpha = 1;
    },

    drawSplash: function(pointer: any, maxSize: number) {
      var c, r, i, point,
        ctx = this.canvas.contextTop,
        num = fabric.util.getRandom(12),
        range = maxSize * 10,
        color = this.color;

      ctx.save();
      for (i = 0; i < num; i++) {
        r = fabric.util.getRandom(range, 1);
        c = fabric.util.getRandom(Math.PI * 2);
        point = new fabric.Point(pointer.x + r * Math.sin(c), pointer.y + r * Math.cos(c));

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, fabric.util.getRandom(maxSize) / 2, 0, Math.PI * 2, false);
        ctx.fill();
      }
      ctx.restore();
    },

    setPointer: function(pointer: any) {
      var point = new fabric.Point(pointer.x, pointer.y);

      this._lastPoint = fabric.util.object.clone(this._point);
      this._point = point;

      return point;
    },

    _resetTip: function(pointer: any) {
      var len, i, point = this.setPointer(pointer);

      this._strokes = [];
      this.size = this.width / 5 + this._baseWidth;
      this._range = this.size / 2;

      for (i = 0, len = this.size; i < len; i++) {
        this._strokes[i] = new fabric.Stroke(this.canvas.contextTop, point, this._range, this.color, this.width, this._inkAmount);
      }
    }
  }); // End InkBrush

  /**
   * LongfurBrush
   * Based on code by Mr. Doob.
   */
  fabric.LongfurBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 1,

    _count: 0,
    _points: [],

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || 1;
    },

    onMouseDown: function(pointer: any) {
      this._points = [pointer];
      this._count = 0;

      var ctx = this.canvas.contextTop,
        color = fabric.util.colorValues(this.color);

      //ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.05 * this.opacity) + ')';
      ctx.lineWidth = this.width;
    },

    onMouseMove: function(pointer: any) {
      this._points.push(pointer);

      var i, dx, dy, d, size,
        ctx = this.canvas.contextTop,
        points = this._points;

      for (i = 0; i < this._points.length; i++) {
        size = -Math.random();

        dx = this._points[i].x - this._points[this._count].x;
        dy = this._points[i].y - this._points[this._count].y;
        d = dx * dx + dy * dy;

        if (d < 4000 && Math.random() > d / 4000) {
          ctx.beginPath();
          ctx.moveTo(this._points[this._count].x + (dx * size), this._points[this._count].y + (dy * size));
          ctx.lineTo(this._points[i].x - (dx * size) + Math.random() * 2, this._points[i].y - (dy * size) + Math.random() * 2);
          ctx.stroke();
        }
      }

      this._count++;
    },

    onMouseUp: function(pointer: any) {
      if (this._count > 0) {
        this.convertToImg();
      }
    },

    _render: function() {}
  }); // End LongfurBrush

  /**
   * MarkerBrush
   * Based on code by Tennison Chan.
   */
  fabric.MarkerBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 30,

    _baseWidth: 10,
    _lastPoint: null,
    _lineWidth: 3,
    _point: null,
    _size: 0,

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
      this.canvas.contextTop.globalAlpha = this.opacity;
      this._point = new fabric.Point();

      this.canvas.contextTop.lineJoin = 'round';
      this.canvas.contextTop.lineCap = 'round';
    },

    _render: function(pointer: any) {
      var ctx, lineWidthDiff, i, len;

      ctx = this.canvas.contextTop;
      this._saveAndTransform(ctx)
      ctx.beginPath();

      for(i = 0, len = (this._size / this._lineWidth) / 2; i < len; i++) {
        lineWidthDiff = (this._lineWidth - 1) * i;

        ctx.globalAlpha = 0.8 * this.opacity;
        ctx.moveTo(this._lastPoint.x + lineWidthDiff, this._lastPoint.y + lineWidthDiff);
        ctx.lineTo(pointer.x + lineWidthDiff, pointer.y + lineWidthDiff);
        ctx.stroke();
      }

      this._lastPoint = new fabric.Point(pointer.x, pointer.y);
      ctx.restore()
    },

    onMouseDown: function(pointer: any) {
      this._lastPoint = pointer;
      this.canvas.contextTop.strokeStyle = this.color;
      this.canvas.contextTop.lineWidth = this._lineWidth;
      this._size = this.width + this._baseWidth;
    },

    onMouseMove: function(pointer: any) {
      if (this.canvas._isCurrentlyDrawing) {
        this._render(pointer);
      }
    },

    onMouseUp: function() {
      this.canvas.contextTop.globalAlpha = this.opacity;
      this.canvas.contextTop.globalAlpha = 1;
      this.convertToImg();
    }
  }); // End MarkerBrush

  /**
   * RibbonBrush
   * Based on code by Mr. Doob.
   */
  fabric.RibbonBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 1,

    _nrPainters: 50,
    _painters: [],
    _lastPoint: null,
    _interval: null,

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || 1;

      for (var i = 0; i < this._nrPainters; i++) {
        this._painters.push({ dx:this.canvas.width / 2, dy:this.canvas.height / 2, ax:0, ay:0, div:.1, ease:Math.random() * .2 + .6 });
      }
    },

    update: function() {
      var ctx = this.canvas.contextTop, painters = this._painters;
      for (var i = 0; i < painters.length; i++) {
        ctx.beginPath();
        ctx.moveTo(painters[i].dx, painters[i].dy);
        painters[i].dx -= painters[i].ax = (painters[i].ax + (painters[i].dx - this._lastPoint.x) * painters[i].div) * painters[i].ease;
        painters[i].dy -= painters[i].ay = (painters[i].ay + (painters[i].dy - this._lastPoint.y) * painters[i].div) * painters[i].ease;
        ctx.lineTo(painters[i].dx, painters[i].dy);
        ctx.stroke();
      }
    },

    onMouseDown: function(pointer: any) {
      var ctx = this.canvas.contextTop,
        color = fabric.util.colorValues(this.color);

      this._painters = [];
      for (var i = 0; i < this._nrPainters; i++) {
        this._painters.push({ dx:this.canvas.width / 2, dy:this.canvas.height / 2, ax:0, ay:0, div:.1, ease:Math.random() * .2 + .6 });
      }

      this._lastPoint = pointer;

      //ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.05 * this.opacity) + ')';
      ctx.lineWidth = this.width;

      for (var i = 0; i < this._nrPainters; i++) {
        this._painters[i].dx = pointer.x;
        this._painters[i].dy = pointer.y;
      }

      var self = this;
      this._interval = setInterval(function() { self.update() }, 1000/60);
    },

    onMouseMove: function(pointer: any) {
      this._lastPoint = pointer;
    },

    onMouseUp: function(pointer: any) {
      clearInterval(this._interval);
      this.convertToImg();
    },

    _render: function() {}
  }); // End RibbonBrush

  /**
   * ShadedBrush
   * Based on code by Mr. Doob.
   */
  fabric.ShadedBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: .1,
    width: 1,
    shadeDistance: 1000,

    _points: [],

    initialize: function(canvas: any, opt: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || .3;
      this.shadeDistance = opt.shadeDistance || 1000;
    },

    onMouseDown: function(pointer: any) {
      this._points = [pointer];

      var ctx = this.canvas.contextTop,
        color = fabric.util.colorValues(this.color);

      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + this.opacity + ')';
      ctx.lineWidth = this.width;
      ctx.lineJoin = ctx.lineCap = 'round';
    },

    onMouseMove: function(pointer: any) {
      this._points.push(pointer);

      var ctx = this.canvas.contextTop,
        points = this._points;

      ctx.beginPath();
      ctx.moveTo(points[points.length - 2].x, points[points.length - 2].y);
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      ctx.stroke();

      for (var i = 0, len = points.length; i < len; i++) {
        const dx = points[i].x - points[points.length-1].x;
        const dy = points[i].y - points[points.length-1].y;
        const d = dx * dx + dy * dy;

        if (d < this.shadeDistance) {
          ctx.beginPath();
          ctx.moveTo( points[points.length-1].x + (dx * 0.2), points[points.length-1].y + (dy * 0.2));
          ctx.lineTo( points[i].x - (dx * 0.2), points[i].y - (dy * 0.2));
          ctx.stroke();
        }
      }
    },

    onMouseUp: function(pointer: any) {
      if (this._points.length > 1) {
        this.convertToImg();
      }
    },

    _render: function() {}
  }); // End ShadedBrush

  /**
   * SketchyBrush
   * Based on code by Mr. Doob.
   */
  fabric.SketchyBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 1,

    _count: 0,
    _points: [],

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || 1;
    },

    onMouseDown: function(pointer: any) {
      this._count = 0;
      this._points = [pointer];

      var ctx = this.canvas.contextTop,
        color = fabric.util.colorValues(this.color);
      //ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + (0.05 * this.opacity) + ')';
      ctx.lineWidth = this.width;
    },

    onMouseMove: function(pointer: any) {
      this._points.push(pointer);

      var i, dx, dy, d, factor = .3 * this.width,
        ctx = this.canvas.contextTop,
        points = this._points,
        count = this._count,
        lastPoint = points[points.length - 2];

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();

      for (i = 0; i < points.length; i++) {
        dx = points[i].x - points[count].x;
        dy = points[i].y - points[count].y;
        d = dx * dx + dy * dy;

        if (d < 4000 && Math.random() > d / 2000) {
          ctx.beginPath();
          ctx.moveTo(points[count].x + (dx * factor), points[count].y + (dy * factor));
          ctx.lineTo(points[i].x - (dx * factor), points[i].y - (dy * factor));
          ctx.stroke();
        }
      }

      this._count++;
    },

    onMouseUp: function(pointer: any) {
      if (this._count > 0) {
        this.convertToImg();
      }
    },

    _render: function() {}
  }); // End SketchyBrush

  /**
   * SpraypaintBrush
   * Based on code by Tennison Chan.
   */
  fabric.SpraypaintBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 30,

    _baseWidth: 40,
    _inkAmount: 0,
    _interval: 20,
    _lastPoint: null,
    _point: null,
    brush: null,
    sprayBrushDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAT0AAAE/CAMAAAADjeSkAAAyGmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS4zLWMwMTEgNjYuMTQ1NjYxLCAyMDEyLzAyLzA2LTE0OjU2OjI3ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkFkb2JlIEZpcmV3b3JrcyBDUzYgKE1hY2ludG9zaCk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMjEtMDUtMjdUMTQ6NTg6NTVaPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjEtMDUtMjdUMTQ6NTk6MDJaPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyI+CiAgICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2UvcG5nPC9kYzpmb3JtYXQ+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgIAo8P3hwYWNrZXQgZW5kPSJ3Ij8+tc546gAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAAAJcEhZcwAACxIAAAsSAdLdfvwAAADnUExURQAAAAAAAAAAAAAAAAAAAAAAAAAAAEdwTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHxfYHoAAABNdFJOUwEGB0lKBAUAAgMICUgyCjULLw0MMQ8wDjQRMzgrOy4oEEIsEy02FBIVKh45JSkYNzoXJxYiPyYaHSAfGSEkPCMbRUNBHEtER0A+Rj1M2XzftQAAIABJREFUeNrkWtuO4zoOpARQpiTAEGwEQb8FGKC7sQ8HONiHfTj//19bJOVbkum59KR7ZjeYyc2yO64Uq4p0aPi0G233fqf3lCKt25Yl9KNHpg89hc8F8PiW3G7/3A/526L38x+bOr+EPvOE6DPO/Jufgu7vs72dZSlq+r/gHn3tbxLd8GdjFN090FrQIm+didCfit4tIF9fRk4u2l5eMW3Fge6X7/1DDpn+N7j3xnmuCww191v6Hne55fM111bHpj++cu/8zdz59oaz0h293Ep3t5luXq0e/kAK0mMPRm95By1U80dZ4bmL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',

    initialize: function(canvas: any, opt?: any) {
      var self = this;
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
      this.color = opt.color || canvas.freeDrawingBrush.color;

      this.canvas.contextTop.lineJoin = 'round';
      this.canvas.contextTop.lineCap = 'round';

      this._reset();

      fabric.Image.fromURL(this.sprayBrushDataUrl, function(brush: any) {
        self.brush = brush;
        self.brush.filters = [];
        // @ts-ignore
        // TODO: check if this can exist
        self._setColor(self.color || this.color);
      }, { crossOrigin: 'anonymous' });
    },


    _setColor: function(color: string) {
      this.color = color;
      this.brush.filters[0] = new fabric.Image.filters.BlendColor({ color:color, alpha:1, mode:'tint' });
      this.brush.applyFilters();
    },

    onMouseDown: function(pointer: any) {
      this._point = new fabric.Point(pointer.x, pointer.y);
      this._lastPoint = this._point;

      this.size = this.width + this._baseWidth;
      this._inkAmount = 0;

      this.canvas.contextTop.globalAlpha = this.opacity;
      this._setColor(this.color);
      this._render();
    },

    onMouseMove: function(pointer: any) {
      this._lastPoint = this._point;
      this._point = new fabric.Point(pointer.x, pointer.y)
    },

    onMouseUp: function() {
      var self = this;
      setTimeout(function() {
        self.convertToImg()
        self._reset()
      }, this._interval)
    },

    _render: function() {
      var self = this;

      function draw() {
        var point, distance, angle, amount, x, y;

        point = new fabric.Point(self._point.x || 0, self._point.y || 0);
        distance = point.distanceFrom(self._lastPoint);
        angle = point.angleBetween(self._lastPoint);
        amount = (100 / self.size) / (Math.pow(distance, 2) + 1);

        self._inkAmount += amount;
        self._inkAmount = Math.max(self._inkAmount - distance / 10, 0);

        x = self._lastPoint.x + Math.sin(angle) - self.size / 2;
        y = self._lastPoint.y + Math.cos(angle) - self.size / 2;
        self.canvas.contextTop.drawImage(self.brush._element, x, y, self.size, self.size);

        if (self.canvas._isCurrentlyDrawing) {
          setTimeout(draw, self._interval);
        } else {
          self._reset();
        }
      }

      draw();
    },

    _reset: function() {
      this._point = null;
      this._lastPoint = null;
      this.canvas.contextTop.globalAlpha = 1;
    }
  }); // End SpraypaintBrush

  /**
   * SquaresBrush
   * Based on code by Mr. Doob.
   */
  fabric.SquaresBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    bgColor: '#fff',
    opacity: 1,
    width: 1,

    _lastPoint: null,
    _drawn: false,

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.bgColor = opt.bgColor || '#fff';
      this.opacity = opt.opacity || canvas.contextTop.globalAlpha;
    },

    onMouseDown: function(pointer: any) {
      var ctx = this.canvas.contextTop,
        color = fabric.util.colorValues(this.color),
        bgColor = fabric.util.colorValues(this.bgColor);

      this._lastPoint = pointer;
      this._drawn = false;

      //ctx.globalCompositeOperation = 'source-over';
      this.canvas.contextTop.globalAlpha = this.opacity;
      ctx.fillStyle = 'rgba(' + bgColor[0] + ',' + bgColor[1] + ',' + bgColor[2] + ',' + bgColor[3] + ')';
      ctx.strokeStyle = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + color[3] + ')';
      ctx.lineWidth = this.width;
    },

    onMouseMove: function(pointer: any) {
      var ctx = this.canvas.contextTop,
        dx = pointer.x - this._lastPoint.x,
        dy = pointer.y - this._lastPoint.y,
        angle = 1.57079633,
        px = Math.cos(angle) * dx - Math.sin(angle) * dy,
        py = Math.sin(angle) * dx + Math.cos(angle) * dy;

      ctx.beginPath();
      ctx.moveTo(this._lastPoint.x - px, this._lastPoint.y - py);
      ctx.lineTo(this._lastPoint.x + px, this._lastPoint.y + py);
      ctx.lineTo(pointer.x + px, pointer.y + py);
      ctx.lineTo(pointer.x - px, pointer.y - py);
      ctx.lineTo(this._lastPoint.x - px, this._lastPoint.y - py);
      ctx.fill();
      ctx.stroke();

      this._lastPoint = pointer;
      this._drawn = true;
    },

    onMouseUp: function(pointer: any) {
      if (this._drawn) {
        this.convertToImg();
      }
      this.canvas.contextTop.globalAlpha = 1;
    },

    _render: function() {}
  }); // End SquaresBrush

  /**
   * WebBrush
   * Based on code by Mr. Doob.
   */
  fabric.WebBrush = fabric.util.createClass(fabric.BaseBrush, {
    color: '#000',
    opacity: 1,
    width: 1,

    _count: 0,
    _points: [],

    initialize: function(canvas: any, opt?: any) {
      opt = opt || {};

      this.canvas = canvas;
      this.width = opt.width || canvas.freeDrawingBrush.width;
      this.color = opt.color || canvas.freeDrawingBrush.color;
      this.opacity = opt.opacity || 1;
    },

    onMouseDown: function(pointer: any) {
      this._points = [pointer];
      this._count = 0;
      this._colorValues = fabric.util.colorValues(this.color);
    },

    onMouseMove: function(pointer: any) {
      this._points.push(pointer);

      var ctx = this.canvas.contextTop,
        points = this._points,
        lastPoint = points[points.length - 2],
        colorValues = this._colorValues,
        i, dx, dy, d;

      ctx.lineWidth = this.width;
      ctx.strokeStyle = 'rgba(' + colorValues[0] + ',' + colorValues[1] + ',' + colorValues[2] + ',' + (.5 * this.opacity) + ')';

      ctx.beginPath();
      ctx.moveTo(lastPoint.x, lastPoint.y);
      ctx.lineTo(pointer.x, pointer.y);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(' + colorValues[0] + ',' + colorValues[1] + ',' + colorValues[2] + ',' + (.1 * this.opacity) + ')';

      for (i = 0; i < points.length; i++) {
        dx = points[i].x - points[this._count].x;
        dy = points[i].y - points[this._count].y;
        d = dx * dx + dy * dy;

        if (d < 2500 && Math.random() > .9) {
          ctx.beginPath();
          ctx.moveTo(points[this._count].x, points[this._count].y);
          ctx.lineTo(points[i].x, points[i].y);
          ctx.stroke();
        }
      }
      this._count++;
    },

    onMouseUp: function(pointer: any) {
      if (this._count > 0) {
        this.convertToImg();
      }
    },

    _render: function() {}
  }); // End WebBrush

}