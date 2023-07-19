
const layout = function (val) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  measure(val)(([style, value], [x, y], [w, h]) => {
    if (value) { context.font = `${style.fontSize} ${style.fontFamily}`; context.fillStyle = style.color; context.fillText(children, x, y + h); }
    else { context.fillStyle = style.backgroundColor; context.fillRect(x, y, w, h); }
  });
}
const measure = function (val, ddd = 0, aaa = '', jjj = '', vxy = [0, 0, 0, 0, 0], vwh = [600, 600, 0, 0, 0]) {
  let { type, style, children } = val;
  let { display = 'flex' } = style;
  if (display === 'none') return () => {};
  let { top, right, bottom, left, width = null, height = null, gap = 0, flex = 0, margin = [0, 0, 0, 0], padding = [0, 0, 0, 0],
    position = 'r', direction = 'c', justifyContent = 's', alignItems = 's', alignSelf = '', aspectRatio = 1 } = style;
  let align = alignItems[2]; // align-items
  let justify = justifyContent[2]; // justify-content
  let txt = type === 'text';
  let pos = position[0] === 'r'; // position: relative*, absolute, fixed
  let dir = +(!(direction[0] === 'r'));
  let xxx = +(ddd); // is row/column
  let yyy = +(!xxx); // opposite of is row/column
  let fff = flex < 0 ? 0 : flex; // flex
  let mmm = [ [margin[3], margin[1]], [margin[0], margin[2]] ]; // margin
  let ppp = [ [padding[3], padding[1]], [padding[0], padding[2]] ]; // padding
  let ccc = txt ? [] : (justify === 'd' ? children.flat().reverse() : children); // children
  let cxy = [0, 0, 0, 0, 0]; // x/y/length/space/offset
  let cwh = [width, height, 0, 0, 0]; // w/h/flex/used/implict
  for (let idx = 0; idx < ccc.length; ++idx) ccc[idx] = measure(ccc[idx], dir, align, justify, cxy, cwh); // visit all child nodes
  if (pos) { vxy[0x2] += 1; vwh[0x2] += fff; } // accumulate length/flex
  vwh[0x3] += (cwh[xxx] ?? cwh[0x3]) + (mmm[xxx][0] + mmm[xxx][1]); // implicit inline size
  vwh[0x4] = Math.max(vwh[0x4], (cwh[yyy] ?? cwh[0x4]) + (mmm[yyy][0] + mmm[yyy][1])); // implicit block size
  // draw routine
  return (draw = () => {}) => {
    init: {
      cxy[xxx] += mmm[xxx][0] + ppp[xxx][0] + vxy[0x4]; // margin-start + padding.start + cursor
      cxy[yyy] += mmm[yyy][0] + ppp[yyy][0]; // margin-start + padding.start
    }
    size: {
      cwh[0x3] += ppp[xxx][0] + ppp[xxx][1] + ((cxy[0x2] - 1) * gap); // used space += padding + (n * gap)
      cwh[xxx] ??= !pos ? cwh[0x3] : (vwh[xxx] - vwh[0x3]) * ((fff || 1) / vwh[0x2]); // if implicit sized then size = (total space - used space) * (flex or 1)/(total flex)
      cwh[yyy] ??= !pos ? cwh[0x4] : (vwh[0x4] || vwh[yyy]);
    }
    axis: {
      // poisition: top, right, bottom, left
      for (let [lt, rb, z, xy, wh] of [[left, right, cwh[0x0], 0x0, 0x1], [top, bottom, cwh[0x1], 0x0, 0x1]])
        if (lt != null && rb != null && z == null) { // left, right set while width is undefined
          cxy[xy] = (pos ? cxy : vxy)[xy] + lt; // node[x/y] = root[x/y] + l/t;
          cwh[wh] = vwh[wh] - lt - rb; // node[w/h] = root[w/h] - l/t - r/b;
        } else if (lt != null) cxy[xy] = (pos ? cxy : vxy)[xy] + lt; // when only l/t, node[x/y] = root/node[x/y] + l/t; dependant on absolute position
          else if (rb != null) cxy[xy] = vxy[xy] - rb + (rel ? 0 : vwh[wh] - cwh[wh]); // when only right/bottom; node[x/y] = root[x/y] - r/b + (root[w\h] - node[w\h]) ...
          else if (!pos) cxy[xy] = vxy[xy]; // node[x/y] = root[x/y];
      // algin-self / align-items: start*, end, center, stretch
      if (alignSelf) aaa = alignSelf[2]; // by default we assume the aligment of the parents align-items but if there's an align-self we use that
      let [yx, hw] = [[0x1, 0x1], [0x0, 0x0]][ddd]; // root orientation
      if (pos) switch (aaa) { // not absolute?
          case 'd': cxy[yx] = vwh[hw] - cwh[hw]; break; // end
          case 'n': cxy[yx] = vwh[hw] / 2 - cwh[hw] / 2; break; // center
          case 'r': cxy[yx] = vwh[hw]; break; // stretch
        }
      // justify: start*, end, center, stretch
      let [xy, wh] = [[0x0, 0x0], [0x1, 0x1]][ddd]; // root orientation
      if (pos) switch (jjj) { // not absolute?
          case 'd': cxy[xy] = vwh[wh] - cwh[wh]; break; // end
          case 'n': cxy[xy] = vwh[wh] / 2 - cwh[wh] / 2; break; // center given that mathematically (1 + 1 + 1)/2 is equivalent to (1/2) + (1/2) + (1/2)
          case 'r': cxy[xy] = vwh[wh]; break; // stretch
        }
    }

    draw: {
      draw([style, (txt && children)], cxy.map((v, i) => v + vxy[i]), cwh.map(v => v));
    }
    walk: {
      for (let fun of ccc) fun(draw);
    }
    move: {
      cxy[xxx] += mmm[yyy][1] + ppp[yyy][1] + cwh[xxx]; // margin.end + padding.end + width
      vxy[0x4] += cxy[xxx]; // move cursor
    }
  }
}


