import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { me } from '../data.js'

/* Stage layouts, in stage units. Everything is scaled to fit the screen. */
const LAYOUTS = {
  wide: { W: 1060, H: 560, book: [20, 100], scanner: [640, 30] },
  tall: { W: 560, H: 1000, book: [20, 30], scanner: [90, 470] },
}
const PAGE_W = 260
const PAGE_H = 360
const GLASS = [40, 30, 300, 380] // x, y, w, h inside the scanner

const today = () =>
  new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Bahrain' })
    .format(new Date())
    .toUpperCase()

const SCENE = "<defs><clipPath id=\"cl\"><circle cx=\"100\" cy=\"100\" r=\"70\"/></clipPath><radialGradient id=\"pg\" cx=\".35\" cy=\".3\" r=\".8\"><stop offset=\"0\" stop-color=\"#fffaf0\"/><stop offset=\".6\" stop-color=\"#f6ecd2\"/><stop offset=\"1\" stop-color=\"#d9c08a\"/></radialGradient></defs><circle cx=\"100\" cy=\"100\" r=\"96\" stroke-width=\"2.2\"/><circle cx=\"100\" cy=\"100\" r=\"92\" stroke-width=\".7\"/><path d=\"M100.0 9.0 L108.2 22.4 L118.9 11.0 L124.1 25.8 L137.0 16.9 L139.0 32.5 L153.5 26.4 L152.2 42.0 L167.6 39.1 L163.1 54.2 L178.8 54.5 L171.3 68.3 L186.5 71.9 L176.3 83.8 L190.5 90.5 L178.0 100.0 L190.5 109.5 L176.3 116.2 L186.5 128.1 L171.3 131.7 L178.8 145.5 L163.1 145.8 L167.6 160.9 L152.2 158.0 L153.5 173.6 L139.0 167.5 L137.0 183.1 L124.1 174.2 L118.9 189.0 L108.2 177.6 L100.0 191.0 L91.8 177.6 L81.1 189.0 L75.9 174.2 L63.0 183.1 L61.0 167.5 L46.5 173.6 L47.8 158.0 L32.4 160.9 L36.9 145.8 L21.2 145.5 L28.7 131.7 L13.5 128.1 L23.7 116.2 L9.5 109.5 L22.0 100.0 L9.5 90.5 L23.7 83.8 L13.5 71.9 L28.7 68.3 L21.2 54.5 L36.9 54.2 L32.4 39.1 L47.8 42.0 L46.5 26.4 L61.0 32.5 L63.0 16.9 L75.9 25.8 L81.1 11.0 L91.8 22.4 Z\" stroke-width=\"1.3\"/><path d=\"M108.2 22.4 L100.0 10.0 L91.8 22.4 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M124.1 25.8 L118.7 12.0 L108.2 22.4 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M139.0 32.5 L136.6 17.8 L124.1 25.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M152.2 42.0 L152.9 27.2 L139.0 32.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M163.1 54.2 L166.9 39.8 L152.2 42.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M171.3 68.3 L177.9 55.0 L163.1 54.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M176.3 83.8 L185.6 72.2 L171.3 68.3 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M178.0 100.0 L189.5 90.6 L176.3 83.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M176.3 116.2 L189.5 109.4 L178.0 100.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M171.3 131.7 L185.6 127.8 L176.3 116.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M163.1 145.8 L177.9 145.0 L171.3 131.7 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M152.2 158.0 L166.9 160.2 L163.1 145.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M139.0 167.5 L152.9 172.8 L152.2 158.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M124.1 174.2 L136.6 182.2 L139.0 167.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M108.2 177.6 L118.7 188.0 L124.1 174.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M91.8 177.6 L100.0 190.0 L108.2 177.6 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M75.9 174.2 L81.3 188.0 L91.8 177.6 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M61.0 167.5 L63.4 182.2 L75.9 174.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M47.8 158.0 L47.1 172.8 L61.0 167.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M36.9 145.8 L33.1 160.2 L47.8 158.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M28.7 131.7 L22.1 145.0 L36.9 145.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M23.7 116.2 L14.4 127.8 L28.7 131.7 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M22.0 100.0 L10.5 109.4 L23.7 116.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M23.7 83.8 L10.5 90.6 L22.0 100.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M28.7 68.3 L14.4 72.2 L23.7 83.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M36.9 54.2 L22.1 55.0 L28.7 68.3 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M47.8 42.0 L33.1 39.8 L36.9 54.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M61.0 32.5 L47.1 27.2 L47.8 42.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M75.9 25.8 L63.4 17.8 L61.0 32.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M91.8 22.4 L81.3 12.0 L75.9 25.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><circle cx=\"100\" cy=\"100\" r=\"74\" stroke-width=\"2\"/><circle cx=\"100\" cy=\"100\" r=\"70.5\" stroke-width=\".7\"/><g clip-path=\"url(#cl)\"><circle cx=\"100\" cy=\"74\" r=\"13\" stroke-width=\"1.4\"/><path d=\"M84.0 74.0 L30.0 74.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M84.2 71.5 L50.6 66.2\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M84.8 69.1 L33.4 52.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M85.7 66.7 L55.4 51.3\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M87.1 64.6 L43.4 32.9\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M88.7 62.7 L64.6 38.6\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M90.6 61.1 L58.9 17.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M92.7 59.7 L77.3 29.4\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M95.1 58.8 L78.4 7.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M97.5 58.2 L92.2 24.6\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M100.0 58.0 L100.0 4.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M102.5 58.2 L107.8 24.6\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M104.9 58.8 L121.6 7.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M107.3 59.7 L122.7 29.4\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M109.4 61.1 L141.1 17.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M111.3 62.7 L135.4 38.6\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M112.9 64.6 L156.6 32.9\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M114.3 66.7 L144.6 51.3\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M115.2 69.1 L166.6 52.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M115.8 71.5 L149.4 66.2\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M116.0 74.0 L170.0 74.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M92 132 L93.0 44 C86 60 78 96 78 132 Z\" fill=\"#b81b2f\" stroke-width=\"1.8\"/><path d=\"M90.5 52 L90.7 52\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 58 L89.8 58\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 64 L88.8 64\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 70 L87.9 70\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 76 L86.9 76\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 82 L86.0 82\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 88 L85.0 88\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 94 L84.0 94\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 100 L83.1 100\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 106 L82.1 106\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 112 L81.2 112\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 118 L80.2 118\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 124 L79.3 124\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M90.5 130 L78.3 130\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M108 132 L107.0 44 C114 60 122 96 122 132 Z\" fill=\"#b81b2f\" stroke-width=\"1.8\"/><path d=\"M109.5 52 L109.3 52\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 58 L110.2 58\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 64 L111.2 64\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 70 L112.1 70\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 76 L113.1 76\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 82 L114.0 82\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 88 L115.0 88\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 94 L116.0 94\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 100 L116.9 100\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 106 L117.9 106\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 112 L118.8 112\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 118 L119.8 118\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 124 L120.7 124\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M109.5 130 L121.7 130\" stroke-width=\".55\" stroke-opacity=\".8\"/><path d=\"M92 70 H108\" stroke-width=\"1.6\"/><circle cx=\"100\" cy=\"70\" r=\"5\" stroke-width=\"1\"/><path d=\"M100 65 V75 M95.7 67.5 L104.3 72.5 M95.7 72.5 L104.3 67.5\" stroke-width=\".7\"/><path d=\"M92 90 H108\" stroke-width=\"1.6\"/><circle cx=\"100\" cy=\"90\" r=\"5\" stroke-width=\"1\"/><path d=\"M100 85 V95 M95.7 87.5 L104.3 92.5 M95.7 92.5 L104.3 87.5\" stroke-width=\".7\"/><path d=\"M92 110 H108\" stroke-width=\"1.6\"/><circle cx=\"100\" cy=\"110\" r=\"5\" stroke-width=\"1\"/><path d=\"M100 105 V115 M95.7 107.5 L104.3 112.5 M95.7 112.5 L104.3 107.5\" stroke-width=\".7\"/><path d=\"M48 134 Q46.8 114.0 42.0 94.0\" stroke-width=\"2.2\"/><path d=\"M45.7 128.0 l4.0 -1.5\" stroke-width=\".7\"/><path d=\"M45.1 122.0 l4.0 -1.5\" stroke-width=\".7\"/><path d=\"M44.3 116.0 l4.0 -1.5\" stroke-width=\".7\"/><path d=\"M43.4 110.0 l4.0 -1.5\" stroke-width=\".7\"/><path d=\"M42.2 104.0 l4.0 -1.5\" stroke-width=\".7\"/><path d=\"M42.0 94.0 Q32.7 97.2 24.1 92.4\" stroke-width=\"1.1\"/><path d=\"M38.9 94.8 l-4.8 1.3\" stroke-width=\"0.64\"/><path d=\"M38.9 94.8 l-2.1 -4.5\" stroke-width=\"0.64\"/><path d=\"M35.9 95.2 l-4.3 1.2\" stroke-width=\"0.64\"/><path d=\"M35.9 95.2 l-1.9 -4.1\" stroke-width=\"0.64\"/><path d=\"M32.9 95.2 l-3.9 1.0\" stroke-width=\"0.64\"/><path d=\"M32.9 95.2 l-1.7 -3.7\" stroke-width=\"0.64\"/><path d=\"M29.9 94.7 l-3.5 0.9\" stroke-width=\"0.64\"/><path d=\"M29.9 94.7 l-1.5 -3.3\" stroke-width=\"0.64\"/><path d=\"M27.0 93.8 l-3.0 0.8\" stroke-width=\"0.64\"/><path d=\"M27.0 93.8 l-1.3 -2.9\" stroke-width=\"0.64\"/><path d=\"M42.0 94.0 Q32.4 92.1 27.3 83.7\" stroke-width=\"1.1\"/><path d=\"M38.9 93.2 l-4.8 -1.3\" stroke-width=\"0.64\"/><path d=\"M38.9 93.2 l0.4 -4.9\" stroke-width=\"0.64\"/><path d=\"M36.1 92.0 l-4.3 -1.2\" stroke-width=\"0.64\"/><path d=\"M36.1 92.0 l0.4 -4.5\" stroke-width=\"0.64\"/><path d=\"M33.5 90.5 l-3.9 -1.0\" stroke-width=\"0.64\"/><path d=\"M33.5 90.5 l0.4 -4.0\" stroke-width=\"0.64\"/><path d=\"M31.2 88.6 l-3.5 -0.9\" stroke-width=\"0.64\"/><path d=\"M31.2 88.6 l0.3 -3.6\" stroke-width=\"0.64\"/><path d=\"M29.1 86.3 l-3.0 -0.8\" stroke-width=\"0.64\"/><path d=\"M29.1 86.3 l0.3 -3.1\" stroke-width=\"0.64\"/><path d=\"M42.0 94.0 Q34.6 87.5 34.4 77.7\" stroke-width=\"1.1\"/><path d=\"M39.7 91.7 l-3.5 -3.5\" stroke-width=\"0.64\"/><path d=\"M39.7 91.7 l2.8 -4.1\" stroke-width=\"0.64\"/><path d=\"M37.9 89.3 l-3.2 -3.2\" stroke-width=\"0.64\"/><path d=\"M37.9 89.3 l2.6 -3.7\" stroke-width=\"0.64\"/><path d=\"M36.4 86.7 l-2.9 -2.9\" stroke-width=\"0.64\"/><path d=\"M36.4 86.7 l2.3 -3.3\" stroke-width=\"0.64\"/><path d=\"M35.3 83.9 l-2.5 -2.5\" stroke-width=\"0.64\"/><path d=\"M35.3 83.9 l2.1 -2.9\" stroke-width=\"0.64\"/><path d=\"M34.7 80.9 l-2.2 -2.2\" stroke-width=\"0.64\"/><path d=\"M34.7 80.9 l1.8 -2.6\" stroke-width=\"0.64\"/><path d=\"M42.0 94.0 Q42.2 84.2 49.6 77.7\" stroke-width=\"1.1\"/><path d=\"M42.3 90.8 l0.4 -4.9\" stroke-width=\"0.64\"/><path d=\"M42.3 90.8 l4.9 -0.4\" stroke-width=\"0.64\"/><path d=\"M42.9 87.8 l0.4 -4.5\" stroke-width=\"0.64\"/><path d=\"M42.9 87.8 l4.5 -0.4\" stroke-width=\"0.64\"/><path d=\"M44.0 85.0 l0.4 -4.0\" stroke-width=\"0.64\"/><path d=\"M44.0 85.0 l4.0 -0.4\" stroke-width=\"0.64\"/><path d=\"M45.5 82.4 l0.3 -3.6\" stroke-width=\"0.64\"/><path d=\"M45.5 82.4 l3.6 -0.3\" stroke-width=\"0.64\"/><path d=\"M47.3 79.9 l0.3 -3.1\" stroke-width=\"0.64\"/><path d=\"M47.3 79.9 l3.1 -0.3\" stroke-width=\"0.64\"/><path d=\"M42.0 94.0 Q47.1 85.6 56.7 83.7\" stroke-width=\"1.1\"/><path d=\"M43.8 91.4 l2.8 -4.1\" stroke-width=\"0.64\"/><path d=\"M43.8 91.4 l4.5 2.1\" stroke-width=\"0.64\"/><path d=\"M45.9 89.1 l2.6 -3.7\" stroke-width=\"0.64\"/><path d=\"M45.9 89.1 l4.1 1.9\" stroke-width=\"0.64\"/><path d=\"M48.2 87.2 l2.3 -3.3\" stroke-width=\"0.64\"/><path d=\"M48.2 87.2 l3.7 1.7\" stroke-width=\"0.64\"/><path d=\"M50.8 85.7 l2.1 -2.9\" stroke-width=\"0.64\"/><path d=\"M50.8 85.7 l3.3 1.5\" stroke-width=\"0.64\"/><path d=\"M53.7 84.5 l1.8 -2.6\" stroke-width=\"0.64\"/><path d=\"M53.7 84.5 l2.9 1.3\" stroke-width=\"0.64\"/><path d=\"M42.0 94.0 Q50.6 89.3 59.9 92.4\" stroke-width=\"1.1\"/><path d=\"M44.9 92.6 l4.5 -2.1\" stroke-width=\"0.64\"/><path d=\"M44.9 92.6 l2.8 4.1\" stroke-width=\"0.64\"/><path d=\"M47.8 91.7 l4.1 -1.9\" stroke-width=\"0.64\"/><path d=\"M47.8 91.7 l2.6 3.7\" stroke-width=\"0.64\"/><path d=\"M50.8 91.2 l3.7 -1.7\" stroke-width=\"0.64\"/><path d=\"M50.8 91.2 l2.3 3.3\" stroke-width=\"0.64\"/><path d=\"M53.8 91.2 l3.3 -1.5\" stroke-width=\"0.64\"/><path d=\"M53.8 91.2 l2.1 2.9\" stroke-width=\"0.64\"/><path d=\"M56.8 91.6 l2.9 -1.3\" stroke-width=\"0.64\"/><path d=\"M56.8 91.6 l1.8 2.6\" stroke-width=\"0.64\"/><path d=\"M42.0 94.0 Q38.0 85.0 42.0 76.0\" stroke-width=\"1.1\"/><path d=\"M40.9 91.0 l-1.7 -4.7\" stroke-width=\"0.64\"/><path d=\"M40.9 91.0 l4.3 -2.5\" stroke-width=\"0.64\"/><path d=\"M40.2 88.0 l-1.5 -4.2\" stroke-width=\"0.64\"/><path d=\"M40.2 88.0 l3.9 -2.2\" stroke-width=\"0.64\"/><path d=\"M40.0 85.0 l-1.4 -3.8\" stroke-width=\"0.64\"/><path d=\"M40.0 85.0 l3.5 -2.0\" stroke-width=\"0.64\"/><path d=\"M40.2 82.0 l-1.2 -3.4\" stroke-width=\"0.64\"/><path d=\"M40.2 82.0 l3.1 -1.8\" stroke-width=\"0.64\"/><path d=\"M40.9 79.0 l-1.1 -3.0\" stroke-width=\"0.64\"/><path d=\"M40.9 79.0 l2.7 -1.6\" stroke-width=\"0.64\"/><circle cx=\"40.0\" cy=\"97.0\" r=\"1.4\" fill=\"#e3b84c\" stroke=\"none\"/><circle cx=\"44.0\" cy=\"97.5\" r=\"1.4\" fill=\"#e3b84c\" stroke=\"none\"/><path d=\"M62 134 Q62.8 119.0 66.0 104.0\" stroke-width=\"1.9\"/><path d=\"M60.6 128.0 l3.4 -1.5\" stroke-width=\".7\"/><path d=\"M61.2 122.0 l3.4 -1.5\" stroke-width=\".7\"/><path d=\"M62.1 116.0 l3.4 -1.5\" stroke-width=\".7\"/><path d=\"M63.1 110.0 l3.4 -1.5\" stroke-width=\".7\"/><path d=\"M66.0 104.0 Q58.1 106.7 50.8 102.7\" stroke-width=\"1.1\"/><path d=\"M63.4 104.7 l-4.1 1.1\" stroke-width=\"0.64\"/><path d=\"M63.4 104.7 l-1.8 -3.8\" stroke-width=\"0.64\"/><path d=\"M60.8 105.0 l-3.7 1.0\" stroke-width=\"0.64\"/><path d=\"M60.8 105.0 l-1.6 -3.5\" stroke-width=\"0.64\"/><path d=\"M58.2 105.0 l-3.3 0.9\" stroke-width=\"0.64\"/><path d=\"M58.2 105.0 l-1.5 -3.1\" stroke-width=\"0.64\"/><path d=\"M55.7 104.6 l-3.0 0.8\" stroke-width=\"0.64\"/><path d=\"M55.7 104.6 l-1.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M53.2 103.8 l-2.6 0.7\" stroke-width=\"0.64\"/><path d=\"M53.2 103.8 l-1.1 -2.4\" stroke-width=\"0.64\"/><path d=\"M66.0 104.0 Q57.8 102.4 53.5 95.2\" stroke-width=\"1.1\"/><path d=\"M63.4 103.3 l-4.1 -1.1\" stroke-width=\"0.64\"/><path d=\"M63.4 103.3 l0.4 -4.2\" stroke-width=\"0.64\"/><path d=\"M61.0 102.3 l-3.7 -1.0\" stroke-width=\"0.64\"/><path d=\"M61.0 102.3 l0.3 -3.8\" stroke-width=\"0.64\"/><path d=\"M58.8 101.0 l-3.3 -0.9\" stroke-width=\"0.64\"/><path d=\"M58.8 101.0 l0.3 -3.4\" stroke-width=\"0.64\"/><path d=\"M56.8 99.4 l-3.0 -0.8\" stroke-width=\"0.64\"/><path d=\"M56.8 99.4 l0.3 -3.0\" stroke-width=\"0.64\"/><path d=\"M55.0 97.5 l-2.6 -0.7\" stroke-width=\"0.64\"/><path d=\"M55.0 97.5 l0.2 -2.7\" stroke-width=\"0.64\"/><path d=\"M66.0 104.0 Q59.7 98.5 59.5 90.1\" stroke-width=\"1.1\"/><path d=\"M64.1 102.1 l-3.0 -3.0\" stroke-width=\"0.64\"/><path d=\"M64.1 102.1 l2.4 -3.4\" stroke-width=\"0.64\"/><path d=\"M62.5 100.0 l-2.7 -2.7\" stroke-width=\"0.64\"/><path d=\"M62.5 100.0 l2.2 -3.1\" stroke-width=\"0.64\"/><path d=\"M61.2 97.8 l-2.4 -2.4\" stroke-width=\"0.64\"/><path d=\"M61.2 97.8 l2.0 -2.8\" stroke-width=\"0.64\"/><path d=\"M60.3 95.4 l-2.2 -2.2\" stroke-width=\"0.64\"/><path d=\"M60.3 95.4 l1.8 -2.5\" stroke-width=\"0.64\"/><path d=\"M59.8 92.8 l-1.9 -1.9\" stroke-width=\"0.64\"/><path d=\"M59.8 92.8 l1.5 -2.2\" stroke-width=\"0.64\"/><path d=\"M66.0 104.0 Q66.2 95.6 72.5 90.1\" stroke-width=\"1.1\"/><path d=\"M66.2 101.3 l0.4 -4.2\" stroke-width=\"0.64\"/><path d=\"M66.2 101.3 l4.2 -0.4\" stroke-width=\"0.64\"/><path d=\"M66.8 98.7 l0.3 -3.8\" stroke-width=\"0.64\"/><path d=\"M66.8 98.7 l3.8 -0.3\" stroke-width=\"0.64\"/><path d=\"M67.7 96.4 l0.3 -3.4\" stroke-width=\"0.64\"/><path d=\"M67.7 96.4 l3.4 -0.3\" stroke-width=\"0.64\"/><path d=\"M69.0 94.1 l0.3 -3.0\" stroke-width=\"0.64\"/><path d=\"M69.0 94.1 l3.0 -0.3\" stroke-width=\"0.64\"/><path d=\"M70.5 92.0 l0.2 -2.7\" stroke-width=\"0.64\"/><path d=\"M70.5 92.0 l2.7 -0.2\" stroke-width=\"0.64\"/><path d=\"M66.0 104.0 Q70.3 96.9 78.5 95.2\" stroke-width=\"1.1\"/><path d=\"M67.6 101.8 l2.4 -3.4\" stroke-width=\"0.64\"/><path d=\"M67.6 101.8 l3.8 1.8\" stroke-width=\"0.64\"/><path d=\"M69.3 99.8 l2.2 -3.1\" stroke-width=\"0.64\"/><path d=\"M69.3 99.8 l3.5 1.6\" stroke-width=\"0.64\"/><path d=\"M71.3 98.2 l2.0 -2.8\" stroke-width=\"0.64\"/><path d=\"M71.3 98.2 l3.1 1.5\" stroke-width=\"0.64\"/><path d=\"M73.5 96.9 l1.8 -2.5\" stroke-width=\"0.64\"/><path d=\"M73.5 96.9 l2.8 1.3\" stroke-width=\"0.64\"/><path d=\"M75.9 95.9 l1.5 -2.2\" stroke-width=\"0.64\"/><path d=\"M75.9 95.9 l2.4 1.1\" stroke-width=\"0.64\"/><path d=\"M66.0 104.0 Q73.3 100.0 81.2 102.7\" stroke-width=\"1.1\"/><path d=\"M68.5 102.8 l3.8 -1.8\" stroke-width=\"0.64\"/><path d=\"M68.5 102.8 l2.4 3.4\" stroke-width=\"0.64\"/><path d=\"M71.0 102.1 l3.5 -1.6\" stroke-width=\"0.64\"/><path d=\"M71.0 102.1 l2.2 3.1\" stroke-width=\"0.64\"/><path d=\"M73.5 101.7 l3.1 -1.5\" stroke-width=\"0.64\"/><path d=\"M73.5 101.7 l2.0 2.8\" stroke-width=\"0.64\"/><path d=\"M76.0 101.6 l2.8 -1.3\" stroke-width=\"0.64\"/><path d=\"M76.0 101.6 l1.8 2.5\" stroke-width=\"0.64\"/><path d=\"M78.6 102.0 l2.4 -1.1\" stroke-width=\"0.64\"/><path d=\"M78.6 102.0 l1.5 2.2\" stroke-width=\"0.64\"/><path d=\"M66.0 104.0 Q62.6 96.3 66.0 88.7\" stroke-width=\"1.1\"/><path d=\"M65.1 101.5 l-1.4 -4.0\" stroke-width=\"0.64\"/><path d=\"M65.1 101.5 l3.6 -2.1\" stroke-width=\"0.64\"/><path d=\"M64.5 98.9 l-1.3 -3.6\" stroke-width=\"0.64\"/><path d=\"M64.5 98.9 l3.3 -1.9\" stroke-width=\"0.64\"/><path d=\"M64.3 96.3 l-1.2 -3.2\" stroke-width=\"0.64\"/><path d=\"M64.3 96.3 l3.0 -1.7\" stroke-width=\"0.64\"/><path d=\"M64.5 93.8 l-1.0 -2.9\" stroke-width=\"0.64\"/><path d=\"M64.5 93.8 l2.7 -1.5\" stroke-width=\"0.64\"/><path d=\"M65.1 91.2 l-0.9 -2.5\" stroke-width=\"0.64\"/><path d=\"M65.1 91.2 l2.3 -1.3\" stroke-width=\"0.64\"/><circle cx=\"64.0\" cy=\"107.0\" r=\"1.4\" fill=\"#e3b84c\" stroke=\"none\"/><circle cx=\"68.0\" cy=\"107.5\" r=\"1.4\" fill=\"#e3b84c\" stroke=\"none\"/><path d=\"M36 136 Q35.4 123.0 33.0 110.0\" stroke-width=\"1.7\"/><path d=\"M34.2 130.0 l3.0 -1.5\" stroke-width=\".7\"/><path d=\"M33.6 124.0 l3.0 -1.5\" stroke-width=\".7\"/><path d=\"M32.8 118.0 l3.0 -1.5\" stroke-width=\".7\"/><path d=\"M33.0 110.0 Q26.0 112.4 19.6 108.8\" stroke-width=\"1.1\"/><path d=\"M30.7 110.6 l-3.6 1.0\" stroke-width=\"0.64\"/><path d=\"M30.7 110.6 l-1.6 -3.4\" stroke-width=\"0.64\"/><path d=\"M28.4 110.9 l-3.3 0.9\" stroke-width=\"0.64\"/><path d=\"M28.4 110.9 l-1.4 -3.1\" stroke-width=\"0.64\"/><path d=\"M26.1 110.9 l-2.9 0.8\" stroke-width=\"0.64\"/><path d=\"M26.1 110.9 l-1.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M23.9 110.5 l-2.6 0.7\" stroke-width=\"0.64\"/><path d=\"M23.9 110.5 l-1.1 -2.4\" stroke-width=\"0.64\"/><path d=\"M21.7 109.8 l-2.3 0.6\" stroke-width=\"0.64\"/><path d=\"M21.7 109.8 l-1.0 -2.1\" stroke-width=\"0.64\"/><path d=\"M33.0 110.0 Q25.8 108.6 21.9 102.3\" stroke-width=\"1.1\"/><path d=\"M30.7 109.4 l-3.6 -1.0\" stroke-width=\"0.64\"/><path d=\"M30.7 109.4 l0.3 -3.7\" stroke-width=\"0.64\"/><path d=\"M28.6 108.5 l-3.3 -0.9\" stroke-width=\"0.64\"/><path d=\"M28.6 108.5 l0.3 -3.4\" stroke-width=\"0.64\"/><path d=\"M26.6 107.3 l-2.9 -0.8\" stroke-width=\"0.64\"/><path d=\"M26.6 107.3 l0.3 -3.0\" stroke-width=\"0.64\"/><path d=\"M24.9 105.9 l-2.6 -0.7\" stroke-width=\"0.64\"/><path d=\"M24.9 105.9 l0.2 -2.7\" stroke-width=\"0.64\"/><path d=\"M23.3 104.2 l-2.3 -0.6\" stroke-width=\"0.64\"/><path d=\"M23.3 104.2 l0.2 -2.4\" stroke-width=\"0.64\"/><path d=\"M33.0 110.0 Q27.5 105.1 27.3 97.8\" stroke-width=\"1.1\"/><path d=\"M31.3 108.3 l-2.6 -2.6\" stroke-width=\"0.64\"/><path d=\"M31.3 108.3 l2.1 -3.0\" stroke-width=\"0.64\"/><path d=\"M29.9 106.5 l-2.4 -2.4\" stroke-width=\"0.64\"/><path d=\"M29.9 106.5 l1.9 -2.8\" stroke-width=\"0.64\"/><path d=\"M28.8 104.5 l-2.1 -2.1\" stroke-width=\"0.64\"/><path d=\"M28.8 104.5 l1.7 -2.5\" stroke-width=\"0.64\"/><path d=\"M28.0 102.4 l-1.9 -1.9\" stroke-width=\"0.64\"/><path d=\"M28.0 102.4 l1.5 -2.2\" stroke-width=\"0.64\"/><path d=\"M27.5 100.2 l-1.7 -1.7\" stroke-width=\"0.64\"/><path d=\"M27.5 100.2 l1.4 -1.9\" stroke-width=\"0.64\"/><path d=\"M33.0 110.0 Q33.2 102.6 38.7 97.8\" stroke-width=\"1.1\"/><path d=\"M33.2 107.6 l0.3 -3.7\" stroke-width=\"0.64\"/><path d=\"M33.2 107.6 l3.7 -0.3\" stroke-width=\"0.64\"/><path d=\"M33.7 105.4 l0.3 -3.4\" stroke-width=\"0.64\"/><path d=\"M33.7 105.4 l3.4 -0.3\" stroke-width=\"0.64\"/><path d=\"M34.5 103.3 l0.3 -3.0\" stroke-width=\"0.64\"/><path d=\"M34.5 103.3 l3.0 -0.3\" stroke-width=\"0.64\"/><path d=\"M35.6 101.3 l0.2 -2.7\" stroke-width=\"0.64\"/><path d=\"M35.6 101.3 l2.7 -0.2\" stroke-width=\"0.64\"/><path d=\"M37.0 99.5 l0.2 -2.4\" stroke-width=\"0.64\"/><path d=\"M37.0 99.5 l2.4 -0.2\" stroke-width=\"0.64\"/><path d=\"M33.0 110.0 Q36.8 103.7 44.1 102.3\" stroke-width=\"1.1\"/><path d=\"M34.4 108.0 l2.1 -3.0\" stroke-width=\"0.64\"/><path d=\"M34.4 108.0 l3.4 1.6\" stroke-width=\"0.64\"/><path d=\"M35.9 106.3 l1.9 -2.8\" stroke-width=\"0.64\"/><path d=\"M35.9 106.3 l3.1 1.4\" stroke-width=\"0.64\"/><path d=\"M37.7 104.9 l1.7 -2.5\" stroke-width=\"0.64\"/><path d=\"M37.7 104.9 l2.8 1.3\" stroke-width=\"0.64\"/><path d=\"M39.6 103.8 l1.5 -2.2\" stroke-width=\"0.64\"/><path d=\"M39.6 103.8 l2.4 1.1\" stroke-width=\"0.64\"/><path d=\"M41.7 102.9 l1.4 -1.9\" stroke-width=\"0.64\"/><path d=\"M41.7 102.9 l2.1 1.0\" stroke-width=\"0.64\"/><path d=\"M33.0 110.0 Q39.5 106.5 46.4 108.8\" stroke-width=\"1.1\"/><path d=\"M35.2 109.0 l3.4 -1.6\" stroke-width=\"0.64\"/><path d=\"M35.2 109.0 l2.1 3.0\" stroke-width=\"0.64\"/><path d=\"M37.4 108.3 l3.1 -1.4\" stroke-width=\"0.64\"/><path d=\"M37.4 108.3 l1.9 2.8\" stroke-width=\"0.64\"/><path d=\"M39.6 107.9 l2.8 -1.3\" stroke-width=\"0.64\"/><path d=\"M39.6 107.9 l1.7 2.5\" stroke-width=\"0.64\"/><path d=\"M41.9 107.9 l2.4 -1.1\" stroke-width=\"0.64\"/><path d=\"M41.9 107.9 l1.5 2.2\" stroke-width=\"0.64\"/><path d=\"M44.1 108.2 l2.1 -1.0\" stroke-width=\"0.64\"/><path d=\"M44.1 108.2 l1.4 1.9\" stroke-width=\"0.64\"/><path d=\"M33.0 110.0 Q30.0 103.2 33.0 96.5\" stroke-width=\"1.1\"/><path d=\"M32.2 107.8 l-1.3 -3.5\" stroke-width=\"0.64\"/><path d=\"M32.2 107.8 l3.2 -1.9\" stroke-width=\"0.64\"/><path d=\"M31.7 105.5 l-1.2 -3.2\" stroke-width=\"0.64\"/><path d=\"M31.7 105.5 l2.9 -1.7\" stroke-width=\"0.64\"/><path d=\"M31.5 103.2 l-1.0 -2.9\" stroke-width=\"0.64\"/><path d=\"M31.5 103.2 l2.6 -1.5\" stroke-width=\"0.64\"/><path d=\"M31.7 101.0 l-0.9 -2.5\" stroke-width=\"0.64\"/><path d=\"M31.7 101.0 l2.3 -1.3\" stroke-width=\"0.64\"/><path d=\"M32.2 98.8 l-0.8 -2.2\" stroke-width=\"0.64\"/><path d=\"M32.2 98.8 l2.0 -1.2\" stroke-width=\"0.64\"/><circle cx=\"31.0\" cy=\"113.0\" r=\"1.4\" fill=\"#e3b84c\" stroke=\"none\"/><circle cx=\"35.0\" cy=\"113.5\" r=\"1.4\" fill=\"#e3b84c\" stroke=\"none\"/><path d=\"M30 134 H72 M30 134 v-6 h4 v3 h4 v-3 h4 v3 h4 v-3 h4 v3 h4 v-3 h4 v3 h4 v-3 h4 v6\" stroke-width=\"1.2\"/><path d=\"M124 132 C132 138 160 138 170 128 L166 126 C156 132 134 132 128 129 Z\" fill=\"#b81b2f\" stroke-width=\"1.6\"/><path d=\"M146 131 V86\" stroke-width=\"1.6\"/><path d=\"M128 100 L170 78\" stroke-width=\"1.2\"/><path d=\"M131 99 C136 112 143 122 145 128 L145 92 Z\" fill=\"#b81b2f\" stroke-width=\"1.4\"/><path d=\"M149 90 C158 102 164 114 166 124 L149 124 Z\" fill=\"#b81b2f\" stroke-width=\"1.4\"/><path d=\"M135.0 104 L145 100\" stroke-width=\".5\"/><path d=\"M137.0 110 L145 106\" stroke-width=\".5\"/><path d=\"M139.0 116 L145 112\" stroke-width=\".5\"/><path d=\"M141.0 122 L145 118\" stroke-width=\".5\"/><path d=\"M149 98 L154 98\" stroke-width=\".5\"/><path d=\"M149 105 L157 105\" stroke-width=\".5\"/><path d=\"M149 112 L160 112\" stroke-width=\".5\"/><path d=\"M149 119 L163 119\" stroke-width=\".5\"/><path d=\"M20 134 H180\" stroke-width=\"1.4\"/><path d=\"M18 139 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.90\" stroke-opacity=\".85\"/><path d=\"M24 144 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.84\" stroke-opacity=\".85\"/><path d=\"M18 149 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.78\" stroke-opacity=\".85\"/><path d=\"M24 154 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.72\" stroke-opacity=\".85\"/><path d=\"M18 159 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.66\" stroke-opacity=\".85\"/><path d=\"M24 164 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.60\" stroke-opacity=\".85\"/><path d=\"M18 169 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.54\" stroke-opacity=\".85\"/><path d=\"M24 174 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.48\" stroke-opacity=\".85\"/></g><path d=\"M78 162 C84 150 116 150 122 162 C110 158 90 158 78 162 Z\" fill=\"#b81b2f\" stroke-width=\"1.6\"/><path d=\"M78 162 C88 178 112 178 122 162\" fill=\"#b81b2f\" stroke-width=\"1.6\"/><path d=\"M100 174 L82 164\" stroke-width=\".6\"/><path d=\"M100 174 L88 164\" stroke-width=\".6\"/><path d=\"M100 174 L94 164\" stroke-width=\".6\"/><path d=\"M100 174 L100 164\" stroke-width=\".6\"/><path d=\"M100 174 L106 164\" stroke-width=\".6\"/><path d=\"M100 174 L112 164\" stroke-width=\".6\"/><path d=\"M100 174 L118 164\" stroke-width=\".6\"/><circle cx=\"100\" cy=\"157\" r=\"7.5\" fill=\"url(#pg)\" stroke=\"#e3b84c\" stroke-width=\"1.3\"/><circle cx=\"97.5\" cy=\"154.5\" r=\"2\" fill=\"#fff\" stroke=\"none\"/>"

