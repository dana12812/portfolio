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

const SCENE = "<defs><clipPath id=\"fr\"><path d=\"M20 34.0 L24 34.6 L28 35.2 L32 35.8 L36 36.4 L40 36.8 L44 37.2 L48 37.6 L52 37.8 L56 38.0 L60 38.0 L64 38.0 L68 37.8 L72 37.6 L76 37.2 L80 36.8 L84 36.4 L88 35.8 L92 35.2 L96 34.6 L100 34.0 L104 33.4 L108 32.8 L112 32.2 L116 31.6 L120 31.2 L124 30.8 L128 30.4 L132 30.2 L136 30.0 L140 30.0 L144 30.0 L148 30.2 L152 30.4 L156 30.8 L160 31.2 L164 31.6 L168 32.2 L172 32.8 L176 33.4 L180 34.0 L182 156.3 L178 155.7 L174 155.1 L170 154.5 L166 153.9 L162 153.4 L158 153.0 L154 152.6 L150 152.3 L146 152.1 L142 152.0 L138 152.0 L134 152.1 L130 152.3 L126 152.6 L122 153.0 L118 153.4 L114 153.9 L110 154.5 L106 155.1 L102 155.7 L98 156.3 L94 156.9 L90 157.5 L86 158.1 L82 158.6 L78 159.0 L74 159.4 L70 159.7 L66 159.9 L62 160.0 L58 160.0 L54 159.9 L50 159.7 L46 159.4 L42 159.0 L38 158.6 L34 158.1 L30 157.5 L26 156.9 L22 156.3 Z\"/></clipPath><radialGradient id=\"pg2\" cx=\".35\" cy=\".3\" r=\".8\"><stop offset=\"0\" stop-color=\"#fffaf0\"/><stop offset=\".6\" stop-color=\"#f6ecd2\"/><stop offset=\"1\" stop-color=\"#d9c08a\"/></radialGradient></defs><path d=\"M14 26 V192\" stroke-width=\"3.2\"/><circle cx=\"14\" cy=\"22\" r=\"4.5\" fill=\"#e3b84c\" stroke=\"none\"/><path d=\"M6 192 H22\" stroke-width=\"2.4\"/><path d=\"M20 34.0 L24 34.6 L28 35.2 L32 35.8 L36 36.4 L40 36.8 L44 37.2 L48 37.6 L52 37.8 L56 38.0 L60 38.0 L64 38.0 L68 37.8 L72 37.6 L76 37.2 L80 36.8 L84 36.4 L88 35.8 L92 35.2 L96 34.6 L100 34.0 L104 33.4 L108 32.8 L112 32.2 L116 31.6 L120 31.2 L124 30.8 L128 30.4 L132 30.2 L136 30.0 L140 30.0 L144 30.0 L148 30.2 L152 30.4 L156 30.8 L160 31.2 L164 31.6 L168 32.2 L172 32.8 L176 33.4 L180 34.0 L182 156.3 L178 155.7 L174 155.1 L170 154.5 L166 153.9 L162 153.4 L158 153.0 L154 152.6 L150 152.3 L146 152.1 L142 152.0 L138 152.0 L134 152.1 L130 152.3 L126 152.6 L122 153.0 L118 153.4 L114 153.9 L110 154.5 L106 155.1 L102 155.7 L98 156.3 L94 156.9 L90 157.5 L86 158.1 L82 158.6 L78 159.0 L74 159.4 L70 159.7 L66 159.9 L62 160.0 L58 160.0 L54 159.9 L50 159.7 L46 159.4 L42 159.0 L38 158.6 L34 158.1 L30 157.5 L26 156.9 L22 156.3 Z\" stroke-width=\"2.4\"/><path d=\"M20 34.0 L50 37.7 L66 46.2 L50 58.4 L66 70.6 L50 82.8 L66 95.0 L50 107.2 L66 119.4 L50 131.6 L66 143.8 L50 156.0 L20 156.0 Z\" fill=\"#e3b84c\" stroke-width=\"1.2\"/><g clip-path=\"url(#fr)\"><circle cx=\"124\" cy=\"86\" r=\"10\" stroke-width=\"1.3\"/><path d=\"M111.0 86.0 L76.0 86.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M111.2 83.7 L90.5 80.1\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M111.8 81.6 L78.9 69.6\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M112.7 79.5 L94.6 69.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M114.0 77.6 L87.2 55.1\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M115.6 76.0 L102.1 60.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M117.5 74.7 L100.0 44.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M119.6 73.8 L112.4 54.1\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M121.7 73.2 L115.7 38.7\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M124.0 73.0 L124.0 52.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M126.3 73.2 L132.3 38.7\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M128.4 73.8 L135.6 54.1\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M130.5 74.7 L148.0 44.4\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M132.4 76.0 L145.9 60.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M134.0 77.6 L160.8 55.1\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M135.3 79.5 L153.4 69.0\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M136.2 81.6 L169.1 69.6\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M136.8 83.7 L157.5 80.1\" stroke-width=\"0.45\" stroke-opacity=\".75\"/><path d=\"M137.0 86.0 L172.0 86.0\" stroke-width=\"0.7\" stroke-opacity=\".75\"/><path d=\"M84 122 Q83.0 103.0 79.0 84.0\" stroke-width=\"2.0\"/><path d=\"M81.8 117 l4 -1.4\" stroke-width=\".6\"/><path d=\"M81.4 112 l4 -1.4\" stroke-width=\".6\"/><path d=\"M80.9 107 l4 -1.4\" stroke-width=\".6\"/><path d=\"M80.2 102 l4 -1.4\" stroke-width=\".6\"/><path d=\"M79.4 97 l4 -1.4\" stroke-width=\".6\"/><path d=\"M78.6 92 l4 -1.4\" stroke-width=\".6\"/><path d=\"M79.0 84.0 Q70.7 86.8 63.1 82.6\" stroke-width=\"1.1\"/><path d=\"M76.3 84.7 l-4.3 1.1\" stroke-width=\"0.64\"/><path d=\"M76.3 84.7 l-1.9 -4.0\" stroke-width=\"0.64\"/><path d=\"M73.6 85.1 l-3.9 1.0\" stroke-width=\"0.64\"/><path d=\"M73.6 85.1 l-1.7 -3.6\" stroke-width=\"0.64\"/><path d=\"M70.9 85.1 l-3.5 0.9\" stroke-width=\"0.64\"/><path d=\"M70.9 85.1 l-1.5 -3.3\" stroke-width=\"0.64\"/><path d=\"M68.2 84.6 l-3.1 0.8\" stroke-width=\"0.64\"/><path d=\"M68.2 84.6 l-1.4 -2.9\" stroke-width=\"0.64\"/><path d=\"M65.6 83.8 l-2.7 0.7\" stroke-width=\"0.64\"/><path d=\"M65.6 83.8 l-1.2 -2.5\" stroke-width=\"0.64\"/><path d=\"M79.0 84.0 Q70.6 81.6 66.7 73.7\" stroke-width=\"1.1\"/><path d=\"M76.3 83.0 l-4.1 -1.5\" stroke-width=\"0.64\"/><path d=\"M76.3 83.0 l0.8 -4.3\" stroke-width=\"0.64\"/><path d=\"M73.9 81.8 l-3.8 -1.4\" stroke-width=\"0.64\"/><path d=\"M73.9 81.8 l0.7 -3.9\" stroke-width=\"0.64\"/><path d=\"M71.7 80.2 l-3.4 -1.2\" stroke-width=\"0.64\"/><path d=\"M71.7 80.2 l0.6 -3.5\" stroke-width=\"0.64\"/><path d=\"M69.8 78.3 l-3.0 -1.1\" stroke-width=\"0.64\"/><path d=\"M69.8 78.3 l0.6 -3.2\" stroke-width=\"0.64\"/><path d=\"M68.2 76.2 l-2.6 -1.0\" stroke-width=\"0.64\"/><path d=\"M68.2 76.2 l0.5 -2.8\" stroke-width=\"0.64\"/><path d=\"M79.0 84.0 Q73.0 77.7 73.5 69.0\" stroke-width=\"1.1\"/><path d=\"M77.2 81.8 l-2.8 -3.4\" stroke-width=\"0.64\"/><path d=\"M77.2 81.8 l2.8 -3.4\" stroke-width=\"0.64\"/><path d=\"M75.7 79.5 l-2.6 -3.1\" stroke-width=\"0.64\"/><path d=\"M75.7 79.5 l2.6 -3.1\" stroke-width=\"0.64\"/><path d=\"M74.6 77.1 l-2.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M74.6 77.1 l2.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M73.9 74.5 l-2.1 -2.5\" stroke-width=\"0.64\"/><path d=\"M73.9 74.5 l2.1 -2.5\" stroke-width=\"0.64\"/><path d=\"M73.5 71.8 l-1.8 -2.1\" stroke-width=\"0.64\"/><path d=\"M73.5 71.8 l1.8 -2.1\" stroke-width=\"0.64\"/><path d=\"M79.0 84.0 Q78.4 75.3 84.5 69.0\" stroke-width=\"1.1\"/><path d=\"M79.0 81.2 l0.0 -4.4\" stroke-width=\"0.64\"/><path d=\"M79.0 81.2 l4.3 -0.8\" stroke-width=\"0.64\"/><path d=\"M79.4 78.5 l0.0 -4.0\" stroke-width=\"0.64\"/><path d=\"M79.4 78.5 l3.9 -0.7\" stroke-width=\"0.64\"/><path d=\"M80.1 75.9 l0.0 -3.6\" stroke-width=\"0.64\"/><path d=\"M80.1 75.9 l3.5 -0.6\" stroke-width=\"0.64\"/><path d=\"M81.2 73.4 l0.0 -3.2\" stroke-width=\"0.64\"/><path d=\"M81.2 73.4 l3.2 -0.6\" stroke-width=\"0.64\"/><path d=\"M82.6 71.1 l0.0 -2.8\" stroke-width=\"0.64\"/><path d=\"M82.6 71.1 l2.8 -0.5\" stroke-width=\"0.64\"/><path d=\"M79.0 84.0 Q82.9 76.2 91.3 73.7\" stroke-width=\"1.1\"/><path d=\"M80.4 81.5 l2.2 -3.8\" stroke-width=\"0.64\"/><path d=\"M80.4 81.5 l4.1 1.5\" stroke-width=\"0.64\"/><path d=\"M82.1 79.4 l2.0 -3.5\" stroke-width=\"0.64\"/><path d=\"M82.1 79.4 l3.8 1.4\" stroke-width=\"0.64\"/><path d=\"M84.0 77.5 l1.8 -3.1\" stroke-width=\"0.64\"/><path d=\"M84.0 77.5 l3.4 1.2\" stroke-width=\"0.64\"/><path d=\"M86.2 75.9 l1.6 -2.8\" stroke-width=\"0.64\"/><path d=\"M86.2 75.9 l3.0 1.1\" stroke-width=\"0.64\"/><path d=\"M88.6 74.7 l1.4 -2.4\" stroke-width=\"0.64\"/><path d=\"M88.6 74.7 l2.6 1.0\" stroke-width=\"0.64\"/><path d=\"M79.0 84.0 Q86.7 79.8 94.9 82.6\" stroke-width=\"1.1\"/><path d=\"M81.6 82.8 l4.0 -1.9\" stroke-width=\"0.64\"/><path d=\"M81.6 82.8 l2.5 3.6\" stroke-width=\"0.64\"/><path d=\"M84.2 82.0 l3.6 -1.7\" stroke-width=\"0.64\"/><path d=\"M84.2 82.0 l2.3 3.3\" stroke-width=\"0.64\"/><path d=\"M86.8 81.5 l3.3 -1.5\" stroke-width=\"0.64\"/><path d=\"M86.8 81.5 l2.1 2.9\" stroke-width=\"0.64\"/><path d=\"M89.5 81.5 l2.9 -1.4\" stroke-width=\"0.64\"/><path d=\"M89.5 81.5 l1.8 2.6\" stroke-width=\"0.64\"/><path d=\"M92.2 81.9 l2.5 -1.2\" stroke-width=\"0.64\"/><path d=\"M92.2 81.9 l1.6 2.3\" stroke-width=\"0.64\"/><path d=\"M79.0 84.0 Q75.5 76.0 79.0 68.0\" stroke-width=\"1.1\"/><path d=\"M78.0 81.3 l-1.5 -4.1\" stroke-width=\"0.64\"/><path d=\"M78.0 81.3 l3.8 -2.2\" stroke-width=\"0.64\"/><path d=\"M77.4 78.7 l-1.4 -3.8\" stroke-width=\"0.64\"/><path d=\"M77.4 78.7 l3.5 -2.0\" stroke-width=\"0.64\"/><path d=\"M77.2 76.0 l-1.2 -3.4\" stroke-width=\"0.64\"/><path d=\"M77.2 76.0 l3.1 -1.8\" stroke-width=\"0.64\"/><path d=\"M77.4 73.3 l-1.1 -3.0\" stroke-width=\"0.64\"/><path d=\"M77.4 73.3 l2.8 -1.6\" stroke-width=\"0.64\"/><path d=\"M78.0 70.7 l-1.0 -2.6\" stroke-width=\"0.64\"/><path d=\"M78.0 70.7 l2.4 -1.4\" stroke-width=\"0.64\"/><path d=\"M97 122 Q97.8 108.0 101.0 94.0\" stroke-width=\"1.7\"/><path d=\"M95.3 117 l4 -1.4\" stroke-width=\".6\"/><path d=\"M95.8 112 l4 -1.4\" stroke-width=\".6\"/><path d=\"M96.5 107 l4 -1.4\" stroke-width=\".6\"/><path d=\"M97.3 102 l4 -1.4\" stroke-width=\".6\"/><path d=\"M101.0 94.0 Q94.0 96.4 87.5 92.8\" stroke-width=\"1.1\"/><path d=\"M98.7 94.6 l-3.6 1.0\" stroke-width=\"0.64\"/><path d=\"M98.7 94.6 l-1.6 -3.4\" stroke-width=\"0.64\"/><path d=\"M96.4 94.9 l-3.3 0.9\" stroke-width=\"0.64\"/><path d=\"M96.4 94.9 l-1.4 -3.1\" stroke-width=\"0.64\"/><path d=\"M94.1 94.9 l-3.0 0.8\" stroke-width=\"0.64\"/><path d=\"M94.1 94.9 l-1.3 -2.8\" stroke-width=\"0.64\"/><path d=\"M91.9 94.5 l-2.6 0.7\" stroke-width=\"0.64\"/><path d=\"M91.9 94.5 l-1.1 -2.5\" stroke-width=\"0.64\"/><path d=\"M89.6 93.8 l-2.3 0.6\" stroke-width=\"0.64\"/><path d=\"M89.6 93.8 l-1.0 -2.2\" stroke-width=\"0.64\"/><path d=\"M101.0 94.0 Q93.9 91.9 90.6 85.3\" stroke-width=\"1.1\"/><path d=\"M98.7 93.2 l-3.5 -1.3\" stroke-width=\"0.64\"/><path d=\"M98.7 93.2 l0.6 -3.7\" stroke-width=\"0.64\"/><path d=\"M96.7 92.1 l-3.2 -1.2\" stroke-width=\"0.64\"/><path d=\"M96.7 92.1 l0.6 -3.3\" stroke-width=\"0.64\"/><path d=\"M94.8 90.8 l-2.9 -1.0\" stroke-width=\"0.64\"/><path d=\"M94.8 90.8 l0.5 -3.0\" stroke-width=\"0.64\"/><path d=\"M93.2 89.2 l-2.6 -0.9\" stroke-width=\"0.64\"/><path d=\"M93.2 89.2 l0.5 -2.7\" stroke-width=\"0.64\"/><path d=\"M91.8 87.4 l-2.2 -0.8\" stroke-width=\"0.64\"/><path d=\"M91.8 87.4 l0.4 -2.3\" stroke-width=\"0.64\"/><path d=\"M101.0 94.0 Q95.9 88.6 96.3 81.2\" stroke-width=\"1.1\"/><path d=\"M99.4 92.2 l-2.4 -2.9\" stroke-width=\"0.64\"/><path d=\"M99.4 92.2 l2.4 -2.9\" stroke-width=\"0.64\"/><path d=\"M98.2 90.2 l-2.2 -2.6\" stroke-width=\"0.64\"/><path d=\"M98.2 90.2 l2.2 -2.6\" stroke-width=\"0.64\"/><path d=\"M97.3 88.1 l-2.0 -2.3\" stroke-width=\"0.64\"/><path d=\"M97.3 88.1 l2.0 -2.3\" stroke-width=\"0.64\"/><path d=\"M96.6 85.9 l-1.7 -2.1\" stroke-width=\"0.64\"/><path d=\"M96.6 85.9 l1.7 -2.1\" stroke-width=\"0.64\"/><path d=\"M96.3 83.6 l-1.5 -1.8\" stroke-width=\"0.64\"/><path d=\"M96.3 83.6 l1.5 -1.8\" stroke-width=\"0.64\"/><path d=\"M101.0 94.0 Q100.5 86.6 105.7 81.2\" stroke-width=\"1.1\"/><path d=\"M101.0 91.6 l0.0 -3.7\" stroke-width=\"0.64\"/><path d=\"M101.0 91.6 l3.7 -0.6\" stroke-width=\"0.64\"/><path d=\"M101.3 89.3 l0.0 -3.4\" stroke-width=\"0.64\"/><path d=\"M101.3 89.3 l3.3 -0.6\" stroke-width=\"0.64\"/><path d=\"M101.9 87.1 l0.0 -3.1\" stroke-width=\"0.64\"/><path d=\"M101.9 87.1 l3.0 -0.5\" stroke-width=\"0.64\"/><path d=\"M102.9 85.0 l0.0 -2.7\" stroke-width=\"0.64\"/><path d=\"M102.9 85.0 l2.7 -0.5\" stroke-width=\"0.64\"/><path d=\"M104.1 83.1 l0.0 -2.4\" stroke-width=\"0.64\"/><path d=\"M104.1 83.1 l2.3 -0.4\" stroke-width=\"0.64\"/><path d=\"M101.0 94.0 Q104.3 87.3 111.4 85.3\" stroke-width=\"1.1\"/><path d=\"M102.2 91.9 l1.9 -3.2\" stroke-width=\"0.64\"/><path d=\"M102.2 91.9 l3.5 1.3\" stroke-width=\"0.64\"/><path d=\"M103.6 90.1 l1.7 -2.9\" stroke-width=\"0.64\"/><path d=\"M103.6 90.1 l3.2 1.2\" stroke-width=\"0.64\"/><path d=\"M105.2 88.5 l1.5 -2.7\" stroke-width=\"0.64\"/><path d=\"M105.2 88.5 l2.9 1.0\" stroke-width=\"0.64\"/><path d=\"M107.1 87.2 l1.4 -2.4\" stroke-width=\"0.64\"/><path d=\"M107.1 87.2 l2.6 0.9\" stroke-width=\"0.64\"/><path d=\"M109.1 86.1 l1.2 -2.1\" stroke-width=\"0.64\"/><path d=\"M109.1 86.1 l2.2 0.8\" stroke-width=\"0.64\"/><path d=\"M101.0 94.0 Q107.5 90.4 114.5 92.8\" stroke-width=\"1.1\"/><path d=\"M103.2 93.0 l3.4 -1.6\" stroke-width=\"0.64\"/><path d=\"M103.2 93.0 l2.1 3.1\" stroke-width=\"0.64\"/><path d=\"M105.4 92.3 l3.1 -1.4\" stroke-width=\"0.64\"/><path d=\"M105.4 92.3 l2.0 2.8\" stroke-width=\"0.64\"/><path d=\"M107.6 91.9 l2.8 -1.3\" stroke-width=\"0.64\"/><path d=\"M107.6 91.9 l1.8 2.5\" stroke-width=\"0.64\"/><path d=\"M109.9 91.9 l2.5 -1.1\" stroke-width=\"0.64\"/><path d=\"M109.9 91.9 l1.6 2.2\" stroke-width=\"0.64\"/><path d=\"M112.2 92.2 l2.2 -1.0\" stroke-width=\"0.64\"/><path d=\"M112.2 92.2 l1.4 1.9\" stroke-width=\"0.64\"/><path d=\"M101.0 94.0 Q98.0 87.2 101.0 80.4\" stroke-width=\"1.1\"/><path d=\"M100.2 91.7 l-1.3 -3.5\" stroke-width=\"0.64\"/><path d=\"M100.2 91.7 l3.2 -1.9\" stroke-width=\"0.64\"/><path d=\"M99.7 89.5 l-1.2 -3.2\" stroke-width=\"0.64\"/><path d=\"M99.7 89.5 l2.9 -1.7\" stroke-width=\"0.64\"/><path d=\"M99.5 87.2 l-1.0 -2.9\" stroke-width=\"0.64\"/><path d=\"M99.5 87.2 l2.7 -1.5\" stroke-width=\"0.64\"/><path d=\"M99.7 84.9 l-0.9 -2.6\" stroke-width=\"0.64\"/><path d=\"M99.7 84.9 l2.4 -1.4\" stroke-width=\"0.64\"/><path d=\"M100.2 82.7 l-0.8 -2.2\" stroke-width=\"0.64\"/><path d=\"M100.2 82.7 l2.1 -1.2\" stroke-width=\"0.64\"/><path d=\"M134 120 C142 126 166 126 176 116 L172 114 C162 120 144 120 138 117 Z\" fill=\"#b81b2f\" stroke-width=\"1.5\"/><path d=\"M155 119 V74\" stroke-width=\"1.5\"/><path d=\"M137 88 L178 66\" stroke-width=\"1.1\"/><path d=\"M140 87 C145 100 152 110 154 116 L154 80 Z\" fill=\"#b81b2f\" stroke-width=\"1.3\"/><path d=\"M158 78 C166 90 172 102 174 112 L158 112 Z\" fill=\"#b81b2f\" stroke-width=\"1.3\"/><path d=\"M66 122 H184\" stroke-width=\"1.3\"/><path d=\"M60 127 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.90\" stroke-opacity=\".85\"/><path d=\"M66 132 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.83\" stroke-opacity=\".85\"/><path d=\"M60 137 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.76\" stroke-opacity=\".85\"/><path d=\"M66 142 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.69\" stroke-opacity=\".85\"/><path d=\"M60 147 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.62\" stroke-opacity=\".85\"/><path d=\"M66 152 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.55\" stroke-opacity=\".85\"/><path d=\"M60 157 q6 -2.5 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0\" stroke-width=\"0.48\" stroke-opacity=\".85\"/><path d=\"M104 144 C110 134 138 134 144 144 C134 141 114 141 104 144 Z\" fill=\"#b81b2f\" stroke-width=\"1.4\"/><path d=\"M104 144 C112 156 136 156 144 144\" fill=\"#b81b2f\" stroke-width=\"1.4\"/><path d=\"M124 153 L108.0 145\" stroke-width=\".55\"/><path d=\"M124 153 L113.3 145\" stroke-width=\".55\"/><path d=\"M124 153 L118.6 145\" stroke-width=\".55\"/><path d=\"M124 153 L123.9 145\" stroke-width=\".55\"/><path d=\"M124 153 L129.2 145\" stroke-width=\".55\"/><path d=\"M124 153 L134.5 145\" stroke-width=\".55\"/><path d=\"M124 153 L139.8 145\" stroke-width=\".55\"/><circle cx=\"124\" cy=\"140\" r=\"6\" fill=\"url(#pg2)\" stroke=\"#e3b84c\" stroke-width=\"1.1\"/><circle cx=\"122\" cy=\"138\" r=\"1.6\" fill=\"#fff\" stroke=\"none\"/></g>"

function Emblem() {
  // gold Bahraini flag with an engraved scene inside: palms, a dhow, the sea and a pearl
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