// playground =========================

const canvas = Object.assign(document.body, {style: 'padding:0;margin:0;'}).appendChild(document.createElement('canvas'));
const context = canvas.getContext('2d');
const s = () => {
  canvas.width = (innerWidth / 1) * (devicePixelRatio / devicePixelRatio);
  canvas.height = (innerHeight / 1) * (devicePixelRatio / devicePixelRatio);
};

s();

const h = (style, ...children) => ({type: 'view', style, children: children})
const r = () => layout(
  h({ width: 600, height: 600, direction: 'r', backgroundColor: 'red' },
    h({ flex: 1, backgroundColor: 'green', height: void (600/4), }),
    h({ flex: 2, backgroundColor: 'blue', height: void (600/2), }),
  ),
  // h({ width: 600, height: 600, direction: 'r', backgroundColor: 'red' },
  //   h({ flex: 1, backgroundColor: 'green', height: void (600/4), }),
  //   h({ flex: 2, backgroundColor: 'blue', height: (600/2), }),
  // ),
  // h({ width: 600, height: 600, direction: 'c', backgroundColor: 'red' },
  //   h({ flex: 1, backgroundColor: 'green', width: void (600/4), }),
  //   h({ flex: 2, backgroundColor: 'blue', width: (600/2), }),
  // ),
)
// setInterval(r, 100);

console.time('timer');
for (let i = 0; i < 1; ++i) r();
console.timeEnd('timer');


/* Swift style node creation */
function Bar () {
  // string type
  return ('text')
    .props({ onClick: handleClick })
    .style('display: flex; direction: row; alignment: center; justify: center;')
    .child(
      ('text').style('font-size: 12px;').child('Hello'),
      ('text').style('font-size: 12px;').child('World'),
    )

  // function type
  return (Bar)
    .props({})
    .style('')
    .child(
      ('text').style('font-size: 12px;').child('Hello'),
      ('text').style('font-size: 12px;').child('World'),
    )
}
/* Made possible by */
// for (let constructor of [String, Function]) {
//   const PROPS = Symbol.for('@@props');
//   const STYLE = Symbol.for('@@style');
//   const CHILD = Symbol.for('@@CHILD');
//   defineProperties(constructor.prototype, {
//     props: {value: function (p) { this[PROPS] = p; return this; }},
//     style: {value: function (s) { this[STYLE] = s; return this; }},
//     child: {value: function (...c) { this[CHILD] = c; return this; }},
//   });
// }