function Emblem() {
  // original engraved medallion: Manama skyline with palms, a dhow, the sea and a pearl
  return (
    <svg className="emblem" viewBox="0 0 200 200" fill="none" stroke="#e3b84c" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" dangerouslySetInnerHTML={{ __html: SCENE }} />
  )
}

function Serration({ className }) {
  return (
    <svg className={className} viewBox="0 0 22 360" preserveAspectRatio="none" aria-hidden="true">
      <rect width="22" height="360" fill="#7b1e2c" />
      <path d="M0 0 H8 L20 36 L8 72 L20 108 L8 144 L20 180 L8 216 L20 252 L8 288 L20 324 L8 360 H0 Z" fill="#fbf7ee" />
    </svg>
  )
}

export default function Gate({ onDone }) {
  const [phase, setPhase] = useState('closed') // closed | open | scanning | verified | leaving
  const [layout, setLayout] = useState('wide')
  const [scale, setScale] = useState(1)
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false })
  const [stamped, setStamped] = useState(false)
  const timers = useRef([])
  const date = useRef(today())
  const L = LAYOUTS[layout]
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useLayoutEffect(() => {
    const fit = () => {
      const lay = window.innerWidth < 760 ? 'tall' : 'wide'
      const { W, H } = LAYOUTS[lay]
      setLayout(lay)
      setScale(Math.min(1, (window.innerWidth * 0.94) / W, (window.innerHeight - 200) / H))
    }
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  useEffect(() => {
    document.documentElement.classList.add('gate-lock')
    return () => {
      document.documentElement.classList.remove('gate-lock')
      timers.current.forEach(clearTimeout)
    }
  }, [])

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms))

  // where the book must sit so the photo page lands on the scanner glass
  const target = useCallback(() => {
    const [bx, by] = L.book
    const [sx, sy] = L.scanner
    const photoCx = bx + PAGE_W + PAGE_W / 2
    const photoCy = by + PAGE_H / 2
    const glassCx = sx + GLASS[0] + GLASS[2] / 2
    const glassCy = sy + GLASS[1] + GLASS[3] / 2
    return { x: glassCx - photoCx, y: glassCy - photoCy }
  }, [L])

  const gone = useRef(false)
  const leave = useCallback(() => {
    if (gone.current) return
    gone.current = true
    setPhase('leaving')
    later(onDone, reduce ? 50 : 900)
  }, [onDone, reduce])

  const play = useCallback(() => {
    const T = reduce ? [100, 200, 300, 400, 900] : [900, 2300, 3300, 5200, 7000]
    later(() => setPhase('open'), T[0])
    later(() => setDrag({ ...target(), active: false }), T[1])
    later(() => setPhase('scanning'), T[2])
    later(() => { setPhase('verified'); later(() => setStamped(true), 250) }, T[3])
    later(leave, T[4])
  }, [target, leave, reduce])

  useEffect(() => {
    play()
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [play])

  useEffect(() => {
    const onKey = (e) => (e.key === 'Escape' || e.key === 'Enter') && leave()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [leave])

  const closedShift = phase === 'closed' ? -PAGE_W / 2 : 0
  const lcd = { closed: 'READY', open: 'READY', scanning: 'SCANNING', verified: 'VERIFIED', leaving: 'VERIFIED' }[phase]
  const msg = {
    closed: ['Arriving in Bahrain', 'Gate 01 · Manama'],
    open: ['Presenting passport', 'Photo page to the scanner'],
    scanning: ['Scanning photo page…', 'Please hold still'],
    verified: ['Admitted. Welcome in.', 'أهلاً وسهلاً'],
    leaving: ['Admitted. Welcome in.', 'أهلاً وسهلاً'],
  }[phase]

  return (
    <div className={`gate ${phase}`} role="dialog" aria-modal="true" aria-label="Passport entry">
      <div className="gate-top">
        <span className="logo">{me.first.toLowerCase()}<span>.</span></span>
        <span className="gate-tag">Gate 01 · Manama · بوابة</span>
        <button className="gate-skip" onClick={leave}>Skip intro</button>
      </div>

      <div className="gate-stage-wrap" style={{ width: L.W * scale, height: L.H * scale }}>
        <div className="gate-stage" style={{ width: L.W, height: L.H, transform: `scale(${scale})` }}>
          {/* scanner */}
          <div className={`scanner ${phase}`} style={{ left: L.scanner[0], top: L.scanner[1] }}>
            <div className="scanner-label"><span>PASSPORT SCANNER</span><span>مسح</span></div>
            <div className="glass" style={{ left: GLASS[0], top: GLASS[1], width: GLASS[2], height: GLASS[3] }}>
              <div className="glass-grid" />
              <div className="scan-beam" />
            </div>
            <div className="lcd-row">
              <span className="led" />
              <span className="scanner-lcd">{lcd}</span>
            </div>
          </div>

          <div
            className={`beam-over ${phase}`}
            style={{ left: L.scanner[0] + GLASS[0], top: L.scanner[1] + GLASS[1], width: GLASS[2], height: GLASS[3] }}
            aria-hidden="true"
          >
            <div className="scan-beam" />
          </div>

          {/* passport */}
          <div
            className={`book ${phase} ${drag.active ? 'dragging' : ''}`}
            style={{
              left: L.book[0],
              top: L.book[1],
              transform: `translate(${drag.x + closedShift}px, ${drag.y}px)`,
            }}
          >
            {/* photo page (right) */}
            <div className="ppage photo">
              <Serration className="serr" />
              <div className="ppage-head"><span>PORTFOLIO PASSPORT</span><span className="ar">جواز سفر</span></div>
              <div className="pp-body">
                <div className="pp-photo"><span>{me.initials}</span></div>
                <div className="pp-fields">
                  <div><small>Surname / اللقب</small>AL SALEH</div>
                  <div><small>Given name / الاسم</small>DANA</div>
                  <div><small>Nationality / الجنسية</small>BAHRAINI</div>
                  <div><small>Place of issue</small>MANAMA</div>
                </div>
              </div>
              <div className="pp-wide">
                <div><small>Profession / المهنة</small>Software Engineer · Cyber Threat Analyst</div>
                <div className="pp-two">
                  <div><small>Date of issue</small>{date.current}</div>
                  <div><small>No.</small>DA-{me.idNumber}</div>
                </div>
              </div>
              <div className="pp-sign">Dana</div>
              <div className="mrz">
                <span>PORTFOLIO&lt;&lt;AL&lt;SALEH&lt;&lt;DANA&lt;&lt;&lt;&lt;&lt;&lt;</span>
                <span>SOFTWARE&lt;ENGINEER&lt;&lt;CYBER&lt;ANALYST&lt;&lt;</span>
              </div>
              <div className={`arrival ${stamped ? 'in' : ''}`} aria-hidden="true">
                <svg viewBox="0 0 160 160">
                  <defs>
                    <path id="arcT" d="M17 80 a63 63 0 0 1 126 0" />
                    <path id="arcB" d="M14 80 a66 66 0 0 0 132 0" />
                  </defs>
                  <circle cx="80" cy="80" r="74" fill="none" stroke="currentColor" strokeWidth="4" />
                  <circle cx="80" cy="80" r="54" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <text fontSize="11.5" letterSpacing="1.6" fontWeight="600"><textPath href="#arcT" startOffset="50%" textAnchor="middle">ADMITTED · MANAMA</textPath></text>
                  <text fontSize="11" letterSpacing="2.5"><textPath href="#arcB" startOffset="50%" textAnchor="middle">{date.current}</textPath></text>
                  <text x="80" y="91" textAnchor="middle" className="ar" fontSize="25">أهلاً وسهلاً</text>
                </svg>
              </div>
            </div>

            {/* cover: front is the passport cover, back is the visa page */}
            <div className={`cover ${phase === 'closed' ? '' : 'flipped'}`}>
              <div className="cover-front">
                <span className="ar cover-ar">البحرين</span>
                <span className="cover-name">BAHRAIN</span>
                <Emblem />
                <span className="ar cover-ar2">جواز سفر</span>
                <span className="cover-title">PASSPORT</span>
                <svg className="chip" viewBox="0 0 40 26" aria-hidden="true">
                  <rect x="1.5" y="1.5" width="37" height="23" rx="4" fill="none" stroke="currentColor" strokeWidth="2.4" />
                  <path d="M1.5 9h12M26.5 9h12M1.5 17h12M26.5 17h12" stroke="currentColor" strokeWidth="2.4" />
                  <circle cx="20" cy="13" r="5.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
                </svg>
              </div>
              <div className="cover-back ppage visas">
                <div className="ppage-head"><span>VISAS</span><span className="ar">تأشيرات</span></div>
                <div className="vstamp v1"><b>CTM360</b><span>OSINT · 2025</span></div>
                <div className="vstamp v2 round"><b>GA</b><span>Bootcamp · 2026</span></div>
                <div className="vstamp v3"><b>POLYTECHNIC</b><span>B.Tech · 2027</span></div>
                <div className="vstamp v4 round"><b>NSE</b><span>Fortinet 1–3</span></div>
                <span className="page-no">02</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={`gate-progress ${reduce ? 'fast' : ''}`} aria-hidden="true"><i /></div>
      <div className="gate-msg" aria-live="polite">
        <p className="gate-title">{msg[0]}</p>
        <p className={`gate-hint ${phase === 'verified' || phase === 'leaving' ? 'ar' : ''}`}>{msg[1]}</p>
      </div>
    </div>
  )
}
