export const curry = (f: Function, ...outer: any[]) => (...inner: any[]) =>
  f.apply(null, outer.concat(inner))

export const compose =
  (f: Function, ...g: Function[]) =>
  (x?: any): any =>
    !g.length ? f(x) : compose(g[0], ...g.slice(1))(f(x))
