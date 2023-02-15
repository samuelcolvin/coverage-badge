// language=xml
export default `
<svg xmlns="http://www.w3.org/2000/svg" width="110" height="20">
  <title>coverage: {cov}</title>
  <defs>
    <linearGradient id="workflow-fill" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop stop-color="#444D56" offset="0%"/>
      <stop stop-color="#24292E" offset="100%"/>
    </linearGradient>
    <linearGradient id="state-fill" x1="50%" y1="0%" x2="50%" y2="100%">
      <stop stop-color="#34D058" offset="0%"/>
      <stop stop-color="#28A745" offset="100%"/>
    </linearGradient>
  </defs>
  <g font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <path d="M0,3 C0,1.3431 1.3552,0 3.02702703,0 L70,0 L70,20 L3.02702703,20 C1.3552,20 0,18.6569 0,17 L0,3 Z" fill="url(#workflow-fill)"/>
    <g transform="scale(.18) translate(0 3)" fill="#fff">
      <path d="M30,36.4c-4.4,6.5,4.4,21,17.6,15.6c13.2-5.5,13.4,5.9,9.8,10.4c-6.4,8.1-4.5,17.3-4.5,17.3s2.5-9.1,12.5-18c13.7-12.3,0.8-31-15.1-23.4c-12.4,5.9-13.3,2-13.4-1.1s5-10.4,5-10.4S34.3,29.9,30,36.4z"/>
      <path d="M39.3,14.8c4.7,4.3,9.8,0.8,11.8,2.9C56,22.4,44.5,34,44.5,34s17.3-5.6,15.2-17.2c-1.3-7.1-7.6-8.1-14.1-6.4c-8.7,2.3-8-5.4-8-5.4S34.4,10.2,39.3,14.8z"/>
      <path d="M48.1,79.9c-7.3-8.6,1.4-20.6,1.4-20.6s-13,3.5-13.7,11.6c-0.7,8.1,3.5,8.8,6.6,13.2c3.1,4.5,1,10.8,1,10.8S53.9,86.8,48.1,79.9z"/>
    </g>
    <text fill="#010101" fill-opacity=".3">
      <tspan x="16" y="15">coverage</tspan>
    </text>
    <text fill="#FFF">
      <tspan x="16" y="14">coverage</tspan>
    </text>
  </g>
  <g transform="translate(70)" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <path d="M0 0h36.939C38.629 0 40 1.343 40 3v14c0 1.657-1.37 3-3.061 3H0V0z" id="state-bg" fill="url(#state-fill)" fill-rule="nonzero"/>
    <text text-anchor="middle" fill="#010101" fill-opacity=".3">
      <tspan x="20" y="15">{cov}</tspan>
    </text>
    <text text-anchor="middle" fill="#FFF">
      <tspan x="20" y="14">{cov}</tspan>
    </text>
  </g>
</svg>
<!-- message: {message} -->
`
