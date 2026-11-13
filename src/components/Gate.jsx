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

const SCENE = "<defs><radialGradient id=\"pgX\" cx=\".35\" cy=\".3\" r=\".8\"><stop offset=\"0\" stop-color=\"#fffaf0\"/><stop offset=\".6\" stop-color=\"#f6ecd2\"/><stop offset=\"1\" stop-color=\"#d9c08a\"/></radialGradient></defs><defs><clipPath id=\"c3\"><circle cx=\"100\" cy=\"100\" r=\"70\"/></clipPath></defs><circle cx=\"100\" cy=\"100\" r=\"96\" stroke-width=\"2.2\"/><path d=\"M108.2 22.4 L100.0 9.0 L91.8 22.4 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M124.1 25.8 L118.9 11.0 L108.2 22.4 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M139.0 32.5 L137.0 16.9 L124.1 25.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M152.2 42.0 L153.5 26.4 L139.0 32.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M163.1 54.2 L167.6 39.1 L152.2 42.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M171.3 68.3 L178.8 54.5 L163.1 54.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M176.3 83.8 L186.5 71.9 L171.3 68.3 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M178.0 100.0 L190.5 90.5 L176.3 83.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M176.3 116.2 L190.5 109.5 L178.0 100.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M171.3 131.7 L186.5 128.1 L176.3 116.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M163.1 145.8 L178.8 145.5 L171.3 131.7 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M152.2 158.0 L167.6 160.9 L163.1 145.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M139.0 167.5 L153.5 173.6 L152.2 158.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M124.1 174.2 L137.0 183.1 L139.0 167.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M108.2 177.6 L118.9 189.0 L124.1 174.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M91.8 177.6 L100.0 191.0 L108.2 177.6 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M75.9 174.2 L81.1 189.0 L91.8 177.6 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M61.0 167.5 L63.0 183.1 L75.9 174.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M47.8 158.0 L46.5 173.6 L61.0 167.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M36.9 145.8 L32.4 160.9 L47.8 158.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M28.7 131.7 L21.2 145.5 L36.9 145.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M23.7 116.2 L13.5 128.1 L28.7 131.7 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M22.0 100.0 L9.5 109.5 L23.7 116.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M23.7 83.8 L9.5 90.5 L22.0 100.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M28.7 68.3 L13.5 71.9 L23.7 83.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M36.9 54.2 L21.2 54.5 L28.7 68.3 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M47.8 42.0 L32.4 39.1 L36.9 54.2 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M61.0 32.5 L46.5 26.4 L47.8 42.0 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M75.9 25.8 L63.0 16.9 L61.0 32.5 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><path d=\"M91.8 22.4 L81.1 11.0 L75.9 25.8 Z\" fill=\"#e3b84c\" fill-opacity=\".85\" stroke=\"none\"/><circle cx=\"100\" cy=\"100\" r=\"74\" stroke-width=\"2\"/><circle cx=\"100\" cy=\"100\" r=\"70.5\" stroke-width=\".7\"/><g clip-path=\"url(#c3)\"><circle cx=\"112\" cy=\"92\" r=\"10\" stroke-width=\"1.3\"/><path d=\"M99.0 92.0 L56.0 92.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M99.2 89.7 L72.6 85.1\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M99.8 87.6 L59.4 72.8\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M100.7 85.5 L77.4 72.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M102.0 83.6 L69.1 56.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M103.6 82.0 L86.3 61.4\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M105.5 80.7 L84.0 43.5\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M107.6 79.8 L98.3 54.4\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M109.7 79.2 L102.3 36.9\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M112.0 79.0 L112.0 52.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M114.3 79.2 L121.7 36.9\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M116.4 79.8 L125.7 54.4\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M118.5 80.7 L140.0 43.5\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M120.4 82.0 L137.7 61.4\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M122.0 83.6 L154.9 56.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M123.3 85.5 L146.6 72.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M124.2 87.6 L164.6 72.8\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M124.8 89.7 L151.4 85.1\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M125.0 92.0 L168.0 92.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M64 128 Q63.0 107.0 59.0 86.0\" stroke-width=\"2.0\"/><path d=\"M61.8 123 l4 -1.4\" stroke-width=\".6\"/><path d=\"M61.5 118 l4 -1.4\" stroke-width=\".6\"/><path d=\"M61.0 113 l4 -1.4\" stroke-width=\".6\"/><path d=\"M60.5 108 l4 -1.4\" stroke-width=\".6\"/><path d=\"M59.8 103 l4 -1.4\" stroke-width=\".6\"/><path d=\"M59.1 98 l4 -1.4\" stroke-width=\".6\"/><path d=\"M58.3 93 l4 -1.4\" stroke-width=\".6\"/><path d=\"M59.0 86.0 Q50.7 88.8 43.1 84.6\" stroke-width=\"1.1\"/><path d=\"M56.3 86.7 l-4.3 1.1\" stroke-width=\"0.64\"/><path d=\"M56.3 86.7 l-1.9 -4.0\" stroke-width=\"0.64\"/><path d=\"M53.6 87.1 l-3.9 1.0\" stroke-width=\"0.64\"/><path d=\"M53.6 87.1 l-1.7 -3.6\" stroke-width=\"0.64\"/><path d=\"M50.9 87.1 l-3.5 0.9\" stroke-width=\"0.64\"/><path d=\"M50.9 87.1 l-1.5 -3.3\" stroke-width=\"0.64\"/><path d=\"M48.2 86.6 l-3.1 0.8\" stroke-width=\"0.64\"/><path d=\"M48.2 86.6 l-1.4 -2.9\" stroke-width=\"0.64\"/><path d=\"M45.6 85.8 l-2.7 0.7\" stroke-width=\"0.64\"/><path d=\"M45.6 85.8 l-1.2 -2.5\" stroke-width=\"0.64\"/><path d=\"M59.0 86.0 Q50.6 83.6 46.7 75.7\" stroke-width=\"1.1\"/><path d=\"M56.3 85.0 l-4.1 -1.5\" stroke-width=\"0.64\"/><path d=\"M56.3 85.0 l0.8 -4.3\" stroke-width=\"0.64\"/><path d=\"M53.9 83.8 l-3.8 -1.4\" stroke-width=\"0.64\"/><path d=\"M53.9 83.8 l0.7 -3.9\" stroke-width=\"0.64\"/><path d=\"M51.7 82.2 l-3.4 -1.2\" stroke-width=\"0.64\"/><path d=\"M51.7 82.2 l0.6 -3.5\" stroke-width=\"0.64\"/><path d=\"M49.8 80.3 l-3.0 -1.1\" stroke-width=\"0.64\"/><path d=\"M49.8 80.3 l0.6 -3.2\" stroke-width=\"0.64\"/><path d=\"M48.2 78.2 l-2.6 -1.0\" stroke-width=\"0.64\"/><path d=\"M48.2 78.2 l0.5 -2.8\" stroke-width=\"0.64\"/><path d=\"M59.0 86.0 Q53.0 79.7 53.5 71.0\" stroke-width=\"1.1\"/><path d=\"M57.2 83.8 l-2.8 -3.4\" stroke-width=\"0.64\"/><path d=\"M57.2 83.8 l2.8 -3.4\" stroke-width=\"0.64\"/><path d=\"M55.7 81.5 l-2.6 -3.1\" stroke-width=\"0.64\"/><path d=\"M55.7 81.5 l2.6 -3.1\" stroke-width=\"0.64\"/><path d=\"M54.6 79.1 l-2.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M54.6 79.1 l2.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M53.9 76.5 l-2.1 -2.5\" stroke-width=\"0.64\"/><path d=\"M53.9 76.5 l2.1 -2.5\" stroke-width=\"0.64\"/><path d=\"M53.5 73.8 l-1.8 -2.1\" stroke-width=\"0.64\"/><path d=\"M53.5 73.8 l1.8 -2.1\" stroke-width=\"0.64\"/><path d=\"M59.0 86.0 Q58.4 77.3 64.5 71.0\" stroke-width=\"1.1\"/><path d=\"M59.0 83.2 l0.0 -4.4\" stroke-width=\"0.64\"/><path d=\"M59.0 83.2 l4.3 -0.8\" stroke-width=\"0.64\"/><path d=\"M59.4 80.5 l0.0 -4.0\" stroke-width=\"0.64\"/><path d=\"M59.4 80.5 l3.9 -0.7\" stroke-width=\"0.64\"/><path d=\"M60.1 77.9 l0.0 -3.6\" stroke-width=\"0.64\"/><path d=\"M60.1 77.9 l3.5 -0.6\" stroke-width=\"0.64\"/><path d=\"M61.2 75.4 l0.0 -3.2\" stroke-width=\"0.64\"/><path d=\"M61.2 75.4 l3.2 -0.6\" stroke-width=\"0.64\"/><path d=\"M62.6 73.1 l0.0 -2.8\" stroke-width=\"0.64\"/><path d=\"M62.6 73.1 l2.8 -0.5\" stroke-width=\"0.64\"/><path d=\"M59.0 86.0 Q62.9 78.2 71.3 75.7\" stroke-width=\"1.1\"/><path d=\"M60.4 83.5 l2.2 -3.8\" stroke-width=\"0.64\"/><path d=\"M60.4 83.5 l4.1 1.5\" stroke-width=\"0.64\"/><path d=\"M62.1 81.4 l2.0 -3.5\" stroke-width=\"0.64\"/><path d=\"M62.1 81.4 l3.8 1.4\" stroke-width=\"0.64\"/><path d=\"M64.0 79.5 l1.8 -3.1\" stroke-width=\"0.64\"/><path d=\"M64.0 79.5 l3.4 1.2\" stroke-width=\"0.64\"/><path d=\"M66.2 77.9 l1.6 -2.8\" stroke-width=\"0.64\"/><path d=\"M66.2 77.9 l3.0 1.1\" stroke-width=\"0.64\"/><path d=\"M68.6 76.7 l1.4 -2.4\" stroke-width=\"0.64\"/><path d=\"M68.6 76.7 l2.6 1.0\" stroke-width=\"0.64\"/><path d=\"M59.0 86.0 Q66.7 81.8 74.9 84.6\" stroke-width=\"1.1\"/><path d=\"M61.6 84.8 l4.0 -1.9\" stroke-width=\"0.64\"/><path d=\"M61.6 84.8 l2.5 3.6\" stroke-width=\"0.64\"/><path d=\"M64.2 84.0 l3.6 -1.7\" stroke-width=\"0.64\"/><path d=\"M64.2 84.0 l2.3 3.3\" stroke-width=\"0.64\"/><path d=\"M66.8 83.5 l3.3 -1.5\" stroke-width=\"0.64\"/><path d=\"M66.8 83.5 l2.1 2.9\" stroke-width=\"0.64\"/><path d=\"M69.5 83.5 l2.9 -1.4\" stroke-width=\"0.64\"/><path d=\"M69.5 83.5 l1.8 2.6\" stroke-width=\"0.64\"/><path d=\"M72.2 83.9 l2.5 -1.2\" stroke-width=\"0.64\"/><path d=\"M72.2 83.9 l1.6 2.3\" stroke-width=\"0.64\"/><path d=\"M59.0 86.0 Q55.5 78.0 59.0 70.0\" stroke-width=\"1.1\"/><path d=\"M58.0 83.3 l-1.5 -4.1\" stroke-width=\"0.64\"/><path d=\"M58.0 83.3 l3.8 -2.2\" stroke-width=\"0.64\"/><path d=\"M57.4 80.7 l-1.4 -3.8\" stroke-width=\"0.64\"/><path d=\"M57.4 80.7 l3.5 -2.0\" stroke-width=\"0.64\"/><path d=\"M57.2 78.0 l-1.2 -3.4\" stroke-width=\"0.64\"/><path d=\"M57.2 78.0 l3.1 -1.8\" stroke-width=\"0.64\"/><path d=\"M57.4 75.3 l-1.1 -3.0\" stroke-width=\"0.64\"/><path d=\"M57.4 75.3 l2.8 -1.6\" stroke-width=\"0.64\"/><path d=\"M58.0 72.7 l-1.0 -2.6\" stroke-width=\"0.64\"/><path d=\"M58.0 72.7 l2.4 -1.4\" stroke-width=\"0.64\"/><path d=\"M79 128 Q79.8 112.5 83.0 97.0\" stroke-width=\"1.7\"/><path d=\"M77.2 123 l4 -1.4\" stroke-width=\".6\"/><path d=\"M77.7 118 l4 -1.4\" stroke-width=\".6\"/><path d=\"M78.3 113 l4 -1.4\" stroke-width=\".6\"/><path d=\"M79.0 108 l4 -1.4\" stroke-width=\".6\"/><path d=\"M79.8 103 l4 -1.4\" stroke-width=\".6\"/><path d=\"M83.0 97.0 Q76.0 99.4 69.5 95.8\" stroke-width=\"1.1\"/><path d=\"M80.7 97.6 l-3.6 1.0\" stroke-width=\"0.64\"/><path d=\"M80.7 97.6 l-1.6 -3.4\" stroke-width=\"0.64\"/><path d=\"M78.4 97.9 l-3.3 0.9\" stroke-width=\"0.64\"/><path d=\"M78.4 97.9 l-1.4 -3.1\" stroke-width=\"0.64\"/><path d=\"M76.1 97.9 l-3.0 0.8\" stroke-width=\"0.64\"/><path d=\"M76.1 97.9 l-1.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M73.9 97.5 l-2.6 0.7\" stroke-width=\"0.64\"/><path d=\"M73.9 97.5 l-1.1 -2.5\" stroke-width=\"0.64\"/><path d=\"M71.6 96.8 l-2.3 0.6\" stroke-width=\"0.64\"/><path d=\"M71.6 96.8 l-1.0 -2.2\" stroke-width=\"0.64\"/><path d=\"M83.0 97.0 Q75.9 94.9 72.6 88.3\" stroke-width=\"1.1\"/><path d=\"M80.7 96.2 l-3.5 -1.3\" stroke-width=\"0.64\"/><path d=\"M80.7 96.2 l0.6 -3.7\" stroke-width=\"0.64\"/><path d=\"M78.7 95.1 l-3.2 -1.2\" stroke-width=\"0.64\"/><path d=\"M78.7 95.1 l0.6 -3.3\" stroke-width=\"0.64\"/><path d=\"M76.8 93.8 l-2.9 -1.0\" stroke-width=\"0.64\"/><path d=\"M76.8 93.8 l0.5 -3.0\" stroke-width=\"0.64\"/><path d=\"M75.2 92.2 l-2.6 -0.9\" stroke-width=\"0.64\"/><path d=\"M75.2 92.2 l0.5 -2.7\" stroke-width=\"0.64\"/><path d=\"M73.8 90.4 l-2.2 -0.8\" stroke-width=\"0.64\"/><path d=\"M73.8 90.4 l0.4 -2.3\" stroke-width=\"0.64\"/><path d=\"M83.0 97.0 Q77.9 91.6 78.3 84.2\" stroke-width=\"1.1\"/><path d=\"M81.4 95.2 l-2.4 -2.9\" stroke-width=\"0.64\"/><path d=\"M81.4 95.2 l2.4 -2.9\" stroke-width=\"0.64\"/><path d=\"M80.2 93.2 l-2.2 -2.6\" stroke-width=\"0.64\"/><path d=\"M80.2 93.2 l2.2 -2.6\" stroke-width=\"0.64\"/><path d=\"M79.3 91.1 l-2.0 -2.3\" stroke-width=\"0.64\"/><path d=\"M79.3 91.1 l2.0 -2.3\" stroke-width=\"0.64\"/><path d=\"M78.6 88.9 l-1.7 -2.1\" stroke-width=\"0.64\"/><path d=\"M78.6 88.9 l1.7 -2.1\" stroke-width=\"0.64\"/><path d=\"M78.3 86.6 l-1.5 -1.8\" stroke-width=\"0.64\"/><path d=\"M78.3 86.6 l1.5 -1.8\" stroke-width=\"0.64\"/><path d=\"M83.0 97.0 Q82.5 89.6 87.7 84.2\" stroke-width=\"1.1\"/><path d=\"M83.0 94.6 l0.0 -3.7\" stroke-width=\"0.64\"/><path d=\"M83.0 94.6 l3.7 -0.6\" stroke-width=\"0.64\"/><path d=\"M83.3 92.3 l0.0 -3.4\" stroke-width=\"0.64\"/><path d=\"M83.3 92.3 l3.3 -0.6\" stroke-width=\"0.64\"/><path d=\"M83.9 90.1 l0.0 -3.1\" stroke-width=\"0.64\"/><path d=\"M83.9 90.1 l3.0 -0.5\" stroke-width=\"0.64\"/><path d=\"M84.9 88.0 l0.0 -2.7\" stroke-width=\"0.64\"/><path d=\"M84.9 88.0 l2.7 -0.5\" stroke-width=\"0.64\"/><path d=\"M86.1 86.1 l0.0 -2.4\" stroke-width=\"0.64\"/><path d=\"M86.1 86.1 l2.3 -0.4\" stroke-width=\"0.64\"/><path d=\"M83.0 97.0 Q86.3 90.3 93.4 88.3\" stroke-width=\"1.1\"/><path d=\"M84.2 94.9 l1.9 -3.2\" stroke-width=\"0.64\"/><path d=\"M84.2 94.9 l3.5 1.3\" stroke-width=\"0.64\"/><path d=\"M85.6 93.1 l1.7 -2.9\" stroke-width=\"0.64\"/><path d=\"M85.6 93.1 l3.2 1.2\" stroke-width=\"0.64\"/><path d=\"M87.2 91.5 l1.5 -2.7\" stroke-width=\"0.64\"/><path d=\"M87.2 91.5 l2.9 1.0\" stroke-width=\"0.64\"/><path d=\"M89.1 90.2 l1.4 -2.4\" stroke-width=\"0.64\"/><path d=\"M89.1 90.2 l2.6 0.9\" stroke-width=\"0.64\"/><path d=\"M91.1 89.1 l1.2 -2.1\" stroke-width=\"0.64\"/><path d=\"M91.1 89.1 l2.2 0.8\" stroke-width=\"0.64\"/><path d=\"M83.0 97.0 Q89.5 93.4 96.5 95.8\" stroke-width=\"1.1\"/><path d=\"M85.2 96.0 l3.4 -1.6\" stroke-width=\"0.64\"/><path d=\"M85.2 96.0 l2.1 3.1\" stroke-width=\"0.64\"/><path d=\"M87.4 95.3 l3.1 -1.4\" stroke-width=\"0.64\"/><path d=\"M87.4 95.3 l2.0 2.8\" stroke-width=\"0.64\"/><path d=\"M89.6 94.9 l2.8 -1.3\" stroke-width=\"0.64\"/><path d=\"M89.6 94.9 l1.8 2.5\" stroke-width=\"0.64\"/><path d=\"M91.9 94.9 l2.5 -1.1\" stroke-width=\"0.64\"/><path d=\"M91.9 94.9 l1.6 2.2\" stroke-width=\"0.64\"/><path d=\"M94.2 95.2 l2.2 -1.0\" stroke-width=\"0.64\"/><path d=\"M94.2 95.2 l1.4 1.9\" stroke-width=\"0.64\"/><path d=\"M83.0 97.0 Q80.0 90.2 83.0 83.4\" stroke-width=\"1.1\"/><path d=\"M82.2 94.7 l-1.3 -3.5\" stroke-width=\"0.64\"/><path d=\"M82.2 94.7 l3.2 -1.9\" stroke-width=\"0.64\"/><path d=\"M81.7 92.5 l-1.2 -3.2\" stroke-width=\"0.64\"/><path d=\"M81.7 92.5 l2.9 -1.7\" stroke-width=\"0.64\"/><path d=\"M81.5 90.2 l-1.0 -2.9\" stroke-width=\"0.64\"/><path d=\"M81.5 90.2 l2.7 -1.5\" stroke-width=\"0.64\"/><path d=\"M81.7 87.9 l-0.9 -2.6\" stroke-width=\"0.64\"/><path d=\"M81.7 87.9 l2.4 -1.4\" stroke-width=\"0.64\"/><path d=\"M82.2 85.7 l-0.8 -2.2\" stroke-width=\"0.64\"/><path d=\"M82.2 85.7 l2.1 -1.2\" stroke-width=\"0.64\"/><path d=\"M118 126 C126 132 152 132 162 122 L158 120 C148 126 128 126 122 123 Z\" fill=\"#b81b2f\" stroke-width=\"1.5\"/><path d=\"M140 125 V78\" stroke-width=\"1.5\"/><path d=\"M121 93 L164 70\" stroke-width=\"1.1\"/><path d=\"M124 92 C129 105 136 116 138 122 L138 85 Z\" fill=\"#b81b2f\" stroke-width=\"1.3\"/><path d=\"M142 83 C151 95 157 108 159 118 L142 118 Z\" fill=\"#b81b2f\" stroke-width=\"1.3\"/><path d=\"M20 128 H180\" stroke-width=\"1.3\"/><path d=\"M10 133 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.90\" stroke-opacity=\".85\"/><path d=\"M16 138 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.85\" stroke-opacity=\".85\"/><path d=\"M10 143 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.80\" stroke-opacity=\".85\"/><path d=\"M16 148 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.75\" stroke-opacity=\".85\"/><path d=\"M10 153 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.70\" stroke-opacity=\".85\"/><path d=\"M16 158 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.65\" stroke-opacity=\".85\"/><path d=\"M10 163 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.60\" stroke-opacity=\".85\"/><path d=\"M16 168 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.55\" stroke-opacity=\".85\"/><path d=\"M10 173 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.50\" stroke-opacity=\".85\"/><path d=\"M16 178 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.45\" stroke-opacity=\".85\"/><path d=\"M10 183 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.40\" stroke-opacity=\".85\"/><path d=\"M86 156 C92 146 120 146 126 156 C116 153 96 153 86 156 Z\" fill=\"#b81b2f\" stroke-width=\"1.4\"/><path d=\"M86 156 C94 168 118 168 126 156\" fill=\"#b81b2f\" stroke-width=\"1.4\"/><path d=\"M106 165 L90.0 157\" stroke-width=\".55\"/><path d=\"M106 165 L95.3 157\" stroke-width=\".55\"/><path d=\"M106 165 L100.6 157\" stroke-width=\".55\"/><path d=\"M106 165 L105.9 157\" stroke-width=\".55\"/><path d=\"M106 165 L111.2 157\" stroke-width=\".55\"/><path d=\"M106 165 L116.5 157\" stroke-width=\".55\"/><path d=\"M106 165 L121.8 157\" stroke-width=\".55\"/><circle cx=\"106\" cy=\"152\" r=\"6.5\" fill=\"url(#pgX)\" stroke=\"#e3b84c\" stroke-width=\"1.1\"/><circle cx=\"104\" cy=\"150\" r=\"1.7\" fill=\"#fff\" stroke=\"none\"/></g>"

function Emblem() {
  // round medallion: the flag's points around an engraved scene of palms, a dhow, the sea and a pearl
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
