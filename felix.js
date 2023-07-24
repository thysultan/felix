
const [ empty ] = [ [0, 0, 0, 0] ];
const { is } = Object;
const { max } = Math;

export function layout(obj, aaa, jjj, vxy, vwh, gpu) {
  const { props: { style }, children, returns: { xxx, cxy, cwh } } = obj;
  const yyy = +(!xxx); // opposite of is row/column
  const ppp = style.padding ?? empty;
  const mmm = style.margin ?? empty;
  const position = +((style.position ?? 'r').charCodeAt(0) === 114); // position: (r)elative*, absolute, fixed
  const self = style.alignSelf?.charCodeAt(2);
  const align = style.alignItems?.charCodeAt(2) ?? 97;
  const justify = style.justifyContent?.charCodeAt(2) ?? 0;
  if (self) aaa = self | 0; // al(i)gn-self, by default we assume the aligment of the parents align-items but if there's an align-self we use that
  if (justify === 100) children = children.reverse(); // justify-content implemntation detail
  // start layout algorithm
  init: {
    cxy[xxx] += mmm[xxx + 0] + ppp[xxx + 0] + vxy[0x4]; // margin-start + padding.start + cursor
    cxy[yyy] += mmm[yyy + 0] + ppp[yyy + 0]; // margin-start + padding.start
  }
  size: {
    cwh[0x3] = cwh[0x3] + (ppp[xxx + 0] + ppp[xxx + 2] + ((cxy[0x2] - 1) * max(0, style.gap ?? 0))); // used space += padding + (n * gap)
    cwh[xxx] = is(cwh[xxx], -0) ? (!position ? cwh[0x3] : (vwh[xxx] - vwh[0x3]) * ((max(0, style.flex | 0) || 1) / vwh[0x2])) : cwh[xxx]; // if implicit sized then size = (total space - used space) * (flex or 1)/(total flex)
    cwh[yyy] = is(cwh[yyy], -0) ? (!position ? cwh[0x4] : (vwh[0x4] || vwh[yyy])) : cwh[yyy];
  }
  position: { // poisition: top, right, bottom, left
    for (let [lt, rb, ww, xy, wh] of [[style.left ?? -0, style.right ?? -0, cwh[0x0], 0x0, 0x1], [style.top ?? -0, style.bottom ?? -0, cwh[0x1], 0x0, 0x1]])
      if (!is(lt, -0) && !is(rb, -0) && is(ww, -0)) { // left, right set while width is undefined
        cxy[xy] = (position ? cxy : vxy)[xy] + lt; // node[x/y] = root[x/y] + l/t;
        cwh[wh] = vwh[wh] - lt - rb; // node[w/h] = root[w/h] - l/t - r/b;
      } else if (lt != null) cxy[xy] = (position ? cxy : vxy)[xy] + lt; // when only l/t, node[x/y] = root/node[x/y] + l/t; dependant on absolute position
        else if (rb != null) cxy[xy] = vxy[xy] - rb + (rel ? 0 : vwh[wh] - cwh[wh]); // when only right/bottom; node[x/y] = root[x/y] - r/b + (root[w\h] - node[w\h]) ...
        else if (!position) cxy[xy] = vxy[xy]; // node[x/y] = root[x/y];
  }
  align: { // algin-self / align-items: start*, end, center, stretch
    let [yx, hw] = [[0x1, 0x1], [0x0, 0x0]][xxx]; // root orientation
    if (position) switch (aaa) { // not absolute?
      case 100: cxy[yx] = vwh[hw] - cwh[hw]; break; // en(d)
      case 110: cxy[yx] = vwh[hw] / 2 - cwh[hw] / 2; break; // ce(n)ter
      case 114: cxy[yx] = vwh[hw]; break; // st(r)etch
    }
  }
  justify: { // justify: start*, end, center, stretch
    let [xy, wh] = [[0x0, 0x0], [0x1, 0x1]][xxx]; // root orientation
    if (position) switch (jjj) { // not absolute?
      case 100: cxy[xy] = vwh[wh] - cwh[wh]; break; // en(d)
      case 110: cxy[xy] = vwh[wh] / 2 - cwh[wh] / 2; break; // ce(n)ter given that mathematically (1 + 1 + 1)/2 is equivalent to (1/2) + (1/2) + (1/2)
      case 114: cxy[xy] = vwh[wh]; break; // st(r)etch
    }
  }
  draw: {
    gpu(obj, [vxy[0] + cxy[0], vxy[1] + cxy[1]], [cwh[0], cwh[1]]); // draw to canvas within the same 2nd pass
  }
  each: {
    for (var idx = 0; idx < children.length; idx++) layout(children[idx], align, justify, cxy, cwh, gpu); // visit all child nodes
  }
  move: {
    cxy[xxx] += mmm[yyy + 2] + ppp[yyy + 2] + cwh[xxx]; // margin.end + padding.end + width
    vxy[0x4] += cxy[xxx]; // move cursor
  }
}

export function measure(obj, ddd, vxy, vwh) {
  const { props: { style }, children } = obj;
  const direction = +(!(style.direction?.charCodeAt(0) === 114)); // direction: (r)ow, column*
  const xxx = ddd; // is row/column
  const yyy = +(!xxx); // opposite of is row/column
  const cxy = [0, 0, 0, 0, 0]; // x/y/length/space/offset
  const cwh = [style.width ?? -0, style.height ?? -0, 0, 0, 0]; // w/h/flex/used/implict
  const mmm = style.margin ?? empty;
  obj.returns = { xxx, cxy, cwh };
  if (style.display?.charCodeAt(0) === 110) return void(cwh[0] = cwh[1] = 0); /// display: (n)one
  if ((style.position ?? 'r').charCodeAt(0) === 114) { vxy[0x2] += 1; vwh[0x2] += max(0, style.flex | 0); } // // position: (r)elative, accumulate length/flex
  for (let idx = 0; idx < children.length; ++idx) measure(children[idx], direction, cxy, cwh); // visit all child nodes
  vwh[0x3] += (is(cwh[xxx], -0) ? cwh[0x3] : cwh[xxx]) + (mmm[xxx + 0] + mmm[xxx + 2]); // implicit inline size
  vwh[0x4] = max(vwh[0x4], (is(cwh[yyy], -0) ? cwh[0x4] : cwh[yyy]) + (mmm[yyy + 0] + mmm[yyy + 2])); // implicit block size
}
