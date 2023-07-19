const layout = function (val) {
  measure(val, 0, '', '', [0, 0, 0, 0], [300, 300, 0, 0])(() => {});
}
const measure = function (val, ii, aa, jj, vxy, vwh) {
  let { type, style, children } = val;
  let { display = flex } = style;
  if (display === 'none') return () => {};
  let { top, right, bottom, left, width, height, gap = 0, flex = 0, margin = [0, 0, 0, 0], padding = [0, 0, 0, 0],
    position = 'r', direction = 'c', justifyContent = 's', alignItems = 's', alignSelf = '', aspectRatio = 1 } = style;
  let align = alignItems[2]; // align-items
  let justify = justifyContent[2]; // justify-content
  let nil = 0;
  let pos = position[0] === 'r'; // position: relative*, absolute, fixed
  let dir = +(!(direction[0] === 'r')); // is row/column
  let rid = +(!dir); // opposite of is row/column
  let fff = flex < 0 ? 0 : flex; // flex
  let mmm = [[margin[3], margin[1]], [margin[0], margin[2]]; // margin
  let ppp = [[padding[3], padding[1]], padding[0], padding[2]]; // padding
  let ccc = (justify === 'd' ? children.reverse() : children).flat(); // children
  let cxy = [0, 0, 0, 0]; // x/y/length/space
  let cwh = [width, height, 0, 0]; // w/h/flex/size
  // absolute?
  if (pos) { vxy[0x2] += 1; vwh[0x2] += fff; } // accumulate length/flex
  // visit all child nodes
  for (let idx = 0; idx < ccc.length; ++i) ccc[idx] = measure(ccc[idx], dir, align, justify, cxy, cwh);
  cwh[dir] ??= cwh[0x3]; // explicit size/implicit size
  vwh[0x3] += (cwh[dir] ??= cwh[0x3]) + (mmm[dir][0] + mmm[dir][1]); // parent implicit size += (explicit size/implicit size) + margin
  vwh[rid] = max((cwh[rid] ?? 0) + (mmm[rid][0] + mmm[rid][1]), vwh[rid]); // parent block size = Math.max((parent block size), (explicit size/implicit size) + margin)
  // draw routine
  return (draw = to => canvas) => {
    init: {
      cxy[dir] += mmm[dir][0] + ppp[dir][0]; // x-axis margin/padding
      cxy[rid] += mmm[rid][0] + ppp[rid][0]; // y-axis margin/padding
    }
    size: {
      // dvh[dir] = () => cwh[0x3] - cwh[dir] - (ppp[dir][0] + ppp[dir][1]) - ((cxy[0x2] - 1) * gap);
      if (pos) cwh[dir] = vxy[0x3] * ((fff || 1) / vwh[0x2]); // flex size = space * flex/(total flex)
    }
    axis: {
      // poisition: top, right, bottom, left
      for (let [lt, rb, z, xy, wh] of [[left, right, cwh[0x0], 0x0, 0x1], [top, bottom, cwh[0x1], 0x0, 0x1]])
        if (lt !== nil && rb !== nil && z === nil) { // left, right set while width is undefined
          cxy[xy] = (pos ? cxy : vxy)[xy] + lt; // node[x/y] = root[x/y] + l/t;
          cwh[wh] = vxy[wh] - lt - rb; // node[w/h] = root[w/h] - l/t - r/b;
        } else if (lt !== nil) cxy[xy] = (pos ? cxy : vxy)[xy] + lt; // when only l/t, node[x/y] = root/node[x/y] + l/t; dependant on absolute position
          else if (rb !== nil) cxy[xy] = vxy[xy] - rb + (rel ? 0 : vwh[wh] - cwh[wh]); // when only right/bottom; node[x/y] = root[x/y] - r/b + (root[w\h] - node[w\h]) ...
          else if (!pos) cxy[xy] = vxy[xy]; // node[x/y] = root[x/y];
      // algin-self / align-items: start*, end, center, stretch
      if (alignSelf) aa = alignSelf[2]; // by default we assume the aligment of the parents align-items but if there's an align-self we use that
      let [yx, hw] = [[0x1, 0x1], [0x0, 0x0]][ii]; // root orientation
      if (pos) switch (aa) { // not absolute?
          case 'd': cxy[yx] = vwh[hw] - cwh[hw]; break; // end
          case 'n': cxy[yx] = vwh[hw] / 2 - cwh[hw] / 2; break; // center
          case 'r': cxy[yx] = vwh[hw]; break; // stretch
        }
      // justify: start*, end, center, stretch
      let [xy, wh] = [[0x0, 0x0], [0x1, 0x1]][ii]; // root orientation
      if (pos) switch (jj) { // not absolute?
          case 'd': cxy[xy] = vwh[wh] - cwh[wh]; break; // end
          case 'n': cxy[xy] = vwh[wh] / 2 - cwh[wh] / 2; break; // center given that mathematically (1 + 1 + 1)/2 is equivalent to (1/2) + (1/2) + (1/2)
          case 'r': cxy[xy] = vwh[wh]; break; // stretch
        }
    }
    draw: {
      draw(val, cxy.map((v, i) => v + vxy[i]), cwh); // draw here
    }
    exit: {
      cxy[dir] += mmm[rid][1] + ppp[rid][1] + cwh[dir][0]; // move x-axis
      vxy[dir] += cxy[dir]; // // move x-axis
    }
  }
}

/* Swift style vnode creation

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

  for (let constructor of [String, Function])
    defineProperties(constructor.prototype, {
      props: {value: function (p) { this['@@props'] = p; return this; }},
      style: {value: function (s) { this['@@style'] = s; return this; }},
      child: {value: function (...c) { this['@@child'] = c; return this; }},
    });

*/
