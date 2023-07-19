const measure = function (val, ii, aa, jj, vxy, vwh) {
  let { type, style, children } = val;
  let { top, right, bottom, left, width, height, gap = 0, flex = 0, margin = [0, 0, 0, 0], padding = [0, 0, 0, 0],
    display = 'flex', position = 'r', direction = 'c', justifyContent = 's', alignItems = 's', alignSelf = '', aspectRatio = 1 } = style;
  let align = alignItems[2]; // align-items
  let justify = justifyContent[2]; // justify-content
  let pos = position[0] === 'r'; // position: relative*, absolute, fixed
  let dir = +(!(direction[0] === 'r')); // is row/column
  let rid = +(!dir); // opposite of is row/column
  let sss = dir ? width : height; // size
  let fff = flex < 0 ? 0 : flex; // flex
  let mmm = [[margin[3], margin[1]], [margin[0], margin[2]]; // margin
  let ppp = [[padding[3], padding[1]], padding[0], padding[2]]; // padding
  let ccc = children.flat(); // children
  let cxy = [0, 0, 0, 0]; // x/y/length/space
  let cwh = [0, 0, 0, 0]; // w/h/flex/size
  let dxy = [nil, nil]; // x/y compute fun
  let dwh = [nil, nil]; // w/h compute fun
  let dvh = [nil, nil]; // v/h compute fun
  let xyz = (x, y, w, h) => {
    cxy[dir] += mmm[dir][0] + ppp[dir][0]; // move by margin-x-start/padding-x-start
    cxy[rid] += mmm[rid][0] + ppp[rid][0]; // move by margin-y-start/padding-y-start
    [rid, dir].forEach(a => [dwh, dxy].forEach(b => b[a]()));
    draw(val, cxy.map((v, i) => v + vxy[i]), cwh); // draw here
    cxy[dir] += mmm[rid][1] + ppp[rid][1] + cwh[dir][0]; // move by margin-*-start/padding-*-start
  };
  let ret = [xyz, ccc, cxy, cwh, dxy, dwh, dvh];
  if (display === 'none') return ret; else cwh[0x3] = sss ?? vwh[0x3];
  position: { // poisition: top, right, bottom, left
    for (let [lt, rb, z, xy, wh] of [[left, right, cwh[0x0], 0x0, 0x1], [top, bottom, cwh[0x1], 0x0, 0x1]])
      if (lt !== nil && rb !== nil && z === nil) { // left, right set while width is undefined
        dxy[xy] = () => cxy[xy] = (pos ? cxy : vxy)[xy] + lt; // node[x/y] = root[x/y] + l/t;
        dwh[wh] = () => cwh[wh] = vxy[wh] - lt - rb; // node[w/h] = root[w/h] - l/t - r/b;
      } else if (lt !== nil) dxy[xy] = () => cxy[xy] = (pos ? cxy : vxy)[xy] + lt; // when only l/t, node[x/y] = root/node[x/y] + l/t; dependant on absolute position
        else if (rb !== nil) dxy[xy] = () => cxy[xy] = vxy[xy] - rb + (rel ? 0 : vwh[wh] - cwh[wh]); // when only right/bottom; node[x/y] = root[x/y] - r/b + (root[w\h] - node[w\h]) ...
        else if (!pos) dxy[xy] = () => cxy[xy] = vxy[xy]; // node[x/y] = root[x/y];
  }
  align: { // algin-self / align-items: start*, end, center, stretch
    if (alignSelf) aa = alignSelf[2]; // by default we assume the aligment of the parents align-items but if there's an align-self we use that
    let [yx, hw] = [[0x1, 0x1], [0x0, 0x0]][ii]; // root orientation
    if (pos) switch (aa) { // not absolute?
      case 'd': dxy[yx] = () => cxy[yx] = vwh[hw] - cwh[hw]; break; // end
      case 'n': dxy[yx] = () => cxy[yx] = vwh[hw] / 2 - cwh[hw] / 2; break; // center
      case 'r': dxy[yx] = () => cxy[yx] = vwh[hw]; break; // stretch
    }
  }
  justify: { // justify: start*, end, center, stretch
    if (justify === 'd') children = children.reverse(); // given [a b c <=> ] "end" transforms into [ <=> c b a] reverse to correct order [ <=> a b c] for algorithmic constant time
    let [xy, wh] = [[0x0, 0x0], [0x1, 0x1]][ii]; // root orientation
    if (pos) switch (jj) { // not absolute?
      case 'd': dxy[xy] = () => cxy[xy] = vwh[wh] - cwh[wh]; break; // end
      case 'n': dxy[xy] = () => cxy[xy] = vwh[wh] / 2 - cwh[wh] / 2; break; // center given that mathematically (1 + 1 + 1)/2 is equivalent to (1/2) + (1/2) + (1/2)
      case 'r': dxy[xy] = () => cxy[xy] = vwh[wh]; break; // stretch
    }
  }
  flex: { // contribute to parents size and flex if applicable
    dvh[dir] = () => cwh[0x3] - cwh[dir] - (ppp[dir][0] + ppp[dir][1]) - ((cxy[0x2] - 1) * gap);
    if (pos) { // non-absolute?
      vxy[0x2] += 1; // accumulate length
      vwh[0x2] += fff; // accumulate flex
      dwh[dir] = () => cwh[dir] = vxy[0x3] * ((fff || 1) / vwh[0x2]); // flex size = space * flex/(total flex)
    }
  }
  sizing: {
    vwh[dir] += cwh[dir] + (mmm[dir][0] + mmm[dir][1]); // inline size
    vwh[rid] = max(cwh[rid] + (mmm[rid][0] + mmm[dir][1]), vwh[rid]); // block size
    for (let val of ccc) measure(draw, val, dir, align, justify, cxy, cwh);
  }
  return ret;
}
const layout = function ([xyz, ccc]) {
  xyz(); for (let [xyz] of ccc) xyz();
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
defineProperties(Object.prototype, {
  props: {value: function (p) { this['@@props'] = p; return this; }},
  style: {value: function (s) { this['@@style'] = s; return this; }},
  child: {value: function (...c) { this['@@child'] = c.flat(); return this; }},
});
*/
