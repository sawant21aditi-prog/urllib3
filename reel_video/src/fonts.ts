import { continueRender, delayRender, staticFile } from "remotion";

const fonts: [string, string, string][] = [
  ["Anton", "fonts/Anton.woff2", "400"],
  ["Montserrat", "fonts/Montserrat-800.woff2", "800"],
  ["Montserrat", "fonts/Montserrat-900.woff2", "900"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(
    fonts.map(([family, file, weight]) => {
      const f = new FontFace(family, `url(${staticFile(file)}) format("woff2")`, { weight });
      document.fonts.add(f);
      return f.load();
    }),
  )
    .then(() => continueRender(handle))
    .catch((e) => {
      console.error(e);
      continueRender(handle);
    });
}
